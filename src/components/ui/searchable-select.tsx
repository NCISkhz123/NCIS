"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSelectProps {
  options: { value: string; label: string }[];
  name?: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

export function SearchableSelect({
  options,
  name,
  id,
  defaultValue = "",
  placeholder = "Pilih opsi...",
  disabled = false,
  className,
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);
  const [query, setQuery] = React.useState("");
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  // Filter options based on query
  const filteredOptions = React.useMemo(() => {
    if (!query) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query]);

  // Click outside to close
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery(""); // Reset query when closing
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    setValue(selectedValue);
    setQuery("");
    setIsOpen(false);
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} />}

      <div
        className={cn(
          "relative flex items-center w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          id={id}
          className="w-full bg-transparent outline-none cursor-pointer placeholder:text-slate-500"
          placeholder={selectedOption ? "" : placeholder}
          value={isOpen ? query : displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (value && e.target.value !== displayValue) {
              setValue("");
              if (onChange) onChange("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isOpen && filteredOptions.length > 0) {
              e.preventDefault();
              handleSelect(filteredOptions[0].value);
            }
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
        />
        
        {/* Placeholder text if input is empty but an option is selected and we are typing */}
        {isOpen && !query && selectedOption && (
          <span className="absolute left-4 text-slate-400 pointer-events-none truncate right-10">
            {displayValue}
          </span>
        )}

        <div className="absolute right-3 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect("");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-slate-500 text-center">
              Tidak ada hasil ditemukan.
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={cn(
                  "cursor-pointer px-4 py-2 transition-colors hover:bg-slate-50",
                  value === opt.value && "bg-sky-50 font-medium text-sky-900"
                )}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
