import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { packages } from "@/components/Home/constants/data";

interface PackageCardProps {
  plan: {
    title: string;
    price: string;
    duration: string;
    keywords: string;
    features: string[];
    guarantee: string;
    recommended?: boolean;
  };
  recommended?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({
  plan,
  recommended = false,
}) => (
  <Card
    sx={{
      height: "100%",
      border: recommended ? "2px solid" : "1px solid #E2E8F0",
      borderColor: recommended ? "secondary.main" : "#E2E8F0",
      position: "relative",
    }}
  >
    {recommended && (
      <Chip
        label="แนะนำ"
        color="secondary"
        sx={{ position: "absolute", top: 16, right: 16, fontWeight: "bold" }}
      />
    )}
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h3" color="info.main" gutterBottom>
        {plan.title}
      </Typography>
      <Typography variant="h2" component="p" sx={{ mb: 1 }}>
        ฿{plan.price}{" "}
        <Typography variant="body1" component="span">
          / เดือน
        </Typography>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {plan.duration} | {plan.keywords}
      </Typography>
      <Button
        variant="contained"
        color={recommended ? "secondary" : "info"}
        size="large"
        fullWidth
      >
        เลือกแพ็คเกจนี้
      </Button>
      <List sx={{ mt: 3 }}>
        {plan.features.map((feature, index) => (
          <ListItem key={index} disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleIcon color="secondary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" color="secondary.main" fontWeight="bold">
          {plan.guarantee}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const PackagesSection: React.FC = () => {
  return (
    <Box
      component="section"
      id="packages"
      sx={{ py: 10, bgcolor: "background.paper" }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          sx={{ textAlign: "center", mb: 1 }}
        >
          แพ็คเกจ BASIC
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: "center", mb: 8, maxWidth: "600px", mx: "auto" }}
        >
          เหมาะสำหรับธุรกิจที่ต้องการเจาะจงเว็บไซต์ที่เป็นเป้าหมายเพื่อแข่งขันอย่างเจาะจง
        </Typography>
        <Grid container spacing={4}>
          {packages.basic.map((plan, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <PackageCard plan={plan} recommended={plan.recommended} />
            </Grid>
          ))}
        </Grid>

        <Typography
          variant="h2"
          component="h2"
          sx={{ textAlign: "center", mt: 12, mb: 1 }}
        >
          แพ็คเกจ BUSINESS PRO
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: "center", mb: 8, maxWidth: "600px", mx: "auto" }}
        >
          เหมาะกับธุรกิจที่ต้องการความหลากหลาย ต้องการการขยายการเข้าถึง
          หรือต้องการวางรากฐานการตลาดระยะยาว
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {packages.business.map((plan, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <PackageCard plan={plan} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
