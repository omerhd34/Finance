"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewTransactionForm } from "./new-transaction-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void | Promise<void>;
};

export function NewTransactionDialog({ open, onOpenChange, onCreated }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-[#22c55e] text-primary-foreground hover:bg-[#22c55e]/90">
          Yeni İşlem Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Yeni işlem</DialogTitle>
        </DialogHeader>
        <NewTransactionForm
          variant="dialog"
          dialogOpen={open}
          onSuccess={async () => {
            await onCreated();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
