
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui';
import { api } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, RefreshCw, AlertCircle, Warehouse, Database } from 'lucide-react';

export const Inventory = () => {
  const { t } = useLanguage();
  const [stockBalance, setStockBalance] = useState<{name: string, code: string, qty: number, type: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    setLoading(true);
    try {
        const balance = await api.getInventoryBalance();
        setStockBalance(balance || []);
    } catch(e) { console.error(e); } 
    finally {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredData = useMemo(() => {
    return stockBalance.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockBalance, searchTerm]);

  return (
    <div className="space-y-4 h-full flex flex-col overflow-hidden">
       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 shrink-0 gap-4">
           <div className="flex items-center gap-4">
               <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg shadow-primary-900/20"><Warehouse size={24}/></div>
               <div>
                  <h1 className="text-xl font-black text-slate-800 tracking-tight">{t('report.balance')}</h1>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{t('inv.realtime_agg')}</p>
                  </div>
               </div>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                   <input className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" placeholder={t('lbl.search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                   <Search size={14} className="absolute left-3 top-3 text-slate-400"/>
               </div>
               <button onClick={loadData} disabled={loading || isRefreshing} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm active:scale-95">
                 <RefreshCw size={18} className={isRefreshing ? "animate-spin text-primary-600" : ""}/>
               </button>
           </div>
       </div>

       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white flex flex-col">
          <div className="overflow-auto flex-1 custom-scrollbar">
             <table className="w-full text-xs text-left border-separate border-spacing-0">
               <thead className="sticky top-0 z-20">
                 <tr>
                     <th className="bg-slate-50/95 backdrop-blur-md p-4 text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-100 w-40">{t('prod.code')}</th>
                     <th className="bg-slate-50/95 backdrop-blur-md p-4 text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-100">{t('prod.name')}</th>
                     <th className="bg-slate-50/95 backdrop-blur-md p-4 text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-100 w-32 text-center">{t('prod.group')}</th>
                     <th className="bg-slate-50/95 backdrop-blur-md p-4 text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-100 text-right w-40">{t('report.col_balance')}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 bg-white">
                  {loading && !stockBalance.length ? (
                      <tr><td colSpan={4} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={32}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{t('status.syncing')}</span></td></tr>
                  ) : filteredData.length === 0 ? (
                      <tr><td colSpan={4} className="p-32 text-center"><AlertCircle size={40} className="mx-auto text-slate-200 mb-4"/><p className="text-slate-400 font-bold text-sm">{t('msg.no_data')}</p></td></tr>
                  ) : (
                      filteredData.map((s) => (
                        <tr key={s.code} className="group hover:bg-slate-50/50 transition-all duration-150">
                          <td className="p-4 font-mono font-bold text-primary-700 align-middle"><div className="bg-primary-50 px-2 py-1 rounded-md border border-primary-100 inline-block">{s.code}</div></td>
                          <td className="p-4 align-middle font-semibold text-slate-700 group-hover:text-primary-900 transition-colors">{s.name}</td>
                          <td className="p-4 text-center align-middle"><span className="px-2.5 py-1 rounded-full bg-slate-100 text-[9px] font-black text-slate-500 uppercase border border-slate-200">{s.type}</span></td>
                          <td className="p-4 text-right align-middle"><div className={`text-lg font-black tabular-nums tracking-tighter ${s.qty < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>{s.qty.toLocaleString()}</div></td>
                        </tr>
                      ))
                  )}
               </tbody>
             </table>
          </div>
       </Card>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          <div className="bg-slate-800 p-4 rounded-2xl text-white">
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('inv.active_skus')}</p>
             <h4 className="text-xl font-black">{filteredData.length}</h4>
          </div>
          <div className="bg-emerald-600 p-4 rounded-2xl text-white">
             <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200 mb-1">{t('inv.accuracy')}</p>
             <h4 className="text-xl font-black">{t('status.verified')}</h4>
          </div>
          <div className="hidden md:flex bg-white p-4 rounded-2xl border border-slate-200 items-center justify-between col-span-2">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600"><Database size={16}/></div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('inv.db_conn')}</p>
             </div>
             <span className="text-[10px] font-mono text-slate-300">{t('lbl.last_update')}: {new Date().toLocaleTimeString()}</span>
          </div>
       </div>
    </div>
  );
};
