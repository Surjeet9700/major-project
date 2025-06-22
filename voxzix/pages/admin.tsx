import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Phone, 
  Download, 
  TestTube, 
  Settings, 
  BarChart3,
  Users,
  Camera,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const dashboardCards = [
    {
      title: 'Appointments',
      description: 'View and manage customer appointments',
      icon: Calendar,
      href: '/appointments',
      color: 'bg-blue-500',
      stats: 'View all bookings'
    },
    {
      title: 'Voice Agent Test',
      description: 'Test AI voice agent functionality',
      icon: TestTube,
      href: `${API_URL}/test-voice.html`,
      color: 'bg-green-500',
      stats: 'Run system tests',
      external: true
    },
    {
      title: 'Call Logs',
      description: 'Monitor voice calls and conversations',
      icon: Phone,
      href: '/appointments?tab=calls',
      color: 'bg-purple-500',
      stats: 'Track call history'
    },
    {
      title: 'Photography Store',
      description: 'Return to main photography website',
      icon: Camera,
      href: '/',
      color: 'bg-pink-500',
      stats: 'Public website'
    }
  ];

  const quickActions = [
    { name: 'Download Appointments', icon: Download, href: `${API_URL}/api/appointments/download` },
    { name: 'Download Call Logs', icon: Download, href: `${API_URL}/api/calls/download` },
    { name: 'System Settings', icon: Settings, href: '#' },
    { name: 'Analytics', icon: BarChart3, href: '#' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Yuva Digital Admin</h1>
                <p className="text-sm text-slate-600">Voice Agent & Photography Management</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              System Online
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
          <p className="text-slate-600">
            Manage your photography business and AI voice agent from this central dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2">{card.title}</CardTitle>
                <p className="text-slate-600 text-sm mb-3">{card.description}</p>
                <p className="text-xs text-slate-500 mb-4">{card.stats}</p>
                {card.external ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button size="sm" className="w-full">
                      Open External
                    </Button>
                  </a>
                ) : (
                  <Link href={card.href}>
                    <Button size="sm" className="w-full">
                      Access
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">New appointment booked</p>
                      <p className="text-xs text-slate-600">Wedding photography session - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Voice call completed</p>
                      <p className="text-xs text-slate-600">Portrait session inquiry - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">System test completed</p>
                      <p className="text-xs text-slate-600">Voice flow test passed - 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href={action.href} target={action.href.startsWith('http') ? '_blank' : undefined}>
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm mt-6">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Voice Agent</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Database</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">File Storage</span>
                    <Badge className="bg-green-100 text-green-800">Ready</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Twilio</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
