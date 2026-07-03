import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Droplets, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';

export function LoginScreen() {
  const { login, register } = useAppContext();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'rider' | 'staff' | 'admin'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        await register({ email, name, role }, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-transparent">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm flex flex-col items-center space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 mx-auto mb-6">
            <Droplets className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 tracking-tight">LPDMS</h1>
          <p className="text-gray-500 text-sm font-medium">Laundry Pickup & Delivery Management</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}
          {isRegistering && (
            <Input 
              label="Full Name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name"
              required
            />
          )}
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email"
            required
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password"
            required
          />
          {isRegistering && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-gray-800"
                value={role} 
                onChange={e => setRole(e.target.value as any)}
              >
                <option value="customer">Customer</option>
                <option value="rider">Rider</option>
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </Button>

          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-600 font-bold hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        <div className="hidden sm:flex flex-col items-center mt-12 opacity-50 hover:opacity-100 transition-opacity">
          <div className="bg-white p-2 rounded-xl shadow-sm mb-3">
            <QRCode value={typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-vvasvr54odt6errmbdysl2-609173610732.asia-southeast1.run.app/'} size={80} level="L" />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full">
            <Smartphone size={12} /> Scan to view on mobile
          </p>
        </div>
      </motion.div>
    </div>
  );
}
