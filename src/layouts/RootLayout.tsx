import { type ReactNode } from "react";
import { Toaster } from "sonner";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster richColors />
    </div>
  );
}
