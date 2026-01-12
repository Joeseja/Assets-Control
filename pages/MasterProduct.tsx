
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination, Badge, SearchableSelect } from '../components/ui';
import { api } from '../services/apiService';
import { MsProduct, MasterGroup, MasterType, MasterSubtype, CompanyItem } from '../types';
import { Edit, Plus, Save, X, Package, Search, RefreshCw, Trash2, ShieldCheck, Zap, Filter, ListTree, Layers, LayoutGrid } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProduct = () => {
    const { t } = useLanguage();
    
    // -- Data Sets --
    const [productList, setProductList] = useState<MsProduct[]>([]);
    const [groups, setGroups] = useState<MasterGroup[]>([]);
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    
    // -- Selection Options for Filters --
    const [filterTypes, setFilterTypes] = useState<MasterType[]>([]);
    const [filterSubtypes, setFilterSubtypes] = useState<MasterSubtype[]>([]);
    
    // -- Filter State --
    const [selGroup, setSelGroup] = useState('');
    const [selType, setSelType] = useState('');
    const [selSubtype, setSelSubtype] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // -- UI Control State --
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // -- Form State --
    const [formData, setFormData] = useState<MsProduct>({
        comp_code: '', product_code: '', product_name: '', product_group_code: '', 
        product_type_code: '', product_subtype_code: '', unit_buy: 'Pc', unit_sale: 'Pc',
        std_cost: 0, std_price: 0, is_status: 'Y', update_id: 'ADMIN'
    });
    const [formTypes, setFormTypes] = useState<MasterType[]>([]);
    const [formSubtypes, setFormSubtypes] = useState<MasterSubtype[]>([]);
    const [editMode, setEditMode] = useState<'create' | 'update'>('create');

    useEffect(() => { loadInitialData(); }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [p, g, c] = await Promise.all([
                api.getMsProductsList(),
                api.getMasterGroups('Y'),
                api.getCompanies()
            ]);
            setProductList(p || []);
            setGroups(g || []);
            setCompanies(c || []);
            if(c.length > 0 && !formData.comp_code) setFormData(prev => ({...prev, comp_code: c[0].comp_code}));
        } catch(e) { console.error("Load Initial Error:", e); }
        setLoading(false);
    };

    // --- Cascading Filter Logic ---
    const handleFilterGroupChange = async (val: string) => {
        setSelGroup(val);
        setSelType(''); // Reset child filters
        setSelSubtype('');
        setFilterSubtypes([]);
        if (val) {
            const tData = await api.getMasterTypes(val);
            setFilterTypes(tData || []);
        } else {
            setFilterTypes([]);
        }
        setCurrentPage(1);
    };

    const handleFilterTypeChange = async (val: string) => {
        setSelType(val);
        setSelSubtype('');
        if (val && selGroup) {
            const sData = await api.getMasterSubtypes(selGroup, val);
            setFilterSubtypes(sData || []);
        } else {
            setFilterSubtypes([]);
        }
        setCurrentPage(1);
    };

    // --- Form Hierarchy Logic ---
    const fetchFormHierarchy = async (g: string, tCode?: string) => {
        if (!g) return;
        const types = await api.getMasterTypes(g);
        setFormTypes(types || []);
        if (tCode) {
            const subs = await api.getMasterSubtypes(g, tCode);
            setFormSubtypes(subs || []);
        }
    };

    const handleEdit = (p: MsProduct) => {
        setFormData({ ...p });
        setEditMode('update');
        setIsEditing(true);
        fetchFormHierarchy(p.product_group_code || '', p.product_type_code || '');
    };

    const handleDelete = async (code: string) => {
        if(!confirm(`⚠️ ยืนยันการลบสินค้า รหัส: ${code}? ข้อมูลนี้ไม่สามารถกู้คืนได้!`)) return;
        setLoading(true);
        try {
            await api.deleteMsProduct(code);
            alert('ลบข้อมูลเรียบร้อย');
            loadInitialData();
        } catch(e: any) { alert('ลบไม่สำเร็จ: ' + e.message); }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!formData.product_code || !formData.product_name) return alert('กรุณาระบุรหัสและชื่อสินค้า');
        setLoading(true);
        try {
            await api.saveMsProduct(formData);
            alert('บันทึกข้อมูลสินค้าเรียบร้อย');
            setIsEditing(false);
            loadInitialData();
        } catch(e: any) { alert('บันทึกไม่สำเร็จ: ' + e.message); }
        setLoading(false);
    };

    const filteredList = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return productList.filter(p => {
            const matchSearch = (p.product_code || '').toLowerCase().includes(term) || (p.product_name || '').toLowerCase().includes(term);
            const matchGroup = !selGroup || String(p.product_group_code).trim() === selGroup.trim();
            const matchType = !selType || String(p.product_type_code).trim() === selType.trim();
            const matchSubtype = !selSubtype || String(p.product_subtype_code).trim() === selSubtype.trim();
            return matchSearch && matchGroup && matchType && matchSubtype;
        });
    }, [productList, searchTerm, selGroup, selType, selSubtype]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredList.slice(start, start + itemsPerPage);
    }, [filteredList, currentPage]);

    if (isEditing) {
        return (
            <div className="space-y-4 animate-in fade-in duration-300 pb-20 text-xs h-full overflow-y-auto">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Package size={20}/></div>
                        <div>
                            <h1 className="text-sm font-black text-slate-800 leading-none">
                                {editMode === 'create' ? 'เพิ่มสินค้าใหม่' : 'แก้ไขข้อมูลสินค้า'}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest uppercase flex items-center gap-1">
                                <Zap size={10} className="text-amber-500"/> Product Master Profile
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} className="px-5"><X size={14}/> ยกเลิก</Button>
                        <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-black shadow-lg" disabled={loading}>
                            {loading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} บันทึกสินค้า
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <Card title="ข้อมูลหลักสินค้า" className="md:col-span-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="รหัสสินค้า *" value={formData.product_code} onChange={e => setFormData({...formData, product_code: e.target.value.toUpperCase()})} disabled={editMode==='update'} className="font-black text-primary-700" />
                            <Input label="ชื่อสินค้า *" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} className="font-bold" />
                            
                            <SearchableSelect 
                                label="กลุ่มสินค้า" 
                                options={groups.map(g => ({value: g.product_group_code, label: `${g.product_group_code}: ${g.description}`}))} 
                                value={formData.product_group_code || ''} 
                                onChange={v => { setFormData({...formData, product_group_code: v, product_type_code: '', product_subtype_code: ''}); fetchFormHierarchy(v); }} 
                            />
                            <SearchableSelect 
                                label="ประเภทสินค้า" 
                                options={formTypes.map(t => ({value: t.product_type_code, label: `${t.product_type_code}: ${t.description}`}))} 
                                value={formData.product_type_code || ''} 
                                onChange={v => { setFormData({...formData, product_type_code: v, product_subtype_code: ''}); fetchFormHierarchy(formData.product_group_code!, v); }}
                                disabled={!formData.product_group_code}
                            />
                            <div className="md:col-span-2">
                                <SearchableSelect 
                                    label="ประเภทย่อยสินค้า" 
                                    options={formSubtypes.map(s => ({value: s.product_subtype_code, label: `${s.product_subtype_code}: ${s.description}`}))} 
                                    value={formData.product_subtype_code || ''} 
                                    onChange={v => setFormData({...formData, product_subtype_code: v})}
                                    disabled={!formData.product_type_code}
                                />
                            </div>
                        </div>
                    </Card>
                    <Card title="การเงินและสถานะ" className="md:col-span-4 shadow-sm">
                        <div className="space-y-4">
                            <Input label="ราคากลาง (Std Price)" type="number" value={formData.std_price} onChange={e => setFormData({...formData, std_price: Number(e.target.value)})} />
                            <Input label="ต้นทุนมาตรฐาน (Std Cost)" type="number" value={formData.std_cost} onChange={e => setFormData({...formData, std_cost: Number(e.target.value)})} />
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <span className="font-bold text-slate-600 uppercase text-[10px]">Active Status</span>
                                <select className="bg-white border rounded px-2 py-1 font-bold" value={formData.is_status} onChange={e => setFormData({...formData, is_status: e.target.value})}>
                                    <option value="Y">Active</option>
                                    <option value="N">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in text-xs font-sans overflow-hidden">
            {/* --- Advanced Hierarchy Filter Bar --- */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 ring-1 ring-slate-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-800 text-white rounded-xl shadow-lg"><Filter size={18} /></div>
                        <div>
                            <h1 className="text-base font-black text-slate-800 leading-none">ตัวกรองข้อมูลสินค้าเชิงลึก</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Multi-Level Product Hierarchy Filter</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setSelGroup(''); setSelType(''); setSelSubtype(''); setSearchTerm(''); }} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100 transition-colors">ล้างตัวกรองทั้งหมด</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SearchableSelect 
                        label="1. กลุ่มสินค้า" 
                        options={groups.map(g => ({value: g.product_group_code, label: `${g.product_group_code}: ${g.description}`}))} 
                        value={selGroup} 
                        onChange={handleFilterGroupChange}
                        placeholder="-- เลือกกลุ่มสินค้า --"
                    />
                    <SearchableSelect 
                        label="2. ประเภทสินค้า" 
                        options={filterTypes.map(t => ({value: t.product_type_code, label: `${t.product_type_code}: ${t.description}`}))} 
                        value={selType} 
                        onChange={handleFilterTypeChange}
                        placeholder="-- เลือกประเภท --"
                        disabled={!selGroup}
                    />
                    <SearchableSelect 
                        label="3. ประเภทย่อยสินค้า" 
                        options={filterSubtypes.map(s => ({value: s.product_subtype_code, label: `${s.product_subtype_code}: ${s.description}`}))} 
                        value={selSubtype} 
                        onChange={v => setSelSubtype(v)}
                        placeholder="-- เลือกประเภทย่อย --"
                        disabled={!selType}
                    />
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-semibold text-slate-600 ml-1">4. ค้นหาทั่วไป</label>
                        <div className="relative">
                            <input 
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" 
                                placeholder="รหัส หรือ ชื่อสินค้า..." 
                                value={searchTerm} 
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            />
                            <Search size={14} className="absolute left-3 top-2.5 text-slate-400"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Data List Section --- */}
            <div className="flex justify-between items-center bg-white/50 px-2">
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><LayoutGrid size={12} className="text-primary-400"/> พบ {filteredList.length} รายการ</span>
                    {selGroup && <span className="flex items-center gap-1"><Layers size={12} className="text-amber-400"/> กลุ่ม: {selGroup}</span>}
                 </div>
                 <div className="flex gap-2">
                    <button onClick={loadInitialData} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
                    <Button onClick={() => { setFormData({...formData, product_code: '', product_name: ''}); setEditMode('create'); setIsEditing(true); }} size="sm" className="bg-primary-800 text-white font-bold px-6 rounded-xl shadow-md"><Plus size={16} /> เพิ่มสินค้าใหม่</Button>
                 </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-xs text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                                <th className="py-2.5 px-4 border-b border-slate-200 w-40">รหัสสินค้า</th>
                                <th className="py-2.5 px-4 border-b border-slate-200">ชื่อรายการสินค้า / ลำดับชั้น</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-right">ราคากลาง</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">สถานะ</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 text-center w-32">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {loading && productList.length === 0 ? (
                                <tr><td colSpan={5} className="p-32 text-center font-black text-slate-400 animate-pulse tracking-widest uppercase">Connecting to Master Catalog...</td></tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((p) => (
                                    <tr key={`${p.comp_code}-${p.product_code}`} className="group hover:bg-primary-50/40 transition-all duration-150">
                                        <td className="py-1 px-4 align-middle font-mono font-bold text-primary-700">
                                            <div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center shadow-sm">{p.product_code}</div>
                                        </td>
                                        <td className="py-1 px-4 align-middle">
                                            <div className="font-bold text-slate-800 uppercase leading-none mb-0.5 text-xs">{p.product_name}</div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-2">
                                                <span className="flex items-center gap-0.5"><LayoutGrid size={10}/> {p.product_group_code}</span>
                                                <span className="flex items-center gap-0.5"><Layers size={10}/> {p.product_type_code}</span>
                                                {p.product_subtype_code && <span className="flex items-center gap-0.5"><ListTree size={10}/> {p.product_subtype_code}</span>}
                                            </div>
                                        </td>
                                        <td className="py-1 px-4 align-middle text-right font-mono font-bold text-slate-600">{(p.std_price || 0).toLocaleString()}</td>
                                        <td className="py-1 px-4 align-middle text-center">
                                            <Badge type={p.is_status === 'Y' ? 'success' : 'neutral'}>{p.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                                        </td>
                                        <td className="py-1 px-4 align-middle text-center">
                                            <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="p-1.5 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100"><Edit size={14}/></button>
                                                <button onClick={() => handleDelete(p.product_code)} className="p-1.5 text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-rose-100"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลสินค้าที่ตรงกับเงื่อนไขการกรอง</td></tr>
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
