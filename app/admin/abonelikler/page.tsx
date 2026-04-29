import Link from "next/link";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminSharedHeader } from "@/components/admin/admin-shared-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ADMIN_SESSION_COOKIE,
  getAdminEmailFromSessionToken,
} from "@/lib/admin";
import {
  PREMIUM_SUBSCRIPTION_DAYS,
  addPremiumPeriod,
} from "@/lib/premium-subscription";
import { prisma } from "@/lib/prisma";
import {
  generateShopierOrderCode,
  getPremiumPlanAmountTry,
} from "@/lib/shopier";

const PAGE_SIZE = 10;

function formatDate(value: Date | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatAmount(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function displayPaymentStatus(status: string | null | undefined): string {
  if (!status) return "-";
  if (status === "ADMIN_COMPED") return "Admin tarafından karşılandı";
  return status;
}

function displayPaymentAmount(
  status: string | null | undefined,
  amountTry: number | null | undefined,
): string {
  if (status === "ADMIN_COMPED") return "Admin tarafından karşılandı";
  return formatAmount(amountTry ?? null);
}

function fallbackPaidAtFromPremiumUntil(
  premiumUntil: Date | null,
): Date | null {
  if (!premiumUntil) return null;
  return new Date(
    premiumUntil.getTime() - PREMIUM_SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000,
  );
}

export default async function AdminAboneliklerPage({
  searchParams,
}: {
  searchParams?: Promise<{ sayfa?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const adminEmail = getAdminEmailFromSessionToken(token);
  if (!adminEmail) redirect("/admin/giris");
  const params = await searchParams;
  const rawPage = Array.isArray(params?.sayfa)
    ? params?.sayfa[0]
    : params?.sayfa;
  const parsedPage = Number(rawPage);

  const totalMembers = await prisma.user.count();
  const premiumCount = await prisma.user.count({
    where: { planTier: "premium" },
  });
  const totalPages = Math.max(1, Math.ceil(totalMembers / PAGE_SIZE));
  const currentPage = Number.isFinite(parsedPage)
    ? Math.min(totalPages, Math.max(1, Math.floor(parsedPage)))
    : 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  async function updatePlanAction(formData: FormData) {
    "use server";
    const serverCookieStore = await cookies();
    const serverToken = serverCookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const admin = getAdminEmailFromSessionToken(serverToken);
    if (!admin) redirect("/admin/giris");

    const userId = String(formData.get("userId") ?? "");
    const targetPlan = String(formData.get("targetPlan") ?? "");
    if (!userId || (targetPlan !== "free" && targetPlan !== "premium")) return;

    if (targetPlan === "premium") {
      const now = new Date();
      let orderCode = "";
      for (let i = 0; i < 8; i++) {
        orderCode = generateShopierOrderCode(userId);
        const exists = await prisma.shopierOrder.findUnique({
          where: { orderCode },
          select: { id: true },
        });
        if (!exists) break;
      }
      if (!orderCode) return;

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            planTier: "premium",
            premiumUntil: addPremiumPeriod(now),
          },
        });

        await tx.shopierOrder.create({
          data: {
            orderCode,
            userId,
            status: "ADMIN_COMPED",
            amountTry: getPremiumPlanAmountTry(),
            currency: "TRY",
            paidAt: now,
            planGrantedAt: now,
            rawPayload: {
              source: "admin-panel",
              note: "Admin covered payment",
            },
          },
        });
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          planTier: "free",
          premiumUntil: null,
        },
      });
    }

    revalidatePath("/admin/abonelikler");
  }

  const members = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      planTier: true,
      premiumUntil: true,
      createdAt: true,
      shopierOrders: {
        select: {
          status: true,
          amountTry: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE,
  });

  return (
    <div className="mx-auto w-full max-w-8xl space-y-4 p-4 md:p-6">
      <AdminSharedHeader active="abonelikler" />
      <Card>
        <CardHeader>
          <CardTitle>Abonelik ve Ödeme Yönetimi</CardTitle>
          <CardDescription>
            Kullanıcı detayına girmeden sadece plan ve ödeme durumunu yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Toplam üye:{" "}
            <span className="font-semibold text-foreground">
              {totalMembers}
            </span>{" "}
            | Premium:{" "}
            <span className="font-semibold text-foreground">
              {premiumCount}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan ve Son Ödeme</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-posta</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Premium Bitiş</TableHead>
                <TableHead>Son Ödeme Durumu</TableHead>
                <TableHead>Son Ödeme Tutarı</TableHead>
                <TableHead>Son Ödeme Tarihi</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const latestOrder = member.shopierOrders[0] ?? null;
                const fallbackPaidAt =
                  latestOrder == null && member.planTier === "premium"
                    ? fallbackPaidAtFromPremiumUntil(member.premiumUntil)
                    : null;
                const paymentStatus =
                  latestOrder?.status ??
                  (fallbackPaidAt ? "ADMIN_COMPED" : null);
                const paymentAmount =
                  latestOrder?.amountTry ??
                  (fallbackPaidAt ? getPremiumPlanAmountTry() : null);
                const paymentDate = latestOrder?.paidAt ?? fallbackPaidAt;
                return (
                  <TableRow key={member.id}>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.planTier === "premium" ? "income" : "outline"
                        }
                      >
                        {member.planTier === "premium" ? "Premium" : "Free"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(member.premiumUntil)}</TableCell>
                    <TableCell>{displayPaymentStatus(paymentStatus)}</TableCell>
                    <TableCell>
                      {displayPaymentAmount(paymentStatus, paymentAmount)}
                    </TableCell>
                    <TableCell>{formatDate(paymentDate ?? null)}</TableCell>
                    <TableCell className="text-right">
                      <form
                        action={updatePlanAction}
                        className="inline-flex gap-2"
                      >
                        <input type="hidden" name="userId" value={member.id} />
                        <input
                          type="hidden"
                          name="targetPlan"
                          value={
                            member.planTier === "premium" ? "free" : "premium"
                          }
                        />
                        <Button
                          className="cursor-pointer"
                          type="submit"
                          variant="outline"
                          size="sm"
                        >
                          {member.planTier === "premium"
                            ? "Free yap"
                            : "Premium yap"}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex items-center justify-end gap-2">
        {currentPage <= 1 ? (
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            size="icon"
            className="cursor-pointer"
          >
            <Link
              href={`/admin/abonelikler?sayfa=${currentPage - 1}`}
              aria-label="Önceki sayfa"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        {currentPage >= totalPages ? (
          <Button variant="outline" size="icon" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            size="icon"
            className="cursor-pointer"
          >
            <Link
              href={`/admin/abonelikler?sayfa=${currentPage + 1}`}
              aria-label="Sonraki sayfa"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
