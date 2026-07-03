import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../store/AppContext';
import { LogOut } from 'lucide-react';

export function MobileFrame({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAppContext();
  
  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1A202C] font-sans flex justify-center selection:bg-blue-100">
      <div className="w-full max-w-md bg-white shadow-2xl relative flex flex-col h-[100dvh] sm:h-[90vh] sm:my-auto sm:rounded-[3rem] sm:border-[6px] sm:border-[#222] overflow-hidden">
        {/* Status bar simulation for desktop */}
        <div className="hidden sm:flex h-6 bg-[#222] w-full rounded-t-[2.5rem] absolute top-[-6px] left-0 justify-center">
          <div className="w-20 h-4 bg-black rounded-b-xl"></div>
        </div>

        {/* Header */}
        {currentUser && (
          <header className="flex-shrink-0 bg-white text-gray-900 px-5 py-4 flex items-center justify-between z-10 sticky top-0 sm:mt-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
                <span className="font-bold text-sm tracking-tight">L</span>
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-blue-900 leading-none">LPDMS</h1>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">{currentUser.role} Portal</p>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative bg-[#F9FAFB] scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentUser?.id || 'login'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn("min-h-full pb-20", !currentUser && "pb-0 h-full flex flex-col")}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
