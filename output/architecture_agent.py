#!/usr/bin/env python3
"""Architecture improvement agent — OpenHands Software Agent SDK.

Analyses a local repository read-only, detects architectural problems with
evidence, and writes an evidence-backed refactoring plan.

Usage:
    python architecture_agent.py <repo-path> [--out DIR] [--focus LIST] [--max-rounds N]

Environment:
    LLM_API_KEY      required provider key
    LLM_BASE_MODEL   default: openhands/claude-sonnet-4-5-20250929
    LLM_BASE_URL     optional custom base URL

Design: deterministic heuristics live in pure functions (unit-tested); the LLM
phases only interpret and write prose. Nothing writes to the target repo.
"""

from __future__ import annotations

import argparse
import logging
import os
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

OPENHANDS_SUPPRESS_BANNER = os.environ.setdefault("OPENHANDS_SUPPRESS_BANNER", "1")

DEFAULT_MODEL = "openhands/claude-sonnet-4-5-20250929"
DEFAULT_OUT_DIRNAME = "architecture-review"

# --- thresholds (documented, not magic) -------------------------------------
MAX_FILE_LOC = 400
MAX_FILE_LINES = 3000
DUPLICATE_MIN_LINES = 8
FAN_IN_THRESHOLD = 6
FAN_OUT_THRESHOLD = 6

SOURCE_EXTS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"}
IGNORED_DIRS = {
    ".git", "node_modules", "dist", "build", "out", "coverage", ".venv",
    "venv", "__pycache__", ".next", ".turbo", ".cache", "temp", "vendor",
}

log = logging.getLogger("architecture-agent")

CATEGORY_LABELS = {
    "oversized-module": "Oversized module",
    "coupling": "High coupling",
    "cycle": "Import cycle",
    "duplication": "Duplicated logic",
}


class ConfigError(Exception):
    """Raised when CLI/environment configuration is invalid."""


# --- configuration -----------------------------------------------------------


@dataclass(frozen=True)
class Config:
    repo_path: str
    out_dir: str
    model: str
    base_url: str | None
    api_key: str
    focus: tuple[str, ...] = ()
    max_rounds: int = 1


def resolve_model(env: dict[str, str]) -> str:
    return env.get("LLM_BASE_MODEL") or DEFAULT_MODEL


def resolve_config(
    repo: str,
    out: str | None,
    focus: str | None,
    env: dict[str, str],
    require_key: bool = True,
) -> Config:
    repo_path = Path(repo).expanduser().resolve()
    if not repo_path.is_dir():
        raise ConfigError(f"repository path is not a directory: {repo_path}")
    api_key = env.get("LLM_API_KEY") or ""
    if require_key and not api_key:
        raise ConfigError(
            "LLM_API_KEY is not set. Export it (for OpenHands Cloud, "
            "the OPENHANDS_API_KEY can be used)."
        )
    # Default artifacts live in the current working directory, never inside the
    # analysed repository, so the target stays read-only.
    out_dir = (
        Path(out).expanduser().resolve()
        if out
        else (Path.cwd() / DEFAULT_OUT_DIRNAME).resolve()
    )
    focus_tuple = tuple(
        part.strip().lower() for part in (focus or "").split(",") if part.strip()
    )
    return Config(
        repo_path=str(repo_path),
        out_dir=str(out_dir),
        model=resolve_model(env),
        base_url=env.get("LLM_BASE_URL"),
        api_key=api_key,
        focus=focus_tuple,
        max_rounds=1,
    )


# --- repository scanning -----------------------------------------------------


def iter_source_files(root: str) -> list[Path]:
    paths: list[Path] = []
    root_path = Path(root)
    for dirpath, dirnames, filenames in os.walk(root_path):
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]
        for name in filenames:
            if Path(name).suffix in SOURCE_EXTS:
                paths.append(Path(dirpath) / name)
    return sorted(paths)


