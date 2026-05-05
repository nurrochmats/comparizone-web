import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FooterAds } from "@/components/FooterAds";
import { FooterAdsServer } from "@/components/FooterAdsServer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Komparasi - Product Comparison Platform",
  description: "Find and compare the best products in the market.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <FooterAds>
          <FooterAdsServer />
        </FooterAds>
        <footer className="border-t py-8 mt-auto bg-white dark:bg-zinc-950">
          <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Otpas. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
