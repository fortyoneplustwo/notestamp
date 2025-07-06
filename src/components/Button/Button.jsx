import { Button } from "@/components/ui/button"

export const DefaultButton = ({
  variant = "secondary",
  onClick,
  children,
  disabled,
  className = "",
  ...props
}) => (
  <Button
    className={`${className}`}
    variant={variant}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </Button>
)

export const MediaToolbarButton = ({
  onClick,
  className = "",
  children,
  ...props
}) => (
  <Button size="xs" className={`${className}`} onClick={onClick} {...props}>
    {children}
  </Button>
)

export const AppBarButton = ({
  variant = "outline",
  onClick,
  children,
  disabled,
  className = "",
  ...props
}) => (
  <Button
    size="xs"
    className={`${className}`}
    variant={variant}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </Button>
)
