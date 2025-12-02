"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarRail } from "@/components/ui/sidebar";
import { AuthorSidebar } from "@/components/author/AuthorSidebar";
import { AuthorHeader } from "@/components/author/AuthorHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="w-64 border-r bg-card p-4">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
          

          <div className="flex-1 p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full font-sans">
        <AuthorSidebar />
        <div className="flex-1">
          <AuthorHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
        <SidebarRail />
      </div>
    </SidebarProvider>
  );
}