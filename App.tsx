
// Updated App.tsx: Added conditional note input for dietary requirements.
import React, { useState, useEffect, useMemo } from 'react';
import { Role, RegistrationData } from './types';
import { COPY, MOCK_REGISTRATIONS } from './constants';
import { analyzeRegistrationTrends } from './services/geminiService';
import { 
  ClipboardDocumentCheckIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SunIcon,
  SparklesIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
  QrCodeIcon,
  MapPinIcon,
  ClockIcon,
  LockClosedIcon,
  CalendarDaysIcon,
  MapIcon,
  CommandLineIcon,
  MusicalNoteIcon,
  PencilSquareIcon,
  PhoneIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('none');
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{summary: string, keyInsights: string[]} | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
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
  }, []);

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
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRole('none')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <SunIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Spring<span className="text-emerald-500">.log</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">当前节点</span>
              <span className="text-sm font-bold text-slate-700">{role === 'admin' ? '系统管理员' : '部门员工'}</span>
            </div>
            <button 
              onClick={() => { setRole('none'); setCurrentUserId(null); setIsEditing(false); }}
              className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
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

      <footer className="bg-white border-t border-slate-100 py-10 px-4 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">IT 部门 2026 春季团建</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">断开物理连接，合入自然主分支</p>
          </div>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5"><MusicalNoteIcon className="w-4 h-4 text-emerald-500" /> 高带宽 Fun</span>
            <span className="flex items-center gap-1.5"><SparklesIcon className="w-4 h-4 text-amber-500" /> AI Insights</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Sub-components ---