def read_sources(root: str) -> dict[str, str]:
    sources: dict[str, str] = {}
    for path in iter_source_files(root):
        try:
            sources[str(path.relative_to(root))] = path.read_text(
                encoding="utf-8", errors="replace"
            )
        except OSError as exc:  # pragma: no cover - filesystem race
            log.warning("skipping %s: %s", path, exc)
    return sources


# --- heuristic 1: oversized modules -----------------------------------------


def analyze_file_sizes(
    files: dict[str, int], max_loc: int, max_lines: int
) -> list[dict]:
    findings = []
    for path, loc in sorted(files.items()):
        if loc > max_loc:
            findings.append(
                {
                    "category": "oversized-module",
                    "severity": "high" if loc > max_loc * 2 else "medium",
                    "title": f"{path} exceeds the size budget",
                    "detail": (
                        f"{loc} lines of code (threshold {max_loc}). Large files "
                        f"hide multiple responsibilities and resist independent change."
                    ),
                    "evidence": f"{path}: {loc} LOC > {max_loc} LOC threshold",
                    "files": [path],
                }
            )
    return findings


# --- heuristic 2: import graph, cycles, coupling -----------------------------

_IMPORT_RE = re.compile(
    r"""(?:^|\n)\s*(?:import\s+(?:[^'"]*?\s+from\s+)?|export\s+[^'"]*?\s+from\s+|"""
    r"""from\s+|require\()\s*['"]([^'"]+)['"]""",
)


def _resolve_import(spec: str, importer: str, sources: dict[str, str]) -> str | None:
    if spec.startswith("."):
        base = os.path.normpath(os.path.join(os.path.dirname(importer), spec))
        # TS ESM writes ".js" specifiers that resolve to ".ts" sources.
        swapped = re.sub(r"\.(js|jsx|mjs|cjs)$", "", base)
        candidates = [
            base,
            *[base + ext for ext in SOURCE_EXTS],
            *[f"{base}/index{ext}" for ext in SOURCE_EXTS],
            *[swapped + ext for ext in SOURCE_EXTS],
            *[f"{swapped}/index{ext}" for ext in SOURCE_EXTS],
        ]
        for candidate in candidates:
            norm = candidate.replace(os.sep, "/")
            if norm in sources and norm != importer:
                return norm
    return None


def import_graph_from(sources: dict[str, str], root: str = ".") -> dict[str, set[str]]:
    graph: dict[str, set[str]] = {name: set() for name in sources}
    for name, text in sources.items():
        for spec in _IMPORT_RE.findall(text):
            target = _resolve_import(spec, name, sources)
            if target and target != name:
                graph[name].add(target)
    return graph


def detect_cycles(graph: dict[str, set[str]]) -> list[list[str]]:
    cycles: list[list[str]] = []
    seen: set[frozenset[str]] = set()
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
    stack: list[str] = []

    def visit(node: str) -> None:
        color[node] = GRAY
        stack.append(node)
        for nxt in sorted(graph.get(node, ())):
            if nxt not in color:
                continue
            if color[nxt] == GRAY:
                cycle = stack[stack.index(nxt):]
                key = frozenset(cycle)
                if key not in seen:
                    seen.add(key)
                    cycles.append(cycle)
            elif color[nxt] == WHITE:
                visit(nxt)
        stack.pop()
        color[node] = BLACK

    for node in sorted(graph):
        if color[node] == WHITE:
            visit(node)
    return cycles


def fan_in_out(graph: dict[str, set[str]]) -> dict[str, dict[str, int]]:
    metrics = {node: {"fan_in": 0, "fan_out": len(deps)} for node, deps in graph.items()}
    for deps in graph.values():
        for dep in deps:
            if dep in metrics:
                metrics[dep]["fan_in"] += 1
    return metrics


def coupling_hotspots(
    graph: dict[str, set[str]], fan_in_threshold: int, fan_out_threshold: int
) -> dict[str, dict[str, int]]:
    metrics = fan_in_out(graph)
    return {
        node: m
        for node, m in metrics.items()
        if m["fan_in"] >= fan_in_threshold or m["fan_out"] >= fan_out_threshold
    }


