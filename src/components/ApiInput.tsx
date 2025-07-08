import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ApiInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "password" | "number";
  hideLabel?: boolean;
}

const ApiInput = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  className,
  required = false,
  disabled = false,
  type = "text",
  hideLabel = false,
}: ApiInputProps) => {
  return (
    <div className={cn(hideLabel ? "" : "space-y-2", className)}>
      {label && !hideLabel && (
        <Label htmlFor={name} className={required ? "after:content-['*'] after:text-destructive" : ""}>
          {label}
        </Label>
      )}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
      />
    </div>
  );
};

export default ApiInput;