const GatewayView: React.FC<{onSelectRole: (role: Role) => void}> = ({ onSelectRole }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      onSelectRole('admin');
    } else {
      setError('授权码错误');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop" 
          alt="Fun Teambuilding Background"
          className="w-full h-full object-cover opacity-10 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF7]/60 via-transparent to-[#FFFDF7]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-grow p-6 md:p-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-[3.5rem] overflow-hidden shadow-[0_32px_80px_-16px_rgba(16,185,129,0.3)] aspect-[4/3] group ring-8 ring-white">
            <img 
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[15s] group-hover:scale-110"
              alt="Spring Park Grand Party Illustration"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-14 text-balance">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-white text-[10px] font-black rounded-full mb-4 self-start uppercase tracking-widest shadow-xl ring-2 ring-white/20">
                  <SunIcon className="w-3 h-3" />
                  春日公园大联欢!
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter drop-shadow-lg">
                  快乐出发<br/><span className="text-amber-400 italic">2026.04.20</span>
               </h2>
            </div>
          </div>

          <div className="space-y-12">
            <div className="text-center md:text-left">
               <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-none uppercase">
                 Spring<span className="text-emerald-500">.log</span>
               </h1>
               <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-sm">
                 欢迎接入团建控制台。请选择您的权限路径以继续。
               </p>
            </div>

            <div className="grid gap-5 max-w-sm">
              <button 
                onClick={() => onSelectRole('employee')}
                className="group flex items-center gap-6 bg-white border-b-4 border-slate-100 hover:border-emerald-500 hover:translate-y-[-2px] p-6 rounded-[2rem] transition-all shadow-lg hover:shadow-emerald-500/20 text-left ring-1 ring-slate-100"
              >
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">员工入口</h3>
                  <p className="text-slate-400 text-xs mt-1 font-bold">查看状态，同步报名</p>
                </div>
                <ArrowRightIcon className="w-6 h-6 text-emerald-500 ml-auto group-hover:translate-x-1 transition-transform" />
              </button>

              {!isAdminMode ? (
                <button 
                  onClick={() => setIsAdminMode(true)}
                  className="group flex items-center gap-6 bg-white border-b-4 border-slate-100 hover:border-amber-500 hover:translate-y-[-2px] p-6 rounded-[2rem] transition-all shadow-lg hover:shadow-amber-500/20 text-left ring-1 ring-slate-100"
                >
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:rotate-[-6deg] transition-transform">
                    <ShieldCheckIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">管理后台</h3>
                    <p className="text-slate-400 text-xs mt-1 font-bold">全局洞察，资源分析</p>
                  </div>
                </button>
              ) : (
                <div className="bg-white p-8 rounded-[2rem] shadow-2xl border-2 border-amber-100 animate-in slide-in-from-right-4 duration-300">
                  <form onSubmit={handleAdminLogin} className="space-y-3">
                    <input 
                      autoFocus
                      type="password"
                      value={password}
                      onChange={(e) => {setPassword(e.target.value); setError('');}}
                      placeholder="管理员授权码"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono text-sm"
                    />
                    {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
                    <button type="submit" className="w-full bg-amber-500 text-white font-black py-4 rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all uppercase tracking-widest text-xs">
                      进入后台 (Access)
                    </button>
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

const EmployeePortal: React.FC<{
  onRegister: (data: any) => void, 
  initialData?: RegistrationData,
  isEditing?: boolean,
  onCancel?: () => void
}> = ({ onRegister, initialData, isEditing, onCancel }) => {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isEditing) setShowForm(true);
  }, [isEditing]);

  if (showForm) {
    return (
      <div className="animate-in fade-in duration-500">
        <RegistrationForm onCancel={onCancel || (() => setShowForm(false))} onSubmit={onRegister} initialData={initialData} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative rounded-[3rem] overflow-hidden mb-12 shadow-[0_32px_64px_-12px_rgba(16,185,129,0.15)] ring-1 ring-slate-100 group">
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-emerald-950/70 via-emerald-950/20 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop" 
          alt="Spring Park Grand Party" 
          className="w-full h-[480px] object-cover transition-transform duration-[20s] group-hover:scale-110"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 md:p-14">
          <div className="flex justify-between items-start">
            <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white">
              <span className="text-emerald-700 font-black tracking-widest uppercase text-[10px]">技术部集结令</span>
            </div>
            <div className="w-14 h-14 bg-amber-400 rounded-[1.5rem] flex items-center justify-center shadow-2xl animate-pulse ring-4 ring-white/30">
              <SunIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-emerald-700 text-[10px] font-black rounded-full mb-6 uppercase tracking-[0.2em] shadow-lg">
              春日公园大联欢!
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.9] drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]">
              Spring.log
              <span className="block text-amber-300 mt-2 text-3xl md:text-5xl">快乐出发 · 快乐出勤</span>
            </h1>
            <button 
              onClick={() => setShowForm(true)}
              className="group relative px-12 py-5 bg-white text-emerald-900 font-black rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-emerald-50 transition-all flex items-center gap-4 text-xl overflow-hidden"
            >
              <span>立即同步报名</span>
              <ArrowRightIcon className="w-7 h-7 group-hover:translate-x-2 transition-transform relative z-10" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {COPY.tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all group">
            <div className={`relative z-10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 ${
              idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {idx === 0 ? <SunIcon className="w-8 h-8" /> : idx === 1 ? <ClipboardDocumentCheckIcon className="w-8 h-8" /> : <MusicalNoteIcon className="w-8 h-8" />}
            </div>
            <h3 className="font-black text-2xl mb-4 text-slate-900 tracking-tight">{tip.title}</h3>
            <p className="text-slate-500 text-base leading-relaxed font-semibold opacity-80">{tip.content}</p>
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
    dietary: initialData?.dietary.includes('备注:') ? initialData.dietary.split('备注:')[0].trim() : (initialData?.dietary || '无特殊要求'),
    dietaryNote: initialData?.dietary.includes('备注:') ? initialData.dietary.split('备注:')[1].trim() : '',
    activityInterest: initialData?.activityInterest || '暂无',
    carpool: initialData?.carpool || 'Self-drive',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDietary = (formData.dietary === '过敏 (请备注)' || formData.dietary === '其他 (请备注)') 
      ? `${formData.dietary} 备注: ${formData.dietaryNote}`
      : formData.dietary;

    onSubmit({
      name: formData.name,
      employeeId: formData.employeeId,
      contactInfo: formData.contactInfo,
      dietary: finalDietary,
      activityInterest: formData.activityInterest,
      carpool: formData.carpool
    });
  };

  const DIETARY_OPTIONS = ['无特殊要求', '素食', '清真', '过敏 (请备注)', '其他 (请备注)'];
  const showNoteInput = formData.dietary === '过敏 (请备注)' || formData.dietary === '其他 (请备注)';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden text-balance">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
        <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 rounded-2xl">
            <CommandLineIcon className="w-9 h-9 text-emerald-500" />
          </div>
          初始化报名分支
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">姓名 (NAME)</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                placeholder="填写姓名"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">工号 (EMPLOYEE ID)</label>
              <input 
                required
                type="text"
                value={formData.employeeId}
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                placeholder="如 EMP1024"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">联系方式 (CONTACT)</label>
              <input 
                required
                type="tel"
                value={formData.contactInfo}
                onChange={e => setFormData({...formData, contactInfo: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                placeholder="手机号码"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">饮食忌口 (DIETARY)</label>
              <select 
                value={formData.dietary}
                onChange={e => setFormData({...formData, dietary: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 appearance-none bg-no-repeat bg-[right_1.25rem_center] cursor-pointer"
                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`, backgroundSize: '1rem'}}
              >
                {DIETARY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {showNoteInput && (
                <div className="animate-in slide-in-from-top-2 duration-300 mt-3">
                  <textarea
                    required
                    value={formData.dietaryNote}
                    onChange={e => setFormData({...formData, dietaryNote: e.target.value})}
                    placeholder="请输入具体的忌口说明或过敏源信息..."
                    className="w-full px-5 py-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm h-24 resize-none shadow-inner"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">自建活动报名 (ACTIVITY)</label>
            <input 
              type="text"
              value={formData.activityInterest}
              onChange={e => setFormData({...formData, activityInterest: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
              placeholder="飞盘、摄影、音乐、桌游等"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">出行方式 (COMMUTE PLAN)</label>
            <div className="grid grid-cols-3 gap-4">
              {(['Need a ride', 'Offering a ride', 'Self-drive'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({...formData, carpool: option})}
                  className={`py-5 px-2 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all flex flex-col items-center gap-2 ${
                    formData.carpool === option 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[inset_0_2px_4px_rgba(16,185,129,0.1)]' 
                      : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${formData.carpool === option ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  {option === 'Need a ride' ? '需拼车' : option === 'Offering a ride' ? '我有车' : '自驾'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6 pt-6">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
            >
              取消 (CANCEL)
            </button>
            <button 
              type="submit"
              className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 transition-all uppercase tracking-widest text-xs"
            >
              确认提交 (SUBMIT)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyStatusView: React.FC<{registration: RegistrationData, onEdit: () => void}> = ({ registration, onEdit }) => (
  <div className="max-w-4xl mx-auto px-4 py-12 animate-in zoom-in duration-500">
    <div className="text-center mb-10">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
        <CheckCircleIcon className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">报名成功！</h2>
      <p className="text-slate-500 font-bold">已同步至 2026 春日集结分支</p>
    </div>

    <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(16,185,129,0.2)] border border-slate-100 overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto relative group text-balance">
      <div className="flex-grow p-12 md:p-14 border-b md:border-b-0 md:border-r border-dashed border-slate-200 relative">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg">Verified Code</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Spring.log <span className="text-amber-500">2026</span></h3>
          </div>
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all group shadow-sm"
          >
            <PencilSquareIcon className="w-4 h-4" />
            <span className="text-xs font-black">修改报名</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-10 mb-10">
          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2 leading-none">姓名</label>
            <p className="font-black text-slate-800 text-xl tracking-tight">{registration.name}</p>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2 leading-none">工号</label>
            <p className="font-bold text-slate-800 text-lg">{registration.employeeId}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-10">
          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2 leading-none">目标区域</label>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <MapPinIcon className="w-4 h-4 text-amber-500" />
              <span>Happy Park</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2 leading-none">联系方式</label>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <PhoneIcon className="w-4 h-4 text-emerald-500" />
              <span>{registration.contactInfo}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
           <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2 leading-none">自选活动兴趣</label>
            <p className="text-sm font-bold text-slate-600">{registration.activityInterest}</p>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2 leading-none">饮食忌口要求</label>
            <p className="text-sm font-bold text-slate-600">{registration.dietary}</p>
          </div>
        </div>
      </div>

      <div className="md:w-60 bg-slate-900 p-12 flex flex-col items-center justify-center relative">
        <div className="bg-white p-3 rounded-2xl mb-6 shadow-2xl group-hover:rotate-6 transition-transform duration-500 ring-4 ring-white/10">
          <QrCodeIcon className="w-24 h-24 text-slate-900" />
        </div>
        <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1.5">Ticket ID</p>
        <p className="text-white text-xs font-mono opacity-60 bg-white/5 px-2 py-1 rounded">
          {registration.id.slice(-8).toUpperCase()}
        </p>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC<{ 
  data: RegistrationData[], 
  analysis: any, 
  loading: boolean, 
  onAnalyze: () => void 
}> = ({ data, analysis, loading, onAnalyze }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase text-balance">Admin Console</h1>
          <p className="text-slate-500 font-bold mt-2">实时报名流可视化与 AI 需求建模</p>
        </div>
        <button 
          onClick={onAnalyze}
          disabled={loading}
          className="px-8 py-5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm uppercase tracking-widest"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <SparklesIcon className="w-5 h-5 text-amber-400" />
          )}
          运行 AI 需求汇总
        </button>
      </div>

      {analysis && (
        <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-[3.5rem] p-12 mb-16 shadow-[0_40px_100px_-20px_rgba(251,191,36,0.15)] animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8 text-amber-900">
            <div className="p-3 bg-amber-100 rounded-[1.2rem]">
              <SparklesIcon className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase">AI 智能分析报告</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-amber-100 mb-8 shadow-sm">
            <p className="text-amber-950 leading-relaxed font-bold text-lg opacity-80">{analysis.summary}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {analysis.keyInsights.map((insight: string, i: number) => (
              <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-amber-50 flex items-start gap-4 hover:shadow-lg transition-all">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-black shrink-0 border border-amber-100">{i + 1}</div>
                <p className="text-sm text-amber-900 font-black leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">姓名</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">工号</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">联系方式</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">出行方式</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">饮食忌口</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map(reg => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6 font-black text-slate-900">{reg.name}</td>
                  <td className="px-10 py-6 text-slate-500 font-bold text-sm">{reg.employeeId}</td>
                  <td className="px-10 py-6 text-slate-500 text-sm">{reg.contactInfo}</td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      reg.carpool === 'Offering a ride' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      reg.carpool === 'Need a ride' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {reg.carpool === 'Offering a ride' ? '我有车' : reg.carpool === 'Need a ride' ? '需拼车' : '自驾'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-slate-500 font-bold text-sm">{reg.dietary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
