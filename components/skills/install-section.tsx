"use client";

import { useState } from "react";

interface InstallSectionProps {
  command: string;
}

export function InstallSection({ command }: InstallSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = command;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section aria-labelledby="install" className="relative">
      <h2 id="install" className="font-mono text-xl font-bold leading-[1.5] text-foreground">## installation</h2>
      <div className="mt-4 relative">
        <pre className="overflow-x-auto rounded-md border border-hairline bg-surface p-4 font-mono text-base font-medium text-foreground">
          {command}
          <span className="terminal-cursor ml-2" aria-hidden="true" />
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 rounded-md border border-hairline bg-surface px-3 py-1.5 font-mono text-xs font-medium text-muted transition-colors duration-150 ease-terminal hover:text-foreground hover:border-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent focus-visible:outline-offset-2"
          aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      {copied && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-md border border-hairline bg-surface px-4 py-2 font-mono text-sm font-medium text-foreground shadow-lg animate-in slide-in-from-bottom-2 duration-200"
          role="status"
          aria-live="polite"
        >
          Copied to clipboard
        </div>
      )}
    </section>
  );
}