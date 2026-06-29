import type { ReactNode } from "react";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <>{children}</>;
}
