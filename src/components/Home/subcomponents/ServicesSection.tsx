import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { services } from "@/components/Home/constants/data";

export const ServicesSection = () => {
  return (
    <section className="bg-card py-12">
      <div className="mx-auto w-full max-w-5xl px-4 text-center">
        <h2 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          บริการ SEO ของเรา
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          เราทำอะไรบ้างเพื่อขับเคลื่อนธุรกิจของคุณสู่หน้าแรก
        </p>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="h-full p-6 text-center">
              <CardContent className="flex flex-col items-center gap-3 p-0">
                <Image
                  src={service.icon}
                  alt={`${service.title} icon`}
                  width={80}
                  height={80}
                />
                <h3 className="text-lg font-semibold text-primary md:text-xl">
                  {service.title}
                </h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
