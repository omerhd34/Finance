import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingPageShell } from "@/components/landing/landing-page-shell";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function LegalPageLayout({ title, description, children }: Props) {
  return (
    <LandingPageShell>
      <LandingHeader />
      <main className="flex-1 border-b border-border/40 px-4 pb-20 pt-24 md:pt-28">
        <article className="mx-auto max-w-6xl">
          <header className="mb-10 border-b border-border/60 pb-8">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-pretty text-muted-foreground md:text-lg">
                {description}
              </p>
            ) : null}
            <p className="mt-4 text-xs text-muted-foreground">
              Son güncelleme:{" "}
              {new Intl.DateTimeFormat("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </p>
          </header>
          <div className="legal-doc space-y-8 text-[15px] leading-relaxed text-muted-foreground md:text-base [&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:first:mt-0 [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:text-pretty [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
