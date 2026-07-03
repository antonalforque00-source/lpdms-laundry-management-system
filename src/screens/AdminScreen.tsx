import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { Users, DollarSign, Activity, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 550 },
  { name: 'Thu', revenue: 450 },
  { name: 'Fri', revenue: 700 },
  { name: 'Sat', revenue: 800 },
  { name: 'Sun', revenue: 600 },
];

export function AdminScreen() {
  const { orders, users, updateUserStatus, assignRider } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'users'>('dashboard');

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalCost, 0);
  const riders = users.filter(u => u.role === 'rider' && u.status === 'approved');

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      <div className="bg-white border-b border-gray-100 px-2 flex overflow-x-auto shadow-sm relative z-10 scrollbar-hide">
        {['dashboard', 'orders', 'users'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-4 text-xs font-bold uppercase tracking-wider border-b-2 capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-5">
                  <DollarSign className="w-6 h-6 text-green-500 mb-2" />
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Revenue</p>
                  <p className="text-2xl font-bold tracking-tight text-gray-800">₱{totalRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <Activity className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Active Orders</p>
                  <p className="text-2xl font-bold tracking-tight text-gray-800">{orders.filter(o => o.status !== 'Delivered').length}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Weekly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
               <CardHeader className="py-3">
                 <CardTitle className="text-sm">Recent Audit Log</CardTitle>
               </CardHeader>
               <CardContent className="p-0 text-xs">
                 <div className="divide-y">
                   <div className="p-3 flex justify-between"><span className="text-gray-600">Admin generated weekly report</span><span className="text-gray-400">10m ago</span></div>
                   <div className="p-3 flex justify-between"><span className="text-gray-600">System assigned Rider U2 to ORD-1002</span><span className="text-gray-400">1h ago</span></div>
                   <div className="p-3 flex justify-between"><span className="text-gray-600">Inventory Bleach updated to 20L</span><span className="text-gray-400">3h ago</span></div>
                 </div>
               </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold uppercase tracking-widest text-xs text-blue-600">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.services.join(', ')} • ₱{order.totalCost}</p>

                  {(order.status === 'Pending' || order.status === 'Ready for Delivery') && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Assign Rider:</span>
                      <select 
                        className="flex-1 h-8 rounded-lg border border-gray-200 text-xs px-2"
                        onChange={(e) => {
                          if (e.target.value) {
                            assignRider(order.id, e.target.value);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select a Rider...</option>
                        {riders.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {order.riderId && (order.status !== 'Pending' && order.status !== 'Ready for Delivery') && (
                    <p className="mt-2 text-xs text-gray-500">
                      Rider: <strong>{users.find(u => u.id === order.riderId)?.name || 'Unknown'}</strong>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.map(u => (
              <Card key={u.id}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <Users size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {u.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => updateUserStatus(u.id, 'approved')}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateUserStatus(u.id, 'rejected')}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        u.status === 'approved' ? 'bg-green-100 text-green-700' :
                        u.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
