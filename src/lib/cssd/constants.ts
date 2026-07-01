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
    description: "Segera hadir",
    href: "#",
  },
] as const;

export const CSSD_NAV_ITEMS: SidebarNavItem[] = [
  {
    type: "group",
    label: "Master Data",
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
    segment: "/cssd/laporan",
    children: [
      {
        label: "Riwayat Transaksi",
        href: "/cssd/laporan/riwayat-transaksi",
      },
      {
        label: "Stok Status",
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
    title: "CSSD Workspace",
    description: "Ruang kerja utama modul CSSD untuk operasional harian NCIS.",
  },
  "/cssd/master-data/items": {
    title: "Master Data / Item",
    description: "Kelola daftar item reusable dan konsumabel CSSD.",
  },
  "/cssd/master-data/satuan": {
    title: "Master Data / Satuan",
    description: "Kelola referensi satuan yang dipakai item dan transaksi.",
  },
  "/cssd/master-data/unit": {
    title: "Master Data / Unit",
    description: "Kelola daftar unit tujuan distribusi CSSD.",
  },
  "/cssd/pemasukan": {
    title: "Pemasukan",
    description: "Catat barang masuk ke stok CSSD.",
  },
  "/cssd/distribusi": {
    title: "Distribusi",
    description: "Catat distribusi barang dari CSSD ke unit rumah sakit.",
  },
  "/cssd/pengembalian": {
    title: "Pengembalian",
    description: "Catat pengembalian barang reusable dari unit.",
  },
  "/cssd/pemakaian-internal": {
    title: "Pemakaian Internal",
    description: "Catat pemakaian konsumabel internal untuk proses CSSD.",
  },
  "/cssd/stok-opname": {
    title: "Stok Opname",
    description: "Kelola sesi pencatatan fisik dan finalisasi penyesuaian stok.",
  },
  "/cssd/laporan": {
    title: "Laporan",
    description: "Pantau stok saat ini, riwayat transaksi, dan kartu stok item.",
  },
  "/cssd/laporan/riwayat-transaksi": {
    title: "Laporan / Riwayat Transaksi",
    description:
      "Tinjau riwayat transaksi CSSD dengan filter item, unit, dan tanggal.",
  },
  "/cssd/laporan/stok-status": {
    title: "Laporan / Stok Status",
    description:
      "Pantau saldo aktif CSSD per posisi stok dan unit terkait.",
  },
  "/cssd/laporan/kartu-stok": {
    title: "Laporan / Kartu Stok",
    description:
      "Lihat jejak perpindahan item CSSD dari pemasukan sampai proses sterilisasi.",
  },
} as const;
