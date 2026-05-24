import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://elegant-playfulness-production-f153.up.railway.app/user',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      let errMsg = error.response.data?.message || '';
      if (errMsg === 'Incorrect email or password') {
        errMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق أو الذهاب لتسجيل صالة رياضية جديدة إذا لم يكن لديك حساب.';
      }

      const isTokenError = (error.response.status === 401 && !error.config.url.includes('/login')) || 
                           errMsg.toLowerCase().includes('jwt') || 
                           errMsg.toLowerCase().includes('token');

      if (isTokenError) {
        toast.error('انتهت الجلسة أو الرمز غير صالح، يرجى تسجيل الدخول مجدداً.', { id: 'auth-error' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        // IMPORTANT: Only logout if this is a GYM-LEVEL status error (from gymStatusCheck middleware).
        // Member-level 403s (frozen member QR scan, expired member, etc.) must NOT trigger logout.
        // Gym-level errors come from the gym status middleware and contain specific identifiers.
        const isGymLevelError = 
          errMsg.includes('gym account is not active') ||
          errMsg.includes('Your gym account') ||
          errMsg.includes('الجيم') ||
          errMsg.includes('حساب الصالة') ||
          errMsg.includes('اشتراك المنصة') ||
          errMsg.includes('انتهت مدة الاشتراك') ||
          errMsg.includes('Platform-Owners must use') ||
          errMsg.includes('Only Platform-Owners');

        if (isGymLevelError) {
          toast.error(errMsg || 'عذراً، هذا الحساب غير مفعل أو مجمد حالياً. يرجى مراجعة إدارة المنصة.', { id: 'auth-error' });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          // Member-level or permission errors: just show the error message, NO logout
          toast.error(errMsg || 'عذراً، ليس لديك الصلاحية للقيام بهذا الإجراء.', { id: 'attendance-error' });
        }
      } else {
        toast.error(errMsg || 'حدث خطأ غير متوقع');
      }
    } else {
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
    return Promise.reject(error);
  }
);

export default api;
