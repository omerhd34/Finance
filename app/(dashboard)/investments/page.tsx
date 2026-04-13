/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { displayAmountToTry, tryAmountToDisplay } from "@/lib/currency";
import {
  currencySymbolLabel,
  formatMoney,
  formatMoneyAmount,
} from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addInvestment,
  deleteInvestment,
  fetchInvestments,
  updateInvestment,
} from "@/store/slices/investmentsSlice";
import {
  GOLD_SUBTYPE_OPTIONS,
  GOLD_SUBTYPE_VALUES,
  formatGoldQuantityCell,
  goldMiktarLabel,
  goldSubtypeLabel,
} from "@/lib/gold-subtypes";
import {
  costBasisTry,
  pnlTry,
  valueTry,
} from "@/lib/investment-position-math";
import type { InvestmentPosition } from "@/types/investment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2 } from "lucide-react";

const positionFormSchema = z
  .object({
    assetType: z.enum(["GOLD", "STOCK"]),
    goldSubtype: z
      .enum(GOLD_SUBTYPE_VALUES as unknown as [string, ...string[]])
      .optional(),
    title: z.string().optional(),
    ticker: z.string().optional(),
    quantity: z.number().positive("Miktar pozitif olmalı"),
    avgCostPerUnit: z.number().positive("Alış fiyatı pozitif olmalı"),
    marketPricePerUnit: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.assetType === "GOLD") {
      if (!data.goldSubtype) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Altın türü seçin",
          path: ["goldSubtype"],
        });
      }
    }
    if (data.assetType === "STOCK") {
      const tit = data.title?.trim() ?? "";
      if (tit.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Başlık gerekli",
          path: ["title"],
        });
      }
      const t = data.ticker?.trim() ?? "";
      if (t.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hisse kodu gerekli",
          path: ["ticker"],
        });
      }
    }
    const raw = data.marketPricePerUnit?.trim() ?? "";
    if (raw !== "") {
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçerli bir fiyat girin veya boş bırakın",
          path: ["marketPricePerUnit"],
        });
      }
    }
  });

type PositionForm = z.infer<typeof positionFormSchema>;

