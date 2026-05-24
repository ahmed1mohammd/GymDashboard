import React, { useState, useEffect } from 'react';
import { Award, Users, DollarSign, Dumbbell } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CyberCard from '../components/ui/CyberCard';
import DataTable from '../components/ui/DataTable';

export const CoachDashboard = () => {
  const [coachData, setCoachData] = useState({
    totalPlayers: 0,
    commissionPerPlayer: 0,
    baseSalary: 0,
    players: [],
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const response = await api.get('/coach/dashboard');
        if (response.data && response.data.data) {
          const d = response.data.data;
          const mappedPlayers = Array.isArray(d.privateClients) 
            ? d.privateClients.map((c) => ({
                id: c.id,
                name: c.name,
                packageName: c.packageName,
                startDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '—',
                endDate: c.subscriptionEnd ? new Date(c.subscriptionEnd).toLocaleDateString('ar-EG') : '—',
                phoneNumber: c.phoneNumber,
                attendedDays: c.attendedDays,
                absentDays: c.absentDays,
                commitmentRate: c.commitmentRate,
                status: c.status === 'active' ? 'نشط' : 'غير نشط'
              }))
            : [];
          
          setCoachData({
            totalPlayers: d.totalClientsCount !== undefined ? d.totalClientsCount : 0,
            commissionPerPlayer: d.baseSalary !== undefined ? d.baseSalary : (user?.baseSalary || 0), 
            baseSalary: d.baseSalary !== undefined ? d.baseSalary : (user?.baseSalary || 0),
            players: mappedPlayers
          });
        }
      } catch (error) {
        console.warn('Using mock data for coach dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCoachData();
  }, [user]);

  // Commission-only salary: assigned players * commission per player (stored in baseSalary)
  const totalCalculatedSalary = coachData.totalPlayers * coachData.commissionPerPlayer;

  const columns = [
    { key: 'name', label: 'اسم اللاعب الكامـل' },
    { key: 'packageName', label: 'الباقة المشترك بها' },
    { key: 'startDate', label: 'تاريخ بداية الاشتراك' },
    { key: 'endDate', label: 'تاريخ انتهاء الاشتراك' },
    { key: 'phoneNumber', label: 'رقم الموبايل / الهاتف', render: (val) => <span className="tracking-wider text-xs font-mono">{val}</span> },
    { key: 'attendedDays', label: 'أيام الحضور', render: (val) => <span className="text-emerald-400 font-bold">✔️ {val || 0} يوم</span> },
    { key: 'absentDays', label: 'أيام الغياب', render: (val) => <span className="text-rose-400 font-bold">❌ {val || 0} يوم</span> },
    { key: 'commitmentRate', label: 'نسبة الالتزام %', render: (val) => <span className="text-sky-400 font-bold">📊 {val || 0}%</span> },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white neon-text-emerald">لوحة تحكم المدرب</h2>
        <p className="text-xs text-gray-400 mt-1">متابعة اللاعبين المشتركين معك، إحصائيات التدريب، وحساب الراتب الإجمالي والعمولات.</p>
      </div>

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Assigned Players */}
        <CyberCard className="relative overflow-hidden" hover={true}>
          <div className="absolute top-4 left-4 text-emerald-500 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <Users size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">إجمالي اللاعبين المسندين إليك</p>
          <h3 className="text-3xl font-extrabold text-white mt-4 neon-text-emerald">
            {coachData.totalPlayers} لاعب
          </h3>
          <p className="text-[10px] text-gray-500 font-bold mt-2">
            لاعبين نشطين يتدربون تحت إشرافك المباشر
          </p>
        </CyberCard>

        {/* Commission Rate */}
        <CyberCard className="relative overflow-hidden" hover={true}>
          <div className="absolute top-4 left-4 text-blue-500 bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
            <Award size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">عمولة الكابتن لكل لاعب (PT)</p>
          <h3 className="text-3xl font-extrabold text-white mt-4 neon-text-primary">
            {coachData.commissionPerPlayer} ج.م
          </h3>
          <p className="text-[10px] text-blue-400 font-bold mt-2">
            عمولة كاملة مخصصة لك عن كل لاعب مسجل تحت تدريبك
          </p>
        </CyberCard>

        {/* Total calculated salary */}
        <CyberCard className="relative overflow-hidden" hover={true}>
          <div className="absolute top-4 left-4 text-purple-500 bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
            <DollarSign size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400">إجمالي مستحقات الكابتن لشهر</p>
          <h3 className="text-3xl font-extrabold text-white mt-4 text-purple-400 shadow-purple-950">
            {totalCalculatedSalary.toLocaleString('ar-EG')} ج.م
          </h3>
          <p className="text-[10px] text-purple-400 font-bold mt-2">
            مستحقاتك بالكامل: عمولة الكابتن ({coachData.commissionPerPlayer} ج.م) × عدد اللاعبين ({coachData.totalPlayers})
          </p>
        </CyberCard>
      </div>

      {/* Assigned Players List */}
      <CyberCard title="قائمة اللاعبين المسندين إليك" subtitle="متابعة الأعضاء المسندين لتدريبك الشخصي حالياً">
        <DataTable
          columns={columns}
          data={coachData.players}
          emptyMessage="لا يوجد لاعبين مسندين إليك حالياً"
        />
      </CyberCard>
    </div>
  );
};

export default CoachDashboard;
