import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, User, DollarSign, AlertTriangle, GitBranch, Filter } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CyberCard from '../components/ui/CyberCard';
import CyberButton from '../components/ui/CyberButton';
import CyberInput from '../components/ui/CyberInput';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';

const SELECT_CLASS = 'w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-neon-emerald)] transition-all duration-300';

export const Staff = () => {
  const [staffList, setStaffList]     = useState([]);
  const [branches, setBranches]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [gymQuota, setGymQuota]       = useState(null);
  const [formError, setFormError]     = useState('');
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterRole, setFilterRole]   = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Coach',
    baseSalary: '',
    branchId: '',
  });

  // ─── Data Fetching ────────────────────────────────────────────────────
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff');
      if (res.data?.data?.staff) setStaffList(res.data.data.staff);
    } catch {
      console.warn('API error fetching staff list');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/gym/branches');
      if (res.data?.data?.branches) {
        // Only show ACTIVE branches in the dropdown
        setBranches(res.data.data.branches.filter(b => b.status === 'ACTIVE'));
      }
    } catch {
      console.warn('Could not load branches');
    }
  };

  const fetchGymQuota = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      const d = res.data?.data;
      if (d) setGymQuota({ maxReceptionists: d.maxReceptionists, maxCoaches: d.maxCoaches });
    } catch { /* optional */ }
  };

  useEffect(() => {
    fetchStaff();
    fetchBranches();
    fetchGymQuota();
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────
  const getBranchName = (branchId) => {
    if (!branchId) return 'الفرع الرئيسي';
    const b = branches.find(b => b.id === branchId);
    return b ? b.name : 'فرع غير محدد';
  };

  // ─── Modal Handlers ───────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', role: 'Coach', baseSalary: '', branchId: branches[0]?.id || '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '',
      role: staff.role,
      baseSalary: staff.baseSalary,
      branchId: staff.branchId || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  // ─── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || (!editingStaff && !formData.password) || !formData.baseSalary) {
      toast.error('يرجى تعبئة جميع الحقول الإلزامية');
      return;
    }
    if (!formData.branchId) {
      setFormError('يرجى تحديد الفرع التابع له الموظف. هذا الحقل إلزامي.');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      baseSalary: parseFloat(formData.baseSalary),
      branchId: formData.branchId,
    };
    if (formData.password) payload.password = formData.password;

    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, payload);
        setStaffList(staffList.map(s => s.id === editingStaff.id
          ? { ...s, ...payload, branch: branches.find(b => b.id === payload.branchId) }
          : s
        ));
        toast.success('تم تحديث بيانات الموظف بنجاح');
        setModalOpen(false);
      } else {
        const res = await api.post('/staff', payload);
        const newStaff = res.data?.data?.staff || { id: Date.now(), ...payload };
        // Attach branch name locally for immediate display
        newStaff.branch = branches.find(b => b.id === payload.branchId);
        setStaffList([...staffList, newStaff]);
        toast.success('تم تسجيل الموظف الجديد بنجاح');
        setModalOpen(false);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات الموظف';
      setFormError(msg);
      toast.error(msg);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await api.delete(`/staff/${id}`);
      setStaffList(staffList.filter(s => s.id !== id));
      toast.success('تم حذف الموظف بنجاح');
    } catch (error) {
      const msg = error.response?.data?.message || 'حدث خطأ أثناء الحذف';
      toast.error(msg);
    }
  };

  // ─── Filtering ────────────────────────────────────────────────────────
  const filteredStaff = staffList.filter(s => {
    const matchRole   = filterRole   === 'All' || s.role === filterRole;
    const matchBranch = filterBranch === 'All' || s.branchId === filterBranch;
    return matchRole && matchBranch;
  });

  // ─── Table Columns ────────────────────────────────────────────────────
  const columns = [
    { key: 'name', label: 'الاسم الكامـل' },
    { key: 'email', label: 'البريد الإلكتروني' },
    {
      key: 'role',
      label: 'الدور الوظيفي',
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
          val === 'Coach' ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10'
        }`}>
          {val === 'Coach' ? <Shield size={12} /> : <User size={12} />}
          {val === 'Coach' ? 'مدرب رياضي' : 'موظف استقبال'}
        </span>
      ),
    },
    {
      key: 'branchId',
      label: 'الفرع',
      render: (val, row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
          <GitBranch size={12} className="shrink-0" />
          {row.branch?.name || getBranchName(val)}
        </span>
      ),
    },
    {
      key: 'baseSalary',
      label: 'الراتب / العمولة',
      render: (val, row) => (
        <span className="font-bold text-white flex flex-col items-start gap-0.5 text-xs">
          <span className="flex items-center gap-0.5">
            <DollarSign size={13} className="text-emerald-500" />
            {val} ج.م
          </span>
          <span className="text-[10px] text-gray-500">
            {row.role === 'Coach' ? 'عمولة / لاعب' : 'مرتب ثابت'}
          </span>
        </span>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white neon-text-emerald">إدارة طاقم العمل والموظفين</h2>
          <p className="text-xs text-gray-400 mt-1">تسجيل المدربين وموظفي الاستقبال، تحديد مقار العمل بالفروع، والمرتبات والصلاحيات.</p>
        </div>
        <CyberButton onClick={handleOpenAdd} variant="primary">
          <Plus size={16} />
          إضافة موظف جديد
        </CyberButton>
      </div>

      {/* Quota Banners */}
      {gymQuota && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
            <Shield size={18} className="text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">مدربون مسجلون</p>
              <p className="text-sm font-bold text-white">
                {staffList.filter(s => s.role === 'Coach').length}
                <span className="text-gray-500 font-normal"> / {gymQuota.maxCoaches ?? '—'} حد أقصى</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
            <User size={18} className="text-purple-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">موظفو الاستقبال</p>
              <p className="text-sm font-bold text-white">
                {staffList.filter(s => s.role === 'Receptionist').length}
                <span className="text-gray-500 font-normal"> / {gymQuota.maxReceptionists ?? '—'} حد أقصى</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Staff DataTable */}
      <CyberCard title="طاقم العمل الحالي">

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 bg-slate-950/40 border border-cyan-500/10 rounded-xl p-3">
          {/* Role Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
              <Filter size={11} /> تصفية حسب الدور
            </label>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="All">الكل (مدربون + استقبال)</option>
              <option value="Coach">مدربون رياضيون فقط</option>
              <option value="Receptionist">موظفو الاستقبال فقط</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
              <GitBranch size={11} /> تصفية حسب الفرع
            </label>
            <select
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="All">كل الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredStaff}
          emptyMessage="لا يوجد موظفين مسجلين، اضغط إضافة موظف جديد لبدء ملء طاقم العمل."
          actions={(row) => (
            <>
              <CyberButton onClick={() => handleOpenEdit(row)} variant="secondary" size="sm">
                <Edit2 size={12} />
                تعديل
              </CyberButton>
              <CyberButton onClick={() => handleDelete(row.id)} variant="danger" size="sm">
                <Trash2 size={12} />
                حذف
              </CyberButton>
            </>
          )}
        />
      </CyberCard>

      {/* CRUD Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStaff ? 'تعديل بيانات الموظف' : 'تسجيل موظف جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <CyberInput
            label="الاسم بالكامل"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: كابتن أحمد محمود"
            required
          />

          <CyberInput
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@flexora.com"
            required
          />

          <CyberInput
            label={editingStaff ? 'كلمة مرور جديدة (اختياري عند التحديث)' : 'كلمة المرور'}
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required={!editingStaff}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">الدور والصلاحية</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="Coach">مدرب رياضي (Coach)</option>
                <option value="Receptionist">موظف استقبال (Receptionist)</option>
              </select>
            </div>

            {/* Salary */}
            <CyberInput
              label={formData.role === 'Coach' ? 'عمولة / لاعب (PT) ج.م' : 'الراتب الأساسي الثابت ج.م'}
              type="number"
              value={formData.baseSalary}
              onChange={e => setFormData({ ...formData, baseSalary: e.target.value })}
              placeholder={formData.role === 'Coach' ? 'مثال: 500' : 'مثال: 3000'}
              required
            />
          </div>

          {/* Branch — Required */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <GitBranch size={13} className="text-emerald-400" />
              الفرع التابع له الموظف
              <span className="text-rose-400 text-[10px] font-bold">(إلزامي)</span>
            </label>
            {branches.length === 0 ? (
              <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <AlertTriangle size={13} className="shrink-0" />
                لا توجد فروع نشطة حالياً. يرجى إضافة فرع من إدارة المنصة أولاً.
              </div>
            ) : (
              <select
                value={formData.branchId}
                onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                className={SELECT_CLASS + (formData.branchId ? '' : ' border-amber-500/50')}
                required
              >
                <option value="">— اختر الفرع —</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} {b.address ? `(${b.address})` : ''}</option>
                ))}
              </select>
            )}
          </div>

          {/* Error Banner */}
          {formError && (
            <div className="flex items-start gap-2 text-xs text-rose-300 font-medium bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-cyber-border)]">
            <CyberButton type="button" onClick={() => setModalOpen(false)} variant="outline">
              إلغاء
            </CyberButton>
            <CyberButton type="submit" variant="primary" disabled={branches.length === 0}>
              {editingStaff ? 'حفظ البيانات الجديدة' : 'تسجيل الموظف'}
            </CyberButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
