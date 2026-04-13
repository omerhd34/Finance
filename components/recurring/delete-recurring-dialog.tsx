"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteRecurringDialog({
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tekrarlayan işlemi silinsin mi?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bu işlem geçmiş işlem kayıtlarını silmez; yalnızca tekrarlayan işlemi
          kaldırır.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={onConfirm}
          >
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
