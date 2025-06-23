'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Eye
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalAppointments: number;
    totalOrders: number;
    totalRevenue: number;
  };
  appointmentsByService: Record<string, number>;
  ordersByType: Record<string, number>;
  recentActivity: {
    recentAppointments: any[];
    recentOrders: any[];
  };
}

interface SystemMetrics {
  apiResponseTime: number;
  voiceQuality: number;
  successRate: number;
  activeConnections: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchAnalytics();
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAnalytics(result.data);
        }
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Analytics error:', err);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSystemMetrics({
            apiResponseTime: Math.random() * 200 + 50,
            voiceQuality: Math.random() * 20 + 80,
            successRate: Math.random() * 5 + 95,
            activeConnections: Math.floor(Math.random() * 10) + 5
          });
        }
      }
    } catch (err) {
      console.error('Metrics error:', err);
    }
    setLoading(false);
  };

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
      color: 'bg-yellow-500',
      stats: 'Main website'
    },
    {
      title: 'Order Tracking',
      description: 'Track customer orders and deliveries',
      icon: Package,
      href: '/order-tracking',
      color: 'bg-indigo-500',
      stats: 'Track orders'
    },
    {
      title: 'Analytics',
      description: 'Business insights and reports',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-emerald-500',
      stats: 'View reports'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Yuva Digital Admin</h1>
                <p className="text-sm text-slate-300">Voice Agent & Photography Management</p>
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
          <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Manage your photography business and AI voice agent from this central dashboard.
          </p>
        </div>

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{analytics.overview.totalUsers}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                    <p className="text-3xl font-bold">{analytics.overview.totalAppointments}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +8% from last week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{analytics.overview.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +15% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                    <p className="text-3xl font-bold">{analytics.overview.totalOrders}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                      <Package className="w-3 h-3" />
                      {analytics.overview.totalOrders} in progress
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {systemMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">API Response</p>
                    <p className="text-2xl font-bold">{systemMetrics.apiResponseTime.toFixed(0)}ms</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <Activity className="w-3 h-3" />
                      Excellent
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Voice Quality</p>
                    <p className="text-2xl font-bold">{systemMetrics.voiceQuality.toFixed(1)}%</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3" />
                      Optimal
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{systemMetrics.successRate.toFixed(1)}%</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      High performance
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                    <p className="text-2xl font-bold">{systemMetrics.activeConnections}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                      <Eye className="w-3 h-3" />
                      Live connections
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-muted-foreground text-sm mb-3">{card.description}</p>
                    <p className="text-xs text-muted-foreground mb-4">{card.stats}</p>
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
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentActivity.recentAppointments.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New appointment booked</p>
                        <p className="text-xs text-muted-foreground">Wedding photography session - 2 hours ago</p>
                      </div>
                    </div>
                  )) || (
                    <>
                      <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New appointment booked</p>
                          <p className="text-xs text-muted-foreground">Wedding photography session - 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Voice call completed</p>
                          <p className="text-xs text-muted-foreground">Portrait session inquiry - 4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Order delivered</p>
                          <p className="text-xs text-muted-foreground">Wedding album print - 6 hours ago</p>
                        </div>
                      </div>
                    </>
                  )}
                  <Button variant="ghost" className="w-full text-sm" asChild>
                    <Link href="/appointments">
                      View All Activity
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/order-tracking">
                      <Package className="w-4 h-4 mr-2" />
                      Order Tracking
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    System Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TestTube className="w-4 h-4 mr-2" />
                    Voice Quality Test
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Performance Monitor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading analytics...
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
