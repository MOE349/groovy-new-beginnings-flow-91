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
  type?: "text" | "email" | "password" | "number" | "hidden";
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
}: ApiInputProps) => {
  // If type is hidden, render only the hidden input without label or wrapper
  if (type === "hidden") {
    return (
      <Input
        id={name}
        name={name}
        type="hidden"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
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
        className={value ? "bg-blue-50/70" : ""}
      />
    </div>
  );
};

export default ApiInput;