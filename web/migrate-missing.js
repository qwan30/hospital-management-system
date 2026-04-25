const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const appDir = path.join(__dirname, 'src', 'app');

function convertHtmlToJsx(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return null;
  let jsx = bodyMatch[1];

  // Escape curly braces
  jsx = jsx.replace(/\{/g, '&#123;');
  jsx = jsx.replace(/\}/g, '&#125;');

  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');

  jsx = jsx.replace(/<(img|input|hr|br|col)([^>]*?)(?<!\/)>/g, '<$1$2 />');

  jsx = jsx.replace(/style="([^"]*)"/g, "");

  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
  jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
  jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
  jsx = jsx.replace(/clip-rule=/g, 'clipRule=');

  return jsx;
}

const mappings = [
  { folder: 'booking_wizard_symptoms', targetRoute: 'staff/(app)/booking/symptoms/classic' },
  { folder: 'doctor_dashboard', targetRoute: 'staff/(app)/doctor/dashboard/classic' },
  { folder: 'patient_portal_overview', targetRoute: 'portal/(app)/overview/classic' },
  { folder: 'public_home', targetRoute: '(public)/home-classic' },
  { folder: 'staff_login', targetRoute: 'staff/(auth)/login/classic' }
];

let count = 0;
for (const mapping of mappings) {
  const htmlPath = path.join(frontendDir, mapping.folder, 'code.html');
  if (!fs.existsSync(htmlPath)) {
    console.log(`Not found: ${htmlPath}`);
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const jsxContent = convertHtmlToJsx(html);
  if (!jsxContent) continue;

  const targetDir = path.join(appDir, mapping.targetRoute);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const componentName = mapping.folder.split('_').map(w=>w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const pageContent = `export default function ${componentName}Page() {
  return (
    <div className="min-h-screen">
      ${jsxContent}
    </div>
  );
}
`;
  fs.writeFileSync(path.join(targetDir, 'page.tsx'), pageContent);
  console.log(`Generated: ${path.join(targetDir, 'page.tsx')}`);
  count++;
}
console.log(`Successfully migrated ${count} missing screens.`);
