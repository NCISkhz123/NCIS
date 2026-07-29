import { Badge } from "@/components/ui/badge";

type StatusPillProps = {
  active: boolean;
};

export function StatusPill({ active }: StatusPillProps) {
  return (
    <Badge variant={active ? "success" : "secondary"} dot={active}>
      {active ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}
