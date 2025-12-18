
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SearchableSelect, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MsProduct, MsProductComponent, MsProductMemo, CompanyItem, ProductGroupItem, ProductTypeItem, MasterSubtype, Product, UnitItem } from '../types';
import { Edit, Trash2, Plus, Save, Package, FileText, Settings, X, Search, Database, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProduct = () => {
    const { t } = useLanguage();
    
    // View State
    const [viewMode, setViewMode] = useState<'LIST'|'FORM'>('LIST');
    const [productList, setProductList] = useState<MsProduct[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    
    // Master Data
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [groups, setGroups] = useState<ProductGroupItem[]>([]);
    const [types, setTypes] = useState<ProductTypeItem[]>([]);
    const [subtypes, setSubtypes] = useState<MasterSubtype[]>([]); 
    const [units, setUnits] = useState<UnitItem[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]); 

    // Form State
    const [activeTab, setActiveTab] = useState<'GENERAL'|'UNIT_PRICE'|'ACCOUNT'|'FLAGS'|'COMPONENT'|'MEMO'>('GENERAL');
    
    const initialFormHead: MsProduct = {
        comp_code: '01', // Default Auto '01'
        product_code: '',
        product_name: '',
        is_status: 'Y',
        is_spec: 'N', is_spare: 'N', is_rent: 'N', 
        is_special: 'N', is_trade: 'N', 
        is_type: 'N', is_rf: 'N', is_notf: 'N', 
        product_master: 'N', is_warranty: 'N', is_depreciate: 'N',
        
        barcode: '', product_brand_code: '', product_group_code: '', product_type_code: '', product_subtype_code: '',
        model: '', assort_kit: '', extra_spec: '', idp_code: '', photo_path_a: '', photo_path_b: '',
        unit_buy: '', buyamt1: 1, buyamt2: 1,
        unit_sale: '', saleamt1: 1, saleamt2: 1,
        std_price: 0, std_cost: 0, avg_cost: 0, stock_min: 0, lead_time: 0, total_max: 0, point_total: 0, total_warranty: 0,
        in_vat: '', account_code: '', account_code_c: '', account_code_e: ''
    };

    const [formHead, setFormHead] = useState<MsProduct>(initialFormHead);
    const [formComponents, setFormComponents] = useState<MsProductComponent[]>([]);
    const [formMemo, setFormMemo] = useState<MsProductMemo>({
        comp_code: '01',
        product_code: '',
        product_memo: ''
    });
    
    const [isEditMode, setIsEditMode] = useState(false); 

    useEffect(() => {
        loadInitData();
    }, []);

    const loadInitData = async () => {
        setLoading(true);
        try {
            const c = await api.getCompanies();
            setCompanies(c || []);
            const g = await api.getProductGroups();
            setGroups(g || []);
            const u = await api.getUnits();
            setUnits(u || []);
            const prodList = await api.getMsProductsList();
            setProductList(prodList || []);
            const p = await api.getProducts();
            setAllProducts(p || []);
            setCurrentPage(1);
        } catch(e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        const loadTypes = async () => {
            if (formHead.product_group_code) {
                const t = await api.getMasterTypes(formHead.product_group_code);
                setTypes(t);
            } else { setTypes([]); }
        };
        loadTypes();
    }, [formHead.product_group_code]);

    useEffect(() => {
        const loadSub = async () => {
            if (formHead.product_group_code && formHead.product_type_code) {
                const s = await api.getMasterSubtypes(formHead.product_group_code, formHead.product_type_code);
                setSubtypes(s);
            } else { setSubtypes([]); }
        };
        loadSub();
    }, [formHead.product_group_code, formHead.product_type_code]);


    const handleCreate = async () => {
        setFormHead({
            ...initialFormHead,
            comp_code: '01', // Force '01'
            product_code: 'Loading...' // Indicate loading
        });
        setFormComponents([]);
        setFormMemo({ comp_code: '01', product_code: '', product_memo: '' });
        setIsEditMode(false);
        setViewMode('FORM');
        setActiveTab('GENERAL');

        // Fetch Runno immediately
        try {
            const res = await api.getProductRunno('01');
            setFormHead(prev => ({ ...prev, product_code: res.runno }));
        } catch(e) {
            console.error(e);
            setFormHead(prev => ({ ...prev, product_code: 'ERROR' }));
            alert('Failed to generate Product Code');
        }
    };

    const handleEdit = async (comp: string, code: string) => {
        try {
            const data = await api.getMsProductDetail(comp, code);
            setFormHead(data.head);
            setFormComponents(data.components.map((c, i) => ({...c, id: `exist-${i}`})));
            setFormMemo(data.memo || { comp_code: comp, product_code: code, product_memo: '' });
            setIsEditMode(true);
            setViewMode('FORM');
            setActiveTab('GENERAL');
        } catch(e) { alert('Load Failed'); }
    };

    const handleDelete = async (comp: string, code: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.deleteMsProduct(comp, code);
            loadInitData();
        } catch(e) { alert('Delete Failed'); }
    };

    const handleSave = async () => {
        // Ensure comp_code is set to '01' if empty (fallback)
        const payloadHead = { ...formHead, comp_code: formHead.comp_code || '01' };
        
        if (!payloadHead.product_code || !payloadHead.product_name) {
            return alert('Required: Product Code, Name');
        }
        
        try {
            await api.saveMsProduct({
                head: payloadHead,
                components: formComponents,
                memo: formMemo
            });
            alert('Saved Successfully');
            setViewMode('LIST');
            loadInitData();
        } catch(e: any) {
            alert('Save Failed: ' + e.message);
        }
    };

    const updateHead = (field: keyof MsProduct, value: any) => {
        setFormHead(prev => ({ ...prev, [field]: value }));
    };

    const addComponent = () => {
        setFormComponents([...formComponents, {
            comp_code: formHead.comp_code || '01',
            product_code: formHead.product_code,
            seq: formComponents.length + 1,
            component_code: '',
            component_qty: 1,
            id: `new-${Date.now()}`
        }]);
    };

    const removeComponent = (idx: number) => {
        const list = [...formComponents];
        list.splice(idx, 1);
        list.forEach((item, i) => item.seq = i + 1);
        setFormComponents(list);
    };

    const updateComponent = (idx: number, field: string, val: any) => {
        const list = [...formComponents];
        (list[idx] as any)[field] = val;
        setFormComponents(list);
    };

    // Filter Logic
    const filteredList = productList.filter(p => 
        p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (viewMode === 'LIST') {
        return (
            <div className="w-full h-full flex flex-col space-y-4">
                <div className="flex justify-between items-center shrink-0 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                            <Package size={20} /> {t('menu.master_product')}
                        </h1>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search Code/Name..." 
                                className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-full w-48 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <Search size={12} className="absolute left-2.5 top-1.5 text-slate-400"/>
                        </div>
                    </div>
                    <Button onClick={handleCreate} size="sm" className="bg-primary-600 text-white px-3 py-1.5 text-xs">
                        <Plus size={14} /> {t('btn.add')}
                    </Button>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-md">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="py-2 px-3 w-32 border-b border-slate-200">Code</th>
                                    <th className="py-2 px-3 border-b border-slate-200">Name</th>
                                    <th className="py-2 px-3 w-28 border-b border-slate-200">Group</th>
                                    <th className="py-2 px-3 w-20 text-center border-b border-slate-200">Status</th>
                                    <th className="py-2 px-3 w-20 text-center border-b border-slate-200">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-slate-400">{t('loading')}</td></tr>
                                ) : currentItems.map((p, i) => (
                                    <tr key={p.product_code} className={`hover:bg-slate-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                        <td className="py-1 px-3 font-mono font-bold text-primary-700 align-middle">{p.product_code}</td>
                                        <td className="py-1 px-3 align-middle">
                                            <div className="font-semibold text-slate-800 truncate max-w-[300px]">{p.product_name}</div>
                                        </td>
                                        <td className="py-1 px-3 text-slate-600 align-middle font-mono">{p.product_group_code}</td>
                                        <td className="py-1 px-3 text-center align-middle">
                                            {p.is_status === 'Y' ? (
                                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                                            ) : (
                                                <span className="inline-block w-2 h-2 rounded-full bg-slate-300" title="Inactive"></span>
                                            )}
                                        </td>
                                        <td className="py-1 px-3 text-center align-middle">
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => handleEdit(p.comp_code, p.product_code)} className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors" title="Edit"><Edit size={14}/></button>
                                                <button onClick={() => handleDelete(p.comp_code, p.product_code)} className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && !loading && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic bg-slate-50/20">No Records Found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="border-t border-slate-200 px-3 py-2 bg-slate-50 flex justify-between items-center shrink-0 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] z-20">
                        <div className="text-[11px] text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredList.length)}</span> of <span className="font-bold text-slate-700">{filteredList.length}</span> entries
                        </div>
                        
                        <div className="flex items-center space-x-1">
                            <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-1 rounded-md hover:bg-white hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500" title="First Page"><ChevronsLeft size={14} /></button>
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-1 rounded-md hover:bg-white hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500" title="Previous Page"><ChevronLeft size={14} /></button>
                            
                            <div className="flex items-center space-x-2 px-2 border-l border-r border-slate-200 mx-1">
                                <span className="text-[11px] text-slate-500 font-medium">Page</span>
                                <select 
                                    value={currentPage} 
                                    onChange={(e) => goToPage(Number(e.target.value))}
                                    className="h-6 text-[11px] border border-slate-300 rounded px-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold text-primary-700 cursor-pointer shadow-sm min-w-[50px]"
                                >
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                        <option key={pageNum} value={pageNum}>{pageNum}</option>
                                    ))}
                                </select>
                                <span className="text-[11px] text-slate-500 font-medium">of {totalPages}</span>
                            </div>

                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-1 rounded-md hover:bg-white hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500" title="Next Page"><ChevronRight size={14} /></button>
                            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-1 rounded-md hover:bg-white hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500" title="Last Page"><ChevronsRight size={14} /></button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Form View (Updated to match MasterCompany structure)
    return (
        <div className="w-full h-full flex flex-col space-y-4 pb-20">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm shrink-0">
                <h1 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                    <Package size={20}/> {isEditMode ? 'แก้ไขสินค้า' : 'สร้างสินค้าใหม่'}
                </h1>
                <Button variant="secondary" size="sm" onClick={() => setViewMode('LIST')}><X size={16}/> Cancel</Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-start text-xs">
                     {/* Removed Company Select, defaulting to '01' in logic */}
                     <div className="md:col-span-4">
                        <Input label="รหัสสินค้า *" dbField="product_code" value={formHead.product_code} onChange={e => updateHead('product_code', e.target.value)} disabled={isEditMode} className={isEditMode ? 'bg-slate-100' : ''} />
                     </div>
                     <div className="md:col-span-8">
                        <Input label="ชื่อสินค้า *" dbField="product_name" value={formHead.product_name} onChange={e => updateHead('product_name', e.target.value)} />
                     </div>
                </div>

                <div className="flex gap-2 border-b border-slate-200 overflow-x-auto bg-white px-2 pt-2 rounded-t-xl shadow-sm sticky top-0 z-10">
                    {[
                        {id:'GENERAL', icon:Package, label:'ข้อมูลทั่วไป'},
                        {id:'UNIT_PRICE', icon:Database, label:'หน่วยนับ/ราคา'},
                        {id:'ACCOUNT', icon:FileText, label:'บัญชี/การเงิน'},
                        {id:'FLAGS', icon:Settings, label:'การตั้งค่าสถานะ'},
                        {id:'COMPONENT', icon:Database, label:'ส่วนประกอบ'},
                        {id:'MEMO', icon:FileText, label:'รายละเอียดสินค้า'}
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 font-bold text-xs border-b-4 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary-600 text-primary-700 bg-slate-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                        >
                            <tab.icon size={14}/> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-b-xl shadow-sm border border-t-0 border-slate-200 text-xs min-h-[400px]">
                    
                    {activeTab === 'GENERAL' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Input label="Barcode" dbField="barcode" value={formHead.barcode || ''} onChange={e => updateHead('barcode', e.target.value)} />
                                <Input label="Model" dbField="model" value={formHead.model || ''} onChange={e => updateHead('model', e.target.value)} />
                                <Input label="Extra Spec" dbField="extra_spec" value={formHead.extra_spec || ''} onChange={e => updateHead('extra_spec', e.target.value)} />
                                <Input label="Assort Kit" dbField="assort_kit" value={formHead.assort_kit || ''} onChange={e => updateHead('assort_kit', e.target.value)} />
                                <Input label="IDP Code" dbField="idp_code" value={formHead.idp_code || ''} onChange={e => updateHead('idp_code', e.target.value)} />
                            </div>
                            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <SearchableSelect label="ยี่ห้อ (Brand)" dbField="product_brand_code" options={[]} value={formHead.product_brand_code || ''} onChange={v => updateHead('product_brand_code', v)} freeText />
                                <SearchableSelect label="กลุ่มสินค้า *" dbField="product_group_code" options={groups.map(g => ({value:g.product_group_code, label:g.description}))} value={formHead.product_group_code || ''} onChange={v => updateHead('product_group_code', v)} />
                                <SearchableSelect label="ประเภทสินค้า *" dbField="product_type_code" options={types.map(t => ({value:t.product_type_code, label:t.description}))} value={formHead.product_type_code || ''} onChange={v => updateHead('product_type_code', v)} />
                                <SearchableSelect label="ประเภทสินค้าย่อย" dbField="product_subtype_code" options={subtypes.map(s => ({value:s.product_subtype_code, label:s.description}))} value={formHead.product_subtype_code || ''} onChange={v => updateHead('product_subtype_code', v)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'UNIT_PRICE' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                    <h3 className="font-bold text-emerald-800 mb-2 border-b border-emerald-200 pb-1">หน่วยนับรับเข้า (Buying Unit)</h3>
                                    <div className="grid grid-cols-3 gap-2 items-end">
                                        <div className="col-span-1"><SearchableSelect label="หน่วยรับ" dbField="unit_buy" options={units.map(u => ({value:u.unit_code, label:u.description}))} value={formHead.unit_buy || ''} onChange={v => updateHead('unit_buy', v)} /></div>
                                        <Input type="number" label="ตัวคูณ 1" dbField="buyamt1" value={formHead.buyamt1 || 1} onChange={e => updateHead('buyamt1', Number(e.target.value))} />
                                        <Input type="number" label="ตัวคูณ 2" dbField="buyamt2" value={formHead.buyamt2 || 1} onChange={e => updateHead('buyamt2', Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100">
                                    <h3 className="font-bold text-cyan-800 mb-2 border-b border-cyan-200 pb-1">หน่วยนับจ่ายออก (Selling Unit)</h3>
                                    <div className="grid grid-cols-3 gap-2 items-end">
                                        <div className="col-span-1"><SearchableSelect label="หน่วยจ่าย" dbField="unit_sale" options={units.map(u => ({value:u.unit_code, label:u.description}))} value={formHead.unit_sale || ''} onChange={v => updateHead('unit_sale', v)} /></div>
                                        <Input type="number" label="ตัวคูณ 1" dbField="saleamt1" value={formHead.saleamt1 || 1} onChange={e => updateHead('saleamt1', Number(e.target.value))} />
                                        <Input type="number" label="ตัวคูณ 2" dbField="saleamt2" value={formHead.saleamt2 || 1} onChange={e => updateHead('saleamt2', Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="ต้นทุนมาตรฐาน" dbField="std_cost" type="number" value={formHead.std_cost || 0} onChange={e => updateHead('std_cost', Number(e.target.value))} />
                                    <Input label="ราคาขายมาตรฐาน" dbField="std_price" type="number" value={formHead.std_price || 0} onChange={e => updateHead('std_price', Number(e.target.value))} />
                                    <Input label="ต้นทุนเฉลี่ย" dbField="avg_cost" type="number" value={formHead.avg_cost || 0} onChange={e => updateHead('avg_cost', Number(e.target.value))} />
                                    <Input label="ภาษีการนำเข้า (%)" dbField="in_vat" value={formHead.in_vat || ''} onChange={e => updateHead('in_vat', e.target.value)} placeholder="%" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                                    <Input label="ระดับต่ำสุด (Min Stock)" dbField="stock_min" type="number" value={formHead.stock_min || 0} onChange={e => updateHead('stock_min', Number(e.target.value))} />
                                    <Input label="ระยะเวลาส่งของ (วัน)" dbField="lead_time" type="number" value={formHead.lead_time || 0} onChange={e => updateHead('lead_time', Number(e.target.value))} />
                                    <Input label="เบิกได้ไม่เกิน" dbField="total_max" type="number" value={formHead.total_max || 0} onChange={e => updateHead('total_max', Number(e.target.value))} />
                                    <Input label="Point Total" dbField="point_total" type="number" value={formHead.point_total || 0} onChange={e => updateHead('point_total', Number(e.target.value))} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ACCOUNT' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                            <Input label="รหัสบัญชี (Account Code)" dbField="account_code" value={formHead.account_code || ''} onChange={e => updateHead('account_code', e.target.value)} />
                            <Input label="รหัสบัญชีต้นทุน (Cost)" dbField="account_code_c" value={formHead.account_code_c || ''} onChange={e => updateHead('account_code_c', e.target.value)} />
                            <Input label="รหัสบัญชีค่าใช้จ่าย (Expense)" dbField="account_code_e" value={formHead.account_code_e || ''} onChange={e => updateHead('account_code_e', e.target.value)} />
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formHead.is_depreciate === 'Y'} onChange={e => updateHead('is_depreciate', e.target.checked?'Y':'N')} className="accent-primary-600"/> คิดค่าเสื่อมราคา [is_depreciate]</label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'FLAGS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                                <h4 className="font-bold border-b pb-1 mb-2 text-primary-700">General Status</h4>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_status === 'Y'} onChange={e => updateHead('is_status', e.target.checked?'Y':'N')} className="accent-emerald-600"/> สถานะใช้งาน [is_status]</label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.product_master === 'Y'} onChange={e => updateHead('product_master', e.target.checked?'Y':'N')} className="accent-primary-600"/> สินค้าหลัก [product_master]</label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_special === 'Y'} onChange={e => updateHead('is_special', e.target.checked?'Y':'N')} className="accent-primary-600"/> สินค้าพิเศษ [is_special]</label>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                                <h4 className="font-bold border-b pb-1 mb-2 text-primary-700">Type & Spec</h4>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_spec === 'Y'} onChange={e => updateHead('is_spec', e.target.checked?'Y':'N')} className="accent-primary-600"/> มี Spec [is_spec]</label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_spare === 'Y'} onChange={e => updateHead('is_spare', e.target.checked?'Y':'N')} className="accent-primary-600"/> เป็นอะไหล่ [is_spare]</label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_type === 'Y'} onChange={e => updateHead('is_type', e.target.checked?'Y':'N')} className="accent-primary-600"/> คิดค่าเชื่อม [is_type]</label>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                                <h4 className="font-bold border-b pb-1 mb-2 text-primary-700">Process Control</h4>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_rent === 'Y'} onChange={e => updateHead('is_rent', e.target.checked?'Y':'N')} className="accent-primary-600"/> สำหรับเช่า [is_rent]</label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_trade === 'Y'} onChange={e => updateHead('is_trade', e.target.checked?'Y':'N')} className="accent-primary-600"/> สำหรับเทรด [is_trade]</label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_rf === 'Y'} onChange={e => updateHead('is_rf', e.target.checked?'Y':'N')} className="accent-primary-600"/> ทำ RF [is_rf]</label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_notf === 'Y'} onChange={e => updateHead('is_notf', e.target.checked?'Y':'N')} className="accent-primary-600"/> Not F [is_notf]</label>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                                <h4 className="font-bold border-b pb-1 mb-2 text-primary-700">Warranty</h4>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"><input type="checkbox" checked={formHead.is_warranty === 'Y'} onChange={e => updateHead('is_warranty', e.target.checked?'Y':'N')} className="accent-primary-600"/> มีการรับประกัน [is_warranty]</label>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-slate-600">จำนวนวันรับประกัน:</span>
                                    <Input type="number" className="w-24 text-right h-8 py-1" value={formHead.total_warranty || 0} onChange={e => updateHead('total_warranty', Number(e.target.value))} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'COMPONENT' && (
                        <div>
                            <div className="flex justify-end mb-3">
                                <Button size="sm" onClick={addComponent} className="bg-cyan-600 text-white"><Plus size={14}/> เพิ่มส่วนประกอบ</Button>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="bg-slate-100 font-bold text-slate-700">
                                        <tr>
                                            <th className="p-2 w-12 text-center border-b border-slate-200">Seq</th>
                                            <th className="p-2 text-left border-b border-slate-200">รหัสสินค้าส่วนประกอบ [component_code]</th>
                                            <th className="p-2 w-24 text-right border-b border-slate-200">จำนวน</th>
                                            <th className="p-2 w-12 text-center border-b border-slate-200">ลบ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {formComponents.map((row, idx) => (
                                            <tr key={row.id || idx}>
                                                <td className="p-2 text-center">{idx + 1}</td>
                                                <td className="p-2">
                                                    <SearchableSelect 
                                                        options={allProducts.map(p => ({value:p.product_code, label:`${p.product_code}: ${p.product_name}`}))}
                                                        value={row.component_code}
                                                        onChange={v => updateComponent(idx, 'component_code', v)}
                                                        className="text-xs py-1"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input type="number" value={row.component_qty} onChange={e => updateComponent(idx, 'component_qty', Number(e.target.value))} className="text-right h-8 py-1" />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button onClick={() => removeComponent(idx)} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={14}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {formComponents.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-400 italic">ไม่มีรายการส่วนประกอบ</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'MEMO' && (
                        <div className="h-full">
                            <label className="block font-bold text-slate-700 mb-2">รายละเอียดสินค้าเพิ่มเติม <span className="text-[9px] font-mono text-rose-400 ml-1">[product_memo]</span></label>
                            <textarea 
                                className="w-full border border-slate-300 rounded-lg p-3 h-64 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                                value={formMemo.product_memo || ''}
                                onChange={e => setFormMemo({...formMemo, product_memo: e.target.value})}
                                placeholder="กรอกรายละเอียดสินค้าที่นี่..."
                            ></textarea>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-slate-50 p-3 border-t border-slate-200 shadow-inner z-20 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => setViewMode('LIST')}>{t('btn.cancel')}</Button>
                <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"><Save size={16}/> {t('btn.save')}</Button>
            </div>
        </div>
    );
};
