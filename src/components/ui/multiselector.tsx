"use client";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { X } from "@mynaui/icons-react";

function Multiselect({
  placeholder = "Tìm kiếm",
  label,
  options = [],
  value = [],
  optionKey,
  onChange,
  className,
}: {
  placeholder?: string;
  label: string;
  value: Array<object>;
  options?: Array<object>;
  onChange?: Function;
  optionKey: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const handleSetValue = (val: any) => {
    const checkItem = value.find(
      (item: any) => item[optionKey] === val[optionKey]
    );
    var newValue = [];
    if (checkItem) {
      newValue = value.filter(
        (item: any) => item[optionKey] !== val[optionKey]
      );
    } else {
      newValue = [...value, val];
    }
    if (onChange) onChange(newValue);
  };
  const handleToggle = (e: any) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };
  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div
          aria-expanded={open}
          className={cn(
            "flex w-full border items-center p-2 cursor-pointer rounded-md",
            className
          )}
          onClick={handleToggle}
        >
          <div className="flex justify-start flex-1 flex-wrap">
            {value?.length ? (
              value.map((val: any) => (
                <div
                  key={val[optionKey]}
                  className="flex items-center mb-1 py-1 mt-1 px-2 rounded-lg border bg-slate-200 mr-2"
                >
                  <X className="h-5" onClick={() => handleSetValue(val)} />
                  <div className="text-xs font-medium">{val[label]}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">{placeholder}</div>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-full p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)", zIndex: 100 }}
        onInteractOutside={() => setOpen(false)}
        onClick={(_e) => {}}
      >
        <Command>
          <CommandInput placeholder="Tìm kiếm" />
          <CommandEmpty>Không có dữ liệu</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((item: any) => (
                <CommandItem
                  key={item[optionKey]}
                  value={item[optionKey]}
                  onSelect={() => {
                    handleSetValue(item);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.find(
                        (val: any) => val[optionKey] === item[optionKey]
                      )
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {item[label]}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Multiselect;
