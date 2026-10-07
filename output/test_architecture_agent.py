"""TDD suite for the architecture improvement agent.

Run:  . .venv/bin/activate && pytest -q

These tests exercise the deterministic core (config resolution, metric
heuristics, the evidence gate, and artifact rendering). The LLM phases are
thin wrappers over this core and are covered by the smoke test instead.
"""

from __future__ import annotations

import pytest

import architecture_agent as aa


# --- config resolution -------------------------------------------------------


def test_resolve_model_default():
    assert aa.resolve_model({}) == "openhands/claude-sonnet-4-5-20250929"


def test_resolve_model_override():
    assert aa.resolve_model({"LLM_BASE_MODEL": "anthropic/claude-x"}) == "anthropic/claude-x"


def test_resolve_config_defaults(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    cfg = aa.resolve_config(str(repo), None, None, {"LLM_API_KEY": "k"})
    assert cfg.repo_path == str(repo.resolve())
    assert cfg.model == "openhands/claude-sonnet-4-5-20250929"
    # default output is under CWD, never inside the analysed repo
    assert cfg.out_dir == str((aa.Path.cwd() / "architecture-review").resolve())
    assert str(repo.resolve()) not in cfg.out_dir
    assert cfg.max_rounds == 1


def test_resolve_config_requires_repo(tmp_path):
    with pytest.raises(aa.ConfigError):
        aa.resolve_config(str(tmp_path / "missing"), None, None, {"LLM_API_KEY": "k"})


def test_resolve_config_requires_api_key(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    with pytest.raises(aa.ConfigError):
        aa.resolve_config(str(repo), None, None, {})


def test_resolve_config_dry_run_allows_missing_key(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    cfg = aa.resolve_config(str(repo), None, None, {}, require_key=False)
    assert cfg.api_key == ""


def test_resolve_config_out_and_focus(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    cfg = aa.resolve_config(str(repo), "out", "coupling, deadcode", {"LLM_API_KEY": "k"})
    assert cfg.focus == ("coupling", "deadcode")
    assert cfg.out_dir.endswith("out")


# --- file-size heuristic -----------------------------------------------------


def test_analyze_file_sizes_flags_oversized():
    files = {"a.py": 10, "big.py": 500, "ok.py": 100}
    findings = aa.analyze_file_sizes(files, max_loc=400, max_lines=3000)
    assert [f["files"] for f in findings] == [["big.py"]]
    assert findings[0]["category"] == "oversized-module"


def test_analyze_file_sizes_none_when_small():
    assert aa.analyze_file_sizes({"a.py": 10}, max_loc=400, max_lines=3000) == []


# --- import graph / coupling -------------------------------------------------


def test_import_graph_from_sources():
    sources = {
        "core/cli/index.ts": "import { run } from '../state/store.js';\n",
        "core/state/store.ts": "export const store = 1;\n",
    }
    graph = aa.import_graph_from(sources, root=".")
    assert graph["core/state/store.ts"] == set()
    assert "core/state/store.ts" in graph["core/cli/index.ts"]


def test_detect_cycles_finds_cycle():
    graph = {"a": {"b"}, "b": {"c"}, "c": {"a"}, "d": set()}
    cycles = aa.detect_cycles(graph)
    assert len(cycles) == 1
    assert set(cycles[0]) == {"a", "b", "c"}


def test_detect_cycles_none_when_acyclic():
    graph = {"a": {"b"}, "b": set()}
    assert aa.detect_cycles(graph) == []


def test_fan_in_out_ranks_hotspots():
    graph = {"a": {"b", "c"}, "b": {"c"}, "c": set()}
    metrics = aa.fan_in_out(graph)
    assert metrics["c"] == {"fan_in": 2, "fan_out": 0}
    assert metrics["a"] == {"fan_in": 0, "fan_out": 2}
    hotspots = aa.coupling_hotspots(graph, fan_in_threshold=2, fan_out_threshold=2)
    assert "c" in hotspots


# --- duplication -------------------------------------------------------------


def test_find_duplicate_blocks_across_files():
    block = "\n".join(f"x{i} = compute({i})" for i in range(8))
    sources = {
        "a.py": f"header = 1\n{block}\n",
        "b.py": f"other = 2\n{block}\n",
    }
    dupes = aa.find_duplicate_blocks(sources, min_lines=6)
    assert len(dupes) == 1
    assert set(dupes[0]["locations"]) == {"a.py", "b.py"}
    assert dupes[0]["lines"] >= 6


def test_find_duplicate_blocks_ignores_blank_noise():
    sources = {"a.py": "\n\n\n\n\n\n\n\n", "b.py": "\n\n\n\n\n\n\n\n"}
    assert aa.find_duplicate_blocks(sources, min_lines=6) == []


# --- evidence gate -----------------------------------------------------------


def test_evidence_gate_keeps_and_drops():
    findings = [
        {"title": "coupled", "evidence": "grep -r foo . -> 12 hits"},
        {"title": "guess", "evidence": ""},
        {"title": "no-key"},
    ]
    kept, dropped = aa.evidence_gate(findings)
    assert [f["title"] for f in kept] == ["coupled"]
    assert {f["title"] for f in dropped} == {"guess", "no-key"}


def test_finding_requires_evidence():
    assert aa.has_evidence({"evidence": "a -> b"}) is True
    assert aa.has_evidence({"evidence": "   "}) is False
    assert aa.has_evidence({}) is False


# --- artifact rendering ------------------------------------------------------


def test_render_report_includes_evidence():
    findings = [
        {
            "id": "F1",
            "category": "oversized-module",
            "severity": "high",
            "title": "Store is too large",
            "detail": "1200 LOC in one file",
            "evidence": "wc -l core/state/store.ts -> 1200",
            "files": ["core/state/store.ts"],
        }
    ]
    md = aa.render_report("/repo", findings, generated_at="2026-01-01")
    assert "# Architecture Report" in md
    assert "F1" in md
    assert "## Evidence" in md
    assert "wc -l core/state/store.ts -> 1200" in md


def test_render_refactor_plan_mia_shape():
    findings = [
        {
            "id": "F1",
            "title": "Store too large",
            "severity": "high",
            "detail": "split it",
            "evidence": "wc -l -> 1200",
            "files": ["core/state/store.ts"],
        }
    ]
    md = aa.render_refactor_plan("/repo", findings, steps=["Split store"], generated_at="2026-01-01")
    for section in ("## Objective", "## Success Criteria", "## Steps", "## Risks", "## Out of Scope"):
        assert section in md
    assert "Split store" in md
    assert "- [ ]" in md


def test_render_refactor_plan_no_findings():
    md = aa.render_refactor_plan("/repo", [], steps=[], generated_at="2026-01-01")
    assert "No architecture findings" in md
