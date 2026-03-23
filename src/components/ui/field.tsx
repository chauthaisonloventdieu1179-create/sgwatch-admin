"use client";
import * as React from "react";
import { Input, InputProps } from "./input";
import { Textarea } from "./textarea";
import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select";
//import { DatePicker, DatePickerProps } from "@/components/ui/datepicker";
import eventEmitter from "@/lib/eventEmitter";
import KEY_EMIT_ERROR_FORM from "@/lib/request";
import CustomSelect, { customSelectProps } from "./custom-select";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { Switch } from "./switch";
import { CheckboxProps } from "@radix-ui/react-checkbox";
import { Checkbox } from "@/components/ui/checkbox";

interface InputFieldProps extends InputProps {
  fieldType: "input";
  filedName?: string;
  type?: string;
}

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fieldType: "textarea";
  filedName?: string;
  resize?: boolean;
}

interface MultiselectFieldProps extends MultiSelectProps {
  fieldType: "multiselect";
  filedName?: string;
}

// interface DatePickerFieldProps extends DatePickerProps {
//   fieldType: "datepicker";
//   filedName?: string;
//   format?: string;
// }

interface SelectFieldProps extends customSelectProps {
  fieldType: "select";
  filedName?: string;
  className?: string;
}
interface SwitchFieldProps extends SwitchPrimitives.SwitchProps {
  fieldType: "switch";
  filedName?: string;
  className?: string;
}

interface CheckboxFieldProps extends CheckboxProps {
  fieldType: "checkbox";
  filedName?: string;
  className?: string;
}

type FieldProps =
  | InputFieldProps
  | TextareaFieldProps
  | MultiselectFieldProps
  // | DatePickerFieldProps
  | SelectFieldProps
  | SwitchFieldProps
  | CheckboxFieldProps;

const components = {
  input: Input,
  textarea: Textarea,
  multiselect: MultiSelect,
  // datepicker: DatePicker,
  select: CustomSelect,
  switch: Switch,
  checkbox: Checkbox,
};
const Field = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement,
  FieldProps
>(({ fieldType, filedName, className, ...props }, ref) => {
  const [fieldErrors, setFieldErrors] = React.useState<string[]>([]);

  // eventEmitter.on(KEY_EMIT_ERROR_FORM, (data) => {
  //   const errors = filedName && data[filedName] ? data[filedName] : [];
  //   setFieldErrors(errors);
  // });

  const Component = components[fieldType] as any;
  return (
    <div className="w-full flex flex-col">
      <Component ref={ref} className={className} {...props} />
      <div className="mt-1">
        {fieldErrors.map((error: string, index: number) => (
          <div key={index} className="text-xs text-red-500">
            {error}
          </div>
        ))}
      </div>
    </div>
  );
});

Field.displayName = "Field";

export { Field };
