import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useAppContext } from '../store/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Plus, Package, Clock, MapPin, Award, CheckCircle2, QrCode, X } from 'lucide-react';
import { format } from 'date-fns';

export function CustomerScreen() {
  const { currentUser, orders, createOrder } = useAppContext();
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'profile'>('home');
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  
  const customerOrders = orders.filter(o => o.customerId === currentUser?.id);
  const activeOrders = customerOrders.filter(o => o.status !== 'Delivered');
  const pastOrders = customerOrders.filter(o => o.status === 'Delivered');

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* QR Code Modal Overlay */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm flex flex-col items-center relative shadow-2xl">
            <button 
              onClick={() => setSelectedQr(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Order QR Code</h3>
            <p className="text-sm text-gray-500 mb-8 text-center">Show this code to the rider or staff for scanning.</p>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <QRCode value={selectedQr} size={200} level="H" />
            </div>
            <p className="mt-6 font-mono text-sm font-bold text-blue-600 tracking-widest">{selectedQr}</p>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 space-y-6 pb-12">
        {activeTab === 'home' && (
          <>
            {/* Rewards Card */}
            <Card className="bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200 border-none">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Loyalty Rewards</p>
                  <h3 className="text-4xl font-bold mt-1 tracking-tight">{currentUser?.points || 0} <span className="text-lg opacity-80">pts</span></h3>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-end">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Active Orders</h2>
              <button onClick={() => setActiveTab('schedule')} className="text-xs text-blue-600 font-bold hover:underline flex items-center">
                <Plus size={14} className="mr-1" /> New Pickup
              </button>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No active laundry orders.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <Card key={order.id} className="cursor-pointer hover:border-blue-300 transition-colors">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{order.id}</p>
                          <h4 className="font-bold text-gray-800">{order.services.join(', ')}</h4>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2 text-blue-500" />
                          <span>Pickup: {format(new Date(order.pickupTime), 'MMM d, h:mm a')}</span>
                        </div>
                        {order.deliveryTimeForecast && (
                          <div className="flex items-center text-indigo-600 font-medium">
                            <CheckCircle2 size={14} className="mr-2" />
                            <span>Est. Delivery: {format(new Date(order.deliveryTimeForecast), 'h:mm a')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                         <span className="text-sm font-semibold">${order.totalCost.toFixed(2)}</span>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-blue-600 px-2"
                            onClick={() => setSelectedQr(order.qrCode)}
                         >
                            <QrCode size={16} className="mr-1"/> QR
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'schedule' && (
          <ScheduleForm onComplete={() => setActiveTab('home')} />
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Past Orders</h2>
            {pastOrders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-5 flex justify-between items-center">
                   <div>
                     <p className="font-medium text-sm">{order.services.join(', ')}</p>
                     <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-semibold text-sm">${order.totalCost.toFixed(2)}</p>
                     <StatusBadge status={order.status} />
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bg-white border-t border-gray-100 flex justify-around p-2 pb-6 sticky bottom-0 w-full z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] mt-auto">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Package />} label="Home" />
        <NavButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<Plus />} label="Schedule" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<MapPin />} label="Profile" />
      </div>
    </div>
  );
}

function ScheduleForm({ onComplete }: { onComplete: () => void }) {
  const { createOrder, currentUser } = useAppContext();
  const [service, setService] = useState('Wash and Fold');
  const [address, setAddress] = useState('123 Main St, Apt 4B');
  const [payment, setPayment] = useState<'COD' | 'GCash' | 'Maya' | 'Credit/Debit'>('GCash');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder({
      customerId: currentUser!.id,
      customerName: currentUser!.name,
      pickupAddress: address,
      deliveryAddress: address,
      pickupTime: new Date(Date.now() + 86400000).toISOString(),
      services: [service],
      paymentMethod: payment,
      totalCost: service === 'Dry Cleaning' ? 35 : 15,
      isPaid: false,
    });
    alert('Pickup Scheduled! AI forecasting delivery time...');
    onComplete();
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-lg font-semibold">Schedule Pickup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Service Type</label>
          <select className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-gray-800" value={service} onChange={e => setService(e.target.value)}>
            <option>Wash and Fold</option>
            <option>Wash and Dry</option>
            <option>Dry Cleaning</option>
            <option>Ironing</option>
          </select>
        </div>
        
        <Input label="Pickup Address" value={address} onChange={e => setAddress(e.target.value)} required />
        
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Payment Method</label>
          <select className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-gray-800" value={payment} onChange={e => setPayment(e.target.value as any)}>
            <option>COD</option>
            <option>GCash</option>
            <option>Maya</option>
            <option>Credit/Debit</option>
          </select>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <div className="flex justify-between font-medium text-blue-900">
            <span>Estimated Cost</span>
            <span>${service === 'Dry Cleaning' ? '35.00' : '15.00'}</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">Smart Pickup slot assigned: Tomorrow at 9:00 AM</p>
        </div>

        <Button type="submit" className="w-full mt-4">Confirm Booking</Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onComplete}>Cancel</Button>
      </form>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center p-2 min-w-[64px] rounded-2xl transition-colors ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
    >
      {React.cloneElement(icon, { size: 24, className: active ? 'fill-blue-100/50' : '' })}
      <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{label}</span>
    </button>
  );
}
