"use client";

import { Button } from "@/components/ui/button";

const scrollToPackages = () => {
  document
    .querySelector("#packages")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const HeroSection = () => {
  return (
    <section
      className="py-20 text-center md:py-28"
      style={{
        backgroundImage:
          "radial-gradient(circle, color-mix(in srgb, var(--info) 10%, transparent), var(--background) 70%)",
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-4">
        <h1 className="mb-6 bg-gradient-to-r from-info to-secondary bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl lg:text-6xl">
          ขับเคลื่อนธุรกิจของคุณสู่หน้าแรก ด้วยแพ็คเกจ SEO ที่คุ้มค่าที่สุด
        </h1>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          เรามีแพ็คเกจที่หลากหลาย ตอบโจทย์ทุกขนาดธุรกิจ
          พร้อมทีมงานมืออาชีพที่จะพาเว็บไซต์ของคุณติดอันดับและเติบโตอย่างยั่งยืน
        </p>
        <Button
          size="lg"
          onClick={scrollToPackages}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          ดูแพ็คเกจของเรา
        </Button>
      </div>
    </section>
  );
};
