import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Dumbbell, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CyberCard from '../components/ui/CyberCard';
import CyberInput from '../components/ui/CyberInput';
import CyberButton from '../components/ui/CyberButton';

export const Register = () => {
  const navigate = useNavigate();
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gymName || !ownerName || !email || !password) {
      setError('يرجى ملء جميع الحقول الإلزامية');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // POST to /user/register
      await api.post('/register', {
        gymName,
        ownerName,
        email,
        password,
      });

      setIsSuccess(true);
      toast.success('تم إرسال طلب تسجيل الصالة الرياضية بنجاح');
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'فشل في تسجيل الصالة الرياضية، يرجى المحاولة لاحقاً.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-cyber-darker)]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--theme-primary)] opacity-5 rounded-full blur-[100px] pointer-events-none" />
        
        <CyberCard className="w-full max-w-md border border-emerald-500/20 p-8 shadow-2xl relative z-10 text-center space-y-6" hover={false}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-bounce">
            <CheckCircle2 size={32} />
          </div>
          
          <h2 className="text-xl font-bold text-white">تم إرسال طلبك بنجاح!</h2>
          
          <div className="text-xs text-gray-400 leading-relaxed space-y-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <p>
              لقد تم تسجيل الصالة الرياضية **{gymName}** بنجاح وحساب المالك **{ownerName}** على نظام المنصة الموحد.
            </p>
            <p className="text-[var(--theme-primary)] font-bold">
              الحالة الحالية: في انتظار الموافقة والتشغيل من قبل إدارة المنصة (SnapTech Platform Admin).
            </p>
            <p className="text-[10px] text-gray-500">
              سيتم مراجعة طلبك وتفعيل الصالة خلال 24 ساعة كحد أقصى، لتتمكن بعدها من تسجيل الدخول وإدارة كافة الباقات والاشتراكات.
            </p>
          </div>

          <Link to="/login" className="block w-full">
            <CyberButton variant="primary" className="w-full">
              العودة لبوابة الدخول
            </CyberButton>
          </Link>
        </CyberCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-cyber-darker)]">
      {/* Decorative Neon Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--theme-primary)] opacity-5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--theme-secondary)] opacity-5 rounded-full blur-[100px] pointer-events-none" />

      <CyberCard className="w-full max-w-md border border-emerald-500/20 p-8 shadow-2xl relative z-10" hover={false}>
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-8 select-none">
          <div className="w-40 h-auto flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <img
              src="https://i.ibb.co/qF44zwks/logo1-1.png"
              alt="Flexora Logo"
              className="w-full h-auto object-contain"
            />
          </div>
          <h2 className="text-sm font-bold text-white mt-4">تسجيل صالة رياضية جديدة</h2>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">طلب انضمام لمنصة FLEXORA لإدارة الصالات</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <CyberInput
            label="اسم الصالة الرياضية (Gym Name)"
            type="text"
            value={gymName}
            onChange={(e) => setGymName(e.target.value)}
            placeholder="مثال: صالة الجولف الرياضية"
            icon={Dumbbell}
            error={error && !gymName ? 'الحقل مطلوب' : ''}
            required
          />

          <CyberInput
            label="اسم مالك الصالة (Owner Name)"
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="مثال: أحمد محمود علي"
            icon={User}
            error={error && !ownerName ? 'الحقل مطلوب' : ''}
            required
          />

          <CyberInput
            label="البريد الإلكتروني للإدارة"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@mygym.com"
            icon={Mail}
            error={error && !email ? 'الحقل مطلوب' : ''}
            required
          />

          <CyberInput
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            error={error && !password ? 'الحقل مطلوب' : ''}
            required
          />

          {error && (
            <div className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-center">
              {error}
            </div>
          )}

          <CyberButton type="submit" className="w-full mt-2" variant="primary" disabled={loading}>
            {loading ? 'جاري إرسال الطلب...' : 'إرسال طلب الانضمام'}
          </CyberButton>
        </form>

        {/* Back Link */}
        <div className="mt-6 pt-5 border-t border-[var(--color-cyber-border)] text-center">
          <Link
            to="/login"
            className="text-xs font-bold text-gray-500 hover:text-white transition-colors duration-200 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={14} />
            العودة لبوابة تسجيل الدخول
          </Link>
        </div>
      </CyberCard>
    </div>
  );
};

export default Register;
