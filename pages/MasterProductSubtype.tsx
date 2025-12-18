
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup, MasterType, MasterSubtype } from '../types';
import { 
  Edit, Trash2, Plus, Save, X, Database, Search, RefreshCw,
  Layers, ShieldCheck, Clock, User, Tag, ListTree
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProductSubtype = () => {
    const { t } = useLanguage();
    
    // Data States
    const [groups, setGroups] = useState<MasterGroup[]>([]);
    const [types, setTypes] = useState<MasterType[]>([]);
    const [subtypes, setSubtypes] = useState<MasterSubtype[]>([]);
    
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [loading, setLoading] = useState(false);
    
    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const initialForm: MasterSubtype = {
        product_group_code: '',
        product_type_code: '',
        product_subtype_code: '',
        description: '',
        is_status: 'Y',
        idp_code: '',
        desc_eng: '',
        update_id: 'SYSTEM'
    };

    const [formData, setFormData] = useState<MasterSubtype>(initialForm);
    const [editMode, setEditMode] = useState<'create'|'update'>('create');

    // 1. Load Groups
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const g = await api.getMasterGroups();
                const groupsArr = Array.isArray(g) ? g : [];
                setGroups(groupsArr);
                if (groupsArr.length > 0) setSelectedGroup(groupsArr[0].product_group_code);
            } catch(e) { console.error(e); }
            setLoading(false);
        };
        init();
    }, []);

    // 2. Load Types when Group changes
    useEffect(() => {
        const fetchTypes = async () => {
            if (!selectedGroup) return;
            setLoading(true);
            try {
                const tData = await api.getMasterTypes(selectedGroup);
                const typesArr = Array.isArray(tData) ? tData : [];
                setTypes(typesArr);
                if (typesArr.length > 0) setSelectedType(typesArr[0].product_type_code);
                else setSelectedType('');
            } catch(e) { console.error(e); }
            setLoading(false);
        };
        fetchTypes();
    }, [selectedGroup]);

    // 3. Load Subtypes when Type changes
    useEffect(() => { 
        if (selectedGroup && selectedType) loadSubtypes();
        else setSubtypes([]);
    }, [selectedGroup, selectedType]);

    const loadSubtypes = async () => {
        setLoading(true);
        try {
            const data = await api.getMasterSubtypes(selectedGroup, selectedType);
            setSubtypes(Array.isArray(data) ? data : []);
            setCurrentPage(1);
        } catch(e) { 
            console.error(e); 
            setSubtypes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: MasterSubtype) => {
        setFormData(item);
        setEditMode('update');
        setIsEditing(true);
    };

    const handleCreate = () => {
        setFormData({ 
            ...initialForm, 
            product_group_code: selectedGroup,
            product_type_code: selectedType 
        });
        setEditMode('create');
        setIsEditing(true);
    };

    const handleDelete = async (item: MasterSubtype) => {
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMasterSubtype(item.product_group_code, item.product_type_code, item.product_subtype_code);
            loadSubtypes();
        } catch(e) { alert('Delete Failed'); }
    };

    const handleSave = async () => {
        if (!formData.product_subtype_code || !formData.description) {
            alert(t('msg.required_fields'));
            return;
        }
        setLoading(true);
        try {
            await api.saveMasterSubtype(formData);
            setIsEditing(false);
            loadSubtypes();
        } catch(e) { 
            alert('Save Failed'); 
        } finally {
            setLoading(false);
        }
    };

    const filteredList = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return subtypes.filter(s => 
            (s.product_subtype_code?.toLowerCase() || '').includes(term) ||
            (s.description?.toLowerCase() || '').includes(term) ||
            (s.desc_eng?.toLowerCase() || '').includes(term)
        );
    }, [subtypes, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredList.slice(start, start + itemsPerPage);
    }, [filteredList, currentPage]);

    if (isEditing) {
        return (
            <div className="space-y-4 animate-in fade-in duration-300 pb-20">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-800 text-white rounded-xl shadow-lg"><ListTree size={24}/></div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">
                                {editMode === 'create' ? t('btn.add') : 'แก้ไขประเภทย่อยสินค้า'}
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
                        <Card title="ข้อมูลความสัมพันธ์และรหัสประเภทย่อย" className="border-0 shadow-xl ring-1 ring-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="md:col-span-2 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">กลุ่มสินค้า (Group)</span>
                                            <div className="bg-white border border-slate-200 p-2.5 rounded-lg font-bold text-slate-800 text-sm">
                                                {formData.product_group_code} : {groups.find(g => g.product_group_code === formData.product_group_code)?.description}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ประเภทสินค้า (Type)</span>
                                            <div className="bg-white border border-slate-200 p-2.5 rounded-lg font-bold text-slate-800 text-sm">
                                                {formData.product_type_code} : {types.find(t => t.product_type_code === formData.product_type_code)?.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Input 
                                    label="รหัสประเภทย่อยสินค้า *" 
                                    dbField="product_subtype_code" 
                                    value={formData.product_subtype_code} 
                                    onChange={e => setFormData({...formData, product_subtype_code: e.target.value})} 
                                    disabled={editMode==='update'} 
                                    className={editMode==='update' ? 'bg-slate-50 font-black' : 'font-black'} 
                                />
                                <Input 
                                    label="รหัสอ้างอิง IDP" 
                                    dbField="idp_code" 
                                    value={formData.idp_code || ''} 
                                    onChange={e => setFormData({...formData, idp_code: e.target.value})} 
                                />
                                <div className="md:col-span-2"><Input label="ชื่อประเภทย่อยสินค้า (ภาษาไทย) *" dbField="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="font-bold" /></div>
                                <div className="md:col-span-2"><Input label="ชื่อประเภทย่อยสินค้า (English)" dbField="desc_eng" value={formData.desc_eng || ''} onChange={e => setFormData({...formData, desc_eng: e.target.value})} /></div>
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
                            {editMode === 'update' && (
                                <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <User size={14}/>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">By: {formData.update_id || 'SYSTEM'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Clock size={14}/>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Date: {formData.update_date ? new Date(formData.update_date).toLocaleString() : '-'}</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Database size={24}/></div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('menu.master_product_subtype')}</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Subcategory Maintenance</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="w-full md:w-56">
                        <SearchableSelect 
                            label="กลุ่มสินค้า" 
                            options={groups.map(g => ({value: g.product_group_code, label: `${g.product_group_code}: ${g.description}`}))} 
                            value={selectedGroup} 
                            onChange={setSelectedGroup} 
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <SearchableSelect 
                            label="ประเภทสินค้า" 
                            options={types.map(t => ({value: t.product_type_code, label: `${t.product_type_code}: ${t.description}`}))} 
                            value={selectedType} 
                            onChange={setSelectedType} 
                        />
                    </div>
                    <div className="relative w-full md:w-32 mt-auto pb-0.5 group">
                        <input 
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" 
                            placeholder="ค้นหา..." 
                            value={searchTerm} 
                            onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                        />
                        <Search size={14} className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors"/>
                    </div>
                    <button onClick={loadSubtypes} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500 shadow-sm mt-auto mb-0.5">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
                    </button>
                    <Button 
                        onClick={handleCreate} 
                        disabled={!selectedType}
                        className="bg-primary-800 hover:bg-primary-900 text-white rounded-xl py-2.5 px-6 font-black shadow-lg mt-auto mb-0.5 disabled:opacity-50"
                    >
                        <Plus size={18}/> {t('btn.add')}
                    </Button>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-xs text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-32">Subtype Code</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px]">Description</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-32">IDP Code</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Status</th>
                                <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && subtypes.length === 0 ? (
                                <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={32}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Subtypes...</span></td></tr>
                            ) : currentItems.map(s => (
                                <tr key={s.product_subtype_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                                    <td className="py-1 px-3 align-middle font-mono font-bold text-primary-700">
                                        <div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{s.product_subtype_code}</div>
                                    </td>
                                    <td className="py-1 px-3 align-middle">
                                        <div className="font-bold text-slate-800">{s.description}</div>
                                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">{s.desc_eng || '-'}</div>
                                    </td>
                                    <td className="py-1 px-3 align-middle text-slate-500 font-mono text-[10px]">
                                        {s.idp_code || '-'}
                                    </td>
                                    <td className="py-1 px-3 align-middle text-center">
                                        {s.is_status === 'Y' ? (
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
                                            <button onClick={() => handleEdit(s)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg" title="Edit"><Edit size={14}/></button>
                                            <button onClick={() => handleDelete(s)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && currentItems.length === 0 && (
                                <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">No records found for this combination</td></tr>
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
