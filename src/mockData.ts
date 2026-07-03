import { User, Order, InventoryItem } from './types';
import { addDays, subDays } from 'date-fns';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Customer', email: 'customer@test.com', role: 'customer', points: 150, status: 'approved' },
  { id: 'u2', name: 'Bob Rider', email: 'rider@test.com', role: 'rider', status: 'approved' },
  { id: 'u3', name: 'Charlie Staff', email: 'staff@test.com', role: 'staff', status: 'approved' },
  { id: 'u4', name: 'Diana Admin', email: 'admin@test.com', role: 'admin', status: 'approved' },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-1001',
    customerId: 'u1',
    customerName: 'Alice Customer',
    pickupAddress: '123 Main St, Apt 4B',
    deliveryAddress: '123 Main St, Apt 4B',
    pickupTime: addDays(new Date(), 1).toISOString(),
    services: ['Wash and Fold'],
    status: 'Pending',
    totalCost: 15.00,
    paymentMethod: 'GCash',
    isPaid: true,
    qrCode: 'QR-1001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD-1002',
    customerId: 'u1',
    customerName: 'Alice Customer',
    pickupAddress: '123 Main St, Apt 4B',
    deliveryAddress: '123 Main St, Apt 4B',
    pickupTime: new Date().toISOString(),
    services: ['Dry Cleaning'],
    status: 'Ready for Delivery',
    totalCost: 45.50,
    paymentMethod: 'COD',
    isPaid: false,
    qrCode: 'QR-1002',
    riderId: 'u2',
    weight: 2.5,
    createdAt: subDays(new Date(), 2).toISOString(),
    updatedAt: new Date().toISOString(),
    deliveryTimeForecast: addDays(new Date(), 0).toISOString(),
  }
];

export const mockInventory: InventoryItem[] = [
  { id: 'inv1', name: 'Premium Detergent', quantity: 50, unit: 'Liters', lowStockThreshold: 10 },
  { id: 'inv2', name: 'Fabric Conditioner', quantity: 8, unit: 'Liters', lowStockThreshold: 15 },
  { id: 'inv3', name: 'Bleach', quantity: 20, unit: 'Liters', lowStockThreshold: 5 },
  { id: 'inv4', name: 'Packaging Bags', quantity: 500, unit: 'Pieces', lowStockThreshold: 100 },
];
