"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  className?: string;
}

export default function LoginForm({ className = "" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-background-light border border-gray-200 rounded-lg shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-dark mb-2">
            เข้าสู่ระบบ
          </h1>
          <p className="text-gray-600">
            กรุณาใส่อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-dark mb-1"
            >
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple outline-none transition-colors"
              placeholder="example@domain.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-dark mb-1"
            >
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple outline-none transition-colors"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-purple hover:bg-accent-purple-dark text-text-light font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>ยังไม่มีบัญชี? กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    </div>
  );
}
