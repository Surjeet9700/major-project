import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  customerPhone: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  estimatedDelivery: {
    type: Date,
    required: true
  },
  actualDelivery: {
    type: Date
  },
  trackingNumber: {
    type: String,
    sparse: true,
    index: true
  },
  deliveryAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'orders'
});

// Indexes for efficient queries
orderSchema.index({ customerPhone: 1, status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1, estimatedDelivery: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
