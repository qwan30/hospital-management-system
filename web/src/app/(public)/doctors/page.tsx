import Image from "next/image";

export default function PublicDoctorsPage() {
  return (
    <>
      <main>

{/* Hero Header Intro */}
<section className="bg-surface py-16 px-6 lg:px-12 border-b border-surface-container-low">
<div className="max-w-7xl mx-auto">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
<div className="max-w-2xl">
<span className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-4 block">Medical Directory</span>
<h1 className="text-5xl lg:text-7xl font-light tracking-tighter leading-none text-on-surface mb-6">Expert medical professionals at your service.</h1>
<p className="text-on-surface-variant text-lg leading-relaxed font-normal max-w-lg">
                            Access our network of world-class specialists. Filter by department or search directly to find the right care for your needs.
                        </p>
</div>
<div className="flex flex-col items-end gap-2 text-right">
<div className="text-3xl font-light">24/7</div>
<div className="text-xs font-bold uppercase tracking-widest text-outline">Emergency Support</div>
</div>
</div>
</div>
</section>
{/* Search and Filter Bar */}
<section className="sticky top-12 z-40 bg-surface-container-low px-6 lg:px-12 py-8">
<div className="max-w-7xl mx-auto">
<div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-outline-variant bg-opacity-20">
<div className="md:col-span-5 bg-white p-4 flex items-center">
<span className="material-symbols-outlined text-outline mr-3" data-icon="search">search</span>
<input className="w-full border-none focus:ring-0 text-sm p-0 placeholder:text-outline-variant" placeholder="Search by name or keyword..." type="text"/>
</div>
<div className="md:col-span-4 bg-white p-4 flex items-center border-l border-surface-container-low">
<span className="material-symbols-outlined text-outline mr-3" data-icon="filter_list">filter_list</span>
<select aria-label="Filter doctors by department" className="w-full border-none focus:ring-0 text-sm p-0 appearance-none bg-transparent">
<option>All Departments</option>
<option>Cardiology</option>
<option>Neurology</option>
<option>Oncology</option>
<option>Pediatrics</option>
</select>
</div>
<div className="md:col-span-3 bg-primary-container p-4 flex items-center justify-center cursor-pointer active:bg-primary transition-colors">
<span className="text-white text-xs font-bold uppercase tracking-widest">Apply Filters</span>
</div>
</div>
</div>
</section>
{/* Doctors Grid */}
<section className="bg-surface-container-low px-6 lg:px-12 pb-24">
<div className="max-w-7xl mx-auto">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
{/* Doctor Card 1 */}
<div className="group bg-surface flex flex-col h-full transition-all duration-150 hover:translate-y-[-4px]">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<Image alt="Doctor" className="w-full h-full object-cover" data-alt="professional portrait of a male doctor in a white coat with a stethoscope against a clean gray background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXPMQebdR-fxZtCLREoYqCQHol61kxiR99A3iSr6OGqC9KFRiRp7lS7VAgRAuSGwc10ZRNhxBVIE_c8TWJCzwqZg2scGpmQuOv9i1Uaz601kZU5b9drk6Kb9IPSpjeu2tZ9RuTXXa0kz4KomwK2LnS82hnRa4H98qb6T-VJVP5gZi9-WMqfVtIbrKiqKLcEH2o9B9EOHvE2D6FsQ5iHYfPj19uZY3sZjJgkVZOL1_iTdtmh8b5OtGA0A3veBk3S6LmXIPZDjbl9g" width={1200} height={800}/>
</div>
<div className="p-6 flex flex-col flex-grow">
<span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">Cardiology</span>
<h3 className="text-xl font-semibold text-on-surface mb-2">Dr. Alexander Vance</h3>
<p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Specializing in interventional cardiology and structural heart disease management.</p>
<div className="mt-auto pt-6 border-t border-surface-container-low flex items-center justify-between">
<div className="flex flex-col">
<span className="text-[10px] uppercase font-bold text-outline">Experience</span>
<span className="text-xs font-semibold">12 Years</span>
</div>
<button className="bg-primary-container text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary active:scale-95 transition-all">Check Slots</button>
</div>
</div>
</div>
{/* Doctor Card 2 */}
<div className="group bg-surface flex flex-col h-full transition-all duration-150 hover:translate-y-[-4px]">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<Image alt="Doctor" className="w-full h-full object-cover" data-alt="confident female physician in professional medical attire looking into camera in a minimalist studio setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBVt1FA_9MmoUvBJjGF1vYDC-OMyvOBrZjuwShCnOaYff_xUoyhCCFxfHeTV7-EGW72W0d0jJVG9DfK-EBHy0l06ZKhhMF9gar8bWPKq98pjPY_3dMCDxIqgDE8_flzFgFnyRHxkfzRNEM4KUdNaQvBnn7oRT60XdSEUuUjiJb3v56IeH3dt5wxm-KHlCY5xjWsgV-m2BbKAg7_dr-5IzAGXGVhWM8eaJ9xBMuY8gvqIPzERfyJGXJdrLOFOl-2Ss_PqAUWdqkxQ" width={1200} height={800}/>
</div>
<div className="p-6 flex flex-col flex-grow">
<span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">Neurology</span>
<h3 className="text-xl font-semibold text-on-surface mb-2">Dr. Sarah Chen</h3>
<p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Leading researcher in neuro-regenerative therapy and advanced epilepsy care.</p>
<div className="mt-auto pt-6 border-t border-surface-container-low flex items-center justify-between">
<div className="flex flex-col">
<span className="text-[10px] uppercase font-bold text-outline">Experience</span>
<span className="text-xs font-semibold">15 Years</span>
</div>
<button className="bg-primary-container text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary active:scale-95 transition-all">Check Slots</button>
</div>
</div>
</div>
{/* Doctor Card 3 */}
<div className="group bg-surface flex flex-col h-full transition-all duration-150 hover:translate-y-[-4px]">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<Image alt="Doctor" className="w-full h-full object-cover" data-alt="middle-aged male specialist with glasses and medical scrub standing in a high-tech hospital environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhivfa0YQwIp4KIqsfK-toBdQMTtZ0AXQ9YzxS7oj7sd5uJmNh4FE1KDqQR7Ts9oLGUO8XYvMQOj6nf4yeh69GBiRl6XNwdJD4_wVGI084VuqfFB6iZYZW-drmhr1x1mAC7urNB8NCArMJ6LAiJWq1gOJtRsT1J_S13i3_-iSxVOGXAwJ63aNwk5B_SLKgHlJ3SDxxKnosz6d7_BfnnHvm4Gewre0HEJbJ6KTVxkABdacoEBAXtLnmh0L42W_T1N7RVGcjTcL5Mg" width={1200} height={800}/>
</div>
<div className="p-6 flex flex-col flex-grow">
<span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">Oncology</span>
<h3 className="text-xl font-semibold text-on-surface mb-2">Dr. Michael Thorne</h3>
<p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Expert in precision oncology and targeted immunotherapy treatments.</p>
<div className="mt-auto pt-6 border-t border-surface-container-low flex items-center justify-between">
<div className="flex flex-col">
<span className="text-[10px] uppercase font-bold text-outline">Experience</span>
<span className="text-xs font-semibold">20 Years</span>
</div>
<button className="bg-primary-container text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary active:scale-95 transition-all">Check Slots</button>
</div>
</div>
</div>
{/* Doctor Card 4 */}
<div className="group bg-surface flex flex-col h-full transition-all duration-150 hover:translate-y-[-4px]">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<Image alt="Doctor" className="w-full h-full object-cover" data-alt="professional female doctor in surgical scrubs looking focused in a clean bright clinical hallway" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4OUdUE3PIBAolR4-7MQKVn2th0Y4MV08CtaspcWaPen8Fv3ZPmeZx_t1I0EhpmTFNUHwdzDJ3AR_qiVUto7F66Uj7fomMV8QkuTdUPJhVmEszyimwsXBtIGVirqISJFWoHTeSDM-JB3H0VZbyZQ8J9rWN6z965rueNgqxaux8JQwtG9VltKkthWI_UBzbj42TWOsTJGFeiy6V6StxTBjlHOncv_KgFYo6ZUQs486xPS4MRLb8iiw__XNKOIDaXDPiQZOfiYIMtw" width={1200} height={800}/>
</div>
<div className="p-6 flex flex-col flex-grow">
<span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">Pediatrics</span>
<h3 className="text-xl font-semibold text-on-surface mb-2">Dr. Elena Rodriguez</h3>
<p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Focused on developmental pediatrics and neonatal intensive care medicine.</p>
<div className="mt-auto pt-6 border-t border-surface-container-low flex items-center justify-between">
<div className="flex flex-col">
<span className="text-[10px] uppercase font-bold text-outline">Experience</span>
<span className="text-xs font-semibold">9 Years</span>
</div>
<button className="bg-primary-container text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary active:scale-95 transition-all">Check Slots</button>
</div>
</div>
</div>
{/* Doctor Card 5 */}
<div className="group bg-surface flex flex-col h-full transition-all duration-150 hover:translate-y-[-4px]">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<Image alt="Doctor" className="w-full h-full object-cover" data-alt="smiling medical professional in blue scrubs holding a digital tablet in a clean hospital lobby" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbiE_z0Fv_5j07BqDt9_l5UvvDkRNGDzKRjKcvRkES5nVlwjgoSreOAcLLi80Abf2_mPytmgb6FNd5CFX_FV-cHxiwDzs3RI_mTfHjRruQgpA-ligktAtkkTYRZujx6mOIJc9zGobQk4i6djoRHJnThmhZOkNXd2n3K676MaMQ9bQUMmHbPZH-ktcbSQlC4V1SJhOWwOfK14UF6wwxHhKvfkUBUuXdWMPg0I0mDsicJ_300bj30AcyzCzq_c7OhI-2FnUrBzHacA" width={1200} height={800}/>
</div>
<div className="p-6 flex flex-col flex-grow">
<span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">Orthopedics</span>
<h3 className="text-xl font-semibold text-on-surface mb-2">Dr. Julian West</h3>
<p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Specialist in sports medicine and minimally invasive orthopedic surgery.</p>
<div className="mt-auto pt-6 border-t border-surface-container-low flex items-center justify-between">
<div className="flex flex-col">
<span className="text-[10px] uppercase font-bold text-outline">Experience</span>
<span className="text-xs font-semibold">14 Years</span>
</div>
<button className="bg-primary-container text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary active:scale-95 transition-all">Check Slots</button>
</div>
</div>
</div>
{/* Doctor Card 6 */}
<div className="group bg-surface flex flex-col h-full transition-all duration-150 hover:translate-y-[-4px]">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<Image alt="Doctor" className="w-full h-full object-cover" data-alt="female specialist in laboratory setting looking at results with a focused and professional expression" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2FZJ350dULlNXOpEhIjDTTtmebUNH6rP5xl9RiWUZnBKIZqzu8s1oeeYudCf0uwAvrweCcIBqU7A5igvcjpA2I1sz4vVokuwQRcR4zc5WVkSVtN9-7DtUR-nziMr8OltD8V1yvcoDRl5G1W79ZGArX8gHyJinvS_FCSh29qalzcbsMubwm6YR2ilc3sgP1rqLDcTzUBtpCP4Exicr_J-BbKZtXFI0MYH1Ky8QjcrqEgRJj9TqKRxPDHC_1UToXrgpYU_g3dboMg" width={1200} height={800}/>
</div>
<div className="p-6 flex flex-col flex-grow">
<span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">Dermatology</span>
<h3 className="text-xl font-semibold text-on-surface mb-2">Dr. Maya Patel</h3>
<p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Expert in cosmetic dermatology and clinical treatment of complex skin conditions.</p>
<div className="mt-auto pt-6 border-t border-surface-container-low flex items-center justify-between">
<div className="flex flex-col">
<span className="text-[10px] uppercase font-bold text-outline">Experience</span>
<span className="text-xs font-semibold">11 Years</span>
</div>
<button className="bg-primary-container text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary active:scale-95 transition-all">Check Slots</button>
</div>
</div>
</div>
</div>
{/* Pagination */}
<div className="mt-16 flex items-center justify-center gap-1">
<button className="w-10 h-10 flex items-center justify-center bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-white transition-colors">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button className="w-10 h-10 flex items-center justify-center bg-primary-container text-white text-xs font-bold">1</button>
<button className="w-10 h-10 flex items-center justify-center bg-white text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-colors">2</button>
<button className="w-10 h-10 flex items-center justify-center bg-white text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-colors">3</button>
<button className="w-10 h-10 flex items-center justify-center bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-white transition-colors">
<span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</section>
{/* Newsletter / Footer CTA */}
<section className="bg-on-surface py-24 px-6 lg:px-12">
<div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12">
<div className="max-w-xl">
<h2 className="text-white text-4xl font-light tracking-tighter mb-4">Stay informed about your health.</h2>
<p className="text-surface-container-highest opacity-60 text-lg mb-8">Receive monthly health tips, clinic updates, and news from our specialists directly in your inbox.</p>
<div className="flex flex-col sm:flex-row gap-px bg-outline-variant bg-opacity-20">
<input className="bg-white border-none focus:ring-0 p-4 text-sm w-full sm:w-80" placeholder="Your email address" type="email"/>
<button className="bg-primary-container text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors">Subscribe</button>
</div>
</div>
<div className="flex flex-col items-start lg:items-end">
<span className="text-white text-lg font-bold tracking-tighter uppercase mb-4">MED-CARBON HMS</span>
<nav className="flex flex-col items-start lg:items-end gap-2">
<a className="text-surface-container-highest opacity-60 hover:opacity-100 text-sm transition-opacity" href="#">Privacy Policy</a>
<a className="text-surface-container-highest opacity-60 hover:opacity-100 text-sm transition-opacity" href="#">Terms of Service</a>
<a className="text-surface-container-highest opacity-60 hover:opacity-100 text-sm transition-opacity" href="#">Contact Administration</a>
</nav>
</div>
</div>
</section>

</main>
    </>
  );
}
