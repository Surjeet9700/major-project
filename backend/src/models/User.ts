export interface User {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  preferences: {
    language: 'hi' | 'en' | 'te';
    communicationChannel: 'voice' | 'sms' | 'email';
    reminderSettings: boolean;
  };
  history: {
    appointments: string[];
    orders: string[];
    totalSpent: number;
    lastInteraction: Date;
    frequentServices: string[];
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    source: 'voice' | 'web' | 'referral';
    notes?: string;
  };
}

export interface EnhancedAppointment {
  id: string;
  userId: string;
  serviceId: string;
  packageId?: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    alternatePhone?: string;
  };
  appointmentDetails: {
    date: string;
    time: string;
    duration: number;
    location: 'studio' | 'outdoor' | 'venue';
    venueAddress?: string;
  };
  serviceDetails: {
    serviceName: string;
    packageName?: string;
    price: number;
    currency: string;
    specialRequirements?: string[];
    additionalServices?: string[];
  };
  paymentInfo: {
    totalAmount: number;
    advancePaid: number;
    pendingAmount: number;
    paymentMethod?: string;
    paymentStatus: 'pending' | 'partial' | 'completed';
  };
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'rescheduled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderType: 'printing' | 'frames' | 'album' | 'canvas' | 'digital';
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  delivery: {
    method: 'pickup' | 'home_delivery' | 'courier';
    address?: string;
    expectedDate: Date;
    actualDate?: Date;
    charges: number;
  };
  payment: {
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    paidAmount: number;
  };
  status: 'placed' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  type: 'photo_print' | 'frame' | 'canvas' | 'album' | 'digital_copy';
  specifications: {
    size?: string;
    quantity: number;
    material?: string;
    finish?: string;
    customization?: string;
  };
  images?: string[];
  price: number;
  notes?: string;
}

export class UserManager {
  static generateUserId(name: string, phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const hash = cleanName + '_' + cleanPhone.slice(-4);
    return `user_${hash}_${Date.now().toString(36)}`;
  }

  static createUser(name: string, phone: string, additionalInfo?: Partial<User>): User {
    const userId = this.generateUserId(name, phone);
    
    return {
      userId,
      name,
      phone,
      email: additionalInfo?.email,
      address: additionalInfo?.address,
      preferences: {
        language: additionalInfo?.preferences?.language || 'hi',
        communicationChannel: additionalInfo?.preferences?.communicationChannel || 'voice',
        reminderSettings: additionalInfo?.preferences?.reminderSettings || true
      },
      history: {
        appointments: [],
        orders: [],
        totalSpent: 0,
        lastInteraction: new Date(),
        frequentServices: []
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: additionalInfo?.metadata?.source || 'voice',
        notes: additionalInfo?.metadata?.notes
      }
    };
  }

  static findUserByNameAndPhone(users: User[], name: string, phone: string): User | null {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanName = name.toLowerCase().trim();
    
    return users.find(user => {
      const userPhone = user.phone.replace(/\D/g, '');
      const userName = user.name.toLowerCase().trim();
      
      return userName === cleanName || 
             userPhone === cleanPhone ||
             userName.includes(cleanName) ||
             cleanName.includes(userName);
    }) || null;
  }

  static updateUserHistory(user: User, appointmentId?: string, orderId?: string, amountSpent?: number): User {
    const updatedUser = { ...user };
    
    if (appointmentId) {
      updatedUser.history.appointments.push(appointmentId);
    }
    
    if (orderId) {
      updatedUser.history.orders.push(orderId);
    }
    
    if (amountSpent) {
      updatedUser.history.totalSpent += amountSpent;
    }
    
    updatedUser.history.lastInteraction = new Date();
    updatedUser.metadata.updatedAt = new Date();
    
    return updatedUser;
  }

  static getUserSummary(user: User): string {
    const { name, history, preferences } = user;
    const totalAppointments = history.appointments.length;
    const totalOrders = history.orders.length;
    const totalSpent = history.totalSpent;
    
    return `Customer: ${name}
Previous appointments: ${totalAppointments}
Previous orders: ${totalOrders}  
Total amount spent: ₹${totalSpent}
Preferred language: ${preferences.language}
Last interaction: ${history.lastInteraction.toLocaleDateString()}`;
  }
}

export default UserManager;
