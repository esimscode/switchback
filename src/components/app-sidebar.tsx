"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  BookOpen,
  Briefcase,
  Compass,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  Radar,
  Settings,
  UserRound,
} from "lucide-react";
import { UserButton } from "@neondatabase/auth-ui";

import { SwitchbackMark } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Strategist Chat", href: "/chat", icon: MessageSquare },
      { title: "Reminders", href: "/reminders", icon: BellRing },
    ],
  },
  {
    label: "Job Search",
    items: [
      { title: "Job Leads", href: "/leads", icon: Radar },
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
  // On mobile the sidebar is a sheet overlay; navigating should dismiss it.
  const { setOpenMobile } = useSidebar();
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/dashboard"
          onClick={closeMobile}
          className="flex items-center gap-2 px-2 py-1.5"
        >
          <SwitchbackMark className="size-5 shrink-0" strokeWidth={13} />
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            switchback
          </span>
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
                      <Link href={item.href} onClick={closeMobile}>
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
          <SidebarMenuItem className="flex items-center gap-1 group-data-[collapsible=icon]:justify-center">
            {/* Icon mode gets an avatar-only trigger; the full trigger's
                name + chevron don't fit the rail. */}
            <UserButton
              size="icon"
              variant="ghost"
              className="hidden size-8 group-data-[collapsible=icon]:flex"
            />
            <UserButton
              size="default"
              variant="ghost"
              className="h-10 min-w-0 flex-1 justify-start px-2 group-data-[collapsible=icon]:hidden"
            />
            <ModeToggle className="group-data-[collapsible=icon]:hidden" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
