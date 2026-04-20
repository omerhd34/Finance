import type { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUserCurrency } from "@/lib/currency";
import { normalizePlanTier } from "@/lib/plan-tier";
import { MemberProfileCard } from "@/components/profile/member-profile-card";

type ProfilePageProps = {
  params: Promise<{ userId: string }>;
};

type ProfileRow = {
  id: string;
  name: string | null;
  profession: string | null;
  city: string | null;
  country: string | null;
  monthStartDay: number;
  email: string;
  image: string | null;
  currency: string;
  planTier: string;
  createdAt: Date;
};

export default async function MemberProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/giris");
  }

  const { userId } = await params;
  const profile = (await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      profession: true,
      city: true,
      country: true,
      monthStartDay: true,
      email: true,
      image: true,
      currency: true,
      planTier: true,
      createdAt: true,
    } as unknown as Prisma.UserSelect,
  })) as ProfileRow | null;

  if (!profile) {
    const sessionEmail = session.user.email?.trim().toLowerCase();
    if (sessionEmail) {
      const fallbackUser = await prisma.user.findUnique({
        where: { email: sessionEmail },
        select: { id: true },
      });
      if (fallbackUser?.id) {
        redirect(`/profil/${fallbackUser.id}`);
      }

      const createdUser = await prisma.user.create({
        data: {
          id: session.user.id,
          email: sessionEmail,
          name: session.user.name?.trim() || null,
          image: session.user.image ?? null,
        },
        select: { id: true },
      });
      redirect(`/profil/${createdUser.id}`);
    }
    notFound();
  }

  const planTier = normalizePlanTier(profile.planTier);
  const ownProfile = session.user.id === profile.id;

  return (
    <div className="space-y-6">
      <MemberProfileCard
        ownProfile={ownProfile}
        initial={{
          id: profile.id,
          name: profile.name,
          profession: profile.profession,
          city: profile.city,
          country: profile.country,
          monthStartDay: profile.monthStartDay,
          email: profile.email,
          image: profile.image,
          currency: normalizeUserCurrency(profile.currency),
          planTier,
          createdAtIso: profile.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
