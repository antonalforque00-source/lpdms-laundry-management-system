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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);

  useEffect(() => {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here') {
      import('../lib/supabase').then(({ supabase }) => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            supabase.from('profiles').select('*').eq('id', session.user.id).single()
              .then(({ data }) => {
                if (data) setCurrentUser(data as User);
              });
          }
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
             supabase.from('profiles').select('*').eq('id', session.user.id).single()
               .then(({ data }) => {
                 if (data) setCurrentUser(data as User);
               });
          } else {
             setCurrentUser(null);
          }
        });
      }).catch(console.error);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here') {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password: password || 'password123' 
        });
        if (error) throw new Error(error.message);
        
        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          if (profile) {
            setCurrentUser(profile as User);
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
      setCurrentUser(user);
    } else {
      throw new Error('User not found in mock data. Try customer@test.com, rider@test.com, staff@test.com, admin@test.com');
    }
  };

  const logout = async () => {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here') {
      try {
        const { supabase } = await import('../lib/supabase');
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setCurrentUser(null);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
  };

  const assignRider = (orderId: string, riderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, riderId, status: o.status === 'Pending' ? 'Rider Assigned for Pickup' : 'Rider Assigned for Delivery' } : o));
  };

  const createOrder = (order: Partial<Order>) => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      qrCode: `QR-${Math.floor(Math.random() * 100000)}`,
      ...order
    } as Order;
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateInventory = (id: string, qty: number) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const register = async (user: Omit<User, 'id'>, password?: string) => {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here') {
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
            points: 0
          };
          
          const { error: profileError } = await supabase.from('profiles').insert([newUser]);
          if (profileError) throw new Error(profileError.message);
          
          setCurrentUser(newUser as User);
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
      points: 0
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  return (
    <AppContext.Provider value={{ currentUser, login, register, logout, users, orders, inventory, updateOrderStatus, assignRider, createOrder, updateInventory }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
