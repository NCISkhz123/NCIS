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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Search, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Navigation,
  FileText,
  Calendar
} from 'lucide-react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, Radio, CheckCircle2, Printer } from 'lucide-react';

export type AmbulanceTransactionHistory = {
  id: string;
  ambulance_id: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number;
  total_cost: number;
  status?: string;
  created_at: string;
  ambulances: {
    name: string;
    plate_number: string;
  } | null;
  profiles: {
    full_name: string | null;
  } | null;
};

interface AmbulanceHistoryViewProps {
  transactions: AmbulanceTransactionHistory[];
  isAdmin?: boolean;
  onDelete?: (id: string, reason: string) => Promise<{ error?: string; success?: boolean }>;
}

export function AmbulanceHistoryView({ transactions, isAdmin, onDelete }: AmbulanceHistoryViewProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(tx => {
      // Search filter
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (
        tx.ambulances?.name.toLowerCase().includes(term) ||
        tx.ambulances?.plate_number.toLowerCase().includes(term) ||
        tx.id.toLowerCase().includes(term)
      );

      // Date filter
      const txDate = new Date(tx.created_at);
      let matchesStartDate = true;
      let matchesEndDate = true;

      if (startDate) {
        const [y, m, d] = startDate.split('-').map(Number);
        const start = new Date(y, m - 1, d);
        start.setHours(0, 0, 0, 0);
        matchesStartDate = txDate >= start;
      }

      if (endDate) {
        const [y, m, d] = endDate.split('-').map(Number);
        const end = new Date(y, m - 1, d);
        end.setHours(23, 59, 59, 999);
        matchesEndDate = txDate <= end;
      }

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [transactions, searchTerm, startDate, endDate]);

  // Aggregate Metrics
  const totalOrders = transactions.length;
  const totalDistance = transactions.reduce((acc, curr) => acc + (curr.distance_km || 0), 0);
  const totalExpense = transactions.reduce((acc, curr) => acc + (curr.total_cost || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* Filter & Table Box */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden w-full">
        {/* Search Bar Header */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari armada atau plat nomor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-white border-slate-300 text-sm focus-visible:ring-sky-500"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 rounded-xl bg-white border-slate-300 text-sm focus-visible:ring-sky-500 min-w-[140px]"
                title="Tanggal Mulai"
              />
              <span className="text-slate-400 text-sm">-</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 rounded-xl bg-white border-slate-300 text-sm focus-visible:ring-sky-500 min-w-[140px]"
                title="Tanggal Akhir"
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Menampilkan {filteredTransactions.length} dari {transactions.length} data
          </span>
        </div>

        {/* Data Table */}
        <Table className="w-full">
          <TableHeader className="bg-slate-100/60">
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Waktu Pemesanan</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Armada Ambulans</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Status Disposisi</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Petugas</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Koordinat Tujuan</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Jarak Tempuh</TableHead>
              <TableHead className="text-right font-bold text-slate-700 text-xs uppercase tracking-wider">Total Biaya</TableHead>
              <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Clock className="h-8 w-8 text-slate-300 stroke-1" />
                    <span className="text-sm font-medium">Belum ada riwayat transaksi pemesanan.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell suppressHydrationWarning className="font-medium text-slate-900 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {new Date(tx.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 font-bold border border-sky-200/60">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{tx.ambulances?.name || 'Unknown'}</span>
                        <span className="text-[11px] font-mono font-semibold text-slate-500">
                          {tx.ambulances?.plate_number || '-'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tx.status === 'IN_USE' ? (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[11px] animate-pulse">
                        <Radio className="h-3 w-3 mr-1 animate-spin" /> Dalam Tugas
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-700 text-sm">
                      {tx.profiles?.full_name || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span>{tx.destination_lat.toFixed(4)}, {tx.destination_lng.toFixed(4)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                      {tx.distance_km.toLocaleString('id-ID')} km
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-black text-sky-600 text-sm">
                    {tx.total_cost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {tx.status === 'IN_USE' && (
                        <Link href={`/ambulance/tracking/${tx.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-bold rounded-lg" title="Lihat Telemetri">
                            Telemetri <ExternalLink className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/ambulance/print/${tx.id}`} target="_blank">
                        <Button size="sm" variant="outline" className="h-8 px-2 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-lg" title="Cetak / Unduh PDF Nota">
                          <Printer className="h-3.5 w-3.5 mr-1 text-slate-500" /> Nota PDF
                        </Button>
                      </Link>
                      {isAdmin && onDelete && (
                        (() => {
                          const DeleteTransactionButton = require("@/components/transactions/delete-transaction-button").DeleteTransactionButton;
                          return <DeleteTransactionButton id={tx.id} onDelete={onDelete} />;
                        })()
                      )}
                    </div>
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
