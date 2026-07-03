-- Run these commands in your Supabase SQL Editor to set up the database structure

-- 1. Create Users Table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'rider', 'staff', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Orders Table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.users(id) NOT NULL,
  customer_name TEXT NOT NULL,
  rider_id UUID REFERENCES public.users(id),
  staff_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  items JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  weight NUMERIC,
  total_cost NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_time_forecast TIMESTAMP WITH TIME ZONE,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Inventory Table
CREATE TABLE public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 5. Set up RLS Policies (Basic examples)
-- Users: Users can read their own profile, staff/admin can read all
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Orders: Customers can see their own orders, riders/staff can see all
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
-- (You can add more permissive policies for your staff/riders based on their role)
