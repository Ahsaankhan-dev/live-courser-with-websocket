'use client';

import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

export function LayoutWrapper({ children }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
    </AuthProvider>
  );
}
