import Image from "next/image";
import Link from "next/link";

export default function PatientLabResultsPage() {
  return (
    <>
      <main>

<div className="p-8 max-w-7xl mx-auto">
{/* Breadcrumbs & Header */}
<div className="mb-12">
<div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-widest mb-4">
<span>Patient Records</span>
<span className="material-symbols-outlined text-[12px]" data-icon="chevron_right">chevron_right</span>
<span>ID: #4492-AX</span>
<span className="material-symbols-outlined text-[12px]" data-icon="chevron_right">chevron_right</span>
<span className="text-primary-container">Laboratory Data</span>
</div>
<div className="flex justify-between items-end">
<div>
<h1 className="text-5xl font-light tracking-tight text-on-surface mb-2">Patient Lab Results</h1>
<p className="text-on-surface-variant font-medium">Record Updated: Oct 24, 2023 • 14:30 GMT</p>
</div>
<div className="flex gap-4">
<button className="bg-surface-container-high px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface hover:bg-surface-variant transition-colors">Export PDF</button>
<button className="bg-primary-container px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-white hover:bg-primary transition-colors">Request Retest</button>
</div>
</div>
</div>
{/* Bento Layout: Metrics Summary */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-12">
<div className="bg-surface-container-highest p-8">
<div className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">Critical Flags</div>
<div className="text-4xl font-light text-error">02</div>
<div className="text-[10px] font-bold text-on-error-container mt-2">Requires Immediate Review</div>
</div>
<div className="bg-surface-container p-8">
<div className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">Pending Tests</div>
<div className="text-4xl font-light text-on-surface">01</div>
<div className="text-[10px] font-bold text-outline mt-2">Expected within 12 Hours</div>
</div>
<div className="bg-surface-container-high p-8">
<div className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">Normal Ranges</div>
<div className="text-4xl font-light text-primary">14</div>
<div className="text-[10px] font-bold text-on-primary-fixed-variant mt-2">Within Baseline parameters</div>
</div>
<div className="bg-surface-container-low p-8 border-l border-surface-variant">
<div className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">Overall Status</div>
<div className="flex items-center gap-2">
<span className="w-2 h-2 bg-error"></span>
<span className="text-xl font-semibold uppercase tracking-tighter">Review Required</span>
</div>
<div className="text-[10px] font-bold text-outline mt-4">Physician: Dr. Aris Thorne</div>
</div>
</div>
{/* Lab Panels */}
<div className="space-y-12">
{/* Panel Section 01 */}
<section>
<h2 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-6 border-b border-surface-container-highest pb-2">Comprehensive Metabolic Panel (CMP)</h2>
<div className="space-y-1">
{/* Lab Row: Abnormal */}
<div className="group bg-surface-container-lowest hover:bg-surface-container-low transition-colors p-6 flex items-center">
<div className="w-1/3">
<div className="text-sm font-semibold text-on-surface">Glucose, Serum</div>
<div className="text-[10px] font-medium text-outline uppercase mt-1">Metabolic / Fasting</div>
</div>
<div className="w-1/4">
<div className="flex items-baseline gap-1">
<span className="text-2xl font-light text-error">126</span>
<span className="text-xs text-outline">mg/dL</span>
</div>
</div>
<div className="w-1/4">
<div className="text-xs font-medium text-on-surface-variant">Reference: 65 - 99 mg/dL</div>
</div>
<div className="flex-1 flex justify-end items-center gap-4">
<span className="bg-error-container text-error px-3 py-1 text-[10px] font-black uppercase tracking-tighter">High Result</span>
<span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary" data-icon="insights">insights</span>
</div>
</div>
{/* Lab Row: Normal */}
<div className="group bg-surface-container-lowest hover:bg-surface-container-low transition-colors p-6 flex items-center">
<div className="w-1/3">
<div className="text-sm font-semibold text-on-surface">Creatinine, Serum</div>
<div className="text-[10px] font-medium text-outline uppercase mt-1">Renal Function</div>
</div>
<div className="w-1/4">
<div className="flex items-baseline gap-1">
<span className="text-2xl font-light text-on-surface">0.92</span>
<span className="text-xs text-outline">mg/dL</span>
</div>
</div>
<div className="w-1/4">
<div className="text-xs font-medium text-on-surface-variant">Reference: 0.70 - 1.30 mg/dL</div>
</div>
<div className="flex-1 flex justify-end items-center gap-4">
<span className="bg-surface-container-high text-outline px-3 py-1 text-[10px] font-black uppercase tracking-tighter">Normal</span>
<span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary" data-icon="insights">insights</span>
</div>
</div>
{/* Lab Row: Pending */}
<div className="group bg-surface-container-lowest/50 p-6 flex items-center">
<div className="w-1/3">
<div className="text-sm font-semibold text-outline">Bilirubin, Total</div>
<div className="text-[10px] font-medium text-outline uppercase mt-1">Liver Function</div>
</div>
<div className="w-1/4">
<div className="flex items-center gap-2">
<span className="w-2 h-2 bg-primary-container animate-pulse"></span>
<span className="text-xs font-bold text-primary uppercase tracking-widest">Processing...</span>
</div>
</div>
<div className="w-1/4">
<div className="text-xs font-medium text-outline">Pending lab throughput</div>
</div>
<div className="flex-1 flex justify-end items-center gap-4">
<span className="material-symbols-outlined text-outline/30" data-icon="hourglass_empty">hourglass_empty</span>
</div>
</div>
</div>
</section>
{/* Panel Section 02 */}
<section>
<h2 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-6 border-b border-surface-container-highest pb-2">Hematology / CBC</h2>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-surface-variant">
{/* Detailed Card View 01 */}
<div className="bg-surface-container-lowest p-8 group">
<div className="flex justify-between items-start mb-6">
<div>
<h3 className="text-lg font-semibold text-on-surface">Hemoglobin (Hgb)</h3>
<p className="text-[10px] font-bold text-outline uppercase tracking-widest">Automated Cell Count</p>
</div>
<span className="material-symbols-outlined text-primary-container" data-icon="check_circle" >check_circle</span>
</div>
<div className="flex items-end gap-2 mb-8">
<div className="text-5xl font-light text-on-surface">14.2</div>
<div className="text-sm text-outline mb-1">g/dL</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-outline">
<span>Lower (13.5)</span>
<span>Upper (17.5)</span>
</div>
<div className="h-1 w-full bg-surface-container-high relative">
<div className="absolute top-0 bottom-0 left-[15%] right-[10%] bg-surface-dim"></div>
<div className="absolute top-[-4px] bottom-[-4px] left-[40%] w-1 bg-primary-container"></div>
</div>
</div>
</div>
{/* Detailed Card View 02 */}
<div className="bg-surface-container-lowest p-8 group">
<div className="flex justify-between items-start mb-6">
<div>
<h3 className="text-lg font-semibold text-on-surface">White Blood Cell (WBC)</h3>
<p className="text-[10px] font-bold text-outline uppercase tracking-widest">Leukocyte Count</p>
</div>
<span className="material-symbols-outlined text-error" data-icon="warning" >warning</span>
</div>
<div className="flex items-end gap-2 mb-8">
<div className="text-5xl font-light text-error">11.4</div>
<div className="text-sm text-outline mb-1">x10E3/uL</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-outline">
<span>Range (3.4 - 10.8)</span>
</div>
<div className="h-1 w-full bg-surface-container-high relative">
<div className="absolute top-0 bottom-0 left-[10%] right-[30%] bg-surface-dim opacity-50"></div>
<div className="absolute top-[-4px] bottom-[-4px] right-[10%] w-1 bg-error"></div>
</div>
<p className="text-[10px] text-error font-bold uppercase tracking-tighter mt-4">Elevated: Clinical correlation required.</p>
</div>
</div>
</div>
</section>
{/* Data Visual: Trend History */}
<section className="bg-surface-container-lowest p-10">
<div className="flex justify-between items-center mb-10">
<div>
<h2 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Metric Trend Analysis</h2>
<h3 className="text-2xl font-light tracking-tight">Serum Glucose Over 12 Months</h3>
</div>
<div className="flex gap-2">
<button className="w-8 h-8 flex items-center justify-center bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined text-sm" data-icon="arrow_back">arrow_back</span></button>
<button className="w-8 h-8 flex items-center justify-center bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span></button>
</div>
</div>
<div className="h-48 w-full flex items-end gap-px">
<div className="flex-1 bg-surface-container-low h-[60%] hover:bg-primary-container transition-colors relative group">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-on-surface text-white text-[10px] px-2 py-1">92 mg/dL</div>
</div>
<div className="flex-1 bg-surface-container-low h-[65%] hover:bg-primary-container transition-colors relative group"></div>
<div className="flex-1 bg-surface-container-low h-[58%] hover:bg-primary-container transition-colors relative group"></div>
<div className="flex-1 bg-surface-container-low h-[72%] hover:bg-primary-container transition-colors relative group"></div>
<div className="flex-1 bg-surface-container-low h-[85%] hover:bg-primary-container transition-colors relative group"></div>
<div className="flex-1 bg-surface-container-low h-[78%] hover:bg-primary-container transition-colors relative group"></div>
<div className="flex-1 bg-surface-container-low h-[90%] hover:bg-primary-container transition-colors relative group"></div>
<div className="flex-1 bg-surface-container-low h-[95%] hover:bg-primary-container transition-colors relative group"></div>
<div className="flex-1 bg-primary-container h-full relative group">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-error text-white text-[10px] px-2 py-1 font-bold">126 mg/dL</div>
</div>
</div>
<div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest text-outline">
<span>Jan 2023</span>
<span>May 2023</span>
<span>Oct 2023 (Current)</span>
</div>
</section>
</div>
{/* Footer Meta */}
<footer className="mt-16 py-8 border-t border-surface-container-highest flex justify-between items-center text-[10px] font-bold text-outline uppercase tracking-widest">
<div>Source: Central Diagnostics Laboratory (Facility #77-09)</div>
<div className="flex gap-8">
<a className="hover:text-primary transition-colors" href="#">Privacy Protocol</a>
<a className="hover:text-primary transition-colors" href="#">Audit Trail</a>
<a className="hover:text-primary transition-colors" href="#">Help Center</a>
</div>
</footer>
</div>

</main>
    </>
  );
}
