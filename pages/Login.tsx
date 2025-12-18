
import React, { useState, useEffect, useCallback } from 'react';
import { User, Lock, ArrowRight, Building2, Languages, Leaf, RefreshCw, WifiOff, Eye, EyeOff, Database, Globe, ChevronDown, ShieldCheck, Server, AlertCircle } from 'lucide-react';
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

  const verifyConnection = useCallback(async (serverIp?: string) => {
    const target = serverIp || selectedServer;
    setConnStatus(prev => ({ ...prev, status: 'checking', message: t('status.syncing') }));
    setError('');
    
    try {
        const switchRes = await api.switchDatabase(target);
        if (switchRes.status !== 'success') throw new Error("Gateway refusal");
        
        const health = await api.checkDbConnection();
        if (health.status === 'connected') {
            setConnStatus({ 
                status: 'connected', 
                message: t('status.online'), 
                server: health.server || target,
                dbName: health.database || 'SenaAI_AssetsDB'
            });
        } else {
            throw new Error("Node heartbeat failed");
        }
    } catch (e) {
        setConnStatus({ status: 'error', message: t('status.offline'), server: target, dbName: 'TERMINAL_ERROR' });
        setError("Failed to establish secure node connection");
    }
  }, [selectedServer, t]);

  useEffect(() => {
    verifyConnection();
  }, [verifyConnection]);

  const handleServerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedServer(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) return setError(t('login.error'));
    if (connStatus.status !== 'connected') return verifyConnection();
    
    setIsLoading(true);
    setError('');
    try {
      const user = await api.getUser(login.trim());
      if (user && decodepass(user.password) === password) {
          onLogin(user.login, selectedServer, connStatus.dbName);
      } else {
          setError(t('login.error'));
      }
    } catch (err) {
      setError("Authorization server unresponsive");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-900/30 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-900/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] w-full max-w-sm p-10 z-10 border border-white/40 relative transition-all duration-700 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Top Header Utilities */}
        <div className="flex justify-between items-center mb-12">
             <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-100/80 text-slate-600 rounded-2xl border border-slate-200/50 shadow-inner">
                <ShieldCheck size={16} className="text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('login.secure_access')}</span>
            </div>
            <button onClick={() => setLanguage(language === 'en' ? 'th' : 'en')} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-2xl text-[10px] font-black text-slate-800 transition-all border-2 border-slate-100 shadow-sm active:scale-90 group">
                <Languages size={14} className="text-primary-600 group-hover:rotate-180 transition-transform duration-500" /> 
                {language === 'en' ? 'ENGLISH' : 'ภาษาไทย'}
            </button>
        </div>

        {/* Branding */}
        <div className="text-center mb-12">
            <div className="relative inline-flex mb-6 group">
                <div className="absolute inset-0 bg-primary-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#003057] to-[#082038] rounded-[2.5rem] text-white shadow-2xl transform transition-all group-hover:scale-105 duration-500 border border-white/20">
                   <Building2 size={48} />
                </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">SENA CORE</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">{t('app.subtitle')}</p>
        </div>

        {/* Node Connectivity Status */}
        <div className={`mb-10 p-6 rounded-[2.5rem] border-2 transition-all duration-700 ${
            connStatus.status === 'connected' ? 'bg-emerald-50/50 border-emerald-100' : 
            connStatus.status === 'error' ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-100'
        }`}>
            <div className="space-y-5">
                <div className="relative">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Server size={12} className="text-primary-600"/> Gateway Matrix
                        </span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${connStatus.status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : connStatus.status === 'error' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'}`}></div>
                            <span className={`text-[10px] font-black uppercase ${connStatus.status === 'connected' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {connStatus.status === 'connected' ? t('status.online') : connStatus.status === 'checking' ? t('status.syncing') : t('status.offline')}
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <select value={selectedServer} onChange={handleServerChange} disabled={isLoading || connStatus.status === 'checking'} className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-5 pr-12 py-4 text-[11px] font-black text-slate-800 outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500/50 appearance-none shadow-sm cursor-pointer disabled:opacity-50 transition-all uppercase tracking-widest">
                            <option value="192.168.0.200">Production Node (Main)</option>
                            <option value="192.168.0.184">Development Node (QA)</option>
                        </select>
                        <div className="absolute right-5 top-5 pointer-events-none text-slate-400">
                            {connStatus.status === 'checking' ? <RefreshCw size={16} className="animate-spin text-primary-600" /> : <ChevronDown size={16} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group relative">
              <User className="absolute left-5 top-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
              <input 
                type="text" 
                value={login} 
                onChange={e => setLogin(e.target.value)} 
                className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-2 border-transparent rounded-[1.8rem] outline-none focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500/50 transition-all text-sm font-black placeholder:text-slate-300 tracking-wide shadow-inner" 
                placeholder={t('login.username').toUpperCase()} 
                required 
                autoFocus
              />
          </div>
          
          <div className="group relative">
              <Lock className="absolute left-5 top-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full pl-14 pr-14 py-5 bg-slate-100/50 border-2 border-transparent rounded-[1.8rem] outline-none focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500/50 transition-all text-sm font-black placeholder:text-slate-300 tracking-[0.4em] shadow-inner" 
                placeholder={t('login.password').toUpperCase()} 
                required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-slate-300 hover:text-primary-500 transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
          </div>

          {error && (
            <div className="text-rose-600 text-[10px] font-black bg-rose-50 px-5 py-4 rounded-2xl border-2 border-rose-100 flex items-center gap-3 animate-in slide-in-from-top-2 uppercase tracking-tight shadow-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || connStatus.status !== 'connected'} 
            className="w-full bg-[#003057] hover:bg-[#082038] text-white font-black py-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,48,87,0.3)] transition-all flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 group relative overflow-hidden mt-8"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {isLoading ? (
                <RefreshCw size={24} className="animate-spin" />
            ) : (
                <><span className="text-base uppercase tracking-[0.25em]">{t('login.sign_in')}</span><ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-300" /></>
            )}
          </button>
        </form>
        
        {/* Footer */}
        <div className="mt-12 text-center">
            <span className="text-[10px] text-slate-300 flex items-center justify-center gap-3 uppercase tracking-[0.6em] font-black group cursor-default">
                <div className="w-8 h-px bg-slate-100"></div>
                <Leaf size={16} className="text-emerald-500/50 group-hover:text-emerald-500 group-hover:scale-125 transition-all duration-500"/>
                <div className="w-8 h-px bg-slate-100"></div>
            </span>
            <p className="mt-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">{t('login.footer')}</p>
        </div>
      </div>
    </div>
  );
};
