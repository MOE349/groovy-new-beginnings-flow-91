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
    if (location.pathname === '/assets') {
      return 'Assets';
    }
    if (location.pathname === '/settings') {
      return 'Settings';
    }
    if (location.pathname === '/dashboard') {
      return 'Dashboard';
    }
    return 'Tenmil';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-6 flex items-center justify-between border-b bg-primary text-primary-foreground px-3">
            <div className="flex items-center">
              <SidebarTrigger className="mr-3" />
              <h1 className="text-base font-semibold">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="text-xs font-medium text-primary-foreground hover:bg-secondary hover:text-secondary-foreground h-5 px-2">
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
          
          <main className="flex-1 p-0.5">
            {children}
          </main>
          
          <footer className="h-6 flex items-center justify-between border-t bg-primary text-primary-foreground px-3">
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}