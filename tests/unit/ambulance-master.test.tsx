/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import AmbulanceMasterPage from "@/app/(protected)/ambulance/master/page";
import { AmbulanceMasterView } from "@/components/ambulance/master/ambulance-master-view";
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

describe("AmbulanceMasterView", () => {
  it("renders populated data and settings defaults", () => {
    const mockAmbulance = {
      id: "1",
      name: "Ambulans Siaga 1",
      plate_number: "B 1234 CD",
      base_price_per_km: 15000,
      image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const mockSettings = {
      id: "1",
      hospital_lat: -6.123456,
      hospital_lng: 106.123456,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    render(
      <AmbulanceMasterView 
        initialAmbulances={[mockAmbulance]} 
        initialSettings={mockSettings} 
      />
    );

    // Verify ambulance data appears in table
    expect(screen.getByText("Ambulans Siaga 1")).toBeInTheDocument();
    expect(screen.getByText("B 1234 CD")).toBeInTheDocument();
    expect(screen.getByText("Rp 15,000")).toBeInTheDocument();
    expect(screen.getByText("Aktif")).toBeInTheDocument();

    // Verify settings form defaults
    const latInput = screen.getByLabelText(/Latitude Rumah Sakit/i);
    expect(latInput).toHaveValue(-6.123456);
    
    const lngInput = screen.getByLabelText(/Longitude Rumah Sakit/i);
    expect(lngInput).toHaveValue(106.123456);
  });
});
