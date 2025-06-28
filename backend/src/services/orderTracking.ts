import { OrderTrackingRequest } from '../types';
import { Order as OrderModel, IOrder } from '../models/Order';

class OrderTrackingService {
  async trackOrder(request: OrderTrackingRequest): Promise<IOrder | null> {
    const order = await OrderModel.findOne({ 
      orderNumber: request.orderNumber, 
      customerPhone: request.phoneNumber 
    }).lean();

    return order || null;
  }

  async getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
    return await OrderModel.findOne({ orderNumber }).lean();
  }

  async getOrdersByPhone(phoneNumber: string): Promise<IOrder[]> {
    return await OrderModel.find({ customerPhone: phoneNumber }).lean();
  }

  async updateOrderStatus(orderNumber: string, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<boolean> {
    try {
      const order = await OrderModel.findOne({ orderNumber });
      if (order) {
        order.status = status;
        await order.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  formatOrderStatus(order: IOrder, language: 'hi' | 'en'): string {
    const statusMessages: Record<'hi' | 'en', Record<IOrder['status'], string>> = {
      hi: {
        pending: 'आपका ऑर्डर प्राप्त हुआ है और प्रोसेसिंग के लिए तैयार है',
        processing: 'आपका ऑर्डर तैयार किया जा रहा है',
        shipped: 'आपका ऑर्डर भेजा गया है',
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
  }): Promise<any> {
    const order = new OrderModel({
      customerPhone: orderData.customerPhone,
      customerName: orderData.customerName,
      orderType: 'Regular',
      items: orderData.items.map(item => ({ serviceName: item, quantity: 1, price: 0 })),
      status: 'pending',
      orderDate: new Date(),
      estimatedDelivery: this.calculateEstimatedDelivery(),
      deliveryAddress: orderData.deliveryAddress,
      totalAmount: orderData.totalAmount,
      paymentStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          notes: 'Order received and awaiting confirmation'
        }
      ]
    });

    await order.save();
    return order;
  }

  private calculateEstimatedDelivery(): Date {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 3); // 3 days from now
    return delivery;
  }

  // Helper method for voice interactions
  getOrderSummary(order: IOrder, language: 'hi' | 'en'): string {
    const itemsList = order.items.map((item: any) => `${item.name || item.serviceName} (x${item.quantity})`).join(', ');
    const orderDate = new Date(order.orderDate).toLocaleDateString();
    
    if (language === 'hi') {
      return `ऑर्डर नंबर ${order.orderNumber}, ${orderDate} को प्लेस किया गया। सेवाएं: ${itemsList}। कुल राशि: ₹${order.totalAmount}`;
    } else {
      return `Order ${order.orderNumber} placed on ${orderDate}. Services: ${itemsList}. Total amount: ₹${order.totalAmount}`;
    }
  }
}

export const orderTrackingService = new OrderTrackingService();
