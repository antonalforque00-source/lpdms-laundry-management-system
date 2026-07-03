import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../store/AppContext';
import { LogOut } from 'lucide-react';

export function MobileFrame({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAppContext();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 text-gray-900 font-sans flex flex-col selection:bg-blue-200 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/5 blur-3xl -z-10 rounded-full mix-blend-multiply opacity-50 transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-3xl -z-10 rounded-full mix-blend-multiply opacity-50 transform translate-y-1/3 translate-x-1/3"></div>

      <div className="w-full flex-1 flex flex-col relative z-0">
        {/* Header */}
        {currentUser && (
          <header className="flex-shrink-0 bg-white/70 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-20 sticky top-0 border-b border-gray-200/50 shadow-sm">
            <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
                  <span className="font-bold text-lg tracking-tight">L</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl tracking-tight text-blue-900 leading-none">LPDMS</h1>
                  <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mt-1">{currentUser.role} Portal</p>
                </div>
              </div>
              <button onClick={logout} className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </header>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 w-full mx-auto relative scroll-smooth flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentUser?.id || 'login'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn("w-full h-full flex flex-col", currentUser && "max-w-4xl")}
            >
              <div className={cn("w-full h-full", currentUser ? "p-4 sm:p-8" : "flex flex-col")}>
                 {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
