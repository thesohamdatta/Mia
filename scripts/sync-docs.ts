#!/usr/bin/env -S bun run
// @ts-nocheck
/**
 * Markdown Documentation Synchronization & Validation Engine
 *
 * Validates:
 * 1. Frontmatter presence and schema across all docs/ markdown files
 * 2. Internal markdown file links and heading anchors
 * 3. Orphaned documentation files missing from AGENTS.md context map
 * 4. Canonical document metadata for agent-facing docs
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import matter from 'gray-matter';

const ROOT_DIR = resolve(import.meta.dir, '..');
const DOCS_DIR = join(ROOT_DIR, 'docs');
const AGENTS_MD = join(ROOT_DIR, 'AGENTS.md');

// Frontmatter schema
interface Frontmatter {
  title?: string;
  layer?: number;
  last_updated?: string;
  owner?: string;
  dependencies?: string[];
  type?: string;
  scope?: string;
  status?: string;
  canonical?: boolean;
  audience?: string;
  load?: string;
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
        // Skip node_modules and .git
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

    // Legacy metadata remains warning-only; agent-facing metadata is enforced.
    if (!fm.title || typeof fm.title !== 'string') {
      warnings.push('Missing or invalid "title" field');
    }

    if (fm.layer === undefined || !Number.isInteger(fm.layer) || fm.layer < 0 || fm.layer > 4) {
      warnings.push('Missing or invalid "layer" field (must be integer 0-4)');
    }

    if (!fm.last_updated || typeof fm.last_updated !== 'string') {
      warnings.push('Missing or invalid "last_updated" field');
    } else {
      // Validate date format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.last_updated)) {
        warnings.push('"last_updated" should be in YYYY-MM-DD format');
      }
    }

    if (!fm.owner || typeof fm.owner !== 'string') {
      warnings.push('Missing or invalid "owner" field');
    }

    const agentFacing = fm.audience === 'agent' || fm.audience === 'human+agent';
    if (agentFacing) {
      for (const [field, value] of Object.entries({
        type: fm.type,
        scope: fm.scope,
        status: fm.status,
        audience: fm.audience,
        load: fm.load,
      })) {
        if (typeof value !== 'string' || value.trim() === '') {
          errors.push(`Agent-facing document requires "${field}"`);
        }
      }
      if (fm.type !== 'skill' && fm.canonical !== true) {
        errors.push('Agent-facing canonical documents must declare canonical: true');
      }
    }

    if (fm.dependencies !== undefined) {
      if (!Array.isArray(fm.dependencies)) {
        errors.push('"dependencies" must be an array');
      } else {
        for (const dep of fm.dependencies) {
          if (typeof dep !== 'string') {
            errors.push('All dependencies must be strings');
          }
        }
      }
    }
  } catch (e) {
    errors.push(`Failed to parse frontmatter: ${e}`);
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

  // Match markdown links [text](url)
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
  // Skip external links
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:')
  ) {
    return null;
  }

  // Handle file:// protocol
  let cleanTarget = target;
  if (target.startsWith('file://')) {
    cleanTarget = target.slice(7);
  }

  // Handle anchor links
  if (cleanTarget.startsWith('#')) {
    return baseFile; // Same file anchor
  }

  // Handle relative paths
  const baseDir = resolve(ROOT_DIR, baseFile, '..');
  let resolvedPath: string;

  if (cleanTarget.startsWith('/')) {
    // Absolute from root
    resolvedPath = join(ROOT_DIR, cleanTarget.slice(1));
  } else {
    // Relative to current file
    resolvedPath = join(baseDir, cleanTarget);
  }

  // Normalize path
  resolvedPath = resolve(rootedPath(resolvedPath));

  return resolvedPath;
}

function rootedPath(path: string): string {
  return path.startsWith(ROOT_DIR) ? path : join(ROOT_DIR, path);
}

function checkAnchorExists(filePath: string, anchor: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    // Convert anchor to heading pattern (e.g., #some-heading -> ## Some Heading)
    const headingPattern = new RegExp(`^#{1,6}\\s+${anchor.replace(/-/g, '\\s+')}`, 'mi');
    return headingPattern.test(content);
  } catch {
    return false;
  }
}

function validateLinks(filePath: string, content: string): LinkCheckResult[] {
  const results: LinkCheckResult[] = [];
  const links = extractLinks(content);

  for (const { link, target } of links) {
    // Skip external links, placeholders, regexes, or generic templates
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

    if (!resolvedPath) {
      results.push({
        file: relative(ROOT_DIR, filePath),
        link,
        target,
        valid: true, // External links assumed valid
      });
      continue;
    }

    // Check if target has anchor
    let targetFile = resolvedPath;
    let anchor = '';

    if (target.includes('#')) {
      const parts = target.split('#');
      targetFile = resolveLink(filePath, parts[0]) || resolvedPath;
      anchor = parts[1];
    }

    let valid = existsSync(targetFile);

    // If anchor specified, check if it exists in target file
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

      nodes.push({
        path: relative(ROOT_DIR, file),
        layer: Number.isInteger(data.layer) ? data.layer : 0,
        title: typeof data.title === 'string' ? data.title : '',
        dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
      });
    } catch {
      // Skip files without parseable frontmatter.
    }
  }

  return nodes;
}

function extractAgentsDocReferences(agentsContent: string): string[] {
  const references: string[] = [];

  // Match markdown links in AGENTS.md
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null = linkRegex.exec(agentsContent);

  while (match !== null) {
    const [, , url] = match;
    if (url.startsWith('docs/') || url.startsWith('./docs/') || url.startsWith('file:///')) {
      let cleanUrl = url;
      if (url.startsWith('file:///')) {
        cleanUrl = url.slice(8); // Remove file:///
        // On Windows, file:///D:/... -> D:/...
        if (/^[A-Za-z]:/.test(cleanUrl)) {
          // Already has drive letter
        } else {
          cleanUrl = `/${cleanUrl}`;
        }
      } else if (url.startsWith('./docs/')) {
        cleanUrl = url.slice(2);
      }
      references.push(cleanUrl);
    }
    match = linkRegex.exec(agentsContent);
  }

  return references;
}

function findOrphanedDocs(docNodes: DocNode[], agentsRefs: string[]): string[] {
  const docPaths = new Set(docNodes.map((n) => n.path.replace(/\\/g, '/')));
  const refPaths = new Set(agentsRefs.map((r) => r.replace(/^\//, '').replace(/\\/g, '/')));

  return [...docPaths].filter((docPath) => {
    if (docPath === 'docs/core/agent-engineering.md' || docPath === 'docs/reference/evidence.md') {
      return false;
    }
    return ![...refPaths].some(
      (ref) => docPath === ref || docPath.endsWith(ref) || ref.endsWith(docPath)
    );
  });
}

async function main(): Promise<void> {
  console.log('🔍 MIA Documentation Sync & Validation Engine\n');

  // Gather all markdown files
  const allMdFiles = getAllMarkdownFiles(DOCS_DIR);
  console.log(`Found ${allMdFiles.length} markdown files in docs/\n`);

  // 1. Validate frontmatter
  console.log('📋 Validating frontmatter...');
  const frontmatterResults: ValidationResult[] = [];

  for (const file of allMdFiles) {
    const content = readFileSync(file, 'utf-8');
    const result = validateFrontmatter(file, content);
    frontmatterResults.push(result);

    if (!result.valid) {
      console.log(`  ❌ ${result.file}`);
      for (const error of result.errors) {
        console.log(`     - ERROR: ${error}`);
      }
    } else if (result.warnings.length > 0) {
      console.log(`  ⚠️  ${result.file}`);
      for (const warning of result.warnings) {
        console.log(`     - WARNING: ${warning}`);
      }
    }
  }

  const validCount = frontmatterResults.filter((r) => r.valid).length;
  console.log(`\n  ${validCount}/${allMdFiles.length} files have valid syntax\n`);

  // 2. Validate links
  console.log('🔗 Validating internal links...');
  const linkResults: LinkCheckResult[] = [];

  for (const file of allMdFiles) {
    const content = readFileSync(file, 'utf-8');
    const results = validateLinks(file, content);
    linkResults.push(...results);
  }

  const brokenLinks = linkResults.filter((r) => !r.valid);
  if (brokenLinks.length > 0) {
    console.log(`  ❌ Found ${brokenLinks.length} broken link(s):`);
    for (const link of brokenLinks) {
      console.log(`     - ${link.file}: ${link.link} → ${link.target}`);
    }
  } else {
    console.log(`  ✅ All ${linkResults.length} internal links valid`);
  }
  console.log();

  // 3. Build documentation graph
  console.log('📊 Building documentation graph...');
  const docNodes = buildDocGraph(allMdFiles);

  // Group by layer
  const layers = new Map<number, DocNode[]>();
  for (const node of docNodes) {
    const layerNodes = layers.get(node.layer) || [];
    layerNodes.push(node);
    layers.set(node.layer, layerNodes);
  }

  for (const [layer, nodes] of [...layers.entries()].sort((a, b) => a[0] - b[0])) {
    const layerNames = [
      'Router Gateway',
      'Core Architecture',
      'Workflows',
      'Specs & Decisions',
      'Archive',
    ];
    console.log(`  Layer ${layer} (${layerNames[layer] || 'Unknown'}): ${nodes.length} files`);
  }
  console.log();

  // 4. Check orphaned docs against AGENTS.md context map
  console.log('🗺️  Checking AGENTS.md context map...');
  const agentsContent = readFileSync(AGENTS_MD, 'utf-8');
  const agentsRefs = extractAgentsDocReferences(agentsContent);
  const orphaned = findOrphanedDocs(docNodes, agentsRefs);

  if (orphaned.length > 0) {
    console.log(
      `  ⚠️  ${orphaned.length} orphaned documentation file(s) not referenced in AGENTS.md:`
    );
    for (const orphan of orphaned) {
      console.log(`     - ${orphan}`);
    }
  } else {
    console.log(`  ✅ All ${docNodes.length} documented files referenced in AGENTS.md`);
  }
  console.log();

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('📊 VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Total files:       ${allMdFiles.length}`);
  console.log(`Valid syntax:      ${validCount}`);
  console.log(`Invalid syntax:    ${allMdFiles.length - validCount}`);
  console.log(`Links checked:     ${linkResults.length}`);
  console.log(`Broken links:      ${brokenLinks.length}`);
  console.log(`Orphaned docs:     ${orphaned.length}`);
  console.log('═══════════════════════════════════════════\n');

  // Exit with error code if any critical issues found (broken links or invalid syntax)
  const hasErrors = validCount < allMdFiles.length || brokenLinks.length > 0 || orphaned.length > 0;

  if (hasErrors) {
    console.log('❌ Validation FAILED - issues found above');
    process.exit(1);
  } else {
    console.log('✅ All validation checks PASSED');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
