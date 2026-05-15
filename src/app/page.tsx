"use client";

import { Header } from "@/components/Home/subcomponents/Header";
import { HeroSection } from "@/components/Home/subcomponents/HeroSection";
import { PackagesSection } from "@/components/Home/subcomponents/PackagesSection";
import { FAQSection } from "@/components/Home/subcomponents/FAQSection";
import { Footer } from "@/components/Home/subcomponents/Footer";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <PackagesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
