
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SearchableSelect, Badge } from '../components/ui';
import { ReceiveHead, ReceiveDetail, CompanyItem, StaffItem, LocationItem, StockItem, Product } from '../types';
import { api } from '../services/apiService'; 
import { Plus, Trash2, Save, FileText, FilePlus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Receiving: React.FC<{ onPreview?: (id: string) => void }> = () => {
  const { t } = useLanguage();
  
  // -- State --
  const [compCode, setCompCode] = useState(''); 
  const [receiveNo, setReceiveNo] = useState(''); 
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]); 
  const [staffCode, setStaffCode] = useState(''); 
  const [managerCode, setManagerCode] = useState('');
  const [checkerCode, setCheckerCode] = useState('');
  const [approveCode, setApproveCode] = useState(''); 
  const [outLocation, setOutLocation] = useState('');
  const [outStock, setOutStock] = useState('');
  const [inLocation, setInLocation] = useState('');
  const [inStock, setInStock] = useState('');
  const [lotNo, setLotNo] = useState(''); 
  const [remark, setRemark] = useState(''); 
  
  const [historyDocs, setHistoryDocs] = useState<ReceiveHead[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [outStocks, setOutStocks] = useState<StockItem[]>([]); 
  const [inStocks, setInStocks] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [isEditMode, setIsEditMode] = useState(false); 
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [details, setDetails] = useState<ReceiveDetail[]>([]);

  // Input Row
  const [selectedProduct, setSelectedProduct] = useState('');
  const [inputQty, setInputQty] = useState(1);
  const [inputPrice, setInputPrice] = useState(0);

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    setIsLoadingData(true);
    try {
        const [c, s, l, p, h] = await Promise.all([
            api.getCompanies(), api.getStaff(), api.getLocations(), api.getProducts(), api.getReceiveHeaders()
        ]);
        setCompanies(c || []);
        setStaffList(s || []);
        setLocations(l || []);
        setProducts(p || []);
        setHistoryDocs(h || []);
        if (c.length > 0) setCompCode(c[0].comp_code);
    } catch (e) { console.error(e); }
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (outLocation) api.getStocks(outLocation).then(setOutStocks); else setOutStocks([]);
  }, [outLocation]);

  useEffect(() => {
    if (inLocation) api.getStocks(inLocation).then(setInStocks); else setInStocks([]);
  }, [inLocation]);

  const handleRetrieve = async (no: string) => {
      if (!compCode || !no) return alert("Please specify Company and Document No.");
      setIsLoadingData(true);
      try {
          const data = await api.getReceiveDocument(compCode, no);
          if (data) {
              const { head, details: dtls } = data;
              setReceiveNo(head.receive_no);
              setReceiveDate(head.receive_date.split('T')[0]);
              setStaffCode(head.staff_code || '');
              setOutLocation(head.outlocation_code || '');
              setOutStock(head.outstock_code || '');
              setInLocation(head.inlocation_code || '');
              setInStock(head.instock_code || '');
              setLotNo(head.lot_no || '');
              setManagerCode(head.manager_code || '');
              setCheckerCode(head.checker_code || '');
              setApproveCode(head.approve_code || '');
              setRemark(head.remark || '');
              setDetails(dtls.map((d, i) => ({ ...d, id: `e-${i}` })));
              setIsEditMode(true);
          }
      } catch (e) { alert("Retrieve Error: Document may not exist."); }
      setIsLoadingData(false);
  };

  const handleSave = async () => {
      if (!compCode || !receiveNo) return alert("Required fields missing");
      const head: ReceiveHead = {
          comp_code: compCode, receive_no: receiveNo, receive_date: receiveDate, staff_code: staffCode,
          outlocation_code: outLocation, outstock_code: outStock, inlocation_code: inLocation, instock_code: inStock,
          lot_no: lotNo, manager_code: managerCode, checker_code: checkerCode, approve_code: approveCode,
          remark, is_status: 'ACTIVE'
      };
      try {
          setIsLoadingData(true);
          await api.saveReceive(head, details);
          alert(t('msg.save_success'));
          setIsEditMode(true);
          loadMasters();
      } catch (e) { alert(t('msg.save_fail')); }
      finally { setIsLoadingData(false); }
  };

  const handleNew = () => {
    setIsEditMode(false);
    setReceiveNo('');
    setDetails([]);
    setRemark('');
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
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
           <div className="p-4 rounded-2xl bg-primary-800 text-white shadow-lg"><FileText size={28} /></div>
           <div><h1 className="text-2xl font-black text-slate-800">{t('rec.title_mat')}</h1><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Document Management</p></div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" onClick={handleNew}><FilePlus size={18} /> {t('btn.clear')}</Button>
           <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700"><Save size={18} /> {t('btn.save')}</Button>
        </div>
      </div>
      
      <Card title={t('rec.info')}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="md:col-span-2">
                <SearchableSelect label={t('rec.company')} options={companies.map(c => ({ value: c.comp_code, label: c.comp_name }))} value={compCode} onChange={setCompCode} disabled={isEditMode} />
            </div>
            <div className="relative">
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">{t('rec.receive_no')}</label>
                <div className="flex gap-2">
                    <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30 font-bold" value={receiveNo} onChange={e => setReceiveNo(e.target.value)} placeholder="RC-XXXX" />
                    <button onClick={() => handleRetrieve(receiveNo)} className="bg-primary-50 text-primary-700 p-2 rounded-lg hover:bg-primary-100 transition-colors"><Search size={18}/></button>
                </div>
            </div>
            <Input label={t('rec.date')} type="date" value={receiveDate} onChange={e => setReceiveDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 border-t pt-6">
               <SearchableSelect label={t('rec.out_location')} options={locations.map(l => ({ value: l.location_code, label: l.description }))} value={outLocation} onChange={setOutLocation} />
               <SearchableSelect label={t('rec.out_stock')} options={outStocks.map(s => ({ value: s.stock_code, label: s.description }))} value={outStock} onChange={setOutStock} />
               <SearchableSelect label={t('rec.in_location')} options={locations.map(l => ({ value: l.location_code, label: l.description }))} value={inLocation} onChange={setInLocation} />
               <SearchableSelect label={t('rec.in_stock')} options={inStocks.map(s => ({ value: s.stock_code, label: s.description }))} value={inStock} onChange={setInStock} />
          </div>
      </Card>

      <Card title={t('rec.items')}>
          <div className="bg-slate-50 p-4 rounded-xl mb-4 grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5"><SearchableSelect label="Product" options={products.map(p => ({value:p.product_code, label:p.product_name}))} value={selectedProduct} onChange={setSelectedProduct} /></div>
              <div className="col-span-2"><Input label="Qty" type="number" value={inputQty} onChange={e => setInputQty(Number(e.target.value))} /></div>
              <div className="col-span-3"><Input label="Price" type="number" value={inputPrice} onChange={e => setInputPrice(Number(e.target.value))} /></div>
              <div className="col-span-2"><Button onClick={addItem} className="w-full bg-primary-800 text-white"><Plus size={18}/> Add</Button></div>
          </div>
          <table className="w-full text-xs text-left">
              <thead className="bg-slate-800 text-white font-bold uppercase">
                  <tr><th className="p-3 w-12">#</th><th className="p-3">Product</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Total</th><th className="p-3 text-center">X</th></tr>
              </thead>
              <tbody>
                  {details.map((d, i) => (
                      <tr key={d.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 text-center">{i+1}</td>
                          <td className="p-3"><b>{d.product_code}</b><br/><span className="text-slate-500">{d.product_name}</span></td>
                          <td className="p-3 text-right">{d.total_qty}</td>
                          <td className="p-3 text-right">{d.price.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold">{(d.total_amount).toLocaleString()}</td>
                          <td className="p-3 text-center"><button onClick={() => setDetails(details.filter(x => x.id !== d.id))} className="text-rose-500"><Trash2 size={16}/></button></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </Card>

      {isLoadingData && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                  <RefreshCw className="animate-spin text-primary-600 mb-4" size={40} />
                  <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Processing Request...</p>
              </div>
          </div>
      )}
    </div>
  );
};
