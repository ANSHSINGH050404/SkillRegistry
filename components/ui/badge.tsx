import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-hairline bg-transparent px-2.5 py-0.5 font-mono text-xs font-medium text-muted transition-colors duration-150 ease-terminal",
        className
      )}
      {...props}
    />
  );
}
