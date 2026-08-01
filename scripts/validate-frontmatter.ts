#!/usr/bin/env bun
/**
 * Frontmatter validation for MIA markdown files
 * Ensures all markdown files have required frontmatter fields
 */

import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const FrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 chars')
    .max(300, 'Description too long'),
  category: z.enum(['constitutional', 'skill', 'research', 'operational', 'project'], {
    errorMap: () => ({
      message: 'Category must be one of: constitutional, skill, research, operational, project',
    }),
  }),
  audience: z.enum(['developer', 'agent', 'human'], {
    errorMap: () => ({ message: 'Audience must be one of: developer, agent, human' }),
  }),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver (e.g., 1.0.0)'),
  'last-reviewed': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'last-reviewed must be YYYY-MM-DD'),
});

// Generated skill docs have their own frontmatter schema
const SkillDocSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  'preamble-tier': z.number().or(z.string().regex(/^\d+$/)),
  'allowed-tools': z.array(z.string()),
  triggers: z.array(z.string()),
});

const ROOT = process.cwd();
const MARKDOWN_EXTS = ['.md'];

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    // Skip ignored directories
    if (entry.isDirectory()) {
      if (
        [
          'node_modules',
          '.git',
          'bin',
          'dist',
          'build',
          'coverage',
          '.nyc_output',
          '.bun',
          '.mia',
        ].includes(entry.name)
      ) {
        continue;
      }
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && MARKDOWN_EXTS.includes(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function validateFrontmatter(filePath: string): {
  valid: boolean;
  errors: string[];
  warnings?: string[];
} {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    // Normalize path separators for cross-platform matching
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Skip generated skill docs (they have different validation)
    if (normalizedPath.includes('docs/skills/')) {
      const result = SkillDocSchema.safeParse(data);
      if (!result.success) {
        return {
          valid: false,
          errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        };
      }
      return { valid: true, errors: [] };
    }

    // Skip templates
    if (normalizedPath.includes('templates/')) {
      return { valid: true, errors: [] };
    }

    // Skip files without frontmatter (existing files not yet migrated)
    // Only warn, don't fail - we'll add frontmatter incrementally
    if (Object.keys(data).length === 0) {
      return {
        valid: true,
        errors: [],
        warnings: ['Missing frontmatter (will be added incrementally)'],
      };
    }

    const result = FrontmatterSchema.safeParse(data);

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

function main() {
  console.log('🔍 Validating frontmatter in markdown files...\n');

  const files = findMarkdownFiles(ROOT);
  let hasErrors = false;
  let validated = 0;

  for (const file of files) {
    const relPath = relative(ROOT, file);
    const { valid, errors } = validateFrontmatter(file);

    if (!valid) {
      hasErrors = true;
      console.log(`❌ ${relPath}`);
      for (const error of errors) {
        console.log(`   • ${error}`);
      }
    } else {
      validated++;
    }
  }

  console.log(`\n✅ Validated: ${validated}/${files.length} files`);

  if (hasErrors) {
    console.log('\n❌ Frontmatter validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ All frontmatter valid');
  }
}

main();
