export type RouteMetaMap = Record<
  string,
  {
    title: string;
    description: string;
  }
>;

export type SidebarNavItem =
  | {
      type: "group";
      label: string;
      description: string;
      segment: string;
      children: {
        label: string;
        href: string;
      }[];
    }
  | {
      type: "link";
      label: string;
      href: string;
    };

export const ITEM_TYPES = [
  "REUSABLE",
  "CONSUMABLE_DISTRIBUTION",
  "CONSUMABLE_INTERNAL",
] as const;

export const ITEM_TYPE_LABELS = {
  REUSABLE: "Reusable",
  CONSUMABLE_DISTRIBUTION: "Konsumabel Distribusi",
  CONSUMABLE_INTERNAL: "Konsumabel Internal",
} as const;

export const ITEM_CODE_PREFIXES = {
  REUSABLE: "R",
  CONSUMABLE_DISTRIBUTION: "CD",
  CONSUMABLE_INTERNAL: "CI",
} as const;

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

export const STOCK_POSITION_LABELS = LAUNDRY_STOCK_POSITION_LABELS;

export const LAUNDRY_NAV_ITEMS: SidebarNavItem[] = [
  {
    type: "group",
    label: "Master Data",
    description: "Item, satuan, dan unit Laundry.",
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
    description: "Riwayat, posisi stok, dan kartu stok.",
    segment: "/laundry/laporan",
    children: [
      {
        label: "Riwayat Transaksi",
        href: "/laundry/laporan/riwayat-transaksi",
      },
      {
        label: "Posisi stok",
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
    title: "Modul Laundry",
    description: "Pilih menu kerja Laundry.",
  },
  "/laundry/master-data/items": {
    title: "Data item",
    description: "Item untuk transaksi Laundry.",
  },
  "/laundry/master-data/satuan": {
    title: "Data satuan",
    description: "Satuan untuk item dan transaksi Laundry.",
  },
  "/laundry/master-data/unit": {
    title: "Data unit",
    description: "Unit tujuan Laundry.",
  },
  "/laundry/pemasukan": {
    title: "Pemasukan",
    description: "Catat barang masuk.",
  },
  "/laundry/distribusi": {
    title: "Distribusi",
    description: "Catat barang keluar ke unit.",
  },
  "/laundry/pengembalian": {
    title: "Pengembalian",
    description: "Catat reusable yang kembali.",
  },
  "/laundry/pemakaian-internal": {
    title: "Pemakaian Internal",
    description: "Catat konsumabel yang dipakai di Laundry.",
  },
  "/laundry/stok-opname": {
    title: "Stok Opname",
    description: "Hitung stok lalu finalisasi.",
  },
  "/laundry/laporan": {
    title: "Laporan",
    description: "Lihat laporan Laundry.",
  },
  "/laundry/laporan/riwayat-transaksi": {
    title: "Riwayat transaksi",
    description: "Cari transaksi lalu ekspor bila diperlukan.",
  },
  "/laundry/laporan/stok-status": {
    title: "Posisi stok",
    description: "Lihat stok per posisi dan unit.",
  },
  "/laundry/laporan/kartu-stok": {
    title: "Kartu stok",
    description: "Telusuri pergerakan satu item.",
  },
};

