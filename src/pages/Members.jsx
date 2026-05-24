import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, QrCode, Phone, User, CheckCircle2, AlertTriangle, ShieldAlert, Download } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import CyberCard from '../components/ui/CyberCard';
import CyberButton from '../components/ui/CyberButton';
import CyberInput from '../components/ui/CyberInput';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';

// Custom SVG WhatsApp icon matching design guidelines
const WhatsAppIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.535 0 10.04-4.5 10.04-10.042.002-2.684-1.038-5.207-2.93-7.1-1.894-1.892-4.41-2.93-7.098-2.93-5.543 0-10.046 4.502-10.047 10.045-.001 1.777.464 3.51 1.347 5.048l-.995 3.637 3.73-.978zm11.567-5.282c-.313-.156-1.854-.915-2.131-1.016-.277-.1-.479-.15-.68.15-.2.3-.777.915-.953 1.116-.176.2-.352.226-.665.07-1.157-.58-1.854-.93-2.585-2.19-.19-.323.19-.3.543-.997.106-.2.053-.376-.026-.531-.079-.156-.68-1.637-.93-2.247-.244-.588-.492-.51-.68-.52h-.581c-.2-.001-.527.075-.803.376-.277.301-1.055 1.03-1.055 2.516 0 1.486 1.08 2.922 1.23 3.122.15.2 2.125 3.245 5.148 4.54.718.309 1.28.494 1.718.633.721.23 1.378.197 1.898.12.58-.087 1.855-.758 2.116-1.492.26-.734.26-1.362.18-1.492-.08-.13-.298-.207-.61-.364z"/>
  </svg>
);

