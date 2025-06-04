import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function TooltipUI({ children, position = "top", arrow = true, className, ...props }) {
  const positionClasses = {
    top: "mb-2",
    right: "ml-2",
    bottom: "mt-2",
    left: "mr-2",
  }

  const arrowClasses = {
    top: "after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-current after:border-x-transparent after:border-b-0",
    right:
      "after:right-full after:top-1/2 after:-translate-y-1/2 after:border-r-current after:border-y-transparent after:border-l-0",
    bottom:
      "after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-b-current after:border-x-transparent after:border-t-0",
    left: "after:left-full after:top-1/2 after:-translate-y-1/2 after:border-l-current after:border-y-transparent after:border-r-0",
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className={cn(
          "bg-primary text-primary-foreground text-xs rounded-md px-2.5 py-1.5 max-w-xs z-50 shadow-sm",
          positionClasses[position],
          arrow && "after:absolute after:content-[''] after:border-4 after:border-solid after:text-primary",
          arrow && arrowClasses[position],
          className,
        )}
        role="tooltip"
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export const Tooltip = (props) => {
  const { primaryProps, closeProps, tooltipProps, step, isLastStep } = props

  return (
    <TooltipUI {...tooltipProps} arrow={false}>
      <div className="flex flex-col gap-2" >
        {step.title && <h2 className="w-full text-center">{step.title}</h2>}
        {step.content}
        {!step.hideFooter && (
          <div className="flex justify-end">
            {!isLastStep ? (
              <Button {...primaryProps}
                variant="secondary"
                size="xs"
              >
                Continue
              </Button>
            ) : (
              <Button {...closeProps}
                variant="destructive"
                size="xs"
              >
                End tour
              </Button>
            )}
          </div>
        )}
      </div>
    </TooltipUI>
  )
}
