const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const appDir = path.join(__dirname, 'src', 'app');

const routeMap = {
  'admin_audit_logs_ibm_style': 'admin/(app)/audit-logs/page.tsx',
  'admin_departments_ibm_style': 'admin/(app)/departments/page.tsx',
  'admin_knowledge_documents_ibm_style': 'admin/(app)/knowledge/page.tsx',
  'admin_monitoring_ibm_style': 'admin/(app)/monitoring/page.tsx',
  'admin_news_ibm_style': 'admin/(app)/news/page.tsx',
  'admin_public_content_ibm_style': 'admin/(app)/public-content/page.tsx',
  'admin_rooms_ibm_style': 'admin/(app)/rooms/page.tsx',
  'admin_user_detail_edit_ibm_style': 'admin/(app)/users/[id]/page.tsx',
  'booking_details_review_ibm_style': 'staff/(app)/booking/review/page.tsx',
  'booking_doctor_slot_selection_ibm_style': 'staff/(app)/booking/slots/page.tsx',
  'booking_wizard_symptoms_ibm_style': 'staff/(app)/booking/symptoms/page.tsx',
  'booking_success_ibm_style': 'staff/(app)/booking/success/page.tsx',
  'doctor_dashboard_ibm_style': 'staff/(app)/doctor/dashboard/page.tsx',
  'doctor_detail_ibm_style': 'staff/(app)/doctor/[id]/page.tsx',
  'internal_assistant_ibm_style': 'staff/(app)/assistant/page.tsx',
  'inventory_ibm_style': 'staff/(app)/inventory/page.tsx',
  'invoices_ibm_style': 'staff/(app)/invoices/page.tsx',
  'nurse_intake_board_ibm_style': 'staff/(app)/nurse-intake/page.tsx',
  'queue_board_ibm_style': 'staff/(app)/queue/page.tsx',
  'revenue_dashboard_ibm_style': 'staff/(app)/revenue/page.tsx',
  'schedule_templates_ibm_style': 'staff/(app)/schedule/page.tsx',
  'special_closures_ibm_style': 'staff/(app)/closures/page.tsx',
  'vital_signs_editor_ibm_style': 'staff/(app)/vital-signs/page.tsx',
  'lab_result_detail_ibm_style': 'staff/(app)/lab-results/[id]/page.tsx',
  'prescription_preview_ibm_style': 'staff/(app)/prescriptions/preview/page.tsx',
  'pricing_management_ibm_style': 'staff/(app)/pricing/page.tsx',
  'medical_record_editor_ibm_style': 'staff/(app)/medical-records/[id]/edit/page.tsx',
  'slot_generation_ibm_style': 'staff/(app)/slots/page.tsx',
  'staff_login_ibm_style': 'staff/(auth)/login/page.tsx',
  'patient_appointments_ibm_style_1': 'portal/(app)/appointments/page.tsx',
  'patient_appointments_ibm_style_2': 'portal/(app)/appointments/2/page.tsx',
  'patient_claim_access_ibm_style': 'portal/(app)/claim/page.tsx',
  'patient_lab_results_ibm_style': 'portal/(app)/lab-results/page.tsx',
  'patient_messages_ibm_style': 'portal/(app)/messages/page.tsx',
  'patient_portal_overview_ibm_style': 'portal/(app)/overview/page.tsx',
  'patient_portal_profile_ibm_style': 'portal/(app)/profile/page.tsx',
  'patient_record_browser_ibm_style': 'portal/(app)/records/page.tsx',
  'public_home_ibm_style_1': '(public)/page.tsx',
  'public_home_ibm_style_2': '(public)/home-variant/page.tsx',
  'public_departments_ibm_style_1': '(public)/departments/page.tsx',
  'public_departments_ibm_style_2': '(public)/departments/variant/page.tsx',
  'department_detail_ibm_style_1': '(public)/departments/[id]/page.tsx',
  'department_detail_ibm_style_2': '(public)/departments/[id]/variant/page.tsx',
  'public_doctors_ibm_style_1': '(public)/doctors/page.tsx',
  'public_doctors_ibm_style_2': '(public)/doctors/variant/page.tsx',
  'news_list_ibm_style': '(public)/news/page.tsx',
  'session_expired_ibm_style': '(public)/session-expired/page.tsx'
};

function convertHtmlToJsx(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return null;
  let bodyContent = bodyMatch[1];

  let layoutContent = bodyContent;
  const mainMatch = bodyContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    layoutContent = `<main>\n${mainMatch[1]}\n</main>`;
  } else {
    layoutContent = layoutContent.replace(/<header[\s\S]*?<\/header>/ig, '');
    layoutContent = layoutContent.replace(/<aside[\s\S]*?<\/aside>/ig, '');
    layoutContent = layoutContent.replace(/<!-- TopNavBar Shell -->[\s\S]*?<\/header>/ig, '');
    layoutContent = layoutContent.replace(/<!-- SideNavBar Shell -->[\s\S]*?<\/aside>/ig, '');
    layoutContent = `<div className="w-full flex-grow">\n${layoutContent}\n</div>`;
  }

  let jsx = layoutContent;

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
  jsx = jsx.replace(/preserveaspectratio=/ig, 'preserveAspectRatio=');
  jsx = jsx.replace(/tabindex=/ig, 'tabIndex=');
  jsx = jsx.replace(/autocomplete=/ig, 'autoComplete=');

  // React integer types
  jsx = jsx.replace(/rows="(\d+)"/g, 'rows={$1}');
  jsx = jsx.replace(/colspan="(\d+)"/ig, 'colSpan={$1}');
  jsx = jsx.replace(/rowspan="(\d+)"/ig, 'rowSpan={$1}');

  // Booleans and default selections
  jsx = jsx.replace(/checked=""/g, 'defaultChecked');
  jsx = jsx.replace(/selected=""/g, ''); // Fix: instead of breaking <option selected>, just remove it
  jsx = jsx.replace(/disabled=""/g, 'disabled');
  jsx = jsx.replace(/readonly=""/ig, 'readOnly');
  jsx = jsx.replace(/required=""/ig, 'required');
  jsx = jsx.replace(/open=""/ig, 'open');

  return jsx;
}

function processDirectory() {
  const folders = fs.readdirSync(frontendDir);
  let count = 0;

  for (const folder of folders) {
    if (!folder.includes('_ibm_style')) continue;

    const htmlPath = path.join(frontendDir, folder, 'code.html');
    if (!fs.existsSync(htmlPath)) continue;

    const destRoute = routeMap[folder];
    if (!destRoute) continue;

    console.log(`Migrating: ${folder} -> ${destRoute}`);
    const html = fs.readFileSync(htmlPath, 'utf8');
    let jsxContent = convertHtmlToJsx(html);
    if (!jsxContent) continue;

    const targetFilePath = path.join(appDir, destRoute);
    const targetDir = path.dirname(targetFilePath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const componentName = folder.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('').replace('IbmStyle', '').replace(/[\d_.]/g, '') + 'Page';

    const pageContent = `import Image from "next/image";
import Link from "next/link";

export default function ${componentName}() {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;
    fs.writeFileSync(targetFilePath, pageContent);
    count++;
  }
  console.log(`Successfully migrated ${count} components to role-based routes.`);
}

processDirectory();
