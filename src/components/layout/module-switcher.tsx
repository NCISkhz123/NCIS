"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Layers, Shirt } from "lucide-react";

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
        aria-label={`${activeModule.label} module`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleOpenToggle}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2.5 rounded-xl transition-all cursor-pointer active:scale-[0.99]",
          compact
            ? "border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
            : "border border-white/5 bg-white/5 px-3 py-2.5 text-sm font-semibold tracking-wide text-slate-100 hover:bg-white/10"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {activeModuleKey === "LAUNDRY" ? (
            <Shirt className="h-5 w-5 text-sky-400 shrink-0" />
          ) : (
            <Layers className="h-5 w-5 text-sky-400 shrink-0" />
          )}
          <span className="truncate">{activeModule.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150",
            isOpen && "rotate-180 text-sky-400"
          )}
        />
      </button>

      {isOpen ? (
        <div
          id={panelId}
          role="group"
          aria-label="Pilihan modul NCIS"
          className={cn(
            "absolute z-30 mt-2 grid gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95",
            compact ? "right-0 min-w-[16rem] w-[min(18rem,calc(100vw-2rem))]" : "left-0 w-full"
          )}
        >
          {modules.map((module) => {
            const isActive = module.key === activeModuleKey;
            const isEnabled = effectiveAvailableKeys.includes(module.key);
            const ModuleIcon = module.key === "LAUNDRY" ? Shirt : Layers;

            if (isActive) {
              return (
                <button
                  key={module.key}
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-50/80 p-3 text-left shadow-2xs w-full"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                    <ModuleIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {module.label}
                      </span>
                      <Check className="h-4 w-4 text-sky-600" />
                    </div>
                    <span className="mt-0.5 block text-[0.72rem] leading-normal text-slate-600">
                      {module.description}
                    </span>
                  </div>
                </button>
              );
            }

            if (!isEnabled || module.href === "#") {
              return (
                <button
                  key={module.key}
                  type="button"
                  aria-disabled="true"
                  tabIndex={-1}
                  onClick={() => setIsOpen(true)}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-left opacity-60 w-full"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
                    <ModuleIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-500">
                      {module.label} (Tidak tersedia)
                    </span>
                    <span className="mt-0.5 block text-[0.72rem] leading-normal text-slate-400">
                      {module.description}
                    </span>
                  </div>
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
                  className="flex items-start gap-3 rounded-xl border border-transparent p-3 text-left transition-all hover:border-slate-200 hover:bg-slate-50 w-full"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <ModuleIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900">
                      {module.label}
                    </span>
                    <span className="mt-0.5 block text-[0.72rem] leading-normal text-slate-500">
                      {module.description}
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={module.key}
                href={module.href}
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-3 rounded-xl border border-transparent p-3 text-left transition-all hover:border-slate-200 hover:bg-slate-50 w-full"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <ModuleIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900">
                    {module.label}
                  </span>
                  <span className="mt-0.5 block text-[0.72rem] leading-normal text-slate-500">
                    {module.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
