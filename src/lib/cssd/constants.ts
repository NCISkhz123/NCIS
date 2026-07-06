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

export const STOCK_POSITION_LABELS = {
  READY: "Steril",
  IN_UNIT: "Di Unit",
  NON_STERILE: "Tidak Steril",
  STERILIZATION_AREA: "Area Sterilisasi",
  DAMAGED: "Rusak",
} as const;

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

export const NCIS_MODULES = [
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

export const CSSD_NAV_ITEMS: SidebarNavItem[] = [
  {
    type: "group",
    label: "Master Data",
    description: "Item, satuan, dan unit CSSD.",
    segment: "/cssd/master-data",
    children: [
      {
        label: "Item",
        href: "/cssd/master-data/items",
      },
      {
        label: "Satuan",
        href: "/cssd/master-data/satuan",
      },
      {
        label: "Unit",
        href: "/cssd/master-data/unit",
      },
    ],
  },
  {
    type: "link",
    label: "Pemasukan",
    href: "/cssd/pemasukan",
  },
  {
    type: "link",
    label: "Distribusi",
    href: "/cssd/distribusi",
  },
  {
    type: "link",
    label: "Pengembalian",
    href: "/cssd/pengembalian",
  },
  {
    type: "link",
    label: "Pemakaian Internal",
    href: "/cssd/pemakaian-internal",
  },
  {
    type: "link",
    label: "Stok Opname",
    href: "/cssd/stok-opname",
  },
  {
    type: "group",
    label: "Laporan",
    description: "Riwayat, posisi stok, dan kartu stok.",
    segment: "/cssd/laporan",
    children: [
      {
        label: "Riwayat Transaksi",
        href: "/cssd/laporan/riwayat-transaksi",
      },
      {
        label: "Posisi stok",
        href: "/cssd/laporan/stok-status",
      },
      {
        label: "Kartu Stok",
        href: "/cssd/laporan/kartu-stok",
      },
    ],
  },
] as const;

export const CSSD_ROUTE_META: RouteMetaMap = {
  "/cssd": {
    title: "Modul CSSD",
    description: "Pilih menu kerja CSSD.",
  },
  "/cssd/master-data/items": {
    title: "Data item",
    description: "Item untuk transaksi CSSD.",
  },
  "/cssd/master-data/satuan": {
    title: "Data satuan",
    description: "Satuan untuk item dan transaksi CSSD.",
  },
  "/cssd/master-data/unit": {
    title: "Data unit",
    description: "Unit tujuan CSSD.",
  },
  "/cssd/pemasukan": {
    title: "Pemasukan",
    description: "Catat barang masuk.",
  },
  "/cssd/distribusi": {
    title: "Distribusi",
    description: "Catat barang keluar ke unit.",
  },
  "/cssd/pengembalian": {
    title: "Pengembalian",
    description: "Catat reusable yang kembali.",
  },
  "/cssd/pemakaian-internal": {
    title: "Pemakaian Internal",
    description: "Catat konsumabel yang dipakai di CSSD.",
  },
  "/cssd/stok-opname": {
    title: "Stok Opname",
    description: "Hitung stok lalu finalisasi.",
  },
  "/cssd/laporan": {
    title: "Laporan",
    description: "Lihat laporan CSSD.",
  },
  "/cssd/laporan/riwayat-transaksi": {
    title: "Riwayat transaksi",
    description: "Cari transaksi lalu ekspor bila diperlukan.",
  },
  "/cssd/laporan/stok-status": {
    title: "Posisi stok",
    description: "Lihat stok per posisi dan unit.",
  },
  "/cssd/laporan/kartu-stok": {
    title: "Kartu stok",
    description: "Telusuri pergerakan satu item.",
  },
} as const;
