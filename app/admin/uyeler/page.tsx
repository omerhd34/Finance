import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  ADMIN_SESSION_COOKIE,
  getAdminEmailFromSessionToken,
} from "@/lib/admin/admin";
import { prisma } from "@/lib/db/prisma";
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

const PAGE_SIZE = 20;

function getFilterChipClass(isActive: boolean): string {
  return [
    "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
  ].join(" ");
}

export default async function AdminUyelerPage({
  searchParams,
}: {
  searchParams?: Promise<{
    sayfa?: string | string[];
    siralama?: string | string[];
    planFiltre?: string | string[];
    dogrulamaFiltre?: string | string[];
  }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const adminEmail = getAdminEmailFromSessionToken(token);
  if (!adminEmail) redirect("/admin/giris");

  const params = await searchParams;
  const rawPage = Array.isArray(params?.sayfa)
    ? params?.sayfa[0]
    : params?.sayfa;
  const rawSort = Array.isArray(params?.siralama)
    ? params?.siralama[0]
    : params?.siralama;
  const rawPlanFilter = Array.isArray(params?.planFiltre)
    ? params?.planFiltre[0]
    : params?.planFiltre;
  const rawVerificationFilter = Array.isArray(params?.dogrulamaFiltre)
    ? params?.dogrulamaFiltre[0]
    : params?.dogrulamaFiltre;

  const parsedPage = Number(rawPage);
  const sortOrder = rawSort === "asc" ? "asc" : "desc";
  const planFilter =
    rawPlanFilter === "premium" || rawPlanFilter === "free"
      ? rawPlanFilter
      : "tum";
  const verificationFilter =
    rawVerificationFilter === "dogrulandi" ||
    rawVerificationFilter === "dogrulanmadi"
      ? rawVerificationFilter
      : "tum";

  const totalMembers = await prisma.user.count();
  const verifiedMembers = await prisma.user.count({
    where: { emailVerified: { not: null } },
  });
  const premiumMembers = await prisma.user.count({
    where: { planTier: "premium" },
  });

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
  const activeThisWeek = await prisma.user.count({
    where: {
      lastActiveAt: { gte: sevenDaysAgo },
    } as Prisma.UserWhereInput,
  });

  const where: Prisma.UserWhereInput = {
    ...(planFilter !== "tum" ? { planTier: planFilter } : {}),
    ...(verificationFilter === "dogrulandi"
      ? { emailVerified: { not: null } }
      : {}),
    ...(verificationFilter === "dogrulanmadi" ? { emailVerified: null } : {}),
  };

  const filteredMembers = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(filteredMembers / PAGE_SIZE));
  const currentPage = Number.isFinite(parsedPage)
    ? Math.min(totalPages, Math.max(1, Math.floor(parsedPage)))
    : 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const members = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      profession: true,
      city: true,
      planTier: true,
      country: true,
      createdAt: true,
      emailVerified: true,
      lastActiveAt: true,
    } as Prisma.UserSelect,
    where,
    orderBy: { createdAt: sortOrder },
    skip,
    take: PAGE_SIZE,
  });

  const activeFilterCount =
    (planFilter !== "tum" ? 1 : 0) + (verificationFilter !== "tum" ? 1 : 0);

  const buildHref = (
    page: number,
    sort: "asc" | "desc",
    plan: "tum" | "premium" | "free" = planFilter,
    verification: "tum" | "dogrulandi" | "dogrulanmadi" = verificationFilter,
  ) => {
    const query = new URLSearchParams();
    query.set("sayfa", String(page));
    query.set("siralama", sort);
    if (plan !== "tum") query.set("planFiltre", plan);
    if (verification !== "tum") query.set("dogrulamaFiltre", verification);
    return `/admin/uyeler?${query.toString()}`;
  };

  const nextSortOrder = sortOrder === "desc" ? "asc" : "desc";
  const sortHref = buildHref(1, nextSortOrder);
  const previousPageHref = buildHref(currentPage - 1, sortOrder);
  const nextPageHref = buildHref(currentPage + 1, sortOrder);
  const allPlanHref = buildHref(1, sortOrder, "tum");
  const premiumPlanHref = buildHref(1, sortOrder, "premium");
  const freePlanHref = buildHref(1, sortOrder, "free");
  const allVerificationHref = buildHref(1, sortOrder, planFilter, "tum");
  const verifiedHref = buildHref(1, sortOrder, planFilter, "dogrulandi");
  const unverifiedHref = buildHref(1, sortOrder, planFilter, "dogrulanmadi");

  return (
    <div className="mx-auto w-full max-w-8xl space-y-4 p-4 md:p-6">
      <AdminSharedHeader active="uyeler" />

      <Card>
        <CardHeader>
          <CardTitle>Üye Listesi</CardTitle>
          <CardDescription>
            Sisteme kayıtlı tüm üyeleri görüntüleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Toplam üye</p>
            <p className="text-xl font-semibold">{totalMembers}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Doğrulanmış e-posta</p>
            <p className="text-xl font-semibold">{verifiedMembers}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Premium üye</p>
            <p className="text-xl font-semibold">{premiumMembers}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Son 7 günde aktif</p>
            <p className="text-xl font-semibold">{activeThisWeek}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Üyeler</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 rounded-xl border border-border/70 bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold tracking-tight">Filtreler</p>
              <p className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Gösterilen:{" "}
                <span className="font-semibold text-foreground">
                  {filteredMembers}
                </span>{" "}
                / {totalMembers}
                {activeFilterCount > 0 ? ` • ${activeFilterCount} aktif` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  Plan
                </span>
                <div className="inline-flex rounded-full border border-border/70 bg-background p-1">
                  <Link
                    href={allPlanHref}
                    className={getFilterChipClass(planFilter === "tum")}
                  >
                    Tümü
                  </Link>
                  <Link
                    href={premiumPlanHref}
                    className={getFilterChipClass(planFilter === "premium")}
                  >
                    Premium
                  </Link>
                  <Link
                    href={freePlanHref}
                    className={getFilterChipClass(planFilter === "free")}
                  >
                    Free
                  </Link>
                </div>
              </div>
              <div className="h-5 w-px bg-border/70" />
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  Doğrulama
                </span>
                <div className="inline-flex rounded-full border border-border/70 bg-background p-1">
                  <Link
                    href={allVerificationHref}
                    className={getFilterChipClass(verificationFilter === "tum")}
                  >
                    Tümü
                  </Link>
                  <Link
                    href={verifiedHref}
                    className={getFilterChipClass(
                      verificationFilter === "dogrulandi",
                    )}
                  >
                    Doğrulandı
                  </Link>
                  <Link
                    href={unverifiedHref}
                    className={getFilterChipClass(
                      verificationFilter === "dogrulanmadi",
                    )}
                  >
                    Doğrulanmadı
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1050px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead className="w-[260px]">E-posta</TableHead>
                  <TableHead>Meslek</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Ülke</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Doğrulama</TableHead>
                  <TableHead>
                    <Link
                      href={sortHref}
                      className="inline-flex cursor-pointer items-center hover:underline"
                    >
                      Kayıt Tarihi
                    </Link>
                  </TableHead>
                  <TableHead>Son Aktivite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const lastActiveAt =
                    (member as unknown as { lastActiveAt: Date | null })
                      .lastActiveAt ?? null;

                  return (
                    <TableRow key={member.id}>
                      <TableCell>{member.name?.trim() || "-"}</TableCell>
                      <TableCell className="max-w-[260px] truncate">
                        {member.email}
                      </TableCell>
                      <TableCell>{member.profession?.trim() || "-"}</TableCell>
                      <TableCell>{member.city?.trim() || "-"}</TableCell>
                      <TableCell>{member.country?.trim() || "-"}</TableCell>
                      <TableCell>
                        {member.planTier === "premium" ? "Premium" : "Free"}
                      </TableCell>
                      <TableCell>
                        {member.emailVerified ? (
                          <Check
                            className="h-4 w-4 text-emerald-500"
                            aria-label="Doğrulandı"
                          />
                        ) : (
                          <X
                            className="h-4 w-4 text-red-500"
                            aria-label="Doğrulanmadı"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat("tr-TR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(member.createdAt))}
                      </TableCell>
                      <TableCell>
                        {lastActiveAt
                          ? new Intl.DateTimeFormat("tr-TR", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(lastActiveAt)
                          : "-"}
                      </TableCell>{" "}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2">
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
            <Link href={previousPageHref} aria-label="Önceki sayfa">
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
            <Link href={nextPageHref} aria-label="Sonraki sayfa">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
