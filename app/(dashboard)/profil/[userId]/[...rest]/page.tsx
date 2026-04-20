import { redirect } from "next/navigation";

type ProfileNestedFallbackPageProps = {
  params: Promise<{ userId: string; rest: string[] }>;
};

export default async function ProfileNestedFallbackPage({
  params,
}: ProfileNestedFallbackPageProps) {
  const { userId } = await params;
  redirect(`/profil/${userId}`);
}
