const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "assets/node_modules");
const destDir = path.join(__dirname, "assets");

function findAndCopyFonts(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAndCopyFonts(fullPath);
    } else if (/\.(ttf|otf|woff2?)$/.test(entry.name)) {
      const dest = path.join(destDir, entry.name);
      fs.copyFileSync(fullPath, dest);
      console.log(`✅ Copied: ${entry.name}`);
    }
  }
}

findAndCopyFonts(sourceDir);
console.log("Done.");
