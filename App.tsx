
// GatewayView and EmployeePortal updated with modern Chinese park aesthetics.
import React, { useState, useEffect, useMemo } from 'react';
import { Role, RegistrationData } from './types';
import { COPY, MOCK_REGISTRATIONS } from './constants';
import { analyzeRegistrationTrends } from './services/geminiService';
import { 
  ClipboardDocumentCheckIcon, 
  ChartBarIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  SunIcon,
  SparklesIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
  QrCodeIcon,
  MapPinIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
  CalendarDaysIcon,
  MapIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('none');
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{summary: string, keyInsights: string[]} | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Initialize with mock data
  useEffect(() => {
    const lines = MOCK_REGISTRATIONS.split('\n').slice(1);
    const parsed = lines.map((line, i) => {
      const [name, dept, dietary, size, carpool, emergency, time] = line.split(',');
      return {
        id: `mock-${i}`,
        name,
        department: dept,
        dietary: (dietary === '无' ? 'None' : dietary === '素食' ? 'Vegetarian' : dietary === '清真' ? 'Halal' : 'Allergy') as any,
        tshirtSize: size as any,
        carpool: (carpool === '需拼车' ? 'Need a ride' : carpool === '有车出车' ? 'Offering a ride' : 'Self-drive') as any,
        emergencyContact: emergency,
        timestamp: time
      };
    });
    setRegistrations(parsed);
  }, []);

  const handleRegister = (data: Omit<RegistrationData, 'id' | 'timestamp'>) => {
    const newReg: RegistrationData = {
      ...data,
      id: `user-${Date.now()}`,
      timestamp: new Date().toLocaleString()
    };
    setRegistrations(prev => [newReg, ...prev]);
    setCurrentUserId(newReg.id);
  };

  const myRegistration = useMemo(() => 
    registrations.find(r => r.id === currentUserId), 
  [registrations, currentUserId]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const csvString = [
        "姓名,部门,饮食禁忌,尺码,拼车意向",
        ...registrations.map(r => `${r.name},${r.department},${r.dietary},${r.tshirtSize},${r.carpool}`)
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
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRole('none')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight font-mono">Spring.log</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">当前身份</span>
              <span className="text-sm font-bold text-slate-700">{role === 'admin' ? '系统管理员' : '部门员工'}</span>
            </div>
            <button 
              onClick={() => setRole('none')}
              className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              title="切换角色 / 退出"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {role === 'employee' ? (
          myRegistration ? (
            <MyStatusView registration={myRegistration} />
          ) : (
            <EmployeePortal onRegister={handleRegister} />
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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold text-sm">Internet Technology Dept. @ 2026</h3>
          </div>
          <div className="flex gap-6 text-xs font-medium">
            <span className="flex items-center gap-1"><ShieldCheckIcon className="w-4 h-4" /> SSL Secure</span>
            <span className="flex items-center gap-1"><SparklesIcon className="w-4 h-4" /> AI Powered</span>
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
      setError('授权码错误，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden relative">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full md:w-[45%] h-[35vh] md:h-screen overflow-hidden group border-r border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1596431268311-667793d6e522?auto=format&fit=crop&q=80&w=1200&h=1800" 
          alt="Modern Chinese Park Entrance"
          className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-[15000ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/95 via-slate-950/40 to-transparent z-10"></div>
        
        <div className="absolute inset-0 z-20 p-8 md:p-14 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black rounded-full mb-4 md:mb-6 self-start uppercase tracking-widest backdrop-blur-md">
             Spring.log 2026
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-4 drop-shadow-lg">
            重启 <span className="text-emerald-500">线下</span><br/>
            <span className="text-slate-200">园林式</span> 物理连接
          </h2>
          <p className="text-slate-400 max-w-sm text-xs md:text-sm leading-relaxed font-medium">
            告别屏幕像素，步入现代园林。在竹林与水景之间，重构我们的团队逻辑分支。
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-20">
        <div className="max-w-md w-full space-y-10">
          <div className="text-center md:text-left">
             <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-xl shadow-emerald-500/20">
               <SparklesIcon className="w-7 h-7 text-white" />
             </div>
             <h1 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">Entry Portal</h1>
             <p className="text-slate-500 text-xs font-medium">请选择您的身份以接入报名分支</p>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={() => onSelectRole('employee')}
              className="group relative bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-[1.5rem] text-left transition-all hover:bg-slate-800/60 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">员工入口</h2>
                  <p className="text-slate-500 text-[10px] mt-0.5">同步状态，领取电子凭证</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-emerald-500 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {!isAdminMode ? (
              <button 
                onClick={() => setIsAdminMode(true)}
                className="group relative bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 p-6 rounded-[1.5rem] text-left transition-all hover:bg-slate-800/60 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">管理后台</h2>
                    <p className="text-slate-500 text-[10px] mt-0.5">全局监控，Gemini AI 分析</p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-blue-500 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <div className="bg-slate-900 border border-blue-500/30 p-8 rounded-[1.5rem] shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xs font-black text-white uppercase tracking-widest">Admin Auth</h2>
                  <button onClick={() => setIsAdminMode(false)} className="text-slate-500 hover:text-white transition-colors">
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      autoFocus
                      type="password"
                      value={password}
                      onChange={(e) => {setPassword(e.target.value); setError('');}}
                      placeholder="授权码"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
                    />
                  </div>
                  {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-lg shadow-lg shadow-blue-600/20 transition-all text-xs uppercase tracking-widest"
                  >
                    Authorize
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeePortal: React.FC<{onRegister: (data: any) => void}> = ({ onRegister }) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="animate-in fade-in duration-500">
        <RegistrationForm onCancel={() => setShowForm(false)} onSubmit={onRegister} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Modern Chinese Park Style Poster */}
      <div className="relative rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl ring-1 ring-black/5 group">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&q=80&w=2000&h=1000" 
          alt="Modern Bamboo Park" 
          className="w-full h-[380px] md:h-[420px] object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-10">
          <div className="flex justify-between items-start">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-white font-black tracking-widest uppercase text-[9px]">Tech Retreat 2026</span>
            </div>
            <SparklesIcon className="w-8 h-8 text-emerald-300 opacity-60" />
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-600 text-white text-[9px] font-black rounded-full mb-4 uppercase tracking-widest shadow-lg shadow-emerald-600/30">
              <SunIcon className="w-3 h-3" />
              竹涧 · 溪谷
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-none drop-shadow-xl">
              Spring.log
              <span className="block text-emerald-400 mt-1 text-2xl md:text-4xl">重构生活 · 物理分支合入</span>
            </h1>
            
            <div className="flex flex-wrap gap-6 text-white/90 font-bold mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <CalendarDaysIcon className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[8px] uppercase text-white/40 tracking-widest leading-none mb-1">Schedule</p>
                  <p className="text-xs">2026.03.20 - 21</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <MapIcon className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[8px] uppercase text-white/40 tracking-widest leading-none mb-1">Base</p>
                  <p className="text-xs font-medium">Bamboo Valley Park</p>
                </div>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-200 max-w-lg leading-relaxed font-medium mb-8 border-l-2 border-emerald-500 pl-4 bg-emerald-950/20 backdrop-blur-sm py-2 rounded-r-lg">
              {COPY.intro}
            </p>
            
            <button 
              onClick={() => setShowForm(true)}
              className="group relative px-10 py-4 bg-white text-slate-900 font-black rounded-xl shadow-2xl hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-3 text-sm"
            >
              立即同步报名 (Sync Now)
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards Section - Refined for "Chinese Tech" feel */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {COPY.tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              {idx === 0 ? <SunIcon className="w-6 h-6" /> : 
               idx === 1 ? <ClipboardDocumentCheckIcon className="w-6 h-6" /> : 
               <ExclamationTriangleIcon className="w-6 h-6" />}
            </div>
            <h3 className="font-black text-lg mb-2 text-slate-900 tracking-tight">{tip.title}</h3>
            <p className="text-slate-500 text-[13px] leading-relaxed font-medium">{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RegistrationForm: React.FC<{ onCancel: () => void; onSubmit: (data: any) => void }> = ({ onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '前端组',
    dietary: 'None',
    tshirtSize: 'L',
    carpool: 'Self-drive',
    emergencyContact: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <CommandLineIcon className="w-8 h-8 text-emerald-500" />
          初始化报名信息
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Participant Name</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm"
                placeholder="Real Name"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Department</label>
              <select 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 appearance-none bg-white text-sm"
              >
                <option>前端组</option>
                <option>后端组</option>
                <option>运维组</option>
                <option>测试组</option>
                <option>产品组</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Gear Size</label>
              <div className="flex gap-1.5">
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({...formData, tshirtSize: size as any})}
                    className={`flex-1 py-2.5 rounded-lg border font-black text-[10px] transition-all ${formData.tshirtSize === size ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Dietary Preference</label>
              <select 
                value={formData.dietary}
                onChange={e => setFormData({...formData, dietary: e.target.value as any})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 appearance-none bg-white text-sm"
              >
                <option value="None">常规</option>
                <option value="Vegetarian">素食</option>
                <option value="Halal">清真</option>
                <option value="Allergy">敏</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Commute Plan</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Need a ride', 'Offering a ride', 'Self-drive'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({...formData, carpool: option})}
                  className={`py-3 px-1 rounded-xl border font-black uppercase tracking-tighter text-[10px] transition-all ${
                    formData.carpool === option 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {option === 'Need a ride' ? '需拼车' : option === 'Offering a ride' ? '出车' : '自驾'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Emergency Mobile</label>
            <input 
              required
              type="tel"
              value={formData.emergencyContact}
              onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm"
              placeholder="+86 Number"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-50 text-slate-500 font-black rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all uppercase tracking-widest text-[10px]"
            >
              Push Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyStatusView: React.FC<{registration: RegistrationData}> = ({ registration }) => (
  <div className="max-w-4xl mx-auto px-4 py-12 animate-in zoom-in duration-500">
    <div className="text-center mb-10">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">报名同步成功</h2>
      <p className="text-slate-500 text-sm">已将数据推送至主分支</p>
    </div>

    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto relative group">
      <div className="flex-grow p-10 md:p-12 border-b md:border-b-0 md:border-r border-dashed border-slate-200">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded">Access Key</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Spring.log <span className="text-emerald-500">2026</span></h3>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-[8px] uppercase font-black text-slate-400 tracking-widest block mb-1">User</label>
            <p className="font-black text-slate-800">{registration.name}</p>
          </div>
          <div>
            <label className="text-[8px] uppercase font-black text-slate-400 tracking-widest block mb-1">Dept</label>
            <p className="font-bold text-slate-800 text-sm">{registration.department}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[8px] uppercase font-black text-slate-400 tracking-widest block mb-1">Gate</label>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
              <MapPinIcon className="w-3 h-3 text-emerald-500" />
              <span>Bamboo Valley</span>
            </div>
          </div>
          <div>
            <label className="text-[8px] uppercase font-black text-slate-400 tracking-widest block mb-1">Schedule</label>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-[10px]">
              <ClockIcon className="w-3 h-3 text-emerald-500" />
              <span>Next SAT 08:00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:w-48 bg-slate-950 p-10 flex flex-col items-center justify-center">
        <div className="bg-white p-2 rounded-xl mb-4 group-hover:scale-105 transition-transform duration-500">
          <QrCodeIcon className="w-24 h-24 text-slate-950" />
        </div>
        <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest mb-1">Ticket Token</p>
        <p className="text-white text-[10px] font-mono opacity-60">
          {registration.id.slice(-6).toUpperCase()}
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
    <div className="max-w-6xl mx-auto px-4 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">管理后台</h1>
          <p className="text-slate-500 text-xs">实时数据链路与 AI 趋势洞察</p>
        </div>
        <button 
          onClick={onAnalyze}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <SparklesIcon className="w-4 h-4" />
          )}
          Gemini AI 分析
        </button>
      </div>

      {analysis && (
        <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 mb-10 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-blue-900">
            <SparklesIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black tracking-tight">AI 物流报告</h2>
          </div>
          <p className="text-blue-900 text-sm leading-relaxed mb-6 bg-white/40 p-4 rounded-xl border border-blue-100">{analysis.summary}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.keyInsights.map((insight: string, i: number) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</div>
                <p className="text-[11px] text-blue-900 font-bold leading-tight">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Dept</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Gear</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Carpool</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Diet</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {data.map(reg => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{reg.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-bold">{reg.department}</td>
                  <td className="px-6 py-4 font-mono text-slate-700">{reg.tshirtSize}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      reg.carpool === 'Offering a ride' ? 'bg-emerald-50 text-emerald-700' :
                      reg.carpool === 'Need a ride' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {reg.carpool === 'Offering a ride' ? '有车' : reg.carpool === 'Need a ride' ? '求带' : '自驾'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{reg.dietary === 'None' ? '常规' : '特殊'}</td>
                  <td className="px-6 py-4 text-[9px] text-slate-300 font-mono font-bold">{reg.timestamp.split(' ')[0]}</td>
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
