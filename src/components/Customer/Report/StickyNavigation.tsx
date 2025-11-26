// src/components/Customer/Report/StickyNavigation.tsx
import React from "react";
import { Box, Button, Paper } from "@mui/material";
import { Assessment, List, Lightbulb, MoreHoriz } from "@mui/icons-material";

interface StickyNavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: <Assessment /> },
  { id: "top-keywords", label: "Top Keywords", icon: <List /> },
  { id: "recommendations", label: "Recommendations", icon: <Lightbulb /> },
  { id: "other-keywords", label: "Other Keywords", icon: <MoreHoriz /> },
];

export const StickyNavigation: React.FC<StickyNavigationProps> = ({
  activeSection,
  onNavigate,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        position: "sticky",
        top: 80,
        zIndex: 100,
        mb: 4,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          p: 1.5,
          bgcolor: "background.paper",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: 3,
          },
        }}
      >
        {navItems.map((item) => (
          <Button
            key={item.id}
            startIcon={item.icon}
            onClick={() => onNavigate(item.id)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap",
              bgcolor: activeSection === item.id ? "#9592ff" : "transparent",
              color: activeSection === item.id ? "#FFFFFF" : "text.secondary",
              "&:hover": {
                bgcolor: activeSection === item.id ? "#837fe8" : "action.hover",
              },
              transition: "all 0.2s ease",
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};
