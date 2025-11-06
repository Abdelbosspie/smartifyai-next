"use client";

import { Suspense } from "react";
import { getCurrentUser } from "../../lib/session";
import { redirect } from "next/navigation";
import { DashboardShell } from "../../components/DashboardShell";
import { Overview } from "../../components/Overview";
import { RecentOrders } from "../../components/RecentOrders";
import { DashboardHeader } from "../../components/DashboardHeader";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <div className="w-full min-h-screen bg-gray-50 flex flex-col px-6 py-4 space-y-6">
        <DashboardHeader heading="Dashboard" text="Overview of your account" />
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
          <Overview />
        </section>
        <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
          <Suspense
            fallback={
              <Card className="col-span-12 md:col-span-8 space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </Card>
            }
          >
            {/* @ts-expect-error Server Component */}
            <RecentOrders />
          </Suspense>
        </div>
      </div>
    </DashboardShell>
  );
}