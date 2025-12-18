
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup, MasterType } from '../types';
import { 
  Edit, Trash2, Plus, Save, Database, X, Search, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProductType = () => {
    const { t } = useLanguage();
    const [groups, setGroups] = useState<MasterGroup[]>([]);
    const [types, setTypes] = useState<MasterType[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [form, setForm] = useState<MasterType>({
        product_group_code: '',
        product_type_code: '',
        description: '',
        is_status: 'Y'
    });
    const [editMode, setEditMode] = useState<'create'|'update'>('create');

    useEffect(() => {
        const init = async () => {
            try {
                const g = await api.getMasterGroups();
                setGroups(Array.isArray(g) ? g : []);
                if (g && g.length > 0) setSelectedGroup(g[0].product_group_code);
            } catch(e) { console.error(e); }
        };
        init();
    }, []);

    useEffect(() => { if (selectedGroup) loadTypes(); }, [selectedGroup]);

    const loadTypes = async () => {
        setLoading(true);
        try {
            const data = await api.getMasterTypes(selectedGroup);
            setTypes(Array.isArray(data) ? data : []);
            setCurrentPage(1);
        } catch(e) { 
            console.error(e);
            setTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: MasterType) => {
        setForm(item); setEditMode('update'); setIsEditing(true);
    };

    const handleDelete = async (tcode: string) => {
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMasterType(selectedGroup, tcode);
            loadTypes();
        } catch(e) { alert(t('msg.delete_fail')); }
    };

    const handleSave = async () => {
        if (!form.product_type_code) return alert('Code Required');
        setLoading(true);
        try {
            await api.saveMasterType({...form, product_group_code: selectedGroup});
            setIsEditing(false); 
            loadTypes();
        } catch(e) { alert(t('msg.save_fail')); }
        setLoading(false);
    };

    const filteredList = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return types.filter(t => 
            (t.product_type_code?.toLowerCase() || '').includes(term) ||
            (t.description?.toLowerCase() || '').includes(term)
        );
    }, [types, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredList.slice(start, start + itemsPerPage);
    }, [filteredList, currentPage]);

    if (isEditing) {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-800 text-white rounded-xl shadow-lg"><Database size={24}/></div>
                        <h1 className="text-xl font-black text-slate-800">แก้ไขประเภทสินค้า (กลุ่ม: {selectedGroup})</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setIsEditing(false)} className="rounded-xl"><X size={16}/> {t('btn.cancel')}</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-black shadow-lg" disabled={loading}>
                            {loading ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>} {t('btn.save')}
                        </Button>
                    </div>
                </div>
                <Card className="border-0 shadow-xl ring-1 ring-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <Input label="Type Code (PK) *" dbField="product_type_code" value={form.product_type_code} onChange={e => setForm({...form, product_type_code: e.target.value})} disabled={editMode==='update'} className={editMode==='update' ? 'bg-slate-50 font-black' : ''} />
                        <Input label="Description (Thai) *" dbField="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        <Input label="Description (Eng)" dbField="desc_eng" value={form.desc_eng || ''} onChange={e => setForm({...form, desc_eng: e.target.value})} />
                        <Input label="Account Code" dbField="account_code" value={form.account_code || ''} onChange={e => setForm({...form, account_code: e.target.value})} />
                        <Input label="Cost %" type="number" dbField="cost_percent" value={form.cost_percent || 0} onChange={e => setForm({...form, cost_percent: Number(e.target.value)})} />
                        <Input label="Price %" type="number" dbField="price_percent" value={form.price_percent || 0} onChange={e => setForm({...form, price_percent: Number(e.target.value)})} />
                        <div className="md:col-span-2 pt-4">
                             <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" checked={form.is_status === 'Y'} onChange={e => setForm({...form, is_status: e.target.checked ? 'Y' : 'N'})} className="w-5 h-5 accent-emerald-600 rounded-lg"/><span className="font-bold text-slate-700 group-hover:text-primary-600 transition-colors">ใช้งาน (Active Status)</span></label>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Database size={24}/></div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('menu.master_product_type')}</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Type Management Console</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="w-full md:w-64 z-30">
                        <SearchableSelect label="Filter by Group" options={groups.map(g => ({value: g.product_group_code, label: `${g.product_group_code}: ${g.description}`}))} value={selectedGroup} onChange={setSelectedGroup} />
                    </div>
                    <div className="relative w-full md:w-48 group">
                        <input className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400" placeholder="Search..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary-500 transition-colors"/>
                    </div>
                    <Button onClick={() => { setForm({product_group_code: selectedGroup, product_type_code:'', description:'', is_status:'Y'}); setEditMode('create'); setIsEditing(true); }} className="bg-primary-800 text-white rounded-xl py-2.5 px-6 font-black shrink-0 shadow-lg shadow-primary-900/20"><Plus size={18}/> {t('btn.add')}</Button>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-xs text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-100 text-slate-700 font-bold uppercase shadow-sm">
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-32">Type Code</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px]">Description</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-32">Account</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Status</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && currentItems.length === 0 ? (
                                <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500" size={32}/></td></tr>
                            ) : currentItems.map(t => (
                                <tr key={t.product_type_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                                    <td className="py-1.5 px-3 align-middle font-mono font-bold text-primary-700"><div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{t.product_type_code}</div></td>
                                    <td className="py-1.5 px-3 align-middle">
                                        <div className="font-bold text-slate-800 group-hover:text-primary-800 transition-colors">{t.description}</div>
                                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">{t.desc_eng}</div>
                                    </td>
                                    <td className="py-1.5 px-3 align-middle text-slate-500 font-mono text-[10px]">{t.account_code || '-'}</td>
                                    <td className="py-1.5 px-3 align-middle text-center"><Badge type={t.is_status==='Y'?'success':'neutral'}>{t.is_status}</Badge></td>
                                    <td className="py-1.5 px-3 align-middle">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(t)} className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"><Edit size={14}/></button>
                                            <button onClick={() => handleDelete(t.product_type_code)} className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && currentItems.length === 0 && <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">No records found</td></tr>}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalItems={filteredList.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </Card>
        </div>
    );
};
