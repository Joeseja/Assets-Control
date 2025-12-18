
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination, LoadingOverlay } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup, MasterType, MasterSubtype } from '../types';
import { 
  Edit, Trash2, Plus, Save, Database, X, Search, RefreshCw, Layers, ChevronRight, Activity, Cpu
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProductSubtype = () => {
    const { t } = useLanguage();
    
    // Super Max Atomic Cascade States
    const [groups, setGroups] = useState<MasterGroup[]>([]);
    const [types, setTypes] = useState<MasterType[]>([]);
    const [subtypes, setSubtypes] = useState<MasterSubtype[]>([]);
    
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [loading, setLoading] = useState(false);

    // List & Form Precision States
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [form, setForm] = useState<MasterSubtype>({
        product_group_code: '',
        product_type_code: '',
        product_subtype_code: '',
        description: '',
        is_status: 'Y'
    });
    const [editMode, setEditMode] = useState<'create'|'update'>('create');

    // --- Core Atomic Synchronization ---

    // 1. Initial Cluster Load
    useEffect(() => {
        const initKernel = async () => {
            setLoading(true);
            try {
                const g = await api.getMasterGroups();
                const groupData = Array.isArray(g) ? g : [];
                setGroups(groupData);
                if (groupData.length > 0 && !selectedGroup) {
                  setSelectedGroup(String(groupData[0].product_group_code));
                }
            } catch(e) { console.error("CRITICAL ERROR: Initial Group Cluster Failure", e); }
            finally { setLoading(false); }
        };
        initKernel();
    }, []);

    // 2. Cascade Layer 1 Reset (Group -> Clear Child Nodes)
    const handleGroupSwitch = useCallback((newGroupId: string) => {
        setLoading(true);
        setSelectedGroup(newGroupId);
        setSelectedType(''); 
        setSubtypes([]);     
        setTypes([]);        
        setCurrentPage(1);
    }, []);

    // 3. Layer 2 Sync (Type -> Triggered by Group established)
    useEffect(() => {
        if (!selectedGroup) return;
        const syncTypeLayer = async () => {
            setLoading(true);
            try {
                const tRes = await api.getMasterTypes(selectedGroup);
                const typeData = Array.isArray(tRes) ? tRes : [];
                setTypes(typeData);
                // Atomic auto-bind or purge
                if (typeData.length > 0) setSelectedType(String(typeData[0].product_type_code));
                else setSelectedType('');
            } catch(e) { setTypes([]); }
            finally { setLoading(false); }
        };
        syncTypeLayer();
    }, [selectedGroup]);

    // 4. Layer 3 Sync (Subtype -> Final Data Plane)
    useEffect(() => {
        const syncDataPlane = async () => {
            if (!selectedGroup || !selectedType) {
                setSubtypes([]);
                return;
            }
            setLoading(true);
            try {
                const data = await api.getMasterSubtypes(selectedGroup, selectedType);
                setSubtypes(Array.isArray(data) ? data : []);
                setCurrentPage(1); 
            } catch(e) { setSubtypes([]); }
            finally { setLoading(false); }
        };
        syncDataPlane();
    }, [selectedGroup, selectedType]);

    const handleEditInitiate = (item: MasterSubtype) => {
        setForm({ ...item }); 
        setEditMode('update'); 
        setIsEditing(true);
    };

    const handlePurge = async (scode: string) => {
        if (!confirm(t('msg.confirm_delete'))) return;
        setLoading(true);
        try {
            await api.deleteMasterSubtype(selectedGroup, selectedType, scode);
            const data = await api.getMasterSubtypes(selectedGroup, selectedType);
            setSubtypes(Array.isArray(data) ? data : []);
        } catch(e) { alert(t('msg.delete_fail')); }
        finally { setLoading(false); }
    };

    const handleCommit = async () => {
        if (!form.product_subtype_code || !form.description) return alert('PK Consistency Failure: Missing required attributes');
        setLoading(true);
        try {
            await api.saveMasterSubtype({...form, product_group_code: selectedGroup, product_type_code: selectedType});
            setIsEditing(false); 
            const data = await api.getMasterSubtypes(selectedGroup, selectedType);
            setSubtypes(Array.isArray(data) ? data : []);
        } catch(e) { alert(t('msg.save_fail')); }
        finally { setLoading(false); }
    };

    // Advanced Filtering Logic
    const filteredList = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return subtypes;
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
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <LoadingOverlay show={loading} />
                <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl sticky top-0 z-30 ring-1 ring-slate-900/5">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-primary-800 text-white rounded-[2rem] shadow-2xl relative group overflow-hidden transition-transform hover:rotate-3">
                           <Cpu size={40}/>
                           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-2 uppercase">
                                {editMode === 'create' ? 'Establish Node' : 'Overwrite Node'}
                            </h1>
                            <div className="flex items-center gap-3">
                                <Badge type="primary">{selectedGroup}</Badge>
                                <ChevronRight size={14} className="text-slate-300" />
                                <Badge type="neutral">{selectedType}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => setIsEditing(false)} className="px-10 border-2 border-slate-100">
                            <X size={20}/> {t('btn.cancel')}
                        </Button>
                        <Button onClick={handleCommit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-16 font-black shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] border-b-4 border-emerald-900/20" disabled={loading}>
                            <Save size={20}/> COMMIT DATA
                        </Button>
                    </div>
                </div>
                
                <Card className="border-0 shadow-2xl rounded-[3rem] ring-1 ring-slate-100 relative overflow-hidden bg-white">
                    <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-emerald-500 to-emerald-600"></div>
                    <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <Input label="Sub-Class Identity Code (PK) *" dbField="product_subtype_code" value={form.product_subtype_code} onChange={e => setForm({...form, product_subtype_code: e.target.value.toUpperCase()})} disabled={editMode==='update'} className={editMode==='update' ? 'bg-slate-50 font-black text-primary-900 border-dashed opacity-60' : 'font-black text-primary-800'} />
                        <Input label="Canonical Thai Labeling *" dbField="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="font-bold" />
                        <Input label="Canonical English Labeling" dbField="desc_eng" value={form.desc_eng || ''} onChange={e => setForm({...form, desc_eng: e.target.value})} />
                        <Input label="External IDP Registry Mapping" dbField="idp_code" value={form.idp_code || ''} onChange={e => setForm({...form, idp_code: e.target.value})} placeholder="Node Index ID..." />
                        
                        <div className="md:col-span-2 mt-6 pt-12 border-t-4 border-slate-50">
                             <label className={`flex items-center gap-8 cursor-pointer p-10 rounded-[2.5rem] border-4 transition-all group ${form.is_status === 'Y' ? 'bg-emerald-50/50 border-emerald-100 shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
                                <div className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center transition-all ${form.is_status === 'Y' ? 'bg-emerald-600 border-emerald-500 shadow-xl scale-110' : 'bg-white border-slate-300 opacity-40'}`}>
                                    {form.is_status === 'Y' && <Activity size={28} className="text-white animate-pulse" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={form.is_status === 'Y'} onChange={e => setForm({...form, is_status: e.target.checked ? 'Y' : 'N'})} />
                                <div className="flex-1">
                                    <span className={`block font-black text-lg uppercase tracking-widest ${form.is_status === 'Y' ? 'text-emerald-800' : 'text-slate-400'}`}>Operational Access Control</span>
                                    <p className="text-[12px] text-slate-400 font-bold group-hover:text-primary-600 transition-colors mt-1">Determines whether this node is accessible for material transactions and procurement modules.</p>
                                </div>
                             </label>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 h-full flex flex-col animate-in fade-in duration-500 overflow-hidden pb-4">
            <LoadingOverlay show={loading} />
            
            {/* Control Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-6 rounded-[3rem] border border-slate-200 shadow-xl gap-8 shrink-0 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-primary-800 text-white rounded-[2rem] shadow-2xl relative transition-transform hover:scale-105 active:scale-95"><Database size={36}/></div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-2 uppercase">{t('menu.master_product_subtype')}</h1>
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                           <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em]">Hierarchical Maintenance Cluster</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
                    <div className="w-full md:w-72"><SearchableSelect label="1. Category Layer" options={groups.map(g => ({value: String(g.product_group_code), label: g.description}))} value={selectedGroup} onChange={handleGroupSwitch} /></div>
                    <div className="w-full md:w-72"><SearchableSelect label="2. Class Layer" options={types.map(t => ({value: String(t.product_type_code), label: t.description}))} value={selectedType} onChange={setSelectedType} disabled={!selectedGroup || types.length === 0} /></div>
                    <div className="relative w-full md:w-56 mt-auto pb-0.5 group">
                        <input className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-[12px] font-black focus:outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500/30 transition-all placeholder:text-slate-300" placeholder="TERMINAL SEARCH..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                        <Search size={20} className="absolute left-4 top-4 text-slate-300 group-focus-within:text-primary-600 transition-colors"/>
                    </div>
                    <Button onClick={() => { if(!selectedGroup || !selectedType) return alert('Binding Error: Selection nodes incomplete'); setForm({product_group_code: selectedGroup, product_type_code: selectedType, product_subtype_code:'', description:'', is_status:'Y'}); setEditMode('create'); setIsEditing(true); }} className="bg-primary-800 hover:bg-primary-900 text-white rounded-[1.5rem] py-4 px-10 font-black shrink-0 shadow-2xl active:scale-95 border-b-4 border-black/20"><Plus size={20}/> {t('btn.add')}</Button>
                </div>
            </div>

            {/* Data Plane */}
            <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] bg-white ring-1 ring-slate-100 relative">
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-xs text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-50/95 backdrop-blur-xl text-slate-700">
                                <th className="py-6 px-10 border-b border-slate-100 text-slate-500 font-black tracking-[0.3em] text-[10px] w-48 text-center uppercase">Node Address</th>
                                <th className="py-6 px-10 border-b border-slate-100 text-slate-500 font-black tracking-[0.3em] text-[10px] uppercase">Hierarchical Nomenclature</th>
                                <th className="py-6 px-10 border-b border-slate-100 text-slate-500 font-black tracking-[0.3em] text-[10px] w-48 text-center uppercase">Global Registry</th>
                                <th className="py-6 px-10 border-b border-slate-100 text-slate-500 font-black tracking-[0.3em] text-[10px] text-center w-36 uppercase">Status</th>
                                <th className="py-6 px-10 border-b border-slate-100 text-slate-500 font-black tracking-[0.3em] text-[10px] text-center w-36 uppercase">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {currentItems.map((s, idx) => (
                                <tr key={s.product_subtype_code} className={`group hover:bg-slate-50 transition-all duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                                    <td className="py-5 px-10 align-middle font-mono font-bold text-primary-800">
                                        <div className="bg-primary-50 border border-primary-100/50 px-4 py-3 rounded-2xl text-center shadow-xs font-black group-hover:scale-105 transition-transform">
                                            {s.product_subtype_code}
                                        </div>
                                    </td>
                                    <td className="py-5 px-10 align-middle">
                                        <div className="font-black text-slate-800 group-hover:text-primary-800 transition-colors uppercase tracking-tight text-sm mb-1.5">{s.description}</div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] truncate max-w-[500px] flex items-center gap-2.5">
                                            <Layers size={14} className="opacity-30" /> 
                                            {s.desc_eng || 'System: No Alternate Label Detected'}
                                        </div>
                                    </td>
                                    <td className="py-5 px-10 align-middle text-center"><span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 font-black">{s.idp_code || 'NULL_PTR'}</span></td>
                                    <td className="py-5 px-10 align-middle text-center"><Badge type={s.is_status==='Y'?'success':'neutral'}>{s.is_status}</Badge></td>
                                    <td className="py-5 px-10 align-middle">
                                        <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                                            <button onClick={() => handleEditInitiate(s)} className="p-3 text-primary-600 hover:bg-white rounded-2xl shadow-lg bg-white border border-slate-100 hover:border-primary-300 active:scale-75 transition-all" title="Modify Node"><Edit size={20}/></button>
                                            <button onClick={() => handlePurge(s.product_subtype_code)} className="p-3 text-rose-600 hover:bg-white rounded-2xl shadow-lg bg-white border border-slate-100 hover:border-rose-300 active:scale-75 transition-all" title="Purge Node"><Trash2 size={20}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentItems.length === 0 && !loading && (
                                <tr><td colSpan={5} className="p-72 text-center grayscale">
                                    <div className="relative inline-block mb-10">
                                       <Database size={80} className="mx-auto text-slate-200" strokeWidth={1} />
                                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-rose-400 rounded-full animate-ping"></div>
                                    </div>
                                    <p className="text-slate-400 font-black uppercase tracking-[0.8em] text-[12px] leading-relaxed">Cluster Buffer Empty<br/><span className="text-[10px] opacity-40 font-bold mt-3 block tracking-widest">Adjust hierarchical selectors to scan data nodes</span></p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalItems={filteredList.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </Card>
        </div>
    );
};
