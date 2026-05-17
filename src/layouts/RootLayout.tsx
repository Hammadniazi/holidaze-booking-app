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
      {/* Skip link — first focusable element for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-(--radius) focus:bg-(--color-primary) focus:px-4 focus:py-2 focus:text-(--color-primary-foreground) focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <Toaster richColors />
    </div>
  );
}
