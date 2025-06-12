
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Folder,
  Settings,
  Key
} from 'lucide-react';

interface SidebarProps {
  userRole: 'employee' | 'pm' | 'admin';
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['employee', 'admin'] },
    { name: 'Dự án', href: '/projects', icon: Folder, roles: ['pm', 'admin'] },
    { name: 'Nhân sự', href: '/employees', icon: Users, roles: ['pm', 'admin'] },
    { name: 'PM Tools', href: '/pm-tools', icon: Key, roles: ['admin'] },
    { name: 'Cài đặt', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-gradient-to-b from-blue-900 to-blue-800 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-white">V-GOV</h1>
            </div>
          </div>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-blue-200 capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
