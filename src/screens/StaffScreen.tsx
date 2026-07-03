import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { QrCode, Search, CheckSquare, PackageSearch, AlertTriangle } from 'lucide-react';

export function StaffScreen() {
  const { orders, updateOrderStatus, inventory } = useAppContext();
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory'>('queue');
  
  // Tasks at facility
  const activeOrders = orders.filter(o => 
    !['Pending', 'Pickup Scheduled', 'Rider Assigned for Pickup', 'Picked Up', 'Out for Delivery', 'Delivered'].includes(o.status)
  );

  const handleStageUpdate = (orderId: string, current: string) => {
    let next: any = current;
    if (current === 'Arrived at Facility') next = 'Washing';
    else if (current === 'Washing') next = 'Drying';
    else if (current === 'Drying') next = 'Folding';
    else if (current === 'Folding') next = 'Quality Inspection';
    else if (current === 'Quality Inspection') next = 'Ready for Delivery';
    updateOrderStatus(orderId, next);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      <div className="bg-white px-4 py-2 border-b border-gray-100 flex justify-around shadow-sm relative z-10">
        <button 
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'queue' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Work Queue
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Inventory
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input placeholder="Scan QR or Enter ID" className="bg-white" />
              <Button variant="outline" className="w-10 px-0 bg-white"><QrCode size={18} /></Button>
            </div>
            
            {activeOrders.map(order => (
              <Card key={order.id} className="border-l-[6px] border-l-blue-500 border-gray-100">
                <CardContent className="p-5">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold uppercase tracking-widest text-xs text-gray-500">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <h3 className="font-medium text-gray-900">{order.services.join(', ')}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {order.weight ? `${order.weight} kg` : 'Weight not set'}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {order.status === 'Arrived at Facility' && (
                       <Button variant="outline" size="sm" className="flex-1">Set Weight</Button>
                    )}
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleStageUpdate(order.id, order.status)}
                      disabled={order.status === 'Ready for Delivery'}
                    >
                      {order.status === 'Quality Inspection' ? 'Pass QA' : 'Next Stage'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-3">
            {inventory.map(item => (
              <Card key={item.id}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${item.quantity <= item.lowStockThreshold ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.quantity <= item.lowStockThreshold ? <AlertTriangle size={20} /> : <PackageSearch size={20} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">Threshold: {item.lowStockThreshold} {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${item.quantity <= item.lowStockThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity}
                    </p>
                    <p className="text-xs text-gray-500">{item.unit}</p>
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