export const Members = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [coaches, setCoaches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeQrCode, setActiveQrCode] = useState('');
  const [activeMemberName, setActiveMemberName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    packageId: '',
    trainingType: 'General',
    coachId: 'none',
    paymentMethod: 'cash',
    status: 'active',
    gender: 'Male',
    branchId: '',
  });

  // Advanced Filtration states
  const [filterGender, setFilterGender] = useState('All');
  const [filterPackage, setFilterPackage] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState([]);

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const membersRes = await api.get('/members');
      if (membersRes.data && membersRes.data.data && Array.isArray(membersRes.data.data.members)) {
        const mapped = membersRes.data.data.members.map(m => ({
          ...m,
          packageName: m.activePackage?.name || 'باقة مخصصة',
          coachName: m.coach?.name || 'بدون مدرب',
          packageId: m.activePackageId || '',
        }));
        setMembers(mapped);
      }
    } catch (error) {
      console.warn('API fetch failed, using local mock data for CRM');
    }
    
    try {
      const pkgsRes = await api.get('/packages');
      if (pkgsRes.data && pkgsRes.data.data && Array.isArray(pkgsRes.data.data.packages)) {
        setPackages(pkgsRes.data.data.packages);
      }
    } catch (error) {}

    try {
      const staffRes = await api.get('/staff');
      if (staffRes.data && staffRes.data.data && Array.isArray(staffRes.data.data.staff)) {
        setCoaches(staffRes.data.data.staff.filter(s => s.role && s.role.toLowerCase() === 'coach'));
      }
    } catch (error) {}

    try {
      const branchesRes = await api.get('/gym/branches', { baseURL: api.defaults.baseURL.replace('/user', '') });
      if (branchesRes.data && branchesRes.data.data && Array.isArray(branchesRes.data.data.branches)) {
        setBranches(branchesRes.data.data.branches.filter(b => b.status === 'ACTIVE'));
      }
    } catch (error) {}

    setLoading(false);
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      phoneNumber: '',
      packageId: packages[0]?.id || '',
      trainingType: 'General',
      coachId: '',
      paymentMethod: 'cash',
      status: 'active',
      gender: 'Male',
      branchId: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      phoneNumber: m.phoneNumber,
      packageId: m.packageId || '',
      trainingType: m.trainingType || (m.coachId && m.coachId !== 'none' && m.coachId !== null ? 'Private' : 'General'),
      coachId: m.coachId === 'none' || m.coachId === null ? '' : m.coachId,
      paymentMethod: m.paymentMethod || 'cash',
      status: m.status,
      gender: m.gender || 'Male',
      branchId: m.branchId || '',
    });
    setModalOpen(true);
  };

  const handleOpenQR = (m) => {
    setActiveQrCode(m.qrCode);
    setActiveMemberName(m.name);
    setQrModalOpen(true);
  };

  const handleDownloadQR = async () => {
    try {
      setLoading(true);
      const primaryColor = colors?.primary || '#e50914';
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=${primaryColor.replace('#', '')}&bgcolor=ffffff&data=${encodeURIComponent(activeQrCode)}`;
      
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 450;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');

      // Draw background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0a0a0f');
      bgGrad.addColorStop(0.5, '#12121a');
      bgGrad.addColorStop(1, '#050508');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Crimson glowing border
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      // Draw subtle inner border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Draw header branding text "FLEXORA"
      ctx.fillStyle = primaryColor;
      ctx.font = '900 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FLEXORA GYM SYSTEM', canvas.width / 2, 60);

      // Draw Gym Name (Large, White, Premium)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      const gymName = user?.gymName || 'صالة فليكسورا الرياضية';
      ctx.fillText(gymName, canvas.width / 2, 105);

      // Draw separator line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 130);
      ctx.lineTo(canvas.width - 40, 130);
      ctx.stroke();

      // Draw "عضوية صالة" label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('بطاقة هوية رقمية', canvas.width / 2, 160);

      // Draw QR Code Background (pure white for high scanner contrast)
      ctx.fillStyle = '#ffffff';
      const qrSize = 220;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 190;
      
      // Draw rounded rectangle for QR code white background
      const radius = 16;
      ctx.beginPath();
      ctx.moveTo(qrX + radius, qrY);
      ctx.lineTo(qrX + qrSize - radius, qrY);
      ctx.quadraticCurveTo(qrX + qrSize, qrY, qrX + qrSize, qrY + radius);
      ctx.lineTo(qrX + qrSize, qrY + qrSize - radius);
      ctx.quadraticCurveTo(qrX + qrSize, qrY + qrSize, qrX + qrSize - radius, qrY + qrSize);
      ctx.lineTo(qrX + radius, qrY + qrSize);
      ctx.quadraticCurveTo(qrX, qrY + qrSize, qrX, qrY + qrSize - radius);
      ctx.lineTo(qrX, qrY + radius);
      ctx.quadraticCurveTo(qrX, qrY, qrX + radius, qrY);
      ctx.closePath();
      ctx.fill();

      // Draw the QR Code image on top
      ctx.drawImage(qrImg, qrX + 10, qrY + 10, qrSize - 20, qrSize - 20);

      // Draw Member Name Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('اسم المشترك / MEMBER NAME', canvas.width / 2, 460);

      // Draw Member Name (Bold & Large)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(activeMemberName, canvas.width / 2, 495);

      // Draw QR Payload / Serial Code Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('الرمز التعريفي / SERIAL NUMBER', canvas.width / 2, 545);

      // Draw QR Payload Code
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(activeQrCode, canvas.width / 2, 570);

      // Draw Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '900 10px sans-serif';
      ctx.fillText('POWERED BY FLEXORA', canvas.width / 2, 615);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `FLEXORA-CARD-${activeMemberName.replace(/\s+/g, '-')}-${activeQrCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('تم تحميل بطاقة العضوية الذكية بنجاح');
    } catch (error) {
      console.error('Failed to generate canvas QR card', error);
      try {
        const primaryColor = colors?.primary || '#e50914';
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=${primaryColor.replace('#', '')}&bgcolor=ffffff&data=${encodeURIComponent(activeQrCode)}`;
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `FLEXORA-${activeMemberName.replace(/\s+/g, '-')}-${activeQrCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('تم تحميل رمز QR بنجاح');
      } catch (err) {
        toast.error('فشل تحميل الرمز، يرجى المحاولة لاحقاً');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber || !formData.packageId) {
      toast.error('يرجى إدخال جميع الحقول الإلزامية');
      return;
    }

    if (formData.trainingType === 'Private' && (!formData.coachId || formData.coachId === 'none')) {
      toast.error('يرجى اختيار المدرب الشخصي عند اختيار تدريب خاص مع مدرب');
      return;
    }

    const payload = {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      packageId: formData.packageId,
      activePackageId: formData.packageId,
      coachId: formData.trainingType === 'Private' ? (formData.coachId === 'none' || formData.coachId === '' ? null : formData.coachId) : null,
      trainingType: formData.trainingType,
      paymentMethod: (formData.paymentMethod || 'cash').toLowerCase(),
      status: formData.status,
      gender: formData.gender || 'Male',
      branchId: formData.branchId || null,
    };

    try {
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, payload);
        toast.success('تم تحديث بيانات العضو بنجاح');
      } else {
        await api.post('/members', payload);
        toast.success('تم تسجيل العضو الجديد وتوليد رمز QR الخاص به');
      }
      setModalOpen(false);
      await fetchCRMData();
    } catch (error) {
      console.error('Submit error:', error);
      const errMsg = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع أثناء حفظ البيانات';
      if (errMsg.toLowerCase().includes('package')) {
        toast.error('خطأ بقاعدة البيانات: باقة الاشتراك المحددة غير صالحة أو غير موجودة في الجيم الخاص بك.');
      } else {
        toast.error(`فشل الحفظ: ${errMsg}`);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا المشترك؟')) return;
    try {
      await api.delete(`/members/${id}`);
      toast.success('تم حذف العضوية بنجاح');
      await fetchCRMData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const columns = [
    { key: 'name', label: 'اسم المشترك' },
    { key: 'phoneNumber', label: 'رقم الهاتف', render: (val) => <span className="tracking-wider text-xs">{val}</span> },
    { 
      key: 'gender', 
      label: 'الجنس', 
      render: (val) => (
        <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
          val === 'Female' ? 'text-pink-400 bg-pink-500/10 border border-pink-500/20' : 'text-sky-400 bg-sky-500/10 border border-sky-500/20'
        }`}>
          {val === 'Female' ? '🚺 أنثى' : '🚹 ذكر'}
        </span>
      ) 
    },
    { key: 'packageName', label: 'الباقة المنسوبة' },
    { 
      key: 'branchId', 
      label: 'الفرع المنسوب', 
      render: (val) => {
        const found = branches.find(b => b.id === val);
        return found ? found.name : 'الفرع الرئيسي';
      }
    },
    { key: 'coachName', label: 'المدرب الشخصي' },
    {
      key: 'status',
      label: 'حالة الاشتراك',
      render: (val) => {
        const statuses = {
          active: { label: 'نشط', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
          frozen: { label: 'مجمد', class: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: AlertTriangle },
          expired: { label: 'منتهي', class: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: ShieldAlert },
        };
        const activeStatus = statuses[val] || statuses.active;
        const Icon = activeStatus.icon;
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${activeStatus.class}`}>
            <Icon size={12} />
            {activeStatus.label}
          </span>
        );
      },
    },
    {
      key: 'attendedToday',
      label: 'حالة اليوم',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
          val 
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse' 
            : 'text-gray-400 bg-gray-500/5 border-gray-500/10'
        }`}>
          <span className={`w-2 h-2 rounded-full ${val ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gray-400'}`} />
          {val ? 'حضر اليوم 🟢' : 'لم يحضر بعد ⚪'}
        </span>
      )
    },
    {
      key: 'attendanceStats',
      label: 'الحضور | الغياب | الالتزام',
      render: (_, row) => (
        <div className="flex flex-col text-[11px] leading-relaxed text-right font-bold gap-0.5">
          <span className="text-emerald-400">✔️ حضور: {row.attendedDays || 0} يوم</span>
          <span className="text-rose-400">❌ غياب: {row.absentDays || 0} يوم</span>
          <span className="text-sky-400">📊 التزام: {row.commitmentRate || 0}%</span>
        </div>
      )
    },
  ];

  // Compute filtered members based on advanced criteria
  const filteredMembers = Array.isArray(members) ? members.filter(m => {
    const matchesGender = filterGender === 'All' || m.gender === filterGender;
    const matchesPackage = filterPackage === 'All' || m.packageId?.toString() === filterPackage.toString();
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    const matchesSearch = !searchTerm || 
      (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (m.phoneNumber && m.phoneNumber.includes(searchTerm));
    const matchesBranch = filterBranch === 'All' || (filterBranch === 'none' ? !m.branchId : m.branchId === filterBranch);
    return matchesGender && matchesPackage && matchesStatus && matchesSearch && matchesBranch;
  }) : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white neon-text-emerald">إدارة الأعضاء (CRM)</h2>
          <p className="text-xs text-gray-400 mt-1">تسجيل المشتركين الجدد، إسناد الباقات والمدربين، ومتابعة حالات الاشتراكات وتوليد رموز QR.</p>
        </div>
        {user?.role !== 'Coach' && (
          <CyberButton onClick={handleOpenAdd} variant="primary">
            <Plus size={16} />
            تسجيل مشترك جديد
          </CyberButton>
        )}
      </div>

      {/* Members DataTable */}
      <CyberCard title="قائمة المشتركين والأعضاء">
        {/* Advanced Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6 bg-slate-950/45 p-4 rounded-2xl border border-cyber-border/30 backdrop-blur-md">
          {/* Search Input */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-bold text-gray-400 mr-1">البحث بالاسم أو الهاتف</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
            />
          </div>

          {/* Filter by Gender */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-bold text-gray-400 mr-1">تصفية حسب النوع</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
            >
              <option value="All">الكل (ذكور وإناث)</option>
              <option value="Male">ذكور (Male)</option>
              <option value="Female">إناث (Female)</option>
            </select>
          </div>

          {/* Filter by Package */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-bold text-gray-400 mr-1">تصفية حسب باقة الاشتراك</label>
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
            >
              <option value="All">جميع الباقات المتاحة</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id.toString()}>{pkg.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-bold text-gray-400 mr-1">تصفية حسب حالة الاشتراك</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
            >
              <option value="All">جميع الحالات</option>
              <option value="active">نشط (Active)</option>
              <option value="frozen">مجمد (Frozen)</option>
              <option value="expired">منتهي (Expired)</option>
            </select>
          </div>

          {/* Filter by Branch */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-bold text-gray-400 mr-1">تصفية حسب الفرع</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
            >
              <option value="All">جميع الفروع</option>
              <option value="none">الفرع الرئيسي</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredMembers}
          emptyMessage="لا يوجد أعضاء يطابقون خيارات البحث المسجلة."
          actions={(row) => (
            <>
              <CyberButton 
                onClick={() => handleOpenQR(row)} 
                variant="outline" 
                size="sm" 
                className="p-1.5 flex items-center justify-center rounded-lg min-w-[28px] h-[28px]" 
                title="عرض كود QR"
              >
                <QrCode size={13} />
              </CyberButton>

              <CyberButton 
                onClick={() => {
                  const cleanPhone = row.phoneNumber.startsWith('0') ? '2' + row.phoneNumber : row.phoneNumber;
                  const waMsg = `أهلاً بك في صالة ${user?.gymName || 'فليكسورا'} الرياضية! 🎉\nيسعدنا انضمامك إلينا. رمز الهوية الرقمية (QR) الخاص بك لتسجيل الحضور هو:\n🔑 ${row.qrCode}\nنتمنى لك تدريباً ممتعاً! 💪`;
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
                }} 
                variant="secondary" 
                size="sm"
                className="border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60 p-1.5 flex items-center justify-center rounded-lg min-w-[28px] h-[28px]"
                title="إرسال عبر واتساب"
              >
                <WhatsAppIcon />
              </CyberButton>

              {user?.role !== 'Coach' && (
                <>
                  <CyberButton 
                    onClick={() => handleOpenEdit(row)} 
                    variant="secondary" 
                    size="sm" 
                    className="p-1.5 flex items-center justify-center rounded-lg min-w-[28px] h-[28px]" 
                    title="تعديل بيانات العضوية"
                  >
                    <Edit2 size={13} />
                  </CyberButton>
                  <CyberButton 
                    onClick={() => handleDelete(row.id)} 
                    variant="danger" 
                    size="sm" 
                    className="p-1.5 flex items-center justify-center rounded-lg min-w-[28px] h-[28px]" 
                    title="حذف العضو"
                  >
                    <Trash2 size={13} />
                  </CyberButton>
                </>
              )}
            </>
          )}
        />
      </CyberCard>

      {/* CRM Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? 'تعديل بيانات العضوية' : 'تسجيل عضوية جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Warning Banner if packages list is empty */}
          {packages.length === 0 && (
            <div className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 leading-relaxed text-right">
              ⚠️ تنبيه هام: لم تقم بإنشاء أي باقة اشتراك بالجيم بعد. يرجى إضافة باقة واحدة على الأقل من صفحة 
              <a href="/packages" className="underline mx-1 font-bold text-amber-300">الباقات والاشتراكات</a>
              لتفادي حدوث خطأ في تسجيل الأعضاء.
            </div>
          )}

          <CyberInput
            label="اسم المشترك الكامـل"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: يوسف خالد محمد"
            icon={User}
            required
          />

          <CyberInput
            label="رقم الهاتف"
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="مثال: 010xxxxxxxx"
            icon={Phone}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-400 mr-1">الجنس / النوع *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
              required
            >
              <option value="Male">ذكر (Male)</option>
              <option value="Female">أنثى (Female)</option>
            </select>
          </div>

          {user?.role === 'Gym-Owner' && (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-gray-400 mr-1">الفرع المنسوب إليه اللاعب</label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
              >
                <option value="">الفرع الرئيسي (بدون فرع)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-400 mr-1">اختيار باقة الاشتراك</label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
              required
            >
              <option value="" disabled>اختر الباقة...</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id.toString()}>
                  {pkg.name} ({pkg.price} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-gray-400 mr-1">نوع التدريب</label>
              <select
                value={formData.trainingType}
                onChange={(e) => setFormData({ ...formData, trainingType: e.target.value, coachId: '' })}
                className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
              >
                <option value="General">تدريب عام لوحده (General)</option>
                <option value="Private">تدريب خاص مع مدرب (Private PT)</option>
              </select>
            </div>

            {formData.trainingType === 'Private' ? (
              <div className="flex flex-col gap-1.5 w-full animate-fadeIn">
                <label className="text-xs font-semibold text-gray-400 mr-1">المدرب الشخصي (PT) *</label>
                <select
                  value={formData.coachId}
                  onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                  className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
                  required
                >
                  <option value="" disabled>اختر المدرب الشخصي...</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id.toString()}>
                      {coach.name}
                    </option>
                  ))}
                </select>
                {coaches.length === 0 && (
                  <span className="text-[10px] text-rose-400 mt-1">
                    ⚠️ لم تقم بإضافة أي مدربين بالجيم بعد. يرجى إضافة مدرب أولاً من صفحة الموظفين.
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full opacity-40 select-none">
                <label className="text-xs font-semibold text-gray-400 mr-1">المدرب الشخصي (PT)</label>
                <div className="w-full bg-slate-950/40 border border-gray-800 rounded-xl py-2.5 px-4 text-xs text-gray-500">
                  غير متاح في التدريب العام
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-gray-400 mr-1">طريقة الدفع</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
              >
                <option value="cash">نقدي (Cash)</option>
                <option value="visa">فيزا / كارت ائتمان</option>
                <option value="vodafone">فودافون كاش (رقمي)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-gray-400 mr-1">حالة الاشتراك</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-all duration-300"
              >
                <option value="active">نشط (Active)</option>
                <option value="frozen">مجمد مؤقتاً (Frozen)</option>
                <option value="expired">منتهي الصلاحية (Expired)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-cyber-border)]">
            <CyberButton type="button" onClick={() => setModalOpen(false)} variant="outline">
              إلغاء
            </CyberButton>
            <CyberButton type="submit" variant="primary" disabled={packages.length === 0}>
              {editingMember ? 'حفظ تعديلات العضوية' : 'إكمال التسجيل وتوليد QR'}
            </CyberButton>
          </div>
        </form>
      </Modal>

      {/* QR Code Presentation Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={`بطاقة الهوية الرقمية (QR) للمشترك`}
        size="sm"
      >
        <div className="flex flex-col items-center justify-center p-4 gap-6 animate-fadeIn">
          {/* Gym Branding on Card */}
          <div className="w-full text-center border-b border-cyber-border pb-3">
            <span className="text-[10px] font-bold text-[var(--theme-primary)] tracking-widest uppercase block mb-1">عضوية صالة</span>
            <h3 className="text-lg font-black text-white tracking-wide uppercase select-none">{user?.gymName || 'صالة فليكسورا الرياضية'}</h3>
          </div>

          <div className="relative p-3 rounded-2xl bg-slate-950 border border-[var(--theme-primary)]/40 shadow-[0_0_25px_rgba(229,9,20,0.15)] flex items-center justify-center overflow-hidden">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=${colors.primary.replace('#', '')}&bgcolor=0a0a0f&data=${encodeURIComponent(activeQrCode)}`} 
              alt="Member QR Code" 
              className="w-48 h-48 rounded-lg select-none filter contrast-125 brightness-110"
            />
          </div>

          <div className="text-center w-full">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">اسم العضو</span>
            <h4 className="text-md font-black text-white text-center mt-0.5 select-none">{activeMemberName}</h4>

            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mt-4">الرمز التعريفي (QR Payload)</span>
            <span className="text-sm font-extrabold text-[var(--theme-primary)] tracking-wider mt-1 block select-all break-all">{activeQrCode}</span>
          </div>

          {/* Download & WhatsApp Action Triggers */}
          <div className="flex flex-col sm:flex-row gap-3 w-full border-t border-[var(--color-cyber-border)] pt-4">
            <CyberButton onClick={handleDownloadQR} variant="primary" className="flex-1 flex items-center justify-center gap-2">
              <Download size={14} />
              تحميل بطاقة الـ QR
            </CyberButton>

            <CyberButton 
              onClick={() => toast.success('سيتم تفعيل خدمة إرسال بطاقات العضوية عبر الواتس آب تلقائياً في التحديث القادم.')} 
              variant="secondary" 
              className="flex-1 flex items-center justify-center gap-2 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60"
            >
              <WhatsAppIcon />
              إرسال عبر الواتساب
            </CyberButton>
          </div>

          <CyberButton onClick={() => setQrModalOpen(false)} variant="outline" className="w-full">
            إغلاق البطاقة
          </CyberButton>
        </div>
      </Modal>
    </div>
  );
};

export default Members;
