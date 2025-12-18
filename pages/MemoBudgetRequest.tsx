
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SearchableSelect, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MemoBudgetHead, MemoBudgetCompany, MemoBudgetProject, MemoBudgetBgCode, CompanyItem, ProjectItem, StaffItem } from '../types';
import { Save, Trash2, Plus, RefreshCw, FileText, Search, X, Lock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Printer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MemoBudgetPreview } from './MemoBudgetPreview';

export const MemoBudgetRequest = () => {
    const { t } = useLanguage();

    // -- STATE --
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isVpLocked, setIsVpLocked] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    // Header State
    const [memoNo, setMemoNo] = useState('');
    const [memoDate, setMemoDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [targetStaff, setTargetStaff] = useState('');
    const [department, setDepartment] = useState('');
    const [userRms, setUserRms] = useState('');
    const [isFirst, setIsFirst] = useState('2');
    const [remark, setRemark] = useState('');
    const [approver, setApprover] = useState('');
    const [preparer, setPreparer] = useState('');
    const [vpCode, setVpCode] = useState(''); // VP Code State

    // Tabs Data
    const [activeTab, setActiveTab] = useState<'COMPANY'|'PROJECT'|'BGCODE'>('COMPANY');
    const [tabCompanies, setTabCompanies] = useState<MemoBudgetCompany[]>([]);
    const [tabProjects, setTabProjects] = useState<MemoBudgetProject[]>([]);
    const [tabBgCodes, setTabBgCodes] = useState<MemoBudgetBgCode[]>([]);

    // Master Data
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [staffList, setStaffList] = useState<StaffItem[]>([]);
    
    // Search Modal State
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState({
        department_name: '',
        is_auth: '',
        memo_no: '',
        staff_name: ''
    });
    const [searchResults, setSearchResults] = useState<any[]>([]);
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 30;

    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            const c = await api.getCompanies().catch(e => []);
            setCompanies(c || []);
            const s = await api.getStaff().catch(e => []);
            setStaffList(s || []);
            if (s.length > 0) setPreparer(s[0].staff_code);
        } catch (e) {
            console.error("Load Master Error", e);
        }
    };

    useEffect(() => {
        const fetchProj = async () => {
            if (selectedCompany) {
               const p = await api.getProjects(selectedCompany).catch(e => []);
               setProjects(p || []);
            }
        };
        fetchProj();
    }, [selectedCompany]);

    const handleNew = () => {
        setMemoNo('');
        setMemoDate(new Date().toISOString().split('T')[0]);
        setTargetStaff('');
        setDepartment('');
        setUserRms('');
        setIsFirst('2');
        setRemark('');
        setApprover('');
        setVpCode('');
        setTabCompanies([]);
        setTabProjects([]);
        setTabBgCodes([]);
        setIsSaved(false);
        setIsVpLocked(false);
    };

    const handleSearch = async (val: string) => {
        if (!val) return;
        setIsLoading(true);
        try {
            const data = await api.getMemoBudget(val);
            if (data) {
                setMemoNo(data.head.memo_no);
                setMemoDate(data.head.memo_date.split('T')[0]);
                setTargetStaff(data.head.memo_staff_code || '');
                setDepartment(data.head.department_code || '');
                setUserRms(data.head.user_rms || '');
                setIsFirst(data.head.is_first || '2'); 
                setRemark(data.head.remark || '');
                setApprover(data.head.approve_code || '');
                setPreparer(data.head.staff_code || '');
                setVpCode(data.head.vp_code || ''); // Load VP Code
                
                setTabCompanies(data.companies || []);
                setTabProjects(data.projects || []);
                setTabBgCodes(data.bgcodes || []);
                setIsSaved(true);

                if (data.head.is_vp === 'Y') setIsVpLocked(true);
                else setIsVpLocked(false);
            } else {
                alert(t('msg.no_data'));
            }
        } catch (e) {
            alert(t('msg.no_data'));
        }
        setIsLoading(false);
    };

    const handlePopupSearch = async (page = 1) => {
        const result = await api.searchMemoBudgetList(searchCriteria, page, pageSize);
        setSearchResults(result.data);
        setTotalRecords(result.total);
        setCurrentPage(page);
    };

    const handleSelectSearchResult = (item: any) => {
        setShowSearchModal(false);
        setMemoNo(item.memo_no);
        handleSearch(item.memo_no);
    };

    const handleSave = async () => {
        if (isVpLocked) return alert("เอกสารถูกล็อค (VP Approved)");
        
        const head: MemoBudgetHead = {
            memo_no: memoNo, 
            memo_date: memoDate,
            is_first: isFirst,
            staff_code: preparer,
            memo_staff_code: targetStaff,
            department_code: department,
            user_rms: userRms,
            approve_code: approver,
            vp_code: vpCode,
            remark: remark,
            is_status: 'ACTIVE'
        };

        setIsLoading(true);
        try {
            const res = await api.saveMemoBudget({
                head,
                companies: tabCompanies,
                projects: tabProjects,
                bgcodes: tabBgCodes
            });
            if (res.memo_no) setMemoNo(res.memo_no);
            setIsSaved(true);
            alert(t('msg.save_success'));
            if (res.memo_no) handleSearch(res.memo_no);
        } catch (e) {
            alert(t('msg.save_fail'));
        }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!isSaved) return;
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMemoBudget(memoNo);
            handleNew();
            alert(t('msg.delete_success'));
        } catch (e) {
            alert(t('msg.delete_fail'));
        }
    };

    const getCurrentHeadData = (): MemoBudgetHead => ({
        memo_no: memoNo,
        memo_date: memoDate,
        is_first: isFirst,
        staff_code: preparer,
        memo_staff_code: targetStaff,
        department_code: department,
        user_rms: userRms,
        approve_code: approver,
        vp_code: vpCode,
        remark: remark,
        is_status: 'ACTIVE',
        is_approve: 'Y', // Assume saved means approved for demo preview logic if needed, or stick to DB
        is_vp: isVpLocked ? 'Y' : 'N'
    });

    // ... (Tab Add/Remove Logic skipped for brevity, same as before) ...
    const addCompanyRow = () => { if (!isVpLocked) setTabCompanies([...tabCompanies, { memo_no: memoNo, comp_code: '', seq: tabCompanies.length + 1, is_active: 'Y', id: `new-${Date.now()}` }]); };
    const removeCompanyRow = (idx: number) => { if (!isVpLocked) { const l = [...tabCompanies]; l.splice(idx, 1); setTabCompanies(l); } };
    const addProjectRow = () => { if (!isVpLocked) setTabProjects([...tabProjects, { memo_no: memoNo, project_code: '', seq: tabProjects.length + 1, is_active: 'Y', id: `new-${Date.now()}` }]); };
    const removeProjectRow = (idx: number) => { if (!isVpLocked) { const l = [...tabProjects]; l.splice(idx, 1); setTabProjects(l); } };
    const addBgRow = () => { if (!isVpLocked) setTabBgCodes([...tabBgCodes, { memo_no: memoNo, budget_code: '', seq: tabBgCodes.length + 1, is_active: 'Y', id: `new-${Date.now()}` }]); };
    const removeBgRow = (idx: number) => { if (!isVpLocked) { const l = [...tabBgCodes]; l.splice(idx, 1); setTabBgCodes(l); } };

    return (
        <div className="w-full h-full space-y-4 pb-20">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-50 text-cyan-700 rounded-lg"><FileText size={24} /></div>
                    <h1 className="text-xl font-bold text-primary-900">{t('menu.memo_budget_request')}</h1>
                    {isVpLocked && (
                        <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full animate-pulse">
                            <Lock size={14} />
                            <span className="text-xs font-bold">เอกสารถูกล็อค (VP Approved)</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowPreview(true)} className="bg-slate-700 hover:bg-slate-800 text-white" disabled={!memoNo}>
                        <Search size={16}/> Preview
                    </Button>
                    <Button variant="secondary" onClick={handleNew}><RefreshCw size={16}/> {t('btn.clear')}</Button>
                    <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700" disabled={isVpLocked}><Save size={16}/> {t('btn.save')}</Button>
                    {isSaved && <Button variant="danger" onClick={handleDelete}><Trash2 size={16}/> {t('btn.delete')}</Button>}
                </div>
            </div>

            {/* Header Form */}
            <Card className="p-6 shadow-md border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 text-sm">
                    {/* Row 1 */}
                    <div className="lg:col-span-3">
                         <div className="flex flex-col space-y-1.5">
                             <label className="text-sm font-semibold text-slate-600 ml-1">
                                {t('memo.memo_no')}*
                                <span className="ml-2 text-[10px] text-rose-400 font-mono tracking-tighter opacity-80 select-none">[memo_no]</span>
                             </label>
                             <div className="flex gap-2">
                                <input 
                                    className={`flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${!memoNo ? 'placeholder-emerald-500/50' : ''}`}
                                    value={memoNo}
                                    onChange={(e) => setMemoNo(e.target.value)}
                                    placeholder={!memoNo ? "(Auto Generate)" : t('memo.memo_no')}
                                />
                                <button onClick={() => { setShowSearchModal(true); handlePopupSearch(1); }} className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                                    <Search size={18} />
                                </button>
                             </div>
                         </div>
                    </div>
                    <div className="lg:col-span-3">
                         <Input label={t('memo.date')} dbField="memo_date" type="date" value={memoDate} onChange={e => setMemoDate(e.target.value)} disabled={isVpLocked} />
                    </div>
                    <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
                        <div className="flex-1 w-full">
                           <SearchableSelect 
                                label={`${t('memo.company')}*`}
                                options={companies.map(c => ({value: c.comp_code, label: c.comp_name}))} 
                                value={selectedCompany} 
                                onChange={setSelectedCompany} 
                                disabled={isVpLocked}
                           />
                        </div>
                        <div className="flex-1 w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                             <span className="block text-xs font-bold text-rose-600 mb-2">
                                 {t('memo.has_user')}
                                 <span className="ml-2 text-[10px] text-rose-400 font-mono tracking-tighter opacity-80 select-none">[is_first]</span>
                             </span>
                             <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" className="accent-rose-600 w-4 h-4" checked={isFirst === '1'} onChange={() => setIsFirst('1')} disabled={isVpLocked} /> 
                                    <span className="text-slate-700">{t('memo.has_user_no')}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" className="accent-emerald-600 w-4 h-4" checked={isFirst === '2'} onChange={() => setIsFirst('2')} disabled={isVpLocked} /> 
                                    <span className="text-slate-700">{t('memo.has_user_yes')}</span>
                                </label>
                             </div>
                        </div>
                    </div>

                    {/* Rest of Form */}
                    <div className="lg:col-span-3"><Input label={t('memo.target_staff')} dbField="memo_staff_code" value={targetStaff} onChange={e => setTargetStaff(e.target.value)} disabled={isVpLocked} /></div>
                    <div className="lg:col-span-3"><Input label={t('memo.department')} dbField="department_code" value={department} onChange={e => setDepartment(e.target.value)} disabled={isVpLocked} /></div>
                    <div className="lg:col-span-3"><Input label={t('memo.email')} disabled placeholder="-" className="bg-slate-100 text-slate-500" /></div>
                    <div className="lg:col-span-3"><Input label={t('memo.user_rms')} dbField="user_rms" value={userRms} onChange={e => setUserRms(e.target.value)} disabled={isVpLocked} /></div>
                    <div className="lg:col-span-12"><Input label={t('memo.remark')} dbField="remark" value={remark} onChange={e => setRemark(e.target.value)} disabled={isVpLocked} /></div>

                    {/* Approver & VP */}
                    <div className="lg:col-span-4">
                        <SearchableSelect label={t('memo.approver')} dbField="approve_code" options={staffList.map(s => ({value: s.staff_code, label: `${s.staff_code} : ${s.staff_name}`}))} value={approver} onChange={setApprover} disabled={isVpLocked} />
                    </div>
                    <div className="lg:col-span-4">
                        <SearchableSelect label="VP/AVP/Mg (vp_code)" dbField="vp_code" options={staffList.map(s => ({value: s.staff_code, label: `${s.staff_code} : ${s.staff_name}`}))} value={vpCode} onChange={setVpCode} disabled={isVpLocked} />
                    </div>
                    <div className="lg:col-span-4">
                        <SearchableSelect label={t('memo.preparer')} dbField="staff_code" options={staffList.map(s => ({value: s.staff_code, label: `${s.staff_code} : ${s.staff_name}`}))} value={preparer} onChange={setPreparer} disabled className="bg-slate-100" />
                    </div>
                </div>
            </Card>

            {/* Tabs & Grids (Simplified for brevity as they are unchanged) */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50">
                    <button onClick={() => setActiveTab('COMPANY')} className={`px-8 py-4 text-sm font-bold border-b-2 ${activeTab === 'COMPANY' ? 'border-cyan-600 text-cyan-700 bg-white' : 'text-slate-500'}`}>{t('memo.tab_company')}</button>
                    <button onClick={() => setActiveTab('PROJECT')} className={`px-8 py-4 text-sm font-bold border-b-2 ${activeTab === 'PROJECT' ? 'border-cyan-600 text-cyan-700 bg-white' : 'text-slate-500'}`}>{t('memo.tab_project')}</button>
                    <button onClick={() => setActiveTab('BGCODE')} className={`px-8 py-4 text-sm font-bold border-b-2 ${activeTab === 'BGCODE' ? 'border-cyan-600 text-cyan-700 bg-white' : 'text-slate-500'}`}>{t('memo.tab_bgcode')}</button>
                </div>
                <div className="p-6 min-h-[200px]">
                    {activeTab === 'COMPANY' && (
                        <div>
                            <div className="flex justify-end mb-2"><Button size="sm" onClick={addCompanyRow}><Plus size={14}/> Add</Button></div>
                            <table className="w-full text-sm border">
                                <thead className="bg-slate-100"><tr><th className="p-2">Seq</th><th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2">Del</th></tr></thead>
                                <tbody>
                                    {tabCompanies.map((r, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2 text-center">{i+1}</td>
                                            <td className="p-2"><select className="w-full" value={r.comp_code} onChange={e => {
                                                const l = [...tabCompanies]; l[i].comp_code = e.target.value; setTabCompanies(l);
                                            }}>{companies.map(c => <option key={c.comp_code} value={c.comp_code}>{c.comp_code}</option>)}</select></td>
                                            <td className="p-2">{companies.find(c => c.comp_code === r.comp_code)?.comp_name}</td>
                                            <td className="p-2 text-center"><button onClick={() => removeCompanyRow(i)} className="text-red-500"><Trash2 size={16}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 'PROJECT' && (
                        <div>
                            <div className="flex justify-end mb-2"><Button size="sm" onClick={addProjectRow}><Plus size={14}/> Add</Button></div>
                            <table className="w-full text-sm border">
                                <thead className="bg-slate-100"><tr><th className="p-2">Seq</th><th className="p-2">Project</th><th className="p-2">Name</th><th className="p-2">Del</th></tr></thead>
                                <tbody>
                                    {tabProjects.map((r, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2 text-center">{i+1}</td>
                                            <td className="p-2"><select className="w-full" value={r.project_code} onChange={e => {
                                                const l = [...tabProjects]; l[i].project_code = e.target.value; setTabProjects(l);
                                            }}>{projects.map(p => <option key={p.project_code} value={p.project_code}>{p.project_code}</option>)}</select></td>
                                            <td className="p-2">{projects.find(p => p.project_code === r.project_code)?.description}</td>
                                            <td className="p-2 text-center"><button onClick={() => removeProjectRow(i)} className="text-red-500"><Trash2 size={16}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 'BGCODE' && (
                        <div>
                            <div className="flex justify-end mb-2"><Button size="sm" onClick={addBgRow}><Plus size={14}/> Add</Button></div>
                            <table className="w-full text-sm border">
                                <thead className="bg-slate-100"><tr><th className="p-2">Seq</th><th className="p-2">Budget Code</th><th className="p-2">Del</th></tr></thead>
                                <tbody>
                                    {tabBgCodes.map((r, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2 text-center">{i+1}</td>
                                            <td className="p-2"><input className="w-full border rounded px-2" value={r.budget_code} onChange={e => {
                                                const l = [...tabBgCodes]; l[i].budget_code = e.target.value; setTabBgCodes(l);
                                            }} /></td>
                                            <td className="p-2 text-center"><button onClick={() => removeBgRow(i)} className="text-red-500"><Trash2 size={16}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* SEARCH MODAL */}
            {showSearchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-primary-900 text-white p-5 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Search size={24}/> {t('memo.search_title')}</h2>
                            <button onClick={() => setShowSearchModal(false)}><X size={24}/></button>
                        </div>
                        <div className="p-6 border-b border-slate-200">
                            <div className="grid grid-cols-4 gap-4">
                                <Input label={t('memo.memo_no')} value={searchCriteria.memo_no} onChange={e => setSearchCriteria({...searchCriteria, memo_no: e.target.value})} />
                                <div className="flex items-end gap-2">
                                    <Button onClick={() => handlePopupSearch(1)}><Search size={16}/> Search</Button>
                                    <Button variant="secondary" onClick={() => setSearchCriteria({department_name:'', is_auth:'', memo_no:'', staff_name:''})}>Reset</Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 font-bold sticky top-0">
                                    <tr><th className="p-4">Memo No</th><th className="p-4">Date</th><th className="p-4">Staff</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Action</th></tr>
                                </thead>
                                <tbody>
                                    {searchResults.map((item, idx) => (
                                        <tr key={idx} className="border-b hover:bg-slate-50">
                                            <td className="p-4 font-bold text-primary-700 cursor-pointer" onClick={() => handleSelectSearchResult(item)}>{item.memo_no}</td>
                                            <td className="p-4">{new Date(item.memo_date).toLocaleDateString()}</td>
                                            <td className="p-4">{item.staff_name}</td>
                                            <td className="p-4 text-center"><Badge>{item.is_status}</Badge></td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => { handleSelectSearchResult(item); setTimeout(() => setShowPreview(true), 200); }} className="text-cyan-600 hover:bg-cyan-50 p-2 rounded-full">
                                                    <Search size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {showPreview && (
                <MemoBudgetPreview 
                    head={getCurrentHeadData()}
                    companies={tabCompanies}
                    projects={tabProjects}
                    bgcodes={tabBgCodes}
                    masterCompanies={companies}
                    masterProjects={projects}
                    staffList={staffList}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
};
