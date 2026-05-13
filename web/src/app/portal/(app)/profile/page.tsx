
export default function PatientPortalProfilePage() {
  return (
    <>
      <main>

<div className="max-w-5xl mx-auto py-12 px-12">
<div className="mb-12">
<h1 className="text-4xl font-light text-on-surface tracking-tight mb-2">Patient Profile</h1>
<p className="text-on-surface-variant text-sm font-medium">Manage your personal information and security preferences.</p>
</div>
<div className="grid grid-cols-12 gap-12">
{/* Personal Info Form */}
<div className="col-span-12 lg:col-span-8">
<div className="space-y-12">
<section>
<h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Personal Information</h2>
<div className="grid grid-cols-2 gap-x-8 gap-y-10">
<div className="col-span-2 md:col-span-1">
<label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Full Name</label>
<div className="bg-surface-container-low border-b-2 border-outline focus-within:border-primary transition-colors">
<input aria-label="Full Name" className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 px-4 font-medium" type="text" defaultValue="Alexander Vance"/>
</div>
</div>
<div className="col-span-2 md:col-span-1">
<label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Date of Birth</label>
<div className="bg-surface-container-low border-b-2 border-outline focus-within:border-primary transition-colors">
<input aria-label="Date of Birth" className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 px-4 font-medium" type="text" defaultValue="May 14, 1982"/>
</div>
</div>
<div className="col-span-2 md:col-span-1">
<label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email Address</label>
<div className="bg-surface-container-low border-b-2 border-outline focus-within:border-primary transition-colors">
<input aria-label="Email Address" className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 px-4 font-medium" type="email" defaultValue="a.vance@example.com"/>
</div>
</div>
<div className="col-span-2 md:col-span-1">
<label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Phone Number</label>
<div className="bg-surface-container-low border-b-2 border-outline focus-within:border-primary transition-colors">
<input aria-label="Phone Number" className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 px-4 font-medium" type="tel" defaultValue="+1 (555) 902-1422"/>
</div>
</div>
<div className="col-span-2">
<label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Residential Address</label>
<div className="bg-surface-container-low border-b-2 border-outline focus-within:border-primary transition-colors">
<input aria-label="Residential Address" className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 px-4 font-medium" type="text" defaultValue="1288 Oakwood Heights, Suite 400"/>
</div>
<div className="grid grid-cols-3 gap-4 mt-4">
<div className="bg-surface-container-low border-b-2 border-outline">
<input aria-label="City" className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 px-4 text-sm" type="text" defaultValue="Boston"/>
</div>
<div className="bg-surface-container-low border-b-2 border-outline">
<input aria-label="State" className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 px-4 text-sm" type="text" defaultValue="MA"/>
</div>
<div className="bg-surface-container-low border-b-2 border-outline">
<input aria-label="Postal Code" className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 px-4 text-sm" type="text" defaultValue="02108"/>
</div>
</div>
</div>
</div>
</section>
<section id="security-settings">
<h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Security Settings</h2>
<div className="bg-surface-container-highest p-8 space-y-6">
<div className="flex items-center justify-between">
<div>
<p className="font-bold text-sm mb-1">Two-Factor Authentication</p>
<p className="text-xs text-on-surface-variant">Enhanced security for your patient records.</p>
</div>
<div className="w-12 h-6 bg-primary-container relative cursor-pointer">
<div className="absolute right-0 top-0 w-6 h-6 bg-white border-2 border-primary-container"></div>
</div>
</div>
<div className="flex items-center justify-between">
<div>
<p className="font-bold text-sm mb-1">Data Sharing Permissions</p>
<p className="text-xs text-on-surface-variant">Allow research institutes to access anonymized data.</p>
</div>
<div className="w-12 h-6 bg-surface-container-low border-2 border-outline-variant relative cursor-pointer">
<div className="absolute left-0 top-0 w-6 h-6 bg-white border-2 border-outline-variant"></div>
</div>
</div>
</div>
</section>
</div>
</div>
{/* Side Panels */}
<div className="col-span-12 lg:col-span-4 space-y-8">
{/* Emergency Contact Card */}
<div className="bg-surface-container-lowest p-8 border-t-4 border-error">
<h3 className="text-[10px] font-bold uppercase tracking-widest text-error mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="emergency">emergency</span>
                                Emergency Contact
                            </h3>
<div className="space-y-6">
<div>
<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Name</p>
<p className="font-bold text-lg">Sarah Jenkins-Vance</p>
</div>
<div>
<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Relationship</p>
<p className="font-medium">Spouse</p>
</div>
<div>
<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Phone</p>
<p className="font-bold text-primary">+1 (555) 902-1423</p>
</div>
<button className="w-full py-3 px-4 border border-outline text-xs font-bold uppercase tracking-widest hover:bg-surface-container-low transition-colors">
                                    Edit Contact
                                </button>
</div>
</div>
{/* Data Monolith */}
<div className="bg-surface-container-highest p-8">
<h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-8">Medical Stats</h3>
<div className="space-y-8">
<div className="flex flex-col">
<span className="text-4xl font-light tracking-tighter">O+</span>
<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Blood Type</span>
</div>
<div className="flex flex-col">
<span className="text-4xl font-light tracking-tighter">72</span>
<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Avg BPM</span>
</div>
<div className="flex flex-col">
<span className="text-4xl font-light tracking-tighter">184<span className="text-xl">cm</span></span>
<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Height</span>
</div>
</div>
</div>
</div>
</div>
{/* Global Action Footer */}
<div className="mt-16 flex items-center justify-between py-12 border-t-2 border-surface-container-highest">
<p className="text-xs text-on-surface-variant">Last profile update: 14 days ago</p>
<div className="flex items-center space-x-6">
<button className="text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-surface-container-high transition-colors">Discard changes</button>
<button className="bg-primary-container text-white text-xs font-bold uppercase tracking-widest px-12 py-4 shadow-[0_2px_0_0_#003da9] active:shadow-none active:translate-y-[2px] transition-all">
                            Save Changes
                        </button>
</div>
</div>
</div>

</main>
    </>
  );
}
