import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 1920px)");
    const apply = () => setSidebarOpen(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-h-svh min-w-0">
          <header className="h-8 flex items-center justify-between border-b bg-primary text-primary-foreground px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold">Admin</h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-sm font-medium text-primary-foreground hover:bg-secondary hover:text-secondary-foreground h-8 px-3"
                    >
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-popover" align="end">
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-hidden min-w-0 p-1">{children}</main>

          <footer className="h-8 flex items-center justify-between border-t bg-primary text-primary-foreground px-4"></footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
