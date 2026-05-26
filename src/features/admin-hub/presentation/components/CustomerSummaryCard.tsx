"use client";

import Link from "next/link";
import { Globe, UserCheck, BarChart3, Briefcase, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CustomerHubCard } from "../../domain/AdminHubSummary";

interface CustomerSummaryCardProps {
  customer: CustomerHubCard;
}

export function CustomerSummaryCard({ customer }: CustomerSummaryCardProps) {
  const { metrics, counts } = customer;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          {customer.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>{customer.domain}</span>
          {customer.seoDevName && (
            <>
              <span className="text-muted-foreground/40">|</span>
              <span className="flex items-center gap-1">
                <UserCheck className="size-3" />
                {customer.seoDevName}
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Metrics row */}
        {metrics ? (
          <div className="grid grid-cols-3 gap-2">
            <MetricBadge label="DR" value={metrics.domainRating} />
            <MetricBadge label="Health" value={metrics.healthScore} />
            <MetricBadge label="Traffic" value={formatNumber(metrics.organicTraffic)} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">ยังไม่มีข้อมูล Metrics</p>
        )}

        {/* Counts */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs font-normal">
            Keywords: {counts.keywords}
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            Recommend: {counts.recommendations}
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            AI Overview: {counts.aiOverviews}
          </Badge>
        </div>

        {/* Work Progress + Payments */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase className="size-3" />
            Plans: {counts.workProgressPlans}
            {customer.workProgressAvgPercent !== null && (
              <span className="text-foreground">
                ({customer.workProgressAvgPercent}%)
              </span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="size-3" />
            Payments: {counts.paymentPlans}
          </span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href={`/admin/users`}>
            <BarChart3 className="mr-1 size-3" />
            Metrics
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href={`/admin/customers/${customer.userId}/work-progress`}>
            <Briefcase className="mr-1 size-3" />
            Work
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href={`/admin/customers/${customer.userId}/payments`}>
            <CreditCard className="mr-1 size-3" />
            Payments
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function MetricBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted/50 px-2 py-1 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
