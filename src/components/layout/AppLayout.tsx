import React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Users, Activity, BarChart3, Home, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b p-4 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center">
              <SidebarTrigger>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              <h1 className="text-xl font-semibold ml-2 text-bpms-700">
                Blood Pressure Monitoring System
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground mr-2">
                    Hello, {user.name}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const AppSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-bpms-600" />
          <span className="font-bold text-xl text-bpms-800">BP Monitor</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-1 px-2">
          <Link to="/dashboard">
            <Button 
              variant={isActive("/dashboard") ? "default" : "ghost"} 
              className="w-full justify-start" 
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/records">
            <Button 
              variant={isActive("/records") ? "default" : "ghost"} 
              className="w-full justify-start" 
              size="sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              BP Records
            </Button>
          </Link>
          <Link to="/family">
            <Button 
              variant={isActive("/family") ? "default" : "ghost"} 
              className="w-full justify-start" 
              size="sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Family Members
            </Button>
          </Link>
          <Link to="/reports">
            <Button 
              variant={isActive("/reports") ? "default" : "ghost"} 
              className="w-full justify-start" 
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Link to="/profile">
            <Button 
              variant={isActive("/profile") ? "default" : "ghost"} 
              className="w-full justify-start" 
              size="sm"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center">
          © 2023 BP Monitor v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
