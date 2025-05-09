import * as React from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function Calendars({
  calendars,
}: {
  calendars: {
    name: string
    items: string[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Calendars</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {calendars.map((calendar) => (
            <React.Fragment key={calendar.name}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="font-medium">{calendar.name}</div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {calendar.items.map((item) => (
                <SidebarMenuItem key={item}>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <span className="ml-2">{item}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </React.Fragment>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
