
import { HcIcon } from "@/components/ui/hc-icon";
export default function SessionExpiredPage() {
  return (
    <>
      <main>

<div className="w-full max-w-2xl bg-surface-container-lowest p-16 flex flex-col items-start gap-12 ring-1 ring-outline-variant/15">
{/* Branding Anchor */}
<div className="flex items-center gap-2 mb-4">
<span className="text-lg font-bold uppercase tracking-widest text-on-surface">HMS Precision</span>
</div>
{/* Content Container */}
<div className="space-y-8 w-full">
{/* Large Warning Icon (Yellow/Red technical tones) */}
<div className="text-error">
<HcIcon name="report" className="!text-7xl" />
</div>
{/* Headline & Subtext */}
<div className="space-y-4">
<h1 className="text-5xl font-light tracking-tight text-on-surface leading-tight">Session Expired</h1>
<p className="text-xl text-on-surface-variant font-normal leading-relaxed max-w-lg">
                        Your session has timed out for security reasons. Please log in again to continue.
                    </p>
</div>
{/* Navigation Action */}
<div className="pt-4">
<button className="bg-primary-container text-on-primary font-semibold px-12 py-5 rounded-none flex items-center gap-3 hover:bg-primary transition-all active:opacity-80">
<span>Return to Login</span>
<HcIcon name="login" />
</button>
</div>
</div>
{/* Footer Meta */}
<div className="w-full pt-16 flex justify-between items-center text-xs font-bold uppercase tracking-tighter text-outline opacity-60">
<div className="flex gap-6">
<span>Precision Care Unit</span>
<span>Error Code: 401_SEC_TIMEOUT</span>
</div>
<div className="flex items-center gap-2">
<HcIcon name="shield_lock" className="!text-sm" />
<span>Encrypted Session Management</span>
</div>
</div>
</div>

</main>
    </>
  );
}
