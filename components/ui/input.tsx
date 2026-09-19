import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
};

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex w-full rounded-md border border-hairline bg-surface px-3 py-1 font-mono text-base font-medium text-foreground placeholder:text-muted transition-colors duration-150 ease-terminal focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent focus-visible:outline-offset-2",
        className
      )}
      {...props}
    />
  );
}
