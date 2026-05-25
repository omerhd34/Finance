"use client";

import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
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

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>İşlemi sil</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bu işlemi kalıcı olarak silmek istediğinize emin misiniz?
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Vazgeç
          </Button>
          <DeleteButton onClick={onConfirm} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
