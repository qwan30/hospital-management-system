import Image from "next/image";

export default function NewsListPage() {
  return (
    <>
      <main>

{/* Header Section */}
<header className="px-8 py-16 bg-surface">
<p className="font-label text-xs font-semibold uppercase tracking-widest text-primary mb-4">Journal &amp; Updates</p>
<h1 className="font-headline text-5xl md:text-7xl font-light tracking-tighter text-on-surface max-w-4xl">
                Advancing the frontier of <span className="font-semibold">clinical excellence</span>.
            </h1>
</header>
{/* Featured News Card */}
<section className="px-8 mb-24">
<div className="grid grid-cols-1 lg:grid-cols-12 bg-surface-container-lowest gap-0">
<div className="lg:col-span-8 aspect-video lg:aspect-auto">
<Image className="w-full h-full object-cover" alt="Modern high-tech medical research laboratory with scientists in white coats working with advanced digital microscopy in a cold blue light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTB9qdGsTuPH1B-DmoNJdYl3BxfyAJW1x84Mk4q-PUqIw_tAo5NwffwHDxkWrVx83W-uY4jBuQVgCAYc1WARbmYH67HPoLfxTjBI4PJwXQ1sVXaCTxH-by5rgXC258yN8uXVwYXLxnHZyIMlkVfL6dTKxs8c4jUrNJQ1hgoKt_6V09-l0VUpb_HqmKuuZDrKhn1qUIC9e5aiPnzoKeg1sGjFj_GoqbxiNUbUiBrERNNtwKsSGiWWTNIB31oI7OeNn6j3Mt6mokaQ" width={1200} height={800}/>
</div>
<div className="lg:col-span-4 p-12 flex flex-col justify-between border-l border-outline-variant/10">
<div>
<span className="text-xs font-semibold uppercase tracking-widest bg-primary text-on-primary px-3 py-1 mb-8 inline-block">Featured</span>
<p className="text-sm font-medium text-outline mb-4">OCTOBER 24, 2024</p>
<h2 className="text-3xl font-semibold mb-6 leading-tight">Breakthrough in Neural Reconstruction Systems</h2>
<p className="text-on-surface-variant leading-relaxed mb-8">
                            Medicore's research division announces a successful pilot for autonomous nerve regeneration using bio-compatible synthetic scaffolding.
                        </p>
</div>
<a className="flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all duration-300" href="#">
                        Read full article <span className="material-symbols-outlined">arrow_forward</span>
</a>
</div>
</div>
</section>
{/* News List (Alternating Bands) */}
<section>
{/* Band 1: White */}
<div className="bg-surface-container-lowest px-8 py-16">
<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
<div className="md:col-span-3">
<Image className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Surgical team performing a complex procedure under bright overhead lights in a sterile modern operating theatre" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3cc49jb9K_7GanUAKDiiZNmcZPxkdF7OhyjwDVOMH_zn0cGUDSEc2LBlDBAnz-2HeCtTTl2b4k8KBERkwdUSwUNlThxNh34FMQgG2oSkSlWI9F1OTlwpV7gSWgRmfYXTt6T0E0ZANW92Eelg2q17VOmWZzsIIE7i88x9UAjpdvZGA8DKjBe_D5z7lE14RAXWnTqJ6H2IpFeN_3mhq1ViTgD1vLYWHg_Z-Khmn0OW6BtXAGoIuivwmWKQRVZ_4chYjpjQGnTQV6Q" width={1200} height={800}/>
</div>
<div className="md:col-span-7">
<p className="text-xs font-semibold text-outline mb-2">OCTOBER 20, 2024</p>
<h3 className="text-2xl font-semibold mb-4 tracking-tight">Expansion of Robotic Surgery Wing</h3>
<p className="text-on-surface-variant max-w-2xl">Integrating the next generation of haptic-feedback surgical units to increase precision in minimally invasive cardiac procedures.</p>
</div>
<div className="md:col-span-2 flex justify-end">
<button className="text-primary font-semibold py-2 px-6 border-b-2 border-transparent hover:border-primary transition-all">Read</button>
</div>
</div>
</div>
{/* Band 2: Gray 10 */}
<div className="bg-surface-container-low px-8 py-16">
<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
<div className="md:col-span-3">
<Image className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Interior of a luxury hospital lobby with marble floors, minimalist wooden furniture and large floor to ceiling windows" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOc7sliAZnxV1AsuYPWukEzVu1lniP7aDPOsFa370N1kls-JohNqrrueM0xll5PmWyNWqNya_vPiaRg7B4oQZBMDCUByvpMlevt2IvEqT1auD3Su0imEZlCGtjqo0t7hTN3KoI0mB_HrA1MDosCQc5ztMSWxNXSevRNAtpuGrHF6I2ZG1ignFXRrzKrCOG7OveQxZ9-wgZJns_sT9j6PqyxIGpGx7lDoakAOoNgb4__P8Yu3u9GmkCEG3mDq3AdHanSCb_3KG-sw" width={1200} height={800}/>
</div>
<div className="md:col-span-7">
<p className="text-xs font-semibold text-outline mb-2">OCTOBER 15, 2024</p>
<h3 className="text-2xl font-semibold mb-4 tracking-tight">Patient Experience Reimagined</h3>
<p className="text-on-surface-variant max-w-2xl">New architectural standards implemented across our North Wing to optimize natural light and patient recovery cycles.</p>
</div>
<div className="md:col-span-2 flex justify-end">
<button className="text-primary font-semibold py-2 px-6 border-b-2 border-transparent hover:border-primary transition-all">Read</button>
</div>
</div>
</div>
{/* Band 3: White */}
<div className="bg-surface-container-lowest px-8 py-16">
<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
<div className="md:col-span-3">
<Image className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Close up of a doctor checking a digital tablet with medical scans in a dimly lit consultation room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLsVS9eowToMOGqL1MwN0UFT-s9bUN5aixZXpytg0atQzkDBTzP_vkmWvKgj_dNj8kCq87ggBCwhYRoKNgkIGAuITx-Yrkax1ss8H5KJ0CBZeI0HCyqvUf9xUxBFrDfo6zvcpNXeORNTjiGGF-jXX6UoCoVqwsP_eEJ86PmBPtG82YgkFXg7uXB4rtd7LfrsERYOJ0Imhn3VZtpNJhc1s64U8UsbcUiPwvh86yVR1nIICGRpHXwIUd8Hf4kznMUKvnFygkyOnTSg" width={1200} height={800}/>
</div>
<div className="md:col-span-7">
<p className="text-xs font-semibold text-outline mb-2">OCTOBER 12, 2024</p>
<h3 className="text-2xl font-semibold mb-4 tracking-tight">Diagnostic Imaging Workflow Upgrade</h3>
<p className="text-on-surface-variant max-w-2xl">Expanding radiology review capacity with updated imaging worklists, clearer escalation paths, and faster result handoff.</p>
</div>
<div className="md:col-span-2 flex justify-end">
<button className="text-primary font-semibold py-2 px-6 border-b-2 border-transparent hover:border-primary transition-all">Read</button>
</div>
</div>
</div>
{/* Band 4: Gray 10 */}
<div className="bg-surface-container-low px-8 py-16">
<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
<div className="md:col-span-3">
<Image className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Group of diverse medical professionals in scrubs walking through a high-tech hospital corridor discussing charts" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqiI2MaUzCDcjQ6plSej4lielHmRTW4x-3dMwqXe7nqEJUMP2nESwd2WPa1KH4kIpzVIZvDdFp7oRe_qChtXPgL2SfpDfDw9iPmfC1MYb9G0RFGtL8DYob2W0ZQAwNihrxT4ZUe-SO7NMGjOoK2MaSqLEAONU-XGyc_8ZX00fwtFETt89WPhppxMc-ZiSfHW_pge5oKdpQLeS2f-WLAbq0eF2HsqFdOo0bbBZKon8mueAJ-pRcz7DyHIfPhloT61JE5_kuW8yCaA" width={1200} height={800}/>
</div>
<div className="md:col-span-7">
<p className="text-xs font-semibold text-outline mb-2">OCTOBER 08, 2024</p>
<h3 className="text-2xl font-semibold mb-4 tracking-tight">Annual HMS Global Symposium</h3>
<p className="text-on-surface-variant max-w-2xl">Key findings from the 2024 Medicore Global Health Summit on sustainable healthcare delivery in urban environments.</p>
</div>
<div className="md:col-span-2 flex justify-end">
<button className="text-primary font-semibold py-2 px-6 border-b-2 border-transparent hover:border-primary transition-all">Read</button>
</div>
</div>
</div>
</section>
{/* Pagination / Load More */}
<div className="flex justify-center py-24 bg-surface">
<button className="bg-on-surface text-white px-12 py-4 font-semibold uppercase tracking-widest text-sm hover:bg-primary transition-colors">
                Load Archive
            </button>
</div>

</main>
    </>
  );
}
