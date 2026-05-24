import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import CyberCard from '../components/ui/CyberCard';
import CyberInput from '../components/ui/CyberInput';
import CyberButton from '../components/ui/CyberButton';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setError('');
    setLoading(true);

    // Direct production JWT authentications via unified API
    const success = await login({ email, password });
    
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('خطأ في البريد الإلكتروني أو كلمة المرور، يرجى التحقق وإعادة المحاولة.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-cyber-darker)]">
      {/* Decorative Neon Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--theme-primary)] opacity-5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--theme-secondary)] opacity-5 rounded-full blur-[100px] pointer-events-none" />

      <CyberCard className="w-full max-w-md border border-emerald-500/20 p-8 shadow-2xl relative z-10" hover={false}>
        {/* Corporate Logo Brand */}
        <div className="flex flex-col items-center gap-2 mb-8 select-none">
          <div className="w-48 h-auto flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <img
              src="https://i.ibb.co/qF44zwks/logo1-1.png"
              alt="Flexora Logo"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-4">بوابة التحكم الموحدة للمستخدمين</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <CyberInput
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@flexora.com"
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
            {loading ? 'جاري التحقق والمصادقة...' : 'تسجيل الدخول'}
          </CyberButton>
        </form>

        {/* Access Registration Gateway */}
        <div className="mt-6 pt-5 border-t border-[var(--color-cyber-border)] text-center">
          <Link
            to="/register"
            className="text-xs font-bold text-[var(--theme-primary)] hover:text-white transition-colors duration-200"
          >
            ليس لديك حساب؟ سجل صالتك الرياضية الآن
          </Link>
        </div>
      </CyberCard>
    </div>
  );
};

export default Login;
