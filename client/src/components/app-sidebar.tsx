import { Home, CreditCard, Phone, Settings, AlertOctagon, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Voice Calls",
    url: "/calls",
    icon: Phone,
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
  },
  {
    title: "Agent Config",
    url: "/config",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <AlertOctagon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Agent Pay</h1>
            <p className="text-xs text-muted-foreground">AI Transaction Agent</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(" ", "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="rounded-lg border border-card-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Agent Status</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-glow"></span>
              Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Monitoring transactions</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
