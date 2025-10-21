"use client";

import React from "react";
import { ThemeProvider, Box } from "@mui/material";
import { theme } from "@/theme/theme";
import { useMobileDrawer } from "@/components/Home/hooks/useMobileDrawer";
import { Header } from "@/components/Home/subcomponents/Header";
import { HeroSection } from "@/components/Home/subcomponents/HeroSection";
import { PackagesSection } from "@/components/Home/subcomponents/PackagesSection";
import { FAQSection } from "@/components/Home/subcomponents/FAQSection";
import { Footer } from "@/components/Home/subcomponents/Footer";
// import { ServicesSection } from "@/components/Home/subcomponents/ServicesSection";
// import { CTASection } from "@/components/Home/subcomponents/CTASection";
// import { StatsSection } from "@/components/Home/subcomponents/StatsSection";

const HomePage: React.FC = () => {
  const { mobileOpen, handleDrawerToggle, handleDrawerClose } =
    useMobileDrawer();

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ backgroundColor: "background.default", color: "text.primary" }}
      >
        <Header
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
          onDrawerClose={handleDrawerClose}
        />

        <main>
          <HeroSection />
          <PackagesSection />
          <FAQSection />
        </main>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