# --- heuristic 3: duplication ------------------------------------------------


def find_duplicate_blocks(sources: dict[str, str], min_lines: int) -> list[dict]:
    norm_of: dict[str, list[str]] = {}
    for name, text in sources.items():
        norm_of[name] = [
            re.sub(r"\s+", " ", line).strip() for line in text.splitlines()
        ]

    index: dict[tuple[str, ...], set[str]] = {}
    for name, lines in norm_of.items():
        for start in range(len(lines) - min_lines + 1):
            window = lines[start : start + min_lines]
            if sum(1 for line in window if line) < min_lines:
                continue
            key = tuple(window)
            index.setdefault(key, set()).add(name)

    groups: dict[frozenset[str], dict] = {}
    for key, files in index.items():
        if len(files) < 2:
            continue
        gkey = frozenset(files)
        if gkey not in groups:
            groups[gkey] = {"locations": sorted(files), "lines": min_lines, "sample": key}
        else:
            groups[gkey]["lines"] = max(groups[gkey]["lines"], min_lines)

    results = []
    for group in groups.values():
        locations = group["locations"]
        results.append(
            {
                "category": "duplication",
                "severity": "medium",
                "title": f"{group['lines']}+ duplicated lines across "
                f"{len(locations)} files",
                "detail": "Repeated block suggests a missing shared abstraction.",
                "evidence": "identical normalized block in: " + ", ".join(locations),
                "locations": locations,
                "lines": group["lines"],
                "files": locations,
            }
        )
    return results


# --- evidence gate -----------------------------------------------------------


def has_evidence(finding: dict) -> bool:
    return bool(str(finding.get("evidence", "")).strip())


def evidence_gate(findings: list[dict]) -> tuple[list[dict], list[dict]]:
    kept = [f for f in findings if has_evidence(f)]
    dropped = [f for f in findings if not has_evidence(f)]
    return kept, dropped


# --- deterministic analysis --------------------------------------------------


def _assign_ids(findings: list[dict]) -> list[dict]:
    ordered = sorted(findings, key=lambda f: (f.get("severity") != "high", f.get("title", "")))
    for idx, finding in enumerate(ordered, start=1):
        finding.setdefault("id", f"F{idx}")
    return ordered


def run_deterministic_analysis(repo_path: str, focus: tuple[str, ...] = ()) -> tuple[list[dict], dict]:
    """Run all heuristics and return (gated findings, recon summary)."""
    sources = read_sources(repo_path)
    files_loc = {name: text.count("\n") + 1 for name, text in sources.items()}
    graph = import_graph_from(sources)
    metrics = fan_in_out(graph)

    recon = {
        "file_count": len(sources),
        "total_loc": sum(files_loc.values()),
        "languages": sorted({Path(n).suffix.lstrip(".") for n in sources}),
        "largest": sorted(files_loc.items(), key=lambda kv: kv[1], reverse=True)[:5],
    }

    candidates: list[dict] = []
    if not focus or "oversized" in focus or "size" in focus:
        candidates += analyze_file_sizes(files_loc, MAX_FILE_LOC, MAX_FILE_LINES)
    if not focus or "coupling" in focus:
        for node, m in coupling_hotspots(graph, FAN_IN_THRESHOLD, FAN_OUT_THRESHOLD).items():
            candidates.append(
                {
                    "category": "coupling",
                    "severity": "high" if m["fan_in"] > FAN_IN_THRESHOLD * 2 else "medium",
                    "title": f"{node} is a coupling hotspot",
                    "detail": (
                        f"fan-in={m['fan_in']}, fan-out={m['fan_out']}. High fan-in "
                        f"means many dependents; high fan-out means many dependencies."
                    ),
                    "evidence": f"{node}: fan_in={m['fan_in']} fan_out={m['fan_out']}",
                    "files": [node],
                }
            )
        for cycle in detect_cycles(graph):
            candidates.append(
                {
                    "category": "cycle",
                    "severity": "high",
                    "title": "Import cycle: " + " -> ".join(cycle + [cycle[0]]),
                    "detail": "Cyclic imports couple modules and block independent testing.",
                    "evidence": "cycle detected: " + " -> ".join(cycle + [cycle[0]]),
                    "files": list(cycle),
                }
            )
    if not focus or "duplication" in focus or "deadcode" in focus:
        candidates += find_duplicate_blocks(sources, DUPLICATE_MIN_LINES)

    kept, dropped = evidence_gate(candidates)
    for finding in dropped:
        log.warning("dropped finding without evidence: %s", finding.get("title"))
    return _assign_ids(kept), recon


