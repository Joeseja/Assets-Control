
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { MemoBudgetHead, MemoBudgetCompany, MemoBudgetProject, MemoBudgetBgCode, CompanyItem, ProjectItem, StaffItem } from '../types';
import { 
    Save, Trash2, Plus, RefreshCw, FileText, Search, X, Lock, 
    ChevronLeft, ArrowLeft, Edit, Calendar, User, Layout, Building
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MemoBudgetPreview } from './MemoBudgetPreview';

export const MemoBudgetRequest = () => {
    const { t } = useLanguage();

    // -- VIEW MODE --
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // Updated to 12 items per page as requested

    // -- DATA STATE --
    const [memos, setMemos] = useState<any[]>([]);
    const [isSaved, setIsSaved] = useState(false);
    const [isVpLocked, setIsVpLocked] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    // Form Header State
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
    const [vpCode, setVpCode] = useState('');

    // Tabs Data
    const [activeTab, setActiveTab] = useState<'COMPANY'|'PROJECT'|'BGCODE'>('COMPANY');
    const [tabCompanies, setTabCompanies] = useState<MemoBudgetCompany[]>([]);
    const [tabProjects, setTabProjects] = useState<MemoBudgetProject[]>([]);
    const [tabBgCodes, setTabBgCodes] = useState<MemoBudgetBgCode[]>([]);

    // Master Data
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [staffList, setStaffList] = useState<StaffItem[]>([]);

    useEffect(() => {
        loadListData();
        loadMasterData();
    }, []);

    const loadListData = async () => {
        setIsLoading(true);
        try {
            const data = await api.getMemoBudgetList();
            setMemos(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        setIsLoading(false);
    };

    const loadMasterData = async () => {
        try {
            const [c, s] = await Promise.all([api.getCompanies(), api.getStaff()]);
            setCompanies(c || []);
            setStaffList(s || []);
            if (s.length > 0) setPreparer(s[0].staff_code);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const fetchProj = async () => {
            if (selectedCompany) {
               const p = await api.getProjects(selectedCompany).catch(() => []);
               setProjects(p || []);
            }
        };
        fetchProj();
    }, [selectedCompany]);

    const handleEdit = async (no: string) => {
        setIsLoading(true);
        try {
            const data = await api.getMemoBudget(no);
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
                setVpCode(data.head.vp_code || '');
                setTabCompanies(data.companies || []);
                setTabProjects(data.projects || []);
                setTabBgCodes(data.bgcodes || []);
                setIsSaved(true);
                setIsVpLocked(data.head.is_vp === 'Y');
                setViewMode('form');
            }
        } catch (e) { alert("ไม่พบข้อมูลเอกสาร"); }
        setIsLoading(false);
    };

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
        setViewMode('form');
    };

    const handleSave = async () => {
        if (isVpLocked) return alert("เอกสารถูกล็อค (VP Approved)");
        setIsLoading(true);
        try {
            const head: MemoBudgetHead = {
                memo_no: memoNo, memo_date: memoDate, is_first: isFirst,
                staff_code: preparer, memo_staff_code: targetStaff,
                department_code: department, user_rms: userRms,
                approve_code: approver, vp_code: vpCode, remark: remark, is_status: 'ACTIVE'
            };
            const res = await api.saveMemoBudget({ head, companies: tabCompanies, projects: tabProjects, bgcodes: tabBgCodes });
            alert(t('msg.save_success'));
            setViewMode('list');
            loadListData();
        } catch (e) { alert(t('msg.save_fail')); }
        setIsLoading(false);
    };

    const filteredMemos = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return memos.filter(m => 
            (m.memo_no || '').toLowerCase().includes(term) ||
            (m.department_code || '').toLowerCase().includes(term) ||
            (m.target_name || '').toLowerCase().includes(term)
        );
    }, [memos, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredMemos.slice(start, start + itemsPerPage);
    }, [filteredMemos, currentPage]);

    // --- LIST VIEW RENDERING ---
    if (viewMode === 'list') {
        return (
            <div className="space-y-4 h-full flex flex-col animate-in fade-in text-xs font-sans">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-800 text-white rounded-lg shadow-md"><FileText size={18} /></div>
                        <div>
                            <h1 className="text-sm font-black text-slate-800 leading-none">ระบบขออนุมัติงบประมาณ (Memo Budget)</h1>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1">Budget Access Approval Records</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-cyan-500/10" placeholder="ค้นหาเลขที่บันทึก หรือ แผนก..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                            <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
                        </div>
                        <button onClick={loadListData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/></button>
                        <Button onClick={handleNew} size="sm" className="bg-cyan-800 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider"><Plus size={14} /> สร้างบันทึกใหม่</Button>
                    </div>
                </div>

                <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                                    <th className="py-1.5 px-4 border-b border-slate-200 w-32 text-center">วันที่</th>
                                    <th className="py-1.5 px-4 border-b border-slate-200 w-40">เลขที่บันทึก</th>
                                    <th className="py-1.5 px-4 border-b border-slate-200">ผู้ขอ / แผนก</th>
                                    <th className="py-1.5 px-4 border-b border-slate-200 w-32 text-center">สถานะ</th>
                                    <th className="py-1.5 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading && memos.length === 0 ? (
                                    <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Records...</td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลบันทึกงบประมาณ</td></tr>
                                ) : (
                                    currentItems.map(m => (
                                        <tr key={m.memo_no} className="group hover:bg-cyan-50/30 transition-all duration-150 cursor-pointer" onClick={() => handleEdit(m.memo_no)}>
                                            <td className="py-1 px-4 text-center align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{new Date(m.memo_date).toLocaleDateString('th-TH')}</span>
                                                    <span className="text-[9px] text-slate-400 font-mono italic">#{m.staff_code}</span>
                                                </div>
                                            </td>
                                            <td className="py-1 px-4 font-mono font-black text-cyan-700 align-middle"><div className="bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded text-center shadow-sm">{m.memo_no}</div></td>
                                            <td className="py-1 px-4 align-middle">
                                                <div className="font-bold text-slate-800 uppercase leading-none mb-1 text-[11px]">{m.target_name || m.memo_staff_code}</div>
                                                <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                                    <Building size={10} className="text-slate-300"/> Dept: {m.department_code || '-'}
                                                </div>
                                            </td>
                                            <td className="py-1 px-4 text-center align-middle">
                                                {m.is_vp === 'Y' ? (
                                                    <Badge type="success"><div className="flex items-center gap-1"><Lock size={10}/> LOCKED</div></Badge>
                                                ) : (
                                                    <Badge type="primary">ACTIVE</Badge>
                                                )}
                                            </td>
                                            <td className="py-1 px-4 text-center align-middle">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(m.memo_no); }} className="p-1 text-cyan-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-cyan-100"><Edit size={14}/></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Integrated dynamic pagination with Jump-to-Page and full controls */}
                    <Pagination currentPage={currentPage} totalItems={filteredMemos.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                </Card>
            </div>
        );
    }

    // --- FORM VIEW RENDERING (UNCHANGED CORE LOGIC, WRAPPED IN TRANSITION UI) ---
    return (
        <div className="w-full h-full space-y-4 pb-20 animate-in fade-in duration-300 text-xs font-sans">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-cyan-600"><ArrowLeft size={18}/></button>
                    <div className="p-2 bg-cyan-800 text-white rounded-lg shadow-lg"><FileText size={20} /></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">{isSaved ? 'แก้ไขบันทึกขออนุมัติงบประมาณ' : 'สร้างบันทึกขออนุมัติงบประมาณใหม่'}</h1>
                        <p className="text-slate-400 text-[9px] font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
                           Transaction Mode: memo_budget_head {isVpLocked && <Badge type="success"><Lock size={10}/> LOCKED</Badge>}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowPreview(true)} size="sm" className="bg-slate-700 hover:bg-slate-800 text-white px-4" disabled={!memoNo}>
                        <Search size={14}/> Preview
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setViewMode('list')} className="px-4 border-slate-200 text-xs"><ArrowLeft size={14} /> กลับหน้ารายการ</Button>
                    <Button onClick={handleSave} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 font-black shadow-lg" disabled={isLoading || isVpLocked}>
                        {isLoading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} บันทึกเอกสาร
                    </Button>
                </div>
            </div>

            {/* Main Form Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card title="ข้อมูลผู้ร้องขอและงบประมาณ" className="lg:col-span-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input label="เลขที่บันทึก" dbField="memo_no" value={memoNo} onChange={e => setMemoNo(e.target.value)} disabled={isSaved} className="font-bold text-cyan-700" />
                        <Input label="วันที่บันทึก" dbField="memo_date" type="date" value={memoDate} onChange={e => setMemoDate(e.target.value)} icon={Calendar} disabled={isVpLocked} />
                        <div className="md:col-span-2">
                            <SearchableSelect label="บริษัทหลัก *" options={companies.map(c => ({value: c.comp_code, label: c.comp_name}))} value={selectedCompany} onChange={setSelectedCompany} disabled={isVpLocked} />
                        </div>
                        <Input label="พนักงานที่ขอ *" dbField="memo_staff_code" value={targetStaff} onChange={e => setTargetStaff(e.target.value)} icon={User} disabled={isVpLocked} />
                        <Input label="แผนก/ฝ่าย" dbField="department_code" value={department} onChange={e => setDepartment(e.target.value)} disabled={isVpLocked} />
                        <Input label="ชื่อผู้ใช้ RMS" dbField="user_rms" value={userRms} onChange={e => setUserRms(e.target.value)} disabled={isVpLocked} />
                        <div className="flex flex-col space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ประเภทสิทธิ์</label>
                             <div className="flex gap-4 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={isFirst==='2'} onChange={()=>setIsFirst('2')} disabled={isVpLocked}/> มีสิทธิ์อยู่แล้ว</label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={isFirst==='1'} onChange={()=>setIsFirst('1')} disabled={isVpLocked}/> ขอครั้งแรก</label>
                             </div>
                        </div>
                        <div className="md:col-span-4"><Input label="หมายเหตุ" dbField="remark" value={remark} onChange={e => setRemark(e.target.value)} disabled={isVpLocked} /></div>
                    </div>
                </Card>

                <Card title="ผู้อนุมัติ" className="lg:col-span-4 shadow-sm">
                    <div className="space-y-4">
                        <SearchableSelect label="ผู้อนุมัติโครงการ (approve_code)" options={staffList.map(s => ({value: s.staff_code, label: s.staff_name}))} value={approver} onChange={setApprover} disabled={isVpLocked} />
                        <SearchableSelect label="VP/AVP อนุมัติ (vp_code)" options={staffList.map(s => ({value: s.staff_code, label: s.staff_name}))} value={vpCode} onChange={setVpCode} disabled={isVpLocked} />
                    </div>
                </Card>
            </div>

            {/* Tab Selection */}
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="flex border-b bg-slate-50">
                    <button onClick={() => setActiveTab('COMPANY')} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all ${activeTab==='COMPANY' ? 'border-cyan-600 text-cyan-700 bg-white shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>1. รายชื่อบริษัท</button>
                    <button onClick={() => setActiveTab('PROJECT')} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all ${activeTab==='PROJECT' ? 'border-cyan-600 text-cyan-700 bg-white shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>2. รายชื่อโครงการ</button>
                    <button onClick={() => setActiveTab('BGCODE')} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all ${activeTab==='BGCODE' ? 'border-cyan-600 text-cyan-700 bg-white shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>3. รหัสงบประมาณ</button>
                </div>
                
                <div className="p-4 min-h-[300px]">
                    {activeTab === 'COMPANY' && (
                        <div className="animate-in slide-in-from-left-2">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-slate-700">รายการบริษัทที่ขอเปิดสิทธิ์</span>
                                <Button size="sm" onClick={() => setTabCompanies([...tabCompanies, { memo_no: memoNo, comp_code: '', seq: tabCompanies.length + 1, is_active: 'Y', id: Date.now().toString() }])} disabled={isVpLocked} className="bg-cyan-800 px-4 py-1 h-8"><Plus size={14}/> เพิ่มแถว</Button>
                            </div>
                            <table className="w-full border border-slate-200 text-xs">
                                <thead className="bg-slate-100"><tr><th className="p-1 border w-16">Seq</th><th className="p-1 border">รหัสบริษัท</th><th className="p-1 border w-20">ลบ</th></tr></thead>
                                <tbody>
                                    {tabCompanies.map((c, i) => (
                                        <tr key={c.id || i}>
                                            <td className="p-1 border text-center font-mono">{i+1}</td>
                                            <td className="p-1 border"><select className="w-full bg-transparent outline-none" value={c.comp_code} onChange={e => { const l = [...tabCompanies]; l[i].comp_code = e.target.value; setTabCompanies(l); }} disabled={isVpLocked}><option value="">--เลือกบริษัท--</option>{companies.map(cm => <option key={cm.comp_code} value={cm.comp_code}>{cm.comp_code} : {cm.comp_name}</option>)}</select></td>
                                            <td className="p-1 border text-center"><button onClick={() => { const l = [...tabCompanies]; l.splice(i, 1); setTabCompanies(l); }} disabled={isVpLocked} className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"><Trash2 size={14}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 'PROJECT' && (
                        <div className="animate-in slide-in-from-left-2">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-slate-700">รายการโครงการที่ขอเปิดสิทธิ์</span>
                                <Button size="sm" onClick={() => setTabProjects([...tabProjects, { memo_no: memoNo, project_code: '', seq: tabProjects.length + 1, is_active: 'Y', id: Date.now().toString() }])} disabled={isVpLocked} className="bg-cyan-800 px-4 py-1 h-8"><Plus size={14}/> เพิ่มแถว</Button>
                            </div>
                            <table className="w-full border border-slate-200 text-xs">
                                <thead className="bg-slate-100"><tr><th className="p-1 border w-16">Seq</th><th className="p-1 border">รหัสโครงการ</th><th className="p-1 border w-20">ลบ</th></tr></thead>
                                <tbody>
                                    {tabProjects.map((p, i) => (
                                        <tr key={p.id || i}>
                                            <td className="p-1 border text-center font-mono">{i+1}</td>
                                            <td className="p-1 border">
                                                <select className="w-full bg-transparent outline-none" value={p.project_code} onChange={e => { const l = [...tabProjects]; l[i].project_code = e.target.value; setTabProjects(l); }} disabled={isVpLocked}>
                                                    <option value="">--เลือกโครงการ--</option>
                                                    {projects.map(pj => <option key={pj.project_code} value={pj.project_code}>{pj.project_code} : {pj.description}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-1 border text-center"><button onClick={() => { const l = [...tabProjects]; l.splice(i, 1); setTabProjects(l); }} disabled={isVpLocked} className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"><Trash2 size={14}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 'BGCODE' && (
                        <div className="animate-in slide-in-from-left-2">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-slate-700">รายการรหัสงบประมาณที่ขอเปิดสิทธิ์</span>
                                <Button size="sm" onClick={() => setTabBgCodes([...tabBgCodes, { memo_no: memoNo, budget_code: '', seq: tabBgCodes.length + 1, is_active: 'Y', id: Date.now().toString() }])} disabled={isVpLocked} className="bg-cyan-800 px-4 py-1 h-8"><Plus size={14}/> เพิ่มแถว</Button>
                            </div>
                            <table className="w-full border border-slate-200 text-xs">
                                <thead className="bg-slate-100"><tr><th className="p-1 border w-16">Seq</th><th className="p-1 border">รหัสงบประมาณ</th><th className="p-1 border w-20">ลบ</th></tr></thead>
                                <tbody>
                                    {tabBgCodes.map((b, i) => (
                                        <tr key={b.id || i}>
                                            <td className="p-1 border text-center font-mono">{i+1}</td>
                                            <td className="p-1 border">
                                                <input className="w-full bg-transparent outline-none p-1" value={b.budget_code} onChange={e => { const l = [...tabBgCodes]; l[i].budget_code = e.target.value; setTabBgCodes(l); }} placeholder="กรอกรหัสงบประมาณ" disabled={isVpLocked} />
                                            </td>
                                            <td className="p-1 border text-center"><button onClick={() => { const l = [...tabBgCodes]; l.splice(i, 1); setTabBgCodes(l); }} disabled={isVpLocked} className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"><Trash2 size={14}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showPreview && (
                <MemoBudgetPreview head={{memo_no: memoNo, memo_date: memoDate, is_first: isFirst, staff_code: preparer, memo_staff_code: targetStaff, department_code: department, user_rms: userRms, approve_code: approver, vp_code: vpCode, remark: remark, is_status: 'ACTIVE', is_approve: 'Y', is_vp: isVpLocked ? 'Y' : 'N'}} companies={tabCompanies} projects={tabProjects} bgcodes={tabBgCodes} masterCompanies={companies} masterProjects={projects} staffList={staffList} onClose={() => setShowPreview(false)} />
            )}
        </div>
    );
};
