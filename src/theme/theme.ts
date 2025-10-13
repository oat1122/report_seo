import { createTheme } from "@mui/material/styles";

// Custom theme based on design system colors
export const theme = createTheme({
  palette: {
    primary: {
      main: "#1A284D", // from --primary
      contrastText: "#FFFFFF", // from --primary-foreground
    },
    secondary: {
      main: "#00F0B5", // from --secondary
      contrastText: "#0D1117", // from --secondary-foreground
    },
    info: {
      main: "#00A3FF", // from --primary-accent
    },
    background: {
      default: "#FFFFFF", // from --background
      paper: "#F7FAFC", // from --background-muted
    },
    text: {
      primary: "#1A202C", // from --foreground
      secondary: "#718096", // from --muted-foreground
    },
  },
  typography: {
    fontFamily: '"Kanit", sans-serif',
    h2: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
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
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          },
        },
      },
    },
  },
});
