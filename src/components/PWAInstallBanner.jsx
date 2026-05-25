// ============================================================
// PWAInstallBanner — GymDashboard
// بانر تثبيت التطبيق — يظهر تلقائياً بعد ثانيتين
// ============================================================

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const { isInstalled, triggerInstall, showBanner, dismissBanner, isInstallable } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showBanner && !isInstalled) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [showBanner, isInstalled]);

  if (!visible) return null;

  const handleInstall = async () => {
    if (isInstallable) {
      await triggerInstall();
    } else {
      dismissBanner();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px', // فوق الـ FAB الخاص بالحضور على الموبايل
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 48px)',
        maxWidth: '480px',
        background: 'linear-gradient(135deg, rgba(10,10,15,0.97) 0%, rgba(16,18,27,0.97) 100%)',
        border: '1px solid rgba(229,9,20,0.35)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(229,9,20,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: 'slideUpBannerGym 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        direction: 'rtl',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
      }}
    >
      <style>{`
        @keyframes slideUpBannerGym {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #E50914, #C0070F)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(229,9,20,0.4)',
      }}>
        <Smartphone size={22} color="#fff" />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '2px' }}>
          ثبّت تطبيق فليكسورا
        </div>
        <div style={{ fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.4 }}>
          وصول سريع لإدارة صالتك بدون متصفح
        </div>
      </div>

      {/* Install Button */}
      <button
        onClick={handleInstall}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px',
          background: 'linear-gradient(135deg, #E50914, #C0070F)',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '0.76rem', fontWeight: 700,
          cursor: 'pointer', flexShrink: 0,
          fontFamily: "'Cairo', 'Tajawal', sans-serif",
          boxShadow: '0 4px 12px rgba(229,9,20,0.35)',
          transition: 'transform 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Download size={14} />
        تثبيت
      </button>

      {/* Dismiss */}
      <button
        onClick={dismissBanner}
        style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#64748b', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.color = '#f43f5e'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748b'; }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
