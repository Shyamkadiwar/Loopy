"use client";
import "../globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <SessionProvider>
          <SidebarProvider>
            {/* <AppSidebar /> */}
            <main>
              {/* <SidebarTrigger /> */}
              {children}
            </main>
          </SidebarProvider>
          <Toaster />
        </SessionProvider>
  );
}