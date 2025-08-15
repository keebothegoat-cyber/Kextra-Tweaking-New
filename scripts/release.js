/**
 * release.js
 * Copy/sync from workDir -> releaseDir (non-destructive in releaseDir: it will replace files present in the release tree).
 *
 * Usage:
 *  node scripts/release.js
 *  node scripts/release.js --src "C:\Users\Administrator\Documents\Kextra Work" --dest "C:\Users\Administrator\Documents\Kentra App"
 *
 * Behavior:
 *  - Reads config/paths.json by default for source/destination
 *  - Skips node_modules, .git, and any paths in the ignore list
 *  - Copies files recursively, preserving structure
 *  - Overwrites files in destination with same relative path
 */

const fs = require('fs');
const path = require('path');

function readConfig() {
  const cfgPath = path.join(__dirname, '..', 'config', 'paths.json');
  try {
    const raw = fs.readFileSync(cfgPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--src' && args[i+1]) { out.src = args[++i]; }
    else if (a === '--dest' && args[i+1]) { out.dest = args[++i]; }
  }
  return out;
}

async function copyRecursive(src, dest, ignore = new Set()) {
  // ensure dest exists
  await fs.promises.mkdir(dest, { recursive: true });

  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // skip ignored names
    if (ignore.has(entry.name)) {
      // console.log(`Skipping ${srcPath} (ignored)`);
      continue;
    }

    try {
      if (entry.isDirectory()) {
        await copyRecursive(srcPath, destPath, ignore);
      } else if (entry.isFile()) {
        await fs.promises.copyFile(srcPath, destPath);
      } else if (entry.isSymbolicLink()) {
        // skip symlinks for safety
        continue;
      }
    } catch (err) {
      console.error(`Failed to copy ${srcPath} -> ${destPath}: ${err.message}`);
    }
  }
}

(async function main() {
  const cfg = readConfig();
  const cli = parseArgs();

  const src = cli.src || cfg.workDir || "C:\\Users\\Administrator\\Documents\\Kextra Work";
  const dest = cli.dest || cfg.releaseDir || "C:\\Users\\Administrator\\Documents\\Kentra App";

  // Safety checks
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    process.exit(2);
  }
  // Protect from accidental destructive copy (don't allow copying a dir into a subfolder of itself)
  const normalizedSrc = path.resolve(src);
  const normalizedDest = path.resolve(dest);
  if (normalizedDest.startsWith(normalizedSrc + path.sep)) {
    console.error('Destination is inside source. Aborting to avoid recursion/destruction.');
    process.exit(2);
  }

  console.log(`Syncing from:\n  ${src}\nTo:\n  ${dest}\n`);

  // default ignore list
  const ignoreSet = new Set(['node_modules', '.git', 'dist', 'out']);

  try {
    await copyRecursive(src, dest, ignoreSet);
    console.log('Sync complete.');
    process.exit(0);
  } catch (err) {
    console.error('Release sync failed:', err);
    process.exit(2);
  }
})();