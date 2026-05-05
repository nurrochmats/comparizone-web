"use client";

import { usePathname } from "next/navigation";

interface FooterAdsProps {
  children: React.ReactNode;
}

export function FooterAds({ children }: FooterAdsProps) {
  const pathname = usePathname();

  // Do not show ads on admin pages or login
  if (pathname?.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return <>{children}</>;
}
