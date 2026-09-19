"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  name: string;
  label: string;
  placeholder?: string;
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  hint?: string;
  allowCustom?: boolean;
  maxSelections?: number;
  disabled?: boolean;
}

export function Combobox({
  name,
  label,
  placeholder = "Select or type...",
  options,
  value,
  onChange,
  error,
  hint,
  allowCustom = true,
  maxSelections,
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    !value.includes(opt.value) &&
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (opt: ComboboxOption) => {
    if (maxSelections && value.length >= maxSelections) return;
    onChange([...value, opt.value]);
    setInputValue("");
    setHighlightedIndex(-1);
    if (!allowCustom) setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (allowCustom && inputValue.trim() && !value.includes(inputValue.trim())) {
          const newVal = inputValue.trim();
          if (!maxSelections || value.length < maxSelections) {
            onChange([...value, newVal]);
            setInputValue("");
            setHighlightedIndex(-1);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setInputValue("");
        setHighlightedIndex(-1);
        break;
      case "Backspace":
        if (!inputValue && value.length > 0) {
          handleRemove(value[value.length - 1]);
        }
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay to allow click on options
    setTimeout(() => {
      if (!listRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
        setInputValue("");
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      const optionEl = listRef.current?.querySelector(`[data-index="${highlightedIndex}"]`);
      optionEl?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="w-full">
      <label htmlFor={name} className="font-mono text-base font-medium text-foreground">
        {label}
      </label>

      {/* Selected chips */}
      <div className="mt-2 flex flex-wrap gap-2 min-h-[44px]">
        {value.map((v) => {
          const opt = options.find((o) => o.value === v);
          return (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-2.5 py-1 font-mono text-sm font-medium text-foreground"
            >
              {opt?.label || v}
              <button
                type="button"
                onClick={() => handleRemove(v)}
                className="text-muted hover:text-foreground transition-colors"
                aria-label={`Remove ${opt?.label || v}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        {/* Input */}
        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            id={name}
            name={name}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            onBlur={handleBlur}
            placeholder={value.length > 0 ? "" : placeholder}
            disabled={!!disabled || Boolean(maxSelections && value.length >= maxSelections)}
            className={cn(
              "w-full bg-transparent py-1.5 font-mono text-base font-medium text-foreground placeholder:text-muted",
              "focus-visible:outline-none",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-autocomplete="list"
            aria-controls={name + "-list"}
            aria-activedescendant={highlightedIndex >= 0 ? `${name}-option-${highlightedIndex}` : undefined}
          />

          {isOpen && filteredOptions.length > 0 && (
            <div
              ref={listRef}
              id={name + "-list"}
              role="listbox"
              className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-hairline bg-surface shadow-lg font-mono text-base"
            >
              {filteredOptions.map((opt, idx) => (
                <div
                  key={opt.value}
                  role="option"
                  id={`${name}-option-${idx}`}
                  data-index={idx}
                  aria-selected={idx === highlightedIndex}
                  className={cn(
                    "px-3 py-2 cursor-pointer transition-colors",
                    idx === highlightedIndex && "bg-muted/50 text-foreground"
                  )}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                >
                  {opt.label}
                </div>
              ))}
              {allowCustom && inputValue.trim() && !value.includes(inputValue.trim()) && !options.some((o) => o.value === inputValue.trim()) && (
                <div
                  role="option"
                  aria-selected={false}
                  className="px-3 py-2 cursor-pointer text-accent border-t border-hairline"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const newVal = inputValue.trim();
                    if (!maxSelections || value.length < maxSelections) {
                      onChange([...value, newVal]);
                      setInputValue("");
                      setHighlightedIndex(-1);
                    }
                  }}
                >
                  Add &apos;{inputValue.trim()}&apos;
                </div>
              )}
              {filteredOptions.length === 0 && !allowCustom && (
                <div className="px-3 py-2 text-muted">No options match</div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-1 font-mono text-base font-medium text-danger">{error}</p>}
      {hint && !error && <p className="mt-1 font-mono text-xs font-medium text-muted">{hint}</p>}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}