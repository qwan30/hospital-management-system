const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const appDir = path.join(__dirname, 'src', 'app');

function convertHtmlToJsx(html) {
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return null;
  let jsx = bodyMatch[1];

  // Escape all curly braces in HTML to avoid JSX parsing errors
  jsx = jsx.replace(/\{/g, '&#123;');
  jsx = jsx.replace(/\}/g, '&#125;');

  // Replace class= with className=
  jsx = jsx.replace(/class=/g, 'className=');
  // Replace for= with htmlFor=
  jsx = jsx.replace(/for=/g, 'htmlFor=');

  // Close unclosed tags (img, input, hr, br, col)
  jsx = jsx.replace(/<(img|input|hr|br|col)([^>]*?)(?<!\/)>/g, '<$1$2 />');

  // Replace inline styles (very naive, usually tailwind uses very few)
  // Let's hope there's no complex style="..."
  jsx = jsx.replace(/style="([^"]*)"/g, "");

  // HTML comments to JSX comments (now that we escaped {} from html text)
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Also stroke-width -> strokeWidth, fill-rule -> fillRule, stroke-linecap -> strokeLinecap
  jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
  jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
  jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
  jsx = jsx.replace(/clip-rule=/g, 'clipRule=');

  return jsx;
}

function processDirectory() {
  const folders = fs.readdirSync(frontendDir);
  let count = 0;
  for (const folder of folders) {
    if (!folder.includes('_ibm_style')) continue;

    const htmlPath = path.join(frontendDir, folder, 'code.html');
    if (!fs.existsSync(htmlPath)) continue;

    console.log(`Processing: ${folder}`);
    const html = fs.readFileSync(htmlPath, 'utf8');
    let jsxContent = convertHtmlToJsx(html);
    if (!jsxContent) continue;

    // create destination directory
    const targetDir = path.join(appDir, 'screens', folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const pageContent = `export default function ${folder.replace(/[^a-zA-Z]/g, '')}() {
  return (
    <div className="min-h-screen">
      ${jsxContent}
    </div>
  );
}
`;
    fs.writeFileSync(path.join(targetDir, 'page.tsx'), pageContent);
    count++;
  }
  console.log(`Successfully migrated ${count} screens to /app/screens/`);
}

processDirectory();
