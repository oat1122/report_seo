// src/components/shared/DashboardPageLayout.tsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import Link from "next/link";

interface DashboardCard {
  title: string;
  description: string;
  href: string;
  color: "primary" | "secondary" | "info" | "success" | "warning" | "error";
}

interface DashboardPageLayoutProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  title: string;
  cards: DashboardCard[];
}

export const DashboardPageLayout: React.FC<DashboardPageLayoutProps> = ({
  user,
  title,
  cards,
}) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          {title}
        </Typography>

        <Box
          sx={{
            bgcolor: "info.50",
            p: 2,
            borderRadius: 2,
            mb: 4,
            border: "1px solid",
            borderColor: "info.200",
          }}
        >
          <Typography color="info.dark">
            ยินดีต้อนรับ,{" "}
            <Typography component="span" fontWeight="bold">
              {user.name}
            </Typography>
            !
          </Typography>
          <Typography variant="body2" color="info.dark">
            บทบาท: {user.role} | อีเมล: {user.email}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid size={{ xs: 12, md: 4 }} key={card.href}>
              <Link
                href={card.href}
                passHref
                style={{ textDecoration: "none" }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: `${card.color}.200`,
                    bgcolor: `${card.color}.50`,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 3,
                      borderColor: `${card.color}.main`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      component="h3"
                      color={`${card.color}.dark`}
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {card.title}
                    </Typography>
                    <Typography color={`${card.color}.dark`}>
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};
