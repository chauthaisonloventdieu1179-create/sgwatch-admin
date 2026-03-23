import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export interface customSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: Array<{ [key: string]: string }>;
  valueKey: string;
  labelKey: string;
  placeholder?: string;
}
const CustomSelect = ({ value, onValueChange, options, valueKey, labelKey, placeholder }: customSelectProps) => {
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onValueChange) {
      onValueChange("");
    }
  };
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "[&>svg:last-child]:hidden", // Ẩn ChevronDown mặc định
          value && "[&>div]:pr-0 [&>svg:last-child]:hidden"
        )}
      >
        <div className="flex items-center w-full justify-between h-full">
          <SelectValue placeholder={placeholder} />
          {value && (
            <div onClick={handleClear}>
              <X className="h-4 w-4" />
            </div>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem value={item[valueKey]} key={item[valueKey]}>
            {item[labelKey]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
