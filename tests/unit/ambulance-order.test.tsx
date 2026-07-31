/** @vitest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OrderWizard } from "@/components/ambulance/order/order-wizard";
import { Database } from "@/types/supabase";

type Ambulance = Database["public"]["Tables"]["ambulances"]["Row"];

const mockAmbulances: Ambulance[] = [
  {
    id: "1",
    name: "Ambulans Alpha",
    plate_number: "B 1234 CD",
    image_url: "https://example.com/alpha.png",
    base_price_per_km: 15000,
    is_active: true,
    created_at: "2026-07-31T00:00:00Z",
    updated_at: "2026-07-31T00:00:00Z",
  },
  {
    id: "2",
    name: "Ambulans Beta",
    plate_number: "B 5678 EF",
    image_url: "https://example.com/beta.png",
    base_price_per_km: 25000,
    is_active: true,
    created_at: "2026-07-31T00:00:00Z",
    updated_at: "2026-07-31T00:00:00Z",
  }
];

describe("OrderWizard", () => {
  it("renders empty state when no ambulances available", () => {
    render(<OrderWizard ambulances={[]} />);
    expect(screen.getByText("Tidak ada ambulans yang tersedia saat ini.")).toBeInTheDocument();
  });

  it("renders list of ambulances when available", () => {
    render(<OrderWizard ambulances={mockAmbulances} />);
    expect(screen.getByText("Ambulans Alpha")).toBeInTheDocument();
    expect(screen.getByText("B 1234 CD")).toBeInTheDocument();
    expect(screen.getByText("Ambulans Beta")).toBeInTheDocument();
    expect(screen.getByText("B 5678 EF")).toBeInTheDocument();
  });

  it("changes to step 2 after selecting an ambulance", () => {
    render(<OrderWizard ambulances={mockAmbulances} />);
    
    const selectButtons = screen.getAllByRole("button", { name: "Pilih" });
    fireEvent.click(selectButtons[0]);
    
    expect(screen.getByText("Tentukan Tujuan")).toBeInTheDocument();
    expect(screen.getByText(/Ambulans Alpha/)).toBeInTheDocument();
    expect(screen.getByText(/B 1234 CD/)).toBeInTheDocument();
  });

  it("allows going back to step 1 from step 2", () => {
    render(<OrderWizard ambulances={mockAmbulances} />);
    
    const selectButtons = screen.getAllByRole("button", { name: "Pilih" });
    fireEvent.click(selectButtons[0]);
    
    const backButton = screen.getByRole("button", { name: "Kembali ke Pemilihan Armada" });
    fireEvent.click(backButton);
    
    expect(screen.getByText("Pilih Ambulans")).toBeInTheDocument();
  });
});
