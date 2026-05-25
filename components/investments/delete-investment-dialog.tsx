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

export function DeleteInvestmentDialog({
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kaydı sil?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Bu işlem geri alınamaz.</p>
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
