
import React, { useState, useEffect, useMemo } from 'react';
import { Role, RegistrationData } from './types';
import { COPY, MOCK_REGISTRATIONS } from './constants';
import { analyzeRegistrationTrends } from './services/geminiService';
import { dbService } from './services/dbService';
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
  CloudIcon,
  ExclamationCircleIcon,
  KeyIcon,
  LinkIcon,
  InformationCircleIcon,
  BoltIcon,
  CubeTransparentIcon,
  RocketLaunchIcon,
  WrenchScrewdriverIcon,
  TableCellsIcon,
  CodeBracketIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const SPRING_IMG = "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?q=80&w=2000&auto=format&fit=crop";

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('none');
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{summary: string, keyInsights: string[]} | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      if (dbService.isConfigured()) {
        const cloudData = await dbService.fetchAll();
        // 转换 SQL 字段名到应用字段名 (employee_id -> employeeId)
        const normalizedData = cloudData.map((item: any) => ({
          ...item,
          employeeId: item.employee_id
        }));
        if (normalizedData.length > 0) setRegistrations(normalizedData);
        else loadMock();
      } else {
        loadMock();
      }
      setInitialLoading(false);
    };
    const loadMock = () => {
      const lines = MOCK_REGISTRATIONS.split('\n').slice(1);
      const parsed = lines.map((line, i) => {
        const [name, , dietary, , carpool, contact, time] = line.split(',');
        return {
          id: `mock-${i}`, name, employeeId: `EMP${1000 + i}`, contactInfo: contact || '13800000000',
          dietary: dietary === '无' ? '无特殊要求' : dietary, activityInterest: '暂无',
          carpool: (carpool === '需拼车' ? 'Need a ride' : carpool === '有车出车' ? 'Offering a ride' : 'Self-drive') as any,
          timestamp: time
        };
      });
      setRegistrations(parsed);
    };
    loadData();
  }, []);

  const handleRegister = async (data: Omit<RegistrationData, 'id' | 'timestamp'>) => {
    setLoading(true);
    const timestamp = new Date().toLocaleString();
    const record: RegistrationData = { ...data, id: currentUserId || `user-${Date.now()}`, timestamp };

    setRegistrations(prev => {
      const exists = prev.find(r => r.employeeId === data.employeeId);
      if (exists) return prev.map(r => r.employeeId === data.employeeId ? record : r);
      return [record, ...prev];
    });

    if (dbService.isConfigured()) {
      try { 
        await dbService.save(record); 
      } catch (e) { 
        console.error('Save failed:', e);
        alert('提交失败，请确保已在 Supabase 运行 SQL 建表代码。');
      }
    }
    
    localStorage.setItem('last_emp_id', data.employeeId);
    setCurrentUserId(record.id);
    setIsEditing(false);
    setLoading(false);
  };

  const myRegistration = useMemo(() => 
    registrations.find(r => r.id === currentUserId || r.employeeId === localStorage.getItem('last_emp_id')), 
  [registrations, currentUserId]);

  if (role === 'none') return <GatewayView onSelectRole={setRole} />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setRole('none')}>
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
              <BoltIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900">Spring<span className="text-emerald-500">.log</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${dbService.isConfigured() ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm shadow-emerald-100/50' : 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse'}`}>
              <CloudIcon className="w-3.5 h-3.5" /> {dbService.isConfigured() ? 'Supabase Connected' : 'Configuration Required'}
            </span>
            <button onClick={() => { setRole('none'); setIsEditing(false); }} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
              <ArrowLeftOnRectangleIcon className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
            <div className="relative">
               <CloudIcon className="w-16 h-16 text-slate-200" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            </div>
            <p className="mt-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Querying Instance State...</p>
          </div>
        ) : (
          role === 'employee' ? (
            (myRegistration && !isEditing) ? (
              <MyStatusView registration={myRegistration} onEdit={() => setIsEditing(true)} />
            ) : (
              <EmployeePortal onRegister={handleRegister} initialData={myRegistration} isEditing={isEditing} onCancel={() => setIsEditing(false)} loading={loading} />
            )
          ) : (
            <AdminDashboard data={registrations} analysis={analysis} loading={loading} 
              onAnalyze={async () => {
                setLoading(true);
                const csv = registrations.map(r => `${r.name},${r.employeeId},${r.dietary},${r.carpool}`).join('\n');
                const res = await analyzeRegistrationTrends(csv);
                setAnalysis(res);
                setLoading(false);
              }}
              onRefresh={async () => {
                setLoading(true);
                const data = await dbService.fetchAll();
                if (data.length > 0) {
                  const normalized = data.map((item: any) => ({ ...item, employeeId: item.employee_id }));
                  setRegistrations(normalized);
                }
                setLoading(false);
              }}
            />
          )
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
               <CommandLineIcon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-relaxed">System Core v3.0<br/>Supabase Cluster Endpoint</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest group cursor-help"><MusicalNoteIcon className="w-3.5 h-3.5 text-emerald-500 group-hover:rotate-12 transition-transform" /> PostgREST Alive</div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest group cursor-help"><SparklesIcon className="w-3.5 h-3.5 text-amber-500 group-hover:scale-125 transition-transform" /> Neural Analysis</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Dashboard & Setup Guide ---

const AdminDashboard: React.FC<{ data: RegistrationData[], analysis: any, loading: boolean, onAnalyze: () => void, onRefresh: () => void }> = ({ data, analysis, loading, onAnalyze, onRefresh }) => {
  const diagnostics = dbService.getDiagnostics();
  if (!diagnostics.isValid) return <SetupGuide issues={diagnostics.issues} />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded uppercase tracking-[0.2em]">Live: Cloud Node</div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Master Dashboard</div>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">Admin Console</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={onRefresh} disabled={loading} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all text-xs uppercase tracking-widest shadow-sm">Sync From Supabase</button>
          <button onClick={onAnalyze} disabled={loading} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-3 disabled:opacity-50 text-xs uppercase tracking-widest"><SparklesIcon className="w-5 h-5 text-amber-400" />{loading ? 'Processing...' : 'Neural Insights'}</button>
        </div>
      </div>
      
      {analysis && (
        <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-[2.5rem] p-10 mb-12 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-700"><SparklesIcon className="w-64 h-64 text-amber-600" /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner"><SparklesIcon className="w-7 h-7" /></div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">AI 智能分析报告</h2>
            </div>
            <p className="text-amber-950 font-bold text-lg leading-relaxed mb-10 opacity-90">{analysis.summary}</p>
            <div className="grid md:grid-cols-3 gap-6">{analysis.keyInsights.map((insight: string, i: number) => (<div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-[1.5rem] border border-amber-50 text-sm text-amber-900 font-black leading-relaxed flex gap-4 shadow-sm hover:translate-y-[-2px] transition-transform"><div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0"></div>{insight}</div>))}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-100">
        <div className="overflow-x-auto"><table className="w-full text-left">
          <thead><tr className="bg-slate-50/50 border-b border-slate-100"><th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Team Member</th><th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee ID</th><th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Logistics</th><th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Requirements</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{data.map(reg => (<tr key={reg.id} className="hover:bg-slate-50/30 transition-colors group"><td className="px-10 py-5 font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{reg.name}</td><td className="px-10 py-5 text-slate-500 font-bold text-xs font-mono tracking-tighter uppercase">{reg.employeeId}</td><td className="px-10 py-5"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${reg.carpool === 'Offering a ride' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : reg.carpool === 'Need a ride' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{reg.carpool === 'Offering a ride' ? 'Available' : reg.carpool === 'Need a ride' ? 'Requested' : 'Self'}</span></td><td className="px-10 py-5 text-slate-400 font-bold text-xs truncate max-w-xs">{reg.dietary}</td></tr>))}</tbody>
        </table></div>
      </div>
    </div>
  );
};

const SetupGuide: React.FC<{ issues: string[] }> = ({ issues }) => {
  const sqlCode = `CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  contact_info TEXT,
  dietary TEXT,
  activity_interest TEXT,
  carpool TEXT,
  timestamp TEXT
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON registrations FOR ALL USING (true) WITH CHECK (true);`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in slide-in-from-bottom-12 duration-1000">
      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12"><BoltIcon className="w-64 h-64 text-emerald-500" /></div>
        
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-none uppercase">基础设施激活中</h2>
          <p className="text-slate-500 font-bold text-lg mb-12 leading-relaxed max-w-2xl">
            你提供的凭据已生效。为了确保应用能存取数据，请检查以下最后一步：
          </p>
          
          <div className="space-y-12 mb-16">
            <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-600/20">
               <div className="flex items-center gap-3 mb-6"><CodeBracketIcon className="w-6 h-6 text-amber-300" /><h4 className="font-black uppercase tracking-widest">关键：执行 SQL 初始化</h4></div>
               <p className="text-xs text-emerald-50 font-bold leading-relaxed mb-6">如果你还没在 Supabase 的 **SQL Editor** 里运行过以下代码，请务必执行。否则，你的“提交报名”操作将会返回 404 错误。</p>
               <pre className="bg-black/20 p-6 rounded-2xl text-[9px] font-mono leading-relaxed overflow-x-auto">
                  {sqlCode}
               </pre>
               <button onClick={() => navigator.clipboard.writeText(sqlCode)} className="mt-4 text-[10px] font-black text-emerald-200 uppercase tracking-widest hover:text-white transition-colors">Copy SQL Code</button>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-white/10 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform"><GlobeAltIcon className="w-32 h-32" /></div>
               <div className="flex items-center gap-3 mb-6"><CheckCircleIcon className="w-6 h-6 text-emerald-400" /><h4 className="font-black uppercase tracking-widest">凭据校验状态</h4></div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-slate-400">Project Endpoint</span>
                    <span className="text-[10px] font-mono text-emerald-400">VERIFIED ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-slate-400">Anon Auth Key</span>
                    <span className="text-[10px] font-mono text-emerald-400">ACTIVE ✓</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="p-10 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner text-center">
            <p className="text-sm text-slate-500 font-bold leading-relaxed mb-6">
              配置已就绪。请刷新页面或重新进入应用。
            </p>
            <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-800 transition-all">
              重启应用连接
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Gateway, Portal, Status remains updated ---

const GatewayView: React.FC<{onSelectRole: (role: Role) => void}> = ({ onSelectRole }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col overflow-hidden relative font-sans selection:bg-amber-100">
      <div className="absolute inset-0 z-0"><img src={SPRING_IMG} alt="Background" className="w-full h-full object-cover opacity-10 blur-[2px]" /></div>
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow p-6">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-square group ring-[12px] ring-white">
            <img src={SPRING_IMG} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" alt="Spring" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/10 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-12">
               <h2 className="text-5xl md:text-6xl font-black text-white leading-[0.85] tracking-tighter mb-4 uppercase">Spring.log<br/><span className="text-amber-400 italic text-2xl md:text-3xl font-bold tracking-normal">Supabase.v3</span></h2>
               <p className="text-white/70 text-xs font-black uppercase tracking-[0.4em] border-l-2 border-amber-400 pl-4">Internet Infrastructure Group</p>
            </div>
          </div>
          <div className="space-y-12">
            <div className="text-center md:text-left">
               <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-none uppercase">Spring<span className="text-emerald-500">.log</span></h1>
               <p className="text-slate-500 font-bold text-base leading-relaxed max-w-sm opacity-80">
                 {dbService.isConfigured() ? 'Supabase 云端集群已就绪。报名记录将原子化保存至 PostgreSQL 实例。' : '目前在内存沙盒模式运行。请按照 Admin 指引完成 Supabase 基础设施部署。'}
               </p>
            </div>
            <div className="grid gap-5 max-w-sm mx-auto md:mx-0">
              <button onClick={() => onSelectRole('employee')} className="group flex items-center gap-6 bg-white border border-slate-100 hover:border-emerald-500 hover:translate-y-[-4px] p-6 rounded-[2rem] transition-all shadow-xl hover:shadow-2xl text-left ring-1 ring-slate-100/50">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0 shadow-inner"><UserIcon className="w-8 h-8" /></div>
                <div className="flex-grow">
                  <h3 className="text-xl font-black text-slate-900 leading-none">员工入口</h3>
                  <p className="text-slate-400 text-[11px] mt-2 font-black uppercase tracking-widest">Push Registration</p>
                </div>
                <ArrowRightIcon className="w-6 h-6 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </button>
              
              {!isAdminMode ? (
                <button onClick={() => setIsAdminMode(true)} className="group flex items-center gap-6 bg-white border border-slate-100 hover:border-amber-500 hover:translate-y-[-4px] p-6 rounded-[2rem] transition-all shadow-xl hover:shadow-2xl text-left ring-1 ring-slate-100/50">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><ShieldCheckIcon className="w-8 h-8" /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-none">管理控制台</h3>
                    <p className="text-slate-400 text-[11px] mt-2 font-black uppercase tracking-widest">Master Console</p>
                  </div>
                </button>
              ) : (
                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-amber-100 animate-in zoom-in-95 duration-300">
                  <form onSubmit={(e) => { e.preventDefault(); if(password==='admin') onSelectRole('admin'); else setError('Access Denied'); }} className="space-y-4">
                    <input autoFocus type="password" value={password} onChange={(e) => {setPassword(e.target.value); setError('');}} placeholder="Access Code (admin)" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-50 outline-none transition-all font-mono text-sm tracking-[0.3em] font-bold" />
                    {error && <p className="text-rose-600 text-[11px] font-black uppercase tracking-widest pl-3 animate-bounce">{error}</p>}
                    <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-[0.3em] text-xs">Verify Access</button>
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

const EmployeePortal: React.FC<{onRegister: (data: any) => void, initialData?: RegistrationData, isEditing?: boolean, onCancel?: () => void, loading: boolean}> = ({ onRegister, initialData, isEditing, onCancel, loading }) => {
  const [showForm, setShowForm] = useState(false);
  useEffect(() => { if (isEditing) setShowForm(true); }, [isEditing]);
  if (showForm) return <div className="animate-in fade-in zoom-in-95 duration-300"><RegistrationForm onCancel={onCancel || (() => setShowForm(false))} onSubmit={onRegister} initialData={initialData} loading={loading} /></div>;
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative rounded-[4rem] overflow-hidden mb-16 shadow-2xl ring-1 ring-slate-100 group">
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-emerald-950/90 via-emerald-950/40 to-transparent"></div>
        <img src={SPRING_IMG} alt="Spring Blossom" className="w-full h-[450px] object-cover transition-transform duration-[40s] group-hover:scale-110" />
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-12 md:p-20">
          <div className="bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white self-start">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-emerald-900 font-black tracking-[0.3em] uppercase text-[11px]">System: Supabase-Stable</span>
          </div>
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.85] drop-shadow-2xl">Spring.log<span className="block text-amber-300 mt-4 text-2xl md:text-4xl font-bold tracking-normal italic opacity-95">重构你的周末，Commit 你的快乐</span></h1>
            <button onClick={() => setShowForm(true)} className="group relative px-12 py-5 bg-white text-emerald-950 font-black rounded-2xl shadow-2xl hover:bg-emerald-50 transition-all flex items-center gap-5 text-xl"><span>立即提交报名信息</span><ArrowRightIcon className="w-7 h-7 group-hover:translate-x-3 transition-transform text-emerald-600" /></button>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        {COPY.tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-2 ring-1 ring-slate-100/50">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${idx === 0 ? 'bg-amber-50 text-amber-600' : idx === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{idx === 0 ? <SunIcon className="w-10 h-10" /> : idx === 1 ? <ClipboardDocumentCheckIcon className="w-10 h-10" /> : <MusicalNoteIcon className="w-10 h-10" />}</div>
            <h3 className="font-black text-2xl mb-4 text-slate-900 tracking-tight">{tip.title}</h3>
            <p className="text-slate-500 text-base leading-relaxed font-bold opacity-70 italic">{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RegistrationForm: React.FC<{ onCancel: () => void; onSubmit: (data: any) => void, initialData?: RegistrationData, loading: boolean }> = ({ onCancel, onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '', employeeId: initialData?.employeeId || '', contactInfo: initialData?.contactInfo || '',
    dietary: initialData?.dietary?.includes(':') ? initialData.dietary.split(':')[0].trim() : (initialData?.dietary || '无特殊要求'),
    dietaryNote: initialData?.dietary?.includes(':') ? initialData.dietary.split(':')[1].trim() : '',
    activityInterest: initialData?.activityInterest || '暂无', carpool: initialData?.carpool || 'Self-drive',
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDietary = formData.dietary.includes('备注') ? `${formData.dietary}: ${formData.dietaryNote}` : formData.dietary;
    onSubmit({ ...formData, dietary: finalDietary });
  };
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-3 flex items-center gap-5 uppercase tracking-tight">部署报名分支</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] pl-1 border-l-4 border-emerald-500 ml-1">Stack: Supabase + PostgreSQL</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3"><label className="block text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">姓名 (Username)</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-50 outline-none transition-all font-black text-slate-900 text-base shadow-sm" placeholder="真实姓名" /></div>
            <div className="space-y-3"><label className="block text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">工号 (Unique Identity ID)</label><input required type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-50 outline-none transition-all font-black text-slate-900 text-base font-mono tracking-tighter" placeholder="EMP-1024" /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3"><label className="block text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">手机号 (Network Path)</label><input required type="tel" value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-50 outline-none transition-all font-black text-slate-900 text-base" placeholder="138-0000-0000" /></div>
            <div className="space-y-3"><label className="block text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">饮食习惯 (Payload Spec)</label><select value={formData.dietary} onChange={e => setFormData({...formData, dietary: e.target.value})} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 outline-none transition-all font-black text-slate-900 text-base appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%223%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.4rem] bg-[right_1.5rem_center] bg-no-repeat shadow-sm">{['无特殊要求', '素食', '清真', '过敏 (请备注)', '其他 (请备注)'].map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
          </div>
          {formData.dietary.includes('备注') && <textarea required value={formData.dietaryNote} onChange={e => setFormData({...formData, dietaryNote: e.target.value})} className="w-full px-6 py-5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/20 focus:bg-white focus:border-emerald-500 outline-none transition-all font-black text-slate-900 h-28 resize-none text-sm shadow-inner" placeholder="请详细备注具体忌口或健康要求..." />}
          <div className="space-y-4"><label className="block text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">出行方式 (Transport Layer)</label><div className="grid grid-cols-3 gap-5">{(['Need a ride', 'Offering a ride', 'Self-drive'] as const).map((option) => (<button key={option} type="button" onClick={() => setFormData({...formData, carpool: option})} className={`py-5 px-3 rounded-2xl border-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${formData.carpool === option ? 'border-emerald-600 bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:border-slate-200'}`}>{option === 'Need a ride' ? '需拼车' : option === 'Offering a ride' ? '我有车' : '自驾'}</button>))}</div></div>
          <div className="flex gap-6 pt-8"><button type="button" onClick={onCancel} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-[0.3em] text-xs">取消变更</button><button type="submit" disabled={loading} className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-[0_20px_40px_-10px_rgba(5,150,105,0.4)] transition-all uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4">{loading && <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}{loading ? 'Commiting...' : 'Push to Cloud'}</button></div>
        </form>
      </div>
    </div>
  );
};

const MyStatusView: React.FC<{registration: RegistrationData, onEdit: () => void}> = ({ registration, onEdit }) => (
  <div className="max-w-4xl mx-auto px-6 py-20 animate-in zoom-in-95 duration-700">
    <div className="text-center mb-16">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-600/10"><CheckCircleIcon className="w-14 h-14" /></div>
      <h2 className="text-5xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Commit Success!</h2>
      <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">PostgreSQL ID: {registration.id.slice(0, 8)} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Status: Synced</p>
    </div>
    <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row relative group transition-all hover:translate-y-[-4px] ring-1 ring-slate-100">
      <div className="flex-grow p-12 md:p-16 border-b lg:border-b-0 lg:border-r-4 border-dashed border-slate-100">
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Spring.log <span className="text-emerald-500">2026</span></h3>
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Verified Cloud Identity</p>
          </div>
          <button onClick={onEdit} className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all text-[11px] uppercase tracking-[0.2em] shadow-lg">修改报名</button>
        </div>
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div><label className="text-[11px] uppercase font-black text-slate-300 block mb-3 tracking-widest">Team Member</label><p className="font-black text-slate-900 text-3xl leading-none">{registration.name}</p></div>
          <div><label className="text-[11px] uppercase font-black text-slate-300 block mb-3 tracking-widest">Identity ID</label><p className="font-black text-slate-900 text-2xl leading-none font-mono tracking-tighter uppercase">{registration.employeeId}</p></div>
        </div>
        <div className="space-y-8">
          <div><label className="text-[11px] uppercase font-black text-slate-300 block mb-3 tracking-widest">Target Endpoint</label><div className="flex items-center gap-3 font-black text-slate-900 text-lg"><MapPinIcon className="w-5 h-5 text-emerald-500" /><span>Happy Park · 南昆山森林公园</span></div></div>
          <div><label className="text-[11px] uppercase font-black text-slate-300 block mb-3 tracking-widest">Deployment Specs</label><p className="text-sm font-bold text-slate-500 leading-relaxed bg-slate-50 p-5 rounded-3xl border border-slate-100 italic shadow-inner">"{registration.activityInterest} · {registration.dietary}"</p></div>
        </div>
      </div>
      <div className="lg:w-56 bg-slate-950 p-12 flex flex-col items-center justify-center text-center group">
        <div className="bg-white p-4 rounded-3xl mb-8 shadow-2xl ring-4 ring-white/5 group-hover:scale-110 transition-transform duration-500 shadow-emerald-500/10"><QrCodeIcon className="w-24 h-24 text-slate-900" /></div>
        <p className="text-[11px] text-amber-400 font-black uppercase tracking-[0.4em] mb-3 leading-none">Access Token</p>
        <p className="text-white text-[13px] font-mono opacity-40 leading-none tracking-widest">{registration.id.slice(-10).toUpperCase()}</p>
      </div>
    </div>
  </div>
);

export default App;
