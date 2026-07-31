import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AmbulanceHistoryView } from '@/components/ambulance/history/ambulance-history-view';

describe('AmbulanceHistoryView', () => {
  it('renders an empty state when no transactions are provided', () => {
    render(<AmbulanceHistoryView transactions={[]} />);
    expect(screen.getByText('Belum ada riwayat transaksi.')).toBeInTheDocument();
  });

  it('renders a list of transactions with correct formatting', () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        ambulance_id: 'amb-1',
        destination_lat: -6.200000,
        destination_lng: 106.816666,
        distance_km: 15.5,
        total_cost: 150000,
        created_at: '2023-10-27T10:00:00Z',
        ambulances: {
          name: 'Ambulans Alpha',
          plate_number: 'B 1234 CD'
        }
      }
    ];

    render(<AmbulanceHistoryView transactions={mockTransactions} />);

    // Table headings
    expect(screen.getByText('Ambulans Alpha')).toBeInTheDocument();
    expect(screen.getByText('B 1234 CD')).toBeInTheDocument();
    
    // Check if coordinates rendered correctly (6 decimal places)
    expect(screen.getByText(/Lat: -6.200000/)).toBeInTheDocument();
    expect(screen.getByText(/Lng: 106.816666/)).toBeInTheDocument();

    // distance and cost formatting based on locale 'id-ID'
    expect(screen.getByText(/15,5 km/)).toBeInTheDocument();
    expect(screen.getByText(/Rp 150\.000/)).toBeInTheDocument();
  });
});
