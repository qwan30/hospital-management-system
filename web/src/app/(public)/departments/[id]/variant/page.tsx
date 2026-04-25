import Image from "next/image";
import Link from "next/link";

export default function DepartmentDetailPage() {
  return (
    <>
      <main>

{/* Breadcrumb */}
<nav className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-12">
<a className="hover:text-primary transition-colors" href="#">Home</a>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
<a className="hover:text-primary transition-colors" href="#">Departments</a>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
<span className="text-on-surface">Cardiology</span>
</nav>
<div className="grid grid-cols-1 md:grid-cols-12 gap-x-12">
{/* Left Column: Main Content */}
<div className="md:col-span-8">
{/* Hero Section */}
<section className="mb-16">
<h1 className="text-6xl font-light tracking-tight text-on-surface mb-8 leading-tight">Cardiovascular Medicine</h1>
<div className="flex flex-col md:flex-row gap-8 mb-12">
<div className="flex-1">
<p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl">
                                Our Cardiology department is a global leader in treating heart and vascular conditions. We combine cutting-edge surgical techniques with a compassionate, patient-first approach to provide exceptional cardiac care.
                            </p>
</div>
<div className="flex flex-col gap-4 min-w-[200px]">
<div className="bg-surface-container p-6">
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">LOCATION</span>
<span className="text-xl font-semibold">FLOOR 04, NORTH WING</span>
</div>
<div className="bg-surface-container p-6">
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">CONTACT</span>
<span className="text-xl font-semibold">+1 (555) 012-4432</span>
</div>
</div>
</div>
{/* Hero Image */}
<div className="h-[400px] bg-surface-container-high overflow-hidden relative">
<img alt="Modern Medical Environment" className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80" data-alt="Modern clinical hospital hallway with minimalist architecture, clean lines, bright white lighting and sophisticated medical equipment in distance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeJdZBGqQrc1sQLDqSkDs9lL1lR696NS1RqbmCkreccIVKzcRkEwTdyrYRFvgVfz8FJY0nL-NZAGRA_dh-NR8cthZM-nTfcFSehl49pMqGeGPpSkiKfqe1W4lx01m0TU5fooS-1vgNnVK1iKW64khDxdS51VwFs8EBm7tY9IAibWH8zpJfaMV5ERCR5GG4jB_ihdWj9UtpJfLRM9FvnRt4TtJKxE3tTdXFv0WXs-meYJ1BMkhDVexO5WXN81YwWZXMunJ8LcylbA"/>
<div className="absolute inset-0 bg-primary opacity-5"></div>
</div>
</section>
{/* Doctors Section */}
<section className="mb-24">
<div className="flex justify-between items-end mb-12 border-b-2 border-surface-container-highest pb-4">
<h2 className="text-3xl font-light tracking-tight">Specialists in Cardiology</h2>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">14 PROFESSIONALS FOUND</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
{/* Doctor Card 1 */}
<div className="bg-surface-container-low group hover:bg-surface-container-lowest transition-colors duration-300 cursor-pointer">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<img alt="Dr. Marcus Thorne" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Professional portrait of a male doctor in his 40s wearing a white coat and stethoscope, confident expression, neutral grey background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC69o1aSe-5VKXFt7Eyr8vQvP8NuBI4jO8um5Pz5UM-ZYtRwBtfv1jwqOFEbpc0Ym802JsNQ3vXNhSbYt29pM9hMIZSnnF-11d83dXzNnniCXmeRmxsRkgVjB3k1fttxun1vIln1kMDf3mGIRLYoWY2Aa_N1kGOAzwGQCiIyRAFZ4f7cRI4lqTrqyKR6jVVlreagRe6B4u9Br9IMR3Q5Bx5rokre11HyN2IJDujsCz9nex3YJk_e2_nfgWydTlXrkhxzvC63KcELQ"/>
</div>
<div className="p-6">
<span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Chief of Cardiology</span>
<h3 className="text-xl font-semibold mb-1">Dr. Marcus Thorne</h3>
<p className="text-on-surface-variant text-sm mb-4">Interventional Cardiology &amp; Valvular Disease</p>
<div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest">
                                    View Profile <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
</div>
</div>
</div>
{/* Doctor Card 2 */}
<div className="bg-surface-container-low group hover:bg-surface-container-lowest transition-colors duration-300 cursor-pointer">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<img alt="Dr. Elena Rodriguez" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Professional portrait of a female cardiologist wearing professional scrubs, warm smile, modern medical clinic setting in background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDejQ1O1qk6RxZ-avlanVj10n65I6MHWr2_oNlZLs-KAtBC57pe0UvVHxU8JVEdDB2iOdNYbRumRt3h4ilua6h5EQAhLbc7R__yl5a2lrN1_APppBNngRzmNuWVv4sIuhtvuagtJjy1cAswh3PzGmF-QKQ9-jAOiVuU2aenG_2gOMnIDthA3cUcND6L3K0RUAgy7-Reuq-wTUetFMUx04IP9zjBw2Dh4DwpvplgJhU4OYk1TiR7p1aNByWieYp0pXcKhg2N6B1zMQ"/>
</div>
<div className="p-6">
<span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Pediatric Specialist</span>
<h3 className="text-xl font-semibold mb-1">Dr. Elena Rodriguez</h3>
<p className="text-on-surface-variant text-sm mb-4">Congenital Heart Failure &amp; Neonatal Surgery</p>
<div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest">
                                    View Profile <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
</div>
</div>
</div>
{/* Doctor Card 3 */}
<div className="bg-surface-container-low group hover:bg-surface-container-lowest transition-colors duration-300 cursor-pointer">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<img alt="Dr. Samuel Kim" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Middle-aged Asian male physician in professional attire, looking directly at camera, soft studio lighting, high-end editorial feel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMVO173rvW_BHmpESX4yAs0xGmdYf8grxgU2Kn0Vh6Eb7DHK2c52sDmJucNNpSwkx0KgCtGcafNUJTTm_X6VFE0-mHrXzocKUMU6dqLn7M6pMQ3UEbD3iaE9JeRd-NjkkQV76DdA2mDW-L6Q_zAGUgHE6S_yJGtuTDHwU0BK72s2mI82Mc669D31UlvBqypqHgOfOy59NzKjenq6-w0pJl_K6FSkZmU9XpDbhGrLgmYhtsZ1EuWhKDSg9Y8pzr9_FkErmAXHW5sA"/>
</div>
<div className="p-6">
<span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Electrophysiology</span>
<h3 className="text-xl font-semibold mb-1">Dr. Samuel Kim</h3>
<p className="text-on-surface-variant text-sm mb-4">Arrhythmia Management &amp; Pacemaker Surgery</p>
<div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest">
                                    View Profile <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
</div>
</div>
</div>
{/* Doctor Card 4 */}
<div className="bg-surface-container-low group hover:bg-surface-container-lowest transition-colors duration-300 cursor-pointer">
<div className="aspect-[4/5] bg-surface-container-highest overflow-hidden">
<img alt="Dr. Sarah Jenkins" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Confident female doctor standing with crossed arms, wearing a white coat, sharp focus, architectural hospital background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCpqlZRY1Qw89XNoNERut5E3Vl2sZ0vn7PSe1h6_aTmcPeYVB8sVnG-oYjfc-W6FKreeYboppohBGek5HHr03w4bPxmEw2cAAIYMkxb7X1dJ6WyiYQqCE4yoxbqG_f13lU_GD0cZtwxx5ajZwogyBpgHgcqmWTUY9Sv1XXNH1VgtETfWEbKfaF_o7lJs8A8zJPTdcIkWgPxMZVE84HMRBfO4rI17o54GKQpXTGeWWZ3uVoZ9cqWiWgR8YSMW-FqB2xHHoqGiApYw"/>
</div>
<div className="p-6">
<span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Vascular Surgery</span>
<h3 className="text-xl font-semibold mb-1">Dr. Sarah Jenkins</h3>
<p className="text-on-surface-variant text-sm mb-4">Aortic Reconstruction &amp; Carotid Stenting</p>
<div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest">
                                    View Profile <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
</div>
</div>
</div>
</div>
</section>
</div>
{/* Right Column: Sidebar / Rail */}
<aside className="md:col-span-4">
<div className="sticky top-8 space-y-8">
{/* Primary CTA Card */}
<div className="bg-primary p-8 text-on-primary">
<h2 className="text-2xl font-bold mb-4 leading-tight">Book in Cardiovascular Medicine</h2>
<p className="text-on-primary opacity-80 mb-8 text-sm leading-relaxed">
                            Immediate scheduling available for new patient evaluations and specialized diagnostic imaging.
                        </p>
<button className="w-full bg-surface text-primary py-4 text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors">
                            Book Appointment
                        </button>
</div>
{/* Information Stack */}
<div className="bg-surface-container p-8">
<h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6 border-b border-outline-variant pb-2">Research &amp; Tech</h4>
<ul className="space-y-6">
<li>
<span className="text-xs font-bold text-primary block mb-1">ROBOTIC SURGERY</span>
<p className="text-sm font-semibold">Da Vinci® Cardiac Robotic System for minimally invasive procedures.</p>
</li>
<li>
<span className="text-xs font-bold text-primary block mb-1">HYBRID OR</span>
<p className="text-sm font-semibold">State-of-the-art hybrid operating rooms for complex interventions.</p>
</li>
<li>
<span className="text-xs font-bold text-primary block mb-1">CLINICAL TRIALS</span>
<p className="text-sm font-semibold">Active enrollment in 12 global cardiovascular research studies.</p>
</li>
</ul>
</div>
{/* Statistics Block */}
<div className="bg-surface-container-high p-8">
<div className="space-y-8">
<div>
<div className="text-4xl font-light tracking-tighter text-on-surface">98.4%</div>
<div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Surgical Success Rate</div>
</div>
<div>
<div className="text-4xl font-light tracking-tighter text-on-surface">2,400+</div>
<div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Annual Heart Procedures</div>
</div>
</div>
</div>
</div>
</aside>
</div>

</main>
    </>
  );
}
