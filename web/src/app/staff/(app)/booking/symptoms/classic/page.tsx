export default function BookingWizardSymptomsPage() {
  return (
    <div className="min-h-screen">

{/* Transactional TopBar: Simplified for focus */}
<nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl docked full-width top-0 sticky z-50 flex justify-between items-center w-full px-8 py-4 shadow-[0_7px_14px_0_rgba(50,50,93,0.1)]">
<div className="text-xl font-light tracking-tighter text-[#061B31] dark:text-white">
            Clinical Curator
        </div>
<div className="flex items-center gap-4">
<button className="text-sm font-medium text-secondary hover:text-primary transition-colors">Save Progress</button>
<div className="h-8 w-8 bg-surface-container-high rounded-full flex items-center justify-center">
<span className="material-symbols-outlined text-sm" data-icon="person">person</span>
</div>
</div>
</nav>
<main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
{/* Left Column: The Wizard */}
<div className="lg:col-span-8 space-y-12">
{/* Progress Stepper */}
<div className="flex items-center justify-between max-w-xl">
<div className="flex flex-col gap-2">
<div className="flex items-center gap-3">
<div className="h-8 w-8 rounded-full bg-primary-container text-white flex items-center justify-center text-sm font-semibold">1</div>
<span className="text-[#061B31] font-medium">Symptom Analysis</span>
</div>
<div className="h-1 bg-primary-container w-full rounded-full"></div>
</div>
<div className="flex flex-col gap-2 opacity-40">
<div className="flex items-center gap-3">
<div className="h-8 w-8 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center text-sm font-semibold">2</div>
<span className="text-secondary font-medium">Doctor Selection</span>
</div>
<div className="h-1 bg-surface-container-highest w-full rounded-full"></div>
</div>
<div className="flex flex-col gap-2 opacity-40">
<div className="flex items-center gap-3">
<div className="h-8 w-8 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center text-sm font-semibold">3</div>
<span className="text-secondary font-medium">Confirm Slot</span>
</div>
<div className="h-1 bg-surface-container-highest w-full rounded-full"></div>
</div>
</div>
{/* Intro Header */}
<header className="space-y-4">
<h1 className="text-5xl font-light tracking-[-1.4px] text-[#061B31]">How are you feeling <br/>today?</h1>
<p className="text-lg text-secondary max-w-lg">Our AI-assisted triage helps route you to the right specialist. Describe your symptoms as naturally as possible.</p>
</header>
{/* Form Content */}
<section className="space-y-10">
{/* Symptom Input Section */}
<div className="space-y-4">
<label className="text-[12px] uppercase tracking-[0.5px] font-semibold text-secondary">Describe Symptoms</label>
<div className="relative">
<textarea className="w-full min-h-[160px] p-6 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest transition-all resize-none text-lg text-on-surface" placeholder="e.g. Sharp pain in lower back after lifting heavy boxes yesterday..."></textarea>
<div className="absolute bottom-4 right-4 flex gap-2">
<span className="material-symbols-outlined text-secondary opacity-50" data-icon="mic">mic</span>
</div>
</div>
<div className="flex flex-wrap gap-2">
<span className="px-3 py-1 bg-surface-container-low text-secondary text-xs rounded-full cursor-pointer hover:bg-surface-container-highest transition-colors border border-outline-variant/10">#Headache</span>
<span className="px-3 py-1 bg-surface-container-low text-secondary text-xs rounded-full cursor-pointer hover:bg-surface-container-highest transition-colors border border-outline-variant/10">#Fever</span>
<span className="px-3 py-1 bg-surface-container-low text-secondary text-xs rounded-full cursor-pointer hover:bg-surface-container-highest transition-colors border border-outline-variant/10">#MuscleAche</span>
<span className="px-3 py-1 bg-surface-container-low text-secondary text-xs rounded-full cursor-pointer hover:bg-surface-container-highest transition-colors border border-outline-variant/10">#ShortnessOfBreath</span>
</div>
</div>
{/* Severity Selector */}
<div className="space-y-4">
<label className="text-[12px] uppercase tracking-[0.5px] font-semibold text-secondary">Intensity Level</label>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
<button className="group p-4 bg-surface-container-lowest rounded-lg text-center hover:bg-surface-container transition-all">
<div className="h-2 w-2 rounded-full bg-green-500 mx-auto mb-3"></div>
<span className="block text-xs font-semibold text-[#061B31]">MILD</span>
</button>
<button className="group p-4 bg-surface-container rounded-lg text-center ring-2 ring-primary-container">
<div className="h-2 w-2 rounded-full bg-yellow-500 mx-auto mb-3"></div>
<span className="block text-xs font-semibold text-[#061B31]">MODERATE</span>
</button>
<button className="group p-4 bg-surface-container-lowest rounded-lg text-center hover:bg-surface-container transition-all">
<div className="h-2 w-2 rounded-full bg-orange-500 mx-auto mb-3"></div>
<span className="block text-xs font-semibold text-[#061B31]">SEVERE</span>
</button>
<button className="group p-4 bg-surface-container-lowest rounded-lg text-center hover:bg-surface-container transition-all">
<div className="h-2 w-2 rounded-full bg-error mx-auto mb-3"></div>
<span className="block text-xs font-semibold text-[#061B31]">CRITICAL</span>
</button>
</div>
</div>
{/* AI Analysis Card */}
<div className="glass p-8 rounded-xl shadow-[0_7px_14px_0_rgba(50,50,93,0.1)] space-y-6 relative overflow-hidden">
<div className="absolute top-0 right-0 p-6 opacity-10">
<span className="material-symbols-outlined text-8xl" data-icon="neurology">neurology</span>
</div>
<div className="flex items-center gap-3">
<div className="flex items-center justify-center h-8 w-8 bg-primary-container/10 rounded-full">
<span className="material-symbols-outlined text-primary-container text-sm" data-icon="auto_awesome">auto_awesome</span>
</div>
<span className="text-sm font-semibold tracking-wide text-primary-container uppercase">Curator AI Analysis</span>
</div>
<div className="space-y-2">
<div className="flex items-center gap-2">
<h3 className="text-2xl font-light text-[#061B31]">Standard Guidance</h3>
<span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded">LOW URGENCY</span>
</div>
<p className="text-secondary leading-relaxed">Based on your description of "Lower back pain", we suggest a consultation with our <strong className="text-[#061B31]">Orthopedic Department</strong>. Symptoms do not currently suggest emergency intervention.</p>
</div>
<div className="flex gap-4 pt-2">
<div className="flex items-center gap-2 text-sm text-[#061B31]">
<span className="material-symbols-outlined text-primary-container" data-icon="medical_services">medical_services</span>
<span>Orthopedics</span>
</div>
<div className="flex items-center gap-2 text-sm text-[#061B31]">
<span className="material-symbols-outlined text-primary-container" data-icon="timer">timer</span>
<span>~15min Wait</span>
</div>
</div>
</div>
{/* CTA */}
<div className="flex items-center justify-between pt-6">
<button className="text-primary-container font-medium hover:underline px-4">Skip Analysis</button>
<button className="px-10 py-4 bg-primary-container text-white rounded-[4px] font-medium shadow-lg hover:shadow-primary-container/20 transition-all flex items-center gap-2">
<span>Select Specialist</span>
<span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</section>
</div>
{/* Right Column: Summary Sidebar */}
<div className="lg:col-span-4">
<aside className="sticky top-32 space-y-6">
<div className="bg-surface-container-low p-8 rounded-xl space-y-8">
<h2 className="text-[12px] uppercase tracking-[1px] font-bold text-secondary">Current Selection</h2>
<div className="space-y-6">
<div className="flex gap-4">
<div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-primary-container" data-icon="description">description</span>
</div>
<div>
<p className="text-xs text-secondary font-medium">SYMPTOM TRACK</p>
<p className="text-sm font-semibold text-[#061B31]">Lower Back Tension</p>
</div>
</div>
<div className="flex gap-4">
<div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-primary-container" data-icon="health_metrics">health_metrics</span>
</div>
<div>
<p className="text-xs text-secondary font-medium">INTENSITY</p>
<p className="text-sm font-semibold text-[#061B31]">Moderate (Level 4/10)</p>
</div>
</div>
<div className="flex gap-4">
<div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-primary-container" data-icon="account_balance">account_balance</span>
</div>
<div>
<p className="text-xs text-secondary font-medium">COVERAGE</p>
<p className="text-sm font-semibold text-[#061B31]">Pending Verification</p>
</div>
</div>
</div>
<div className="pt-6 border-t border-outline-variant/30">
<div className="flex items-center justify-between mb-4">
<span className="text-sm text-secondary">Est. Consultation Fee</span>
<span className="text-lg font-light text-[#061B31]">$120.00</span>
</div>
<p className="text-[10px] text-secondary leading-tight uppercase tracking-wider">Actual price determined by specialist and insurance provider upon check-in.</p>
</div>
</div>
<div className="relative rounded-xl overflow-hidden aspect-[4/3] shadow-lg group">
<img alt="Clinical environment" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" data-alt="Modern minimalist hospital reception area with soft sunlight, white marble textures, and high-end medical equipment in soft focus" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8RN_F8ZUw1EZO7qtVKpAtAWwJ95CqkShQkQHo-aOVLiULwJKphDSTamM9XLX5JjeDMAKGs-VMfDZDro5pTl6QMRrs2zeu6cRa5vBtelsecKB72qq1b6F5QW_1MjCEvPliZ0hN06n_EJBFdwR4X8_p0Ga6yEauH680D8fj951mJyQgU68x0Jm4KLtGZfDs-z2mWTnrBHcCpzX27nOWMH_bx3rr7hhCQrSmAbyEd-BuQfQuUKLTYZKYCuho2DH82RvIy9bunhXjSA"/>
<div className="absolute inset-0 bg-gradient-to-t from-[#061B31]/80 via-transparent to-transparent flex items-end p-6">
<div className="text-white">
<p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Our Facility</p>
<h4 className="text-lg font-light">St. Jude Medical Plaza</h4>
</div>
</div>
</div>
</aside>
</div>
</main>
<footer className="bg-[#f8f9ff] dark:bg-slate-950 border-t border-[#eff3ff] dark:border-slate-800 w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-4 mt-20">
<p className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D]">© 2024 Clinical Curator HMS. Editorial Excellence in Medicine.</p>
<div className="flex gap-8">
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] transition-colors" href="#">Privacy Policy</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] transition-colors" href="#">Terms of Service</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] transition-colors" href="#">Accessibility</a>
</div>
</footer>

    </div>
  );
}
