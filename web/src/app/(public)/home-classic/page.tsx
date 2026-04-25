export default function PublicHomePage() {
  return (
    <div className="min-h-screen">

{/* TopNavBar */}
<header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl docked full-width top-0 sticky z-50 no-border bg-[#eff3ff] dark:bg-slate-900 shadow-[0_7px_14px_0_rgba(50,50,93,0.1)]">
<div className="flex justify-between items-center w-full px-8 py-4">
<div className="text-xl font-light tracking-tighter text-[#061B31] dark:text-white">
                Clinical Curator
            </div>
<nav className="hidden md:flex items-center space-x-8">
<a className="text-[#64748D] hover:text-[#061B31] transition-colors font-['Inter'] font-light tracking-[-0.5px]" href="#">Services</a>
<a className="text-[#64748D] hover:text-[#061B31] transition-colors font-['Inter'] font-light tracking-[-0.5px]" href="#">Find a Doctor</a>
<a className="text-[#64748D] hover:text-[#061B31] transition-colors font-['Inter'] font-light tracking-[-0.5px]" href="#">Patient Portal</a>
<a className="text-[#64748D] hover:text-[#061B31] transition-colors font-['Inter'] font-light tracking-[-0.5px]" href="#">About Us</a>
</nav>
<div className="flex items-center gap-4">
<button className="bg-[#533AFD] text-white px-6 py-2 rounded-[4px] hover:bg-[#3904e7] transition-all duration-200 scale-95 hover:scale-100 font-medium">
                    Book Appointment
                </button>
</div>
</div>
</header>
<main>
{/* Hero Section */}
<section className="relative pt-24 pb-32 px-8 max-w-7xl mx-auto overflow-hidden">
<div className="grid lg:grid-cols-2 gap-16 items-center">
<div className="z-10">
<span className="label-caps text-primary-container font-semibold mb-6 block">Reimagining Healthcare</span>
<h1 className="editorial-headline text-5xl md:text-7xl text-on-surface mb-8 leading-[1.1]">
                        The Future of Care, <br/><span className="text-primary-container">Curated for You</span>
</h1>
<p className="text-secondary text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
                        Experience clinical excellence through a lens of modern design and personalized precision. Our health system is built for the sophisticated patient.
                    </p>
<div className="flex flex-col sm:flex-row gap-4">
<button className="bg-gradient-to-br from-[#3904e7] to-[#533AFD] text-white px-8 py-4 rounded-[4px] font-medium shadow-lg hover:shadow-xl transition-all">
                            Book Appointment
                        </button>
<button className="text-primary-container px-8 py-4 rounded-[4px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors">
                            Explore Services
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
<div className="relative">
<div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
<img alt="Modern Medical Environment" className="object-cover w-full h-full" data-alt="Minimalist modern hospital lobby with soft natural light streaming through large windows, clean white architectural lines and lush indoor plants" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2szdEd8MIYtx28wKbjqRr4nKfpTSBj9gbZmMau7WOngiE_SQM8BVB3dmcfSXsdUhNB5U1IxqP62vll_GUMJA_9vypLkryiHd4hBBI_b99vJx_KHypPdW7lvYF-NZ365I9FHQA6sJfOS9XHctkcsrRZ5L-8k1ZMNdxM1BCjMHJQY3qD3q0Sa74C-N3CvJjQFm4TxSNTTpd40P4qhSwCBpxqNLFlyFLGc1RY2VNx7aduqUf7Kz8YarWP3ThIBgvfeap4xdUgmQAuQ"/>
{/* Floating Glass Metric Card */}
<div className="glass-overlay absolute bottom-8 left-8 p-6 rounded-xl shadow-xl border border-white/20 max-w-[240px]">
<div className="flex items-center gap-3 mb-2">
<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
<span className="label-caps text-on-surface">Live Network Status</span>
</div>
<div className="text-2xl font-light tracking-tight text-on-surface">99.8% Recovery Rate</div>
<div className="mt-4 h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="bg-primary-container h-full w-[99.8%]"></div>
</div>
</div>
</div>
{/* Decorative Background Element */}
<div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl -z-10"></div>
</div>
</div>
</section>
{/* Trust Strip */}
<section className="bg-surface-container-low py-12 px-8">
<div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
<span className="label-caps font-bold text-on-surface-variant">Accredited By</span>
<div className="flex items-center gap-2 font-['Inter'] font-bold text-lg tracking-tighter">
<span className="material-symbols-outlined text-primary-container">verified_user</span> JCI ACCREDITED
                </div>
<div className="flex items-center gap-2 font-['Inter'] font-bold text-lg tracking-tighter">
<span className="material-symbols-outlined text-primary-container">workspace_premium</span> ISO 9001:2015
                </div>
<div className="flex items-center gap-2 font-['Inter'] font-bold text-lg tracking-tighter">
<span className="material-symbols-outlined text-primary-container">clinical_notes</span> MAYO NETWORK
                </div>
<div className="flex items-center gap-2 font-['Inter'] font-bold text-lg tracking-tighter">
<span className="material-symbols-outlined text-primary-container">health_and_safety</span> WHO PARTNER
                </div>
</div>
</section>
{/* Featured Departments (Bento Style) */}
<section className="py-24 px-8 max-w-7xl mx-auto">
<div className="mb-16">
<span className="label-caps text-primary-container font-semibold mb-4 block">Specializations</span>
<h2 className="editorial-headline text-4xl text-on-surface">Departmental Excellence</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
{/* Cardiology */}
<div className="group bg-surface-container-lowest p-10 rounded-xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(50,50,93,0.06)] flex flex-col justify-between aspect-square md:aspect-auto h-[400px]">
<div>
<div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center mb-8 group-hover:bg-primary-container group-hover:text-white transition-colors duration-300">
<span className="material-symbols-outlined" data-icon="cardiology">cardiology</span>
</div>
<h3 className="text-2xl font-light mb-4">Cardiology</h3>
<p className="text-secondary leading-relaxed">Advanced cardiac imaging and non-invasive procedures led by world-class specialists.</p>
</div>
<a className="text-primary-container font-medium inline-flex items-center gap-2 group/link" href="#">
                        View Unit
                        <span className="material-symbols-outlined text-sm transition-transform group-hover/link:translate-x-1">arrow_forward</span>
</a>
</div>
{/* Oncology */}
<div className="group bg-surface-container-low p-10 rounded-xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(50,50,93,0.06)] flex flex-col justify-between aspect-square md:aspect-auto h-[400px]">
<div>
<div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center mb-8 group-hover:bg-primary-container group-hover:text-white transition-colors duration-300">
<span className="material-symbols-outlined" data-icon="biotech">biotech</span>
</div>
<h3 className="text-2xl font-light mb-4">Oncology</h3>
<p className="text-secondary leading-relaxed">Precision medicine and personalized treatment protocols using genomic insights.</p>
</div>
<a className="text-primary-container font-medium inline-flex items-center gap-2 group/link" href="#">
                        View Unit
                        <span className="material-symbols-outlined text-sm transition-transform group-hover/link:translate-x-1">arrow_forward</span>
</a>
</div>
{/* Neurology */}
<div className="group bg-surface-container-lowest p-10 rounded-xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(50,50,93,0.06)] flex flex-col justify-between aspect-square md:aspect-auto h-[400px]">
<div>
<div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center mb-8 group-hover:bg-primary-container group-hover:text-white transition-colors duration-300">
<span className="material-symbols-outlined" data-icon="neurology">neurology</span>
</div>
<h3 className="text-2xl font-light mb-4">Neurology</h3>
<p className="text-secondary leading-relaxed">State-of-the-art neuro-surgical suites and dedicated recovery environments.</p>
</div>
<a className="text-primary-container font-medium inline-flex items-center gap-2 group/link" href="#">
                        View Unit
                        <span className="material-symbols-outlined text-sm transition-transform group-hover/link:translate-x-1">arrow_forward</span>
</a>
</div>
</div>
</section>
{/* Featured Doctors */}
<section className="py-24 bg-surface-container-low">
<div className="max-w-7xl mx-auto px-8">
<div className="flex justify-between items-end mb-16">
<div>
<span className="label-caps text-primary-container font-semibold mb-4 block">Medical Faculty</span>
<h2 className="editorial-headline text-4xl text-on-surface">Eminent Practitioners</h2>
</div>
<button className="hidden md:flex text-secondary font-medium items-center gap-2 hover:text-on-surface transition-colors">
                        All Faculty <span className="material-symbols-outlined">expand_more</span>
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
{/* Dr 1 */}
<div className="group">
<div className="aspect-[4/5] bg-surface rounded-lg mb-6 overflow-hidden relative">
<img alt="Dr. Julian Vane" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Professional portrait of a male doctor in his 40s with a kind expression, wearing a white coat, clean studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7LAjauNBwXFwsIztm9fYJ9tW_UFTBDJ6EzK0ICkJ57Es8H9cxuoddL9HTtQHJyq3p7poW9aMm5PRGHkija30U2BT5zxjpVDjLxA4lDJfYWwAmeuhPUy5NZnMSO3zKLoIKB6C866BIVTaiKMYgpYoeq5qxCblMC3CjFQgoulnu5WBm1A6zbgW90RQ2qC4BVvKDITJ1n6kRznAQKUkXxFLMhBId2obxy2tmU0DNAkDDT6-ypa0w8kxtrPZgijx56_FBVOnQJdV2gQ"/>
<div className="absolute inset-0 bg-primary-container/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
</div>
<h4 className="text-lg font-medium text-on-surface">Dr. Julian Vane</h4>
<p className="text-sm text-secondary uppercase tracking-wider mb-2">Chief of Cardiology</p>
<p className="text-xs text-on-surface-variant italic">Harvard Medical Alumni</p>
</div>
{/* Dr 2 */}
<div className="group">
<div className="aspect-[4/5] bg-surface rounded-lg mb-6 overflow-hidden relative">
<img alt="Dr. Elena Rossi" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Professional portrait of a female doctor with dark hair tied back, confident smile, clinical setting with soft depth of field" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzrW_7_xVECeVvr12j_GeaxdqFxZon7VUe8P9ObczOSoGjj9umrF-Ufq7MvJ5TlBC1nZWTZK_72S_t9ItdgMty6CCo_P7Jr2Eoej9raXW8FwkqmlTWONmw_KDSAdR2J05ZT8P9o8KM1jtCC3KxZMw2txA61IjtAYyzZscS61XizzZ8fx1rLRo9S-2kwGTYhh-6onWU7IW8GQgszfwWaz-6zb5eRQmATq8csuVPvNVZuKoGDr2MLT7KElI5k60Y-rtoW3hekfuk3A"/>
<div className="absolute inset-0 bg-primary-container/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
</div>
<h4 className="text-lg font-medium text-on-surface">Dr. Elena Rossi</h4>
<p className="text-sm text-secondary uppercase tracking-wider mb-2">Neurosurgeon</p>
<p className="text-xs text-on-surface-variant italic">Johns Hopkins Fellow</p>
</div>
{/* Dr 3 */}
<div className="group">
<div className="aspect-[4/5] bg-surface rounded-lg mb-6 overflow-hidden relative">
<img alt="Dr. Marcus Thorne" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Close-up of a middle-aged male physician with glasses, professional gaze, modern hospital office in background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtVdS20Wbu3ANt7XHVM8SeQ5VwdcXnF8ghG1GvrJdpxuGiF8p7Z0g9-TdgzJCaNx9fDoCs8BwOaho8abRKKsQBuI7p_JmGMQgxnw5P9W_juvHdg6YPsTutlTvzp-iwOG4uGbzI2w242lKcXup_T8sBzHdkM34D3oud0IYQxEZjnEutR0tVvRpnH3PQBx8B1HyZUvfsPLvdV50TgBDSO5nfLyb0RAEosfLfAHkwHyw9ERTT1JM8v1FcXNqOpUx8mjnxZ79oFLAd1w"/>
<div className="absolute inset-0 bg-primary-container/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
</div>
<h4 className="text-lg font-medium text-on-surface">Dr. Marcus Thorne</h4>
<p className="text-sm text-secondary uppercase tracking-wider mb-2">Oncology Director</p>
<p className="text-xs text-on-surface-variant italic">Oxford Medical School</p>
</div>
{/* Dr 4 */}
<div className="group">
<div className="aspect-[4/5] bg-surface rounded-lg mb-6 overflow-hidden relative">
<img alt="Dr. Sarah Jenkins" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Young female doctor in scrubs with stethoscope, smiling, bright and airy clinical room background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1av2Fjubd1_aazfBDkvSmxDex8mOVAAHd_piATDxsWtVi_g3SJ3GqKh8r4gFnHXfw0UxrKGJmdYJGKP2nwWEQkKWaM6DKB_WMUTUOYrGOvrGuRU4nXJFw4XX1HlK11pbLKplnaVHNkZ6aKm2u02WX1YnNNFben4o96Wc460eGWfQc5KFN5ROPi-d7rGVoKWxLcMJoVlwsa5ht9XfEF2fdK05B385fM5aS31v89T5ENzJMFfsil6xz8CSrJn5Y0F7zN4HxdmGlEA"/>
<div className="absolute inset-0 bg-primary-container/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
</div>
<h4 className="text-lg font-medium text-on-surface">Dr. Sarah Jenkins</h4>
<p className="text-sm text-secondary uppercase tracking-wider mb-2">Internal Medicine</p>
<p className="text-xs text-on-surface-variant italic">Stanford University</p>
</div>
</div>
</div>
</section>
{/* CTA Canvas */}
<section className="py-24 px-8 max-w-7xl mx-auto">
<div className="bg-gradient-to-r from-[#061B31] to-[#130067] rounded-2xl p-12 md:p-24 text-center relative overflow-hidden">
<div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
<path d="M0 100 C 20 0 50 0 100 100" fill="transparent" stroke="white" strokeWidth="0.5"></path>
</svg>
</div>
<h2 className="editorial-headline text-4xl md:text-5xl text-white mb-8 relative z-10">Experience the Curated Difference</h2>
<p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto relative z-10">Our patient advisors are ready to help you navigate your clinical journey. Secure your appointment today.</p>
<div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
<button className="bg-[#533AFD] text-white px-10 py-5 rounded-[4px] text-lg font-medium hover:bg-[#3904e7] transition-all transform hover:-translate-y-1">
                        Book Appointment
                    </button>
<button className="bg-white/10 text-white backdrop-blur-md px-10 py-5 rounded-[4px] text-lg font-medium hover:bg-white/20 transition-all">
                        Contact Concierge
                    </button>
</div>
</div>
</section>
</main>
{/* Footer */}
<footer className="bg-[#f8f9ff] dark:bg-slate-950 full-width border-t border-[#eff3ff] dark:border-slate-800">
<div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-4">
<div className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D]">
                © 2024 Clinical Curator HMS. Editorial Excellence in Medicine.
            </div>
<div className="flex flex-wrap justify-center gap-8">
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] dark:hover:text-white transition-colors" href="#">Privacy Policy</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] dark:hover:text-white transition-colors" href="#">Terms of Service</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] dark:hover:text-white transition-colors" href="#">Cookie Settings</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] dark:hover:text-white transition-colors" href="#">Accessibility</a>
</div>
</div>
</footer>

    </div>
  );
}
