"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const META_PIXEL_ID = "992834233285834";

export function MetaPixel() {
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
      <Script id="meta-pixel" strategy="lazyOnload">
        {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
