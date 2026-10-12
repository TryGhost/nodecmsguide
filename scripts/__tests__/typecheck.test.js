import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const checker = fileURLToPath(new URL('../../tools/typecheck/check.js', import.meta.url));

it('checks the requested root and fails for Astro and TSX type errors', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'nodecms-typecheck-'));
  const run = () =>
    spawnSync(process.execPath, [checker, '--root', root], {
      encoding: 'utf8',
      timeout: 30_000,
    });

  try {
    writeFileSync(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { strict: true, jsx: 'preserve', skipLibCheck: true, types: [] },
        include: ['**/*'],
      }),
    );
    writeFileSync(
      path.join(root, 'example.astro'),
      '---\nconst value: string = "valid";\n---\n<p>{value}</p>',
    );
    writeFileSync(path.join(root, 'example.tsx'), 'export const value: string = "valid";');
    const valid = run();
    expect(valid.error).toBeUndefined();
    expect(valid.status).toBe(0);
    expect(valid.stdout).toContain('0 errors');

    writeFileSync(
      path.join(root, 'example.astro'),
      '---\nconst value: string = 123;\n---\n<p>{value}</p>',
    );
    writeFileSync(path.join(root, 'example.tsx'), 'export const value: string = 123;');
    const invalid = run();
    expect(invalid.error).toBeUndefined();
    expect(invalid.status).toBe(1);
    expect(invalid.stdout).toContain('example.astro');
    expect(invalid.stdout).toContain('example.tsx');
    expect(invalid.stdout).toContain('2 errors');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 60_000);
