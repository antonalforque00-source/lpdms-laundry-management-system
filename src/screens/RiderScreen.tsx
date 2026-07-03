import React from 'react';
import { useAppContext } from '../store/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, Navigation, Camera, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../components/ui/Badge';
import { OrderStatus } from '../types';

export function RiderScreen() {
  const { currentUser, orders, updateOrderStatus } = useAppContext();
  
  const myTasks = orders.filter(o => o.riderId === currentUser?.id && o.status !== 'Delivered');

  const handleAction = (orderId: string, currentStatus: OrderStatus) => {
    let next: OrderStatus = currentStatus;
    if (currentStatus === 'Rider Assigned for Pickup') next = 'Picked Up';
    else if (currentStatus === 'Picked Up') next = 'Arrived at Facility';
    else if (currentStatus === 'Rider Assigned for Delivery' || currentStatus === 'Ready for Delivery') next = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') next = 'Delivered';
    
    updateOrderStatus(orderId, next);
  };

  const getActionLabel = (status: string) => {
    if (status === 'Rider Assigned for Pickup') return 'Confirm Pickup';
    if (status === 'Picked Up') return 'Drop at Facility';
    if (status === 'Ready for Delivery' || status === 'Rider Assigned for Delivery') return 'Start Delivery';
    if (status === 'Out for Delivery') return 'Confirm Delivery';
    return 'Update Status';
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      <div className="bg-white text-gray-800 p-6 pb-12 rounded-b-[2rem] border-b border-gray-100 shadow-sm relative z-10">
        <h2 className="text-xl font-bold tracking-tight text-blue-900">Rider Dashboard</h2>
        <div className="flex gap-4 mt-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex-1">
            <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Tasks</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{myTasks.length}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex-1">
            <p className="text-xs text-green-600 uppercase font-bold tracking-wider">Earnings</p>
            <p className="text-3xl font-bold text-green-700 mt-1">$45</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 -mt-6 space-y-4 overflow-y-auto">
        {myTasks.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-900 font-medium">All caught up!</p>
            <p className="text-sm text-gray-500">Wait for new assignments.</p>
          </div>
        ) : (
          myTasks.map(task => (
            <Card key={task.id} className="border border-gray-100 shadow-sm">
              <CardContent className="p-0">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{task.id}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{task.customerName}</h3>
                  <div className="flex items-start mt-2 text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <p>{task.status.includes('Delivery') ? task.deliveryAddress : task.pickupAddress}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 flex gap-2">
                  <Button variant="outline" className="flex-1 bg-white text-xs">
                    <Navigation size={14} className="mr-1" /> Route
                  </Button>
                  <Button variant="outline" className="flex-1 bg-white text-xs">
                    <Camera size={14} className="mr-1" /> Scan QR
                  </Button>
                </div>
                
                <div className="p-3">
                  <Button 
                    className="w-full" 
                    onClick={() => handleAction(task.id, task.status)}
                    variant={task.status === 'Out for Delivery' ? 'success' : 'primary'}
                  >
                    {getActionLabel(task.status)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
