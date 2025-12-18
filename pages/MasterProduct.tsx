
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { MsProduct, MsProductComponent, MsProductMemo, CompanyItem, ProductGroupItem, ProductTypeItem, MasterSubtype, Product, UnitItem } from '../types';
import { Edit, Trash2, Plus, Save, Package, FileText, Settings, X, Search, Database, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProduct = () => {
    const { t } = useLanguage();
    
    const [viewMode, setViewMode] = useState<'LIST'|'FORM'>('LIST');
    const [productList, setProductList] = useState<MsProduct[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Search & Pagination Logic
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    
    // Master Data States
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [groups, setGroups] = useState<ProductGroupItem[]>([]);
    const [types, setTypes] = useState<ProductTypeItem[]>([]);
    const [subtypes, setSubtypes] = useState<MasterSubtype[]>([]); 
    const [units, setUnits] = useState<UnitItem[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]); 

    const [activeTab, setActiveTab] = useState<'GENERAL'|'UNIT_PRICE'|'ACCOUNT'|'FLAGS'|'COMPONENT'|'MEMO'>('GENERAL');
    
    const initialFormHead: MsProduct = {
        comp_code: '01', product_code: '', product_name: '', is_status: 'Y',
        is_spec: 'N', is_spare: 'N', is_rent: 'N', is_special: 'N', is_trade: 'N', 
        is_type: 'N', is_rf: 'N', is_notf: 'N', product_master: 'N', is_warranty: 'N', is_depreciate: 'N',
        barcode: '', product_brand_code: '', product_group_code: '', product_type_code: '', product_subtype_code: '',
        model: '', assort_kit: '', extra_spec: '', idp_code: '', photo_path_a: '', photo_path_b: '',
        unit_buy: '', buyamt1: 1, buyamt2: 1, unit_sale: '', saleamt1: 1, saleamt2: 1,
        std_price: 0, std_cost: 0, avg_cost: 0, stock_min: 0, lead_time: 0, total_max: 0, point_total: 0, total_warranty: 0,
        in_vat: '', account_code: '', account_code_c: '', account_code_e: ''
    };

    const [formHead, setFormHead] = useState<MsProduct>(initialFormHead);
    const [formComponents, setFormComponents] = useState<MsProductComponent[]>([]);
    const [formMemo, setFormMemo] = useState<MsProductMemo>({ comp_code: '01', product_code: '', product_memo: '' });
    const [isEditMode, setIsEditMode] = useState(false); 

    useEffect(() => { loadInitData(); }, []);

    const loadInitData = async () => {
        setLoading(true);
        try {
            const [c, g, u, prodList, p] = await Promise.all([
                api.getCompanies(), api.getProductGroups(), api.getUnits(), 
                api.getMsProductsList(), api.getProducts()
            ]);
            setCompanies(c || []); setGroups(g || []); setUnits(u || []);
            setProductList(prodList || []); setAllProducts(p || []);
            setCurrentPage(1);
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const loadTypesAndSub = async () => {
            if (formHead.product_group_code) {
                const tRes = await api.getMasterTypes(formHead.product_group_code);
                setTypes(tRes || []);
                if (formHead.product_type_code) {
                    const sRes = await api.getMasterSubtypes(formHead.product_group_code, formHead.product_type_code);
                    setSubtypes(sRes || []);
                }
            } else { setTypes([]); setSubtypes([]); }
        };
        loadTypesAndSub();
    }, [formHead.product_group_code, formHead.product_type_code]);

    const handleCreate = async () => {
        setFormHead({ ...initialFormHead, comp_code: '01', product_code: '...' });
        setFormComponents([]);
        setFormMemo({ comp_code: '01', product_code: '', product_memo: '' });
        setIsEditMode(false); setViewMode('FORM'); setActiveTab('GENERAL');
        try {
            const res = await api.getProductRunno('01');
            setFormHead(prev => ({ ...prev, product_code: res.runno }));
        } catch(e) { setFormHead(prev => ({ ...prev, product_code: 'AUTO' })); }
    };

    const handleEdit = async (comp: string, code: string) => {
        setLoading(true);
        try {
            const data = await api.getMsProductDetail(comp, code);
            setFormHead(data.head);
            setFormComponents(data.components.map((c, i) => ({...c, id: `exist-${i}`})));
            setFormMemo(data.memo || { comp_code: comp, product_code: code, product_memo: '' });
            setIsEditMode(true); setViewMode('FORM'); setActiveTab('GENERAL');
        } catch(e) { alert('Load Failed'); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!formHead.product_code || !formHead.product_name) return alert('Required fields missing');
        try {
            await api.saveMsProduct({ head: formHead, components: formComponents, memo: formMemo });
            alert('Saved Successfully'); setViewMode('LIST'); loadInitData();
        } catch(e: any) { alert('Save Failed: ' + e.message); }
    };

    const filteredList = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return productList;
        return productList.filter(p => 
            (p.product_code || '').toLowerCase().includes(term) || 
            (p.product_name || '').toLowerCase().includes(term)
        );
    }, [productList, searchTerm]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredList.slice(start, start + itemsPerPage);
    }, [filteredList, currentPage]);

    if (viewMode === 'LIST') {
        return (
            <div className="w-full h-full flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-center shrink-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Package size={24} /></div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('menu.master_product')}</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inventory Master Maintenance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <input 
                                type="text" 
                                placeholder="Search by code or name..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all focus:border-primary-500"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <Search size={16} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors"/>
                        </div>
                        <button onClick={loadInitData} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500 shadow-xs"><RefreshCw size={18} className={loading ? 'animate-spin text-primary-500' : ''}/></button>
                        <Button onClick={handleCreate} className="bg-primary-800 hover:bg-primary-900 text-white rounded-xl py-2.5 px-6 font-black shadow-lg shadow-primary-900/20"><Plus size={18} /> {t('btn.add')}</Button>
                    </div>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-xs text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-20">
                                <tr className="bg-slate-100/95 backdrop-blur-md text-slate-700 font-bold uppercase shadow-sm">
                                    <th className="py-3 px-4 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-40">Product Code</th>
                                    <th className="py-3 px-4 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px]">Product Name</th>
                                    <th className="py-3 px-4 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] w-32">Group</th>
                                    <th className="py-3 px-4 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-24">Status</th>
                                    <th className="py-3 px-4 border-b border-slate-200 text-slate-500 font-black tracking-widest text-[9px] text-center w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {loading && productList.length === 0 ? (
                                    <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={40}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Inventory Data...</span></td></tr>
                                ) : currentItems.map((p) => (
                                    <tr key={p.product_code} className="group hover:bg-primary-50/40 transition-all duration-150">
                                        <td className="py-2 px-4 align-middle font-mono font-bold text-primary-700"><div className="bg-primary-50 border border-primary-100 px-3 py-1 rounded-md text-center inline-block">{p.product_code}</div></td>
                                        <td className="py-2 px-4 align-middle font-bold text-slate-800 group-hover:text-primary-900 truncate max-w-[400px]">{p.product_name}</td>
                                        <td className="py-2 px-4 align-middle text-slate-500 font-mono text-[10px] uppercase tracking-tighter">{p.product_group_code || '-'}</td>
                                        <td className="py-2 px-4 align-middle text-center">
                                            <span className={`inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${p.is_status === 'Y' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                        </td>
                                        <td className="py-2 px-4 align-middle">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleEdit(p.comp_code, p.product_code)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg shadow-xs bg-white border border-slate-100" title="Edit"><Edit size={14}/></button>
                                                <button onClick={() => { if(confirm('Delete this product?')) api.deleteMsProduct(p.comp_code, p.product_code).then(() => loadInitData()); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg shadow-xs bg-white border border-slate-100" title="Delete"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && currentItems.length === 0 && <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">No inventory records found</td></tr>}
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
    }

    return (
        <div className="w-full h-full flex flex-col space-y-4 pb-20 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-800 text-white rounded-xl shadow-lg"><Package size={24}/></div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">{isEditMode ? 'แก้ไขสินค้า' : 'สร้างสินค้าใหม่'}</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SKU Specification</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setViewMode('LIST')} className="rounded-xl px-6 font-bold"><X size={16}/> {t('btn.cancel')}</Button>
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-12 font-black shadow-lg"><Save size={18}/> {t('btn.save')}</Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                <Card className="p-6 border-0 shadow-xl ring-1 ring-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-sm">
                         <div className="md:col-span-3">
                            <Input label="รหัสสินค้า *" dbField="product_code" value={formHead.product_code} onChange={e => setFormHead({...formHead, product_code: e.target.value})} disabled={isEditMode} className={isEditMode ? 'bg-slate-50 font-black' : 'font-black'} />
                         </div>
                         <div className="md:col-span-9">
                            <Input label="ชื่อสินค้า *" dbField="product_name" value={formHead.product_name} onChange={e => setFormHead({...formHead, product_name: e.target.value})} className="font-bold" />
                         </div>
                    </div>
                </Card>

                <div className="flex gap-1 border-b border-slate-200 bg-white px-2 pt-2 rounded-t-2xl sticky top-0 z-10 shadow-sm overflow-x-auto no-scrollbar">
                    {[
                        {id:'GENERAL', icon:Database, label:'ข้อมูลหลัก'}, {id:'UNIT_PRICE', icon:Settings, label:'ราคา/หน่วย'},
                        {id:'FLAGS', icon:FileText, label:'สถานะอื่นๆ'}, {id:'COMPONENT', icon:Plus, label:'ส่วนประกอบ'}, {id:'MEMO', icon:FileText, label:'หมายเหตุ'}
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-2.5 font-black text-[11px] uppercase tracking-wider border-b-4 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}><tab.icon size={14}/> {tab.label}</button>
                    ))}
                </div>

                <div className="bg-white p-8 rounded-b-2xl shadow-xl border border-t-0 border-slate-200 text-xs min-h-[400px]">
                    {activeTab === 'GENERAL' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <Input label="Barcode" dbField="barcode" value={formHead.barcode || ''} onChange={e => setFormHead({...formHead, barcode: e.target.value})} />
                                <Input label="Model" dbField="model" value={formHead.model || ''} onChange={e => setFormHead({...formHead, model: e.target.value})} />
                                <SearchableSelect label="กลุ่มสินค้า" dbField="product_group_code" options={groups.map(g => ({value:g.product_group_code, label:g.description}))} value={formHead.product_group_code || ''} onChange={v => setFormHead({...formHead, product_group_code: v})} />
                            </div>
                            <div className="space-y-4">
                                <Input label="IDP Code" dbField="idp_code" value={formHead.idp_code || ''} onChange={e => setFormHead({...formHead, idp_code: e.target.value})} />
                                <SearchableSelect label="ยี่ห้อ (Brand)" options={[]} value={formHead.product_brand_code || ''} onChange={v => setFormHead({...formHead, product_brand_code: v})} freeText />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
