import Image from "next/image";

export default function AdminPublicContentPage() {
  return (
    <>
      <main>

{/* Left: Sections List */}
<section className="col-span-3 bg-surface-container-low flex flex-col">
<div className="p-8">
<span className="text-[10px] font-bold text-outline tracking-[0.2em] uppercase">Content Registry</span>
<h1 className="text-3xl font-light text-on-surface mt-2 mb-8">Public Facing</h1>
<div className="space-y-px">
<button className="w-full text-left p-4 bg-surface-container-lowest transition-all group hover:bg-primary-container hover:text-on-primary-container">
<div className="flex items-center justify-between">
<span className="font-semibold text-sm">Hero Landing</span>
<span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
</div>
<p className="text-[10px] uppercase tracking-wider opacity-60 mt-1">Main Header Component</p>
</button>
<button className="w-full text-left p-4 bg-surface hover:bg-surface-container-highest transition-all">
<div className="flex items-center justify-between">
<span className="font-semibold text-sm">Core Services</span>
<span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
</div>
<p className="text-[10px] uppercase tracking-wider opacity-60 mt-1">Medical Grid List</p>
</button>
<button className="w-full text-left p-4 bg-surface hover:bg-surface-container-highest transition-all">
<div className="flex items-center justify-between">
<span className="font-semibold text-sm">About MedCore</span>
<span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
</div>
<p className="text-[10px] uppercase tracking-wider opacity-60 mt-1">Foundational Text</p>
</button>
<button className="w-full text-left p-4 bg-surface hover:bg-surface-container-highest transition-all">
<div className="flex items-center justify-between">
<span className="font-semibold text-sm">Contact Portal</span>
<span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
</div>
<p className="text-[10px] uppercase tracking-wider opacity-60 mt-1">Lead Generation</p>
</button>
</div>
</div>
</section>
{/* Center: Editor */}
<section className="col-span-5 bg-surface p-12 overflow-y-auto">
<div className="max-w-xl mx-auto">
<div className="flex items-center space-x-2 mb-2">
<div className="w-2 h-2 bg-primary-container"></div>
<span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Active Editor</span>
</div>
<h2 className="text-2xl font-bold mb-12">Hero Landing Configuration</h2>
<form className="space-y-12">
{/* Input Field Group */}
<div className="group">
<label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors">Headline Component</label>
<input className="w-full bg-surface-container-low border-0 border-b-2 border-outline px-4 py-3 text-lg font-semibold focus:ring-0 focus:border-primary-container transition-all" placeholder="Enter headline text" type="text" defaultValue="Precision Healthcare for Every Life."/>
</div>
<div className="group">
<label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors">Subtitle Content</label>
<textarea className="w-full bg-surface-container-low border-0 border-b-2 border-outline px-4 py-3 text-sm focus:ring-0 focus:border-primary-container transition-all" placeholder="Enter descriptive subtitle" rows={3} defaultValue="Experience the future of medical care with MEDCORE OS. Intelligent systems designed for surgical precision and patient empathy." />
</div>
<div className="grid grid-cols-2 gap-8">
<div className="group">
<label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors">Primary CTA Label</label>
<input className="w-full bg-surface-container-low border-0 border-b-2 border-outline px-4 py-3 text-sm font-semibold focus:ring-0 focus:border-primary-container transition-all" type="text" defaultValue="Explore Services"/>
</div>
<div className="group">
<label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors">Image Resource URL</label>
<input className="w-full bg-surface-container-low border-0 border-b-2 border-outline px-4 py-3 text-sm font-mono focus:ring-0 focus:border-primary-container transition-all" type="text" defaultValue="https://medcore.os/assets/hero_v1.jpg"/>
</div>
</div>
<div className="pt-8 flex items-center space-x-4">
<button className="bg-primary-container text-on-primary-container px-8 py-4 font-bold uppercase text-xs tracking-widest hover:bg-primary active:translate-y-[2px] transition-all">
                                Deploy Changes
                            </button>
<button className="bg-surface-container-high text-on-surface px-8 py-4 font-bold uppercase text-xs tracking-widest hover:bg-surface-container-highest transition-all">
                                Revert Draft
                            </button>
</div>
</form>
</div>
</section>
{/* Right: Preview */}
<section className="col-span-4 bg-surface-container p-8">
<div className="sticky top-8">
<div className="flex items-center justify-between mb-8">
<span className="text-[10px] font-bold text-outline tracking-[0.2em] uppercase">Live Preview</span>
<div className="flex space-x-2">
<span className="material-symbols-outlined text-sm cursor-pointer opacity-50 hover:opacity-100">desktop_windows</span>
<span className="material-symbols-outlined text-sm cursor-pointer opacity-50 hover:opacity-100">tablet_mac</span>
<span className="material-symbols-outlined text-sm cursor-pointer opacity-50 hover:opacity-100">smartphone</span>
</div>
</div>
{/* The "Preview Card" */}
<div className="bg-surface-container-lowest shadow-none overflow-hidden group">
<div className="relative aspect-video bg-zinc-200">
<Image alt="Hero Preview" className="w-full h-full object-cover grayscale contrast-125" data-alt="A clean, minimalist high-tech hospital corridor with soft volumetric lighting and modern architectural lines" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp2RckDjeEnJIp_GU7S2ldLQfYtdbQpvCj9cVIKqhdXi1j1UK6BtZ2evKquuJLOytooRDo8OswkWQQNtMZ3AJGPg7v7cwLXFNNluZHH1ESLKOGCvKH0dvQ5l-tFaGOe0CNq79opV8qgxm8RFH1E6JrpIxoGFx3LSksvK--xF_0bLpDNGpUKlwNUyv4KNfS0Gfz1ceONjZ7fSX-mGNzM04nXp-ZCt7ESPzGTI5RqA3WQZlTFS85cogIhglpEWlPUjQzte07Vb59DQ" width={1200} height={800}/>
<div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
</div>
<div className="p-8">
<span className="inline-block bg-primary-container/10 text-primary text-[9px] font-black px-2 py-1 uppercase tracking-tighter mb-4">Draft Stage v2.4</span>
<h3 className="text-3xl font-light leading-tight mb-4 tracking-tighter">Precision Healthcare for Every Life.</h3>
<p className="text-zinc-500 text-xs leading-relaxed mb-8">Experience the future of medical care with MEDCORE OS. Intelligent systems designed for surgical precision and patient empathy.</p>
<div className="h-[2px] w-12 bg-primary-container mb-8"></div>
<div className="flex items-center text-primary-container font-bold text-xs uppercase tracking-widest">
<span>Explore Services</span>
<span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
</div>
</div>
</div>
{/* Metrics Context */}
<div className="mt-8 grid grid-cols-2 gap-px bg-surface-container-highest">
<div className="bg-surface p-6">
<span className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-1">CTR Prediction</span>
<span className="text-2xl font-light">4.2%</span>
</div>
<div className="bg-surface p-6">
<span className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Load Latency</span>
<span className="text-2xl font-light">1.2s</span>
</div>
</div>
</div>
</section>

</main>
    </>
  );
}
