"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Scale, Search, Menu, X, LogOut, LayoutDashboard, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { NavbarSearch } from "@/components/NavbarSearch";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [navLinks, setNavLinks] = useState([
    { name: "Categories", href: "/categories" },
    { name: "Filter Finder", href: "/filter" },
  ]);

  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdminPage) return; // Don't fetch nav links on admin pages

    const fetchNav = async () => {
      try {
        const dynamicLinks = await api.categories.nav();
        setNavLinks([
          { name: "Categories", href: "/categories" },
          ...dynamicLinks,
          { name: "Filter Finder", href: "/filter" },
        ]);
      } catch (err) {
        console.error("Failed to fetch nav links", err);
        setNavLinks([
          { name: "Categories", href: "/categories" },
          { name: "Smartphones", href: "/categories/smartphone" },
          { name: "Laptops", href: "/categories/laptop" },
          { name: "Filter Finder", href: "/filter" },
        ]);
      }
    };
    fetchNav();
  }, [isAdminPage]);

  // Simplified Admin Navbar
  if (isAdminPage) {
    return (
      <nav className="sticky top-0 z-[100] w-full border-b bg-zinc-950 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg tracking-tight group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Scale className="h-5 w-5" />
            </div>
            <span>Admin <span className="text-blue-500">Panel</span></span>
          </Link>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 font-bold gap-2 transition-all"
              onClick={() => window.open('/', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View Site</span>
            </Button>
            
            <div className="w-px h-4 bg-zinc-800 mx-2 hidden sm:block" />

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 font-bold gap-2 transition-all"
              onClick={() => {
                localStorage.removeItem("admin_token");
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-[100] w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Scale className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block tracking-tighter">
              Comparizone<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800",
                  pathname === link.href ? "text-blue-600 bg-blue-50 dark:bg-zinc-800" : "text-zinc-600 dark:text-zinc-300"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavbarSearch />
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link href="/compare" className="flex items-center">
                <Scale className="h-4 w-4 mr-2" />
                Compare
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/compare">
                <Scale className="h-5 w-5" />
              </Link>
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-white dark:bg-zinc-950">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  pathname === link.href ? "text-blue-600 bg-blue-50" : "text-zinc-600 hover:text-blue-600 hover:bg-zinc-50"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 px-3 flex gap-2">
              <Button className="w-full" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>Admin Login</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
