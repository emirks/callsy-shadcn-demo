"use client"

import * as React from "react"
import {
  IconActivity,
  IconBolt,
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconPhone,
  IconPhoneCall,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: "Berkay Uzuner",
    email: "berkay@callsy.ai",
    avatar: "/placeholder-user.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Accounts",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Triggers",
      url: "#",
      icon: IconBolt,
    },
    {
      title: "Call Logs",
      url: "#",
      icon: IconPhoneCall,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Activity Feed",
      url: "#",
      icon: IconActivity,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Help & Docs",
      url: "#",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <div className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
                  <IconPhone className="size-3.5" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-bold tracking-tight">Callsy</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
