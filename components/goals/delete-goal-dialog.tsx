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

export function DeleteGoalDialog({
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hedefi sil</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bu hedefi silmek istediğinize emin misiniz?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
