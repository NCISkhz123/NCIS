'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type AmbulanceTransactionHistory = {
  id: string;
  ambulance_id: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number;
  total_cost: number;
  created_at: string;
  ambulances: {
    name: string;
    plate_number: string;
  } | null;
};

interface AmbulanceHistoryViewProps {
  transactions: AmbulanceTransactionHistory[];
}

export function AmbulanceHistoryView({ transactions }: AmbulanceHistoryViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Riwayat Pemesanan Ambulans
        </h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Ambulans</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead>Jarak</TableHead>
              <TableHead className="text-right">Total Biaya</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                  Belum ada riwayat transaksi.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell suppressHydrationWarning>
                    {new Date(tx.created_at).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{tx.ambulances?.name || 'Unknown'}</span>
                      <span className="text-xs text-slate-500">
                        {tx.ambulances?.plate_number || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>Lat: {tx.destination_lat.toFixed(6)}</span>
                      <span>Lng: {tx.destination_lng.toFixed(6)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{tx.distance_km.toLocaleString('id-ID')} km</TableCell>
                  <TableCell className="text-right font-medium">
                    {tx.total_cost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
