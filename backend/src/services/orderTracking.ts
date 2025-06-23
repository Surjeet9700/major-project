import { OrderTrackingRequest } from '../types';

interface Order {
  id: string;
  orderNumber: string;
  customerPhone: string;
  customerName: string;
  orderType: string;
  items: {
    serviceName: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingNumber?: string;
  deliveryAddress?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'completed';
  notes?: string;
  statusHistory: {
    status: string;
    timestamp: string;
    notes?: string;
  }[];
}

class OrderTrackingService {
  private orders: Order[] = [];

  constructor() {
    // Initialize with some sample orders for testing
    this.initializeSampleOrders();
  }

  async trackOrder(request: OrderTrackingRequest): Promise<Order | null> {
    const order = this.orders.find(order => 
      order.orderNumber === request.orderNumber &&
      order.customerPhone === request.phoneNumber
    );

    return order || null;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.orders.find(order => order.orderNumber === orderNumber) || null;
  }

  async getOrdersByPhone(phoneNumber: string): Promise<Order[]> {
    return this.orders.filter(order => order.customerPhone === phoneNumber);
  }

  async updateOrderStatus(orderNumber: string, status: Order['status']): Promise<boolean> {
    const order = this.orders.find(o => o.orderNumber === orderNumber);
    if (order) {
      order.status = status;
      return true;
    }
    return false;
  }
  formatOrderStatus(order: Order, language: 'hi' | 'en'): string {
    const statusMessages = {
      hi: {
        pending: 'आपका ऑर्डर प्राप्त हुआ है और प्रोसेसिंग के लिए तैयार है',
        processing: 'आपका ऑर्डर तैयार किया जा रहा है',
        ready: 'आपका ऑर्डर तैयार है और पिकअप के लिए उपलब्ध है',
        delivered: 'आपका ऑर्डर डिलीवर हो गया है',
        cancelled: 'आपका ऑर्डर रद्द कर दिया गया है'
      },
      en: {
        pending: 'Your order has been received and is ready for processing',
        processing: 'Your order is being prepared',
        ready: 'Your order is ready for pickup',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
      }
    };

    const statusText = statusMessages[language][order.status];
    const estimatedDelivery = order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Not specified';

    if (language === 'hi') {
      return `ऑर्डर नंबर ${order.orderNumber}: ${statusText}। अनुमानित डिलीवरी: ${estimatedDelivery}`;
    } else {
      return `Order ${order.orderNumber}: ${statusText}. Estimated delivery: ${estimatedDelivery}`;
    }
  }

  extractOrderNumber(text: string): string | null {
    // Look for patterns like: ORD123456, ORDER123456, or just 6+ digits
    const patterns = [
      /\b(ORD|ORDER)\s*(\d{4,})\b/i,
      /\b\d{6,}\b/,
      /\b[A-Z]{2,}\d{4,}\b/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].replace(/\s+/g, '').toUpperCase();
      }
    }

    return null;
  }
  validateOrderNumber(orderNumber: string): boolean {
    // Basic validation - should be at least 4 characters
    return Boolean(orderNumber && orderNumber.length >= 4);
  }

  getOrderStatusSteps(language: 'hi' | 'en'): string[] {
    if (language === 'hi') {
      return [
        'ऑर्डर प्राप्त',
        'प्रोसेसिंग',
        'तैयार',
        'भेजा गया',
        'डिलीवर'
      ];
    } else {
      return [
        'Order Received',
        'Processing',
        'Ready',
        'Shipped',
        'Delivered'
      ];
    }
  }

  async createOrder(orderData: {
    customerPhone: string;
    customerName: string;
    items: string[];
    deliveryAddress: string;
    totalAmount: number;
  }): Promise<Order> {
    const order: Order = {
      id: this.generateOrderNumber(),
      orderNumber: this.generateOrderNumber(),
      customerPhone: orderData.customerPhone,
      customerName: orderData.customerName,
      orderType: 'Regular',
      items: orderData.items.map(item => ({ serviceName: item, quantity: 1, price: 0 })),
      status: 'pending',
      orderDate: new Date().toISOString(),
      estimatedDelivery: this.calculateEstimatedDelivery().toISOString(),
      deliveryAddress: orderData.deliveryAddress,
      totalAmount: orderData.totalAmount,
      paymentStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          notes: 'Order received and awaiting confirmation'
        }
      ]
    };

    this.orders.push(order);
    return order;
  }

  private generateOrderNumber(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp.slice(-6)}${random}`;
  }

  private calculateEstimatedDelivery(): Date {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 3); // 3 days from now
    return delivery;
  }

  private initializeSampleOrders(): void {
    const sampleOrders: Order[] = [
      {
        id: 'ORD001',
        orderNumber: 'ORD001',
        customerPhone: '+919876543210',
        customerName: 'Rahul Sharma',
        orderType: 'Wedding Photography',
        items: [
          { serviceName: 'Wedding Photography Package', quantity: 1, price: 25000 },
          { serviceName: 'Album Printing', quantity: 1, price: 5000 }
        ],
        status: 'processing',
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 30000,
        paymentStatus: 'partial',
        notes: 'Wedding scheduled for next month',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Order received and confirmed'
          },
          {
            status: 'processing',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Photography session completed, editing in progress'
          }
        ]
      },
      {
        id: 'ORD002',
        orderNumber: 'ORD002',
        customerPhone: '+919876543211',
        customerName: 'Priya Patel',
        orderType: 'Portrait Session',
        items: [
          { serviceName: 'Portrait Photography', quantity: 1, price: 8000 },
          { serviceName: 'Digital Photos', quantity: 20, price: 2000 }
        ],
        status: 'ready',
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 10000,
        paymentStatus: 'completed',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Order placed and payment received'
          },
          {
            status: 'processing',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Photo session scheduled'
          },
          {
            status: 'ready',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Photos edited and ready for pickup'
          }
        ]
      },
      {
        id: 'ORD003',
        orderNumber: 'ORD003',
        customerPhone: '+919876543212',
        customerName: 'Amit Kumar',
        orderType: 'Product Photography',
        items: [
          { serviceName: 'Product Shoot', quantity: 50, price: 15000 }
        ],
        status: 'delivered',
        orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        actualDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 15000,
        paymentStatus: 'completed',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Order confirmed'
          },
          {
            status: 'processing',
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Product photography session completed'
          },
          {
            status: 'ready',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'All photos edited and ready'
          },
          {
            status: 'delivered',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Photos delivered via email and cloud link'
          }
        ]
      }
    ];

    this.orders.push(...sampleOrders);
  }

  // Helper method for voice interactions
  getOrderSummary(order: Order, language: 'hi' | 'en'): string {
    const itemsList = order.items.map(item => `${item.serviceName} (x${item.quantity})`).join(', ');
    const orderDate = new Date(order.orderDate).toLocaleDateString();
    
    if (language === 'hi') {
      return `ऑर्डर नंबर ${order.orderNumber}, ${orderDate} को प्लेस किया गया। सेवाएं: ${itemsList}। कुल राशि: ₹${order.totalAmount}`;
    } else {
      return `Order ${order.orderNumber} placed on ${orderDate}. Services: ${itemsList}. Total amount: ₹${order.totalAmount}`;
    }
  }
}

export const orderTrackingService = new OrderTrackingService();
