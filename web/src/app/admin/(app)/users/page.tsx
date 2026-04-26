import Image from "next/image";

export default function AdminUsersPage() {
  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-hms-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2 block">
            System Administration
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-hms-on-background">
            Staff Directory
          </h1>
        </div>
        <button className="bg-hms-primary-container hover:bg-hms-primary text-white px-6 py-3 flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-lg">person_add</span>
          <span className="font-bold text-xs uppercase tracking-widest">
            Add User
          </span>
        </button>
      </div>

      {/* Dashboard Stats (Editorial Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-hms-surface-container mb-12">
        <div className="bg-hms-surface p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-hms-outline mb-2">
            Total Staff
          </p>
          <p className="text-4xl font-light tracking-tighter">142</p>
        </div>
        <div className="bg-hms-surface p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-hms-outline mb-2">
            Medical Dept
          </p>
          <p className="text-4xl font-light tracking-tighter">84</p>
        </div>
        <div className="bg-hms-surface p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-hms-outline mb-2">
            Administration
          </p>
          <p className="text-4xl font-light tracking-tighter">32</p>
        </div>
        <div className="bg-hms-surface p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-hms-outline mb-2">
            Support Services
          </p>
          <p className="text-4xl font-light tracking-tighter">26</p>
        </div>
      </div>

      {/* Table Filters */}
      <div className="bg-hms-surface-container-low p-1 mb-px">
        <div className="flex flex-col md:flex-row gap-4 items-center p-4">
          <div className="flex-1 w-full relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-hms-outline">
              search
            </span>
            <input
              className="w-full bg-hms-surface border-none border-b-2 border-hms-outline focus:border-hms-primary focus:ring-0 pl-12 py-3 text-sm placeholder:uppercase placeholder:text-[10px] placeholder:font-bold placeholder:tracking-widest outline-none"
              placeholder="Search by name, email or ID..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select className="bg-hms-surface border-none border-b-2 border-hms-outline focus:border-hms-primary focus:ring-0 py-3 px-4 text-xs font-bold uppercase tracking-widest w-full md:w-48 outline-none">
              <option>Role: All</option>
              <option>Practitioner</option>
              <option>Nurse</option>
              <option>Administrator</option>
            </select>
            <select className="bg-hms-surface border-none border-b-2 border-hms-outline focus:border-hms-primary focus:ring-0 py-3 px-4 text-xs font-bold uppercase tracking-widest w-full md:w-48 outline-none">
              <option>Status: Active</option>
              <option>Inactive</option>
              <option>On Leave</option>
            </select>
            <button className="p-3 bg-hms-surface text-hms-on-background hover:bg-hms-surface-container-high transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff CRUD Table */}
      <div className="bg-hms-surface-container-low overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-hms-surface-container-highest">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                Full Name
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                Email
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                Role
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                Department
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hms-surface-container">
            {/* Table Row 1 */}
            <tr className="hover:bg-hms-surface-container-lowest transition-colors group">
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-200">
                    <Image
                      alt="Staff headshot"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMi4NtrE7cLB-Mg3cJYSCqkgwn7PaewieL2gpyct8ToDhhOv6pM9Ria7FtpDLvOljDnmj327VzsU2DS1TCzelIubv-g_6ePASDSDxceaH7R3qTkIT8oXXKC1wZZZDEr_5QtR_i6Tsl9PcWc2JzvxM2nd7i0VJUuYHag2GroqwS96PkRJpGcPDC3u2vwdCeBFMu25L7Od0LIyeHZtPpNqffSwhAD71T3XFWI7m5RUuTwHkoX2yjaajl1o3mwUv4IGr4QbiNk1f-Cg"
                     width={1200} height={800}/>
                  </div>
                  <span className="text-sm font-semibold tracking-tight">
                    Sarah Kingston
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 text-sm text-hms-on-surface-variant">
                s.kingston@medcore.com
              </td>
              <td className="px-6 py-6">
                <span className="bg-hms-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-tighter">
                  Chief Surgeon
                </span>
              </td>
              <td className="px-6 py-6 text-sm">Medical Services</td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Active
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-hms-primary-container hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button className="p-2 hover:bg-hms-error hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                  </button>
                </div>
              </td>
            </tr>

            {/* Table Row 2 */}
            <tr className="hover:bg-hms-surface-container-lowest transition-colors group">
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-200">
                    <Image
                      alt="Staff headshot"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKAPoXyvhq28iZKMMaEZRu2d_7Gkgnx6CHbC4On3BNvF0F4TV_CVxMYN4hlj4D4tAkCYfC1LaikoDEAzwyWN2piQYW8KY2I4qi0pRFzPZqHqIu1bpKy_NKaSzurafBboD5D-dQJNdoDBa8AOZ235uLUzoo_axMyYkzt5M55RLw7_MrjhL7lGHvHxOiaO17ozBVphqu-I5XR7_LPBzuHwu9FMJG82jTI3iOE_5BHI0dglKQKu5DA0fKlear88H5PzIAgaGtQkbgzQ"
                     width={1200} height={800}/>
                  </div>
                  <span className="text-sm font-semibold tracking-tight">
                    Marcus Bennett
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 text-sm text-hms-on-surface-variant">
                m.bennett@medcore.com
              </td>
              <td className="px-6 py-6">
                <span className="bg-hms-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-tighter">
                  Clinical Admin
                </span>
              </td>
              <td className="px-6 py-6 text-sm">Administration</td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Active
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-hms-primary-container hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button className="p-2 hover:bg-hms-error hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                  </button>
                </div>
              </td>
            </tr>

            {/* Table Row 3 */}
            <tr className="hover:bg-hms-surface-container-lowest transition-colors group">
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-200">
                    <Image
                      alt="Staff headshot"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkuOcLIWn-PawnT9q_IZifFWMrnKPIvgQgPFs8PIkaG9iIR3KQCuDMUadNmveiyJDmCLh1wY4Vp2I5snF4aK5NtcpUDiOybCefBzw6ZpT1CA5Ujnz1up9ZL6s3fQZyP9OcgI4jFhYXccaYiEI5CRadD5XUlblPY4pzNkcN-c-99MKn2pk6o9Fh3lJck2rd9SaywTW56qDSMBQYcvfN6tc03pYd7bc-j9UKIopq45CpBNs4LP-VW3jtYwhHlkR68sGOvKIxRcsC_Q"
                     width={1200} height={800}/>
                  </div>
                  <span className="text-sm font-semibold tracking-tight">
                    Elena Lopez
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 text-sm text-hms-on-surface-variant">
                e.lopez@medcore.com
              </td>
              <td className="px-6 py-6">
                <span className="bg-hms-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-tighter">
                  Head Nurse
                </span>
              </td>
              <td className="px-6 py-6 text-sm">Emergency Dept</td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-hms-outline">
                    Inactive
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-hms-primary-container hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button className="p-2 hover:bg-hms-error hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 p-4 bg-hms-surface-container-low border-t border-hms-outline-variant/15">
        <span className="text-[10px] font-bold uppercase tracking-widest text-hms-outline">
          Showing 1-10 of 142 Staff members
        </span>
        <div className="flex gap-1">
          <button className="w-10 h-10 bg-hms-surface flex items-center justify-center hover:bg-hms-primary-container hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">
              chevron_left
            </span>
          </button>
          <button className="w-10 h-10 bg-hms-primary-container text-white flex items-center justify-center">
            1
          </button>
          <button className="w-10 h-10 bg-hms-surface flex items-center justify-center hover:bg-hms-primary-container hover:text-white transition-colors">
            2
          </button>
          <button className="w-10 h-10 bg-hms-surface flex items-center justify-center hover:bg-hms-primary-container hover:text-white transition-colors">
            3
          </button>
          <button className="w-10 h-10 bg-hms-surface flex items-center justify-center hover:bg-hms-primary-container hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
