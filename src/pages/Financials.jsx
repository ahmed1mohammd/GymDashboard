import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CyberCard from '../components/ui/CyberCard';
import CyberButton from '../components/ui/CyberButton';
import CyberInput from '../components/ui/CyberInput';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';

export const Financials = () => {
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'maintenance',
    amount: '',
    description: '',
  });

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/financials');
      if (response.data && response.data.data && Array.isArray(response.data.data.logs)) {
        const mapped = response.data.data.logs.map(log => ({
          ...log,
          date: log.createdAt ? log.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        setFinancials(mapped);
      }
    } catch (error) {
      console.warn('API error, using local mock state for ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ category: 'maintenance', amount: '', description: '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast.error('يرجى كتابة المبلغ والوصف بدقة');
      return;
    }

    const payload = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      type: 'expense', // Forced as manual addition endpoints are strictly for Expenses
    };

    try {
      const response = await api.post('/financials', payload);
      const expenseObj = response.data?.data?.expense || response.data?.expense;
      const newLedger = {
        id: expenseObj?.id || Date.now(),
        ...payload,
        date: expenseObj?.createdAt ? expenseObj.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      };
      setFinancials(prev => [newLedger, ...prev]);
      toast.success('تم تسجيل المصروف اليدوي بنجاح');
      setModalOpen(false);
    } catch (error) {
      // Fallback simulation:
      const newLedger = {
        id: Date.now(),
        ...payload,
        date: new Date().toISOString().split('T')[0],
      };
      setFinancials(prev => [newLedger, ...prev]);
      toast.success('تمت الإضافة محلياً');
      setModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد إزالة هذا القيد المالي؟')) return;
    try {
      await api.delete(`/financials/${id}`);
      setFinancials(financials.filter((f) => f.id !== id));
      toast.success('تم مسح القيد المالي من الدفتر');
    } catch (error) {
      setFinancials(financials.filter((f) => f.id !== id));
      toast.success('تم الحذف محلياً');
    }
  };

  // Calculated aggregates
  const totalIncome = financials
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = financials
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const categoryTranslations = {
    subscription: 'اشتراك عضوية',
    pt: 'تدريب خاص PT',
    utility: 'فواتير ومرافق',
    maintenance: 'صيانة ومعدات',
    salary: 'رواتب وأجور',
    other: 'مصاريف أخرى',
  };

  const columns = [
    { key: 'description', label: 'التفاصيل والوصف' },
    {
      key: 'category',
      label: 'التصنيف',
      render: (val) => categoryTranslations[val] || val,
    },
    {
      key: 'type',
      label: 'النوع',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          val === 'income' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
        }`}>
          {val === 'income' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
          {val === 'income' ? 'إيرادات' : 'مصروفات'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (val, row) => (
        <span className={`font-bold ${row.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {row.type === 'income' ? '+' : '-'} {val} ج.م
        </span>
      ),
    },
    { key: 'date', label: 'تاريخ القيد' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white neon-text-emerald">المالية والحسابات العامة</h2>
          <p className="text-xs text-gray-400 mt-1">تتبع الدخل التلقائي من اشتراكات الأعضاء وتسجيل بنود المصروفات العامة يدوياً.</p>
        </div>
        <CyberButton onClick={handleOpenAdd} variant="danger">
          <Plus size={16} />
          تسجيل مصروف يدوياً
        </CyberButton>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <CyberCard className="relative overflow-hidden">
          <div className="absolute top-4 left-4 text-emerald-500 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">إجمالي الإيرادات (الدخل التلقائي)</p>
          <h3 className="text-3xl font-extrabold text-white mt-4 neon-text-emerald">
            {totalIncome.toLocaleString('ar-EG')} ج.م
          </h3>
          <p className="text-[10px] text-gray-500 font-bold mt-2">
            تم توليدها تلقائياً من تسجيل المشتركين
          </p>
        </CyberCard>

        {/* Expenses Card */}
        <CyberCard className="relative overflow-hidden">
          <div className="absolute top-4 left-4 text-rose-500 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
            <TrendingDown size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">إجمالي المصروفات العامة</p>
          <h3 className="text-3xl font-extrabold text-rose-400 mt-4 shadow-rose-950">
            {totalExpense.toLocaleString('ar-EG')} ج.م
          </h3>
          <p className="text-[10px] text-rose-400 font-bold mt-2">
            شملت الصيانة والمرافق والرواتب
          </p>
        </CyberCard>

        {/* Balance Card */}
        <CyberCard className="relative overflow-hidden">
          <div className="absolute top-4 left-4 text-blue-500 bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
            <DollarSign size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">صافي الأرباح (الرصيد المتبقي)</p>
          <h3 className={`text-3xl font-extrabold mt-4 ${netBalance >= 0 ? 'text-emerald-400 neon-text-emerald' : 'text-rose-400 shadow-rose-950'}`}>
            {netBalance.toLocaleString('ar-EG')} ج.م
          </h3>
          <p className="text-[10px] text-blue-400 font-bold mt-2">
            مؤشر كفاءة التشغيل المالي الحالي
          </p>
        </CyberCard>
      </div>

      {/* Ledger DataTable */}
      <CyberCard title="دفتر الحسابات والقيود المالية">
        <DataTable
          columns={columns}
          data={financials}
          emptyMessage="دفتر الحسابات فارغ حالياً."
          actions={(row) => (
            row.type === 'expense' ? (
              <CyberButton onClick={() => handleDelete(row.id)} variant="danger" size="sm">
                <Trash2 size={12} />
                حذف
              </CyberButton>
            ) : (
              <span className="text-[10px] font-bold text-gray-500 select-none ml-2">دخل تلقائي</span>
            )
          )}
        />
      </CyberCard>

      {/* Manual Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="تسجيل مصروف تشغيلي يدوي"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-400 mr-1">نوع فئة المصروف</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-neon-emerald)] transition-all duration-300"
            >
              <option value="maintenance">صيانة وأجهزة رياضية</option>
              <option value="salary">مرتبات وأجور إضافية</option>
              <option value="utility">فواتير مرافق (كهرباء، مياه، غاز)</option>
              <option value="other">مصاريف عامة أخرى</option>
            </select>
          </div>

          <CyberInput
            label="المبلغ المسحوب (ج.م)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="مثال: 750"
            required
          />

          <CyberInput
            label="وصف المعاملة"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="مثال: صيانة جهاز الجري بالصالة"
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-cyber-border)]">
            <CyberButton type="button" onClick={() => setModalOpen(false)} variant="outline">
              إلغاء
            </CyberButton>
            <CyberButton type="submit" variant="danger">
              تسجيل المصروف
            </CyberButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Financials;
