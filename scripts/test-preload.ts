import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Pin MIA state to a throwaway directory for the whole test run. Without this,
// any test that builds an ExecutionContext without an explicit cwd writes to
// the developer's real ~/.mia.
// biome-ignore lint/complexity/useLiteralKeys: TS noPropertyAccessFromIndexSignature
process.env['MIA_DIR'] = mkdtempSync(join(tmpdir(), 'mia-test-state-'));
