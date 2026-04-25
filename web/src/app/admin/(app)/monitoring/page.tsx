import Image from "next/image";
import Link from "next/link";

export default function AdminMonitoringPage() {
  return (
    <>
      <main>

<div className="max-w-6xl">
{/* Header Section */}
<header className="mb-12">
<span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2 block">Monitoring Dashboard</span>
<h1 className="text-5xl font-light text-on-background tracking-tighter">HMS Operational Health</h1>
</header>
{/* Top Tabs */}
<div className="flex space-x-12 border-b border-surface-container-highest mb-12">
<button className="pb-4 text-sm font-semibold border-b-2 border-primary text-on-background">System Health</button>
<button className="pb-4 text-sm font-semibold border-b-2 border-transparent text-outline hover:text-on-background transition-colors">AI Assistant</button>
</div>
{/* Dashboard Grid */}
<div className="grid grid-cols-12 gap-8">
{/* System Health Section */}
<div className="col-span-12">
<div className="flex items-center justify-between mb-6">
<h2 className="text-lg font-semibold flex items-center">
<span className="material-symbols-outlined mr-2 text-primary" data-icon="lan">lan</span>
                            Critical Infrastructure
                        </h2>
<div className="flex items-center space-x-4 text-xs font-semibold text-outline uppercase">
<span className="flex items-center"><span className="w-2 h-2 bg-emerald-500 mr-2"></span> Operational</span>
<span className="flex items-center"><span className="w-2 h-2 bg-zinc-400 mr-2"></span> Maintenance</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-1">
{/* Database Card */}
<div className="bg-surface-container-low p-8 flex flex-col justify-between group hover:bg-surface-container-lowest transition-colors">
<div>
<span className="text-[10px] font-bold uppercase text-outline tracking-widest block mb-4">PostgreSQL Cluster</span>
<div className="text-2xl font-semibold mb-1">Database</div>
<div className="text-xs text-outline">Primary Write Instance: healthy-db-01</div>
</div>
<div className="mt-12 flex items-center">
<div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Active</div>
<div className="ml-auto text-emerald-500 font-mono text-xs">99.99% Uptime</div>
</div>
</div>
{/* Auth Service Card */}
<div className="bg-surface-container-low p-8 flex flex-col justify-between group hover:bg-surface-container-lowest transition-colors">
<div>
<span className="text-[10px] font-bold uppercase text-outline tracking-widest block mb-4">OAuth 2.1 / SAML</span>
<div className="text-2xl font-semibold mb-1">Auth Service</div>
<div className="text-xs text-outline">Active Sessions: 4,129</div>
</div>
<div className="mt-12 flex items-center">
<div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Active</div>
<div className="ml-auto text-emerald-500 font-mono text-xs">Latency: 14ms</div>
</div>
</div>
{/* API Gateway Card */}
<div className="bg-surface-container-low p-8 flex flex-col justify-between group hover:bg-surface-container-lowest transition-colors">
<div>
<span className="text-[10px] font-bold uppercase text-outline tracking-widest block mb-4">Kong Mesh v3.4</span>
<div className="text-2xl font-semibold mb-1">API Gateway</div>
<div className="text-xs text-outline">Traffic: 12.4k req/sec</div>
</div>
<div className="mt-12 flex items-center">
<div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Active</div>
<div className="ml-auto text-emerald-500 font-mono text-xs">Error Rate: 0.01%</div>
</div>
</div>
</div>
</div>
{/* AI Assistant Monitoring - Asymmetric Layout */}
<div className="col-span-12 mt-12">
<h2 className="text-lg font-semibold mb-8 flex items-center">
<span className="material-symbols-outlined mr-2 text-primary" data-icon="psychology">psychology</span>
                        GenAI Orchestration Metrics
                    </h2>
<div className="grid grid-cols-12 gap-8">
{/* Request Volume (The Data Monolith) */}
<div className="col-span-12 lg:col-span-4 bg-surface-container-highest p-8">
<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface mb-6 block">Request Volume</span>
<div className="text-6xl font-light tracking-tighter mb-4">84.2k</div>
<div className="flex items-end justify-between">
<span className="text-xs font-semibold text-primary">+12.4% from avg</span>
<div className="flex items-end space-x-1 h-12">
<div className="w-1 bg-primary h-4"></div>
<div className="w-1 bg-primary h-6"></div>
<div className="w-1 bg-primary h-3"></div>
<div className="w-1 bg-primary h-8"></div>
<div className="w-1 bg-primary h-12"></div>
<div className="w-1 bg-primary h-7"></div>
<div className="w-1 bg-primary h-10"></div>
</div>
</div>
</div>
{/* Charts Section */}
<div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-px bg-surface-container-highest">
{/* Latency Chart */}
<div className="bg-surface p-8">
<span className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4 block">Average Latency (ms)</span>
<div className="text-3xl font-semibold mb-8">342ms</div>
<div className="h-24 w-full bg-surface-container-low relative overflow-hidden">
{/* Simple SVG Line Chart Placeholder */}
<svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
<path d="M0 60 L40 55 L80 65 L120 40 L160 45 L200 30 L240 35 L280 20 L320 25 L360 10 L400 15" fill="none" stroke="#0f62fe" strokeWidth="2"></path>
</svg>
</div>
<div className="flex justify-between mt-2 text-[10px] font-mono text-outline">
<span>09:00</span>
<span>NOW</span>
</div>
</div>
{/* Success Rate */}
<div className="bg-surface p-8">
<span className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4 block">Success Rate</span>
<div className="text-3xl font-semibold mb-8 text-emerald-600">99.8%</div>
<div className="h-24 w-full bg-surface-container-low relative overflow-hidden">
<svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
<path d="M0 10 L40 12 L80 10 L120 11 L160 10 L200 10 L240 10 L280 11 L320 10 L360 10 L400 10" fill="none" stroke="#10b981" strokeWidth="2"></path>
</svg>
</div>
<div className="flex justify-between mt-2 text-[10px] font-mono text-outline">
<span>09:00</span>
<span>NOW</span>
</div>
</div>
</div>
</div>
</div>
{/* Secondary Intelligence Stats */}
<div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
<div className="border-t-2 border-primary pt-6">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Token Usage</div>
<div className="text-xl font-semibold">1.2M / day</div>
</div>
<div className="border-t-2 border-surface-container-highest pt-6">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Active Models</div>
<div className="text-xl font-semibold">Med-Llama 3.1</div>
</div>
<div className="border-t-2 border-surface-container-highest pt-6">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Cost / KReq</div>
<div className="text-xl font-semibold">$0.042</div>
</div>
<div className="border-t-2 border-surface-container-highest pt-6">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Node Count</div>
<div className="text-xl font-semibold">12 Clusters</div>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
