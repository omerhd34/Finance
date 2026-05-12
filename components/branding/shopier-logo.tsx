import Image from "next/image";
import { cn } from "@/lib/common/utils";

type ShopierLogoProps = {
  className?: string;
};

export function ShopierLogo({ className }: ShopierLogoProps) {
  return (
    <Image
      src="/shopier.png"
      alt=""
      width={2000}
      height={574}
      aria-hidden
      className={cn("h-7 w-auto sm:h-8", className)}
    />
  );
}
