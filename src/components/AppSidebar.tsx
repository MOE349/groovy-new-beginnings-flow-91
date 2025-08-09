import {
  LayoutDashboard,
  Truck,
  FileText,
  Settings,
  Wrench,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Assets", url: "/asset", icon: Truck },
  { title: "Work Orders", url: "/workorders", icon: Wrench },
  { title: "Parts", url: "/parts", icon: Package },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Analytics/Reports", url: "/analytics", icon: BarChart3 },
  { title: "Users", url: "/users", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    // Auto-collapse below the FHD width using icon variant; expand at fhd+
    <Sidebar
      collapsible="icon"
      className="data-[state=expanded]:fhd:[&]:data-[state=expanded]"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-2xl font-bold text-white">
            Tenmil
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4 space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
