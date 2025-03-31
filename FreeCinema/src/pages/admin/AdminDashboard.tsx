
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Film, 
  Settings, 
  Radio, 
  Users, 
  Monitor, 
  BarChart, 
  TrendingUp, 
  Tv 
} from 'lucide-react';

const AdminDashboard = () => {
  const { settings } = useAdmin();
  
  const quickLinks = [
    { name: 'Homepage', icon: <Home className="h-5 w-5" />, path: '/' },
    { name: 'Live TV', icon: <Radio className="h-5 w-5" />, path: '/live-tv' },
    { name: 'Movies', icon: <Film className="h-5 w-5" />, path: '/movies' },
    { name: 'TV Shows', icon: <Tv className="h-5 w-5" />, path: '/tv' },
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/admin/settings' },
  ];
  
  const stats = [
    { name: 'Active Features', value: '8', icon: <Monitor className="h-8 w-8 text-sky-400" /> },
    { name: 'Live TV Channels', value: settings.enableLiveTV ? 'Enabled' : 'Disabled', icon: <Radio className="h-8 w-8 text-pink-400" /> },
    { name: '3D Effects', value: settings.enable3DEffects ? 'Enabled' : 'Disabled', icon: <TrendingUp className="h-8 w-8 text-purple-400" /> },
    { name: 'Auto Play', value: settings.enableAutoPlay ? 'Enabled' : 'Disabled', icon: <Film className="h-8 w-8 text-green-400" /> },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="mb-6 text-3xl font-bold text-white">Admin Dashboard</h1>
        
        <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-moviemate-card/60 backdrop-blur-sm">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="rounded-full bg-moviemate-background p-3">{stat.icon}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Site Information</CardTitle>
              <CardDescription>Details about your FreeCinema installation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Site Name</p>
                <p className="text-lg font-semibold text-white">{settings.siteName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Description</p>
                <p className="text-white">{settings.siteDescription}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Primary Color</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-6 w-6 rounded-full" 
                    style={{ backgroundColor: settings.primaryColor }} 
                  ></div>
                  <span className="text-white">{settings.primaryColor}</span>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/admin/settings">
                  <Button variant="outline" size="sm">Edit Settings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Quick Links</CardTitle>
              <CardDescription>Quickly navigate to important pages</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickLinks.map((link, i) => (
                <Link key={i} to={link.path}>
                  <Button 
                    variant="outline" 
                    className="h-auto w-full flex-col gap-2 p-4 text-white hover:bg-moviemate-primary/10 hover:text-moviemate-primary"
                  >
                    <div className="rounded-full bg-moviemate-background p-2">
                      {link.icon}
                    </div>
                    <span>{link.name}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Admin Actions</CardTitle>
              <CardDescription>Manage your FreeCinema site</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link to="/admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Site Settings
                </Button>
              </Link>
              <Link to="/admin/live-tv">
                <Button variant="outline" className="w-full justify-start">
                  <Radio className="mr-2 h-4 w-4" />
                  Manage Live TV
                </Button>
              </Link>
              <Link to="/admin/content">
                <Button variant="outline" className="w-full justify-start">
                  <Film className="mr-2 h-4 w-4" />
                  Manage Content
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
