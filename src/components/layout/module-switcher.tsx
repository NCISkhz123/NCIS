"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { ModuleKey } from "@/lib/modules";
import { cn } from "@/lib/utils";

type ModuleRecord = {
  key: ModuleKey;
  label: string;
  description: string;
  href: string;
};

type ModuleSwitcherProps = {
  activeModuleKey: ModuleKey;
  availableModuleKeys: readonly ModuleKey[];
  onNavigate?: (href: string) => void;
  modules: readonly ModuleRecord[];
  className?: string;
  compact?: boolean;
};

function getEffectiveAvailableKeys(
  activeModuleKey: ModuleKey,
  availableModuleKeys: readonly ModuleKey[]
) {
  return availableModuleKeys.includes(activeModuleKey)
    ? availableModuleKeys
    : [activeModuleKey];
}

export function ModuleSwitcher({
  activeModuleKey,
  availableModuleKeys,
  onNavigate,
  modules,
  className,
  compact = false,
}: ModuleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const effectiveAvailableKeys = useMemo(
    () => getEffectiveAvailableKeys(activeModuleKey, availableModuleKeys),
    [activeModuleKey, availableModuleKeys]
  );
  const activeModule =
    modules.find((module) => module.key === activeModuleKey) ?? modules[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  function closeOnBlur() {
    window.setTimeout(() => {
      const activeElement = document.activeElement;

      if (!rootRef.current?.contains(activeElement)) {
        setIsOpen(false);
      }
    }, 0);
  }

  function handleEscape() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleOpenToggle() {
    setIsOpen((current) => !current);
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative", compact ? "min-w-0" : "w-full", className)}
      onBlurCapture={isOpen ? closeOnBlur : undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          handleEscape();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleOpenToggle}
        className={cn(
          "inline-flex w-full items-center justify-between gap-3 rounded-full border font-semibold uppercase transition-colors",
          compact
            ? "border-slate-200 bg-white px-3 py-2 text-[0.72rem] tracking-[0.2em] text-slate-700"
            : "border-white/12 bg-white/8 px-3 py-1 text-[0.68rem] tracking-[0.28em] text-sky-100 hover:bg-white/12"
        )}
      >
        <span className="truncate">{activeModule.label} Module</span>
        <span aria-hidden="true" className="text-[0.65rem]">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen ? (
        <div
          id={panelId}
          role="group"
          aria-label="Pilihan modul NCIS"
          className={cn(
            "absolute z-20 mt-3 grid min-w-[15rem] gap-2 rounded-[1.25rem] border border-slate-200 bg-white p-2 shadow-xl",
            compact ? "right-0 w-[min(18rem,calc(100vw-2rem))]" : "left-0 w-full"
          )}
        >
          {modules.map((module) => {
            const isActive = module.key === activeModuleKey;
            const isEnabled = effectiveAvailableKeys.includes(module.key);

            if (isActive) {
              return (
                <button
                  key={module.key}
                  type="button"
                  onClick={() => undefined}
                  className="rounded-[1rem] border border-slate-900 bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm"
                >
                  <span className="block">{module.label}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-200">
                    {module.description}
                  </span>
                </button>
              );
            }

            if (!isEnabled || module.href === "#") {
              return (
                <button
                  key={module.key}
                  type="button"
                  tabIndex={-1}
                  aria-disabled="true"
                  aria-label={`${module.label} tidak tersedia`}
                  onClick={() => undefined}
                  className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-400"
                >
                  <span className="block text-slate-600">{module.label}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
                    {module.description}
                  </span>
                </button>
              );
            }

            if (onNavigate) {
              return (
                <button
                  key={module.key}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate(module.href);
                  }}
                  className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-950"
                >
                  <span className="block">{module.label}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
                    {module.description}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={module.key}
                href={module.href}
                onClick={() => setIsOpen(false)}
                className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-950"
              >
                <span className="block">{module.label}</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
                  {module.description}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
