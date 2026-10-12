import { check, parseArgsAsCheckConfig } from '@astrojs/check';

// Resolve the checker from this workspace so it uses its TypeScript 6 peer.
// Astro's CLI checks the app's TypeScript version before loading the checker.
const result = await check(parseArgsAsCheckConfig(process.argv));
if (typeof result === 'boolean') {
  process.exitCode = result ? 1 : 0;
}
