
import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Building2, Languages, Leaf, RefreshCw, WifiOff, Eye, EyeOff, Database, Globe, ChevronDown, ShieldCheck } from 'lucide-react';
import { api } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { decodepass } from '../utils/legacyEncryption';

interface LoginProps {
  onLogin: (username: string, server: string, database: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState('192.168.0.200');
  
  const [connStatus, setConnStatus] = useState<{
      status: 'idle' | 'checking' | 'connected' | 'error';
      message: string;
      server: string;
      dbName: string;
  }>({ status: 'idle', message: 'Initializing...', server: '', dbName: '' });

  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    verifyConnection();
  }, []);

  const verifyConnection = async (serverIp?: string) => {
    const target = serverIp || selectedServer;
    setConnStatus(prev => ({ ...prev, status: 'checking', message: t('status.syncing') }));
    try {
        await api.switchDatabase(target);
        const health = await api.checkDbConnection();
        if (health.status === 'connected') {
            const h = health as { status: string; server?: string; database?: string };
            setConnStatus({ 
                status: 'connected', 
                message: t('status.online'), 
                server: h.server || target,
                dbName: h.database || 'SenaAI_AssetsDB'
            });
        } else {
            setConnStatus({ status: 'error', message: t('status.offline'), server: target, dbName: 'SenaAI_AssetsDB' });
        }
    } catch (e) {
        setConnStatus({ status: 'error', message: t('status.offline'), server: target, dbName: 'SenaAI_AssetsDB' });
    }
  };

  const handleServerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedServer(val);
    verifyConnection(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) return setError(t('login.error'));
    if (connStatus.status !== 'connected') return setError(t('status.offline'));
    
    setIsLoading(true);
    setError('');
    try {
      const user = await api.getUser(login.trim());
      if (user) {
        if (decodepass(user.password) === password) {
          onLogin(user.login, selectedServer, connStatus.dbName);
        } else {
          setError(t('login.error'));
        }
      } else {
        setError(t('login.error'));
      }
    } catch (err) {
      setError(t('status.offline'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.15),rgba(15,23,42,1))]"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary-600/10 blur-[140px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/10 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-sm p-8 md:p-10 z-10 border border-white/20 relative transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center mb-10">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 text-slate-600 rounded-2xl border border-slate-200/50">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('login.secure_access')}</span>
            </div>
            <button onClick={() => setLanguage(language === 'en' ? 'th' : 'en')} className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-700 transition-all border border-slate-200 shadow-sm active:scale-95">
                <Languages size={12} className="text-primary-500" /> {language === 'en' ? 'EN' : 'TH'}
            </button>
        </div>

        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-700 to-primary-900 rounded-[2rem] mb-5 text-white shadow-xl transform transition-transform hover:scale-105 duration-300">
               <Building2 size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">SENA ASSETS</h1>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.4em]">{t('app.subtitle')}</p>
        </div>

        <div className={`mb-8 p-5 rounded-[2rem] border transition-all duration-500 ${
            connStatus.status === 'connected' ? 'bg-emerald-50/40 border-emerald-100/60' : 
            connStatus.status === 'error' ? 'bg-rose-50/40 border-rose-100/60' : 'bg-slate-50 border-slate-100'
        }`}>
            <div className="space-y-4">
                <div className="relative">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={11} className="text-primary-500"/> {t('login.server_gateway')}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${connStatus.status === 'connected' ? 'bg-emerald-500 animate-pulse' : connStatus.status === 'error' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                            <span className={`text-[10px] font-black uppercase ${connStatus.status === 'connected' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                {connStatus.status === 'connected' ? t('status.online') : connStatus.status === 'checking' ? t('status.syncing') : t('status.offline')}
                            </span>
                        </div>
                    </div>
                    <div className="relative group">
                        <select value={selectedServer} onChange={handleServerChange} disabled={isLoading} className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-400 appearance-none shadow-sm cursor-pointer disabled:opacity-60 transition-all">
                            <option value="192.168.0.200">Production (Sena Cloud)</option>
                            <option value="192.168.0.184">Development (Test Lab)</option>
                        </select>
                        <div className="absolute right-4 top-2.5 pointer-events-none text-slate-400">
                            {connStatus.status === 'checking' ? <RefreshCw size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                        <Database size={12} className="text-slate-400"/>
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{connStatus.dbName || '...'}</span>
                    </div>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={login} 
                onChange={e => setLogin(e.target.value)} 
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-400 transition-all text-sm font-bold placeholder:text-slate-300" 
                placeholder={t('login.username')} 
                required 
                autoFocus
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-400 transition-all text-sm font-bold placeholder:text-slate-300" 
                placeholder={t('login.password')} 
                required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-300 hover:text-slate-500 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>

          {error && <div className="text-rose-500 text-[11px] font-bold bg-rose-50/50 px-4 py-3 rounded-2xl border border-rose-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1"><WifiOff size={14} /><span>{error}</span></div>}

          <button type="submit" disabled={isLoading || connStatus.status !== 'connected'} className="w-full bg-gradient-to-r from-primary-800 to-primary-600 hover:from-primary-900 hover:to-primary-700 text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(30,58,138,0.2)] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] group overflow-hidden relative">
            {isLoading ? <RefreshCw size={22} className="animate-spin" /> : <><span className="text-base uppercase tracking-widest">{t('login.sign_in')}</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>
        
        <div className="mt-10 text-center">
            <span className="text-[10px] text-slate-300 flex items-center justify-center gap-2 uppercase tracking-[0.4em] font-black group cursor-default">
                <Leaf size={14} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors"/> {t('login.footer')}
            </span>
        </div>
      </div>
    </div>
  );
};
