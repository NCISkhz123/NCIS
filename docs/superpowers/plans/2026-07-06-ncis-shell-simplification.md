# NCIS Shell Simplification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyederhanakan shell layout NCIS dengan menghapus panel header besar, memindahkan pemilihan modul ke shell ringkas desktop/mobile, mempertahankan logout, dan membersihkan detail sekunder di sidebar.

**Architecture:** Implementasi dibagi menjadi tiga bagian kecil: kontrak data akses modul + unit shell shared, integrasi ke CSSD/Laundry layouts, lalu penyederhanaan `SidebarNav` dan regression verification. Arah ini menjaga perubahan tetap fokus di shell layout tanpa melebar ke auth redirect flow atau mobile page navigation baru.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Testing Library

---

## File map

- `src/lib/modules.ts`
  Source of truth netral untuk `ModuleKey` dan daftar kunci modul yang bisa dipakai auth helper maupun shell components tanpa bergantung ke constants UI CSSD.
- `src/lib/auth/module-availability.ts`
  Source of truth tunggal untuk `getAvailableModuleKeys(role)` yang dipakai protected layouts.
- `tests/unit/auth/module-availability.test.ts`
  Regression test role -> available module keys.
- `src/components/layout/module-switcher.tsx`
  Shared client component untuk trigger modul, popover, active/disabled state, dan keyboard contract.
- `src/components/layout/logout-button.tsx`
  Shared shell logout control untuk desktop footer dan utility row mobile `< lg`.
- `tests/unit/components/layout/module-switcher.test.tsx`
  Test perilaku switcher: open/close, active click, disabled click, enabled navigation intent.
- `tests/unit/components/layout/logout-button.test.tsx`
  Smoke test untuk shared logout affordance.
- `src/components/layout/app-sidebar.tsx`
  Sidebar desktop yang akan menerima data modul, merender switcher desktop, lalu meletakkan logout di footer.
- `src/components/layout/module-header.tsx`
  Header halaman aktif yang disederhanakan, plus utility row `< lg` untuk switcher dan logout.
- `src/components/layout/sidebar-nav.tsx`
  Pembersihan detail grup: hapus `3 Menu`, deskripsi grup, dan `Buka/Tutup`.
- `src/app/(protected)/cssd/layout.tsx`
  Mengambil profile CSSD, menghitung `availableModuleKeys`, lalu meneruskan props shell yang dibutuhkan.
- `src/app/(protected)/laundry/layout.tsx`
  Padanan Laundry untuk data shell.
- `tests/unit/components/layout/module-header.test.tsx`
  Update assertion header CSSD ke struktur baru dan fallback route meta.
- `tests/unit/components/layout/module-header-laundry.test.tsx`
  Update assertion Laundry ke utility row dan module state baru.
- `tests/unit/components/layout/sidebar-nav.test.tsx`
  Update assertion agar memastikan grup tetap toggle tetapi tanpa copy sekunder lama.
- `tests/unit/components/layout/sidebar-nav-laundry.test.tsx`
  Padanan regression Laundry.

## Chunk 1: Shared shell contracts

### Task 1: Kunci kontrak role -> module availability

**Files:**
- Create: `tests/unit/auth/module-availability.test.ts`
- Create: `src/lib/modules.ts`
- Create: `src/lib/auth/module-availability.ts`
- Reference: `src/lib/auth/roles.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { getAvailableModuleKeys } from "@/lib/auth/module-availability";

describe("getAvailableModuleKeys", () => {
  it("returns CSSD only for CSSD roles", () => {
    expect(getAvailableModuleKeys("ADMIN_CSSD")).toEqual(["CSSD"]);
    expect(getAvailableModuleKeys("PETUGAS_CSSD")).toEqual(["CSSD"]);
  });

  it("returns Laundry only for Laundry roles", () => {
    expect(getAvailableModuleKeys("ADMIN_LAUNDRY")).toEqual(["LAUNDRY"]);
    expect(getAvailableModuleKeys("PETUGAS_LAUNDRY")).toEqual(["LAUNDRY"]);
  });

  it("returns no modules for unknown app users", () => {
    expect(getAvailableModuleKeys("USER")).toEqual([]);
    expect(getAvailableModuleKeys(null)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/auth/module-availability.test.ts`
Expected: FAIL with module not found or missing export for `getAvailableModuleKeys`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/modules.ts
export const ALL_MODULE_KEYS = ["CSSD", "LAUNDRY", "AMBULANCE"] as const;
export type ModuleKey = (typeof ALL_MODULE_KEYS)[number];
```

```ts
// src/lib/auth/module-availability.ts
import type { AppRole } from "@/lib/auth/roles";
import type { ModuleKey } from "@/lib/modules";

