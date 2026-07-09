"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  Compass,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  Settings,
  UserRound,
} from "lucide-react";
import { UserButton } from "@neondatabase/auth-ui";

import { SwitchbackLogo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Strategist Chat", href: "/chat", icon: MessageSquare },
    ],
  },
  {
    label: "Job Search",
    items: [
      { title: "Job Analysis", href: "/jobs", icon: Compass },
      { title: "Applications", href: "/applications", icon: Briefcase },
    ],
  },
  {
    label: "Career Assets",
    items: [
      { title: "Career Profile", href: "/career-profile", icon: UserRound },
      { title: "Resumes", href: "/resumes", icon: FileText },
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Reflections", href: "/reflections", icon: NotebookPen },
      { title: "Memories", href: "/memories", icon: BookOpen },
    ],
  },
  {
    label: "Workspace",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="px-2 py-1.5">
          <SwitchbackLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="eyebrow">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                      }
                      className="data-[active=true]:bg-block-lime data-[active=true]:text-black"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-1">
            <UserButton
              size="default"
              variant="ghost"
              className="h-10 min-w-0 flex-1 justify-start px-2"
            />
            <ModeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
