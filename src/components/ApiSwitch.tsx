import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ApiSwitchProps {
  name: string;
  label?: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const ApiSwitch = ({
  name,
  label,
  description,
  checked = false,
  onChange,
  className,
  disabled = false,
}: ApiSwitchProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch
        id={name}
        name={name}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      <div className="grid gap-1.5 leading-none">
        {label && (
          <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </Label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ApiSwitch;