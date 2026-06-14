const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ?
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const baseDir = path.join(__dirname, 'src', 'app');

walkDir(baseDir, (filePath) => {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Check if it uses old hc-badge pattern
    const oldBadgeRegex = /<span\s+className="hc-badge[^>]+>([\s\S]*?)<\/span>/g;
    if (oldBadgeRegex.test(content)) {
      // Very basic heuristic for replacement
      content = content.replace(oldBadgeRegex, (match, innerText) => {
        // Try to infer tone from className
        let variant = "default";
        if (match.includes("hc-success")) variant = "success";
        else if (match.includes("hc-danger")) variant = "danger";
        else if (match.includes("hc-warning")) variant = "warning";
        else if (match.includes("hc-info")) variant = "info";
        else if (match.includes("hc-purple")) variant = "purple";
        else if (match.includes("hc-surface-soft")) variant = "secondary";

        return `<Badge variant="${variant}">${innerText}</Badge>`;
      });
      changed = true;
    }

    // Ensure Badge is imported if used
    if (content.includes('<Badge') && !content.includes('import { Badge }')) {
      const importRegex = /(import .* from .*[\r\n]+)/;
      content = content.replace(importRegex, `$1import { Badge } from "@/components/ui/badge";\n`);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated badges in ${filePath}`);
    }
  }
});
