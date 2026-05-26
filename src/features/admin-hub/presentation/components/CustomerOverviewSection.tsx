"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerHubCard } from "../../domain/AdminHubSummary";
import { CustomerSummaryCard } from "./CustomerSummaryCard";

interface CustomerOverviewSectionProps {
  customers: CustomerHubCard[] | undefined;
  isLoading: boolean;
}

export function CustomerOverviewSection({
  customers,
  isLoading,
}: CustomerOverviewSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">ลูกค้าทั้งหมด</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          ลูกค้าทั้งหมด
          {customers && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({customers.length})
            </span>
          )}
        </h2>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href="/admin/users">
            ดูทั้งหมด
            <ArrowRight className="ml-1 size-3" />
          </Link>
        </Button>
      </div>

      {customers && customers.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {customers.map((c) => (
            <CustomerSummaryCard key={c.id} customer={c} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          ยังไม่มีข้อมูลลูกค้า
        </p>
      )}
    </div>
  );
}