# --- artifact rendering ------------------------------------------------------


def render_report(
    repo_path: str, findings: list[dict], recon: dict | None = None, generated_at: str = ""
) -> str:
    generated_at = generated_at or datetime.now(timezone.utc).isoformat(timespec="seconds")
    lines = [
        "# Architecture Report",
        "",
        f"- Repository: `{repo_path}`",
        f"- Generated: {generated_at}",
        f"- Findings: {len(findings)}",
        "",
    ]
    if recon:
        lines += [
            "## Repository snapshot",
            "",
            f"- Source files: {recon.get('file_count', 0)}",
            f"- Total LOC: {recon.get('total_loc', 0)}",
            f"- Languages: {', '.join(recon.get('languages', [])) or 'n/a'}",
            "",
            "### Largest files",
            "",
            *[f"- `{name}` — {loc} LOC" for name, loc in recon.get("largest", [])],
            "",
        ]
    if not findings:
        lines += ["## Findings", "", "No architecture findings with evidence.", ""]
        return "\n".join(lines) + "\n"

    lines += ["## Findings", ""]
    for finding in findings:
        lines += [
            f"### {finding.get('id', '?')} · {finding.get('title', '')}",
            "",
            f"- Category: {finding.get('category', 'n/a')}",
            f"- Severity: {finding.get('severity', 'n/a')}",
            f"- Files: {', '.join(finding.get('files', [])) or 'n/a'}",
            "",
            str(finding.get("detail", "")).strip(),
            "",
            "## Evidence",
            "",
            "```",
            str(finding.get("evidence", "")).strip(),
            "```",
            "",
        ]
    return "\n".join(lines) + "\n"


def render_refactor_plan(
    repo_path: str,
    findings: list[dict],
    steps: list[str] | None = None,
    generated_at: str = "",
) -> str:
    generated_at = generated_at or datetime.now(timezone.utc).isoformat(timespec="seconds")
    steps = [s for s in (steps or []) if s.strip()]
    if not steps:
        steps = [
            f"Address {f.get('id', '?')}: {f.get('title', '')}" for f in findings
        ]

    lines = [
        "# Refactor Plan",
        "",
        f"- Repository: `{repo_path}`",
        f"- Generated: {generated_at}",
        "",
        "## Objective",
        "",
        "Improve codebase architecture by resolving the evidence-backed findings "
        "in the architecture report, in small, reversible slices.",
        "",
        "## Success Criteria",
        "",
    ]
    if findings:
        lines += [f"- [ ] {f.get('id', '?')} resolved: {f.get('title', '')}" for f in findings]
    else:
        lines += ["- [x] No architecture findings with evidence"]
    lines += ["- [ ] Repository verification (tests, typecheck, lint) stays green", ""]

    lines += ["## Steps", ""]
    if findings:
        lines += [f"{i}. [ ] {step}" for i, step in enumerate(steps, start=1)]
    else:
        lines += ["1. [x] No architecture findings with evidence; nothing to refactor."]
    lines += [""]

    lines += [
        "## Risks",
        "",
        "- Refactors touch shared boundaries; keep each slice reversible.",
        "- Behaviour must be preserved; rely on existing tests or add characterization tests first.",
        "",
        "## Out of Scope",
        "",
        "- Automatic application of refactors (this agent is read-only).",
        "- Rewrites that change public behaviour or product decisions.",
        "",
    ]
    if not findings:
        lines.insert(0, "<!-- No architecture findings with evidence were detected. -->\n")
    return "\n".join(lines) + "\n"


