import React, { useState, useEffect } from 'react';
import {
  GitBranch, Plus, CheckCircle2, Clock, XCircle, MapPin, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CyberCard from '../components/ui/CyberCard';
import CyberButton from '../components/ui/CyberButton';
import CyberInput from '../components/ui/CyberInput';
import Modal from '../components/ui/Modal';

// Separate axios instance for /gym routes (different base path from /user)
const gymApi = axios.create({
  baseURL: 'https://elegant-playfulness-production-f153.up.railway.app/gym',
  headers: { 'Content-Type': 'application/json' },
});
gymApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const STATUS_CONFIG = {
  ACTIVE:  { label: 'نشط',        icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  PENDING: { label: 'قيد المراجعة', icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30'   },
  INACTIVE:{ label: 'موقوف',       icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30'     },
};

export const Branches = () => {
  const [branches, setBranches]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [formData, setFormData]     = useState({ name: '', address: '' });
  const [formError, setFormError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch ─────────────────────────────────────────────────────────────
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await gymApi.get('/branches');
      if (res.data?.data?.branches) setBranches(res.data.data.branches);
    } catch {
      toast.error('تعذّر تحميل قائمة الفروع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  // ─── Submit request ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('يرجى إدخال اسم الفرع على الأقل.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await gymApi.post('/request-branch', {
        name: formData.name.trim(),
        address: formData.address.trim(),
      });
      const newBranch = res.data?.data?.branch;
      if (newBranch) setBranches(prev => [newBranch, ...prev]);
      toast.success('تم إرسال طلب إضافة الفرع بنجاح! سيتم مراجعته من إدارة المنصة.');
      setModalOpen(false);
      setFormData({ name: '', address: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل إرسال الطلب، يرجى المحاولة لاحقاً.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeBranches  = branches.filter(b => b.status === 'ACTIVE');
  const pendingBranches = branches.filter(b => b.status === 'PENDING');

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white neon-text-emerald">إدارة الفروع</h2>
          <p className="text-xs text-gray-400 mt-1">
            طلب إضافة فروع جديدة، ومتابعة الفروع النشطة وحالة الطلبات المعلقة.
          </p>
        </div>
        <CyberButton onClick={() => { setFormData({ name: '', address: '' }); setFormError(''); setModalOpen(true); }} variant="primary">
          <Plus size={16} />
          طلب فرع جديد
        </CyberButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">فروع نشطة</p>
            <p className="text-2xl font-black text-white">{activeBranches.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <Clock size={22} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">قيد المراجعة</p>
            <p className="text-2xl font-black text-white">{pendingBranches.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-500/5 border border-slate-500/20 rounded-xl p-4 col-span-2 sm:col-span-1">
          <GitBranch size={22} className="text-cyan-400 shrink-0" />
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">إجمالي الفروع</p>
            <p className="text-2xl font-black text-white">{branches.length}</p>
          </div>
        </div>
      </div>

      {/* Branches List */}
      <CyberCard title="قائمة الفروع">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-full animate-spin" />
          </div>
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <GitBranch size={48} className="text-gray-700" />
            <div>
              <p className="text-sm font-bold text-gray-400">لا توجد فروع مسجلة بعد</p>
              <p className="text-xs text-gray-600 mt-1">اضغط "طلب فرع جديد" لإضافة فرع وإرساله للمراجعة</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map(branch => {
              const cfg = STATUS_CONFIG[branch.status] || STATUS_CONFIG.PENDING;
              const Icon = cfg.icon;
              return (
                <div
                  key={branch.id}
                  className="relative flex flex-col gap-3 p-4 rounded-xl bg-slate-950/50 border border-[var(--color-cyber-border)] hover:border-emerald-500/30 transition-all duration-300 group"
                >
                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    <Icon size={11} />
                    {cfg.label}
                  </div>

                  {/* Branch Icon */}
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-4">
                    <GitBranch size={20} className="text-emerald-400" />
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">{branch.name}</h3>
                    {branch.address && (
                      <p className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                        <MapPin size={11} className="shrink-0" />
                        {branch.address}
                      </p>
                    )}
                  </div>

                  {/* PENDING explanation */}
                  {branch.status === 'PENDING' && (
                    <div className="flex items-start gap-2 text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2">
                      <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                      <span>طلبك قيد المراجعة من إدارة منصة Flexora. سيتم التفعيل خلال 24 ساعة.</span>
                    </div>
                  )}

                  {/* Creation date */}
                  <p className="text-[10px] text-gray-600 mt-auto">
                    أُضيف في: {new Date(branch.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CyberCard>

      {/* How it works */}
      <CyberCard title="كيف تعمل الفروع؟">
        <ol className="space-y-3 text-xs text-gray-400">
          {[
            { n: '1', t: 'طلب فرع جديد', d: 'اضغط "طلب فرع جديد"، أدخل الاسم والعنوان وأرسل الطلب.' },
            { n: '2', t: 'مراجعة الإدارة', d: 'تقوم إدارة منصة Flexora بمراجعة الطلب وتفعيل الفرع.' },
            { n: '3', t: 'إسناد الموظفين', d: 'بعد التفعيل، اذهب لصفحة الموظفين وأسند كل موظف لفرعه.' },
            { n: '4', t: 'عمليات مستقلة', d: 'كل فرع لديه سجلات حضور ومالية وأعضاء مستقلة تماماً.' },
          ].map(step => (
            <li key={step.n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{step.n}</span>
              <div>
                <p className="font-bold text-white">{step.t}</p>
                <p className="text-gray-500 mt-0.5">{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </CyberCard>

      {/* Request Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="طلب إضافة فرع جديد"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <CyberInput
            label="اسم الفرع (إلزامي)"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: فرع المعادي — صالة الرجال"
            required
          />
          <CyberInput
            label="عنوان الفرع (اختياري)"
            type="text"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="مثال: 15 شارع النصر، المعادي، القاهرة"
          />

          <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            <span>
              سيتم إرسال طلبك لإدارة منصة Flexora للمراجعة والاعتماد. بعد التفعيل ستظهر الفرع بحالة "نشط" ويمكنك إسناد الموظفين إليه.
            </span>
          </div>

          {formError && (
            <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
              <AlertTriangle size={13} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-cyber-border)]">
            <CyberButton type="button" onClick={() => setModalOpen(false)} variant="outline">إلغاء</CyberButton>
            <CyberButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </CyberButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Branches;
