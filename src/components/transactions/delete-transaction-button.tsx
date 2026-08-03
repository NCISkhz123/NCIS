"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteTransactionButton({
  id,
  onDelete,
}: {
  id: string;
  onDelete: (id: string, reason: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const reason = window.prompt("Alasan penghapusan transaksi ini?");
    if (reason === null) return; // User cancelled
    
    if (reason.trim() === "") {
      alert("Alasan penghapusan wajib diisi");
      return;
    }

    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini? Stok akan dikembalikan dan dicatat dalam log sensitif.")) {
      startTransition(async () => {
        const result = await onDelete(id, reason);
        if (result.error) {
          alert("Gagal menghapus transaksi: " + result.error);
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isPending}
      title="Hapus Transaksi"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
