import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
        {/* Icon */}
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-destructive/10">
          <ShieldX className="size-8 text-destructive" aria-hidden="true" />
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your current role is not authorized to view this page. If you
            believe this is an error, please contact your system administrator
            or try logging in with a different account.
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/staff/login"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
          >
            Staff Login
          </Link>
          <Link
            href="/portal/login"
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-transparent px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
          >
            Patient Login
          </Link>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-6 text-sm sm:flex-row sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to Home
          </Link>
          <Link
            href="/support"
            className="font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact Administrator
          </Link>
        </div>
      </div>
    </main>
  );
}