# --- SDK phases --------------------------------------------------------------

RUBRIC_SKILL = """\
You are a senior software architect. You improve architecture, never guess.

Evidence contract (non-negotiable):
- Every finding MUST carry evidence: a command you ran and its observed output,
  or an exact file:line citation.
- Never invent metrics, file paths, or line numbers. If you cannot verify a
  claim from a tool result, do not state it.

MIA principles to apply:
- small, deep modules with simple interfaces;
- explicit contracts and single ownership (no duplicate stores/registries/engines);
- clear layering (e.g. CLI must not reach into persistence internals);
- reversible, evidence-driven changes;
- remove dead code rather than accumulate it.

Detection rubric (with default thresholds):
- oversized-module: > 400 LOC in one file;
- coupling: fan-in or fan-out >= 6;
- cycle: cyclic imports between modules;
- duplication: >= 8 identical normalized lines across files.
"""

PLANNING_SKILL = """\
When drafting a refactor plan, follow the MIA plan shape exactly:
Objective, Success Criteria (checkbox list), Steps (one reversible slice each),
Risks (with mitigation), Out of Scope. Order the smallest, highest-impact,
lowest-risk slice first.
"""


@dataclass
class RunResult:
    findings: list[dict] = field(default_factory=list)
    recon: dict = field(default_factory=dict)
    dropped: list[dict] = field(default_factory=list)
    steps: list[str] = field(default_factory=list)
    report_path: str = ""
    plan_path: str = ""


def build_agent(llm, condenser_llm):
    from openhands.sdk import Agent, AgentContext
    from openhands.sdk.context import KeywordTrigger, Skill
    from openhands.sdk.context.condenser import LLMSummarizingCondenser
    from openhands.tools.file_editor import FileEditorTool
    from openhands.tools.task_tracker import TaskTrackerTool
    from openhands.tools.terminal import TerminalTool
    from openhands.sdk.tool import Tool

    agent_context = AgentContext(
        skills=[
            Skill(name="architecture-rubric", content=RUBRIC_SKILL, trigger=None),
            Skill(
                name="refactor-planning",
                content=PLANNING_SKILL,
                trigger=KeywordTrigger(keywords=["refactor", "plan", "prioritize"]),
            ),
        ],
        system_message_suffix=(
            "Analyse the repository read-only. Never modify the target repository; "
            "write only into the output directory."
        ),
    )
    condenser = LLMSummarizingCondenser(llm=condenser_llm, max_size=40, keep_first=2)
    return Agent(
        llm=llm,
        tools=[
            Tool(name=TerminalTool.name),
            Tool(name=FileEditorTool.name),
            Tool(name=TaskTrackerTool.name),
        ],
        agent_context=agent_context,
        condenser=condenser,
    )


def run_agent(config: Config, use_llm: bool = True) -> RunResult:
    """Run deterministic analysis, then use the SDK for interpretation."""
    result = RunResult()

    log.info("[P0] RECON — scanning %s", config.repo_path)
    result.findings, result.recon = run_deterministic_analysis(config.repo_path, config.focus)
    log.info(
        "[P1] SIGNALS — %s source files, %s LOC, %s findings",
        result.recon.get("file_count"),
        result.recon.get("total_loc"),
        len(result.findings),
    )

    if use_llm:
        result.steps = _ask_llm_for_steps(config, result.findings)
    else:
        result.steps = [f.get("title", "") for f in result.findings]

    log.info("[P4] REPORT — writing artifacts")
    Path(config.out_dir).mkdir(parents=True, exist_ok=True)
    result.report_path = str(Path(config.out_dir) / "ARCHITECTURE_REPORT.md")
    result.plan_path = str(Path(config.out_dir) / "REFACTOR_PLAN.md")
    Path(result.report_path).write_text(
        render_report(config.repo_path, result.findings, result.recon), encoding="utf-8"
    )
    Path(result.plan_path).write_text(
        render_refactor_plan(config.repo_path, result.findings, result.steps), encoding="utf-8"
    )
    log.info("[P5] PLAN — %s", result.plan_path)
    return result


