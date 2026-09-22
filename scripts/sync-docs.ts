#!/usr/bin/env -S bun run
// @ts-nocheck
/**
 * Markdown Documentation Synchronization & Validation Engine
 *
 * Validates:
 * 1. Frontmatter shape across all docs/ markdown files
 * 2. Internal markdown file links and heading anchors
 * 3. Document graph information used for context navigation
 *
 * Missing optional frontmatter is non-blocking. Broken internal links remain blocking.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import matter from 'gray-matter';

const ROOT_DIR = resolve(import.meta.dir, '..');
const DOCS_DIR = join(ROOT_DIR, 'docs');
const AGENTS_MD = join(ROOT_DIR, 'AGENTS.md');

interface Frontmatter {
  title?: string;
  layer?: number;
  last_updated?: string;
  owner?: string;
  dependencies?: string[];
}

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface LinkCheckResult {
  file: string;
  link: string;
  target: string;
  valid: boolean;
}

interface DocNode {
  path: string;
  layer: number;
  title: string;
  dependencies: string[];
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        }
      } else if (extname(entry.name) === '.md') {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function validateFrontmatter(filePath: string, content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const { data } = matter(content);
    const fm = data as Frontmatter;

    if (fm && Object.keys(fm).length > 0) {
      if (fm.title !== undefined && typeof fm.title !== 'string') {
        errors.push('Invalid "title" field');
      }
      if (fm.layer !== undefined && (!Number.isInteger(fm.layer) || fm.layer < 0 || fm.layer > 4)) {
        errors.push('Invalid "layer" field (must be integer 0-4)');
      }
      if (fm.last_updated !== undefined && typeof fm.last_updated !== 'string') {
        errors.push('Invalid "last_updated" field');
      }
      if (fm.owner !== undefined && typeof fm.owner !== 'string') {
        errors.push('Invalid "owner" field');
      }
      if (fm.dependencies !== undefined && (!Array.isArray(fm.dependencies) || fm.dependencies.some((d) => typeof d !== 'string'))) {
        errors.push('"dependencies" must be an array of strings');
      }
    }
  } catch (error) {
    errors.push(`Failed to parse frontmatter: ${error}`);
  }

  return {
    file: relative(ROOT_DIR, filePath),
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function extractLinks(content: string): { link: string; target: string }[] {
  const links: { link: string; target: string }[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null = linkRegex.exec(content);

  while (match !== null) {
    const [fullLink, _text, url] = match;
    links.push({ link: fullLink, target: url });
    match = linkRegex.exec(content);
  }

  return links;
}

function resolveLink(baseFile: string, target: string): string | null {
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:')
  ) {
    return null;
  }

  let cleanTarget = target;
  if (target.startsWith('file://')) {
    cleanTarget = target.slice(7);
  }

  if (cleanTarget.startsWith('#')) {
    return baseFile;
  }

  const baseDir = resolve(ROOT_DIR, baseFile, '..');
  const resolvedPath = cleanTarget.startsWith('/')
    ? join(ROOT_DIR, cleanTarget.slice(1))
    : join(baseDir, cleanTarget);

  return resolve(rootedPath(resolvedPath));
}

function rootedPath(path: string): string {
  return path.startsWith(ROOT_DIR) ? path : join(ROOT_DIR, path);
}

function checkAnchorExists(filePath: string, anchor: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const normalized = anchor.replace(/-/g, '\\s+');
    const headingPattern = new RegExp(`^#{1,6}\\\\s+${normalized}\\s*$`, 'mi');
    return headingPattern.test(content);
  } catch {
    return false;
  }
}

function validateLinks(filePath: string, content: string): LinkCheckResult[] {
  const results: LinkCheckResult[] = [];

  for (const { link, target } of extractLinks(content)) {
    if (
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:') ||
      target.includes('*') ||
      target.startsWith('file:///') ||
      target === 'path'
    ) {
      continue;
    }

    const resolvedPath = resolveLink(filePath, target);
    if (!resolvedPath) continue;

    let targetFile = resolvedPath;
    let anchor = '';

    if (target.includes('#')) {
      const [pathPart, anchorPart] = target.split('#');
      targetFile = resolveLink(filePath, pathPart || '') || resolvedPath;
      anchor = anchorPart || '';
    }

    let valid = existsSync(targetFile);
    if (valid && anchor) {
      valid = checkAnchorExists(targetFile, anchor);
    }

    results.push({
      file: relative(ROOT_DIR, filePath),
      link,
      target: relative(ROOT_DIR, targetFile),
      valid,
    });
  }

  return results;
}

function buildDocGraph(files: string[]): DocNode[] {
  const nodes: DocNode[] = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const { data } = matter(content);

      if (data.layer !== undefined) {
        nodes.push({
          path: relative(ROOT_DIR, file),
          layer: data.layer,
          title: data.title || '',
          dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
        });
      }
    } catch {
      // Ignore malformed docs here. Link and syntax validation already reports parse failures.
    }
  }

  return nodes;
}

function extractAgentsDocReferences(agentsContent: string): string[] {
  const references: string[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null = linkRegex.exec(agentsContent);

  while (match !== null) {
    const [, , url] = match;
    if (url.startsWith('docs/') || url.startsWith('./docs/')) {
      references.push(url.startsWith('./') ? url.slice(2) : url);
    }
    match = linkRegex.exec(agentsContent);
  }

  return references;
}

function findOrphanedDocs(docNodes: DocNode[], agentsRefs: string[]): string[] {
  const docPaths = new Set(docNodes.map((n) => n.path.replace(/\\/g, '/')));
  const refPaths = new Set(agentsRefs.map((r) => r.replace(/^\//, '').replace(/\\/g, '/')));

  return [...docPaths].filter(
    (docPath) => ![...refPaths].some(
      (ref) => docPath === ref || docPath.endsWith(ref) || ref.endsWith(docPath)
    )
  );
}

async function main(): Promise<void> {
  console.log('MIA Documentation Sync & Validation Engine\n');

  const allMdFiles = getAllMarkdownFiles(DOCS_DIR);
  console.log(`Found ${allMdFiles.length} markdown files in docs/\n`);

  console.log('Validating frontmatter...');
  const frontmatterResults = allMdFiles.map((file) =>
    validateFrontmatter(file, readFileSync(file, 'utf-8'))
  );
  const invalidFrontmatter = frontmatterResults.filter((result) => !result.valid);

  for (const result of invalidFrontmatter) {
    console.log(`  ❌ ${result.file}`);
    for (const error of result.errors) console.log(`     - ERROR: ${error}`);
  }

  console.log(`\n  ${allMdFiles.length - invalidFrontmatter.length}/${allMdFiles.length} files have valid syntax\n`);

  console.log('Validating internal links...');
  const linkResults = allMdFiles.flatMap((file) =>
    validateLinks(file, readFileSync(file, 'utf-8'))
  );
  const brokenLinks = linkResults.filter((result) => !result.valid);

  if (brokenLinks.length > 0) {
    console.log(`  ❌ Found ${brokenLinks.length} broken link(s):`);
    for (const link of brokenLinks) {
      console.log(`     - ${link.file}: ${link.link} → ${link.target}`);
    }
  } else {
    console.log(`  ✅ All ${linkResults.length} internal links valid`);
  }
  console.log();

  const docNodes = buildDocGraph(allMdFiles);
  const layers = new Map<number, DocNode[]>();
  for (const node of docNodes) {
    layers.set(node.layer, [...(layers.get(node.layer) || []), node]);
  }

  for (const [layer, nodes] of [...layers.entries()].sort((a, b) => a[0] - b[0])) {
    const layerNames = ['Router Gateway', 'Core Architecture', 'Workflows', 'Specs & Decisions', 'Archive'];
    console.log(`  Layer ${layer} (${layerNames[layer] || 'Unknown'}): ${nodes.length} files`);
  }
  console.log();

  const agentsContent = readFileSync(AGENTS_MD, 'utf-8');
  const orphaned = findOrphanedDocs(docNodes, extractAgentsDocReferences(agentsContent));

  if (orphaned.length > 0) {
    console.log(`  ⚠️  ${orphaned.length} documented file(s) are not linked from AGENTS.md`);
    for (const orphan of orphaned) console.log(`     - ${orphan}`);
  } else {
    console.log(`  ✅ All ${docNodes.length} structured docs are referenced in AGENTS.md`);
  }
  console.log();

  console.log('VALIDATION SUMMARY');
  console.log(`Total files:        ${allMdFiles.length}`);
  console.log(`Invalid syntax:     ${invalidFrontmatter.length}`);
  console.log(`Links checked:      ${linkResults.length}`);
  console.log(`Broken links:       ${brokenLinks.length}`);
  console.log(`Orphaned docs:      ${orphaned.length}`);

  const hasErrors = invalidFrontmatter.length > 0 || brokenLinks.length > 0;
  if (hasErrors) {
    console.log('\nValidation FAILED');
    process.exit(1);
  }

  console.log('\nValidation PASSED');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
