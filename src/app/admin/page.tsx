"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, DashboardStats } from "@/lib/api-client";
import { StatCard } from "@/components/StatCard";
import { Package, FolderTree, Settings2, BarChart3, LogOut, ExternalLink, Link2, Megaphone, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Pass the mock token. In reality it goes via Authorization header
    api.admin.dashboard(token)
      .then(setStats)
      .catch(err => {
        setError("Failed to load dashboard. Are you authenticated?");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  if (isLoading) return <div className="p-24 text-center">Loading dashboard...</div>;

  if (error || !stats) {
    return (
      <div className="p-24 text-center">
        <div className="text-red-500 bg-red-50 p-6 rounded-lg inline-block">{error || "Failed to load"}</div>
        <div className="mt-4"><Button onClick={handleLogout}>Back to Login</Button></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      {/* Admin header */}
      <header className="bg-white dark:bg-zinc-950 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Overview
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" /> View Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">System Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Products"
            value={stats.total_products}
            icon={Package}
            description="Active products in database"
          />
          <StatCard
            title="Categories"
            value={stats.total_categories}
            icon={FolderTree}
          />
          <StatCard
            title="Attributes"
            value={stats.total_attributes}
            icon={Settings2}
            description="Global specification metrics"
          />
          <StatCard
            title="System Status"
            value="Healthy"
            icon={BarChart3}
            description="API latency < 100ms"
          />
        </div>

        {/* Management Quick Links */}
        <h2 className="text-xl font-semibold mb-4">Management</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {[
            { href: "/admin/categories",     icon: FolderTree, label: "Categories",      desc: "Manage product categories" },
            { href: "/admin/products",        icon: Package,    label: "Products",         desc: "Manage product listings" },
            { href: "/admin/attributes",      icon: Settings2,  label: "Attributes",       desc: "Manage EAV attributes" },
            { href: "/admin/ads",             icon: Megaphone,  label: "Ad Banners",       desc: "Manage advertisement banners" },
            { href: "/admin/affiliate-links", icon: Link2,      label: "Affiliate Links",  desc: "Manage buy links by store" },
            { href: "/admin/product-images",  icon: ImageIcon,  label: "Product Images",   desc: "Upload & manage images" },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <Card className="bg-white dark:bg-zinc-950 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-zinc-500">{item.desc}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Latest Products Table */}
        <Card className="bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>Recently Added Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Price (Min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.latest_products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                        <div className="relative w-10 h-10 bg-zinc-100 rounded mix-blend-multiply dark:mix-blend-normal p-1">
                            {product.thumbnail ? (
                                <Image src={product.thumbnail} alt={product.name} fill className="object-contain p-1" />
                            ) : null}
                        </div>
                    </TableCell>
                    <TableCell className="font-medium">
                        <Link href={`/product/${product.slug}`} className="hover:underline">{product.name}</Link>
                    </TableCell>
                    <TableCell>
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 flex w-max rounded-md text-xs font-medium">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </TableCell>
                    <TableCell>{product.brand || "-"}</TableCell>
                    <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                      {product.price_min ? `Rp ${product.price_min.toLocaleString('id-ID')}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {stats.latest_products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
