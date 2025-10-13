"use client";

import React from "react";
import { ThemeProvider, Box } from "@mui/material";
import { theme } from "@/theme/theme";
import { useMobileDrawer } from "@/components/Home/hooks/useMobileDrawer";
import { Header } from "@/components/Home/subcomponents/Header";
import { HeroSection } from "@/components/Home/subcomponents/HeroSection";
import { PackagesSection } from "@/components/Home/subcomponents/PackagesSection"; // ** Import ใหม่ **
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
          <PackagesSection /> {/* ** เพิ่ม Section ใหม่ที่นี่ ** */}
          <FAQSection />
          {/* คุณสามารถนำ Section อื่นๆ กลับมาได้ถ้าต้องการ
            แต่การตัดออกจะทำให้หน้าเว็บโฟกัสที่การขายแพ็คเกจมากขึ้น 
          */}
        </main>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
