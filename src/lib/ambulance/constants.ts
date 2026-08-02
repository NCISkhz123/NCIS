import type { SidebarNavItem, RouteMetaMap } from "@/lib/cssd/constants";

export const AMBULANCE_NAV_ITEMS: SidebarNavItem[] = [
  {
    type: "link",
    label: "Order",
    href: "/ambulance/order",
  },
  {
    type: "link",
    label: "History",
    href: "/ambulance/history",
  },
  {
    type: "link",
    label: "Master Data",
    href: "/ambulance/master",
  },
] as const;

export const AMBULANCE_ROUTE_META: RouteMetaMap = {
  "/ambulance/order": {
    title: "Pesan Ambulans",
    description: "Layanan pemesanan ambulans. Pilih armada dan tentukan lokasi tujuan.",
  },
  "/ambulance/history": {
    title: "Riwayat Ambulans",
    description: "Riwayat pemesanan dan operasional ambulans.",
  },
  "/ambulance/master": {
    title: "Master Data Ambulans",
    description: "Kelola data armada ambulans.",
  },
} as const;
