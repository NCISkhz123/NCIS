// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ModuleSwitcher } from "@/components/layout/module-switcher";

const fullModules = [
  {
    key: "CSSD",
    label: "CSSD",
    description: "Central Sterile Supply Department",
    href: "/cssd",
  },
  {
    key: "LAUNDRY",
    label: "Laundry",
    description: "Laundry dan linen operasional",
    href: "/laundry",
  },
  {
    key: "AMBULANCE",
    label: "Ambulance",
    description: "Belum aktif",
    href: "#",
  },
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

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /cssd module/i }));

    expect(
      screen.getByRole("button", { name: /cssd module/i })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: /cssd module/i })
    ).toHaveAttribute("aria-controls");
    expect(
      screen.getByRole("group", { name: /pilihan modul ncis/i })
    ).toBeVisible();
    expect(
      screen.getByRole("group", { name: /pilihan modul ncis/i }).textContent
    ).toMatch(/CSSD.*Laundry.*Ambulance/s);
  });

  it("keeps the popover open when the active option is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ModuleSwitcher
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD"]}
        modules={[
          fullModules[0],
          fullModules[1],
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: /cssd module/i });

    await user.click(trigger);
    const panel = screen.getByRole("group", { name: /pilihan modul ncis/i });
    await user.click(within(panel).getByRole("button", { name: /^cssd/i }));

    expect(within(panel).getByRole("button", { name: /^cssd/i })).toBeVisible();
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
    expect(
      screen.getByRole("group", { name: /pilihan modul ncis/i })
    ).toBeVisible();

    await user.keyboard("{Escape}");
    await user.keyboard(" ");
    expect(
      screen.getByRole("group", { name: /pilihan modul ncis/i })
    ).toBeVisible();
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
          fullModules[0],
          fullModules[1],
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: /cssd module/i }));
    const panel = screen.getByRole("group", { name: /pilihan modul ncis/i });
    await user.click(within(panel).getByRole("button", { name: /^laundry/i }));

    expect(onNavigate).toHaveBeenCalledWith("/laundry");
    expect(screen.queryByRole("group", { name: /pilihan modul ncis/i })).not.toBeInTheDocument();
  });

  it("renders disabled modules outside the tab order and keeps them open on click", async () => {
    const user = userEvent.setup();

    render(
      <ModuleSwitcher
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD"]}
        modules={[
          fullModules[0],
          fullModules[2],
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: /cssd module/i });
    await user.click(trigger);
    const panel = screen.getByRole("group", { name: /pilihan modul ncis/i });

    const disabledOption = within(panel).getByRole("button", { name: /^ambulance/i });

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
    expect(
      screen.getByRole("button", { name: /outside target/i })
    ).toHaveFocus();
    expect(screen.queryByRole("group", { name: /pilihan modul ncis/i })).not.toBeInTheDocument();
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
    expect(screen.queryByRole("group", { name: /pilihan modul ncis/i })).not.toBeInTheDocument();
  });

  it("supports compact utility-row interactions", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <ModuleSwitcher
        compact
        activeModuleKey="LAUNDRY"
        availableModuleKeys={["LAUNDRY", "CSSD"]}
        onNavigate={onNavigate}
        modules={[
          fullModules[0],
          fullModules[1],
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: /laundry module/i }));
    const panel = screen.getByRole("group", { name: /pilihan modul ncis/i });

    expect(within(panel).getByRole("button", { name: /^cssd/i })).toBeVisible();
    expect(within(panel).getByRole("button", { name: /^laundry/i })).toBeVisible();

    await user.click(within(panel).getByRole("button", { name: /^cssd/i }));
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
    const panel = screen.getByRole("group", { name: /pilihan modul ncis/i });

    expect(within(panel).getByRole("button", { name: /^cssd/i })).toBeVisible();
    expect(within(panel).getByRole("button", { name: /^laundry/i })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });
});
