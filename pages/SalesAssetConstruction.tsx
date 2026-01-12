
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination } from '../components/ui';
import { BrwcaHead, BrwcaDetail, CompanyItem, StaffItem, LocationItem, StockItem, MsProduct } from '../types';
import { api } from '../services/apiService'; 
import { Plus, Trash2, Save, FileText, Search, RefreshCw, ArrowLeft, Edit, Calendar, HardHat, Barcode, MapPin, ArrowUpFromLine } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const SalesAssetConstruction = () => {
  const { t } = useLanguage();
  
  // -- View Mode State --
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // -- Data State --
  const [historyDocs, setHistoryDocs] = useState<BrwcaHead[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<MsProduct[]>([]);

  // -- Form State --
  const [compCode, setCompCode] = useState(''); 
  const [brwNo, setBrwNo] = useState(''); 
  const [brwDate, setBrwDate] = useState(new Date().toISOString().split('T')[0]); 
  const [staffCode, setStaffCode] = useState(''); 
  const [outLocation, setOutLocation] = useState('');
  const [outStock, setOutStock] = useState('');
  const [remark, setRemark] = useState(''); 
  const [details, setDetails] = useState<BrwcaDetail[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Input Row
  const [selectedProduct, setSelectedProduct] = useState('');
  const [inputSerial, setInputSerial] = useState('');
  const [inputPrice, setInputPrice] = useState(0);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
        const [h, c, s, l, p] = await Promise.all([
            api.getSalesCaHeaders(),
            api.getCompanies(), 
            api.getStaff(), 
            api.getLocations(),
            api.getProducts()
        ]);
        setHistoryDocs(Array.isArray(h) ? h : []);
        setCompanies(c || []);
        setStaffList(s || []);
        setLocations(l || []);
        setProducts(p || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (outLocation) api.getStocks(outLocation).then(setStocks); else setStocks([]);
  }, [outLocation]);

  const handleEdit = async (item: BrwcaHead) => {
      setLoading(true);
      try {
          const res = await api.getSalesCaDocument(item.comp_code, item.brw_no);
          if (res) {
              const { head, details: dtls } = res;
              setCompCode(head.comp_code);
              setBrwNo(head.brw_no);
              setBrwDate(head.brw_date.split('T')[0]);
              setStaffCode(head.staff_code || '');
              setOutLocation(head.outlocation_code || '');
              setOutStock(head.outstock_code || '');
              setRemark(head.remark || '');
              setDetails(dtls.map((d: any, i: number) => ({ ...d, id: `e-${i}` })));
              setIsEditMode(true);
              setViewMode('form');
          }
      } catch (e) { alert("Document details not found."); }
      setLoading(false);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setCompCode(companies[0]?.comp_code || '');
    setBrwNo('');
    setBrwDate(new Date().toISOString().split('T')[0]);
    setStaffCode(staffList[0]?.staff_code || '');
    setOutLocation('');
    setOutStock('');
    setDetails([]);
    setRemark('');
    setSelectedProduct('');
    setInputSerial('');
    setInputPrice(0);
    setViewMode('form');
  };

  const handleSave = async () => {
      if (!compCode || !brwNo) return alert("กรุณาระบุรหัสบริษัทและเลขที่ใบเบิก");
      
      const head: BrwcaHead = {
          comp_code: compCode, brw_no: brwNo, brw_date: brwDate, staff_code: staffCode,
          outlocation_code: outLocation, outstock_code: outStock,
          remark, is_status: 'Y'
      };
      
      try {
          setLoading(true);
          await api.saveSalesCa(head, details.map((d, i) => ({...d, brw_no: brwNo, comp_code: compCode, seq: i+1})));
          alert(t('msg.save_success'));
          setViewMode('list');
          loadInitialData();
      } catch (e) { alert(t('msg.save_fail')); }
      finally { setLoading(false); }
  };

  const addItem = () => {
      if (!selectedProduct) return;
      const p = products.find(x => x.product_code === selectedProduct);
      setDetails([...details, {
          id: `n-${Date.now()}`,
          comp_code: compCode, brw_no: brwNo, seq: details.length + 1,
          product_code: selectedProduct, product_name: p?.product_name,
          serialno: inputSerial, price: inputPrice, total_amount: inputPrice,
          cost_percent: 0, cost_amount: 0
      }]);
      setInputSerial('');
  };

  useEffect(() => {
      if (selectedProduct) {
          const p = products.find(x => x.product_code === selectedProduct);
          if(p) setInputPrice(p.std_price || 0);
      }
  }, [selectedProduct]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return historyDocs.filter(h => 
      (h.brw_no || '').toLowerCase().includes(term) || 
      (h.remark || '').toLowerCase().includes(term) ||
      (h.comp_code || '').toLowerCase().includes(term)
    );
  }, [historyDocs, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (viewMode === 'list') {
    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in text-[11px] font-sans overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-800 text-white rounded-lg shadow-md"><ArrowUpFromLine size={20} /></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">การเบิก/ขายทรัพย์สินก่อสร้าง</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1">Construction Asset Sales Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" placeholder="ค้นหาเลขที่ใบเบิก หรือ หมายเหตุ..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                        <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
                    </div>
                    <button onClick={loadInitialData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-all shadow-sm active:scale-95"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
                    <Button onClick={handleAddNew} size="sm" className="bg-orange-800 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider"><Plus size={14} /> สร้างใบเบิกใหม่</Button>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                                <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-center">วันที่เบิก</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 w-40">เลขที่ใบเบิก</th>
                                <th className="py-2.5 px-4 border-b border-slate-200">สังกัดบริษัท / หมายเหตุ</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-center">สถานะ</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && historyDocs.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Records...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลการเบิกทรัพย์สิน</td></tr>
                            ) : (
                                currentItems.map(h => (
                                    <tr key={`${h.comp_code}-${h.brw_no}`} className="group hover:bg-orange-50/30 transition-all duration-150 cursor-pointer" onClick={() => handleEdit(h)}>
                                        <td className="py-2 px-4 text-center align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{new Date(h.brw_date).toLocaleDateString('th-TH')}</span>
                                                <span className="text-[9px] text-slate-400 font-mono italic">#{h.staff_code}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 font-mono font-black text-orange-700 align-middle"><div className="bg-orange-50 border border-orange-100 px-2 py-0.5 rounded text-center shadow-sm">{h.brw_no}</div></td>
                                        <td className="py-2 px-4 align-middle">
                                            <div className="font-bold text-slate-800 uppercase leading-none mb-1 text-[11px]">{h.comp_code}</div>
                                            <div className="text-[9px] text-slate-400 font-bold truncate flex items-center gap-1">
                                                <MapPin size={10} className="text-slate-300"/> {h.remark || '-'}
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 text-center align-middle">
                                            <Badge type={h.is_status === 'Y' ? 'success' : 'neutral'}>{h.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                                        </td>
                                        <td className="py-2 px-4 text-center align-middle">
                                            <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(h); }} className="p-2 text-orange-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-orange-100"><Edit size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalItems={filteredItems.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300 text-[11px] font-sans">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3">
           <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-orange-600"><ArrowLeft size={20}/></button>
           <div className="p-3 rounded-xl bg-orange-800 text-white shadow-lg"><ArrowUpFromLine size={22} /></div>
           <div>
               <h1 className="text-sm font-black text-slate-800 leading-none">{isEditMode ? 'แก้ไขใบเบิกทรัพย์สิน' : 'ลงบันทึกการเบิก/ขายทรัพย์สินใหม่'}</h1>
               <p className="text-slate-400 text-[9px] font-bold uppercase mt-1 tracking-widest">Transaction Mode: brwca_head (CA Sales)</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" onClick={() => setViewMode('list')} className="px-4"><ArrowLeft size={14} /> กลับหน้ารายการ</Button>
           <Button onClick={handleSave} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white px-8 font-black shadow-lg" disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} บันทึกเอกสาร
           </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card title="ข้อมูลพื้นฐานการเบิก" className="lg:col-span-8 shadow-sm border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="md:col-span-2">
                    <SearchableSelect label={t('rec.company')} options={companies.map(c => ({ value: c.comp_code, label: c.comp_name }))} value={compCode} onChange={setCompCode} disabled={isEditMode} />
                </div>
                <Input label="เลขที่ใบเบิก *" dbField="brw_no" value={brwNo} onChange={e => setBrwNo(e.target.value)} placeholder="CA-SL-XXXX" disabled={isEditMode} className="font-bold text-orange-700" />
                <Input label="วันที่เบิก" dbField="brw_date" type="date" value={brwDate} onChange={e => setBrwDate(e.target.value)} icon={Calendar} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
                   <SearchableSelect label="สถานที่ต้นทาง" dbField="outlocation_code" options={locations.map(l => ({ value: l.location_code, label: l.description }))} value={outLocation} onChange={setOutLocation} />
                   <SearchableSelect label="คลังต้นทาง" dbField="outstock_code" options={stocks.map(s => ({ value: s.stock_code, label: s.description }))} value={outStock} onChange={setOutStock} />
              </div>
          </Card>

          <Card title="อื่นๆ" className="lg:col-span-4 shadow-sm border-slate-100">
                <div className="space-y-4">
                    <SearchableSelect label="พนักงานเบิก" dbField="staff_code" options={staffList.map(s => ({ value: s.staff_code, label: s.staff_name }))} value={staffCode} onChange={setStaffCode} />
                    <Input label="หมายเหตุ" dbField="remark" value={remark} onChange={e => setRemark(e.target.value)} />
                </div>
          </Card>
      </div>

      <Card title="รายการทรัพย์สิน (Asset Items)" className="shadow-xl border-0 overflow-hidden p-0">
          <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-12 gap-3 items-end">
              <div className="col-span-4"><SearchableSelect label="เลือกทรัพย์สิน" options={products.map(p => ({value:p.product_code, label:`${p.product_code}: ${p.product_name}`}))} value={selectedProduct} onChange={setSelectedProduct} /></div>
              <div className="col-span-4"><Input label="Serial No" value={inputSerial} onChange={e => setInputSerial(e.target.value)} placeholder="ระบุเลขทะเบียน/S/N" /></div>
              <div className="col-span-2"><Input label="ราคาต่อหน่วย" type="number" value={inputPrice} onChange={e => setInputPrice(Number(e.target.value))} /></div>
              <div className="col-span-2"><Button onClick={addItem} className="w-full bg-orange-800 text-white font-bold h-[38px]"><Plus size={16}/> เพิ่มรายการ</Button></div>
          </div>
          <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-800 text-white font-bold uppercase sticky top-0 z-10">
                      <tr><th className="p-3 w-12 text-center">#</th><th className="p-3">สินค้า (Asset Info)</th><th className="p-3">Serial No</th><th className="p-3 text-right">รวมเงิน</th><th className="p-3 text-center">จัดการ</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {details.map((d, i) => (
                          <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 text-center text-slate-400 font-mono">{i+1}</td>
                              <td className="p-3"><div className="font-bold text-slate-700 flex items-center gap-2"><Barcode size={12} className="text-orange-500"/> {d.product_code}</div><div className="text-[10px] text-slate-400 font-medium uppercase">{d.product_name}</div></td>
                              <td className="p-3 font-mono font-bold text-slate-600">{d.serialno || '-'}</td>
                              <td className="p-3 text-right font-black text-orange-700 text-sm">{(d.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              <td className="p-3 text-center"><button onClick={() => setDetails(details.filter(x => x.id !== d.id))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16}/></button></td>
                          </tr>
                      ))}
                      {details.length === 0 && <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ยังไม่มีรายการทรัพย์สินในใบเบิกนี้</td></tr>}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  );
};
