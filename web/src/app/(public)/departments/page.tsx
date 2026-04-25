const departmentCards = [
    {
        id: "Diagnostic Engineering",
        icon: "biotech",
        title: "Diagnostic Engineering",
        description:
            "Advanced imaging systems and pathology analytics integrated with real-time biometric feedback loops.",
        cta: "Explore Module",
    },
    {
        id: "Surgical Suite",
        icon: "precision_manufacturing",
        title: "Surgical Suite",
        description:
            "Robotic-assisted surgical environments maintained under ISO Class 5 sterility standards for ultra-precise interventions.",
        cta: "Operative Data",
    },
    {
        id: "Revenue Cycle",
        icon: "account_balance_wallet",
        title: "Revenue Cycle",
        description:
            "Automated fiscal management and insurance adjudication architecture designed for 100% transparency.",
        cta: "Fiscal Portal",
    },
    {
        id: "Centralized Registry",
        icon: "database",
        title: "Centralized Registry",
        description:
            "Encrypted patient data lake leveraging distributed ledger technology for absolute integrity across clinical clusters.",
        cta: "Access Ledger",
    },
];

export default function PublicDepartmentsPage() {
    return (
        <>
            <header className="border-0 bg-surface-container-lowest px-6 py-24 md:px-8">
                <div className="mx-auto max-w-[1440px]">
                    <div className="max-w-4xl">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                            Institutional Framework
                        </p>
                        <h1 className="mb-8 text-5xl leading-none tracking-tighter text-on-surface md:text-6xl">
                            Core Clinical Departments
                        </h1>
                        <p className="max-w-2xl text-xl font-normal leading-relaxed text-on-surface-variant">
                            Structured modules designed for modular integration across hospital
                            clusters. Optimized for high-throughput diagnostic and surgical
                            precision.
                        </p>
                    </div>
                </div>
            </header>

            <main className="bg-surface px-6 py-20 md:px-8">
                <div className="mx-auto max-w-[1440px]">
                    <div className="grid grid-cols-1 gap-0 bg-outline-variant/10 md:grid-cols-2 xl:grid-cols-4">
                        {departmentCards.map((card, index) => (
                            <article
                                key={card.id}
                                className={`group flex min-h-[400px] cursor-pointer flex-col justify-between border-b border-outline-variant/20 bg-surface-container-lowest p-8 transition-colors duration-300 hover:bg-surface-container-high ${index < departmentCards.length - 1 ? "xl:border-r" : ""}`}
                            >
                                <div>
                                    <div className="mb-12">
                                        <span className="material-symbols-outlined text-4xl text-primary">
                                            {card.icon}
                                        </span>
                                    </div>
                                    <h2 className="mb-4 text-2xl font-semibold tracking-tight text-on-surface">
                                        {card.title}
                                    </h2>
                                    <p className="text-sm leading-6 text-on-surface-variant">
                                        {card.description}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between border-t border-outline-variant/30 pt-8">
                                    <span className="text-xs font-semibold uppercase tracking-widest text-primary underline-offset-8 group-hover:underline">
                                        {card.cta}
                                    </span>
                                    <span className="material-symbols-outlined text-primary transition-transform group-hover:translate-x-2">
                                        arrow_forward
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <section className="overflow-hidden bg-surface-container px-6 py-24 md:px-8 md:py-32">
                <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-16 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <h2 className="mb-8 text-5xl/none font-light tracking-tight text-on-surface md:text-4xl">
                            Systemic Precision
                        </h2>

                        <div className="space-y-12">
                            <div>
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                                    01 Architecture
                                </span>
                                <p className="text-base leading-relaxed text-on-surface-variant">
                                    Each department operates as an autonomous node within the
                                    larger HMS ecosystem, ensuring fail-safe continuity of care
                                    during high-load scenarios.
                                </p>
                            </div>

                            <div>
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                                    02 Integration
                                </span>
                                <p className="text-base leading-relaxed text-on-surface-variant">
                                    Inter-departmental communication is mediated through our
                                    proprietary Carbon-Link protocol, reducing data latency by
                                    40% compared to legacy systems.
                                </p>
                            </div>

                            <button className="bg-on-surface px-8 py-3 text-xs font-semibold uppercase tracking-widest text-surface transition-all hover:opacity-90">
                                Technical Documentation
                            </button>
                        </div>
                    </div>

                    <div className="relative lg:col-span-7">
                        <div className="relative aspect-video bg-surface-container-highest">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4XSqqTiJld1_uOWOrBCprpDchv79zkxGxn7RdZVPnxDNf8G9KZpRjZSwa-0-Y-86AgLlx2JvFyoTOEiPC32CW0T7v80W3uR0cBRoDnDpdZBWxK_5rZC7MkctfTJINviVrSDSk7Vb8N3rQrPlZjpCcNjyjO_IDrbRBcUvh1gOZUhRAsk_LsbxEZKmHCq9ABZEr3hC0NS_2X0FkzGbKSxrIDbIdHlbLHomd8V_ARUcCH6CH6vw9-Zw4BHAG1V6yZjt3TbfvQqDohA"
                                alt="Modern clinical corridor"
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute -bottom-8 -right-8 hidden bg-primary-container p-12 md:block">
                                <div className="text-on-primary-container">
                                    <span className="mb-2 block text-5xl font-light leading-none">
                                        99.9%
                                    </span>
                                    <span className="text-xs uppercase tracking-[0.2em]">
                                        Operational Uptime
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    );
}
