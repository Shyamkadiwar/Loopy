// app/home/layout.tsx
"use client";

import "../globals.css";
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex">
        {/* <AppSidebar /> */}
        <main className="">{children}</main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}