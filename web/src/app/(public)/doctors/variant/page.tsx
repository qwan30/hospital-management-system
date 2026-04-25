import Image from "next/image";
import Link from "next/link";

export default function PublicDoctorsPage() {
  return (
    <>
      <main>

{/* Hero Section / Title */}
<div className="mb-16">
<h1 className="text-6xl font-[300] tracking-tight text-on-surface mb-4">Find a Doctor</h1>
<p className="text-on-surface-variant max-w-2xl leading-relaxed">
                Connect with our world-class medical professionals. Filter by department or search specifically for the expertise you require.
            </p>
</div>
{/* Filter & Search Section (The Monolith) */}
<div className="bg-surface-container-low p-8 mb-16">
<div className="flex flex-col lg:flex-row gap-8 items-end">
<div className="flex-1 w-full">
<label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Search by name or keyword</label>
<div className="relative group">
<input className="w-full bg-surface-container-highest border-0 border-b-2 border-outline focus:border-primary-container focus:ring-0 py-4 px-4 transition-all duration-300" placeholder="e.g. Dr. Richards or 'Cardiology'" type="text"/>
</div>
</div>
<div className="w-full lg:w-72">
<label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Department</label>
<select className="w-full bg-surface-container-highest border-0 border-b-2 border-outline focus:border-primary-container focus:ring-0 py-4 px-4 transition-all duration-300 appearance-none">
<option>All Departments</option>
<option>Cardiology</option>
<option>Neurology</option>
<option>Oncology</option>
<option>Pediatrics</option>
</select>
</div>
<div className="w-full lg:w-48">
<button className="w-full bg-on-surface text-surface py-4 px-8 font-semibold hover:bg-primary-container transition-colors duration-300">
                        Apply Filters
                    </button>
</div>
</div>
<div className="mt-8 flex flex-wrap gap-2">
<span className="bg-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Active Filters:</span>
<button className="bg-primary-fixed text-on-primary-fixed px-3 py-1 text-[10px] font-bold uppercase flex items-center gap-2">
                    Cardiology <span className="material-symbols-outlined text-xs" data-icon="close">close</span>
</button>
<button className="text-primary text-[10px] font-bold uppercase hover:underline ml-4">Clear all</button>
</div>
</div>
{/* Doctor Grid (3 Columns) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-outline-variant/10">
{/* Doctor Card 1 */}
<div className="bg-surface p-8 group transition-colors duration-300 hover:bg-surface-container-lowest flex flex-col min-h-[500px]">
<div className="mb-8 overflow-hidden aspect-square bg-surface-container-high">
<img alt="Doctor" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="professional portrait of a confident male doctor in a white coat with a stethoscope around his neck in a modern clinic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-GtakycqQK2wugzAYtBPOf8KHbVMv3-fyb9AMHrXf9qMLsgXrQUKLypXYrkz_AoeSO_deSv91AZ-Q4LijuJh9u0LuZC1UzGDk0t7zWuY2UymLB7ujbc1ZXly6nfzYmJ4T7f9psm9ZG1GFudeFGFqP3n3BUDL8VLGozxMWwvvKzxZIIvkFt2mPUesRNOL7puzRShRDBq7kC6oD1DgPrenFTxVzTlZ3mCS8_tkTaKRJQE4ZMxQyoV98n7ytbrsdYb7Wvsb7ljHP_Q"/>
</div>
<div className="flex-grow">
<span className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Cardiology Department</span>
<h3 className="text-2xl font-semibold text-on-surface mb-1">Dr. Alexander Sterling</h3>
<p className="text-sm text-on-surface-variant font-medium mb-4">Lead Interventional Cardiologist</p>
<p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                        Specializing in minimally invasive heart procedures and preventative cardiac care with over 15 years of surgical excellence in academic environments.
                    </p>
</div>
<div className="mt-8 grid grid-cols-2 gap-px bg-outline-variant/20">
<button className="bg-surface py-4 text-primary font-semibold text-sm hover:bg-primary-fixed transition-colors duration-200">
                        View profile
                    </button>
<button className="bg-primary-container py-4 text-on-primary-container font-semibold text-sm hover:bg-primary transition-colors duration-200">
                        Check slots
                    </button>
</div>
</div>
{/* Doctor Card 2 */}
<div className="bg-surface p-8 group transition-colors duration-300 hover:bg-surface-container-lowest flex flex-col min-h-[500px]">
<div className="mb-8 overflow-hidden aspect-square bg-surface-container-high">
<img alt="Doctor" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="portrait of a focused female neurologist in a bright modern medical office with brain scans visible in the background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBprYLR8STuqT7oeg4lYhSHFerp50ZuDsZPpZt1AojOQGe9Xc7u1cHtnVKqGn6ZWENP9fezdc0CW-N-KtRWoRYs-WRQWvIVrcz_BE5JOacrXSfsUG-PK-UkhLBcKAodr_0N6utoKHXqL4Koq4_MgyAL74cVASBt2Q3WAvSyFMDpeblbjfqHqiHMx8tmrBXdGVlgIxx4mOksqOTYMeu4YlWZnUHdSp4n77FBkAmQcotlVGKMQYNbIViDh9cSd3fgpRGqdECwyQ1XbA"/>
</div>
<div className="flex-grow">
<span className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Neurology Department</span>
<h3 className="text-2xl font-semibold text-on-surface mb-1">Dr. Elena Rodriguez</h3>
<p className="text-sm text-on-surface-variant font-medium mb-4">Senior Neurosurgeon</p>
<p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                        Expert in neuro-oncology and restorative brain surgery. Dr. Rodriguez leads our research on advanced cognitive rehabilitation techniques.
                    </p>
</div>
<div className="mt-8 grid grid-cols-2 gap-px bg-outline-variant/20">
<button className="bg-surface py-4 text-primary font-semibold text-sm hover:bg-primary-fixed transition-colors duration-200">
                        View profile
                    </button>
<button className="bg-primary-container py-4 text-on-primary-container font-semibold text-sm hover:bg-primary transition-colors duration-200">
                        Check slots
                    </button>
</div>
</div>
{/* Doctor Card 3 */}
<div className="bg-surface p-8 group transition-colors duration-300 hover:bg-surface-container-lowest flex flex-col min-h-[500px]">
<div className="mb-8 overflow-hidden aspect-square bg-surface-container-high">
<img alt="Doctor" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="close-up portrait of a friendly pediatrician in a colorful medical office environment with soft warm lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFlTQc0GozIeM8j6W4OTL6V-PSFfTLW1SDb8dInrlbw9Zuas1jomHkRU1_gihTy9RnyF1OhcVztY2Hmi38y6Y2YlW2f2fkZb2yIWa7BPmY2GSNy-DwELH_nlXHLZAZI6txcZZCG5XzsP5lHhtLwug95teZ5Ahp8Xl8c94TlWuXc5tfTvbtr-rdpYjBNYxPiTzRS-USCqv_FgwvdnoDwarp7ccpIRs-pr8tUE_6AX0vHf7aI-IU2MqvAbIoMiGFfSJayopUyJ-2fg"/>
</div>
<div className="flex-grow">
<span className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Pediatrics Department</span>
<h3 className="text-2xl font-semibold text-on-surface mb-1">Dr. Julian Vance</h3>
<p className="text-sm text-on-surface-variant font-medium mb-4">Pediatric Specialist</p>
<p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                        Dedicated to family-centered care and adolescent developmental health. Known for a compassionate approach to complex pediatric cases.
                    </p>
</div>
<div className="mt-8 grid grid-cols-2 gap-px bg-outline-variant/20">
<button className="bg-surface py-4 text-primary font-semibold text-sm hover:bg-primary-fixed transition-colors duration-200">
                        View profile
                    </button>
<button className="bg-primary-container py-4 text-on-primary-container font-semibold text-sm hover:bg-primary transition-colors duration-200">
                        Check slots
                    </button>
</div>
</div>
{/* Doctor Card 4 */}
<div className="bg-surface p-8 group transition-colors duration-300 hover:bg-surface-container-lowest flex flex-col min-h-[500px]">
<div className="mb-8 overflow-hidden aspect-square bg-surface-container-high">
<img alt="Doctor" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="middle-aged male oncologist in a sterile laboratory setting looking at clinical results with a serious and professional demeanor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDdc0B_QYfbg0oftsWtd5llwVlxwgxVtXMgXhpxmmF_3vSNZ5Q755qrEe98C7SiJ32Ymi5IhkDSlsu2G2FBVvI1R0Wl_TcB7_Kh07Wj5T36Zf5DdiLlnyfCi9TEN4ePSEKEhnrTkDGTUMawQOxC4MSe_wQnF1SwIXMDCW3ktXREhz15XOIGWFcVFfRa_6tpOPvcUNfqSBcSRsEjf8s8wBpo6rNfIwv-iwtda7EqZ25uUqW22tv4rrVQVYmMUsFpIWl49W-78fGRg"/>
</div>
<div className="flex-grow">
<span className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Oncology Department</span>
<h3 className="text-2xl font-semibold text-on-surface mb-1">Dr. Marcus Thorne</h3>
<p className="text-sm text-on-surface-variant font-medium mb-4">Medical Oncologist</p>
<p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                        Specialist in immunotherapy and personalized cancer treatment protocols. Leading researcher in genetic mapping for targeted therapy.
                    </p>
</div>
<div className="mt-8 grid grid-cols-2 gap-px bg-outline-variant/20">
<button className="bg-surface py-4 text-primary font-semibold text-sm hover:bg-primary-fixed transition-colors duration-200">
                        View profile
                    </button>
<button className="bg-primary-container py-4 text-on-primary-container font-semibold text-sm hover:bg-primary transition-colors duration-200">
                        Check slots
                    </button>
</div>
</div>
{/* Doctor Card 5 */}
<div className="bg-surface p-8 group transition-colors duration-300 hover:bg-surface-container-lowest flex flex-col min-h-[500px]">
<div className="mb-8 overflow-hidden aspect-square bg-surface-container-high">
<img alt="Doctor" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="portrait of a confident female orthopedic surgeon in surgical scrubs holding a tablet in a modern operating theater" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXA1KiuGbVR7UT-_MOJ8aII5Ib4k0fMv-1rEHdfNLrLOB1P-dj0_aXmvHNPnDbpVOOUn71U_0GYx-s5ca54PAge5Y-sBVsN9YVyJZ7HDf0QBNpOBr3QoWP3AsFM7L8QjRifwBeMc1OlBu-5H4xyIuU1ECGKTkDIfwYKIaBBOj35C3-E6imTtXNU5Zgpd8qVYw4HdZ9osIVHPPrXqKT1SvvnUcAZQiNkhyO_SGsh8pYLBoNdaaCr1EJciHgqKSSbQDX33ppQpSnww"/>
</div>
<div className="flex-grow">
<span className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Orthopedics Department</span>
<h3 className="text-2xl font-semibold text-on-surface mb-1">Dr. Sarah Chen</h3>
<p className="text-sm text-on-surface-variant font-medium mb-4">Orthopedic Surgeon</p>
<p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                        Pioneer in robotic-assisted joint replacement and sports medicine. Committed to restoring patient mobility through precision technology.
                    </p>
</div>
<div className="mt-8 grid grid-cols-2 gap-px bg-outline-variant/20">
<button className="bg-surface py-4 text-primary font-semibold text-sm hover:bg-primary-fixed transition-colors duration-200">
                        View profile
                    </button>
<button className="bg-primary-container py-4 text-on-primary-container font-semibold text-sm hover:bg-primary transition-colors duration-200">
                        Check slots
                    </button>
</div>
</div>
{/* Doctor Card 6 */}
<div className="bg-surface p-8 group transition-colors duration-300 hover:bg-surface-container-lowest flex flex-col min-h-[500px]">
<div className="mb-8 overflow-hidden aspect-square bg-surface-container-high">
<img alt="Doctor" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="friendly male doctor in a consultation room with bright window light in a clean clinical environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCujNTlqEYtc_vJ2YWYoE1TOMQMvj_Pn4hpPZMSttMmSREkxp_SCltvktWwnUq5FNYYZ4y0fJl2EYnPZlWuPm7rqL70u0Hubk8CF_kEJkSEiDy5Y1aJjqcfSskhZER7qRRSmH1DjcqSlSORhUKHU62sKvpmRagnltskXnjVaVIemLsit4YJPHmQkJp5N-S_gFmKzSoEvMuav1l2Io2ipGZIByUqWmc1dKfgFNTOprM_P4vz6zaZObI9ggtHCszWd1kGgR8mIGjWyA"/>
</div>
<div className="flex-grow">
<span className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">General Medicine</span>
<h3 className="text-2xl font-semibold text-on-surface mb-1">Dr. Thomas Wu</h3>
<p className="text-sm text-on-surface-variant font-medium mb-4">Internal Medicine Specialist</p>
<p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                        Focusing on chronic disease management and holistic patient wellness. Dr. Wu emphasizes diagnostic accuracy and long-term care planning.
                    </p>
</div>
<div className="mt-8 grid grid-cols-2 gap-px bg-outline-variant/20">
<button className="bg-surface py-4 text-primary font-semibold text-sm hover:bg-primary-fixed transition-colors duration-200">
                        View profile
                    </button>
<button className="bg-primary-container py-4 text-on-primary-container font-semibold text-sm hover:bg-primary transition-colors duration-200">
                        Check slots
                    </button>
</div>
</div>
</div>
{/* Pagination / Load More */}
<div className="mt-16 flex flex-col items-center">
<button className="bg-surface-container-high text-on-surface px-12 py-4 font-semibold hover:bg-surface-container-highest transition-colors duration-300">
                Load More Results
            </button>
<p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-outline">Showing 6 of 142 Medical Professionals</p>
</div>

</main>
    </>
  );
}
