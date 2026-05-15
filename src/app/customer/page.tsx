import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Headset, TrendingUp } from "lucide-react";
import { requireCustomer } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import PromotionSection from "./PromotionSection";

export const metadata: Metadata = {
  title: "Dashboard | SEO Report",
};

type Accent = "info" | "secondary";

const accentStyle: Record<
  Accent,
  { iconBg: string; iconText: string; caption: string; hoverBorder: string }
> = {
  info: {
    iconBg: "bg-info",
    iconText: "text-info-foreground",
    caption: "text-info",
    hoverBorder: "hover:border-info",
  },
  secondary: {
    iconBg: "bg-secondary",
    iconText: "text-secondary-foreground",
    caption: "text-success",
    hoverBorder: "hover:border-secondary",
  },
};

interface QuickActionCardProps {
  href?: string;
  accent: Accent;
  icon: React.ReactNode;
  title: string;
  caption: string;
  description: string;
}

function QuickActionCard({
  href,
  accent,
  icon,
  title,
  caption,
  description,
}: QuickActionCardProps) {
  const a = accentStyle[accent];
  const card = (
    <Card
      className={cn(
        "h-full rounded-2xl border-2 transition-all hover:-translate-y-1 hover:shadow-lg",
        a.hoverBorder,
      )}
    >
      <CardContent className="p-6 md:p-7">
        <div className="mb-3 flex items-center gap-3">
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-xl shadow-md",
              a.iconBg,
              a.iconText,
            )}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold md:text-xl">{title}</h3>
            <p
              className={cn(
                "text-xs font-bold tracking-wide uppercase",
                a.caption,
              )}
            >
              {caption} {href && "→"}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} aria-label={title} className="block no-underline">
        {card}
      </Link>
    );
  }
  return card;
}

export default async function CustomerDashboard() {
  const session = await requireCustomer();

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
        {/* Hero */}
        <section className="mb-8 rounded-2xl bg-gradient-to-br from-info to-info/80 p-6 text-info-foreground md:p-10">
          <h1 className="mb-1 text-3xl font-extrabold md:text-4xl">
            ยินดีต้อนรับ
          </h1>
          <p className="mb-2 text-xl font-semibold opacity-95 md:text-2xl">
            {session.user.name}
          </p>
          <p className="max-w-xl text-base opacity-90">
            ดูรายงาน SEO ติดตามประสิทธิภาพเว็บไซต์ และรับโปรโมชันพิเศษได้ที่นี่
          </p>
        </section>

        <PromotionSection />

        <section className="mt-10">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="size-7 text-info" />
            <h2 className="text-2xl font-bold md:text-3xl">เมนูด่วน</h2>
          </div>
          <p className="mb-5 text-base text-muted-foreground">
            เข้าถึงฟีเจอร์สำคัญได้อย่างรวดเร็ว
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <QuickActionCard
              href="/customer/report"
              accent="info"
              icon={<BarChart3 className="size-8" />}
              title="รายงาน SEO"
              caption="ดูเลย"
              description="ติดตาม Keyword, Domain Rating และข้อมูลเชิงลึกที่ช่วยพัฒนาเว็บไซต์"
            />
            <QuickActionCard
              accent="secondary"
              icon={<Headset className="size-8" />}
              title="ติดต่อเจ้าหน้าที่"
              caption="พร้อมช่วยเหลือ 24/7"
              description="ปรึกษา SEO จากทีมผู้เชี่ยวชาญ พร้อมให้บริการตลอด 24 ชั่วโมง"
            />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
