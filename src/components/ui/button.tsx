import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 font-semibold shadow-xs cursor-pointer",
        secondary:
          "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 font-semibold shadow-xs",
        outline:
          "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 font-semibold text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 font-semibold shadow-xs",
        link: "text-sky-600 underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 text-sm",
        xs: "h-6.5 gap-1 rounded-md px-2 text-xs font-medium [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-semibold [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10.5 gap-2 rounded-xl px-4.5 text-sm font-semibold [&_svg:not([class*='size-'])]:size-4",
        icon: "size-9 rounded-lg",
        "icon-xs": "size-6.5 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10.5 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
