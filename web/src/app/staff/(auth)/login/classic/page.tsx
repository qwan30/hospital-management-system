export default function StaffLoginPage() {
  return (
    <div className="min-h-screen">

{/* Brand Panel (Left) */}
<section className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 bg-gradient-to-br from-primary to-primary-container overflow-hidden">
{/* Abstract Background Texture */}
<div className="absolute inset-0 opacity-20 pointer-events-none">
<img className="w-full h-full object-cover mix-blend-overlay" data-alt="Modern clinical architecture with glass and steel, cool blue tones, high-tech hospital environment lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9VGs6vf_XF0PNPty7ViDxFvUrHyEYNZRbR8DJUsilQtdzB6ePFOwjn7R5iq3vKS70BWAqTvEuVkH2no5ICTM6pMQMTgVfaWvQAk-6Y1eTGO-WoRGU1-llPrY3dVLvW2_ig00sxUXNQ0g3uwGlPJ43OhDw5puaQijQ9wpW5NE1Tfs68gKRSkHMS9GxM-2eX6UHbw7IWLt7aq0iAJVZAaVymQeYyx1Tel3oj4FmfZfTfNoZxxou5dnu1H2nVVKgPmLCvs2tq-lvrw"/>
</div>
{/* Logo/Brand Identity */}
<div className="relative z-10">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
<span className="material-symbols-outlined text-white" data-icon="clinical_notes">clinical_notes</span>
</div>
<h1 className="text-2xl font-light tracking-[-1.4px] text-white">Clinical Curator</h1>
</div>
</div>
{/* Hero Content */}
<div className="relative z-10 max-w-md">
<h2 className="editorial-headline text-5xl text-white mb-8 leading-tight">Editorial Excellence in Medicine.</h2>
{/* Secure Note Card (Glassmorphism) */}
<div className="glass-panel p-8 rounded-xl border border-white/10 shadow-2xl">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-white/70 text-sm" data-icon="verified_user">verified_user</span>
<span className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-white/70">Secure Environment</span>
</div>
<p className="text-white/80 leading-relaxed text-sm font-light">
                    This portal is restricted to authorized medical personnel. All sessions are encrypted and monitored to ensure HIPPA compliance and patient data integrity.
                </p>
<div className="mt-6 flex items-center gap-4">
<div className="flex -space-x-2">
<img className="w-8 h-8 rounded-full border-2 border-primary-container" data-alt="Portrait of a professional doctor in clinical attire, soft focus background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6ePrOyXh0y7IqphJvf90NIW_iykUM4VFavz-W7dSW2zqO0RACnOWJqZ9YtY1zDlO3D-A4ikWQrlu8t0xuIwOYu3oUpcctw-44xdBw2ns6V_8WNjqZ_nor63xa_9I8nEfvXgek6cVB-vC-3nfinc5fjo1hRH5tWyWzOKQ5RFzamAXN-re04QHtob_gugAHfu_W_KfxaWpzcb4VTK6EjaOze0hCa-kqD15yZttUAJdvzm7f-BddwWkB6NAv4laNmvQG_HpYQt1rkQ"/>
<img className="w-8 h-8 rounded-full border-2 border-primary-container" data-alt="Portrait of a female medical researcher in a laboratory, clean lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLKI0pPGygEl1B2RlwFisLZYCGHUc8jCe3F8OSdpWaFpvZ9xsVDPatmKQDg1Dj3qUIiRwaRDs2D_Rg7HZwaPupO_jy3WGRGh26iP6m3XeQa7bHvvqGv2QXLQxqA2VXhbF0GAbbEbYBIUusNFkSLvspvpXOLBNVuhofe27K0nYKzjCJOf6xtnq5YG-yiFy0mfXRIAPY1ecbRapocjjrHfL98ncVTdZ2-y5dqcMicnTuMYg3U0zq0BfCHBnOjg5gYyH24dtGY7VHNQ"/>
</div>
<span className="text-white/60 text-xs font-medium tracking-wide">TRUSTED BY 2,400+ PRACTITIONERS</span>
</div>
</div>
</div>
{/* Footer Reference */}
<div className="relative z-10">
<p className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-white/40">
                © 2024 Clinical Curator HMS.
            </p>
</div>
</section>
{/* Login Panel (Right) */}
<main className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-surface">
<div className="w-full max-w-md">
{/* Mobile Logo */}
<div className="lg:hidden flex items-center gap-3 mb-12">
<div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
<span className="material-symbols-outlined text-white text-sm" data-icon="clinical_notes">clinical_notes</span>
</div>
<h1 className="text-lg font-light tracking-[-1.4px] text-on-surface">Clinical Curator</h1>
</div>
<div className="mb-10">
<h3 className="editorial-headline text-3xl text-on-surface mb-2">Staff Workspace</h3>
<p className="text-secondary text-sm">Enter your clinical credentials to access the EHR dashboard.</p>
</div>
<form className="space-y-6">
{/* Email Field */}
<div>
<label className="font-['Inter'] text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface mb-2 block">
                        Medical Identification (Email)
                    </label>
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline text-[20px]" data-icon="alternate_email">alternate_email</span>
</div>
<input className="w-full bg-surface-container-high border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder-outline focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200" placeholder="dr.smith@clinicalcurator.com" type="email"/>
<div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-focus-within:w-full transition-all duration-300"></div>
</div>
</div>
{/* Password Field */}
<div>
<div className="flex justify-between items-center mb-2">
<label className="font-['Inter'] text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface">
                            Security Key
                        </label>
<a className="text-[11px] font-semibold uppercase tracking-[0.5px] text-primary hover:opacity-80" href="#">Forgot?</a>
</div>
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline text-[20px]" data-icon="lock">lock</span>
</div>
<input className="w-full bg-surface-container-high border-none rounded-lg py-4 pl-12 pr-12 text-on-surface placeholder-outline focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200" placeholder="••••••••••••" type="password"/>
<div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-outline hover:text-on-surface">
<span className="material-symbols-outlined text-[20px]" data-icon="visibility_off">visibility_off</span>
</div>
<div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-focus-within:w-full transition-all duration-300"></div>
</div>
</div>
{/* Remember Device */}
<div className="flex items-center gap-3">
<input className="w-4 h-4 rounded-sm border-outline-variant text-primary focus:ring-primary/20" id="remember" type="checkbox"/>
<label className="text-sm text-secondary" htmlFor="remember">Trust this terminal for 24 hours</label>
</div>
{/* Submit CTA */}
<button className="w-full bg-primary-container text-white font-medium py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary transition-all duration-200 shadow-[0_7px_14px_0_rgba(83,58,253,0.15)] active:scale-[0.98]" type="submit">
<span>Sign In to Workspace</span>
<span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</form>
{/* Secondary Actions */}
<div className="mt-12 pt-8 border-t border-surface-container-low flex flex-col gap-6">
<div className="flex items-center justify-between text-xs font-['Inter'] uppercase tracking-[0.5px]">
<span className="text-secondary">Emergency Access?</span>
<a className="text-primary font-semibold" href="#">Contact IT Support</a>
</div>
{/* SSO Options */}
<div className="grid grid-cols-2 gap-4">
<button className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-sm text-on-surface transition-colors">
<img alt="Google" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqjB2ogj-wDcPEKBR_fgj1bP7JKvtx3JxmCsj1wRxt_Ji0kc0jSwPq1os81Ey2Xa5EgAAl_ji4wyemTJgTD0LNlYv8UOyj6K96VXMXR9O3AaEhyXliCxNu6-RFYYJQqPBbtIEJy8Jv6wM7quk4LkQxzW0qoNpChFM2u8jz8QSJR6CNmcQ2Qq_R3zuKo8LF1EBnk1saFWg50pVd3_J5gdrDvw8u6RLJnE9Og__JfUAz3wekS1jBoPHTNzdGNA2UD48oAOiWmtl5Jw"/>
<span className="font-medium">SSO Login</span>
</button>
<button className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-sm text-on-surface transition-colors">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon="fingerprint">fingerprint</span>
<span className="font-medium">Biometric</span>
</button>
</div>
</div>
</div>
</main>
{/* Floating Global Footer (Privacy/Terms) */}
<footer className="fixed bottom-0 right-0 w-full lg:w-1/2 p-8 flex justify-between items-center pointer-events-none">
<div className="flex gap-6 pointer-events-auto">
<a className="font-['Inter'] text-[10px] uppercase tracking-[0.5px] text-secondary hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
<a className="font-['Inter'] text-[10px] uppercase tracking-[0.5px] text-secondary hover:text-on-surface transition-colors" href="#">Terms of Service</a>
</div>
<div className="pointer-events-auto">
<button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[16px]" data-icon="help">help</span>
</button>
</div>
</footer>

    </div>
  );
}
