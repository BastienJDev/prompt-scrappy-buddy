import { Upload, MessageSquare } from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
  { title: "Import", url: "/", icon: Upload },
  { title: "Prompt", url: "/prompt", icon: MessageSquare },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border/30">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            {open && (
              <span className="text-lg font-bold text-white drop-shadow-lg">
                ScrapReform
              </span>
            )}
          </div>
        </div>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-white/70 text-xs uppercase tracking-wider">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-white/10 text-white/90 hover:text-white transition-all rounded-lg"
                      activeClassName="bg-white/20 text-white font-semibold shadow-lg"
                    >
                      <item.icon className="w-5 h-5" />
                      {open && <span>{item.title}</span>}
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
