
// Updated App.tsx: Optimized layout density, reduced hero heights and tightened spacing to fit more content on screen.
import React, { useState, useEffect, useMemo } from 'react';
import { Role, RegistrationData } from './types';
import { COPY, MOCK_REGISTRATIONS } from './constants';
import { analyzeRegistrationTrends } from './services/geminiService';
import { 
  ClipboardDocumentCheckIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  SunIcon,
  SparklesIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
  QrCodeIcon,
  MapPinIcon,
  CommandLineIcon,
  MusicalNoteIcon,
  PencilSquareIcon,
  PhoneIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'spring_log_registrations';
const SPRING_IMG = "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?q=80&w=2000&auto=format&fit=crop";

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('none');
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{summary: string, keyInsights: string[]} | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRegistrations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved registrations", e);
      }
    } else {
      const lines = MOCK_REGISTRATIONS.split('\n').slice(1);
      const parsed = lines.map((line, i) => {
        const [name, , dietary, , carpool, contact, time] = line.split(',');
        return {
          id: `mock-${i}`,
          name,
          employeeId: `EMP${1000 + i}`,
          contactInfo: contact || '13800000000',
          dietary: dietary === '无' ? '无特殊要求' : dietary,
          activityInterest: '暂无',
          carpool: (carpool === '需拼车' ? 'Need a ride' : carpool === '有车出车' ? 'Offering a ride' : 'Self-drive') as any,
          timestamp: time
        };
      });
      setRegistrations(parsed);
    }
  }, []);

  useEffect(() => {
    if (registrations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    }
  }, [registrations]);

  const handleRegister = (data: Omit<RegistrationData, 'id' | 'timestamp'>) => {
    if (currentUserId) {
      setRegistrations(prev => prev.map(r => r.id === currentUserId ? { ...r, ...data, timestamp: new Date().toLocaleString() } : r));
    } else {
      const newReg: RegistrationData = {
        ...data,
        id: `user-${Date.now()}`,
        timestamp: new Date().toLocaleString()
      };
      setRegistrations(prev => [newReg, ...prev]);
      setCurrentUserId(newReg.id);
    }
    setIsEditing(false);
  };

  const myRegistration = useMemo(() => 
    registrations.find(r => r.id === currentUserId), 
  [registrations, currentUserId]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const csvString = [
        "姓名,工号,饮食忌口,出行方式,活动意向",
        ...registrations.map(r => `${r.name},${r.employeeId},${r.dietary},${r.carpool},${r.activityInterest}`)
      ].join('\n');
      const result = await analyzeRegistrationTrends(csvString);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (role === 'none') {
    return <GatewayView onSelectRole={setRole} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRole('none')}>
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md">
              <SunIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">Spring<span className="text-emerald-500">.log</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2 text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">节点</span>
              <span className="text-xs font-bold text-slate-700">{role === 'admin' ? '管理员' : '员工'}</span>
            </div>
            <button 
              onClick={() => { setRole('none'); setCurrentUserId(null); setIsEditing(false); }}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {role === 'employee' ? (
          (myRegistration && !isEditing) ? (
            <MyStatusView registration={myRegistration} onEdit={() => setIsEditing(true)} />
          ) : (
            <EmployeePortal 
              onRegister={handleRegister} 
              initialData={myRegistration} 
              isEditing={isEditing}
              onCancel={() => setIsEditing(false)}
            />
          )
        ) : (
          <AdminDashboard 
            data={registrations} 
            analysis={analysis} 
            loading={loading} 
            onAnalyze={runAnalysis} 
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 px-4 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-center md:text-left">
            <h3 className="text-slate-900 font-black text-[10px] uppercase tracking-widest">IT 部门 2026 春季团建</h3>
          </div>
          <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1"><MusicalNoteIcon className="w-3 h-3 text-emerald-500" /> 高带宽 FUN</span>
            <span className="flex items-center gap-1"><SparklesIcon className="w-3 h-3 text-amber-500" /> AI INSIGHTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const GatewayView: React.FC<{onSelectRole: (role: Role) => void}> = ({ onSelectRole }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') onSelectRole('admin');
    else setError('授权码错误');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <img src={SPRING_IMG} alt="Background" className="w-full h-full object-cover opacity-5 blur-[1px]" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow p-4">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-video group ring-4 ring-white">
            <img src={SPRING_IMG} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[15s] group-hover:scale-105" alt="Blossom" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6">
               <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tighter">快乐出发<br/><span className="text-amber-400 italic">2026.04.20</span></h2>
            </div>
          </div>
          <div className="space-y-6">
            <div className="text-center md:text-left">
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 leading-none uppercase">Spring<span className="text-emerald-500">.log</span></h1>
               <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm">欢迎接入团建控制台。请选择您的权限路径。</p>
            </div>
            <div className="grid gap-3 max-w-sm mx-auto md:mx-0">
              <button onClick={() => onSelectRole('employee')} className="group flex items-center gap-4 bg-white border border-slate-100 hover:border-emerald-500 hover:translate-y-[-1px] p-4 rounded-2xl transition-all shadow-sm hover:shadow-md text-left">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shrink-0"><UserIcon className="w-6 h-6" /></div>
                <div><h3 className="text-base font-black text-slate-900 leading-none">员工入口</h3><p className="text-slate-400 text-[10px] mt-1 font-bold">同步报名数据</p></div>
                <ArrowRightIcon className="w-5 h-5 text-emerald-500 ml-auto group-hover:translate-x-1 transition-transform" />
              </button>
              {!isAdminMode ? (
                <button onClick={() => setIsAdminMode(true)} className="group flex items-center gap-4 bg-white border border-slate-100 hover:border-amber-500 hover:translate-y-[-1px] p-4 rounded-2xl transition-all shadow-sm hover:shadow-md text-left">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0"><ShieldCheckIcon className="w-6 h-6" /></div>
                  <div><h3 className="text-base font-black text-slate-900 leading-none">管理后台</h3><p className="text-slate-400 text-[10px] mt-1 font-bold">查看数据报表</p></div>
                </button>
              ) : (
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-amber-100 animate-in slide-in-from-right-2 duration-300">
                  <form onSubmit={handleAdminLogin} className="space-y-2">
                    <input autoFocus type="password" value={password} onChange={(e) => {setPassword(e.target.value); setError('');}} placeholder="管理员授权码" className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono text-xs" />
                    {error && <p className="text-rose-500 text-[8px] font-black uppercase tracking-widest">{error}</p>}
                    <button type="submit" className="w-full bg-amber-500 text-white font-black py-3 rounded-lg shadow-md hover:bg-amber-600 transition-all uppercase tracking-widest text-[10px]">进入后台 (Access)</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeePortal: React.FC<{onRegister: (data: any) => void, initialData?: RegistrationData, isEditing?: boolean, onCancel?: () => void}> = ({ onRegister, initialData, isEditing, onCancel }) => {
  const [showForm, setShowForm] = useState(false);
  useEffect(() => { if (isEditing) setShowForm(true); }, [isEditing]);
  if (showForm) return <div className="animate-in fade-in duration-300"><RegistrationForm onCancel={onCancel || (() => setShowForm(false))} onSubmit={onRegister} initialData={initialData} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="relative rounded-[2rem] overflow-hidden mb-8 shadow-xl ring-1 ring-slate-100 group max-h-[320px]">
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-emerald-950/80 via-emerald-950/20 to-transparent"></div>
        <img src={SPRING_IMG} alt="Spring Blossom" className="w-full h-[320px] object-cover" />
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-10">
          <div className="flex justify-between items-start">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-white">
              <span className="text-emerald-700 font-black tracking-widest uppercase text-[9px]">技术部集结令</span>
            </div>
          </div>
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-none drop-shadow-md">Spring.log<span className="block text-amber-300 mt-1 text-lg md:text-2xl font-bold">快乐出发 · 快乐出勤</span></h1>
            <button onClick={() => setShowForm(true)} className="group relative px-8 py-3 bg-white text-emerald-900 font-black rounded-xl shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-3 text-base">
              <span>立即同步报名</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {COPY.tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${idx === 0 ? 'bg-amber-50 text-amber-600' : idx === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {idx === 0 ? <SunIcon className="w-6 h-6" /> : idx === 1 ? <ClipboardDocumentCheckIcon className="w-6 h-6" /> : <MusicalNoteIcon className="w-6 h-6" />}
            </div>
            <h3 className="font-black text-lg mb-2 text-slate-900 tracking-tight">{tip.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold opacity-80">{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RegistrationForm: React.FC<{ onCancel: () => void; onSubmit: (data: any) => void, initialData?: RegistrationData }> = ({ onCancel, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    employeeId: initialData?.employeeId || '',
    contactInfo: initialData?.contactInfo || '',
    dietary: initialData?.dietary?.includes(':') ? initialData.dietary.split(':')[0].trim() : (initialData?.dietary || '无特殊要求'),
    dietaryNote: initialData?.dietary?.includes(':') ? initialData.dietary.split(':')[1].trim() : '',
    activityInterest: initialData?.activityInterest || '暂无',
    carpool: initialData?.carpool || 'Self-drive',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const needsNote = formData.dietary === '过敏 (请备注)' || formData.dietary === '其他 (请备注)';
    const finalDietary = needsNote && formData.dietaryNote.trim() ? `${formData.dietary}: ${formData.dietaryNote.trim()}` : formData.dietary;
    onSubmit({ ...formData, dietary: finalDietary });
  };

  const DIETARY_OPTIONS = ['无特殊要求', '素食', '清真', '过敏 (请备注)', '其他 (请备注)'];
  const showNoteInput = formData.dietary === '过敏 (请备注)' || formData.dietary === '其他 (请备注)';

  return (
    <div className="max-w-xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg"><CommandLineIcon className="w-6 h-6 text-emerald-500" /></div>
          初始化报名分支
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="block text-[8px] uppercase font-black text-slate-400 tracking-widest pl-1">姓名</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm" placeholder="填写姓名" /></div>
            <div className="space-y-1.5"><label className="block text-[8px] uppercase font-black text-slate-400 tracking-widest pl-1">工号</label><input required type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm" placeholder="如 EMP1024" /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="block text-[8px] uppercase font-black text-slate-400 tracking-widest pl-1">联系方式</label><input required type="tel" value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm" placeholder="手机号码" /></div>
            <div className="space-y-1.5"><label className="block text-[8px] uppercase font-black text-slate-400 tracking-widest pl-1">饮食忌口</label><select value={formData.dietary} onChange={e => setFormData({...formData, dietary: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat">{DIETARY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
          </div>
          {showNoteInput && <div className="animate-in slide-in-from-top-2 duration-300 space-y-1.5"><label className="block text-[8px] uppercase font-black text-emerald-600 tracking-widest pl-1">具体备注</label><textarea required value={formData.dietaryNote} onChange={e => setFormData({...formData, dietaryNote: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/20 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 h-20 resize-none text-xs" placeholder="详细说明..." /></div>}
          <div className="space-y-1.5"><label className="block text-[8px] uppercase font-black text-slate-400 tracking-widest pl-1">活动意向</label><input type="text" value={formData.activityInterest} onChange={e => setFormData({...formData, activityInterest: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm" placeholder="飞盘、摄影、桌游等" /></div>
          <div className="space-y-2"><label className="block text-[8px] uppercase font-black text-slate-400 tracking-widest pl-1">出行方式</label><div className="grid grid-cols-3 gap-3">{(['Need a ride', 'Offering a ride', 'Self-drive'] as const).map((option) => (<button key={option} type="button" onClick={() => setFormData({...formData, carpool: option})} className={`py-3 px-1 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formData.carpool === option ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>{option === 'Need a ride' ? '需拼车' : option === 'Offering a ride' ? '我有车' : '自驾'}</button>))}</div></div>
          <div className="flex gap-4 pt-4"><button type="button" onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]">取消</button><button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all uppercase tracking-widest text-[10px]">提交</button></div>
        </form>
      </div>
    </div>
  );
};

const MyStatusView: React.FC<{registration: RegistrationData, onEdit: () => void}> = ({ registration, onEdit }) => (
  <div className="max-w-2xl mx-auto px-4 py-6 animate-in zoom-in duration-500">
    <div className="text-center mb-6">
      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircleIcon className="w-8 h-8" /></div>
      <h2 className="text-2xl font-black text-slate-900 mb-1">报名成功！</h2>
      <p className="text-slate-500 text-xs font-bold">已同步至 2026 春日集结分支</p>
    </div>
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row relative group">
      <div className="flex-grow p-8 border-b md:border-b-0 md:border-r border-dashed border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter">Spring.log <span className="text-amber-500">2026</span></h3>
          <button onClick={onEdit} className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black">修改</button>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div><label className="text-[8px] uppercase font-black text-slate-400 block mb-1">姓名</label><p className="font-black text-slate-800 text-lg leading-none">{registration.name}</p></div>
          <div><label className="text-[8px] uppercase font-black text-slate-400 block mb-1">工号</label><p className="font-bold text-slate-800 text-sm leading-none">{registration.employeeId}</p></div>
        </div>
        <div className="space-y-3">
          <div><label className="text-[8px] uppercase font-black text-slate-400 block mb-1">目标区域</label><div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs"><MapPinIcon className="w-3.5 h-3.5 text-amber-500" /><span>Happy Park</span></div></div>
          <div><label className="text-[8px] uppercase font-black text-slate-400 block mb-1">兴趣及忌口</label><p className="text-[10px] font-bold text-slate-500 leading-relaxed">{registration.activityInterest} / {registration.dietary}</p></div>
        </div>
      </div>
      <div className="md:w-32 bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-2 rounded-lg mb-3 ring-2 ring-white/10"><QrCodeIcon className="w-16 h-16 text-slate-900" /></div>
        <p className="text-[8px] text-amber-400 font-black uppercase tracking-widest mb-1 leading-none">ID</p>
        <p className="text-white text-[9px] font-mono opacity-60 leading-none">{registration.id.slice(-6).toUpperCase()}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC<{ data: RegistrationData[], analysis: any, loading: boolean, onAnalyze: () => void }> = ({ data, analysis, loading, onAnalyze }) => {
  const handleExportCSV = () => {
    const headers = ["姓名", "工号", "联系方式", "出行方式", "饮食忌口", "活动意向"];
    const rows = data.map(r => [r.name, r.employeeId, r.contactInfo, r.carpool === 'Offering a ride' ? '我有车' : r.carpool === 'Need a ride' ? '需拼车' : '自驾', r.dietary, r.activityInterest]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Spring_Registrations_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div><h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Admin Console</h1><p className="text-slate-500 font-bold text-xs mt-1">报名流可视化与 AI 需求建模</p></div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-sm"><ArrowDownTrayIcon className="w-4 h-4 text-emerald-500" />导出报表</button>
          <button onClick={onAnalyze} disabled={loading} className="px-5 py-2.5 bg-slate-900 text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 text-[10px] uppercase tracking-widest"><SparklesIcon className="w-4 h-4 text-amber-400" />{loading ? '分析中...' : 'AI 分析'}</button>
        </div>
      </div>
      <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3"><InformationCircleIcon className="w-5 h-5 text-blue-500 shrink-0" /><p className="text-[10px] text-blue-700 font-medium">数据存储在浏览器本地 (LocalStorage)。</p></div>
      {analysis && (
        <div className="bg-[#FFFDF7] border border-amber-100 rounded-[1.5rem] p-6 mb-8 shadow-md animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 mb-4 text-amber-900"><SparklesIcon className="w-5 h-5 text-amber-600" /><h2 className="text-lg font-black tracking-tight uppercase">AI 分析报告</h2></div>
          <p className="text-amber-950 font-bold text-sm leading-relaxed mb-4 opacity-80">{analysis.summary}</p>
          <div className="grid md:grid-cols-3 gap-3">{analysis.keyInsights.map((insight: string, i: number) => (<div key={i} className="bg-white p-3 rounded-lg border border-amber-50 text-[10px] text-amber-900 font-black leading-relaxed flex gap-2"><span>•</span>{insight}</div>))}</div>
        </div>
      )}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left">
          <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">姓名</th><th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">工号</th><th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">出行</th><th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">饮食忌口</th></tr></thead>
          <tbody className="divide-y divide-slate-50">{data.map(reg => (<tr key={reg.id} className="hover:bg-slate-50/30 transition-colors"><td className="px-6 py-3 font-black text-slate-800 text-sm">{reg.name}</td><td className="px-6 py-3 text-slate-500 font-bold text-xs">{reg.employeeId}</td><td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${reg.carpool === 'Offering a ride' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : reg.carpool === 'Need a ride' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{reg.carpool === 'Offering a ride' ? '我有车' : reg.carpool === 'Need a ride' ? '需拼车' : '自驾'}</span></td><td className="px-6 py-3 text-slate-500 font-bold text-xs">{reg.dietary}</td></tr>))}</tbody>
        </table></div>
      </div>
    </div>
  );
};

export default App;