export default function InvestmentsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.investments);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [tab, setTab] = useState<"GOLD" | "STOCK">("GOLD");
  const [newOpen, setNewOpen] = useState(false);
  const [editing, setEditing] = useState<InvestmentPosition | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const newForm = useForm<PositionForm>({
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

  const editForm = useForm<PositionForm>({
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

  const watchNewType = newForm.watch("assetType");
  const watchNewGoldSubtype = newForm.watch("goldSubtype");

  useEffect(() => {
    void dispatch(fetchInvestments());
  }, [dispatch]);

  useEffect(() => {
    if (newOpen) {
      newForm.setValue("assetType", tab);
      if (tab === "GOLD") {
        newForm.setValue(
          "goldSubtype",
          newForm.getValues("goldSubtype") ?? "GRAM",
        );
      } else {
        newForm.setValue("goldSubtype", undefined);
      }
    }
  }, [newOpen, tab, newForm]);

  const filtered = useMemo(
    () => items.filter((p) => p.assetType === tab),
    [items, tab],
  );

  const totals = useMemo(() => {
    let cost = 0;
    let val = 0;
    for (const p of filtered) {
      cost += costBasisTry(p);
      val += valueTry(p);
    }
    return { cost, val, pnl: val - cost };
  }, [filtered]);

  useEffect(() => {
    if (!editing) return;
    const p = items.find((x) => x.id === editing.id);
    if (!p) return;
    editForm.reset({
      assetType: p.assetType,
      goldSubtype:
        p.assetType === "GOLD" ? (p.goldSubtype ?? "GRAM") : undefined,
      title: p.title,
      ticker: p.ticker ?? "",
      quantity: p.quantity,
      avgCostPerUnit: tryAmountToDisplay(p.avgCostPerUnitTry, currency),
      marketPricePerUnit:
        p.marketPricePerUnitTry != null
          ? String(tryAmountToDisplay(p.marketPricePerUnitTry, currency))
          : "",
      note: p.note ?? "",
    });
  }, [editing, items, editForm, currency]);

  function parseOptionalUnitPrice(raw: string | undefined): number | null {
    const s = raw?.trim() ?? "";
    if (s === "") return null;
    const n = Number(s.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  async function onCreate(values: PositionForm) {
    const m = parseOptionalUnitPrice(values.marketPricePerUnit);
    await dispatch(
      addInvestment({
        assetType: values.assetType,
        goldSubtype:
          values.assetType === "GOLD" ? (values.goldSubtype ?? null) : null,
        title:
          values.assetType === "GOLD"
            ? goldSubtypeLabel(values.goldSubtype)
            : (values.title ?? "").trim(),
        ticker:
          values.assetType === "STOCK"
            ? values.ticker?.trim().toUpperCase()
            : null,
        quantity: values.quantity,
        avgCostPerUnitTry: displayAmountToTry(values.avgCostPerUnit, currency),
        marketPricePerUnitTry:
          m != null ? displayAmountToTry(m, currency) : null,
        note: values.note?.trim() ? values.note.trim() : null,
      }),
    );
    newForm.reset({
      assetType: tab,
      goldSubtype: tab === "GOLD" ? "GRAM" : undefined,
      title: "",
      ticker: "",
      quantity: 0,
      avgCostPerUnit: 0,
      marketPricePerUnit: "",
      note: "",
    });
    setNewOpen(false);
    void dispatch(fetchInvestments());
  }

  async function onEditSave() {
    if (!editing) return;
    const v = editForm.getValues();
    const m = parseOptionalUnitPrice(v.marketPricePerUnit);
    await dispatch(
      updateInvestment({
        id: editing.id,
        body: {
          assetType: v.assetType,
          goldSubtype: v.assetType === "GOLD" ? (v.goldSubtype ?? null) : null,
          title:
            v.assetType === "GOLD"
              ? goldSubtypeLabel(v.goldSubtype)
              : (v.title ?? "").trim(),
          ticker:
            v.assetType === "STOCK" ? v.ticker?.trim().toUpperCase() : null,
          quantity: v.quantity,
          avgCostPerUnitTry: displayAmountToTry(v.avgCostPerUnit, currency),
          marketPricePerUnitTry:
            m === null ? null : displayAmountToTry(m, currency),
          note: v.note?.trim() ? v.note.trim() : null,
        },
      }),
    );
    setEditing(null);
    void dispatch(fetchInvestments());
  }

  async function onConfirmDelete() {
    if (!deletingId) return;
    await dispatch(deleteInvestment(deletingId));
    setDeletingId(null);
    void dispatch(fetchInvestments());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Hisse &amp; altın</h2>
          <p className="text-sm text-muted-foreground">
            BIST hisseleri ve gram altın pozisyonlarınızı takip edin. Güncel
            fiyat alanına bugünkü kuru girebilirsiniz (otomatik kotasyon
            yakında).
          </p>
        </div>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Pozisyon ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni pozisyon</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={newForm.handleSubmit(onCreate)}
              className="space-y-4"
            >
              <p className="text-xs text-muted-foreground">
                Birim fiyatlar {currencySymbolLabel(currency)} ile girilir;
                kayıt TL bazında saklanır.
              </p>
              <div className="space-y-2">
                <Label>Tür</Label>
                <Select
                  value={newForm.watch("assetType")}
                  onValueChange={(v: "GOLD" | "STOCK") => {
                    newForm.setValue("assetType", v);
                    if (v === "GOLD") {
                      newForm.setValue("ticker", "");
                      newForm.setValue(
                        "goldSubtype",
                        newForm.getValues("goldSubtype") ?? "GRAM",
                      );
                    } else {
                      newForm.setValue("goldSubtype", undefined);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOLD">Altın</SelectItem>
                    <SelectItem value="STOCK">Hisse senedi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {watchNewType === "GOLD" && (
                <div className="space-y-2">
                  <Label>Altın türü</Label>
                  <Select
                    value={watchNewGoldSubtype ?? "GRAM"}
                    onValueChange={(val) =>
                      newForm.setValue(
                        "goldSubtype",
                        val as (typeof GOLD_SUBTYPE_VALUES)[number],
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOLD_SUBTYPE_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newForm.formState.errors.goldSubtype && (
                    <p className="text-sm text-destructive">
                      {newForm.formState.errors.goldSubtype.message}
                    </p>
                  )}
                </div>
              )}
              {watchNewType === "STOCK" && (
                <>
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input
                      placeholder="Örn. Türk Hava Yolları"
                      {...newForm.register("title")}
                    />
                    {newForm.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {newForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Hisse kodu</Label>
                    <Input
                      placeholder="THYAO"
                      {...newForm.register("ticker")}
                    />
                    {newForm.formState.errors.ticker && (
                      <p className="text-sm text-destructive">
                        {newForm.formState.errors.ticker.message}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>
                  {watchNewType === "GOLD"
                    ? goldMiktarLabel(watchNewGoldSubtype)
                    : "Adet (lot)"}
                </Label>
                <Input
                  type="number"
                  step="any"
                  {...newForm.register("quantity", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alış fiyatı ({currencySymbolLabel(currency)})</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...newForm.register("avgCostPerUnit", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Güncel fiyat ({currencySymbolLabel(currency)})</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Boş bırakılabilir"
                  {...newForm.register("marketPricePerUnit")}
                />
              </div>
              <div className="space-y-2">
                <Label>Not</Label>
                <Textarea rows={2} {...newForm.register("note")} />
              </div>
              <DialogFooter>
                <Button type="submit">Kaydet</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam maliyet</CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {formatMoney(totals.cost, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Güncel değer (tahmini)</CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {formatMoney(totals.val, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Güncel fiyat girilmeyen satırlarda alış fiyatı kullanılır.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kar / zarar</CardDescription>
            <CardTitle
              className={`text-xl tabular-nums ${
                totals.pnl > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : totals.pnl < 0
                    ? "text-destructive"
                    : ""
              }`}
            >
              {totals.pnl >= 0 ? "+" : ""}
              {formatMoneyAmount(totals.pnl, currency)}{" "}
              {currencySymbolLabel(currency)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "GOLD" | "STOCK")}>
        <TabsList>
          <TabsTrigger value="GOLD">Altın</TabsTrigger>
          <TabsTrigger value="STOCK">Hisse senedi</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {tab === "GOLD" ? "Altın pozisyonları" : "Hisse pozisyonları"}
              </CardTitle>
              <CardDescription>
                {loading ? "Yükleniyor…" : `${filtered.length} kayıt`}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tab === "STOCK" && <TableHead>Başlık</TableHead>}
                    {tab === "GOLD" && <TableHead>Altın türü</TableHead>}
                    {tab === "STOCK" && <TableHead>Kod</TableHead>}
                    <TableHead className="text-right">Miktar</TableHead>
                    <TableHead className="text-right">
                      Alış fiyatı ({currencySymbolLabel(currency)})
                    </TableHead>
                    <TableHead className="text-right">
                      Güncel fiyat ({currencySymbolLabel(currency)})
                    </TableHead>
                    <TableHead className="text-right">
                      Değer ({currencySymbolLabel(currency)})
                    </TableHead>
                    <TableHead className="text-right">
                      K/Z ({currencySymbolLabel(currency)})
                    </TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && !loading && (
                    <TableRow>
                      <TableCell
                        colSpan={tab === "GOLD" ? 7 : 8}
                        className="text-center text-muted-foreground"
                      >
                        Henüz kayıt yok. &quot;Pozisyon ekle&quot; ile başlayın.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((p) => {
                    const c = costBasisTry(p);
                    const v = valueTry(p);
                    const pl = pnlTry(p);
                    const hasM = p.marketPricePerUnitTry != null;
                    return (
                      <TableRow key={p.id}>
                        {tab === "STOCK" && (
                          <TableCell className="font-medium">
                            {p.title}
                          </TableCell>
                        )}
                        {tab === "GOLD" && (
                          <TableCell>
                            <Badge variant="outline">
                              {goldSubtypeLabel(p.goldSubtype)}
                            </Badge>
                          </TableCell>
                        )}
                        {tab === "STOCK" && (
                          <TableCell>
                            {p.ticker ? (
                              <Badge variant="secondary">{p.ticker}</Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right tabular-nums">
                          {tab === "GOLD"
                            ? formatGoldQuantityCell(p.quantity, p.goldSubtype)
                            : p.quantity.toLocaleString("tr-TR", {
                                maximumFractionDigits: 4,
                              })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="tabular-nums">
                            {formatMoneyAmount(p.avgCostPerUnitTry, currency)}{" "}
                            <span className="text-muted-foreground text-xs">
                              / birim
                            </span>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Toplam: {formatMoneyAmount(c, currency)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {hasM
                            ? formatMoneyAmount(
                                p.marketPricePerUnitTry!,
                                currency,
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMoneyAmount(v, currency)}
                        </TableCell>
                        <TableCell
                          className={`text-right tabular-nums ${
                            pl > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : pl < 0
                                ? "text-destructive"
                                : ""
                          }`}
                        >
                          {hasM ? (
                            <>
                              {pl >= 0 ? "+" : ""}
                              {formatMoneyAmount(pl, currency)}
                            </>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Düzenle"
                              onClick={() => setEditing(p)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              aria-label="Sil"
                              onClick={() => setDeletingId(p.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pozisyonu düzenle</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={editForm.handleSubmit(onEditSave)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Tür</Label>
                <Select
                  value={editForm.watch("assetType")}
                  onValueChange={(v: "GOLD" | "STOCK") => {
                    editForm.setValue("assetType", v);
                    if (v === "GOLD") {
                      editForm.setValue("ticker", "");
                      editForm.setValue(
                        "goldSubtype",
                        editForm.getValues("goldSubtype") ?? "GRAM",
                      );
                    } else {
                      editForm.setValue("goldSubtype", undefined);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOLD">Altın</SelectItem>
                    <SelectItem value="STOCK">Hisse senedi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editForm.watch("assetType") === "GOLD" && (
                <div className="space-y-2">
                  <Label>Altın türü</Label>
                  <Select
                    value={editForm.watch("goldSubtype") ?? "GRAM"}
                    onValueChange={(val) =>
                      editForm.setValue(
                        "goldSubtype",
                        val as (typeof GOLD_SUBTYPE_VALUES)[number],
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOLD_SUBTYPE_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editForm.formState.errors.goldSubtype && (
                    <p className="text-sm text-destructive">
                      {editForm.formState.errors.goldSubtype.message}
                    </p>
                  )}
                </div>
              )}
              {editForm.watch("assetType") === "STOCK" && (
                <>
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input {...editForm.register("title")} />
                    {editForm.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {editForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Hisse kodu</Label>
                    <Input {...editForm.register("ticker")} />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>
                  {editForm.watch("assetType") === "GOLD"
                    ? goldMiktarLabel(editForm.watch("goldSubtype"))
                    : "Adet (lot)"}
                </Label>
                <Input
                  type="number"
                  step="any"
                  {...editForm.register("quantity", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alış fiyatı ({currencySymbolLabel(currency)})</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...editForm.register("avgCostPerUnit", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Güncel fiyat ({currencySymbolLabel(currency)})</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  {...editForm.register("marketPricePerUnit")}
                />
              </div>
              <div className="space-y-2">
                <Label>Not</Label>
                <Textarea rows={2} {...editForm.register("note")} />
              </div>
              <DialogFooter>
                <Button type="submit">Kaydet</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pozisyonu sil?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bu işlem geri alınamaz.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() => void onConfirmDelete()}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
