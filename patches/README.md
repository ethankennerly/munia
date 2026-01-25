# Patches

## next-intl@4.7.0

Adds `/* webpackIgnore: true */` to the dynamic `import(t)` in
`dist/esm/production/extractor/format/index.js` (custom codec path).

**Reason:** Webpack's FileSystemInfo cannot statically resolve that import for
cache dependency tracking and emits: "Parsing … for build dependencies failed
at 'import(t)'". The magic comment prevents webpack from parsing it, removing
the warning. Runtime behavior is unchanged.

**Remove when:** next-intl fixes this upstream (e.g. adds webpackIgnore in their
source); then delete this patch and run `npx patch-package` to regenerate only
if other patches remain, or drop patch-package from postinstall and
devDependencies if none remain.
