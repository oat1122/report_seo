"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../../theme/theme";

interface LoginFormProps {
  className?: string;
}

export default function LoginForm({ className = "" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        // Get session to determine user role for redirection
        const session = await getSession();
        if (session?.user?.role) {
          // Redirect based on role
          switch (session.user.role) {
            case "ADMIN":
              router.push("/admin/dashboard");
              break;
            case "SEO_DEV":
              router.push("/seo/dashboard");
              break;
            case "CUSTOMER":
              router.push("/customer/dashboard");
              break;
            default:
              router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" className={className}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 400,
              p: 0,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  เข้าสู่ระบบ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กรุณาใส่อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="อีเมล"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="example@domain.com"
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="รหัสผ่าน"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="info"
                  disabled={isLoading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    height: 48,
                    position: "relative",
                  }}
                >
                  {isLoading && (
                    <CircularProgress
                      size={20}
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        marginLeft: "-10px",
                        marginTop: "-10px",
                      }}
                    />
                  )}
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    ยังไม่มีบัญชี? กรุณาติดต่อผู้ดูแลระบบ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
