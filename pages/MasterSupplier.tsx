
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input } from '../components/ui';
import { api } from '../services/apiService';
import { SupplierItem } from '../types';
import { 
  Edit, Trash2, Plus, Save, Truck, Search, X, RefreshCw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
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
        // Mock loading
        setSuppliers([
            { supplier_code: 'SUP-001', supplier_name: 'Siam Cement Group' },
            { supplier_code: 'SUP-002', supplier_name: 'Thai Watsadu' },
            { supplier_code: 'SUP-003', supplier_name: 'Global House' }
        ]);
    }, []);

    const filtered = useMemo(() => {
        return suppliers.filter(s => 
            (s.supplier_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
            (s.supplier_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Truck size={24}/></div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">{t('menu.master_supplier')}</h1>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10" placeholder="Search..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                        <Search size={14} className="absolute left-3 top-3 text-slate-400"/>
                    </div>
                    <Button onClick={() => setIsEditing(true)} className="bg-primary-800 hover:bg-primary-900 text-white rounded-xl py-2.5 px-6 font-black"><Plus size={18}/> {t('btn.add')}</Button>
                </div>
            </div>

            {isEditing && (
                <Card title="Supplier Form" className="border-0 shadow-xl ring-1 ring-slate-100 mb-4 animate-in slide-in-from-top-4">
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
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentItems.map(s => (
                                <tr key={s.supplier_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                                    <td className="py-1 px-3 align-middle font-mono font-bold text-primary-700"><div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{s.supplier_code}</div></td>
                                    <td className="py-1 px-3 align-middle font-bold text-slate-800">{s.supplier_name}</td>
                                    <td className="py-1 px-3 align-middle">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-1 text-primary-600 hover:bg-primary-50 rounded"><Edit size={14}/></button>
                                            <button className="p-1 text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-slate-200 px-3 py-2 bg-slate-50 flex justify-between items-center shrink-0">
                    <div className="text-[11px] text-slate-500 font-medium">Showing {Math.min(filtered.length, (currentPage-1)*itemsPerPage+1)} to {Math.min(filtered.length, currentPage*itemsPerPage)} of {filtered.length}</div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className="p-1 rounded hover:bg-white disabled:opacity-30 transition-all text-slate-500"><ChevronsLeft size={14}/></button>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-1 rounded hover:bg-white disabled:opacity-30 transition-all text-slate-500"><ChevronLeft size={14}/></button>
                        <div className="flex items-center space-x-2 px-2 border-x border-slate-200 mx-1">
                            <span className="text-[11px] text-slate-500 font-medium">Page</span>
                            <select value={currentPage} onChange={e => setCurrentPage(Number(e.target.value))} className="h-6 text-[11px] border rounded px-1 bg-white font-bold text-primary-700 min-w-[50px]">
                                {Array.from({length: totalPages}, (_,i)=>i+1).map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="text-[11px] text-slate-500 font-medium">of {totalPages}</span>
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="p-1 rounded hover:bg-white disabled:opacity-30 transition-all text-slate-500"><ChevronRight size={14}/></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="p-1 rounded hover:bg-white disabled:opacity-30 transition-all text-slate-500"><ChevronsRight size={14}/></button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
