import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-transparent bg-clip-padding text-[13px] font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-[var(--hc-blue-600)] focus-visible:ring-3 focus-visible:ring-[rgba(15,98,254,0.16)] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--hc-blue-600)] text-white shadow-[var(--shadow-blue)] hover:-translate-y-px hover:bg-[var(--hc-blue-700)] [a]:hover:bg-[var(--hc-blue-700)]",
        outline:
          "border-[var(--hc-border)] bg-white text-[var(--hc-text)] hover:border-[var(--hc-border-strong)] hover:bg-[var(--hc-surface-muted)] aria-expanded:bg-[var(--hc-surface-muted)] aria-expanded:text-[var(--hc-text)] dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border-[var(--hc-border)] bg-white text-[var(--hc-text)] hover:border-[var(--hc-border-strong)] hover:bg-[var(--hc-surface-muted)] aria-expanded:bg-[var(--hc-surface-muted)] aria-expanded:text-[var(--hc-text)]",
        filter:
          "border-[var(--hc-border)] bg-white text-[var(--hc-text)] shadow-none hover:bg-[var(--hc-surface-muted)]",
        ghost:
          "text-[var(--hc-text-secondary)] shadow-none hover:bg-[var(--hc-blue-50)] hover:text-[var(--hc-blue-600)] aria-expanded:bg-[var(--hc-blue-50)] aria-expanded:text-[var(--hc-blue-600)] dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Show a loading spinner and disable the button. */
    isLoading?: boolean
    /** Icon rendered before the button text. */
    leftIcon?: ReactNode
  }

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  leftIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-[18px] shrink-0 animate-spin" aria-hidden="true" />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
