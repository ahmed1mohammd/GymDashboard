import React, { useState, useEffect } from 'react';
import { QrCode, ShieldCheck, ShieldAlert, Zap, Scan, Camera, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CyberCard from '../components/ui/CyberCard';
import CyberButton from '../components/ui/CyberButton';
import CyberInput from '../components/ui/CyberInput';
import { useTheme } from '../context/ThemeContext';

export const Attendance = () => {
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);
  const [cameraError, setCameraError] = useState('');

  // Fallback local member database for simulations
  const [memberDatabase] = useState({
    'FLEX-1001': { name: 'أحمد علي حسن', package: 'باقة اللياقة الأساسية', expiresAt: '2026-06-23', status: 'active', phoneNumber: '01012345678' },
    'FLEX-1002': { name: 'إبراهيم يوسف', package: 'باقة كابتن بريميوم (PT)', expiresAt: '2026-06-15', status: 'frozen', phoneNumber: '01298765432' },
    'FLEX-1003': { name: 'سعد عبد الله', package: 'باقة اللياقة الأساسية', expiresAt: '2026-05-10', status: 'expired', phoneNumber: '01124681357' },
  });

  // Handle active camera scanning state changes
  useEffect(() => {
    let activeScanner = null;

    if (isScanning) {
      setCameraError('');
      // Delay initialization slightly to guarantee the DOM element '#qr-reader-container' is mounted
      const initTimeout = setTimeout(() => {
        try {
          const scanner = new Html5Qrcode('qr-reader-container');
          activeScanner = scanner;
          setScannerInstance(scanner);

          scanner.start(
            { facingMode: 'environment' },
            {
              fps: 15,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.65;
                return { width: size, height: size };
              },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              // Success callback: stop camera first, then process check-in
              scanner.stop().then(() => {
                setIsScanning(false);
                setCode(decodedText);
                handleCheckIn(decodedText);
              }).catch(err => console.error('Error stopping camera', err));
            },
            (error) => {
              // Silent skip for camera polling frames
            }
          ).catch(err => {
            console.error('Failed to start WebRTC scanner camera', err);
            setCameraError('لم نتمكن من الوصول للكاميرا. يرجى التأكد من إعطاء صلاحيات الكاميرا للمتصفح.');
            setIsScanning(false);
          });
        } catch (e) {
          console.error('Html5Qrcode constructor error', e);
          setIsScanning(false);
        }
      }, 250);

      return () => {
        clearTimeout(initTimeout);
        if (activeScanner && activeScanner.isScanning) {
          activeScanner.stop().catch(err => console.error('Scanner stop on unmount error', err));
        }
      };
    }
  }, [isScanning]);

  const handleCheckIn = async (codeToSubmit) => {
    let activeCode = codeToSubmit || code;
    if (!activeCode) {
      toast.error('يرجى إدخال رمز الاستجابة السريعة (QR) أو رقم الهاتف');
      return;
    }

    setLoading(true);
    setScanResult(null);

    // Client-side Lookup: If input looks like an Egyptian phone number, look up their QR Code
    if (activeCode.match(/^01[0-9]{9}$/)) {
      try {
        const membersRes = await api.get('/members');
        if (membersRes.data && membersRes.data.data && Array.isArray(membersRes.data.data.members)) {
          const found = membersRes.data.data.members.find(m => m.phoneNumber === activeCode);
          if (found) {
            activeCode = found.qrCode;
            toast.success(`تم العثور على المشترك: ${found.name}`, { id: 'phone-lookup' });
          } else {
            toast.error('عذراً، لم يتم العثور على أي مشترك مسجل برقم الهاتف هذا.');
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback search in mock database during offline mode
        const mockFound = Object.entries(memberDatabase).find(([_, m]) => m.phoneNumber === activeCode);
        if (mockFound) {
          activeCode = mockFound[0];
          toast.success(`تم العثور على المشترك: ${mockFound[1].name} (محلي)`, { id: 'phone-lookup' });
        } else {
          toast.error('عذراً، لم يتم العثور على العضو.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      // POST API check to V2 Backend
      const response = await api.post('/attendance/check', { qrCode: activeCode });
      const attendance = response.data?.data?.attendance;
      
      setScanResult({
        success: true,
        name: attendance?.member?.name || 'عضو الصالة الرياضية',
        package: attendance?.member?.activePackage?.name || 'باقة معتمدة نشطة',
        message: 'تم التصريح بالدخول - حضور مسجل بالخادم',
      });
      toast.success('تم تسجيل الحضور في قاعدة البيانات');
    } catch (error) {
      // API error or offline fallback - search local mock
      const member = memberDatabase[activeCode];
      
      if (member) {
        if (member.status === 'active') {
          setScanResult({
            success: true,
            name: member.name,
            package: member.package,
            message: 'مسموح بالدخول - اشتراك نشط وجاري (محلي)',
          });
          toast.success('تمت الموافقة على الدخول (محاكاة)');
        } else if (member.status === 'frozen') {
          setScanResult({
            success: false,
            name: member.name,
            package: member.package,
            message: 'مرفوض - الاشتراك مجمد حالياً (محلي)',
          });
          toast.error('الدخول مرفوض: اشتراك مجمد');
        } else {
          setScanResult({
            success: false,
            name: member.name,
            package: member.package,
            message: 'مرفوض - الاشتراك منتهي الصلاحية (محلي)',
          });
          toast.error('الدخول مرفوض: اشتراك منتهي');
        }
      } else {
        const isServerDenial = error.response && error.response.status === 403;
        const msg = error.response?.data?.message || 'رمز QR غير معروف أو غير موجود بالنظام.';
        
        setScanResult({
          success: false,
          message: isServerDenial ? `مرفوض - ${msg}` : msg,
        });
        toast.error(isServerDenial ? 'تم رفض تصريح الدخول' : 'الرمز غير صالح');
      }
    } finally {
      setLoading(false);
    }
  };

  const simulateQuickScan = (testCode) => {
    setCode(testCode);
    handleCheckIn(testCode);
  };

  const toggleCamera = () => {
    if (isScanning) {
      if (scannerInstance) {
        scannerInstance.stop().then(() => {
          setIsScanning(false);
          setScannerInstance(null);
        }).catch(err => console.error('Error stopping scanner', err));
      } else {
        setIsScanning(false);
      }
    } else {
      setIsScanning(true);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white neon-text-emerald">بوابة تسجيل الحضور والتحكم بالدخول</h2>
        <p className="text-xs text-gray-400 mt-1 font-arabic">التحقق من صلاحية رموز QR الممسوحة بالكاميرا أو رقم الهاتف المكتوب يدوياً لمنح تصاريح الدخول.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Verification Form Card */}
        <CyberCard title="تسجيل الدخول الرقمي">
          <div className="space-y-6">
            {/* Live WebRTC Camera QR Reader Container */}
            {isScanning ? (
              <div className="relative rounded-2xl overflow-hidden border border-[var(--theme-primary)] bg-black/90 p-4 transition-all duration-300">
                <button
                  onClick={toggleCamera}
                  className="absolute top-6 left-6 z-10 p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all duration-200 cursor-pointer shadow-lg"
                  title="إغلاق الكاميرا"
                >
                  <X size={16} />
                </button>
                <div id="qr-reader-container" className="w-full rounded-xl border border-dashed border-gray-800 bg-slate-950 overflow-hidden aspect-square" />
                <div className="text-center mt-3">
                  <span className="text-[10px] text-gray-400 animate-pulse">جاري المسح الضوئي المباشر... وجه الكاميرا نحو رمز الـ QR</span>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {/* Camera Trigger Panel */}
                <button
                  onClick={toggleCamera}
                  className="relative w-full h-44 rounded-2xl bg-[rgba(10,10,15,0.6)] border border-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)] hover:bg-[rgba(16,18,27,0.8)] flex flex-col items-center justify-center p-4 transition-all duration-300 group cursor-pointer"
                >
                  <div className="absolute w-full h-0.5 bg-[var(--theme-primary)] shadow-[0_0_10px_var(--theme-primary)] top-0 left-0 animate-scannerLine pointer-events-none opacity-40 group-hover:opacity-100" />
                  <Camera size={36} className="text-[var(--theme-primary)]/40 group-hover:text-[var(--theme-primary)] mb-3 animate-pulse transition-colors duration-300" />
                  <span className="text-xs font-bold text-white group-hover:neon-text-emerald transition-all duration-300">فتح الكاميرا الحية للـ QR</span>
                  <span className="text-[9px] text-gray-500 mt-1 font-semibold text-center leading-normal">مسح فوري تلقائي بكاميرا الهاتف المحمول أو الكمبيوتر</span>
                </button>
              </div>
            )}

            {cameraError && (
              <div className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 leading-relaxed text-right">
                ⚠️ {cameraError}
              </div>
            )}

            <div className="flex gap-3">
              <CyberInput
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="أدخل رمز QR يدوياً أو رقم هاتف العضو (مثال: 01012345678)"
                icon={QrCode}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
              />
              <CyberButton onClick={() => handleCheckIn()} variant="secondary" disabled={loading}>
                {loading ? 'جاري التحقق...' : 'تحقق'}
              </CyberButton>
            </div>

            {/* Quick Simulation Presets */}
            <div className="border-t border-[var(--color-cyber-border)] pt-4">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">رموز تجريبية سريعة للمحاكاة</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => simulateQuickScan('FLEX-1001')}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 cursor-pointer"
                >
                  رمز نشط (FLEX-1001)
                </button>
                <button
                  onClick={() => simulateQuickScan('FLEX-1002')}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all duration-300 cursor-pointer"
                >
                  رمز مجمد (FLEX-1002)
                </button>
                <button
                  onClick={() => simulateQuickScan('01124681357')}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all duration-300 cursor-pointer"
                >
                  رقم هاتف منتهي (01124681357)
                </button>
              </div>
            </div>
          </div>
        </CyberCard>

        {/* Real-time Alerts Check-in screen */}
        <CyberCard title="شاشة المراقبة المباشرة للبوابة">
          {scanResult ? (
            <div className={`h-full min-h-[300px] flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
              scanResult.success 
                ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'bg-rose-950/20 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
            }`}>
              {scanResult.success ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-bounce">
                  <ShieldCheck size={32} />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-bounce">
                  <ShieldAlert size={32} />
                </div>
              )}

              <h3 className={`text-xl font-bold mt-5 ${scanResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scanResult.success ? 'تم التصريح بالدخول - البوابة مفتوحة' : 'الدخول غير مسموح به'}
              </h3>
              
              <p className="text-xs text-gray-400 mt-2 font-bold">{scanResult.message}</p>

              {scanResult.name && (
                <div className="mt-6 w-full space-y-2 border-t border-[var(--color-cyber-border)] pt-4 text-center">
                  <span className="text-xs text-gray-500 block">اسم العضو المشترك</span>
                  <span className="text-md font-bold text-white block">{scanResult.name}</span>

                  <span className="text-xs text-gray-500 block mt-2">الباقة المسجل بها</span>
                  <span className="text-xs font-semibold text-gray-300 block">{scanResult.package}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--color-cyber-border)] rounded-2xl bg-gray-900/10">
              <Zap size={28} className="text-gray-600 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-gray-400">في انتظار عملية المسح الأولى</h4>
              <p className="text-[10px] text-gray-600 mt-1 max-w-xs leading-relaxed">يرجى تمرير رمز QR أمام الكاميرا الحية، أو إدخال كود الـ QR أو رقم هاتف العضو يدوياً للتحقق وتنشيط تصريح الدخول.</p>
            </div>
          )}
        </CyberCard>
      </div>
    </div>
  );
};

export default Attendance;
