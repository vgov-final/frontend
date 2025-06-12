
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Folder,
  Settings,
  Key,
  LogOut,
  Clock,
  TrendingUp,
  Bell
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import UserProfileModal from './UserProfileModal';

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const isCollapsed = state === 'collapsed';
  const [userProfileOpen, setUserProfileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin'] as UserRole[] },
    { name: 'Dự án của tôi', href: '/', icon: Folder, roles: ['dev', 'ba', 'test'] as UserRole[] },
    { name: 'Work Logs', href: '/work-logs', icon: Clock, roles: ['admin', 'pm', 'dev', 'ba', 'test'] as UserRole[] },
    { name: 'Thông báo', href: '/notifications', icon: Bell, roles: ['admin', 'pm', 'dev', 'ba', 'test'] as UserRole[] },
    { name: 'Dự án', href: '/projects', icon: Folder, roles: ['pm', 'admin'] as UserRole[] },
    { name: 'Quản lý người dùng', href: '/users', icon: Users, roles: ['admin', 'pm'] as UserRole[] },
    { name: 'Quản lý khối lượng công việc', href: '/workload', icon: TrendingUp, roles: ['admin'] as UserRole[] },
    { name: 'Cài đặt', href: '/settings', icon: Settings, roles: ['admin'] as UserRole[] },
  ];

  const filteredNavigation = navigation.filter(item =>
    user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <Sidebar className="border-r bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="V-GOV Logo" className="w-10 h-10" />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-xl font-bold text-sidebar-foreground">V-GOV</h1>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2">
            {!isCollapsed ? 'Menu chính' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`
                        transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                        ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : ''}
                      `}
                    >
                      <NavLink to={item.href}>
                        <Icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-4">
          <div
            className="flex items-center border-t border-sidebar-border pt-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setUserProfileOpen(true)}
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-sidebar-accent-foreground" />
              </div>
            </div>
            {!isCollapsed && user && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-sidebar-foreground">{user.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}
          </div>

          <UserProfileModal open={userProfileOpen} onOpenChange={setUserProfileOpen} />

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
