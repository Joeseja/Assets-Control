
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Select } from '../components/ui';
import { api } from '../services/apiService';
import { CompanyItem, MsProject } from '../types';
import { 
  Edit, Trash2, Plus, Save, X, Building2, Search, Settings, DollarSign, Home, Zap, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProject = () => {
    const { t } = useLanguage();
    const [viewMode, setViewMode] = useState<'LIST'|'FORM'>('LIST');
    const [projectList, setProjectList] = useState<MsProject[]>([]);
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [activeTab, setActiveTab] = useState<'GENERAL'|'STRUCTURE'|'METER'|'FINANCE'>('GENERAL');
    const [loading, setLoading] = useState(false);
    
    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const initialForm: MsProject = {
        project_code: '',
        description: '',
        comp_code: '',
        is_status: 'Y',
        is_project_type: 'H',
        is_lease: 'N', is_bg: 'N', is_opm: 'N', is_bud: 'N', is_con: 'N', is_mtop: 'N', is_case: 'N', is_rf: 'N', is_labor: 'N', is_notime: 'N', is_group: 'N',
        is_monthn_e: '1', note_sday_e: 0, note_eday_e: 0, is_monthp_e: '1', paid_sday_e: 0, paid_eday_e: 0,
        is_monthn_w: '1', note_sday_w: 0, note_eday_w: 0, is_monthp_w: '1', paid_sday_w: 0, paid_eday_w: 0,
        fund_amount: 0, center_amount: 0, meter_water: 0, meter_electric: 0, install_water: 0, install_electric: 0,
        room_qty: 0, tax_percent: 0, total_area_qty: 0, building_year: 0,
        tower_no: 0, floor_no: 0, level_no: 0
    };

    const [form, setForm] = useState<MsProject>(initialForm);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => { loadInitData(); }, []);

    const loadInitData = async () => {
        setLoading(true);
        try {
            const [comps, projs] = await Promise.all([api.getCompanies(), api.getMsProjectsList()]);
            setCompanies(comps || []);
            setProjectList(Array.isArray(projs) ? projs : []);
            setCurrentPage(1);
        } catch(e) { 
            console.error("MasterProject Load Error:", e);
            setProjectList([]);
        }
        setLoading(false);
    };

    const handleCreate = () => {
        setForm({...initialForm, comp_code: companies[0]?.comp_code || ''});
        setIsEditMode(false); setViewMode('FORM'); setActiveTab('GENERAL');
    };

    const handleEdit = async (code: string) => {
        try {
            const data = await api.getMsProjectDetail(code);
            if (data) {
                setForm(data); setIsEditMode(true); setViewMode('FORM'); setActiveTab('GENERAL');
            }
        } catch(e) { alert('Load Failed'); }
    };

    const handleSave = async () => {
        if (!form.project_code || !form.description) return alert('Required fields missing (Code, Description)');
        try {
            await api.saveMsProject(form);
            alert('Saved Successfully'); setViewMode('LIST'); loadInitData();
        } catch(e) { alert('Save Failed'); }
    };

    const handleDelete = async (code: string) => {
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMsProject(code);
            loadInitData();
        } catch(e) { alert('Delete Failed'); }
    };

    const updateForm = (field: keyof MsProject, val: any) => { setForm(prev => ({ ...prev, [field]: val })); };
    const toggleCheck = (field: keyof MsProject) => { setForm(prev => ({ ...prev, [field]: prev[field] === 'Y' ? 'N' : 'Y' })); };

    // Filter Logic
    const filteredList = useMemo(() => {
        return (projectList || []).filter(p => 
            (p.project_code || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projectList, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const goToPage = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

    if (viewMode === 'LIST') {
        return (
            <div className="w-full h-full flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-between items-center shrink-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Building2 size={24} /></div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('menu.master_project')}</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Maintenance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input 
                                type="text" 
                                placeholder="Search Code/Name..." 
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <Search size={14} className="absolute left-3 top-3 text-slate-400"/>
                        </div>
                        <button onClick={loadInitData} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"><RefreshCw size={20} className={loading ? 'animate-spin' : ''}/></button>
                        <Button onClick={handleCreate} className="bg-primary-800 hover:bg-primary-900 text-white rounded-xl px-6 font-black"><Plus size={18} /> {t('btn.add')}</Button>
                    </div>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-xs text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                                    <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] w-32">Project Code</th>
                                    <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px]">Description</th>
                                    <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] w-48">Company</th>
                                    <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] text-center w-24">Status</th>
                                    <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] text-center w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading && projectList.length === 0 ? (
                                    <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={32}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{t('loading')}</span></td></tr>
                                ) : currentItems.map((p, idx) => (
                                    <tr key={p.project_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                                        <td className="py-1 px-3 align-middle font-mono font-bold text-primary-700">
                                            <div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{p.project_code}</div>
                                        </td>
                                        <td className="py-1 px-3 align-middle font-bold text-slate-800">{p.description}</td>
                                        <td className="py-1 px-3 align-middle text-slate-500 font-mono text-[10px] uppercase">{p.comp_code}</td>
                                        <td className="py-1 px-3 align-middle text-center">
                                            {p.is_status === 'Y' ? (
                                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                                            ) : (
                                                <span className="inline-block w-2 h-2 rounded-full bg-slate-300" title="Inactive"></span>
                                            )}
                                        </td>
                                        <td className="py-1 px-3 align-middle">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleEdit(p.project_code)} className="p-1 text-primary-600 hover:bg-primary-50 rounded" title="Edit"><Edit size={14}/></button>
                                                <button onClick={() => handleDelete(p.project_code)} className="p-1 text-rose-600 hover:bg-rose-50 rounded" title="Delete"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && !loading && (
                                    <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">No records found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-200 px-3 py-2 bg-slate-50 flex justify-between items-center shrink-0 shadow-sm z-20">
                        <div className="text-[11px] text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredList.length)}</span> of <span className="font-bold text-slate-700">{filteredList.length}</span> entries
                        </div>
                        
                        <div className="flex items-center space-x-1">
                            <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-500"><ChevronsLeft size={14} /></button>
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-500"><ChevronLeft size={14} /></button>
                            <div className="flex items-center space-x-2 px-2 border-l border-r border-slate-200 mx-1">
                                <span className="text-[11px] text-slate-500 font-medium">Page</span>
                                <select value={currentPage} onChange={(e) => goToPage(Number(e.target.value))} className="h-6 text-[11px] border border-slate-300 rounded px-1 bg-white focus:outline-none font-bold text-primary-700 min-w-[50px]">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <span className="text-[11px] text-slate-500 font-medium">of {totalPages}</span>
                            </div>
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-500"><ChevronRight size={14} /></button>
                            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-500"><ChevronsRight size={14} /></button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col space-y-4 pb-20 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-800 text-white rounded-xl"><Building2 size={24}/></div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">{isEditMode ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่'}</h1>
                </div>
                <Button variant="secondary" onClick={() => setViewMode('LIST')} className="rounded-xl px-6"><X size={16}/> {t('btn.cancel')}</Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                <Card className="p-6 border-0 shadow-xl ring-1 ring-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-sm">
                         <div className="md:col-span-3">
                            <Input label="รหัสโครงการ *" dbField="project_code" value={form.project_code} onChange={e => updateForm('project_code', e.target.value)} disabled={isEditMode} className={isEditMode?'bg-slate-50 font-black':''} />
                         </div>
                         <div className="md:col-span-6">
                            <Input label="ชื่อโครงการ *" dbField="description" value={form.description} onChange={e => updateForm('description', e.target.value)} />
                         </div>
                         <div className="md:col-span-3">
                            <SearchableSelect label="บริษัทหลัก" dbField="comp_code" options={companies.map(c => ({value:c.comp_code, label:c.comp_name}))} value={form.comp_code} onChange={v => updateForm('comp_code', v)} />
                         </div>
                    </div>
                </Card>

                <div className="flex gap-2 border-b border-slate-200 bg-white px-2 pt-2 rounded-t-xl sticky top-0 z-10 shadow-sm">
                    {[{id:'GENERAL', icon:Settings, label:'ข้อมูลทั่วไป'}, {id:'STRUCTURE', icon:Home, label:'โครงสร้าง/บริษัท'}, {id:'METER', icon:Zap, label:'มิเตอร์น้ำ/ไฟ'}, {id:'FINANCE', icon:DollarSign, label:'การเงิน/โอนกรรมสิทธิ์'}].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-2 font-black text-[11px] uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-primary-600 text-primary-700 bg-primary-50/30' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}><tab.icon size={14}/> {tab.label}</button>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-b-xl shadow-xl border border-t-0 border-slate-200 text-xs min-h-[300px]">
                    {activeTab === 'GENERAL' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Input label="ชื่อโครงการ (REM)" dbField="project_name_rem" value={form.project_name_rem || ''} onChange={e => updateForm('project_name_rem', e.target.value)} />
                                <Input label="Project Brand" dbField="project_brand_code" value={form.project_brand_code || ''} onChange={e => updateForm('project_brand_code', e.target.value)} />
                                <Input label="รหัสโครงการนิติบุคคล" dbField="project_legal_code" value={form.project_legal_code || ''} onChange={e => updateForm('project_legal_code', e.target.value)} />
                                <Input label="รหัสโครงการ (RMS)" dbField="rms_code" value={form.rms_code || ''} onChange={e => updateForm('rms_code', e.target.value)} />
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 ring-4 ring-slate-50/50">
                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-2">Configuration Flags</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[{k:'is_status', l:'Active Status'}, {k:'is_lease', l:'Lease Project'}, {k:'is_bg', l:'Use Budget'}, {k:'is_mtop', l:'Use MTOP'}, {k:'is_case', l:'Is Case'}, {k:'is_rf', l:'Is RF'}, {k:'is_labor', l:'Is Labor'}, {k:'is_notime', l:'No Time'}, {k:'is_group', l:'Is Group'}].map(f => (
                                            <label key={f.k} className="flex items-center justify-between p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
                                                <span className="font-bold text-slate-600 group-hover:text-primary-700">{f.l}</span>
                                                <input type="checkbox" checked={(form as any)[f.k] === 'Y'} onChange={() => toggleCheck(f.k as keyof MsProject)} className="w-4 h-4 accent-primary-600 rounded"/>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 sticky bottom-0 bg-slate-50/90 backdrop-blur-sm p-4 border-t border-slate-200 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Button variant="secondary" onClick={() => setViewMode('LIST')} className="rounded-xl px-8 font-bold">{t('btn.cancel')}</Button>
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-12 font-black shadow-lg shadow-emerald-600/20"><Save size={18}/> {t('btn.save')}</Button>
            </div>
        </div>
    );
};
