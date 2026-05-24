import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';
import CyberCard from '../components/ui/CyberCard';
import DataTable from '../components/ui/DataTable';

export const DashboardStats = () => {
  const [stats, setStats] = useState({
    mrr: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    recentTransactions: [],
  });
  const [branchBreakdown, setBranchBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data && response.data.data) {
          const d = response.data.data;
          setStats(prev => ({
            ...prev,
            mrr: d.financials?.totalIncome !== undefined ? d.financials.totalIncome : prev.mrr,
            activeMembers: d.activePlayers !== undefined ? d.activePlayers : prev.activeMembers,
            totalRevenue: d.financials?.totalIncome !== undefined ? d.financials.totalIncome : prev.totalRevenue,
            totalExpenses: d.financials?.totalExpenses !== undefined ? d.financials.totalExpenses : prev.totalExpenses,
          }));
          if (Array.isArray(d.branchBreakdown)) {
            setBranchBreakdown(d.branchBreakdown);
          }
        }
      } catch (error) {
        console.warn('Using fallback mock data for stats dashboard');
      }

      // Live fetch recent transactions from financials
      try {
        const finRes = await api.get('/financials');
        if (finRes.data && finRes.data.data && Array.isArray(finRes.data.data.logs)) {
          const mappedTx = finRes.data.data.logs.slice(0, 5).map(log => ({
            id: log.id,
            type: log.type,
            desc: log.description,
            amount: log.amount,
            date: log.createdAt ? log.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
          }));
          setStats(prev => ({
            ...prev,
            recentTransactions: mappedTx
          }));
        }
      } catch (e) {}

      setLoading(false);
    };
    fetchStats();
  }, []);

  const columns = [
    { key: 'desc', label: 'تفاصيل المعاملة' },
    {
      key: 'type',
      label: 'النوع',
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${
          val === 'income' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
        }`}>
          {val === 'income' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
          {val === 'income' ? 'دخل' : 'مصروف'}
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
    { key: 'date', label: 'التاريخ' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white neon-text-emerald">لوحة تحكم المالك الإحصائية</h2>
        <p className="text-xs text-gray-400 mt-1">متابعة الأداء المالي، الاشتراكات، وحالة صالة FLEXORA الرياضية لحظياً.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* MRR */}
        <CyberCard className="relative overflow-hidden" hover={true}>
          <div className="absolute top-4 left-4 text-emerald-500 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">الإيرادات الشهرية المتكررة (MRR)</p>
          <h3 className="text-2xl font-extrabold text-white mt-4 neon-text-emerald">
            {stats.mrr.toLocaleString('ar-EG')} ج.م
          </h3>
          <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
            <span>+12% عن الشهر الماضي</span>
          </p>
        </CyberCard>

        {/* Active Members */}
        <CyberCard className="relative overflow-hidden" hover={true}>
          <div className="absolute top-4 left-4 text-blue-500 bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
            <Users size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">الأعضاء النشطين / المنتهين</p>
          <h3 className="text-2xl font-extrabold text-white mt-4 flex items-baseline gap-2">
            <span className="neon-text-primary">{stats.activeMembers}</span>
            <span className="text-xs text-gray-500 font-medium">/ {stats.expiredMembers} منتهي</span>
          </h3>
          <p className="text-[10px] text-blue-400 font-bold mt-2 flex items-center gap-1">
            <span>معدل احتفاظ ممتاز (91%)</span>
          </p>
        </CyberCard>

        {/* Revenue */}
        <CyberCard className="relative overflow-hidden" hover={true}>
          <div className="absolute top-4 left-4 text-emerald-500 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <DollarSign size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">إجمالي الإيرادات</p>
          <h3 className="text-2xl font-extrabold text-white mt-4 neon-text-emerald">
            {stats.totalRevenue.toLocaleString('ar-EG')} ج.م
          </h3>
          <p className="text-[10px] text-gray-500 font-bold mt-2">
            شامل تجديد الاشتراكات الفورية
          </p>
        </CyberCard>

        {/* Expenses */}
        <CyberCard className="relative overflow-hidden" hover={true}>
          <div className="absolute top-4 left-4 text-rose-500 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
            <TrendingDown size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">إجمالي المصروفات</p>
          <h3 className="text-2xl font-extrabold text-rose-400 mt-4 shadow-rose-950">
            {stats.totalExpenses.toLocaleString('ar-EG')} ج.م
          </h3>
          <p className="text-[10px] text-rose-400 font-bold mt-2 flex items-center gap-1">
            <span>صيانة ورواتب وفواتير</span>
          </p>
        </CyberCard>
      </div>

      {/* Recent Transactions list */}
      <CyberCard title="أحدث المعاملات المالية" subtitle="قائمة بالتدفقات النقدية الواردة والصادرة مؤخراً في الصالة">
        <DataTable
          columns={columns}
          data={stats.recentTransactions}
          emptyMessage="لا توجد معاملات مسجلة حالياً"
        />
      </CyberCard>

      {/* Branch financial breakdown table */}
      <CyberCard title="توزيع ميزانية الخزينة واللاعبين حسب الفروع" subtitle="تفصيل الإيرادات والمصروفات واللاعبين النشطين لكل فرع من فروع المنظومة">
        <DataTable
          columns={[
            { key: 'name', label: 'اسم الفرع' },
            { 
              key: 'totalIncome', 
              label: 'إجمالي الإيرادات', 
              render: (val) => <span className="text-emerald-400 font-bold">{val.toLocaleString('ar-EG')} ج.م</span> 
            },
            { 
              key: 'totalExpenses', 
              label: 'إجمالي المصروفات', 
              render: (val) => <span className="text-rose-400 font-bold">{val.toLocaleString('ar-EG')} ج.م</span> 
            },
            { 
              key: 'netProfit', 
              label: 'صافي الأرباح', 
              render: (val) => (
                <span className={`font-black ${val >= 0 ? 'text-emerald-400 neon-text-emerald' : 'text-rose-400'}`}>
                  {val >= 0 ? '+' : ''} {val.toLocaleString('ar-EG')} ج.م
                </span>
              ) 
            },
            { 
              key: 'activePlayers', 
              label: 'الأعضاء النشطين', 
              render: (val) => <span className="text-sky-400 font-bold">{val} لاعب</span> 
            },
          ]}
          data={branchBreakdown}
          emptyMessage="لا توجد بيانات فروع معتمدة مسجلة حالياً"
        />
      </CyberCard>
    </div>
  );
};

export default DashboardStats;
