/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderWizard } from "@/components/ambulance/order/order-wizard";
import { Database } from "@/types/supabase";
import { createAmbulanceOrder } from "@/app/(protected)/ambulance/order/actions";
import { toast } from "sonner";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/app/(protected)/ambulance/order/actions", () => ({
  createAmbulanceOrder: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

vi.mock("@/components/ambulance/AmbulanceMap", () => {
  return {
    default: function MockMapComponent({ onRouteCalculated }: any) {
      return (
        <div data-testid="mock-map">
          <button 
            onClick={() => onRouteCalculated(10.555, [-6.2, 106.8])}
            data-testid="simulate-route"
          >
            Simulate Route
          </button>
        </div>
      );
    }
  };
});

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
];

const mockHospitalCoords: [number, number] = [-6.2, 106.8];

describe("OrderWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no ambulances available", () => {
    render(<OrderWizard ambulances={[]} hospitalCoords={mockHospitalCoords} />);
    expect(screen.getByText("Tidak ada ambulans yang tersedia saat ini.")).toBeInTheDocument();
  });

  it("renders list of ambulances when available", () => {
    render(<OrderWizard ambulances={mockAmbulances} hospitalCoords={mockHospitalCoords} />);
    expect(screen.getByText("Ambulans Alpha")).toBeInTheDocument();
    expect(screen.getByText("B 1234 CD")).toBeInTheDocument();
  });

  it("changes to step 2 after selecting an ambulance", () => {
    render(<OrderWizard ambulances={mockAmbulances} hospitalCoords={mockHospitalCoords} />);
    
    const selectButtons = screen.getAllByRole("button", { name: "Pilih" });
    fireEvent.click(selectButtons[0]);
    
    expect(screen.getByText("Tentukan Tujuan")).toBeInTheDocument();
    expect(screen.getByText(/Ambulans Alpha/)).toBeInTheDocument();
    expect(screen.getByText(/B 1234 CD/)).toBeInTheDocument();
  });

  it("calculates route, shows summary and handles checkout correctly", async () => {
    vi.mocked(createAmbulanceOrder).mockResolvedValueOnce({ success: true });
    
    render(<OrderWizard ambulances={mockAmbulances} hospitalCoords={mockHospitalCoords} />);
    
    // Step 1: Select ambulance
    const selectButtons = screen.getAllByRole("button", { name: "Pilih" });
    fireEvent.click(selectButtons[0]);
    
    // Step 2: Simulate map route calculation
    const simulateBtn = screen.getByTestId("simulate-route");
    fireEvent.click(simulateBtn);
    
    // Verify summary is rendered
    expect(screen.getByText("Ringkasan Pesanan")).toBeInTheDocument();
    
    // 10.555 gets rounded to 10.56 in display and calculation
    expect(screen.getByText("10.56 km")).toBeInTheDocument();
    // 10.56 * 15000 = 158400
    expect(screen.getByText("Rp 158.400")).toBeInTheDocument();
    
    // Click checkout
    const checkoutBtn = screen.getByRole("button", { name: "Konfirmasi & Pesan" });
    fireEvent.click(checkoutBtn);
    
    // Wait for the action and navigation
    await waitFor(() => {
      expect(createAmbulanceOrder).toHaveBeenCalledWith({
        ambulance_id: "1",
        destination_lat: -6.2,
        destination_lng: 106.8,
        distance_km: 10.56,
      });
      expect(toast.success).toHaveBeenCalledWith("Pesanan berhasil dibuat!");
      expect(mockPush).toHaveBeenCalledWith("/ambulance/history");
    });
  });

  it("handles checkout failure", async () => {
    vi.mocked(createAmbulanceOrder).mockResolvedValueOnce({ error: "Database error" });
    
    render(<OrderWizard ambulances={mockAmbulances} hospitalCoords={mockHospitalCoords} />);
    
    fireEvent.click(screen.getByRole("button", { name: "Pilih" }));
    fireEvent.click(screen.getByTestId("simulate-route"));
    fireEvent.click(screen.getByRole("button", { name: "Konfirmasi & Pesan" }));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Gagal membuat pesanan: Database error");
    });
  });
});
