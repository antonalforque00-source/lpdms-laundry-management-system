export type Role = 'customer' | 'rider' | 'staff' | 'admin';

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: UserStatus;
  points?: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Pickup Scheduled'
  | 'Rider Assigned for Pickup'
  | 'Picked Up'
  | 'Arrived at Facility'
  | 'Washing'
  | 'Drying'
  | 'Folding'
  | 'Quality Inspection'
  | 'Ready for Delivery'
  | 'Rider Assigned for Delivery'
  | 'Out for Delivery'
  | 'Delivered';

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupTime: string;
  deliveryTimeForecast?: string;
  services: string[];
  items?: OrderItem[];
  instructions?: string;
  status: OrderStatus;
  totalCost: number;
  paymentMethod: 'COD' | 'GCash' | 'Maya' | 'Credit/Debit';
  isPaid: boolean;
  qrCode: string;
  riderId?: string;
  staffId?: string;
  weight?: number; // in kg
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
}
