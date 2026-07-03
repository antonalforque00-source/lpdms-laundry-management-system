import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Order, InventoryItem } from '../types';
import { mockUsers, mockOrders, mockInventory } from '../mockData';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (user: Omit<User, 'id'>, password?: string) => Promise<void>;
  logout: () => void;
  users: User[];
  orders: Order[];
  inventory: InventoryItem[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignRider: (orderId: string, riderId: string) => void;
  createOrder: (order: Partial<Order>) => void;
  updateInventory: (id: string, qty: number) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);

  const isSupabaseEnabled = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here';

  // Fetch initial data
  const fetchData = async () => {
    if (!isSupabaseEnabled) return;
    
    try {
      const { supabase } = await import('../lib/supabase');
      
      const [usersRes, ordersRes, inventoryRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('inventory').select('*')
      ]);

      if (usersRes.data) {
        setUsers(usersRes.data as User[]);
      }
      
      if (ordersRes.data) {
        // Map from snake_case to camelCase
        const mappedOrders = ordersRes.data.map(o => ({
          ...o,
          customerId: o.customer_id,
          customerName: o.customer_name,
          riderId: o.rider_id,
          staffId: o.staff_id,
          totalCost: o.total_cost,
          paymentMethod: o.payment_method,
          isPaid: o.is_paid,
          pickupTime: o.pickup_time,
          deliveryTimeForecast: o.delivery_time_forecast,
          pickupAddress: o.pickup_address,
          deliveryAddress: o.delivery_address,
          qrCode: o.qr_code,
          createdAt: o.created_at,
          updatedAt: o.updated_at
        })) as Order[];
        setOrders(mappedOrders);
      }
      
      if (inventoryRes.data) {
        const mappedInventory = inventoryRes.data.map(i => ({
          ...i,
          lowStockThreshold: i.low_stock_threshold
        })) as InventoryItem[];
        setInventory(mappedInventory);
      }
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    }
  };

  useEffect(() => {
    if (isSupabaseEnabled) {
      import('../lib/supabase').then(({ supabase }) => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            supabase.from('users').select('*').eq('id', session.user.id).single()
              .then(({ data }) => {
                if (data) setCurrentUser(data as User);
              });
          }
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
             supabase.from('users').select('*').eq('id', session.user.id).single()
               .then(({ data }) => {
                 if (data) setCurrentUser(data as User);
               });
          } else {
             setCurrentUser(null);
          }
        });
      }).catch(console.error);

      fetchData();
    }
  }, []);

  const login = async (email: string, password?: string) => {
    if (isSupabaseEnabled) {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password: password || 'password123' 
        });
        if (error) throw new Error(error.message);
        
        if (data.user) {
          const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
          if (profile) {
            if (profile.status === 'pending') {
              await supabase.auth.signOut();
              throw new Error('Your account is pending admin approval.');
            }
            if (profile.status === 'rejected') {
              await supabase.auth.signOut();
              throw new Error('Your account registration was rejected.');
            }
            setCurrentUser(profile as User);
            await fetchData();
            return;
          }
        }
      } catch (err: any) {
        throw new Error(err.message || 'Login failed');
      }
    }
    
    // Fallback to mock data if Supabase isn't configured
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.status === 'pending') throw new Error('Your account is pending admin approval.');
      if (user.status === 'rejected') throw new Error('Your account registration was rejected.');
      setCurrentUser(user);
    } else {
      throw new Error('User not found in mock data. Try customer@test.com, rider@test.com, staff@test.com, admin@test.com');
    }
  };

  const logout = async () => {
    if (isSupabaseEnabled) {
      try {
        const { supabase } = await import('../lib/supabase');
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setCurrentUser(null);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updatedAt = new Date().toISOString();
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt } : o));
    
    if (isSupabaseEnabled) {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('orders').update({ 
        status, 
        updated_at: updatedAt 
      }).eq('id', orderId);
    }
  };

  const assignRider = async (orderId: string, riderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newStatus = o.status === 'Pending' ? 'Rider Assigned for Pickup' : 'Rider Assigned for Delivery';
      const updatedAt = new Date().toISOString();
      
      if (isSupabaseEnabled) {
        import('../lib/supabase').then(({ supabase }) => {
          supabase.from('orders').update({ 
            rider_id: riderId, 
            status: newStatus,
            updated_at: updatedAt
          }).eq('id', orderId);
        });
      }
      
      return { ...o, riderId, status: newStatus, updatedAt };
    }));
  };

  const createOrder = async (order: Partial<Order>) => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      qrCode: `QR-${Math.floor(Math.random() * 100000)}`,
      ...order
    } as Order;
    
    if (isSupabaseEnabled && currentUser) {
      const { supabase } = await import('../lib/supabase');
      
      const orderData = {
        customer_id: currentUser.id,
        customer_name: order.customerName,
        status: newOrder.status,
        services: order.services,
        items: order.items || [],
        instructions: order.instructions,
        weight: order.weight,
        total_cost: order.totalCost,
        payment_method: order.paymentMethod,
        is_paid: order.isPaid,
        pickup_time: order.pickupTime,
        pickup_address: order.pickupAddress,
        delivery_address: order.deliveryAddress,
        qr_code: newOrder.qrCode,
      };
      
      const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
      if (!error && data) {
        newOrder.id = data.id;
        newOrder.createdAt = data.created_at;
        newOrder.updatedAt = data.updated_at;
      } else {
        console.error('Error creating order in Supabase:', error);
      }
    }
    
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateInventory = async (id: string, qty: number) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    
    if (isSupabaseEnabled) {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('inventory').update({ 
        quantity: qty,
        last_updated: new Date().toISOString()
      }).eq('id', id);
    }
  };

  const updateUserStatus = async (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    if (isSupabaseEnabled) {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('users').update({ status }).eq('id', userId);
    }
  };

  const register = async (user: Omit<User, 'id'>, password?: string) => {
    if (isSupabaseEnabled) {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: password || 'password123'
        });
        if (error) throw new Error(error.message);
        
        if (data.user) {
          const newUser = {
            id: data.user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: 'pending' as User['status'],
            points: 0
          };
          
          const { error: profileError } = await supabase.from('users').insert([newUser]);
          if (profileError) throw new Error(profileError.message);
          
          await supabase.auth.signOut(); // Sign out since they are pending
          return;
        }
      } catch (err: any) {
        throw new Error(err.message || 'Registration failed');
      }
    }
    
    // Fallback to mock data
    const newUser: User = {
      ...user,
      id: `u${Math.floor(Math.random() * 10000)}`,
      status: 'pending',
      points: 0
    };
    setUsers(prev => [...prev, newUser]);
    return;
  };

  return (
    <AppContext.Provider value={{ currentUser, login, register, logout, users, orders, inventory, updateOrderStatus, assignRider, createOrder, updateInventory, updateUserStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
