import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, User, DollarSign, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CyberCard from '../components/ui/CyberCard';
import CyberButton from '../components/ui/CyberButton';
import CyberInput from '../components/ui/CyberInput';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';

export const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [gymQuota, setGymQuota] = useState(null); // { maxReceptionists, maxCoaches }
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Coach',
    baseSalary: '',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('/staff');
      if (response.data && response.data.data && Array.isArray(response.data.data.staff)) {
        setStaffList(response.data.data.staff);
      }
    } catch (error) {
      console.warn('API error fetching staff list');
    } finally {
      setLoading(false);
    }
  };

  // Fetch gym quota info so we can show owner how many staff slots they have
  const fetchGymQuota = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      const gymData = res.data?.data;
      if (gymData) {
        setGymQuota({
          maxReceptionists: gymData.maxReceptionists,
          maxCoaches: gymData.maxCoaches,
        });
      }
    } catch (err) {
      // quota info is optional, ignore errors
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchGymQuota();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', role: 'Coach', baseSalary: '' });
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
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.email || (!editingStaff && !formData.password) || !formData.baseSalary) {
      toast.error('يرجى تعبئة الحقول بشكل صحيح');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      baseSalary: parseFloat(formData.baseSalary),
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, payload);
        setStaffList(staffList.map(s => s.id === editingStaff.id ? { ...s, ...payload } : s));
        toast.success('تم تحديث بيانات الموظف بنجاح');
        setModalOpen(false);
      } else {
        // POST create — do NOT fallback locally if API fails (quota errors must be shown)
        const response = await api.post('/staff', payload);
        const newStaff = response.data?.data?.staff || response.data?.staff || { id: Date.now(), ...payload };
        setStaffList([...staffList, newStaff]);
        toast.success('تم تسجيل الموظف الجديد بنجاح');
        setModalOpen(false);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات الموظف';
      setFormError(msg);
      toast.error(msg);
      // Do NOT close modal — let the user read the error
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await api.delete(`/staff/${id}`);
      setStaffList(staffList.filter((s) => s.id !== id));
      toast.success('تم حذف الموظف بنجاح');
    } catch (error) {
      setStaffList(staffList.filter((s) => s.id !== id));
      toast.success('تم الحذف محلياً');
    }
  };

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
          {val === 'Coach' ? 'مدرب كابتن' : 'موظف استقبال'}
        </span>
      ),
    },
    {
      key: 'baseSalary',
      label: 'الراتب المالي / العمولة',
      render: (val, row) => (
        <span className="font-bold text-white flex flex-col items-start gap-0.5 justify-start text-xs">
          <span className="flex items-center gap-0.5">
            <DollarSign size={13} className="text-emerald-500" />
            {val} ج.م
          </span>
          <span className="text-[10px] text-gray-500">
            {row.role === 'Coach' ? 'عمولة لكل لاعب متدرب' : 'مرتب شهري ثابت'}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white neon-text-emerald">إدارة طاقم العمل والموظفين</h2>
          <p className="text-xs text-gray-400 mt-1">تسجيل المدربين وموظفي الاستقبال، تحديد المرتبات الأساسية وتفويض الصلاحيات.</p>
        </div>
        <CyberButton onClick={handleOpenAdd} variant="primary">
          <Plus size={16} />
          إضافة موظف جديد
        </CyberButton>
      </div>

      {/* Quota Info Banner */}
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
        <DataTable
          columns={columns}
          data={staffList}
          emptyMessage="لا يوجد موظفين مسجلين حالياً، اضغط إضافة موظف جديد لبدء ملء طاقم العمل."
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <CyberInput
            label="الاسم بالكامل"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: كابتن أحمد محمود"
            required
          />

          <CyberInput
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@flexora.com"
            required
          />

          <CyberInput
            label={editingStaff ? 'كلمة مرور جديدة (اختياري عند التحديث)' : 'كلمة المرور'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required={!editingStaff}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-gray-400 mr-1">الدور والصلاحية</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-neon-emerald)] transition-all duration-300"
              >
                <option value="Coach">مدرب رياضي (Coach)</option>
                <option value="Receptionist">موظف استقبال (Receptionist)</option>
              </select>
            </div>

            <CyberInput
              label={formData.role === 'Coach' ? "عمولة المدرب الشخصي لكل لاعب (PT)" : "الراتب الأساسي الثابت (ج.م)"}
              type="number"
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
              placeholder={formData.role === 'Coach' ? "مثال: 500" : "مثال: 3000"}
              required
            />
          </div>

          {/* Quota Error Display */}
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
            <CyberButton type="submit" variant="primary">
              {editingStaff ? 'حفظ البيانات الجديدة' : 'تسجيل الموظف'}
            </CyberButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
