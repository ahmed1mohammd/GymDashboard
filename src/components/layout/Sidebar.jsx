import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Package,
  Users,
  UserSquare2,
  QrCode,
  DollarSign,
  LogOut,
  X,
  GitBranch,
  MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  // Define all navigation items with roles allowed
  const navItems = [
    {
      path: '/stats',
      label: 'الرئيسية والإحصائيات',
      icon: LayoutDashboard,
      roles: ['Gym-Owner', 'owner'],
    },
    {
      path: '/coach-dashboard',
      label: 'لوحة تحكم المدرب',
      icon: UserCheck,
      roles: ['Coach', 'coach'],
    },
    {
      path: '/packages',
      label: 'الباقات والاشتراكات',
      icon: Package,
      roles: ['Gym-Owner', 'owner'],
    },
    {
      path: '/staff',
      label: 'إدارة الموظفين',
      icon: Users,
      roles: ['Gym-Owner', 'owner'],
    },
    {
      path: '/branches',
      label: 'إدارة الفروع',
      icon: GitBranch,
      roles: ['Gym-Owner', 'owner'],
    },
    {
      path: '/members',
      label: 'إدارة الأعضاء CRM',
      icon: UserSquare2,
      roles: ['Gym-Owner', 'owner', 'Receptionist', 'receptionist'],
    },
    {
      path: '/attendance',
      label: 'تسجيل الحضور والتحكم',
      icon: QrCode,
      roles: ['Gym-Owner', 'owner', 'Receptionist', 'receptionist'],
    },
    {
      path: '/financials',
      label: 'المالية والحسابات',
      icon: DollarSign,
      roles: ['Gym-Owner', 'owner'],
    },
    {
      path: '/whatsapp',
      label: 'واتساب الصالة',
      icon: MessageSquare,
      // Visible to ALL roles during testing — restrict to owner later
      roles: ['Gym-Owner', 'owner', 'Coach', 'coach', 'Receptionist', 'receptionist'],
    },
  ];

  // Filter navigation items by user role
  const visibleItems = navItems.filter((item) => {
    if (!user?.role) return false;
    const normUserRole = user.role.toLowerCase().replace(/gym-/, '');
    return item.roles.some(r => r.toLowerCase().replace(/gym-/, '') === normUserRole);
  });

  const roleTranslations = {
    'Gym-Owner': 'المالك',
    'owner': 'المالك',
    'Coach': 'مدرب',
    'coach': 'مدرب',
    'Receptionist': 'موظف استقبال',
    'receptionist': 'موظف استقبال',
  };

  const handleLinkClick = () => {
    // Auto-close sidebar drawer on link click for mobile screens
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside 
      className={clsx(
        "w-72 bg-[rgba(5,5,7,0.96)] border-l border-[var(--color-cyber-border)] flex flex-col h-screen fixed right-0 top-0 z-40 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Brand logo/name & Mobile close button */}
      <div className="p-5 border-b border-[var(--color-cyber-border)] flex items-center justify-center relative">
        {/* Sidebar Mobile Close Trigger */}
        <button 
          onClick={onClose}
          className="absolute right-4 p-1.5 rounded-lg border border-[var(--color-cyber-border)] text-gray-500 hover:text-white lg:hidden transition-colors cursor-pointer"
          title="إغلاق القائمة"
        >
          <X size={16} />
        </button>

        <img
          src="https://i.ibb.co/qF44zwks/logo1-1.png"
          alt="Flexora Logo"
          className="w-40 h-auto object-contain filter drop-shadow-[0_0_10px_var(--theme-primary)] mx-auto"
        />
      </div>

      {/* User Quick Info */}
      <div className="p-5 mx-4 my-3 rounded-2xl bg-[rgba(16,18,27,0.4)] border border-[var(--color-cyber-border)] flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--theme-primary)] flex items-center justify-center text-lg font-bold text-white bg-slate-900 shadow-[0_0_10px_rgba(229,9,20,0.15)] select-none">
          {user?.name?.slice(0, 2) || 'GY'}
        </div>
        <h4 className="mt-2.5 font-bold text-sm text-white select-none">{user?.name}</h4>
        <span className="text-[10px] font-bold text-[var(--theme-primary)] tracking-wider mt-0.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 select-none">
          {roleTranslations[user?.role] || user?.role || 'مشرف'}
        </span>
        {/* DEBUG: show raw role from API */}
        <span className="text-[9px] text-gray-600 mt-0.5 font-mono select-none">
          role: {user?.role} | id: {user?.gymId?.slice?.(0,8) || user?.id?.slice?.(0,8) || '?'}
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden',
                  isActive
                    ? 'text-[var(--theme-primary)] bg-red-500/10 border-r-4 border-[var(--theme-primary)] shadow-[0_0_15px_rgba(229,9,20,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                )
              }
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
              
              {/* Sci-fi hover border animation */}
              <div className="absolute left-0 bottom-0 top-0 w-0.5 bg-[var(--theme-primary)] scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="p-4 border-t border-[var(--color-cyber-border)]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 cursor-pointer"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
