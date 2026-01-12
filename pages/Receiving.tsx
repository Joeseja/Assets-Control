
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Badge, Pagination } from '../components/ui';
import { ReceiveHead, ReceiveDetail, CompanyItem, StaffItem, LocationItem, StockItem, MsProduct } from '../types';
import { api } from '../services/apiService'; 
import { Plus, Trash2, Save, FileText, FilePlus, Search, RefreshCw, ArrowLeft, Edit, Calendar, Package, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Receiving = () => {
  const { t } = useLanguage();
  
  // -- View Mode State --
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // -- Data State --
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<MsProduct[]>([]);

  // -- Form State --
  const [compCode, setCompCode] = useState(''); 
  const [receiveNo, setReceiveNo] = useState('AUTO'); 
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]); 
  const [staffCode, setStaffCode] = useState(''); 
  const [inLocation, setInLocation] = useState('PT25'); 
  const [inStock, setInStock] = useState('STKPT25');
  const [remark, setRemark] = useState(''); 
  const [details, setDetails] = useState<ReceiveDetail[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Input Row
  const [selectedProduct, setSelectedProduct] = useState('');
  const [inputQty, setInputQty] = useState(1);
  const [inputPrice, setInputPrice] = useState(0);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
        const [h, c, s, l, p] = await Promise.all([
            api.getReceiveHeaders(),
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
    if (inLocation) api.getStocks(inLocation).then(setStocks); else setStocks([]);
  }, [inLocation]);

  const handleEdit = async (item: any) => {
      setLoading(true);
      try {
          const data = await api.getReceiveDocument(item.comp_code, item.receive_no);
          if (data) {
              const { head, details: dtls } = data;
              setCompCode(head.comp_code);
              setReceiveNo(head.receive_no);
              setReceiveDate(head.receive_date.split('T')[0]);
              setStaffCode(head.staff_code || '');
              setInLocation(head.inlocation_code || 'PT25');
              setInStock(head.instock_code || 'STKPT25');
              setRemark(head.remark || '');
              setDetails(dtls.map((d, i) => ({ ...d, id: `e-${i}` })));
              setIsEditMode(true);
              setViewMode('form');
          }
      } catch (e) { alert("Document not found."); }
      setLoading(false);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setCompCode(companies[0]?.comp_code || '');
    setReceiveNo('AUTO');
    setReceiveDate(new Date().toISOString().split('T')[0]);
    setDetails([]);
    setRemark('');
    setInLocation('PT25'); // Default value as requested
    setInStock('STKPT25');  // Default value as requested
    setViewMode('form');
  };

  const handleSave = async () => {
      if (!compCode) return alert("กรุณาระบุรหัสบริษัท");
      
      setLoading(true);
      try {
          let finalNo = receiveNo;
          // ถ้าเป็นรายการใหม่ หรือ receiveNo เป็น 'AUTO' ให้รันเลขที่เอกสารใหม่
          if (!isEditMode || receiveNo === 'AUTO') {
              const res = await api.getNextReceiveNo(receiveDate);
              if (res && res.no) {
                  finalNo = res.no;
              } else {
                  throw new Error("Cannot generate Running Number");
              }
          }

          const head: ReceiveHead = {
              comp_code: compCode, 
              receive_no: finalNo, 
              receive_date: receiveDate, 
              staff_code: staffCode,
              inlocation_code: inLocation, 
              instock_code: inStock, 
              remark, 
              is_status: 'ACTIVE'
          };

          await api.saveReceive(head, details.map(d => ({ ...d, receive_no: finalNo })));
          alert(t('msg.save_success'));
          setViewMode('list');
          loadInitialData();
      } catch (e) { 
          alert(t('msg.save_fail') + ": " + e.message); 
      } finally { 
          setLoading(false); 
      }
  };

  const addItem = () => {
      if (!selectedProduct) return;
      const p = products.find(x => x.product_code === selectedProduct);
      setDetails([...details, {
          comp_code: compCode, receive_no: receiveNo, seq: details.length + 1,
          product_code: selectedProduct, product_name: p?.product_name,
          total_qty: inputQty, price: inputPrice, total_amount: inputQty * inputPrice,
          id: `n-${Date.now()}`
      }]);
      setSelectedProduct('');
      setInputQty(1);
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return historyDocs.filter(h => 
      (h.receive_no || '').toLowerCase().includes(term) || 
      (h.comp_name || '').toLowerCase().includes(term) ||
      (h.comp_code || '').toLowerCase().includes(term)
    );
  }, [historyDocs, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  // --- RENDERING LIST VIEW ---
  if (viewMode === 'list') {
    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in text-[11px] font-sans overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-800 text-white rounded-lg shadow-md"><FileText size={20} /></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">{t('rec.title_mat')}</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1">Material Receiving Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="ค้นหาเลขที่ใบรับ หรือ บริษัท..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                        <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
                    </div>
                    <button onClick={loadInitialData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-all shadow-sm active:scale-95"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
                    <Button onClick={handleAddNew} size="sm" className="bg-emerald-800 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider"><Plus size={14} /> สร้างใบรับใหม่</Button>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                                <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-center">วันที่รับ</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 w-40">เลขที่ใบรับ</th>
                                <th className="py-2.5 px-4 border-b border-slate-200">สังกัดบริษัท</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-center">สถานะ</th>
                                <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && historyDocs.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Records...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลใบรับวัสดุอุปกรณ์</td></tr>
                            ) : (
                                currentItems.map(h => (
                                    <tr key={`${h.comp_code}-${h.receive_no}`} className="group hover:bg-emerald-50/30 transition-all duration-150 cursor-pointer" onClick={() => handleEdit(h)}>
                                        <td className="py-2 px-4 text-center align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{new Date(h.receive_date).toLocaleDateString('th-TH')}</span>
                                                <span className="text-[9px] text-slate-400 font-mono italic">#{new Date(h.receive_date).toLocaleTimeString('th-TH')}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 font-mono font-black text-primary-700 align-middle"><div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center shadow-sm">{h.receive_no}</div></td>
                                        <td className="py-2 px-4 align-middle">
                                            <div className="font-bold text-slate-800 uppercase leading-none mb-1 text-[11px]">{h.comp_name || h.comp_code}</div>
                                            <div className="text-[9px] text-slate-400 font-bold truncate flex items-center gap-1">
                                                <MapPin size={10} className="text-slate-300"/> {h.inlocation_code} / {h.instock_code}
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 text-center align-middle">
                                            <Badge type={h.is_status === 'ACTIVE' || h.is_status === 'Y' ? 'success' : 'neutral'}>{h.is_status}</Badge>
                                        </td>
                                        <td className="py-2 px-4 text-center align-middle">
                                            <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(h); }} className="p-2 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100"><Edit size={16}/></button>
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

  // --- RENDERING FORM VIEW ---
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300 text-[11px] font-sans">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3">
           <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-primary-600"><ArrowLeft size={20}/></button>
           <div className="p-3 rounded-xl bg-emerald-800 text-white shadow-lg"><FileText size={22} /></div>
           <div>
               <h1 className="text-sm font-black text-slate-800 leading-none">{isEditMode ? 'แก้ไขใบรับวัสดุอุปกรณ์' : 'ลงบันทึกการรับวัสดุอุปกรณ์ใหม่'}</h1>
               <p className="text-slate-400 text-[9px] font-bold uppercase mt-1 tracking-widest">Transaction Mode: ms_receive_head</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" onClick={() => setViewMode('list')} className="px-4"><ArrowLeft size={14} /> กลับหน้ารายการ</Button>
           <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-black shadow-lg" disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} บันทึกเอกสาร
           </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card title={t('rec.info')} className="lg:col-span-8 shadow-sm border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="md:col-span-2">
                    <SearchableSelect label={t('rec.company')} options={companies.map(c => ({ value: c.comp_code, label: c.comp_name }))} value={compCode} onChange={setCompCode} disabled={isEditMode} />
                </div>
                <Input label={t('rec.receive_no')} dbField="receive_no" value={receiveNo} onChange={e => setReceiveNo(e.target.value)} placeholder="AUTO" disabled={isEditMode} className="font-bold text-primary-700" />
                <Input label={t('rec.date')} dbField="receive_date" type="date" value={receiveDate} onChange={e => setReceiveDate(e.target.value)} icon={Calendar} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
                   {/* ปิดไม่ให้แก้ไข (disabled) สำหรับสถานที่ปลายทาง และคลังปลายทาง ตามความต้องการ */}
                   <SearchableSelect label={t('rec.in_location')} dbField="inlocation_code" options={locations.map(l => ({ value: l.location_code, label: l.description }))} value={inLocation} onChange={setInLocation} disabled={true} />
                   <SearchableSelect label={t('rec.in_stock')} dbField="instock_code" options={stocks.map(s => ({ value: s.stock_code, label: s.description }))} value={inStock} onChange={setInStock} disabled={true} />
              </div>
          </Card>

          <Card title="อื่นๆ" className="lg:col-span-4 shadow-sm border-slate-100">
                <div className="space-y-4">
                    <SearchableSelect label={t('rec.staff')} dbField="staff_code" options={staffList.map(s => ({ value: s.staff_code, label: s.staff_name }))} value={staffCode} onChange={setStaffCode} />
                    <Input label={t('rec.remark')} dbField="remark" value={remark} onChange={e => setRemark(e.target.value)} />
                </div>
          </Card>
      </div>

      <Card title={t('rec.items')} className="shadow-xl border-0 overflow-hidden p-0">
          <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5"><SearchableSelect label="เลือกสินค้า" options={products.map(p => ({value:p.product_code, label:`${p.product_code}: ${p.product_name}`}))} value={selectedProduct} onChange={setSelectedProduct} /></div>
              <div className="col-span-2"><Input label="จำนวน" type="number" value={inputQty} onChange={e => setInputQty(Number(e.target.value))} /></div>
              <div className="col-span-3"><Input label="ราคาต่อหน่วย" type="number" value={inputPrice} onChange={e => setInputPrice(Number(e.target.value))} /></div>
              <div className="col-span-2"><Button onClick={addItem} className="w-full bg-emerald-800 text-white font-bold h-[38px]"><Plus size={16}/> เพิ่มรายการ</Button></div>
          </div>
          <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-800 text-white font-bold uppercase sticky top-0 z-10">
                      <tr><th className="p-3 w-12 text-center">#</th><th className="p-3">สินค้า (Product Info)</th><th className="p-3 text-right">จำนวน</th><th className="p-3 text-right">ราคาต่อหน่วย</th><th className="p-3 text-right">รวมเงิน</th><th className="p-3 text-center">จัดการ</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {details.map((d, i) => (
                          <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 text-center text-slate-400 font-mono">{i+1}</td>
                              <td className="p-3"><div className="font-bold text-slate-700 flex items-center gap-2"><Package size={12} className="text-emerald-500"/> {d.product_code}</div><div className="text-[10px] text-slate-400 font-medium uppercase">{d.product_name}</div></td>
                              <td className="p-3 text-right font-black text-slate-700 text-sm">{d.total_qty.toLocaleString()}</td>
                              <td className="p-3 text-right font-bold text-slate-500">{d.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              <td className="p-3 text-right font-black text-emerald-700 text-sm">{(d.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              <td className="p-3 text-center"><button onClick={() => setDetails(details.filter(x => x.id !== d.id))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16}/></button></td>
                          </tr>
                      ))}
                      {details.length === 0 && <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-bold italic">ยังไม่มีรายการสินค้าในใบรับนี้</td></tr>}
                  </tbody>
                  {details.length > 0 && (
                      <tfoot className="bg-slate-50 font-black border-t border-slate-200">
                          <tr>
                              <td colSpan={4} className="p-3 text-right text-slate-500 uppercase tracking-widest">Grand Total:</td>
                              <td className="p-3 text-right text-base text-primary-800">{details.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              <td></td>
                          </tr>
                      </tfoot>
                  )}
              </table>
          </div>
      </Card>
    </div>
  );
};
