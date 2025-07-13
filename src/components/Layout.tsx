import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const getPageTitle = () => {
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      return 'Dashboard';
    }
    if (location.pathname.startsWith('/asset')) {
      return 'Assets';
    }
    if (location.pathname.startsWith('/workorders')) {
      return 'Work Orders';
    }
    if (location.pathname.startsWith('/parts')) {
      return 'Parts';
    }
    if (location.pathname.startsWith('/purchase-orders')) {
      return 'Purchase Orders';
    }
    if (location.pathname.startsWith('/billing')) {
      return 'Billing';
    }
    if (location.pathname.startsWith('/analytics')) {
      return 'Analytics/Reports';
    }
    if (location.pathname.startsWith('/users')) {
      return 'Users';
    }
    if (location.pathname.startsWith('/settings')) {
      return 'Settings';
    }
    return 'Tenmil';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full min-w-[1440px] overflow-x-auto">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b bg-primary text-primary-foreground px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="text-sm font-medium text-primary-foreground hover:bg-secondary hover:text-secondary-foreground h-8 px-3">
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
          
          <main className="flex-1 p-1">
            {children}
          </main>
          
          <footer className="h-10 flex items-center justify-between border-t bg-primary text-primary-foreground px-4">
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}