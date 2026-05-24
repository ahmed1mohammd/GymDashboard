import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, Dumbbell } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CyberCard from '../components/ui/CyberCard';
import CyberButton from '../components/ui/CyberButton';
import CyberInput from '../components/ui/CyberInput';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';

export const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    durationInDays: '',
    price: '',
    type: 'Gym',
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/packages');
      if (response.data && response.data.data && Array.isArray(response.data.data.packages)) {
        setPackages(response.data.data.packages);
      }
    } catch (error) {
      console.warn('API error, using local mock state for packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormData({ name: '', durationInDays: '', price: '', type: 'Gym' });
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      durationInDays: pkg.durationInDays,
      price: pkg.price,
      type: pkg.type,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.durationInDays || !formData.price) {
      toast.error('يرجى تعبئة جميع الحقول بشكل صحيح');
      return;
    }

    const payload = {
      name: formData.name,
      durationInDays: parseInt(formData.durationInDays),
      price: parseFloat(formData.price),
      type: formData.type,
    };

    try {
      if (editingPackage) {
        // PUT update
        await api.put(`/packages/${editingPackage.id}`, payload);
        
        // Mock update locally
        setPackages(packages.map(p => p.id === editingPackage.id ? { ...p, ...payload } : p));
        toast.success('تم تحديث الباقة بنجاح');
      } else {
        // POST create
        const response = await api.post('/packages', payload);
        const newPkg = response.data?.data?.package || response.data?.package || { id: Date.now(), ...payload };
        setPackages([...packages, newPkg]);
        toast.success('تمت إضافة الباقة بنجاح');
      }
      setModalOpen(false);
    } catch (error) {
      // Interceptor will trigger error toast if actual API fails, fallback simulation:
      const fallbackPkg = editingPackage 
        ? packages.map(p => p.id === editingPackage.id ? { ...p, ...payload } : p)
        : [...packages, { id: Date.now(), ...payload }];
      setPackages(fallbackPkg);
      toast.success(editingPackage ? 'تم التحديث محلياً' : 'تمت الإضافة محلياً');
      setModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    try {
      await api.delete(`/packages/${id}`);
      setPackages(packages.filter((p) => p.id !== id));
      toast.success('تم حذف الباقة بنجاح');
    } catch (error) {
      setPackages(packages.filter((p) => p.id !== id));
      toast.success('تم الحذف محلياً');
    }
  };

  const columns = [
    { key: 'name', label: 'اسم الباقة' },
    {
      key: 'type',
      label: 'نوع الباقة',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          val === 'Gym' ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'
        }`}>
          {val === 'Gym' ? <ShieldCheck size={12} /> : <Dumbbell size={12} />}
          {val === 'Gym' ? 'اشتراك صالة' : 'تدريب شخصي PT'}
        </span>
      ),
    },
    { key: 'durationInDays', label: 'المدة (بالأيام)', render: (val) => `${val} يوم` },
    { key: 'price', label: 'السعر', render: (val) => <span className="font-bold text-white">{val} ج.م</span> },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white neon-text-emerald">الباقات والاشتراكات</h2>
          <p className="text-xs text-gray-400 mt-1">إنشاء، تعديل، وإدارة الباقات الرياضية واشتراكات التدريب الخاص (PT) بالصالة.</p>
        </div>
        <CyberButton onClick={handleOpenAdd} variant="primary">
          <Plus size={16} />
          إضافة باقة جديدة
        </CyberButton>
      </div>

      {/* Packages Table Container */}
      <CyberCard title="باقات صالة FLEXORA الحالية">
        <DataTable
          columns={columns}
          data={packages}
          emptyMessage="لا توجد باقات مدخلة حالياً، اضغط إضافة باقة بالأعلى لبدء الإدارة."
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
        title={editingPackage ? 'تعديل بيانات الباقة' : 'إضافة باقة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <CyberInput
            label="اسم الباقة"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: الباقة السنوية الذهبية"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <CyberInput
              label="المدة (بالأيام)"
              type="number"
              value={formData.durationInDays}
              onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
              placeholder="مثال: 30"
              required
            />
            <CyberInput
              label="السعر (ج.م)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="مثال: 500"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-400 mr-1">نوع الاشتراك</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-neon-emerald)] transition-all duration-300"
            >
              <option value="Gym">اشتراك صالة رياضية عامة (Gym)</option>
              <option value="PT">تدريب شخصي خاص مع مدرب (PT)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-cyber-border)]">
            <CyberButton type="button" onClick={() => setModalOpen(false)} variant="outline">
              إلغاء
            </CyberButton>
            <CyberButton type="submit" variant="primary">
              {editingPackage ? 'حفظ التعديلات' : 'إضافة الباقة'}
            </CyberButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Packages;
