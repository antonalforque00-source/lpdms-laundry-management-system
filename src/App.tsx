/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { MobileFrame } from './components/MobileFrame';
import { LoginScreen } from './screens/LoginScreen';
import { CustomerScreen } from './screens/CustomerScreen';
import { RiderScreen } from './screens/RiderScreen';
import { StaffScreen } from './screens/StaffScreen';
import { AdminScreen } from './screens/AdminScreen';

function AppContent() {
  const { currentUser } = useAppContext();

  if (!currentUser) return <LoginScreen />;

  switch (currentUser.role) {
    case 'customer': return <CustomerScreen />;
    case 'rider': return <RiderScreen />;
    case 'staff': return <StaffScreen />;
    case 'admin': return <AdminScreen />;
    default: return <LoginScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <MobileFrame>
        <AppContent />
      </MobileFrame>
    </AppProvider>
  );
}

