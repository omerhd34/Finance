import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  ADMIN_SESSION_COOKIE,
  getAdminEmailFromSessionToken,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";
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

const PAGE_SIZE = 10;

function formatDate(value: Date | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminUyelerPage({
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
  const verifiedMembers = await prisma.user.count({
    where: { emailVerified: { not: null } },
  });
  const premiumMembers = await prisma.user.count({
    where: { planTier: "premium" },
  });
  const totalPages = Math.max(1, Math.ceil(totalMembers / PAGE_SIZE));
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
      country: true,
      planTier: true,
      createdAt: true,
      emailVerified: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE,
  });

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
        <CardContent className="grid gap-2 sm:grid-cols-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Üyeler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Meslek</TableHead>
                <TableHead>Şehir</TableHead>
                <TableHead>Ülke</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Doğrulama</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name?.trim() || "-"}</TableCell>
                  <TableCell>{member.email}</TableCell>
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
                  <TableCell>{formatDate(member.createdAt)}</TableCell>
                </TableRow>
              ))}
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
              href={`/admin/uyeler?sayfa=${currentPage - 1}`}
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
              href={`/admin/uyeler?sayfa=${currentPage + 1}`}
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
