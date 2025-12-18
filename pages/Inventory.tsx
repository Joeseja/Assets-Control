
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Pagination, LoadingOverlay, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, RefreshCw, AlertCircle, Warehouse, Database, Boxes, ShieldAlert, Barcode, ClipboardCheck, TrendingUp, Filter, Layers, PieChart } from 'lucide-react';

export const Inventory = () => {
  const { t } = useLanguage();
  const [stockBalance, setStockBalance] = useState<{name: string, code: string, qty: number, type: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    try {
        const balance = await api.getInventoryBalance();
        setStockBalance(Array.isArray(balance) ? balance : []);
        setCurrentPage(1); 
    } catch(e) { 
        console.error("Inventory Fetch Error:", e);
        setStockBalance([]);
    } 
    finally {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return stockBalance;
    return stockBalance.filter(s => 
      (s.name?.toLowerCase() || '').includes(term) || 
      (s.code?.toLowerCase() || '').includes(term)
    );
  }, [stockBalance, searchTerm]);

  const summary = useMemo(() => {
      const active = filteredData.length;
      const total = filteredData.reduce((acc, curr) => acc + (curr.qty || 0), 0);
      const low = filteredData.filter(x => (x.qty || 0) < 5).length;
      return { total, low, active };
  }, [filteredData]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <div className="space-y-8 h-full flex flex-col overflow-hidden animate-in fade-in duration-700 pb-4">
       <LoadingOverlay show={isRefreshing} />
       
       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-200 shrink-0 gap-8 ring-1 ring-slate-900/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="flex items-center gap-8 relative">
               <div className="p-6 bg-primary-800 text-white rounded-[2.2rem] shadow-lg">
                  <Warehouse size={40}/>
               </div>
               <div>
                  <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none mb-3 uppercase">{t('report.balance')}</h1>
                  <div className="flex items-center gap-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[12px] text-slate-400 uppercase font-black tracking-[0.5em]">{t('inv.realtime_agg')}</p>
                  </div>
               </div>
           </div>
           
           <div className="flex items-center gap-6 w-full md:w-auto relative">
               <div className="relative flex-1 md:w-[450px] group">
                   <input className="w-full pl-14 pr-8 py-5 bg-slate-100/50 border-4 border-transparent rounded-[2rem] text-sm font-black focus:outline-none focus:bg-white transition-all shadow-inner" placeholder={t('lbl.search_placeholder').toUpperCase()} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                   <Search size={24} className="absolute left-5 top-5 text-slate-300 group-focus-within:text-primary-600 transition-colors"/>
               </div>
               <button onClick={loadData} className="p-5 bg-white border-4 border-slate-50 rounded-3xl hover:border-primary-400 transition-all text-slate-600 shadow-xl active:scale-75 group">
                 <RefreshCw size={28} className={isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform"}/>
               </button>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 shrink-0">
          <div className="bg-[#08111a] p-8 rounded-[2.5rem] text-white shadow-2xl border border-slate-800">
             <div className="flex justify-between items-start mb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Live SKUs</p>
                <Boxes size={24} className="text-primary-400" />
             </div>
             <h4 className="text-5xl font-black tracking-tighter">{summary.active.toLocaleString()}</h4>
             <p className="text-[10px] font-bold text-slate-600 uppercase mt-2">Active Mapped Identifiers</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] text-slate-800 border-4 border-slate-50 shadow-xl">
             <div className="flex justify-between items-start mb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">Inventory Mass</p>
                <ClipboardCheck size={24} className="text-emerald-500" />
             </div>
             <h4 className="text-5xl font-black tracking-tighter text-primary-900">{summary.total.toLocaleString()}</h4>
             <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">Aggregate On-Hand Volume</p>
          </div>
          <div className="bg-rose-50/50 p-8 rounded-[2.5rem] text-rose-900 border-4 border-rose-100/50">
             <div className="flex justify-between items-start mb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-rose-400">Critical Low</p>
                <ShieldAlert size={24} className="text-rose-600" />
             </div>
             <h4 className="text-5xl font-black tracking-tighter text-rose-700">{summary.low}</h4>
             <p className="text-[10px] font-bold text-rose-500 uppercase mt-2">Replenishment Triggers</p>
          </div>
       </div>

       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-2xl rounded-[3.5rem] bg-white flex flex-col ring-1 ring-slate-100">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
             <table className="w-full text-xs text-left border-separate border-spacing-0">
               <thead className="sticky top-0 z-10">
                 <tr className="bg-slate-50/95 backdrop-blur-xl text-slate-500">
                     <th className="py-7 px-10 font-black uppercase tracking-[0.4em] text-[11px] w-56 text-center border-b border-slate-100">SKU Node</th>
                     <th className="py-7 px-10 font-black uppercase tracking-[0.4em] text-[11px] border-b border-slate-100">Canonical Description</th>
                     <th className="py-7 px-10 font-black uppercase tracking-[0.4em] text-[11px] border-b border-slate-100 text-right w-64">On-Hand Unit</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 bg-white">
                  {currentItems.length === 0 ? (
                      <tr><td colSpan={3} className="p-72 text-center grayscale opacity-30">
                          <AlertCircle size={80} className="mx-auto mb-6" strokeWidth={1} />
                          <p className="text-slate-400 font-black uppercase tracking-[1em]">Empty Matrix</p>
                      </td></tr>
                  ) : (
                      currentItems.map((s, idx) => (
                        <tr key={s.code} className={`group hover:bg-slate-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          <td className="py-6 px-10 font-mono font-bold text-primary-900 align-middle">
                            <div className="bg-primary-50 border-2 border-primary-100 px-5 py-3 rounded-[1.5rem] text-center shadow-sm">
                                <Barcode size={14} className="opacity-20 inline mr-2" /> {s.code}
                            </div>
                          </td>
                          <td className="py-6 px-10 align-middle font-black text-slate-800 uppercase tracking-tighter text-base">{s.name}</td>
                          <td className="py-6 px-10 text-right align-middle">
                            <div className={`text-4xl font-black tabular-nums tracking-tighter ${s.qty < 5 ? 'text-rose-600' : 'text-primary-950'}`}>
                                {s.qty.toLocaleString()}
                                <span className="text-[11px] ml-3 text-slate-400 font-black tracking-widest uppercase">PCS</span>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
               </tbody>
             </table>
          </div>
          <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
       </Card>
    </div>
  );
};
