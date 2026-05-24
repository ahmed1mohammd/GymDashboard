import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { QrCode } from 'lucide-react';

export const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-cyber-dark)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[var(--theme-primary)] animate-spin" />
          <span className="text-sm font-semibold text-[var(--theme-primary)] tracking-wider animate-pulse">جاري تحميل النظام...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-main)] transition-colors duration-300 overflow-x-hidden">
      {/* Translucent overlay backdrop for closing sidebar drawer on mobile screens */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-30 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar - Mounted right side for RTL (responsive layout) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area - Offsetting on desktop, occupying full width on mobile */}
      <div className="mr-0 lg:mr-72 flex flex-col min-h-screen transition-all duration-300">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sticky Mobile Floating Action Button (FAB) for quick attendance check-ins */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden filter drop-shadow-[0_0_15px_rgba(229,9,20,0.45)]">
        <Link 
          to="/attendance" 
          className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[var(--theme-primary)] text-white font-bold text-sm shadow-[0_0_15px_var(--theme-primary)] hover:scale-105 active:scale-95 transition-all duration-300 border border-red-400/20"
        >
          <QrCode size={18} className="animate-pulse" />
          <span>تسجيل الحضور</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardLayout;
