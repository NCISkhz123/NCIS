import type { RouteMetaMap, SidebarNavItem } from "@/lib/cssd/constants";

export const ITEM_TYPES = [
  "REUSABLE",
  "CONSUMABLE_DISTRIBUTION",
  "CONSUMABLE_INTERNAL",
] as const;

export const REUSABLE_STOCK_POSITIONS = [
  "READY",
  "IN_UNIT",
  "NON_STERILE",
  "STERILIZATION_AREA",
  "DAMAGED",
] as const;

export const RETURN_DESTINATION_POSITIONS = [
  "NON_STERILE",
  "DAMAGED",
] as const;

export const DISTRIBUTABLE_ITEM_TYPES = [
  "REUSABLE",
  "CONSUMABLE_DISTRIBUTION",
] as const;

export const RETURNABLE_ITEM_TYPES = ["REUSABLE"] as const;

export const INTERNAL_USAGE_ITEM_TYPES = ["CONSUMABLE_INTERNAL"] as const;

export const LAUNDRY_STOCK_POSITION_LABELS = {
  READY: "Bersih",
  IN_UNIT: "Di Unit",
  NON_STERILE: "Kotor",
  STERILIZATION_AREA: "Area Pencucian",
  DAMAGED: "Rusak",
} as const;

export const LAUNDRY_NAV_ITEMS: SidebarNavItem[] = [
  {
    type: "group",
    label: "Master Data",
    segment: "/laundry/master-data",
    children: [
      {
        label: "Item",
        href: "/laundry/master-data/items",
      },
      {
        label: "Satuan",
        href: "/laundry/master-data/satuan",
      },
      {
        label: "Unit",
        href: "/laundry/master-data/unit",
      },
    ],
  },
  {
    type: "link",
    label: "Pemasukan",
    href: "/laundry/pemasukan",
  },
  {
    type: "link",
    label: "Distribusi",
    href: "/laundry/distribusi",
  },
  {
    type: "link",
    label: "Pengembalian",
    href: "/laundry/pengembalian",
  },
  {
    type: "link",
    label: "Pemakaian Internal",
    href: "/laundry/pemakaian-internal",
  },
  {
    type: "link",
    label: "Stok Opname",
    href: "/laundry/stok-opname",
  },
  {
    type: "group",
    label: "Laporan",
    segment: "/laundry/laporan",
    children: [
      {
        label: "Riwayat Transaksi",
        href: "/laundry/laporan/riwayat-transaksi",
      },
      {
        label: "Stok Status",
        href: "/laundry/laporan/stok-status",
      },
      {
        label: "Kartu Stok",
        href: "/laundry/laporan/kartu-stok",
      },
    ],
  },
];

export const LAUNDRY_ROUTE_META: RouteMetaMap = {
  "/laundry": {
    title: "Laundry Workspace",
    description: "Ruang kerja utama modul Laundry untuk operasional linen NCIS.",
  },
  "/laundry/master-data/items": {
    title: "Master Data / Item",
    description: "Kelola daftar item reusable dan linen Laundry.",
  },
  "/laundry/master-data/satuan": {
    title: "Master Data / Satuan",
    description: "Kelola referensi satuan yang dipakai item dan transaksi Laundry.",
  },
  "/laundry/master-data/unit": {
    title: "Master Data / Unit",
    description: "Kelola daftar unit tujuan distribusi Laundry.",
  },
  "/laundry/pemasukan": {
    title: "Pemasukan",
    description: "Catat barang masuk ke stok Laundry.",
  },
  "/laundry/distribusi": {
    title: "Distribusi",
    description: "Catat distribusi linen dari Laundry ke unit rumah sakit.",
  },
  "/laundry/pengembalian": {
    title: "Pengembalian",
    description: "Catat pengembalian linen reusable dari unit.",
  },
  "/laundry/pemakaian-internal": {
    title: "Pemakaian Internal",
    description: "Catat pemakaian konsumabel internal untuk proses Laundry.",
  },
  "/laundry/stok-opname": {
    title: "Stok Opname",
    description: "Kelola sesi pencatatan fisik dan finalisasi penyesuaian stok Laundry.",
  },
  "/laundry/laporan": {
    title: "Laporan",
    description: "Pantau stok saat ini, riwayat transaksi, dan kartu stok item Laundry.",
  },
  "/laundry/laporan/riwayat-transaksi": {
    title: "Laporan / Riwayat Transaksi",
    description:
      "Tinjau riwayat transaksi Laundry dengan filter item, unit, dan tanggal.",
  },
  "/laundry/laporan/stok-status": {
    title: "Laporan / Stok Status",
    description: "Pantau saldo aktif Laundry per posisi stok dan unit terkait.",
  },
  "/laundry/laporan/kartu-stok": {
    title: "Laporan / Kartu Stok",
    description:
      "Lihat jejak perpindahan item Laundry dari pemasukan sampai area pencucian.",
  },
};
