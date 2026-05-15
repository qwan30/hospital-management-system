import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex min-h-[22px] w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-xs)] border border-transparent px-2 py-[3px] text-[10px] font-extrabold uppercase leading-[14px] tracking-[0.02em] whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[var(--hc-info-bg)] text-[var(--hc-info)] [a]:hover:bg-[var(--hc-blue-100)]",
        secondary:
          "bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)] [a]:hover:bg-[var(--hc-border)]",
        success:
          "bg-[var(--hc-success-bg)] text-[var(--hc-success)] [a]:hover:bg-[var(--hc-success-bg)]",
        warning:
          "bg-[var(--hc-warning-bg)] text-[var(--hc-low-stock)] [a]:hover:bg-[var(--hc-warning-bg)]",
        danger:
          "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] [a]:hover:bg-[var(--hc-danger-bg)]",
        info:
          "bg-[var(--hc-info-bg)] text-[var(--hc-info)] [a]:hover:bg-[var(--hc-info-bg)]",
        purple:
          "bg-[var(--hc-purple-bg)] text-[var(--hc-purple)] [a]:hover:bg-[var(--hc-purple-bg)]",
        destructive:
          "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-[var(--hc-danger-bg)]",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
