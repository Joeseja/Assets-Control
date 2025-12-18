
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { StaffItem } from '../types';
import { 
  Edit, Trash2, Users, Search, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterStaff = () => {
    const { t } = useLanguage();
    const [staff, setStaff] = useState<StaffItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getStaff();
            setStaff(Array.isArray(data) ? data : []);
            setCurrentPage(1);
        } catch (e) { 
            console.error(e);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return staff.filter(s => 
            (s.staff_name?.toLowerCase() || '').includes(term) || 
            (s.staff_code?.toLowerCase() || '').includes(term)
        );
    }, [staff, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, currentPage]);

    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Users size={24}/></div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('menu.master_staff')}</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Employee Directory Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <input className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all focus:border-primary-400" placeholder="Search..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                        <Search size={14} className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors"/>
                    </div>
                    <button onClick={loadData} disabled={loading} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 group transition-all">
                        <RefreshCw size={20} className={loading ? 'animate-spin text-primary-500' : 'group-hover:rotate-180 transition-transform duration-500'}/>
                    </button>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-xs text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-48">Staff Code</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px]">Employee Name</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] hidden md:table-cell">Department</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Status</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && currentItems.length === 0 ? (
                                <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500" size={32}/></td></tr>
                            ) : currentItems.map(s => (
                                <tr key={s.staff_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                                    <td className="py-1.5 px-3 align-middle font-mono font-bold text-primary-700"><div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{s.staff_code}</div></td>
                                    <td className="py-1.5 px-3 align-middle font-bold text-slate-800">{s.staff_name}</td>
                                    <td className="py-1.5 px-3 align-middle text-slate-500 hidden md:table-cell font-medium">{s.dept_name || '-'}</td>
                                    <td className="py-1.5 px-3 align-middle text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[9px] uppercase border border-emerald-100">Active</span></td>
                                    <td className="py-1.5 px-3 align-middle">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"><Edit size={14}/></button>
                                            <button className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && currentItems.length === 0 && <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">No records found</td></tr>}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </Card>
        </div>
    );
};
