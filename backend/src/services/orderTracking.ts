import { OrderTrackingRequest } from '../types';

interface Order {
  orderNumber: string;
  customerPhone: string;
  customerName: string;
  items: string[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  estimatedDelivery: Date;
  trackingNumber?: string;
  deliveryAddress: string;
  totalAmount: number;
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
        shipped: 'आपका ऑर्डर भेज दिया गया है',
        delivered: 'आपका ऑर्डर डिलीवर हो गया है',
        cancelled: 'आपका ऑर्डर रद्द कर दिया गया है'
      },
      en: {
        pending: 'Your order has been received and is ready for processing',
        processing: 'Your order is being prepared',
        shipped: 'Your order has been shipped',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
      }
    };

    const statusText = statusMessages[language][order.status];
    const estimatedDelivery = order.estimatedDelivery.toLocaleDateString();

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
      orderNumber: this.generateOrderNumber(),
      customerPhone: orderData.customerPhone,
      customerName: orderData.customerName,
      items: orderData.items,
      status: 'pending',
      orderDate: new Date(),
      estimatedDelivery: this.calculateEstimatedDelivery(),
      deliveryAddress: orderData.deliveryAddress,
      totalAmount: orderData.totalAmount
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
        orderNumber: 'ORD123456',
        customerPhone: '+919876543210',
        customerName: 'Test Customer',
        items: ['Product A', 'Product B'],
        status: 'shipped',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        trackingNumber: 'TRK789012',
        deliveryAddress: 'Test Address, City, State',
        totalAmount: 1999
      },
      {
        orderNumber: 'ORD789012',
        customerPhone: '+919876543211',
        customerName: 'Another Customer',
        items: ['Service Package'],
        status: 'processing',
        orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
        deliveryAddress: 'Another Address, City, State',
        totalAmount: 2999
      }
    ];

    this.orders.push(...sampleOrders);
  }

  // Helper method for voice interactions
  getOrderSummary(order: Order, language: 'hi' | 'en'): string {
    const itemsList = order.items.join(', ');
    const orderDate = order.orderDate.toLocaleDateString();
    
    if (language === 'hi') {
      return `ऑर्डर नंबर ${order.orderNumber}, ${orderDate} को प्लेस किया गया। आइटम: ${itemsList}। कुल राशि: ₹${order.totalAmount}`;
    } else {
      return `Order ${order.orderNumber} placed on ${orderDate}. Items: ${itemsList}. Total amount: ₹${order.totalAmount}`;
    }
  }
}

export const orderTrackingService = new OrderTrackingService();
