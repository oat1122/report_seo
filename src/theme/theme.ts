import { createTheme } from "@mui/material/styles";

// New theme based on the provided image palette
export const theme = createTheme({
  palette: {
    primary: {
      main: "#2f2f2f", // Dark Grey
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#31fb4c", // Bright Teal/Green
      contrastText: "#2f2f2f",
    },
    info: {
      main: "#9592ff", // Purple
    },
    background: {
      default: "#FFFFFF", // White
      paper: "#F8F9FA", // Off-white
    },
    text: {
      primary: "#2f2f2f",
      secondary: "#64748B", // A softer grey for secondary text
    },
  },
  typography: {
    fontFamily: '"Kanit", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "3.5rem",
      lineHeight: 1.2,
      color: "#2f2f2f",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      color: "#2f2f2f",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
      color: "#2f2f2f",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "9999px", // Pill-shaped buttons
          textTransform: "none",
          fontWeight: 600,
          padding: "12px 28px",
          boxShadow: "none",
        },
        containedSecondary: {
          "&:hover": {
            backgroundColor: "#29e0a0",
          },
        },
        containedInfo: {
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#837fe8",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #E2E8F0",
        },
      },
    },
  },
});
