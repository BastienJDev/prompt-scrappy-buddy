import { Upload, MessageSquare, Newspaper, Sparkles, Trophy, ChevronDown } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const items = [
  { title: "Accueil", url: "/prompt", icon: MessageSquare },
];

const actualitesItems = [
  { title: "Actualités générales", url: "/actualites/generales", icon: Sparkles },
  { title: "Actualités sportives", url: "/actualites/sportives", icon: Trophy },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border/30">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
              <span className="text-xl font-bold text-white">E</span>
            </div>
            {open && (
              <span className="text-lg font-bold text-white drop-shadow-lg">
                Enzo P.
              </span>
            )}
          </div>
        </div>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-white/70 text-sm uppercase tracking-wider font-medium">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-white/10 text-white/90 hover:text-white transition-all rounded-lg text-base py-3"
                      activeClassName="bg-white/20 text-white font-semibold shadow-lg"
                    >
                      <item.icon className="w-6 h-6" />
                      {open && <span className="text-base">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <Collapsible asChild defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-white/10 text-white/90 hover:text-white transition-all rounded-lg text-base py-3">
                      <Newspaper className="w-6 h-6" />
                      {open && <span className="text-base">Actualités</span>}
                      {open && <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {actualitesItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              to={subItem.url}
                              className="hover:bg-white/10 text-white/80 hover:text-white transition-all rounded-lg"
                              activeClassName="bg-white/20 text-white font-semibold"
                            >
                              <subItem.icon className="w-4 h-4" />
                              {open && <span>{subItem.title}</span>}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    end
                    className="hover:bg-white/10 text-white/90 hover:text-white transition-all rounded-lg text-base py-3"
                    activeClassName="bg-white/20 text-white font-semibold shadow-lg"
                  >
                    <Upload className="w-6 h-6" />
                    {open && <span className="text-base">Gestion des sites</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
