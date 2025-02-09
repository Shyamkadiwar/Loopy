import { Calendar, Home, MessageCircleQuestion, FileText, Search, Users, Bookmark } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Home",
    path: "/home",
    icon: Home,
  },
  {
    title: "Q&A",
    path: "/qa",
    icon: MessageCircleQuestion,
  },
  {
    title: "Posts",
    path: "/posts",
    icon: FileText,
  },
  {
    title: "Articles",
    path: "/articles",
    icon: Search,
  },
  {
    title: "Community",
    path: "/community",
    icon: Users,
  },
  {
    title: "Bookmark",
    path: "/bookmark",
    icon: Bookmark,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="min-h-screen">
      <SidebarContent className="bg-[#0a090f] border-r-[1px] border-[#353539] h-full flex flex-col">
        {/* Logo section */}
        <div className="flex items-center border-[#353539] border-b-[1px]">
          <Image 
            src="/images/logo-bg.png" 
            alt="Loopy Logo" 
            width={80} 
            height={40} 
            className="object-contain pt-[6px]"
          />
          <h1 className="text-xl font-bold text-white tracking-wide">LOOPY</h1>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 flex flex-col ">
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title} className="my-2">
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 px-6 py-3 text-white hover:text-white hover:bg-zinc-800/50 transition-colors"
                >
                  <Link href={item.path} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="text-lg font-semibold">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}