// ====================================================
// PWA Install Hook — GymDashboard
// ====================================================

import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setShowBanner(false);
      return;
    }

    const dismissed = sessionStorage.getItem('pwa_gym_banner_dismissed');

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
      const d = sessionStorage.getItem('pwa_gym_banner_dismissed');
      if (!d) setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const timer = setTimeout(() => {
      const d = sessionStorage.getItem('pwa_gym_banner_dismissed');
      if (!d) setShowBanner(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowBanner(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_gym_banner_dismissed', '1');
  };

  return { isInstallable, isInstalled, triggerInstall, showBanner, dismissBanner };
};
