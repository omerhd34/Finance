"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Transaction } from "@/types/transaction";
import { transactionCreateSchema } from "@/lib/validations";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { displayAmountToTry, tryAmountToDisplay } from "@/lib/currency";
import {
  currencySymbolLabel,
  formatMoneyAmount,
  formatDateShort,
} from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteTransaction,
  fetchTransactions,
  setFilters,
  setPage,
  updateTransaction,
  type TransactionFilters,
} from "@/store/slices/transactionSlice";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Download, FileText, ChevronDown } from "lucide-react";
import { downloadTransactionsPdf } from "@/lib/export-transactions-pdf";

const ALL_FILTER_CATEGORIES = Array.from(
  new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]),
);

const editSchema = transactionCreateSchema
  .omit({ date: true, type: true })
  .extend({
    date: z.string().min(1),
  });

type EditForm = z.infer<typeof editSchema>;

function TransactionsPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { items, loading, error, filters, total, page, pageSize } =
    useAppSelector((s) => s.transactions);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    void dispatch(fetchTransactions({ filters, page, pageSize }));
  }, [dispatch, filters, page, pageSize]);

  useEffect(() => {
    const patch: Partial<TransactionFilters> = {};
    const cat = searchParams.get("category");
    if (cat !== null) patch.category = cat;
    const typ = searchParams.get("type");
    if (typ === "income" || typ === "expense") patch.type = typ;
    const from = searchParams.get("from");
    if (from !== null) patch.dateFrom = from;
    const to = searchParams.get("to");
    if (to !== null) patch.dateTo = to;
    const q = searchParams.get("search");
    if (q !== null) patch.search = q;
    if (Object.keys(patch).length > 0) {
      dispatch(setFilters(patch));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (!editing) return;
    form.reset({
      amount: tryAmountToDisplay(editing.amount, currency),
      category: editing.category,
      description: editing.description ?? "",
      date: new Date(editing.date).toISOString().slice(0, 10),
    });
  }, [editing, form, currency]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filterFields = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      <div className="flex flex-col gap-2.5">
        <Label className="shrink-0">Arama</Label>
        <Input
          placeholder="Açıklama veya kategori"
          value={filters.search}
          onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <Label className="shrink-0">Tür</Label>
        <Select
          value={filters.type || "all"}
          onValueChange={(v) =>
            dispatch(
              setFilters({
                type: v === "all" ? "" : (v as "income" | "expense"),
              }),
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="income">Gelir</SelectItem>
            <SelectItem value="expense">Gider</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label className="shrink-0">Kategori</Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(v) =>
            dispatch(setFilters({ category: v === "all" ? "" : v }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {ALL_FILTER_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label className="shrink-0">Başlangıç</Label>
        <DatePickerField
          value={filters.dateFrom}
          onChange={(v) => dispatch(setFilters({ dateFrom: v }))}
          allowClear
          placeholder="Tarih seçin"
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <Label className="shrink-0">Bitiş</Label>
        <DatePickerField
          value={filters.dateTo}
          onChange={(v) => dispatch(setFilters({ dateTo: v }))}
          allowClear
          placeholder="Tarih seçin"
        />
      </div>
      <div className="flex items-end gap-2">
        <Button
          variant="secondary"
          className="w-full cursor-pointer"
          onClick={() =>
            dispatch(
              setFilters({
                type: "",
                category: "",
                dateFrom: "",
                dateTo: "",
                search: "",
              }),
            )
          }
        >
          Filtreleri temizle
        </Button>
      </div>
    </div>
  );

  async function fetchExportRows(): Promise<Transaction[]> {
    const p = new URLSearchParams();
    if (filters.type) p.set("type", filters.type);
    if (filters.category) p.set("category", filters.category);
    if (filters.dateFrom) p.set("from", filters.dateFrom);
    if (filters.dateTo) p.set("to", filters.dateTo);
    if (filters.search.trim()) p.set("search", filters.search.trim());
    p.set("limit", "2000");
    const { data } = await apiClient.get<{ items: Transaction[] }>(
      `/api/transactions?${p.toString()}`,
    );
    return data.items;
  }

  async function exportCsv() {
    setExporting("csv");
    try {
      const rows = await fetchExportRows();
      const sep = ";";
      const q = (value: string) => {
        if (!/[;\r\n"]/.test(value)) return value;
        return `"${value.replace(/"/g, '""')}"`;
      };
      const header = [
        "Tarih",
        "Kategori",
        "Açıklama",
        `Tutar (${currencySymbolLabel(currency)})`,
        "Tür",
      ];
      const brandRow = ["FinansIQ", "", "", "", ""].join(sep);
      const lines = [
        brandRow,
        header.join(sep),
        ...rows.map((t) =>
          [
            formatDateShort(t.date),
            q(t.category),
            q(t.description ?? ""),
            String(t.amount),
            t.type === "income" ? "Gelir" : "Gider",
          ].join(sep),
        ),
      ];
      const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `islemler-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  async function exportPdf() {
    setExporting("pdf");
    try {
      const rows = await fetchExportRows();
      const name = `islemler-${new Date().toISOString().slice(0, 10)}.pdf`;
      await downloadTransactionsPdf(rows, currency, name);
    } finally {
      setExporting(null);
    }
  }

  async function saveEdit(values: EditForm) {
    if (!editing) return;
    const d = new Date(values.date + "T12:00:00");
    await dispatch(
      updateTransaction({
        id: editing.id,
        body: {
          amount: displayAmountToTry(values.amount, currency),
          category: values.category,
          description: values.description || undefined,
          date: d.toISOString(),
          type: editing.type,
        },
      }),
    );
    setEditing(null);
    void dispatch(fetchTransactions({ filters, page, pageSize }));
  }

  async function confirmDelete() {
    if (!deleting) return;
    await dispatch(deleteTransaction(deleting.id));
    setDeleting(null);
    void dispatch(fetchTransactions({ filters, page, pageSize }));
  }

  const editTypeTab = editing?.type ?? "expense";
  const categories = useMemo(
    () => (editTypeTab === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES),
    [editTypeTab],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">İşlem listesi</h2>
          <p className="text-sm text-muted-foreground">
            Filtreleyin, düzenleyin veya dışa aktar menüsünden format seçin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={exporting !== null}
                className="cursor-pointer"
              >
                <Download className="h-4 w-4" />
                {exporting !== null ? "İndiriliyor..." : "Dışa aktar"}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-(--radix-dropdown-menu-trigger-width) w-(--radix-dropdown-menu-trigger-width)"
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => {
                  void exportCsv();
                }}
              >
                <Download className="h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => {
                  void exportPdf();
                }}
              >
                <FileText className="h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild className="cursor-pointer">
            <Link href="/transactions/new">Yeni İşlem Ekle</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>
            Tarih aralığı ve kategori ile daraltın.
          </CardDescription>
        </CardHeader>
        <CardContent>{filterFields}</CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tutar ({currencySymbolLabel(currency)})</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{formatDateShort(t.date)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/transactions?category=${encodeURIComponent(t.category)}&type=${encodeURIComponent(t.type)}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {t.category}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {t.description ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatMoneyAmount(t.amount, currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.type === "income" ? "income" : "expense"}
                        >
                          {t.type === "income" ? "Gelir" : "Gider"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Düzenle"
                          onClick={() => setEditing(t)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive cursor-pointer"
                          aria-label="Sil"
                          onClick={() => setDeleting(t)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border p-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Toplam {total} kayıt — sayfa {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="cursor-pointer"
                size="sm"
                disabled={page <= 1}
                onClick={() => dispatch(setPage(page - 1))}
              >
                Önceki
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => dispatch(setPage(page + 1))}
              >
                Sonraki
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlemi düzenle</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={form.handleSubmit(saveEdit)} className="space-y-4">
              <Tabs value={editing.type}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense" disabled>
                    Gider
                  </TabsTrigger>
                  <TabsTrigger value="income" disabled>
                    Gelir
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                Tür:{" "}
                <strong>{editing.type === "income" ? "Gelir" : "Gider"}</strong>{" "}
                (değiştirilemez)
              </p>
              <div className="space-y-2">
                <Label>Tutar ({currencySymbolLabel(currency)})</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("amount", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Kayıt TL olarak saklanır.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(v) => form.setValue("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea {...form.register("description")} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Tarih</Label>
                <DatePickerField
                  value={form.watch("date")}
                  onChange={(v) =>
                    form.setValue("date", v, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="cursor-pointer">
                  Kaydet
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlemi sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bu işlemi kalıcı olarak silmek istediğinize emin misiniz?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      }
    >
      <TransactionsPageContent />
    </Suspense>
  );
}
