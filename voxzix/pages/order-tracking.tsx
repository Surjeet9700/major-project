'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  Phone,
  Camera,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  orderType: string;
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  items: {
    serviceName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'completed';
  notes?: string;
  statusHistory: {
    status: string;
    timestamp: string;
    notes?: string;
  }[];
}

const statusConfig = {
  pending: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock,
    message: 'Order received and being processed'
  },
  processing: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Package,
    message: 'Work in progress'
  },
  ready: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle,
    message: 'Ready for pickup/delivery'
  },
  delivered: { 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    icon: CheckCircle,
    message: 'Order completed successfully'
  },
  cancelled: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle,
    message: 'Order has been cancelled'
  }
};

export default function OrderTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'orderNumber' | 'phone'>('orderNumber');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const trackOrder = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      let response;
      if (searchType === 'orderNumber') {
        response = await fetch(`${API_URL}/api/order/${searchTerm}`);
      } else {
        response = await fetch(`${API_URL}/api/orders/${searchTerm}`);
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (searchType === 'phone' && result.data.length > 0) {
            setRecentOrders(result.data);
            setOrder(result.data[0]);
          } else if (searchType === 'orderNumber') {
            setOrder(result.data);
            setRecentOrders([]);
          }
        } else {
          setError('Order not found');
        }
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error tracking order:', err);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      trackOrder();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config?.icon || AlertCircle;
    return <IconComponent className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config?.color || 'bg-gray-100 text-gray-800'} border`}>
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Tracking</h1>
          <p className="text-muted-foreground">Track your photography orders and appointments</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Track Your Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Button
                  variant={searchType === 'orderNumber' ? 'default' : 'outline'}
                  onClick={() => setSearchType('orderNumber')}
                  className="flex-1"
                >
                  Order Number
                </Button>
                <Button
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  onClick={() => setSearchType('phone')}
                  className="flex-1"
                >
                  Phone Number
                </Button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    searchType === 'orderNumber' 
                      ? 'Enter order number (e.g., ORD001)' 
                      : 'Enter phone number'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={trackOrder} disabled={loading}>
                  {loading ? 'Searching...' : 'Track Order'}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {recentOrders.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentOrders.map((recentOrder) => (
                  <div
                    key={recentOrder.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      order?.id === recentOrder.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setOrder(recentOrder)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{recentOrder.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{recentOrder.orderType}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(recentOrder.status)}
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(recentOrder.orderDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Placed on {formatDate(order.orderDate)}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Order Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{order.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{order.orderType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-semibold">₹{order.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment:</span>
                        <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      {order.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated Delivery:</span>
                          <span>{formatDate(order.estimatedDelivery)}</span>
                        </div>
                      )}
                      {order.actualDelivery && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivered:</span>
                          <span>{formatDate(order.actualDelivery)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        {statusConfig[order.status]?.message || 'Status update'}
                      </p>
                    </div>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="border rounded-lg divide-y">
                      {order.items.map((item, index) => (
                        <div key={index} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.serviceName}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Special Notes</h3>
                    <p className="text-muted-foreground bg-muted p-3 rounded-lg">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.statusHistory.map((history, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {getStatusIcon(history.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(history.timestamp)}
                          </p>
                          {history.notes && (
                            <p className="text-sm mt-1">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground mb-4">
                    Contact our team for any questions about your order
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Call Support
                    </Button>
                    <Button variant="outline">
                      WhatsApp Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!order && !loading && searchTerm && !error && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">
                Try searching with a different order number or phone number
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
