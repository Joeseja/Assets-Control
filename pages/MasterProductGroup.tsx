
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Badge, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup } from '../types';
import { 
  Edit, Trash2, Plus, Save, X, Database, Search, RefreshCw, 
  Layers, ShieldCheck, Clock, User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProductGroup = () => {
    const { t } = useLanguage();
    const [groups, setGroups] = useState<MasterGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const initialForm: MasterGroup = {
        product_group_code: '',
        description: '',
        is_status: 'Y',
        update_id: 'SYSTEM'
    };

    const [formData, setFormData] = useState<MasterGroup>(initialForm);
    const [editMode, setEditMode] = useState<'create'|'update'>('create');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getMasterGroups();
            setGroups(Array.isArray(data) ? data : []);
            setCurrentPage(1);
        } catch(e) { 
            console.error(e);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: MasterGroup) => {
        setFormData(item);
        setEditMode('update');
        setIsEditing(true);
    };

    const handleCreate = () => {
        setFormData(initialForm);
        setEditMode('create');
        setIsEditing(true);
    };

    const handleDelete = async (code: string) => {
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMasterGroup(code);
            loadData();
        } catch(e) { alert('Delete Failed'); }
    };

    const handleSave = async () => {
        if (!formData.product_group_code || !formData.description) {
            alert(t('msg.required_fields'));
            return;
        }
        setLoading(true);
        try {
            await api.saveMasterGroup(formData);
            setIsEditing(false);
            loadData();
        } catch(e) { 
            alert('Save Failed'); 
        } finally {
            setLoading(false);
        }
    };

    const filteredList = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return groups.filter(g => 
            (g.product_group_code?.toLowerCase() || '').includes(term) ||
            (g.description?.toLowerCase() || '').includes(term)
        );
    }, [groups, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredList.slice(start, start + itemsPerPage);
    }, [filteredList, currentPage]);

    if (isEditing) {
        return (
            <div className="space-y-4 animate-in fade-in duration-300 pb-20">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-800 text-white rounded-xl shadow-lg"><Layers size={24}/></div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">
                                {editMode === 'create' ? t('btn.add') : 'แก้ไขกลุ่มสินค้า'}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master File Maintenance</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={loading} className="rounded-xl px-6 font-bold">
                            <X size={16}/> {t('btn.cancel')}
                        </Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-black shadow-lg" disabled={loading}>
                            {loading ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>} {t('btn.save')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <Card title="ข้อมูลหลักกลุ่มสินค้า" className="border-0 shadow-xl ring-1 ring-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <Input 
                                    label="รหัสกลุ่มสินค้า *" 
                                    dbField="product_group_code" 
                                    value={formData.product_group_code} 
                                    onChange={e => setFormData({...formData, product_group_code: e.target.value})} 
                                    disabled={editMode==='update'} 
                                    className={editMode==='update' ? 'bg-slate-50 font-black' : 'font-black'} 
                                />
                                <Input 
                                    label="ชื่อกลุ่มสินค้า (Description) *" 
                                    dbField="description" 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    className="font-bold"
                                />
                                {editMode === 'update' && (
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <User size={14}/>
                                            <span className="text-xs font-bold uppercase tracking-wider">Update By: {formData.update_id || 'SYSTEM'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Clock size={14}/>
                                            <span className="text-xs font-bold uppercase tracking-wider">Last Update: {formData.update_date ? new Date(formData.update_date).toLocaleString() : '-'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <Card title="สถานะการใช้งาน" className="border-0 shadow-xl ring-1 ring-slate-100">
                            <label className={`group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all ${formData.is_status === 'Y' ? 'bg-primary-50/20 border-primary-100' : ''}`}>
                                <div className="flex flex-col">
                                    <span className={`text-[11px] font-black uppercase tracking-wider ${formData.is_status === 'Y' ? 'text-primary-700' : 'text-slate-500'}`}>สถานะใช้งาน</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Active Status</span>
                                </div>
                                <div className="relative inline-flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={formData.is_status === 'Y'} 
                                        onChange={(e) => setFormData({...formData, is_status: e.target.checked ? 'Y' : 'N'})} 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </div>
                            </label>
                            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5"/>
                                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                    การปิดสถานะใช้งานจะทำให้สมาชิกในกลุ่มสินค้าทั้งหมดไม่สามารถถูกเลือกใช้งานในหน้าทำรายการใหม่ได้
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Database size={24}/></div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('menu.master_product_group')}</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Group Configuration</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <input 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" 
                            placeholder="ค้นหารหัส หรือ ชื่อกลุ่มสินค้า..." 
                            value={searchTerm} 
                            onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                        />
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors"/>
                    </div>
                    <button onClick={loadData} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500 shadow-sm">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
                    </button>
                    <Button onClick={handleCreate} className="bg-primary-800 hover:bg-primary-900 text-white rounded-xl py-2.5 px-6 font-black shadow-lg">
                        <Plus size={18}/> {t('btn.add')}
                    </Button>
                </div>
            </div>
            
            <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-xs text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-32">Group Code</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px]">Description</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Status</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && groups.length === 0 ? (
                                <tr><td colSpan={4} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={32}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Data...</span></td></tr>
                            ) : currentItems.map(g => (
                                <tr key={g.product_group_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                                    <td className="py-1 px-3 align-middle font-mono font-bold text-primary-700">
                                        <div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{g.product_group_code}</div>
                                    </td>
                                    <td className="py-1 px-3 align-middle">
                                        <div className="font-bold text-slate-800">{g.description}</div>
                                    </td>
                                    <td className="py-1 px-3 align-middle text-center">
                                        {g.is_status === 'Y' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[9px] uppercase border border-emerald-100">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500"></div> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 font-black text-[9px] uppercase border border-slate-200">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-1 px-3 align-middle">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(g)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg" title="Edit"><Edit size={14}/></button>
                                            <button onClick={() => handleDelete(g.product_group_code)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && currentItems.length === 0 && (
                                <tr><td colSpan={4} className="p-32 text-center text-slate-300 font-bold italic">No records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    currentPage={currentPage} 
                    totalItems={filteredList.length} 
                    itemsPerPage={itemsPerPage} 
                    onPageChange={setCurrentPage} 
                />
            </Card>
        </div>
    );
};
