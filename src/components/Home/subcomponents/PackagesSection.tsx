import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { packages } from "@/components/Home/constants/data";

interface Plan {
  title: string;
  price: string;
  duration: string;
  keywords: string;
  features: string[];
  guarantee: string;
  recommended?: boolean;
}

const PackageCard = ({ plan }: { plan: Plan }) => {
  const recommended = !!plan.recommended;

  return (
    <Card
      className={cn(
        "relative h-full",
        recommended ? "border-2 border-secondary" : "border-border",
      )}
    >
      {recommended && (
        <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
          แนะนำ
        </Badge>
      )}
      <CardContent className="p-6">
        <h3 className="mb-2 text-xl font-semibold text-info md:text-2xl">
          {plan.title}
        </h3>
        <p className="mb-1 text-3xl font-bold md:text-4xl">
          ฿{plan.price}
          <span className="ml-1 text-base font-normal">/ เดือน</span>
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          {plan.duration} | {plan.keywords}
        </p>
        <Button
          size="lg"
          className={cn(
            "w-full",
            recommended
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
              : "bg-info text-info-foreground hover:bg-info/90",
          )}
        >
          เลือกแพ็คเกจนี้
        </Button>
        <ul className="mt-5 space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg bg-card p-3 text-center">
          <p className="font-bold text-secondary">{plan.guarantee}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <>
    <h2 className="mt-12 mb-1 text-center text-3xl font-bold md:text-4xl">
      {title}
    </h2>
    <p className="mx-auto mb-10 max-w-xl text-center text-lg text-muted-foreground">
      {subtitle}
    </p>
  </>
);

export const PackagesSection = () => {
  return (
    <section id="packages" className="bg-card py-16">
      <div className="mx-auto w-full max-w-5xl px-4">
        <SectionHeading
          title="แพ็คเกจ BASIC"
          subtitle="เหมาะสำหรับธุรกิจที่ต้องการเจาะจงเว็บไซต์ที่เป็นเป้าหมายเพื่อแข่งขันอย่างเจาะจง"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {packages.basic.map((plan) => (
            <PackageCard key={plan.title} plan={plan} />
          ))}
        </div>

        <SectionHeading
          title="แพ็คเกจ BUSINESS PRO"
          subtitle="เหมาะกับธุรกิจที่ต้องการความหลากหลาย ต้องการการขยายการเข้าถึง หรือต้องการวางรากฐานการตลาดระยะยาว"
        />
        <div className="grid justify-center gap-6 md:grid-cols-2">
          {packages.business.map((plan) => (
            <PackageCard key={plan.title} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};