export function getAvailableModuleKeys(role: AppRole): readonly ModuleKey[] {
  if (role === "ADMIN_CSSD" || role === "PETUGAS_CSSD") {
    return ["CSSD"];
  }

  if (role === "ADMIN_LAUNDRY" || role === "PETUGAS_LAUNDRY") {
    return ["LAUNDRY"];
  }

  return [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/auth/module-availability.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/auth/module-availability.test.ts src/lib/modules.ts src/lib/auth/module-availability.ts
git commit -m "test: add module availability helper coverage"
```

### Task 2: Kunci kontrak `ModuleSwitcher`

**Files:**
- Create: `tests/unit/components/layout/module-switcher.test.tsx`
- Create: `tests/unit/components/layout/logout-button.test.tsx`
- Create: `src/components/layout/module-switcher.tsx`
- Create: `src/components/layout/logout-button.tsx`
- Reference: `src/lib/cssd/constants.ts`
- Reference: `src/lib/auth/module-availability.ts`

- [ ] **Step 1: Write the failing tests**

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ModuleSwitcher } from "@/components/layout/module-switcher";

const fullModules = [
  { key: "CSSD", label: "CSSD", description: "Central Sterile Supply Department", href: "/cssd" },
  { key: "LAUNDRY", label: "Laundry", description: "Laundry dan linen operasional", href: "/laundry" },
  { key: "AMBULANCE", label: "Ambulance", description: "Belum aktif", href: "#" },
] as const;

describe("ModuleSwitcher", () => {
  it("renders modules in the same order as NCIS_MODULES", async () => {
    render(
      <ModuleSwitcher
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD", "LAUNDRY"]}
        modules={fullModules}
      />
    );
    await userEvent.setup().click(screen.getByRole("button", { name: /cssd module/i }));
    expect(screen.getByRole("button", { name: /cssd module/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /cssd module/i })).toHaveAttribute("aria-controls");
    expect(screen.getByRole("group", { name: /pilihan modul ncis/i })).toBeVisible();
    expect(
      screen
        .getByRole("group", { name: /pilihan modul ncis/i })
        .textContent
    ).toMatch(/CSSD.*Laundry.*Ambulance/s);
  });

  it("keeps the popover open when the active option is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ModuleSwitcher
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD"]}
        modules={[
          { key: "CSSD", label: "CSSD", description: "Central Sterile Supply Department", href: "/cssd" },
          { key: "LAUNDRY", label: "Laundry", description: "Laundry dan linen operasional", href: "/laundry" },
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: /cssd module/i });

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /^cssd$/i }));

    expect(screen.getByRole("button", { name: /^cssd$/i })).toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("opens from keyboard with Enter and Space", async () => {
    const user = userEvent.setup();
    render(
      <ModuleSwitcher
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD", "LAUNDRY"]}
        modules={fullModules}
      />
    );

    const trigger = screen.getByRole("button", { name: /cssd module/i });

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("group", { name: /pilihan modul ncis/i })).toBeVisible();

    await user.keyboard("{Escape}");
    await user.keyboard(" ");
    expect(screen.getByRole("group", { name: /pilihan modul ncis/i })).toBeVisible();
  });

  it("closes and delegates navigation when an enabled inactive option is clicked", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <ModuleSwitcher
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD", "LAUNDRY"]}
        onNavigate={onNavigate}
        modules={[
          { key: "CSSD", label: "CSSD", description: "Central Sterile Supply Department", href: "/cssd" },
          { key: "LAUNDRY", label: "Laundry", description: "Laundry dan linen operasional", href: "/laundry" },
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: /cssd module/i }));
    await user.click(screen.getByRole("button", { name: /^laundry$/i }));

    expect(onNavigate).toHaveBeenCalledWith("/laundry");
    expect(screen.queryByRole("button", { name: /^laundry$/i })).not.toBeInTheDocument();
  });

  it("renders disabled modules outside the tab order", async () => {
    const user = userEvent.setup();
    render(
      <ModuleSwitcher
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD"]}
        modules={[
          { key: "CSSD", label: "CSSD", description: "Central Sterile Supply Department", href: "/cssd" },
          { key: "AMBULANCE", label: "Ambulance", description: "Belum aktif", href: "#" },
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: /cssd module/i });
    await user.click(trigger);

    const disabledOption = screen.getByRole("button", { name: /^ambulance$/i });

    expect(disabledOption).toHaveAttribute("aria-disabled", "true");
    expect(disabledOption).toHaveAttribute("tabIndex", "-1");
    expect(disabledOption).toHaveAccessibleName(/ambulance.*tidak tersedia/i);

    await user.click(disabledOption);

    expect(disabledOption).toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on outside click and returns focus on Escape", async () => {
    const user = userEvent.setup();

    render(
      <>
        <button type="button">Outside target</button>
        <ModuleSwitcher
          activeModuleKey="CSSD"
          availableModuleKeys={["CSSD", "LAUNDRY"]}
          modules={fullModules}
        />
      </>
    );

    const trigger = screen.getByRole("button", { name: /cssd module/i });

    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /outside target/i }));
    expect(screen.getByRole("button", { name: /outside target/i })).toHaveFocus();
    expect(screen.queryByRole("button", { name: /^cssd$/i })).not.toBeInTheDocument();
  });

  it("closes when focus tabs out of the trigger and popover region", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ModuleSwitcher
          activeModuleKey="CSSD"
          availableModuleKeys={["CSSD", "LAUNDRY"]}
          modules={fullModules}
        />
        <button type="button">After switcher</button>
      </>
    );

    await user.click(screen.getByRole("button", { name: /cssd module/i }));
    await user.tab();
    await user.tab();
    await user.tab();

    expect(screen.getByRole("button", { name: /after switcher/i })).toHaveFocus();
    expect(screen.queryByRole("button", { name: /^cssd$/i })).not.toBeInTheDocument();
  });

  it("renders the compact variant for utility row usage", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <ModuleSwitcher
        compact
        activeModuleKey="LAUNDRY"
        availableModuleKeys={["LAUNDRY", "CSSD"]}
        onNavigate={onNavigate}
        modules={[
          { key: "CSSD", label: "CSSD", description: "Central Sterile Supply Department", href: "/cssd" },
          { key: "LAUNDRY", label: "Laundry", description: "Laundry dan linen operasional", href: "/laundry" },
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: /laundry module/i }));

    expect(screen.getByRole("button", { name: /^cssd$/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /^laundry$/i })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /^cssd$/i }));
    expect(onNavigate).toHaveBeenCalledWith("/cssd");
  });

  it("keeps the active pathname module enabled even when availability falls back empty", async () => {
    const user = userEvent.setup();

    render(
      <ModuleSwitcher
        activeModuleKey="CSSD"
        availableModuleKeys={[]}
        modules={fullModules}
      />
    );

    await user.click(screen.getByRole("button", { name: /cssd module/i }));

    expect(screen.getByRole("button", { name: /^cssd$/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /^laundry$/i })).toHaveAttribute("aria-disabled", "true");
  });
});
```

Add a smoke test for the shared logout control:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LogoutButton } from "@/components/layout/logout-button";

describe("LogoutButton", () => {
  it("renders a submit button for the provided server action", () => {
    render(<LogoutButton logoutAction={async () => {}} />);
    expect(screen.getByRole("button", { name: /logout/i })).toHaveAttribute("type", "submit");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/components/layout/module-switcher.test.tsx tests/unit/components/layout/logout-button.test.tsx`
Expected: FAIL because `ModuleSwitcher` and `LogoutButton` do not exist yet.

- [ ] **Step 3: Implement `LogoutButton` first**

Create a minimal shared wrapper:

```tsx
type LogoutButtonProps = {
  logoutAction: () => Promise<void>;
  className?: string;
  compact?: boolean;
};
```

The component should only own:
- `<form action={logoutAction}>`
- one submit `<button>`
- compact vs default shell styling hooks

- [ ] **Step 4: Implement base `ModuleSwitcher` render and ARIA wiring**

```tsx
import type { ModuleKey } from "@/lib/auth/module-availability";

type ModuleSwitcherProps = {
  activeModuleKey: ModuleKey;
  availableModuleKeys: readonly ModuleKey[];
  onNavigate?: (href: string) => void;
  modules: readonly {
    key: ModuleKey;
    label: string;
    description: string;
    href: string;
  }[];
  className?: string;
  compact?: boolean;
};
```

Start with:
- trigger tetap `button`
- popover berupa daftar tombol/link biasa, bukan `menu` / `listbox`
- trigger memiliki `aria-expanded` dan `aria-controls` yang sinkron dengan state terbuka
- popover memiliki label konteks eksplisit, misalnya `aria-label="Pilihan modul NCIS"`
- opsi dirender mengikuti urutan `modules`
- `compact` hanya mengubah density/spacing utility row, bukan kontrak interaksi atau urutan opsi
- popover dirender menempel pada wrapper trigger yang `position: relative`, bukan dilepas jauh dari trigger
- target visual kontrak shared component: popover muncul tepat di bawah/di samping trigger aktif dan tetap berada di dalam viewport pada lebar desktop normal

- [ ] **Step 5: Implement `ModuleSwitcher` option-state behavior**

Implement behavior yang dikunci spec:
- opsi inactive-enabled memakai `<Link>` saat `onNavigate` tidak disuntik
- saat `onNavigate` disuntik untuk testing, opsi inactive-enabled boleh dirender sebagai button yang memanggil callback itu
- active click = no-op + tetap terbuka
- disabled click = no-op + tetap terbuka + `aria-disabled="true"` + `tabIndex={-1}` + accessible text `Tidak tersedia`
- enabled inactive click = tutup lalu navigasi

- [ ] **Step 6: Implement `ModuleSwitcher` dismissal and keyboard behavior**

Implement:
- `Escape` = tutup + return focus ke trigger
- outside click = tutup tanpa override focus target user, dan fokus tetap berada pada target yang diklik
- tab keluar dari region trigger + popover = tutup tanpa focus trap
- keyboard `Enter` dan `Space` pada trigger = buka popover

- [ ] **Step 7: Implement fallback and anchoring behavior**

Implement:
- urutan opsi selalu mengikuti `modules` input dari `NCIS_MODULES`
- bila `availableModuleKeys` kosong atau tidak memuat `activeModuleKey`, tetap render `activeModuleKey` sebagai active-only fallback dan tandai opsi lain disabled
- popover tetap ter-attach ke trigger wrapper dan tidak overflow keluar viewport desktop normal

- [ ] **Step 8: Run tests to verify they pass**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/components/layout/module-switcher.test.tsx tests/unit/components/layout/logout-button.test.tsx`
Expected: PASS.

- [ ] **Step 9: Run focused visual verification for popover anchoring**

Verify on a live shell page after Task 4 integration using browser QA:
- open module switcher on desktop
- ensure popover appears attached to the trigger wrapper
- ensure the full popover remains inside the viewport at normal desktop width

Expected: popover does not detach, clip, or render off-screen.

- [ ] **Step 10: Commit**

```bash
git add tests/unit/components/layout/module-switcher.test.tsx tests/unit/components/layout/logout-button.test.tsx src/components/layout/module-switcher.tsx src/components/layout/logout-button.tsx
git commit -m "feat: add shared module switcher shell controls"
```

## Chunk 2: Integrate the simplified shell

### Task 3: Update CSSD and Laundry layouts to provide shell props

**Files:**
- Modify: `src/app/(protected)/cssd/layout.tsx`
- Modify: `src/app/(protected)/laundry/layout.tsx`
- Reference: `src/app/(protected)/actions.ts`
- Reference: `src/lib/auth/module-availability.ts`

- [ ] **Step 1: Write the failing integration tests**

Extend layout-facing component tests first so the shell contract is locked before implementation:

- `tests/unit/components/layout/module-header.test.tsx`
- `tests/unit/components/layout/module-header-laundry.test.tsx`

Add assertions that:
- old account/module panels are gone
- header still shows route title + description
- `< lg` utility row renders module trigger and logout affordance
- fallback route branches still resolve to the expected `master-data` / `laporan` meta

- [ ] **Step 2: Run tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/components/layout/module-header.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx`
Expected: FAIL because `ModuleHeader` still expects old props/markup.

- [ ] **Step 3: Write minimal implementation**

In both protected layouts:

```tsx
const profile = await requireCssdAccess();
const availableModuleKeys = getAvailableModuleKeys(profile?.role ?? null);

<AppSidebar
  activeModuleKey="CSSD"
  availableModuleKeys={availableModuleKeys}
  logoutAction={logoutAction}
/>
<ModuleHeader
  activeModuleKey="CSSD"
  availableModuleKeys={availableModuleKeys}
  logoutAction={logoutAction}
/>
```

Laundry uses `"LAUNDRY"` as the active key.

Keep the change scoped:
- do not alter `logoutAction`
- do not alter `requireCssdAccess` / `requireLaundryAccess`
- do not change login redirect behavior in this task

- [ ] **Step 4: Run tests to verify they pass**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/components/layout/module-header.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx tests/unit/auth/module-availability.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/(protected)/cssd/layout.tsx src/app/(protected)/laundry/layout.tsx tests/unit/components/layout/module-header.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx
git commit -m "refactor: wire module shell props through protected layouts"
```

### Task 4: Simplify `AppSidebar` and `ModuleHeader`

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/layout/module-header.tsx`
- Reference: `src/lib/cssd/constants.ts`
- Reference: `src/lib/laundry/constants.ts`

- [ ] **Step 1: Write the failing tests**

Add targeted assertions for:
- desktop sidebar renders `ModuleSwitcher` below `NCIS`
- sidebar footer owns `LogoutButton`
- `ModuleHeader` no longer renders the `NCIS`, `Pindah Modul`, or `Akun` cards
- mobile utility row renders switcher + logout shell controls

- [ ] **Step 2: Run tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/components/layout/module-header.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx tests/unit/components/layout/module-switcher.test.tsx`
Expected: FAIL because old shell markup is still present.

- [ ] **Step 3: Write minimal implementation**

Implementation target:
- `AppSidebar` becomes prop-driven and uses `ModuleSwitcher`
- `ModuleHeader` becomes page-context-first and only keeps:
  - `Halaman aktif`
  - title
  - description
  - utility row hidden at `lg` and up

Use the existing route-meta fallback logic, but make it deterministic per spec:

```ts
if (pathname.startsWith("/cssd/master-data")) {
  return CSSD_ROUTE_META["/cssd/master-data/items"];
}
```

For active-only fallback:
- if `activeModuleKey` is missing from `availableModuleKeys`, still render the current pathname module as active
- keep all other modules disabled

- [ ] **Step 4: Run tests to verify they pass**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/components/layout/module-header.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx tests/unit/components/layout/module-switcher.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/app-sidebar.tsx src/components/layout/module-header.tsx tests/unit/components/layout/module-header.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx tests/unit/components/layout/module-switcher.test.tsx
git commit -m "refactor: simplify ncis module shell layout"
```

## Chunk 3: Clean sidebar groups and verify regressions

### Task 5: Remove sidebar secondary copy without breaking expand/collapse

**Files:**
- Modify: `src/components/layout/sidebar-nav.tsx`
- Modify: `tests/unit/components/layout/sidebar-nav.test.tsx`
- Modify: `tests/unit/components/layout/sidebar-nav-laundry.test.tsx`

- [ ] **Step 1: Write the failing tests**

Add assertions that:
- `3 Menu` no longer renders
- group descriptions like `Item, satuan, dan unit CSSD.` no longer render
- `Buka` / `Tutup` no longer render
- group toggling still works

```tsx
expect(screen.queryByText(/3 menu/i)).not.toBeInTheDocument();
expect(screen.queryByText(/item, satuan, dan unit cssd/i)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/components/layout/sidebar-nav.test.tsx tests/unit/components/layout/sidebar-nav-laundry.test.tsx`
Expected: FAIL because the old badges/descriptions are still rendered.

- [ ] **Step 3: Write minimal implementation**

Update `SidebarNav` to:
- keep current group open-state logic
- replace text `Buka` / `Tutup` with a compact icon affordance
- render only label + submenu list for groups
- leave `SidebarNavItem.description` in constants unused for now

- [ ] **Step 4: Run tests to verify they pass**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/components/layout/sidebar-nav.test.tsx tests/unit/components/layout/sidebar-nav-laundry.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/sidebar-nav.tsx tests/unit/components/layout/sidebar-nav.test.tsx tests/unit/components/layout/sidebar-nav-laundry.test.tsx
git commit -m "refactor: simplify sidebar group chrome"
```

### Task 6: Final verification pass

**Files:**
- Modify: `none unless verification finds a small fix`

- [ ] **Step 1: Run the targeted layout suite**

Run:
`node node_modules/vitest/vitest.mjs run tests/unit/auth/module-availability.test.ts tests/unit/components/layout/module-switcher.test.tsx tests/unit/components/layout/module-header.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx tests/unit/components/layout/sidebar-nav.test.tsx tests/unit/components/layout/sidebar-nav-laundry.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:
`node node_modules/typescript/bin/tsc --noEmit --pretty false --incremental false`

Expected: PASS.

- [ ] **Step 3: Run browser verification**

Verify manually:
- CSSD desktop: header besar hilang, switcher di bawah `NCIS`, logout di footer sidebar
- CSSD desktop: popover switcher tetap menempel ke trigger dan seluruh panel terlihat di viewport
- CSSD `< lg`: utility row muncul, switcher + logout ringkas terlihat
- Laundry desktop/mobile: perilaku setara
- Master Data / Laporan: tidak ada `3 Menu`, deskripsi grup, atau `Buka/Tutup`

- [ ] **Step 4: Apply minimal fix if QA finds one issue**

If needed, rerun the exact failing verification command before continuing.

- [ ] **Step 5: Commit**

```bash
git add <only-files-touched-by-qa-fix>
git commit -m "test: verify ncis shell simplification"
```
