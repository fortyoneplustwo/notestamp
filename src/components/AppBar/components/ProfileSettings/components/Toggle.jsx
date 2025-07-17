import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export const Toggle = ({ children, onToggle, isChecked }) => {
  return (
    <span className="flex items-center justify-center space-x-2">
      <Label className="text-xs">{children}</Label>
      <Switch
        className="data-[state=checked]:bg-[#FF4500]"
        onCheckedChange={onToggle}
        checked={isChecked}
      />
    </span>
  )
}