def _ask_llm_for_steps(config: Config, findings: list[dict]) -> list[str]:
    """Use the SDK agent once to turn findings into ordered refactor steps."""
    if not findings:
        return []
    try:
        from openhands.sdk import Agent, Conversation, LLM
        from pydantic import SecretStr

        llm = LLM(
            model=config.model,
            api_key=SecretStr(config.api_key),
            base_url=config.base_url,
            usage_id="agent",
        )
        condenser_llm = llm.model_copy(update={"usage_id": "condenser"})
        agent = build_agent(llm, condenser_llm)
        summary = "\n".join(
            f"{f['id']}: {f['title']} — {f.get('evidence', '')}" for f in findings
        )
        conversation = Conversation(agent=agent, workspace=config.repo_path)
        prompt = (
            "The deterministic analysis produced these evidence-backed findings:\n\n"
            f"{summary}\n\n"
            "Return ONLY a numbered list (1., 2., ...) of refactor steps, one "
            "reversible slice each, smallest highest-impact first. No preamble."
        )
        conversation.send_message(prompt)
        conversation.run()
        answer = _last_text(conversation)
        parsed = _parse_steps(answer)
        return parsed or [f.get("title", "") for f in findings]
    except Exception as exc:  # pragma: no cover - network/LLM failure path
        log.error("LLM step generation failed (%s); falling back to finding titles", exc)
        return [f.get("title", "") for f in findings]


def _last_text(conversation) -> str:
    from openhands.sdk.llm import content_to_str

    for event in reversed(conversation.state.events):
        message = getattr(event, "llm_message", None)
        if message is not None and getattr(message, "role", "") == "assistant":
            text = "".join(content_to_str(message.content)).strip()
            if text:
                return text
    return ""


def _parse_steps(text: str) -> list[str]:
    steps = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        match = re.match(r"^(?:\d+[.)]|[-*])\s+(.*)$", line)
        if match:
            steps.append(match.group(1).strip())
        elif steps:
            steps[-1] += " " + line
    return [s for s in steps if s]


# --- CLI ---------------------------------------------------------------------


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="architecture_agent",
        description="Evidence-backed architecture review for a local repository.",
    )
    parser.add_argument("repo", help="path to the repository to analyse")
    parser.add_argument("--out", default=None, help="output directory for artifacts")
    parser.add_argument(
        "--focus", default=None, help="comma list: coupling,duplication,oversized,deadcode"
    )
    parser.add_argument("--max-rounds", type=int, default=1, help="reserved for future use")
    parser.add_argument("--dry-run", action="store_true", help="deterministic analysis only, no LLM")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s"
    )
    args = parse_args(argv)
    try:
        config = resolve_config(
            args.repo, args.out, args.focus, dict(os.environ), require_key=not args.dry_run
        )
    except ConfigError as exc:
        log.error("%s", exc)
        return 2

    if args.dry_run:
        log.info("dry-run: deterministic analysis only (no LLM calls)")

    log.info("model=%s out=%s", config.model, config.out_dir)
    result = run_agent(config, use_llm=not args.dry_run)

    print("\n" + "=" * 72)
    print(f"Architecture review complete — {len(result.findings)} finding(s)")
    print(f"Report: {result.report_path}")
    print(f"Plan:   {result.plan_path}")
    print("=" * 72)
    return 0


if __name__ == "__main__":
    sys.exit(main())
