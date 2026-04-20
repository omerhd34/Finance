"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import {
  positionFormSchema,
  type PositionFormValues,
} from "@/lib/investments-schema";
import { currencySymbolLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PositionFormFields } from "./position-form-fields";

const emptyDefaults = (): PositionFormValues => ({
  assetType: "GOLD",
  goldSubtype: "GRAM",
  title: "",
  ticker: "",
  quantity: 0,
  avgCostPerUnit: 0,
  marketPricePerUnit: "",
  note: "",
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listTab: "GOLD" | "STOCK";
  currency: string;
  onSubmit: (values: PositionFormValues) => Promise<void>;
};

export function NewPositionDialog({
  open,
  onOpenChange,
  listTab,
  currency,
  onSubmit,
}: Props) {
  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: emptyDefaults(),
  });

  useEffect(() => {
    if (open) {
      form.setValue("assetType", listTab);
      if (listTab === "GOLD") {
        form.setValue("goldSubtype", form.getValues("goldSubtype") ?? "GRAM");
      } else {
        form.setValue("goldSubtype", undefined);
      }
    }
  }, [open, listTab, form]);

  async function handleSubmit(values: PositionFormValues) {
    await onSubmit(values);
    form.reset({
      assetType: listTab,
      goldSubtype: listTab === "GOLD" ? "GRAM" : undefined,
      title: "",
      ticker: "",
      quantity: 0,
      avgCostPerUnit: 0,
      marketPricePerUnit: "",
      note: "",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="cursor-pointer">
          <Plus className="h-4 w-4" />
          Kayıt ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni kayıt</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Birim fiyatlar {currencySymbolLabel(currency)} ile girilir; kayıt TL
            bazında saklanır.
          </p>
          <PositionFormFields
            form={form}
            currency={currency}
            stockPlaceholders
          />
          <DialogFooter>
            <Button type="submit" className="cursor-pointer">
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
