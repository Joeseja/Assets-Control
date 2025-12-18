
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect } from '../components/ui';
import { api } from '../services/apiService';
import { PlanCheckHead, PlanCheckDetail, CompanyItem, StaffItem, LocationItem, StockItem, Product } from '../types';
import { Save, RefreshCw, Search, ClipboardList, CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AssetCheckPlan = () => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    
    // --- Unified State for Performance ---
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
        companies: CompanyItem[], staff: StaffItem[], locations: LocationItem[], stocks: StockItem[], products: Product[]
    }>({ companies: [], staff: [], locations: [], stocks: [], products: [] });

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [c, s, l, p, st] = await Promise.all([
                    api.getCompanies(), api.getStaff(), api.getLocations(), api.getProducts(), api.getStocks()
                ]);
                setMasters({ companies: c, staff: s, locations: l, products: p, stocks: st });
                if (c.length > 0) setHead(prev => ({ ...prev, comp_code: c[0].comp_code }));
            } catch (e) { console.error(e); }
            setIsLoading(false);
        };
        load();
    }, []);

    const handleUpdateHead = (field: keyof PlanCheckHead, value: any) => {
        setHead(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!head.comp_code || !head.staff_code) return alert(t('msg.required_fields'));
        setIsLoading(true);
        try {
            const res = await api.saveAssetCheckPlan({ head: head as PlanCheckHead, details });
            if (res.success) {
                alert(t('msg.save_success'));
                setHead(prev => ({ ...prev, plan_no: res.plan_no }));
            }
        } catch (e) { alert(t('msg.save_fail')); }
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

    const filteredStocks = useMemo(() => 
        masters.stocks.filter(s => !head.location_code || s.location_code === head.location_code),
    [masters.stocks, head.location_code]);

    return (
        <div className="space-y-3 pb-20 font-sans">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-800 text-white rounded-lg shadow-lg"><ClipboardList size={20} /></div>
                    <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t('menu.asset_check_plan')}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => window.location.reload()}><RefreshCw size={14} /> {t('btn.clear')}</Button>
                    <Button size="sm" onClick={handleSave} disabled={isLoading} className="bg-primary-700 shadow-md"><Save size={14} /> {t('btn.save')}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input label={t('plan.no')} value={head.plan_no} onChange={e => handleUpdateHead('plan_no', e.target.value)} placeholder="AUTO" />
                        <Input label={t('plan.date')} type="date" value={head.plan_date} onChange={e => handleUpdateHead('plan_date', e.target.value)} />
                    </div>
                    <SearchableSelect label={t('rec.company')} options={masters.companies.map(c => ({value: c.comp_code, label: c.comp_name}))} value={head.comp_code || ''} onChange={v => handleUpdateHead('comp_code', v)} />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <SearchableSelect label={t('plan.location')} options={masters.locations.map(l => ({value: l.location_code, label: l.description}))} value={head.location_code || ''} onChange={v => handleUpdateHead('location_code', v)} />
                        <SearchableSelect label={t('plan.stock')} options={filteredStocks.map(s => ({value: s.stock_code, label: s.description}))} value={head.stock_code || ''} onChange={v => handleUpdateHead('stock_code', v)} />
                    </div>
                </Card>
                <Card title="Personnel">
                    <div className="space-y-4">
                        <SearchableSelect label={t('plan.planner')} options={masters.staff.map(s => ({value: s.staff_code, label: s.staff_name}))} value={head.staff_code || ''} onChange={v => handleUpdateHead('staff_code', v)} />
                        <Input label={t('memo.remark')} value={head.remark} onChange={e => handleUpdateHead('remark', e.target.value)} />
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden p-0 border-0 shadow-xl">
                <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4"><Input label={t('plan.serial')} value={inputRow.serial} onChange={e => setInputRow({...inputRow, serial: e.target.value})} /></div>
                    <div className="col-span-4"><SearchableSelect label={t('plan.owner')} options={masters.staff.map(s => ({value: s.staff_code, label: s.staff_name}))} value={inputRow.owner} onChange={v => setInputRow({...inputRow, owner: v})} /></div>
                    <div className="col-span-2"><SearchableSelect label="Status" options={[{value:'Available', label:'Available'}, {value:'Unavailable', label:'Unavailable'}]} value={inputRow.status} onChange={v => setInputRow({...inputRow, status: v})} /></div>
                    <div className="col-span-2"><Button onClick={handleAddItem} className="w-full bg-emerald-600 text-white"><Plus size={16}/> Add Item</Button></div>
                </div>
                <div className="max-h-[400px] overflow-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-800 text-slate-100 font-bold sticky top-0">
                            <tr>
                                <th className="p-3 w-12">#</th>
                                <th className="p-3">{t('plan.serial')}</th>
                                <th className="p-3">{t('plan.owner')}</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {details.map((d, i) => (
                                <tr key={i} className={`hover:bg-slate-50 ${d.is_status === 'Unavailable' ? 'bg-rose-50' : ''}`}>
                                    <td className="p-3 text-slate-400 font-mono">{i + 1}</td>
                                    <td className="p-3 font-bold text-slate-700">{d.serialno}</td>
                                    <td className="p-3 text-slate-600">{d.staff_name}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${d.is_status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {d.is_status}
                                        </span>
                                    </td>
                                    <td className="p-3"><button onClick={() => setDetails(details.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-600"><Trash2 size={14}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
