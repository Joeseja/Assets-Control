
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { PlanCheckHead, PlanCheckDetail, CompanyItem, StaffItem, LocationItem, StockItem, MsProduct } from '../types';
import { 
    Save, RefreshCw, Search, ClipboardList, CheckSquare, Square, 
    Trash2, Plus, ArrowLeft, Edit, Calendar, MapPin, Building, User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AssetCheckPlan = () => {
    const { t } = useLanguage();
    
    // -- View Mode State --
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // -- Data State --
    const [plans, setPlans] = useState<any[]>([]);
    const [isSaved, setIsSaved] = useState(false);

    // --- Form State ---
    const [head, setHead] = useState<Partial<PlanCheckHead>>({
        plan_no: '',
        plan_date: new Date().toISOString().split('T')[0],
        comp_code: '',
        location_code: '',
        stock_code: '',
        staff_code: '',
        remark: '',
        is_enter: 'N'
    });

    const [details, setDetails] = useState<PlanCheckDetail[]>([]);
    const [inputRow, setInputRow] = useState({ serial: '', owner: '', status: 'Available' });

    // Master Data States (Cached)
    const [masters, setMasters] = useState<{
        companies: CompanyItem[], staff: StaffItem[], locations: LocationItem[], stocks: StockItem[], products: MsProduct[]
    }>({ companies: [], staff: [], locations: [], stocks: [], products: [] });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [p, c, s, l, pr, st] = await Promise.all([
                api.getAssetCheckPlans(),
                api.getCompanies(),
                api.getStaff(),
                api.getLocations(),
                api.getProducts(),
                api.getStocks()
            ]);
            setPlans(Array.isArray(p) ? p : []);
            setMasters({ companies: c, staff: s, locations: l, products: pr, stocks: st });
            if (c.length > 0 && !head.comp_code) setHead(prev => ({ ...prev, comp_code: c[0].comp_code }));
        } catch (e) { console.error(e); }
        setIsLoading(false);
    };

    const handleUpdateHead = (field: keyof PlanCheckHead, value: any) => {
        setHead(prev => ({ ...prev, [field]: value }));
    };

    const handleEdit = async (item: any) => {
        setIsLoading(true);
        try {
            const res = await api.getAssetCheckPlanDetail(item.comp_code, item.plan_no);
            if (res) {
                setHead(res.head);
                setDetails(res.details || []);
                setIsSaved(true);
                setViewMode('form');
            }
        } catch (e) { alert("ไม่พบข้อมูลแผนงาน"); }
        setIsLoading(false);
    };

    const handleAddNew = () => {
        setHead({
            plan_no: '',
            plan_date: new Date().toISOString().split('T')[0],
            comp_code: masters.companies[0]?.comp_code || '',
            location_code: '',
            stock_code: '',
            staff_code: '',
            remark: '',
            is_enter: 'N'
        });
        setDetails([]);
        setIsSaved(false);
        setViewMode('form');
    };

    const handleSave = async () => {
        if (!head.comp_code || !head.plan_no || !head.staff_code) return alert(t('msg.required_fields'));
        setIsLoading(true);
        try {
            const res = await api.saveAssetCheckPlan({ head: head as PlanCheckHead, details });
            if (res.success) {
                alert(t('msg.save_success'));
                setViewMode('list');
                loadInitialData();
            }
        } catch (e) { alert(t('msg.save_fail')); }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!isSaved) return;
        if (!confirm(t('msg.confirm_delete'))) return;
        setIsLoading(true);
        try {
            await api.deleteAssetCheckPlan(head.comp_code!, head.plan_no!);
            alert(t('msg.delete_success'));
            setViewMode('list');
            loadInitialData();
        } catch (e) { alert(t('msg.delete_fail')); }
        setIsLoading(false);
    };

    const handleAddItem = useCallback(() => {
        if (!inputRow.serial) return;
        const newItem: PlanCheckDetail = {
            plan_no: head.plan_no || '',
            seq: details.length + 1,
            serialno: inputRow.serial,
            is_status: inputRow.status,
            staff_code: inputRow.owner,
            staff_name: masters.staff.find(s => s.staff_code === inputRow.owner)?.staff_name || '',
            comp_code: head.comp_code || ''
        };
        setDetails(prev => [...prev, newItem]);
        setInputRow(prev => ({ ...prev, serial: '' }));
    }, [inputRow, head, details, masters.staff]);

    const filteredPlans = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return plans.filter(p => 
            (p.plan_no || '').toLowerCase().includes(term) ||
            (p.planner_name || '').toLowerCase().includes(term) ||
            (p.comp_code || '').toLowerCase().includes(term)
        );
    }, [plans, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPlans.slice(start, start + itemsPerPage);
    }, [filteredPlans, currentPage]);

    const filteredStocks = useMemo(() => 
        masters.stocks.filter(s => !head.location_code || s.location_code === head.location_code),
    [masters.stocks, head.location_code]);

    // --- LIST VIEW RENDERING ---
    if (viewMode === 'list') {
        return (
            <div className="space-y-4 h-full flex flex-col animate-in fade-in text-xs font-sans">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-700 text-white rounded-lg shadow-md"><ClipboardList size={18} /></div>
                        <div>
                            <h1 className="text-sm font-black text-slate-800 leading-none">การวางแผนตรวจทรัพย์สิน (Asset Check Planning)</h1>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1">Inventory Inspection Schedules</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="ค้นหาเลขที่แผน, ผู้ตรวจ..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                            <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
                        </div>
                        <button onClick={loadInitialData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/></button>
                        <Button onClick={handleAddNew} size="sm" className="bg-indigo-700 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider"><Plus size={14} /> สร้างแผนใหม่</Button>
                    </div>
                </div>

                <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                                    <th className="py-1 px-4 border-b border-slate-200 w-32 text-center">วันที่แผนงาน</th>
                                    <th className="py-1 px-4 border-b border-slate-200 w-40">เลขที่แผนงาน</th>
                                    <th className="py-1 px-4 border-b border-slate-200">สถานที่ / คลัง / ผู้ตรวจ</th>
                                    <th className="py-1 px-4 border-b border-slate-200 w-32 text-center">สถานะ</th>
                                    <th className="py-1 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading && plans.length === 0 ? (
                                    <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Records...</td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลแผนการตรวจทรัพย์สิน</td></tr>
                                ) : (
                                    currentItems.map(p => (
                                        <tr key={`${p.comp_code}-${p.plan_no}`} className="group hover:bg-indigo-50/30 transition-all duration-150 cursor-pointer" onClick={() => handleEdit(p)}>
                                            <td className="py-1 px-4 text-center align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{new Date(p.plan_date).toLocaleDateString('th-TH')}</span>
                                                    <span className="text-[9px] text-slate-400 font-mono italic">#{p.comp_code}</span>
                                                </div>
                                            </td>
                                            <td className="py-1 px-4 font-mono font-black text-indigo-700 align-middle"><div className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-center shadow-sm">{p.plan_no}</div></td>
                                            <td className="py-1 px-4 align-middle">
                                                <div className="font-bold text-slate-800 uppercase leading-none mb-1 text-[11px]">{p.planner_name || p.staff_code}</div>
                                                <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                                    <MapPin size={10} className="text-slate-300"/> Loc: {p.location_name || p.location_code} | Stock: {p.stock_code}
                                                </div>
                                            </td>
                                            <td className="py-1 px-4 text-center align-middle">
                                                <Badge type={p.is_enter === 'Y' ? 'success' : 'primary'}>{p.is_enter === 'Y' ? 'COMPLETED' : 'PLANNED'}</Badge>
                                            </td>
                                            <td className="py-1 px-4 text-center align-middle">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="p-1 text-indigo-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-indigo-100"><Edit size={14}/></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={currentPage} totalItems={filteredPlans.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                </Card>
            </div>
        );
    }

    // --- FORM VIEW RENDERING ---
    return (
        <div className="space-y-3 pb-20 font-sans text-xs animate-in fade-in">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600"><ArrowLeft size={18}/></button>
                    <div className="p-2 bg-indigo-700 text-white rounded-lg shadow-lg"><ClipboardList size={20} /></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">{isSaved ? 'แก้ไขแผนการตรวจทรัพย์สิน' : 'สร้างแผนการตรวจทรัพย์สินใหม่'}</h1>
                        <p className="text-slate-400 text-[9px] font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
                           Transaction Mode: ms_plan_check_head
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setViewMode('list')} className="px-4 border-slate-200 text-xs"><ArrowLeft size={14} /> กลับหน้ารายการ</Button>
                    <Button onClick={handleSave} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-black shadow-lg" disabled={isLoading}>
                        {isLoading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} บันทึกเอกสาร
                    </Button>
                    {isSaved && <Button variant="danger" size="sm" onClick={handleDelete} className="px-4"><Trash2 size={14}/> ลบ</Button>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input label={t('plan.no')} dbField="plan_no" value={head.plan_no} onChange={e => handleUpdateHead('plan_no', e.target.value)} placeholder="AUTO" disabled={isSaved} className="font-bold text-indigo-700" />
                        <Input label={t('plan.date')} dbField="plan_date" type="date" value={head.plan_date} onChange={e => handleUpdateHead('plan_date', e.target.value)} icon={Calendar} />
                    </div>
                    <SearchableSelect label={t('rec.company')} options={masters.companies.map(c => ({value: c.comp_code, label: c.comp_name}))} value={head.comp_code || ''} onChange={v => handleUpdateHead('comp_code', v)} disabled={isSaved} />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <SearchableSelect label={t('plan.location')} dbField="location_code" options={masters.locations.map(l => ({value: l.location_code, label: l.description}))} value={head.location_code || ''} onChange={v => handleUpdateHead('location_code', v)} />
                        <SearchableSelect label={t('plan.stock')} dbField="stock_code" options={filteredStocks.map(s => ({value: s.stock_code, label: s.description}))} value={head.stock_code || ''} onChange={v => handleUpdateHead('stock_code', v)} />
                    </div>
                </Card>
                <Card title="เจ้าหน้าที่ผู้รับผิดชอบ">
                    <div className="space-y-4">
                        {/* Fixed: removed invalid 'icon' prop from SearchableSelect */}
                        <SearchableSelect label={t('plan.planner')} dbField="staff_code" options={masters.staff.map(s => ({value: s.staff_code, label: s.staff_name}))} value={head.staff_code || ''} onChange={v => handleUpdateHead('staff_code', v)} />
                        <Input label={t('memo.remark')} dbField="remark" value={head.remark} onChange={e => handleUpdateHead('remark', e.target.value)} />
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-700 uppercase text-[9px]">Inspection Status</span>
                                <span className="text-[8px] text-rose-400 font-mono tracking-tighter">[is_enter]</span>
                             </div>
                             <select className="bg-white border rounded px-2 py-1 font-bold text-[10px]" value={head.is_enter} onChange={e => handleUpdateHead('is_enter', e.target.value)}>
                                <option value="N">Pending</option>
                                <option value="Y">Completed</option>
                             </select>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden p-0 border-0 shadow-xl rounded-xl">
                <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4"><Input label={t('plan.serial')} value={inputRow.serial} onChange={e => setInputRow({...inputRow, serial: e.target.value})} placeholder="S/N หรือ เลขทะเบียน" /></div>
                    <div className="col-span-4"><SearchableSelect label={t('plan.owner')} options={masters.staff.map(s => ({value: s.staff_code, label: s.staff_name}))} value={inputRow.owner} onChange={v => setInputRow({...inputRow, owner: v})} /></div>
                    <div className="col-span-2"><SearchableSelect label="Status" options={[{value:'Available', label:'Available'}, {value:'Unavailable', label:'Unavailable'}]} value={inputRow.status} onChange={v => setInputRow({...inputRow, status: v})} /></div>
                    <div className="col-span-2"><Button onClick={handleAddItem} className="w-full bg-emerald-600 text-white font-bold h-[38px] shadow-sm"><Plus size={16}/> เพิ่มรายการ</Button></div>
                </div>
                <div className="max-h-[400px] overflow-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                        <thead className="bg-slate-800 text-slate-100 font-black uppercase tracking-widest sticky top-0">
                            <tr>
                                <th className="p-3 w-12 text-center">#</th>
                                <th className="p-3">{t('plan.serial')}</th>
                                <th className="p-3">{t('plan.owner')}</th>
                                <th className="p-3 text-center w-32">Status</th>
                                <th className="p-3 w-12 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {details.map((d, i) => (
                                <tr key={i} className={`hover:bg-slate-50 transition-colors ${d.is_status === 'Unavailable' ? 'bg-rose-50/30' : ''}`}>
                                    <td className="p-2 text-center text-slate-400 font-mono">{i + 1}</td>
                                    <td className="p-2 font-bold text-slate-700">{d.serialno}</td>
                                    <td className="p-2 text-slate-600 font-medium">{d.staff_name || d.staff_code}</td>
                                    <td className="p-2 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${d.is_status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                            {d.is_status}
                                        </span>
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => setDetails(details.filter((_, idx) => idx !== i))} className="p-1 text-rose-400 hover:bg-rose-50 rounded transition-all"><Trash2 size={14}/></button>
                                    </td>
                                </tr>
                            ))}
                            {details.length === 0 && <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ยังไม่มีรายการทรัพย์สินในแผนตรวจนี้</td></tr>}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
