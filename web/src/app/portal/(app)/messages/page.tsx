import Image from "next/image";

export default function PatientMessagesPage() {
  return (
    <>
      <main>

{/* TopNavBar */}
<header className="bg-white dark:bg-neutral-950 flex justify-between items-center px-6 w-full max-w-none docked full-width top-0 h-16 transition-colors">
<div className="flex items-center gap-8">
<span className="text-lg font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">HMS Precision</span>
<nav className="hidden md:flex gap-6 items-center h-16">
<a className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 font-public-sans text-sm tracking-tight" href="#">Dashboard</a>
<a className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 font-public-sans text-sm tracking-tight" href="#">Patients</a>
<a className="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-semibold font-public-sans text-sm tracking-tight h-full flex items-center" href="#">Messages</a>
<a className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 font-public-sans text-sm tracking-tight" href="#">Schedule</a>
</nav>
</div>
<div className="flex items-center gap-4">
<div className="hidden lg:flex items-center bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 gap-2">
<span className="material-symbols-outlined text-neutral-500 text-sm" data-icon="search">search</span>
<input className="bg-transparent border-none text-xs focus:ring-0 w-48" placeholder="Search records..." type="text"/>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-neutral-600 cursor-pointer hover:bg-neutral-50" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined text-neutral-600 cursor-pointer hover:bg-neutral-50" data-icon="settings">settings</span>
<span className="material-symbols-outlined text-neutral-600 cursor-pointer hover:bg-neutral-50" data-icon="help">help</span>
<div className="w-8 h-8 bg-neutral-200 overflow-hidden ml-2">
<Image alt="User profile" className="w-full h-full object-cover" data-alt="professional portrait of a medical practitioner in a clinical setting with soft natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-8JQkL_viGHTunh86gLEWrRpL0iJC96lcT9o71Ijk4IcnH3yVQJYuGVuOa8tNcm93yAvZ-hs8uoLKD10hi84ipZ__gAMeGgT0ivpn9J2DXUi7cC1jG1vNFeCLjZslHwVxotqPs3KzItERYUk8lA-ylIxRbumoQxm24ksy1gJGFMSk9ZnankCTmauf-NqoRX9jB0pGz4jUYF4bPJM8z0bD-5nEXQlvv60ByuPnd0K6uQFjtXtWTXePvhQZcOOU3T81dkyLA1XB6A" width={1200} height={800}/>
</div>
</div>
</div>
</header>
{/* Message Interface (2-pane layout) */}
<div className="flex-1 flex overflow-hidden">
{/* Thread List (Left Pane: 4 cols equivalent) */}
<section className="w-1/3 min-w-[320px] bg-surface-container-low flex flex-col border-r border-transparent">
<div className="p-6 border-b border-surface-container-high bg-surface-container-low">
<div className="flex justify-between items-center mb-4">
<h3 className="font-headline font-bold text-lg tracking-tight">Inbox</h3>
<span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-fixed px-2 py-0.5">3 Unread</span>
</div>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" data-icon="filter_list">filter_list</span>
<input className="w-full pl-10 bg-white border-b-2 border-outline text-xs py-2 focus:border-primary transition-colors focus:ring-0" placeholder="Filter by sender or subject" type="text"/>
</div>
</div>
<div className="flex-1 overflow-y-auto">
{/* Message Item Active */}
<div className="p-6 bg-surface-container-lowest border-l-4 border-primary cursor-pointer">
<div className="flex justify-between items-start mb-2">
<span className="text-[10px] font-bold uppercase tracking-tighter text-primary">Dr. Alistair Vance</span>
<span className="text-[10px] text-neutral-500">10:42 AM</span>
</div>
<h4 className="font-headline font-semibold text-sm mb-1">Follow-up: Lab results review</h4>
<p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">I have reviewed your most recent blood panels from Tuesday. Everything looks significantly improved since our last...</p>
</div>
{/* Message Item Unread */}
<div className="p-6 hover:bg-surface-container transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="text-[10px] font-bold uppercase tracking-tighter text-neutral-900">Nurse Practitioner Sarah Chen</span>
<div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
</div>
<span className="text-[10px] text-neutral-500">Yesterday</span>
</div>
<h4 className="font-headline font-semibold text-sm mb-1">Prescription Renewal Confirmed</h4>
<p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">Your request for the Lisinopril renewal has been processed and sent to your preferred pharmacy at North Side...</p>
</div>
{/* Message Item */}
<div className="p-6 hover:bg-surface-container transition-colors cursor-pointer border-t border-surface-container-high/50">
<div className="flex justify-between items-start mb-2">
<span className="text-[10px] font-bold uppercase tracking-tighter text-neutral-500">System Administrator</span>
<span className="text-[10px] text-neutral-500">Oct 24</span>
</div>
<h4 className="font-headline font-semibold text-sm mb-1 text-neutral-500">Updated Privacy Terms</h4>
<p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">We have updated our patient data policy to reflect the new state guidelines. Please review the attached document...</p>
</div>
{/* Message Item */}
<div className="p-6 hover:bg-surface-container transition-colors cursor-pointer border-t border-surface-container-high/50">
<div className="flex justify-between items-start mb-2">
<span className="text-[10px] font-bold uppercase tracking-tighter text-neutral-500">Dr. Elena Rodriguez</span>
<span className="text-[10px] text-neutral-500">Oct 22</span>
</div>
<h4 className="font-headline font-semibold text-sm mb-1 text-neutral-500">Imaging Referral - MRI Shoulder</h4>
<p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">The referral for your shoulder imaging has been uploaded to the portal. You can now schedule this at any...</p>
</div>
</div>
</section>
{/* Message Preview (Right Pane: 8 cols equivalent) */}
<section className="flex-1 bg-surface flex flex-col">
{/* Header */}
<div className="p-10 border-b border-surface-container-high bg-white">
<div className="max-w-4xl">
<div className="flex items-center gap-2 mb-6">
<span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-100 text-neutral-600 px-2 py-0.5">Clinical Communication</span>
<span className="text-[10px] font-bold uppercase tracking-widest bg-surface-container-highest text-primary px-2 py-0.5">Priority</span>
</div>
<h1 className="font-headline font-light text-[3.5rem] leading-tight text-on-background tracking-tighter mb-8">Follow-up: Lab results review</h1>
<div className="flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="medical_services">medical_services</span>
</div>
<div>
<div className="flex items-center gap-2">
<h2 className="font-headline font-bold text-sm">Dr. Alistair Vance</h2>
<span className="text-xs text-neutral-400">•</span>
<span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Internal Medicine</span>
</div>
<p className="text-xs text-neutral-500 mt-0.5">Sent Oct 26, 2023 at 10:42 AM</p>
</div>
</div>
<div className="flex gap-2">
<button className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors">
<span className="material-symbols-outlined" data-icon="print">print</span>
</button>
<button className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors">
<span className="material-symbols-outlined" data-icon="archive">archive</span>
</button>
<button className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors">
<span className="material-symbols-outlined" data-icon="flag">flag</span>
</button>
</div>
</div>
</div>
</div>
{/* Message Body */}
<div className="flex-1 overflow-y-auto p-10 bg-white">
<div className="max-w-4xl space-y-8">
<div className="text-neutral-800 leading-[1.8] font-body text-base space-y-6">
<p>Dear Patient,</p>
<p>I have reviewed your most recent blood panels from Tuesday. Everything looks significantly improved since our last consultation in September. Specifically, your cholesterol levels have normalized, and the adjustments we made to your medication appear to be working effectively without causing significant side effects.</p>
<p>However, I noticed a slight deficiency in Vitamin D. I would like you to start a daily supplement of 2,000 IU. You can find this over-the-counter at any pharmacy. We will re-test this during your next scheduled physical in January.</p>
<p>Attached to this message is the full report for your records. If you have any immediate concerns regarding the new supplement, please reach out to the nurse's desk.</p>
<p>Best regards,<br/><span className="font-bold">Dr. Alistair Vance</span><br/>HMS Precision Medical Group</p>
</div>
{/* Data Monolith */}
<div className="mt-12 bg-surface-container-highest p-8 max-w-sm">
<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block mb-2">Patient ID Ref</span>
<div className="font-headline font-light text-3xl tracking-tighter text-on-background">PCU-992-04-X</div>
</div>
</div>
</div>
{/* Read Only Notice */}
<footer className="p-6 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
<div className="flex items-center gap-3 text-neutral-500">
<span className="material-symbols-outlined text-sm" data-icon="info">info</span>
<span className="text-[10px] font-bold uppercase tracking-widest">Messages are read-only</span>
</div>
<div className="text-[10px] text-neutral-400 italic">
                        To respond to this message, please schedule a virtual consultation or contact your care coordinator.
                    </div>
</footer>
</section>
</div>

</main>
    </>
  );
}
