```markdown
# Kextra Work / Kentra App Workflow

This document describes the simple workflow:

- "Kextra Work" = development working folder where you iterate and test changes:
  C:\Users\Administrator\Documents\Kextra Work

- "Kentra App" = release folder where you copy the final artifacts to distribute:
  C:\Users\Administrator\Documents\Kentra App

Files included:
- config/paths.json — default paths used by the scripts
- scripts/create_dirs.ps1 — PowerShell helper to create the two folders and write config
- scripts/release.js — Node script to copy/sync files from work -> release

How to prepare (one-time):
1. Place this repository files in:
   `C:\Users\Administrator\Documents\Kextra Tweaks`

2. Open PowerShell as Administrator (recommended) and run:
   ```
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\scripts\create_dirs.ps1
   ```
   This will create the folders defined in config/paths.json. You can pass different paths as parameters:
   ```
   .\scripts\create_dirs.ps1 -WorkDir "C:\Users\Administrator\Documents\Kextra Work" -ReleaseDir "C:\Users\Administrator\Documents\Kentra App"
   ```

How to produce a release (sync):
1. Build or prepare your release artifacts inside "Kextra Work".
2. From the project root (where scripts/release.js exists), run:
   ```
   node .\scripts\release.js
   ```
   The script will read config/paths.json and copy files from the work folder to the release folder.

3. To run with explicit paths:
   ```
   node .\scripts\release.js --src "C:\Users\Administrator\Documents\Kextra Work" --dest "C:\Users\Administrator\Documents\Kentra App"
   ```

Notes:
- The release script intentionally skips node_modules, .git, dist and out folders to avoid copying heavy or source-control metadata.
- It overwrites files in the destination with the same relative path.
- Verify the release folder contents after sync before distributing.
- For packaging an installer (NSIS/electron-builder) you can run your normal build pipeline inside the work folder and then sync the build artifacts to Kentra App; package from there if desired.

If you want, I can:
- Add a `release` script to package.json (example below) and commit the change.
- Add hashing or differential sync (rsync-style) to speed up repeated releases.
- Add an optional ZIP step that zips the release folder for distribution.

Example package.json script addition:
```json
"scripts": {
  "release:sync": "node ./scripts/release.js"
}
```

```