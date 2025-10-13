import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { navItems } from "@/components/Home/constants/data";

interface HeaderProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  onDrawerClose: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mobileOpen,
  onDrawerToggle,
  onDrawerClose,
}) => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };
  const drawer = (
    <Box onClick={onDrawerClose} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        SEO PRIME
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="info"
          fullWidth
          sx={{ color: "white" }}
          onClick={handleLoginClick}
        >
          เข้าสู่ระบบ
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        component="nav"
        position="sticky"
        sx={{
          bgcolor: "background.default",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
              sx={{ mr: 2, display: { lg: "none" }, color: "primary.main" }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <Image
                src="https://placehold.jp/150x48.png"
                alt="SEO PRIME Logo"
                width={150}
                height={48}
                style={{ marginRight: "16px" }}
              />
            </Box>
            <Button
              variant="contained"
              color="info"
              sx={{
                color: "white",
                display: { xs: "none", lg: "block" },
              }}
              onClick={handleLoginClick}
            >
              เข้าสู่ระบบ
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};
