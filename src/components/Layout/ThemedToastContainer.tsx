"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ToastContainer, type Theme } from "react-toastify";

export const ThemedToastContainer = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const theme: Theme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
};
