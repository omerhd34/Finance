"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tryAmountToDisplay } from "@/lib/currency";
import {
  positionFormSchema,
  type PositionFormValues,
} from "@/lib/investments-schema";
import type { InvestmentPosition } from "@/types/investment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PositionFormFields } from "./position-form-fields";

type Props = {
  position: InvestmentPosition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSave: (positionId: string, values: PositionFormValues) => Promise<void>;
};

export function EditPositionDialog({
  position,
  open,
  onOpenChange,
  currency,
  onSave,
}: Props) {
  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      assetType: "GOLD",
      goldSubtype: "GRAM",
      title: "",
      ticker: "",
      quantity: 0,
      avgCostPerUnit: 0,
      marketPricePerUnit: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!position) return;
    form.reset({
      assetType: position.assetType,
      goldSubtype:
        position.assetType === "GOLD"
          ? (position.goldSubtype ?? "GRAM")
          : undefined,
      title: position.title,
      ticker: position.ticker ?? "",
      quantity: position.quantity,
      avgCostPerUnit: tryAmountToDisplay(position.avgCostPerUnitTry, currency),
      marketPricePerUnit:
        position.marketPricePerUnitTry != null
          ? String(tryAmountToDisplay(position.marketPricePerUnitTry, currency))
          : "",
      note: position.note ?? "",
    });
  }, [position, form, currency]);

  async function handleSubmit(values: PositionFormValues) {
    if (!position) return;
    await onSave(position.id, values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pozisyonu düzenle</DialogTitle>
        </DialogHeader>
        {position && (
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <PositionFormFields form={form} currency={currency} />
            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
