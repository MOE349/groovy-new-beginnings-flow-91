import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ApiTextAreaProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

const ApiTextArea = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  className,
  required = false,
  disabled = false,
  rows = 1,
}: ApiTextAreaProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className={required ? "after:content-['*'] after:text-destructive" : ""}>
          {label}
        </Label>
      )}
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        rows={rows}
        className={value ? "bg-blue-50/70" : ""}
      />
    </div>
  );
};

export default ApiTextArea;