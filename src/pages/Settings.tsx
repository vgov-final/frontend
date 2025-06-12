import React, { useState } from 'react';
import { Settings as SettingsIcon, Users, Key, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'Viettel Inc.',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    emailNotifications: true,
    projectNotifications: true,
    reportFrequency: 'weekly',
    autoBackup: true,
    dataRetention: '12',
  });

  const [originalSettings, setOriginalSettings] = useState(settings);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-05-31 14:30',
    },
    {
      id: 2,
      name: 'Project Manager',
      email: 'pm@company.com',
      role: 'pm',
      status: 'active',
      lastLogin: '2024-05-31 13:45',
    },
    {
      id: 3,
      name: 'Employee User',
      email: 'employee@company.com',
      role: 'employee',
      status: 'active',
      lastLogin: '2024-05-31 12:20',
    },
  ]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    setOriginalSettings(settings);
  };

  const handleDiscardSettings = () => {
    setSettings(originalSettings);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'pm': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'pm': return 'Project Manager';
      case 'employee': return 'Nhân viên';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={handleDiscardSettings}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-2" />
          Hủy thay đổi
        </Button>
        <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
          <Check className="w-4 h-4 mr-2" />
          Lưu cài đặt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Cài đặt chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên công ty</label>
              <Input
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Múi giờ</label>
              <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                  <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                  <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ngôn ngữ</label>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thời gian lưu trữ dữ liệu (tháng)</label>
              <Input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt thông báo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Thông báo email</label>
                <p className="text-xs text-gray-500">Nhận thông báo qua email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Thông báo dự án</label>
                <p className="text-xs text-gray-500">Cập nhật tiến độ dự án</p>
              </div>
              <Switch
                checked={settings.projectNotifications}
                onCheckedChange={(checked) => handleSettingChange('projectNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Tự động sao lưu</label>
                <p className="text-xs text-gray-500">Sao lưu dữ liệu định kỳ</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tần suất báo cáo</label>
              <Select value={settings.reportFrequency} onValueChange={(value) => handleSettingChange('reportFrequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hàng ngày</SelectItem>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Quản lý người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">Đăng nhập cuối: {user.lastLogin}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                  <Button variant="outline" size="sm">
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800">Yêu cầu xác thực 2 bước</h4>
              <p className="text-sm text-yellow-600 mt-1">
                Khuyến nghị bật xác thực 2 bước cho tất cả tài khoản admin
              </p>
              <Button size="sm" className="mt-2" variant="outline">
                Cấu hình
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Đổi mật khẩu định kỳ</h4>
              <p className="text-sm text-blue-600 mt-1">
                Yêu cầu người dùng đổi mật khẩu mỗi 90 ngày
              </p>
              <Button size="sm" className="mt-2" variant="outline">
                Bật chính sách
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;