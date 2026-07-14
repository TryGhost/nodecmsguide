// astro check runs on the Volar language server, which needs TypeScript's JS
// compiler API — removed in the native TypeScript 7 compiler. The check
// toolchain declares typescript@^5||^6 as a peer, so it would otherwise
// resolve the workspace's typescript@7 and crash at runtime.
//
// Until Astro supports TS 7 (https://github.com/withastro/roadmap/discussions/1321),
// give these packages their own TypeScript from the 6.x (JS) line, which
// Microsoft maintains in feature lockstep with 7.x.
const CHECK_TOOLCHAIN_PACKAGES = new Set(['@astrojs/check', '@volar/kit']);
const CHECK_TOOLCHAIN_TYPESCRIPT = '~6.0.3';

/**
 * @param {object} pkg - package manifest being resolved
 * @returns {object} the (possibly rewritten) manifest
 */
function readPackage(pkg) {
  if (CHECK_TOOLCHAIN_PACKAGES.has(pkg.name)) {
    delete pkg.peerDependencies?.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: CHECK_TOOLCHAIN_TYPESCRIPT };
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
