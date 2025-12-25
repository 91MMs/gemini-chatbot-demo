
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
  LockClosedIcon
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-emerald-500 rounded-2xl mb-6 shadow-xl shadow-emerald-500/20">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            春季团建报名 <span className="text-emerald-500 font-mono text-2xl align-top">Portal</span>
          </h1>
          <p className="text-slate-400 text-lg">请选择您的身份入口以继续</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button 
            onClick={() => onSelectRole('employee')}
            className="group bg-slate-900 border border-slate-800 p-8 rounded-3xl text-left hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all shadow-2xl"
          >
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">员工入口</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">同步个人报名状态，领取电子入场券，开启春季重构之旅。</p>
            <div className="flex items-center text-emerald-500 font-bold gap-2">
              进入报名分支 <ArrowRightIcon className="w-5 h-5" />
            </div>
          </button>

          {!isAdminMode ? (
            <button 
              onClick={() => setIsAdminMode(true)}
              className="group bg-slate-900 border border-slate-800 p-8 rounded-3xl text-left hover:border-blue-500/50 hover:bg-slate-800/50 transition-all shadow-2xl"
            >
              <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">管理员后台</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">实时监控全量数据，通过 Gemini AI 洞察物流瓶颈与资源缺口。</p>
              <div className="flex items-center text-blue-500 font-bold gap-2">
                授权码登录 <ArrowRightIcon className="w-5 h-5" />
              </div>
            </button>
          ) : (
            <div className="bg-slate-900 border border-blue-500/50 p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">管理员认证</h2>
                <button onClick={() => setIsAdminMode(false)} className="text-slate-500 hover:text-white transition-colors">
                  <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="relative">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    autoFocus
                    type="password"
                    value={password}
                    onChange={(e) => {setPassword(e.target.value); setError('');}}
                    placeholder="输入管理员授权码"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                {error && <p className="text-rose-500 text-sm font-bold pl-1">{error}</p>}
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                  进入控制台
                </button>
                <p className="text-slate-600 text-center text-xs">默认授权码: admin</p>
              </form>
            </div>
          )}
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
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl ring-1 ring-slate-200">
        <img 
          src="https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&q=80&w=1600&h=600" 
          alt="Banner" 
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
          <div className="inline-block px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full mb-4 self-start uppercase tracking-widest">
            Spring 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
            {COPY.theme}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed">
            {COPY.intro}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {COPY.tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              {idx === 0 ? <SunIcon className="w-6 h-6 text-emerald-600" /> : 
               idx === 1 ? <ClipboardDocumentCheckIcon className="w-6 h-6 text-emerald-600" /> : 
               <ExclamationTriangleIcon className="w-6 h-6 text-emerald-600" />}
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">{tip.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{tip.content}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => setShowForm(true)}
          className="group relative px-12 py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2 text-xl"
        >
          立即同步报名 (Push to Attend)
          <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const MyStatusView: React.FC<{registration: RegistrationData}> = ({ registration }) => (
  <div className="max-w-4xl mx-auto px-4 py-12 animate-in zoom-in duration-500">
    <div className="text-center mb-10">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">报名成功！</h2>
      <p className="text-slate-500">数据已持久化至云端，请保存您的电子凭证</p>
    </div>

    {/* Ticket Card */}
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto relative">
      {/* Ticket Left Part */}
      <div className="flex-grow p-8 md:p-10 border-b md:border-b-0 md:border-r border-dashed border-slate-300">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Event Pass</span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">Spring.log 2026</h3>
          </div>
          <SparklesIcon className="w-8 h-8 text-emerald-500 opacity-20" />
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Participant</label>
              <p className="font-bold text-slate-800">{registration.name}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Department</label>
              <p className="font-bold text-slate-800">{registration.department}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Location</label>
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <MapPinIcon className="w-3 h-3 text-emerald-500" />
                <span>Mountain Branch</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Deployment Time</label>
              <div className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                <ClockIcon className="w-3 h-3 text-emerald-500" />
                <span>Next Weekend 08:00</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-6">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Size</label>
              <p className="font-mono text-xs font-bold text-slate-800">{registration.tshirtSize}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Commute</label>
              <p className="font-mono text-xs font-bold text-slate-800">
                {registration.carpool === 'Offering a ride' ? 'Drive-Out' : 
                 registration.carpool === 'Need a ride' ? 'Passenger' : 'Self-Solo'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Right Part (QR Section) */}
      <div className="md:w-48 bg-slate-950 p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-2 rounded-xl mb-4">
          <QrCodeIcon className="w-24 h-24 text-slate-900" />
        </div>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
          {registration.id.toUpperCase()}
        </p>
        <p className="text-white text-[10px] font-bold mt-4">SCAN FOR ASSETS</p>
      </div>

      {/* Aesthetic Cutouts */}
      <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200"></div>
      <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200"></div>
    </div>
  </div>
);

// --- New Components Fix ---

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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
        <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <ClipboardDocumentCheckIcon className="w-8 h-8 text-emerald-500" />
          填写报名信息
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">姓名</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="你的真实姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">部门</label>
              <select 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
              <label className="block text-sm font-bold text-slate-700 mb-2">T恤尺码</label>
              <select 
                value={formData.tshirtSize}
                onChange={e => setFormData({...formData, tshirtSize: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">饮食禁忌</label>
              <select 
                value={formData.dietary}
                onChange={e => setFormData({...formData, dietary: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="None">无</option>
                <option value="Vegetarian">素食</option>
                <option value="Halal">清真</option>
                <option value="Allergy">过敏</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">通勤意向</label>
            <div className="grid grid-cols-3 gap-4">
              {['Need a ride', 'Offering a ride', 'Self-drive'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({...formData, carpool: option})}
                  className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    formData.carpool === option 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {option === 'Need a ride' ? '需拼车' : option === 'Offering a ride' ? '有车出车' : '自驾'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">紧急联系方式</label>
            <input 
              required
              type="tel"
              value={formData.emergencyContact}
              onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="电话号码"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              取消
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
            >
              确认提交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ 
  data: RegistrationData[], 
  analysis: any, 
  loading: boolean, 
  onAnalyze: () => void 
}> = ({ data, analysis, loading, onAnalyze }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">管理控制台</h1>
          <p className="text-slate-500">实时监控报名动态与物流分析</p>
        </div>
        <button 
          onClick={onAnalyze}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <SparklesIcon className="w-5 h-5" />
          )}
          运行 Gemini AI 洞察
        </button>
      </div>

      {analysis && (
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 mb-12 animate-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6" />
            AI 物流建议
          </h2>
          <div className="prose prose-blue max-w-none">
            <p className="text-blue-800 leading-relaxed mb-6">{analysis.summary}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.keyInsights.map((insight: string, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-blue-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <p className="text-sm text-blue-900 font-medium">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">报名人</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">部门</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">T恤</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">通勤</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">饮食</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(reg => (
                <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{reg.name}</td>
                  <td className="px-6 py-4 text-slate-600">{reg.department}</td>
                  <td className="px-6 py-4 font-mono text-sm">{reg.tshirtSize}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                      reg.carpool === 'Offering a ride' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      reg.carpool === 'Need a ride' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {reg.carpool === 'Offering a ride' ? '出车' : reg.carpool === 'Need a ride' ? '找拼车' : '自驾'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {reg.dietary === 'None' ? '无' : reg.dietary === 'Vegetarian' ? '素食' : reg.dietary === 'Halal' ? '清真' : '过敏'}
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-400 font-mono">{reg.timestamp}</td>
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
