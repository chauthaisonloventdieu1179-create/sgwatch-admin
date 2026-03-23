import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {startIcon ? (
          <div
            className={
              "text-foreground-faded absolute left-3 text-center transition-all disabled:pointer-events-none disabled:opacity-50"
            }
          >
            {startIcon}
          </div>
        ) : null}

        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
            startIcon && "pl-10",
            endIcon && "pr-10"
          )}
          ref={ref}
          {...props}
        />
        {endIcon ? (
          <div className="absolute right-3 text-center transition-all disabled:pointer-events-none disabled:opacity-50">
            {endIcon}
          </div>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
