import React from "react";
import Image from "next/image";
import { Box } from "@mui/material";

export const HeroSection: React.FC = () => {
  return (
    <Box component="section">
      <Image
        src="https://placehold.jp/1200x400.png"
        alt="รับทำ SEO Banner"
        width={1200}
        height={400}
        style={{ width: "100%", height: "auto", objectFit: "cover" }}
        priority
      />
    </Box>
  );
};