
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { SupplierItem } from '../types';
import { 
  Edit, Trash2, Plus, Save, Truck, Search, X, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterSupplier = () => {
    const { t } = useLanguage();
    const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<SupplierItem>({ supplier_code: '', supplier_name: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        setLoading(true);
        // Simulation of data load
        setTimeout(() => {
            setSuppliers([
                { supplier_code: 'SUP-001', supplier_name: 'Siam Cement Group (SCG)' },
                { supplier_code: 'SUP-002', supplier_name: 'Thai Watsadu' },
                { supplier_code: 'SUP-003', supplier_name: 'Global House' },
                { supplier_code: 'SUP-004', supplier_name: 'HomePro PCL' }
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return suppliers.filter(s => 
            (s.supplier_name?.toLowerCase() || '').includes(term) || 
            (s.supplier_code?.toLowerCase() || '').includes(term)
        );
    }, [suppliers, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, currentPage]);

    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Truck size={24}/></div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">{t('menu.master_supplier')}</h1>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <input className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10" placeholder="Search..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                        <Search size={14} className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors"/>
                    </div>
                    <Button onClick={() => { setForm({supplier_code:'', supplier_name:''}); setIsEditing(true); }} className="bg-primary-800 text-white rounded-xl py-2.5 px-6 font-black shadow-lg shadow-primary-900/20"><Plus size={18}/> {t('btn.add')}</Button>
                </div>
            </div>

            {isEditing && (
                <Card title="Supplier Form Maintenance" className="border-0 shadow-xl ring-1 ring-slate-100 mb-4 animate-in slide-in-from-top-4 shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <Input label="Supplier Code *" value={form.supplier_code} onChange={e => setForm({...form, supplier_code: e.target.value})} />
                        <Input label="Supplier Name *" value={form.supplier_name} onChange={e => setForm({...form, supplier_name: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => setIsEditing(false)} className="rounded-xl px-8 font-bold">{t('btn.cancel')}</Button>
                        <Button onClick={() => { setSuppliers([...suppliers, form]); setIsEditing(false); }} className="bg-emerald-600 text-white px-12 rounded-xl font-black shadow-lg shadow-emerald-600/20">{t('btn.save')}</Button>
                    </div>
                </Card>
            )}

            <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-xs text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-48">Supplier Code</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px]">Supplier Name</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={3} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500" size={32}/></td></tr>
                            ) : currentItems.map(s => (
                                <tr key={s.supplier_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                                    <td className="py-1.5 px-3 align-middle font-mono font-bold text-primary-700"><div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{s.supplier_code}</div></td>
                                    <td className="py-1.5 px-3 align-middle font-bold text-slate-800">{s.supplier_name}</td>
                                    <td className="py-1.5 px-3 align-middle">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"><Edit size={14}/></button>
                                            <button className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && currentItems.length === 0 && <tr><td colSpan={3} className="p-32 text-center text-slate-300 font-bold italic">No records found</td></tr>}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </Card>
        </div>
    );
};
