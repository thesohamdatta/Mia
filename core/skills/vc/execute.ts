// VC Skill Executor - Professional git management
// Runs: mia vc

import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

const _CONVENTIONAL_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'chore',
  'build',
  'ci',
  'revert',
] as const;

async function runGit(args: string[], cwd: string): Promise<{ ok: boolean; output: string }> {
  const proc = Bun.spawn(['git', ...args], { stdout: 'pipe', stderr: 'pipe', cwd });
  const output = await new Response(proc.stdout).text();
  const error = await new Response(proc.stderr).text();
  await proc.exited;
  return { ok: proc.exitCode === 0, output: output + (error ? `\n${error}` : '') };
}

function validateConventionalCommit(msg: string): { valid: boolean; error?: string } {
  const pattern = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: .+/;
  if (!pattern.test(msg)) {
    return {
      valid: false,
      error:
        'Use conventional commits: type(scope): description\nTypes: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert',
    };
  }
  return { valid: true };
}

async function getCurrentVersion(cwd: string): Promise<string> {
  const pkg = await Bun.file(join(cwd, 'package.json')).json();
  return pkg.version || '0.0.0';
}

function bumpVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  const parts = version.split('.').map(Number);
  const major = parts[0] ?? 0;
  const minor = parts[1] ?? 0;
  const patch = parts[2] ?? 0;
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function updatePackageVersion(newVersion: string, cwd: string): Promise<void> {
  const pkgPath = join(cwd, 'package.json');
  const pkg = await Bun.file(pkgPath).json();
  pkg.version = newVersion;
  await Bun.write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

import { join } from 'node:path';

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'help';
  const cwd = ctx.cwd;

  switch (subcmd) {
    case 'help': {
      return {
        ok: true,
        output: `mia vc — professional version control

Usage: mia vc <command>

Commands:
  status              Show git status (clean, staged, unstaged)
  diff                Show staged/unstaged changes
  commit <message>    Create conventional commit (type(scope): desc)
  amend               Amend last commit (edit message, add staged)
  log [n]             Show last n commits (default 10)
  branch [name]       List branches or create/switch to new branch
  sync                Pull then push current branch
  tag <version>       Create annotated tag (v1.2.3)
  release <type>      Bump version (major|minor|patch), commit, tag, push
  clean               Remove untracked build artifacts (node_modules, *.exe)
  ignore              Show/edit .gitignore
  hooks               Install git hooks (commit-msg validation)

Examples:
  mia vc commit "feat(cli): add direct execution"
  mia vc commit "fix(config): simplify paths"
  mia vc release patch
  mia vc branch feature/skill-system
  mia vc tag v1.0.0

Conventional commits enforced. Clean history = happy maintainers.`,
      };
    }

    case 'status': {
      const res = await runGit(['status', '--short', '--branch'], cwd);
      return { ok: res.ok, output: res.output || 'Clean working tree ✓' };
    }

    case 'diff': {
      const staged = await runGit(['diff', '--cached'], cwd);
      const unstaged = await runGit(['diff'], cwd);
      let output = '';
      if (staged.output.trim()) output += `=== STAGED ===\n${staged.output}\n`;
      if (unstaged.output.trim()) output += `=== UNSTAGED ===\n${unstaged.output}\n`;
      return { ok: true, output: output || 'No changes' };
    }

    case 'commit': {
      const msg = args.slice(1).join(' ');
      if (!msg)
        return {
          ok: false,
          error: 'Commit message required. Usage: mia vc commit "feat(scope): description"',
        };
      const valid = validateConventionalCommit(msg);
      if (!valid.valid) return { ok: false, error: valid.error };
      const addRes = await runGit(['add', '-A'], cwd);
      if (!addRes.ok) return { ok: false, error: addRes.output };
      const commitRes = await runGit(['commit', '-m', msg], cwd);
      return {
        ok: commitRes.ok,
        output: commitRes.output,
        error: commitRes.ok ? undefined : commitRes.output,
      };
    }

    case 'amend': {
      const msg = args[1] ? args.slice(1).join(' ') : undefined;
      const commitArgs = ['commit', '--amend', '--no-edit'];
      if (msg) {
        const valid = validateConventionalCommit(msg);
        if (!valid.valid) return { ok: false, error: valid.error };
        commitArgs.splice(2, 0, '-m', msg);
      }
      const addRes = await runGit(['add', '-A'], cwd);
      if (!addRes.ok) return { ok: false, error: addRes.output };
      const commitRes = await runGit(commitArgs, cwd);
      return {
        ok: commitRes.ok,
        output: commitRes.output,
        error: commitRes.ok ? undefined : commitRes.output,
      };
    }

    case 'log': {
      const n = Number.parseInt(args[1] || '10', 10);
      const res = await runGit(['log', '--oneline', `-${n}`, '--decorate'], cwd);
      return { ok: res.ok, output: res.output };
    }

    case 'branch': {
      if (args[1]) {
        const res = await runGit(['checkout', '-b', args[1]], cwd);
        return { ok: res.ok, output: res.output, error: res.ok ? undefined : res.output };
      }
      const res = await runGit(['branch', '-v'], cwd);
      return { ok: res.ok, output: res.output };
    }

    case 'sync': {
      const pullRes = await runGit(['pull', '--rebase'], cwd);
      if (!pullRes.ok) return { ok: false, error: `Pull failed: ${pullRes.output}` };
      const pushRes = await runGit(['push'], cwd);
      return {
        ok: pushRes.ok,
        output: pushRes.output,
        error: pushRes.ok ? undefined : pushRes.output,
      };
    }

    case 'tag': {
      const version = args[1];
      if (!version) return { ok: false, error: 'Tag version required. Usage: mia vc tag v1.2.3' };
      if (!/^v?\d+\.\d+\.\d+$/.test(version))
        return { ok: false, error: 'Use semantic versioning: v1.2.3' };
      const tag = version.startsWith('v') ? version : `v${version}`;
      const res = await runGit(['tag', '-a', tag, '-m', `Release ${tag}`], cwd);
      if (!res.ok) return { ok: false, error: res.output };
      const pushRes = await runGit(['push', 'origin', tag], cwd);
      return {
        ok: pushRes.ok,
        output: `Tagged ${tag}${pushRes.ok ? ' and pushed' : ' (push manually)'}`,
        error: pushRes.ok ? undefined : pushRes.output,
      };
    }

    case 'release': {
      const type = args[1] as 'major' | 'minor' | 'patch';
      if (!['major', 'minor', 'patch'].includes(type))
        return { ok: false, error: 'Release type required: major, minor, or patch' };
      const current = await getCurrentVersion(cwd);
      const next = bumpVersion(current, type);
      const tag = `v${next}`;
      await updatePackageVersion(next, cwd);
      const addRes = await runGit(['add', 'package.json'], cwd);
      if (!addRes.ok) return { ok: false, error: addRes.output };
      const commitRes = await runGit(['commit', '-m', `chore(release): ${tag}`], cwd);
      if (!commitRes.ok) return { ok: false, error: commitRes.output };
      const tagRes = await runGit(['tag', '-a', tag, '-m', `Release ${tag}`], cwd);
      if (!tagRes.ok) return { ok: false, error: tagRes.output };
      const pushRes = await runGit(['push', 'origin', 'HEAD', tag], cwd);
      return {
        ok: pushRes.ok,
        output: `Released ${tag}`,
        error: pushRes.ok ? undefined : pushRes.output,
      };
    }

    case 'clean': {
      const res = await runGit(['clean', '-fd', '-X'], cwd);
      return { ok: res.ok, output: res.output || 'Cleaned untracked build artifacts' };
    }

    case 'ignore': {
      if (args[1]) {
        const pattern = args.slice(1).join(' ');
        const res = await runGit(['check-ignore', '-v', pattern], cwd);
        return { ok: true, output: res.output || `${pattern} is not ignored` };
      }
      const res = await runGit(['status', '--ignored', '--short'], cwd);
      return { ok: res.ok, output: res.output };
    }

    case 'hooks': {
      const hookDir = join(cwd, '.git', 'hooks');
      const hook = `#!/bin/sh
# Conventional commit validation
msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\\(.+\\))?: .+"
if ! echo "$msg" | grep -qE "$pattern"; then
  echo "❌ Invalid commit message format"
  echo "Use: type(scope): description"
  echo "Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert"
  exit 1
fi
`;
      await Bun.write(`${hookDir}/commit-msg`, hook);
      await runGit(['config', 'core.hooksPath', '.git/hooks'], cwd);
      return { ok: true, output: 'Installed commit-msg hook (conventional commits enforced)' };
    }

    default:
      return { ok: false, error: `Unknown command: ${subcmd}. Run 'mia vc help'` };
  }
}

export const executor: SkillExecutor = { execute };
