import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useThemeStore } from "@/store/themeStore";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { isDark } = useThemeStore();
  // Sync the dark class on every render — covers first paint before
  // Zustand rehydrates from localStorage.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
  return (
    <div className="flex min-h-screen flex-col bg-(--color-background)">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster richColors />
    </div>
  );
}
