"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GA_ID = "G-X6CFQR7EP5";
const ADS_ID = "AW-18071789147";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [enabled, setEnabled] = useState(!isLanding);

  useEffect(() => {
    if (!isLanding) return;

    const enable = () => setEnabled(true);
    const timeoutId = window.setTimeout(enable, 5000);

    window.addEventListener("scroll", enable, { once: true, passive: true });
    window.addEventListener("pointerdown", enable, {
      once: true,
      passive: true,
    });

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", enable);
      window.removeEventListener("pointerdown", enable);
    };
  }, [isLanding]);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
    gtag('config', '${ADS_ID}');
  `}
      </Script>
    </>
  );
}
