"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { landingEyebrow } from "@/components/landing/landing-eyebrow";
import {
  landingFaqItems,
  type LandingFaqItem,
} from "@/components/landing/landing-faq-content";
import { Button } from "@/components/ui/button";

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
  buttonId,
  panelId,
}: {
  item: LandingFaqItem;
  isOpen: boolean;
  onToggle: () => void;
  buttonId: string;
  panelId: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-muted/30 sm:px-6 sm:py-6"
        >
          <span className="font-serif text-base font-medium leading-snug text-foreground sm:text-lg">
            {item.question}
          </span>
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/80 text-muted-foreground dark:border-zinc-700"
            aria-hidden
          >
            {isOpen ? (
              <Minus className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            )}
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="border-t border-border/60 px-5 pb-5 dark:border-zinc-800 sm:px-6 sm:pb-6"
      >
        <p className="pt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function LandingFaqSection() {
  const baseId = useId();
  const [openId, setOpenId] = useState<string>(landingFaqItems[0]?.id ?? "");

  return (
    <section
      id="sss"
      className="relative overflow-hidden border-t border-border/60 py-16 md:py-24"
      aria-labelledby="landing-faq-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[min(100%,640px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgb(52_211_153/0.1),transparent_72%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 xl:px-0">
        <div className="text-center">
          <p className={landingEyebrow}>SSS</p>
          <h2
            id="landing-faq-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Sık sorulan sorular
          </h2>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:mt-12">
          {landingFaqItems.map((item) => {
            const isOpen = openId === item.id;
            const buttonId = `${baseId}-${item.id}-trigger`;
            const panelId = `${baseId}-${item.id}-panel`;

            return (
              <FaqAccordionItem
                key={item.id}
                item={item}
                isOpen={isOpen}
                buttonId={buttonId}
                panelId={panelId}
                onToggle={() =>
                  setOpenId((current) => (current === item.id ? "" : item.id))
                }
              />
            );
          })}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8"
            asChild
          >
            <Link href="/sss">Diğerleri</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
