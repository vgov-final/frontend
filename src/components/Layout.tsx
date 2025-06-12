
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './notifications/NotificationCenter';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-semibold text-foreground">
                {['dev', 'ba', 'test', 'pm'].includes(user?.role || '') ? 'Không gian làm việc' : 'Dashboard Quản lý'}
              </h1>
              <div className="flex items-center gap-2">
                <NotificationCenter />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
