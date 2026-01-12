
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { MemoItRentalHead, MemoItRentalDetail, CompanyItem, ProjectItem, StaffItem, LocationItem, StockItem } from '../types';
import { 
    Save, Trash2, Plus, RefreshCw, FileText, Search, X, Monitor, 
    ArrowLeft, Edit, Calendar, User, Layout, Building
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MemoItRentalRequest = () => {
    const { t } = useLanguage();

    // -- VIEW MODE --
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // -- DATA STATE --
    const [memos, setMemos] = useState<any[]>([]);
    const [isSaved, setIsSaved] = useState(false);
    
    // Header Fields
    const [compCode, setCompCode] = useState('');
    const [memoNo, setMemoNo] = useState('');
    const [memoDate, setMemoDate] = useState(new Date().toISOString().split('T')[0]);
    const [staffCode, setStaffCode] = useState(''); // Preparer
    const [approveCode, setApproveCode] = useState('');
    const [remark, setRemark] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isType, setIsType] = useState('RENTAL');

    // Details Data
    const [details, setDetails] = useState<MemoItRentalDetail[]>([]);

    // Master Data
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [staffList, setStaffList] = useState<StaffItem[]>([]);
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [stocks, setStocks] = useState<StockItem[]>([]);

    useEffect(() => {
        loadListData();
        loadMasterData();
    }, []);

    const loadListData = async () => {
        setIsLoading(true);
        try {
            const data = await api.searchMemoItRental({});
            setMemos(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        setIsLoading(false);
    };

    const loadMasterData = async () => {
        try {
            const [c, s, l] = await Promise.all([
                api.getCompanies(),
                api.getStaff(),
                api.getLocations()
            ]);
            setCompanies(c || []);
            setStaffList(s || []);
            setLocations(l || []);
            if (c.length > 0) setCompCode(c[0].comp_code);
            if (s.length > 0) setStaffCode(s[0].staff_code);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const fetchProj = async () => {
            if (compCode) {
               const p = await api.getProjects(compCode).catch(() => []);
               setProjects(p || []);
            }
        };
        fetchProj();
    }, [compCode]);

    const handleEdit = async (item: any) => {
        setIsLoading(true);
        try {
            const data = await api.getMemoItRental(item.comp_code, item.memo_no);
            if (data) {
                setCompCode(data.head.comp_code);
                setMemoNo(data.head.memo_no);
                setMemoDate(data.head.memo_date ? data.head.memo_date.split('T')[0] : '');
                setStaffCode(data.head.staff_code || '');
                setApproveCode(data.head.approve_code || '');
                setRemark(data.head.remark || '');
                setProjectCode(data.head.project_code || '');
                setDueDate(data.head.due_date ? data.head.due_date.split('T')[0] : '');
                setIsType(data.head.is_type || 'RENTAL');
                setDetails(data.details.map((d: any, i: number) => ({ ...d, id: `exist-${i}` })));
                setIsSaved(true);
                setViewMode('form');
            }
        } catch (e) { alert("ไม่พบข้อมูลเอกสาร"); }
        setIsLoading(false);
    };

    const handleNew = () => {
        setMemoNo('');
        setMemoDate(new Date().toISOString().split('T')[0]);
        setRemark('');
        setDueDate('');
        setIsType('RENTAL');
        setDetails([]);
        setIsSaved(false);
        setViewMode('form');
    };

    const handleSave = async () => {
        if (!compCode || !memoNo) return alert(t('msg.required_fields'));
        setIsLoading(true);
        try {
            const head: MemoItRentalHead = {
                comp_code: compCode, memo_no: memoNo, memo_date: memoDate,
                staff_code: staffCode, approve_code: approveCode,
                remark: remark, project_code: projectCode,
                due_date: dueDate, is_type: isType, is_status: 'ACTIVE'
            };
            const finalDetails = details.map((d, i) => ({
                ...d, comp_code: compCode, memo_no: memoNo, seq: i + 1, project_code: projectCode
            }));
            await api.saveMemoItRental({ head, details: finalDetails });
            alert(t('msg.save_success'));
            setViewMode('list');
            loadListData();
        } catch (e) { alert(t('msg.save_fail')); }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!isSaved) return;
        if (!confirm(t('msg.confirm_delete'))) return;
        setIsLoading(true);
        try {
            await api.deleteMemoItRental(compCode, memoNo);
            alert(t('msg.delete_success'));
            setViewMode('list');
            loadListData();
        } catch (e) { alert(t('msg.delete_fail')); }
        setIsLoading(false);
    };

    const filteredMemos = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return memos.filter(m => 
            (m.memo_no || '').toLowerCase().includes(term) ||
            (m.project_code || '').toLowerCase().includes(term) ||
            (m.staff_name || '').toLowerCase().includes(term)
        );
    }, [memos, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredMemos.slice(start, start + itemsPerPage);
    }, [filteredMemos, currentPage]);

    // Grid Row Logic
    const addDetailRow = () => {
        setDetails([...details, {
            comp_code: compCode, memo_no: memoNo, seq: details.length + 1,
            id: `new-${Date.now()}`
        }]);
    };

    const updateDetail = (index: number, field: keyof MemoItRentalDetail, value: any) => {
        const list = [...details];
        list[index] = { ...list[index], [field]: value };
        setDetails(list);
    };

    // --- LIST VIEW RENDERING ---
    if (viewMode === 'list') {
        return (
            <div className="space-y-4 h-full flex flex-col animate-in fade-in text-xs font-sans">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-700 text-white rounded-lg shadow-md"><Monitor size={18} /></div>
                        <div>
                            <h1 className="text-sm font-black text-slate-800 leading-none">{t('memo_it.title')}</h1>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1">IT Equipment Rental Records</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-cyan-500/10" placeholder="ค้นหาเลขที่บันทึก, โครงการ..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                            <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
                        </div>
                        <button onClick={loadListData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/></button>
                        <Button onClick={handleNew} size="sm" className="bg-cyan-700 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider"><Plus size={14} /> สร้างบันทึกใหม่</Button>
                    </div>
                </div>

                <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                                    <th className="py-1.5 px-4 border-b border-slate-200 w-32 text-center">วันที่</th>
                                    <th className="py-1.5 px-4 border-b border-slate-200 w-40">เลขที่บันทึก</th>
                                    <th className="py-1.5 px-4 border-b border-slate-200">โครงการ / ผู้ขอ</th>
                                    <th className="py-1.5 px-4 border-b border-slate-200 w-32 text-center">สถานะ</th>
                                    <th className="py-1.5 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading && memos.length === 0 ? (
                                    <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Records...</td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลบันทึกการขอเช่า</td></tr>
                                ) : (
                                    currentItems.map(m => (
                                        <tr key={`${m.comp_code}-${m.memo_no}`} className="group hover:bg-cyan-50/30 transition-all duration-150 cursor-pointer" onClick={() => handleEdit(m)}>
                                            <td className="py-1 px-4 text-center align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{new Date(m.memo_date).toLocaleDateString('th-TH')}</span>
                                                    <span className="text-[9px] text-slate-400 font-mono italic">#{m.comp_code}</span>
                                                </div>
                                            </td>
                                            <td className="py-1 px-4 font-mono font-black text-cyan-700 align-middle"><div className="bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded text-center shadow-sm">{m.memo_no}</div></td>
                                            <td className="py-1 px-4 align-middle">
                                                <div className="font-bold text-slate-800 uppercase leading-none mb-1 text-[11px]">{m.staff_name || m.staff_code}</div>
                                                <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                                    <Building size={10} className="text-slate-300"/> Proj: {m.project_code || '-'}
                                                </div>
                                            </td>
                                            <td className="py-1 px-4 text-center align-middle">
                                                <Badge type="primary">{m.is_status}</Badge>
                                            </td>
                                            <td className="py-1 px-4 text-center align-middle">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(m); }} className="p-1 text-cyan-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-cyan-100"><Edit size={14}/></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={currentPage} totalItems={filteredMemos.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                </Card>
            </div>
        );
    }

    // --- FORM VIEW RENDERING ---
    return (
        <div className="w-full h-full space-y-4 pb-20 animate-in fade-in duration-300 text-xs font-sans">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-cyan-600"><ArrowLeft size={18}/></button>
                    <div className="p-2 bg-cyan-700 text-white rounded-lg shadow-lg"><Monitor size={20} /></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">{isSaved ? 'แก้ไขบันทึกขอเช่าอุปกรณ์ IT' : 'สร้างบันทึกขอเช่าอุปกรณ์ IT ใหม่'}</h1>
                        <p className="text-slate-400 text-[9px] font-bold uppercase mt-1 tracking-widest">Transaction Mode: memo_it_head</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setViewMode('list')} className="px-4 border-slate-200 text-xs"><ArrowLeft size={14} /> กลับหน้ารายการ</Button>
                    <Button onClick={handleSave} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 font-black shadow-lg" disabled={isLoading}>
                        {isLoading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} บันทึกเอกสาร
                    </Button>
                    {isSaved && <Button variant="danger" size="sm" onClick={handleDelete} className="px-4"><Trash2 size={14}/> ลบ</Button>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card title="ข้อมูลหลักการเช่าอุปกรณ์" className="lg:col-span-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <SearchableSelect label="บริษัท *" options={companies.map(c => ({value: c.comp_code, label: c.comp_name}))} value={compCode} onChange={setCompCode} disabled={isSaved} />
                        <Input label="เลขที่บันทึก *" dbField="memo_no" value={memoNo} onChange={e => setMemoNo(e.target.value)} disabled={isSaved} className="font-bold text-cyan-700" />
                        <Input label="วันที่บันทึก" dbField="memo_date" type="date" value={memoDate} onChange={e => setMemoDate(e.target.value)} icon={Calendar} />
                        <Input label="วันที่ครบกำหนด" dbField="due_date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} icon={Calendar} />
                        
                        <div className="md:col-span-2">
                            <SearchableSelect label="โครงการ *" options={projects.map(p => ({value: p.project_code, label: p.description}))} value={projectCode} onChange={setProjectCode} />
                        </div>
                        <SearchableSelect label="ผู้จัดทำ" options={staffList.map(s => ({value: s.staff_code, label: s.staff_name}))} value={staffCode} onChange={setStaffCode} />
                        <SearchableSelect label="ผู้อนุมัติ" options={staffList.map(s => ({value: s.staff_code, label: s.staff_name}))} value={approveCode} onChange={setApproveCode} />
                        
                        <div className="md:col-span-4">
                            <Input label="หมายเหตุ" dbField="remark" value={remark} onChange={e => setRemark(e.target.value)} />
                        </div>
                    </div>
                </Card>

                <Card title="ประเภทรายการ" className="lg:col-span-4 shadow-sm">
                    <div className="space-y-3">
                        <div className="flex flex-col space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ประเภทคำขอ</label>
                             <div className="grid grid-cols-2 gap-2">
                                <button onClick={()=>setIsType('RENTAL')} className={`p-2 rounded-lg border font-bold text-[10px] transition-all ${isType==='RENTAL' ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}>เช่าอุปกรณ์ (Rental)</button>
                                <button onClick={()=>setIsType('RETURN')} className={`p-2 rounded-lg border font-bold text-[10px] transition-all ${isType==='RETURN' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}>คืนอุปกรณ์ (Return)</button>
                             </div>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="shadow-xl border-0 overflow-hidden p-0">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">รายละเอียดอุปกรณ์ที่ขอเช่า (Rental Items)</span>
                    <Button size="sm" onClick={addDetailRow} className="bg-cyan-800 px-4 py-1 h-8"><Plus size={14}/> เพิ่มแถว</Button>
                </div>
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse text-[10px]">
                        <thead className="bg-slate-800 text-white font-black uppercase tracking-widest">
                            <tr>
                                <th className="p-2 w-10 text-center">#</th>
                                <th className="p-2 w-32">รหัสพนักงาน/ชื่อผู้ใช้</th>
                                <th className="p-2">ชื่ออุปกรณ์/รุ่น</th>
                                <th className="p-2 w-32">ทะเบียน/S/N</th>
                                <th className="p-2 w-32">คลัง/สถานที่</th>
                                <th className="p-2 w-24 text-right">จำนวนเงิน</th>
                                <th className="p-2 w-12 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {details.map((d, i) => (
                                <tr key={d.id || i} className="hover:bg-cyan-50/20 transition-colors">
                                    <td className="p-2 text-center text-slate-400 font-mono">{i+1}</td>
                                    <td className="p-1">
                                        <input className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none p-1 font-bold" value={d.owner_name || ''} onChange={e => updateDetail(i, 'owner_name', e.target.value)} placeholder="ระบุชื่อผู้ใช้" />
                                    </td>
                                    <td className="p-1">
                                        <input className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none p-1" value={d.product_name || ''} onChange={e => updateDetail(i, 'product_name', e.target.value)} placeholder="ชื่ออุปกรณ์" />
                                    </td>
                                    <td className="p-1">
                                        <input className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none p-1 font-mono" value={d.serialno || ''} onChange={e => updateDetail(i, 'serialno', e.target.value)} placeholder="S/N" />
                                    </td>
                                    <td className="p-1">
                                        <select className="w-full bg-transparent outline-none p-1" value={d.location_code || ''} onChange={e => updateDetail(i, 'location_code', e.target.value)}>
                                            <option value="">--เลือก--</option>
                                            {locations.map(l => <option key={l.location_code} value={l.location_code}>{l.description}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-1">
                                        <input type="number" className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none p-1 text-right font-bold" value={d.cost_amount || 0} onChange={e => updateDetail(i, 'cost_amount', parseFloat(e.target.value))} />
                                    </td>
                                    <td className="p-1 text-center">
                                        <button onClick={() => setDetails(details.filter((_, idx) => idx !== i))} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={14}/></button>
                                    </td>
                                </tr>
                            ))}
                            {details.length === 0 && <tr><td colSpan={7} className="p-20 text-center text-slate-300 font-bold italic">ยังไม่มีรายการอุปกรณ์</td></tr>}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
