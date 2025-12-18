
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SearchableSelect } from '../components/ui';
import { api } from '../services/apiService';
import { MemoItRentalHead, MemoItRentalDetail, CompanyItem, ProjectItem, StaffItem, LocationItem, StockItem } from '../types';
import { Save, Trash2, Plus, RefreshCw, FileText, Search, X, Monitor } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MemoItRentalRequest = () => {
    const { t } = useLanguage();

    // -- STATE --
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
    const [isType, setIsType] = useState('RENTAL'); // Default

    // Details Data
    const [details, setDetails] = useState<MemoItRentalDetail[]>([]);

    // Master Data
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [staffList, setStaffList] = useState<StaffItem[]>([]);
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [stocks, setStocks] = useState<StockItem[]>([]);

    // Search Modal
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState({
        comp_code: '',
        memo_no: '',
        staff_code: '',
        project_code: ''
    });
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        loadMasterData();
    }, []);

    // Load Master Data
    const loadMasterData = async () => {
        try {
            const c = await api.getCompanies();
            setCompanies(c || []);
            if (c && c.length > 0) {
                setCompCode(c[0].comp_code); // Default
                setSearchCriteria(prev => ({...prev, comp_code: c[0].comp_code}));
            }

            const s = await api.getStaff();
            setStaffList(s || []);
            if (s.length > 0) setStaffCode(s[0].staff_code);

            const l = await api.getLocations();
            setLocations(l || []);
            
            // Initial Stocks load (using first location or empty)
            if (l.length > 0) {
                const st = await api.getStocks(l[0].location_code);
                setStocks(st || []);
            }
        } catch (e) {
            console.error("Load Master Error", e);
        }
    };

    // Cascading: Project by Company
    useEffect(() => {
        const fetchProj = async () => {
            if (compCode) {
               const p = await api.getProjects(compCode);
               setProjects(p || []);
            }
        };
        fetchProj();
    }, [compCode]);

    // Handle New / Clear
    const handleNew = () => {
        setMemoNo('');
        setMemoDate(new Date().toISOString().split('T')[0]);
        setRemark('');
        setDueDate('');
        setIsType('RENTAL');
        setDetails([]);
        setIsSaved(false);
    };

    // Handle Search Popup Search
    const handlePopupSearch = async () => {
        const results = await api.searchMemoItRental(searchCriteria);
        setSearchResults(results);
    };

    // Handle Select Result from Search
    const handleSelectSearchResult = async (item: any) => {
        setShowSearchModal(false);
        try {
            const data = await api.getMemoItRental(item.comp_code, item.memo_no);
            if (data) {
                const { head, details } = data;
                setCompCode(head.comp_code);
                setMemoNo(head.memo_no);
                setMemoDate(head.memo_date ? head.memo_date.split('T')[0] : '');
                setStaffCode(head.staff_code || '');
                setApproveCode(head.approve_code || '');
                setRemark(head.remark || '');
                setProjectCode(head.project_code || '');
                setDueDate(head.due_date ? head.due_date.split('T')[0] : '');
                setIsType(head.is_type || 'RENTAL');
                
                // Map details adding UI id
                setDetails(details.map((d, i) => ({ ...d, id: `exist-${i}` })));
                setIsSaved(true);
            }
        } catch (e) {
            alert(t('msg.no_data'));
        }
    };

    // Handle Save
    const handleSave = async () => {
        if (!compCode || !memoNo) {
            alert(t('msg.required_fields'));
            return;
        }

        const head: MemoItRentalHead = {
            comp_code: compCode,
            memo_no: memoNo,
            memo_date: memoDate,
            staff_code: staffCode,
            approve_code: approveCode,
            remark: remark,
            project_code: projectCode,
            due_date: dueDate,
            is_type: isType,
            is_status: 'ACTIVE'
        };

        // Recalculate Seq
        const finalDetails = details.map((d, i) => ({
            ...d,
            comp_code: compCode,
            memo_no: memoNo,
            seq: i + 1,
            project_code: projectCode // Sync Detail Project with Head
        }));

        try {
            await api.saveMemoItRental({ head, details: finalDetails });
            setIsSaved(true);
            alert(t('msg.save_success'));
        } catch (e) {
            alert(t('msg.save_fail'));
        }
    };

    // Handle Delete
    const handleDelete = async () => {
        if (!isSaved) return;
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMemoItRental(compCode, memoNo);
            handleNew();
            alert(t('msg.delete_success'));
        } catch (e) {
            alert(t('msg.delete_fail'));
        }
    };

    // --- Details Grid Logic ---
    const addDetailRow = () => {
        const newRow: MemoItRentalDetail = {
            comp_code: compCode,
            memo_no: memoNo,
            seq: details.length + 1,
            location_code: locations.length > 0 ? locations[0].location_code : '',
            id: `new-${Date.now()}`
        };
        setDetails([...details, newRow]);
    };

    const removeDetailRow = (index: number) => {
        const list = [...details];
        list.splice(index, 1);
        setDetails(list);
    };

    const updateDetail = (index: number, field: keyof MemoItRentalDetail, value: any) => {
        const list = [...details];
        list[index] = { ...list[index], [field]: value };
        setDetails(list);
    };

    return (
        <div className="w-full h-full space-y-4 pb-20">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-50 text-cyan-700 rounded-lg"><Monitor size={24} /></div>
                    <h1 className="text-xl font-bold text-primary-900">{t('memo_it.title')}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleNew}><RefreshCw size={16}/> {t('btn.clear')}</Button>
                    <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700"><Save size={16}/> {t('btn.save')}</Button>
                    {isSaved && <Button variant="danger" onClick={handleDelete}><Trash2 size={16}/> {t('btn.delete')}</Button>}
                </div>
            </div>

            {/* Header Form */}
            <Card className="p-6 shadow-md border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 text-sm">
                    {/* Row 1 */}
                    <div className="lg:col-span-3">
                        <SearchableSelect 
                            label={`${t('memo.col_company')}*`}
                            dbField="comp_code"
                            options={companies.map(c => ({value: c.comp_code, label: c.comp_name}))} 
                            value={compCode} 
                            onChange={setCompCode} 
                        />
                    </div>
                    <div className="lg:col-span-3">
                         <div className="flex flex-col space-y-1.5">
                             <label className="text-sm font-semibold text-slate-600 ml-1">
                                {t('memo.memo_no')}*
                                <span className="ml-2 text-[10px] text-rose-400 font-mono tracking-tighter opacity-80 select-none">[memo_no]</span>
                             </label>
                             <div className="flex gap-2">
                                <input 
                                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                                    value={memoNo}
                                    onChange={(e) => setMemoNo(e.target.value)}
                                    placeholder={t('memo.memo_no')}
                                />
                                <button onClick={() => setShowSearchModal(true)} className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                                    <Search size={18} />
                                </button>
                             </div>
                         </div>
                    </div>
                    <div className="lg:col-span-3">
                         <Input label={t('memo.date')} dbField="memo_date" type="date" value={memoDate} onChange={e => setMemoDate(e.target.value)} />
                    </div>
                    <div className="lg:col-span-3">
                         <Input label={t('memo_it.due_date')} dbField="due_date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>

                    {/* Row 2 */}
                    <div className="lg:col-span-6">
                        <SearchableSelect 
                            label={`${t('memo_it.project')}*`}
                            dbField="project_code"
                            options={projects.map(p => ({value: p.project_code, label: p.description}))} 
                            value={projectCode} 
                            onChange={setProjectCode} 
                        />
                    </div>
                    <div className="lg:col-span-6">
                        <SearchableSelect 
                            label={t('memo.preparer')}
                            dbField="staff_code"
                            options={staffList.map(s => ({value: s.staff_code, label: `${s.staff_code} : ${s.staff_name}`}))}
                            value={staffCode} 
                            onChange={setStaffCode} 
                        />
                    </div>

                    {/* Row 3 */}
                    <div className="lg:col-span-6">
                        <SearchableSelect 
                            label={t('memo.approver')}
                            dbField="approve_code"
                            options={staffList.map(s => ({value: s.staff_code, label: `${s.staff_code} : ${s.staff_name}`}))}
                            value={approveCode} 
                            onChange={setApproveCode} 
                        />
                    </div>
                    <div className="lg:col-span-6">
                        <Input label={t('memo.remark')} dbField="remark" value={remark} onChange={e => setRemark(e.target.value)} />
                    </div>
                </div>
            </Card>

            {/* Details Table */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-lg text-slate-700">{t('lbl.detail_list')}</h3>
                    <Button onClick={addDetailRow} className="bg-cyan-600 hover:bg-cyan-700 text-white"><Plus size={16}/> {t('btn.add_row')}</Button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead className="bg-slate-100 text-slate-700 font-semibold">
                            <tr>
                                <th className="p-3 w-12 text-center rounded-l-lg">{t('lbl.seq')} <span className="text-[10px] text-rose-400 font-mono">[seq]</span></th>
                                <th className="p-3 w-32">{t('memo_it.owner_code')} <span className="text-[10px] text-rose-400 font-mono">[owner_staff_code]</span></th>
                                <th className="p-3">{t('memo_it.owner_name')} <span className="text-[10px] text-rose-400 font-mono">[owner_name]</span></th>
                                <th className="p-3">{t('memo_it.position')} <span className="text-[10px] text-rose-400 font-mono">[position_code]</span></th>
                                <th className="p-3 w-48">{t('memo_it.product')} <span className="text-[10px] text-rose-400 font-mono">[product_name]</span></th>
                                <th className="p-3">{t('memo_it.serial')} <span className="text-[10px] text-rose-400 font-mono">[serialno]</span></th>
                                <th className="p-3 w-32">{t('memo_it.location')} <span className="text-[10px] text-rose-400 font-mono">[location_code]</span></th>
                                <th className="p-3 w-32">{t('memo_it.stock')} <span className="text-[10px] text-rose-400 font-mono">[stock_code]</span></th>
                                <th className="p-3 w-24 text-right">{t('memo_it.cost')} <span className="text-[10px] text-rose-400 font-mono">[cost_amount]</span></th>
                                <th className="p-3">{t('memo.remark')} <span className="text-[10px] text-rose-400 font-mono">[remark]</span></th>
                                <th className="p-3 w-12 text-center rounded-r-lg">{t('lbl.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map((row, idx) => (
                                <tr key={row.id || idx} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="p-2 text-center">{idx + 1}</td>
                                    <td className="p-2">
                                        <input 
                                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none"
                                            value={row.owner_staff_code || ''}
                                            onChange={e => updateDetail(idx, 'owner_staff_code', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none"
                                            value={row.owner_name || ''}
                                            onChange={e => updateDetail(idx, 'owner_name', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none"
                                            value={row.position_code || ''}
                                            onChange={e => updateDetail(idx, 'position_code', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none"
                                            value={row.product_name || ''}
                                            onChange={e => updateDetail(idx, 'product_name', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none"
                                            value={row.serialno || ''}
                                            onChange={e => updateDetail(idx, 'serialno', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select 
                                            className="w-full bg-transparent outline-none"
                                            value={row.location_code || ''}
                                            onChange={e => updateDetail(idx, 'location_code', e.target.value)}
                                        >
                                            <option value=""></option>
                                            {locations.map(l => <option key={l.location_code} value={l.location_code}>{l.description}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <select 
                                            className="w-full bg-transparent outline-none"
                                            value={row.stock_code || ''}
                                            onChange={e => updateDetail(idx, 'stock_code', e.target.value)}
                                        >
                                            <option value=""></option>
                                            {stocks.filter(s => !row.location_code || s.location_code === row.location_code)
                                                   .map(s => <option key={s.stock_code} value={s.stock_code}>{s.description}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="number"
                                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none text-right"
                                            value={row.cost_amount || 0}
                                            onChange={e => updateDetail(idx, 'cost_amount', parseFloat(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none"
                                            value={row.remark || ''}
                                            onChange={e => updateDetail(idx, 'remark', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => removeDetailRow(idx)} className="text-rose-500 hover:text-rose-700 p-1 rounded-full"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            {details.length === 0 && <tr><td colSpan={11} className="p-8 text-center text-slate-400 italic">{t('msg.no_data')}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary-900 text-white p-5 flex justify-between items-center shadow-md">
                            <h2 className="text-xl font-bold flex items-center gap-2 tracking-wide"><Search size={24}/> {t('memo.search_title')}</h2>
                            <button onClick={() => setShowSearchModal(false)} className="text-primary-200 hover:text-white hover:bg-primary-800 p-2 rounded-full transition-all"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <SearchableSelect 
                                    label={t('memo.col_company')}
                                    options={companies.map(c => ({value: c.comp_code, label: c.comp_name}))} 
                                    value={searchCriteria.comp_code} 
                                    onChange={v => setSearchCriteria({...searchCriteria, comp_code: v})} 
                                />
                                <Input 
                                    label={t('memo.memo_no')}
                                    value={searchCriteria.memo_no} 
                                    onChange={e => setSearchCriteria({...searchCriteria, memo_no: e.target.value})}
                                />
                                <Input 
                                    label={t('memo.preparer')}
                                    value={searchCriteria.staff_code} 
                                    onChange={e => setSearchCriteria({...searchCriteria, staff_code: e.target.value})}
                                />
                                <Input 
                                    label={t('memo_it.project')}
                                    value={searchCriteria.project_code} 
                                    onChange={e => setSearchCriteria({...searchCriteria, project_code: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="secondary" onClick={() => setSearchCriteria({comp_code: companies[0]?.comp_code||'', memo_no:'', staff_code:'', project_code:''})} className="px-6">{t('btn.reset')}</Button>
                                <Button onClick={handlePopupSearch} className="bg-primary-600 hover:bg-primary-700 text-white px-6 shadow-md"><Search size={18}/> {t('btn.search')}</Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-0">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 shadow-sm z-10">
                                    <tr>
                                        <th className="p-4 border-b">{t('memo.col_company')}</th>
                                        <th className="p-4 border-b">{t('memo.memo_no')}</th>
                                        <th className="p-4 border-b">{t('memo.date')}</th>
                                        <th className="p-4 border-b">{t('memo.preparer')}</th>
                                        <th className="p-4 border-b">{t('memo_it.project')}</th>
                                        <th className="p-4 border-b text-center">{t('memo.search_status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.length === 0 ? (
                                        <tr><td colSpan={6} className="p-12 text-center text-slate-400 italic bg-white">{t('msg.no_data')}</td></tr>
                                    ) : (
                                        searchResults.map((item, idx) => (
                                            <tr 
                                                key={idx} 
                                                className="border-b hover:bg-cyan-50 cursor-pointer transition-colors odd:bg-white even:bg-slate-50/30"
                                                onClick={() => handleSelectSearchResult(item)}
                                            >
                                                <td className="p-4 text-slate-600">{item.comp_code}</td>
                                                <td className="p-4 font-bold text-primary-700">{item.memo_no}</td>
                                                <td className="p-4 text-slate-600">{new Date(item.memo_date).toLocaleDateString()}</td>
                                                <td className="p-4 text-slate-800">{item.staff_name || item.staff_code}</td>
                                                <td className="p-4 text-slate-600">{item.project_code}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.is_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                        {item.is_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
