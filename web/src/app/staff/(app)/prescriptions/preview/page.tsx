import Image from "next/image";
import Link from "next/link";

export default function PrescriptionPreviewPage() {
  return (
    <>
      <main>

{/* Document Sidebar (Info Panels) */}
<aside className="hidden md:flex w-80 flex-col bg-surface-container-low p-8 gap-8 overflow-y-auto">
<div>
<span className="font-public-sans text-xs font-bold uppercase tracking-tighter text-outline mb-2 block">Patient Details</span>
<div className="bg-white p-6 space-y-4">
<div>
<p className="text-[10px] text-outline font-bold uppercase">Name</p>
<p className="text-sm font-semibold">Jonathan H. Miller</p>
</div>
<div>
<p className="text-[10px] text-outline font-bold uppercase">ID Number</p>
<p className="text-sm font-semibold">HMS-8829-01</p>
</div>
<div>
<p className="text-[10px] text-outline font-bold uppercase">Date of Issue</p>
<p className="text-sm font-semibold">October 24, 2023</p>
</div>
</div>
</div>
<div>
<span className="font-public-sans text-xs font-bold uppercase tracking-tighter text-outline mb-2 block">Clinical Context</span>
<div className="bg-white p-6">
<p className="text-[10px] text-outline font-bold uppercase mb-1">Diagnosis</p>
<p className="text-sm leading-relaxed">Chronic Hypertension Stage II with secondary implications of Type 2 Diabetes Mellitus.</p>
</div>
</div>
<div className="mt-auto">
<div className="bg-primary-fixed p-6 flex items-start gap-3">
<span className="material-symbols-outlined text-primary" data-icon="verified">verified</span>
<div>
<p className="text-[10px] text-on-primary-fixed-variant font-bold uppercase">Digital Signature</p>
<p className="text-xs font-medium">Verified by Dr. Sarah Chen</p>
</div>
</div>
</div>
</aside>
{/* PDF Viewer Canvas */}
<section className="flex-1 bg-surface-dim p-4 md:p-12 overflow-y-auto flex justify-center">
<div className="pdf-canvas bg-white w-full max-w-[816px] min-h-[1056px] p-16 flex flex-col relative">
{/* PDF Header */}
<div className="flex justify-between items-start mb-16">
<div>
<h2 className="text-lg font-bold uppercase tracking-[0.2em] mb-1">HMS Precision</h2>
<p className="text-[10px] text-outline tracking-wider font-semibold">UNIT 04 - CLINICAL CARE INFRASTRUCTURE</p>
</div>
<div className="text-right">
<p className="text-xs font-bold uppercase">Prescription No.</p>
<p className="text-sm font-medium">RX-2023-449102</p>
</div>
</div>
{/* Prescription Content */}
<div className="space-y-12">
{/* Patient & Doctor */}
<div className="grid grid-cols-2 gap-12">
<div className="space-y-4">
<h3 className="text-[10px] font-bold uppercase border-b-2 border-on-surface pb-1 w-fit">Practitioner</h3>
<div>
<p className="text-sm font-bold">Dr. Sarah Chen, MD</p>
<p className="text-xs text-outline">License: #99201-B</p>
<p className="text-xs text-outline">Internal Medicine</p>
</div>
</div>
<div className="space-y-4">
<h3 className="text-[10px] font-bold uppercase border-b-2 border-on-surface pb-1 w-fit">Recipient</h3>
<div>
<p className="text-sm font-bold">Jonathan H. Miller</p>
<p className="text-xs text-outline">DOB: 12/04/1978</p>
<p className="text-xs text-outline">Weight: 84kg</p>
</div>
</div>
</div>
{/* Medication List */}
<div className="space-y-6">
<h3 className="text-[10px] font-bold uppercase border-b-2 border-on-surface pb-1 w-fit">Prescribed Medication</h3>
<div className="space-y-8">
{/* Item 1 */}
<div className="flex gap-6 items-start">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="medical_services">medical_services</span>
<div className="flex-1">
<div className="flex justify-between items-baseline mb-1">
<p className="text-base font-bold">Lisinopril 20mg Tablet</p>
<p className="text-xs font-bold uppercase">Qty: 90 Days</p>
</div>
<p className="text-sm text-on-surface-variant italic mb-2">Sig: Take 1 tablet by mouth daily for hypertension.</p>
<div className="bg-surface-container-low p-3">
<p className="text-[10px] font-bold uppercase text-outline">Pharmacist Note</p>
<p className="text-xs">Do not discontinue abruptly. Monitor blood pressure weekly.</p>
</div>
</div>
</div>
{/* Item 2 */}
<div className="flex gap-6 items-start">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="medication">medication</span>
<div className="flex-1">
<div className="flex justify-between items-baseline mb-1">
<p className="text-base font-bold">Metformin HCl 500mg ER</p>
<p className="text-xs font-bold uppercase">Qty: 180 Tabs</p>
</div>
<p className="text-sm text-on-surface-variant italic mb-2">Sig: Take 2 tablets by mouth with dinner.</p>
<div className="bg-surface-container-low p-3">
<p className="text-[10px] font-bold uppercase text-outline">Pharmacist Note</p>
<p className="text-xs">Extended release formula. Do not crush or chew tablets.</p>
</div>
</div>
</div>
</div>
</div>
{/* Additional Instructions */}
<div className="bg-surface-container p-8">
<h3 className="text-[10px] font-bold uppercase mb-4 tracking-widest">Follow-up Protocols</h3>
<ul className="text-xs space-y-2 list-disc list-inside text-on-surface-variant">
<li>Repeat blood panel required in 30 days.</li>
<li>Monitor daily sodium intake below 2300mg.</li>
<li>Schedule next consultation for physical assessment.</li>
</ul>
</div>
</div>
{/* PDF Footer & Signature */}
<div className="mt-auto pt-16 flex justify-between items-end">
<div className="space-y-1">
<p className="text-[10px] font-bold uppercase text-outline">Date of Authorization</p>
<p className="text-xs font-medium">2023.10.24 — 14:32:00 GMT</p>
<div className="w-48 h-[1px] bg-outline-variant mt-8"></div>
<p className="text-[10px] font-bold uppercase text-outline mt-1">Hospital Stamp / Digital ID</p>
</div>
<div className="flex flex-col items-center">
<img alt="Doctor Signature" className="w-24 h-12 mix-blend-multiply opacity-80" data-alt="Stylized digital handwritten signature of a doctor in blue ink on a white paper background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2_WJCiHfQ1tH5s5AvN3gEYvHuuOAYGJ7RwnYAIqnTBQeAgFAIqNW2ks9Kw8qn5zvYC2IjHQ79efobopfnS39OwHemQbgNrpymLYIUqC651Qgy3fwWwhJSfKmc60uU4Z2olOYvy2Xo6NxGzGYHQa8t_AWNQruYrwJC7n762e7g0nZw4vScxD5i09VzQ8M377wk5sgRkxteJ1DiRAKzl7By_U9Bs2lt0yIq08J6gEPHmr-7Fu7VWiW_4nZa_O3IfsmOR-xWf-wUhw"/>
<div className="w-64 h-[1px] bg-on-surface mt-2"></div>
<p className="text-[10px] font-bold uppercase mt-2">Authorized Signatory: Sarah Chen, MD</p>
</div>
</div>
{/* Monochromatic Edge Marking */}
<div className="absolute right-0 top-0 h-full w-1 bg-primary"></div>
</div>
</section>
{/* Floating Action Tool (Contextual) */}
<div className="fixed bottom-8 right-8 flex flex-col gap-2">
<button className="w-12 h-12 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer active:opacity-80">
<span className="material-symbols-outlined text-neutral-600" data-icon="zoom_in">zoom_in</span>
</button>
<button className="w-12 h-12 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer active:opacity-80">
<span className="material-symbols-outlined text-neutral-600" data-icon="zoom_out">zoom_out</span>
</button>
<button className="w-12 h-12 bg-primary-container text-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer active:opacity-80">
<span className="material-symbols-outlined" data-icon="share" >share</span>
</button>
</div>

</main>
    </>
  );
}
