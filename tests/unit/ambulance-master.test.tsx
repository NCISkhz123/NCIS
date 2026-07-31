/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import AmbulanceMasterPage from "@/app/(protected)/ambulance/master/page";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [] }),
        limit: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null })
        })
      })
    })
  })
}));

describe("AmbulanceMasterPage", () => {
  it("renders the master page with title", async () => {
    const RSC = await AmbulanceMasterPage();
    render(RSC);
    
    expect(screen.getByRole("heading", { name: /Master Data Ambulance/i })).toBeInTheDocument();
    expect(screen.getByText("Belum ada data ambulance.")).toBeInTheDocument();
  });
});
