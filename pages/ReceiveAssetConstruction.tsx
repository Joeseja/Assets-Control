
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SearchableSelect, Badge } from '../components/ui';
import { ReceiveCaHead, ReceiveCaDetail, CompanyItem, StaffItem, LocationItem, StockItem, Product } from '../types';
import { api } from '../services/apiService'; 
import { Plus, Trash2, Save, FilePlus, Search, HardHat, Barcode } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ReceiveAssetConstruction = () => {
  const { t } = useLanguage();
  const [compCode, setCompCode] = useState(''); 
  const [receiveNo, setReceiveNo] = useState('AUTO'); 
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]); 
  const [staffCode, setStaffCode] = useState(''); 
  const [remark, setRemark] = useState(''); 
  
  const [details, setDetails] = useState<ReceiveCaDetail[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Masters
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [historyDocs, setHistoryDocs] = useState<ReceiveCaHead[]>([]);

  // Input Row
  const [selectedProduct, setSelectedProduct] = useState('');
  const [inputSerial, setInputSerial] = useState('');
  const [inputPrice, setInputPrice] = useState(0);

  useEffect(() => {
    const init = async () => {
      setCompanies(await api.getCompanies() || []);
      setStaffList(await api.getStaff() || []);
      setProducts(await api.getProducts() || []);
      setHistoryDocs(await api.getReceiveCaHeaders() || []);
    };
    init();
  }, []);

  useEffect(() => {
      if (companies.length > 0 && !compCode) setCompCode(companies[0].comp_code);
      if (staffList.length > 0 && !staffCode) setStaffCode(staffList[0].staff_code);
  }, [companies, staffList]);

  useEffect(() => {
      if (selectedProduct) {
          const p = products.find(x => x.product_code === selectedProduct);
          if(p) setInputPrice(p.std_price || 0);
      }
  }, [selectedProduct]);

  const handleRetrieve = async (no: string) => {
      if (!compCode || !no) return;
      try {
          const headers = await api.getReceiveCaHeaders();
          const head = headers.find(h => h.receive_no === no); // Simplified for demo
          if (head) {
              setReceiveNo(head.receive_no);
              setReceiveDate(head.receive_date.split('T')[0]);
              setStaffCode(head.staff_code);
              setRemark(head.remark || '');
              const dtls = await api.getReceiveCaDetails(head.receive_no, head.comp_code);
              setDetails(dtls.map((d, i) => ({ ...d, id: `exist-${i}` })));
              setIsEditMode(true);
          } else { alert(t('msg.no_data')); }
      } catch (e) { alert("Retrieve Error"); }
  };

  const handleAddItem = () => {
      if (!selectedProduct) return;
      const p = products.find(x => x.product_code === selectedProduct);
      setDetails([...details, {
          id: `new-${Date.now()}`,
          comp_code: compCode,
          receive_no: receiveNo,
          seq: details.length + 1,
          product_code: selectedProduct,
          product_name: p?.product_name,
          serialno: inputSerial,
          total_amount: inputPrice,
          price: inputPrice
      }]);
      setInputSerial(''); // Clear serial only, keep product for bulk add
  };

  const handleRemove = (id: string) => {
      setDetails(details.filter(d => d.id !== id).map((d, i) => ({...d, seq: i+1})));
  };

  const handleSave = async () => {
      if (!compCode) return alert("Select Company");
      
      let finalNo = receiveNo;
      if (!isEditMode || receiveNo === 'AUTO') {
          finalNo = await api.getNextReceiveCaNo(compCode, receiveDate);
      }

      const head: ReceiveCaHead = {
          comp_code: compCode, receive_no: finalNo, receive_date: receiveDate, staff_code: staffCode,
          remark, is_status: 'ACTIVE'
      };
      
      try {
          await api.saveReceiveCa(head, details.map(d => ({...d, receive_no: finalNo, comp_code: compCode})));
          alert("Saved Successfully: " + finalNo);
          setReceiveNo(finalNo);
          setIsEditMode(true);
          setHistoryDocs(await api.getReceiveCaHeaders() || []);
      } catch(e) { alert("Save Failed"); }
  };

  const handleNew = () => {
      setIsEditMode(false);
      setReceiveNo('AUTO');
      setDetails([]);
      setRemark('');
      setInputSerial('');
  };

  return (
    <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-orange-50 text-orange-800"><HardHat size={28} /></div>
                <div><h1 className="text-2xl font-bold text-primary-900">{t('rec.title_ca')}</h1><p className="text-slate-500 text-sm">Asset Receiving (Construction)</p></div>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={handleNew}><FilePlus size={18}/> {t('btn.clear')}</Button>
                <Button onClick={handleSave}><Save size={18}/> {t('btn.save')}</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-12" title="Header Info">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <SearchableSelect label={t('rec.company')} options={companies.map(c => ({value:c.comp_code, label:c.comp_name}))} value={compCode} onChange={setCompCode} disabled={isEditMode} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1"><Input label={t('rec.receive_no')} value={receiveNo} onChange={e => setReceiveNo(e.target.value)} disabled={isEditMode} /></div>
                        <button onClick={() => handleRetrieve(receiveNo)} className="bg-primary-100 text-primary-700 p-2.5 rounded-lg mb-0.5"><Search size={18}/></button>
                    </div>
                    <Input label={t('rec.date')} type="date" value={receiveDate} onChange={e => setReceiveDate(e.target.value)} />
                    <div className="md:col-span-2">
                        <SearchableSelect label={t('rec.staff')} options={staffList.map(s => ({value:s.staff_code, label:s.staff_name}))} value={staffCode} onChange={setStaffCode} />
                    </div>
                    <div className="md:col-span-2">
                        <Input label={t('rec.remark')} value={remark} onChange={e => setRemark(e.target.value)} />
                    </div>
                </div>
            </Card>

            <Card className="lg:col-span-12" title="Items">
                <div className="bg-orange-50 p-4 rounded mb-4 grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4"><SearchableSelect label="Product" options={products.map(p => ({value:p.product_code, label:`${p.product_code}: ${p.product_name}`}))} value={selectedProduct} onChange={setSelectedProduct} /></div>
                    <div className="col-span-3"><Input label="Serial No" value={inputSerial} onChange={e => setInputSerial(e.target.value)} placeholder="S/N..." /></div>
                    <div className="col-span-2"><Input label="Price" type="number" value={inputPrice} onChange={e => setInputPrice(Number(e.target.value))} /></div>
                    <div className="col-span-2"><Button onClick={handleAddItem} className="w-full bg-orange-600 text-white"><Plus size={16}/> Add</Button></div>
                </div>
                <div className="overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 font-bold"><tr><th className="p-3">Seq</th><th className="p-3">Product</th><th className="p-3">Serial No</th><th className="p-3 text-right">Price</th><th className="p-3 text-center">Action</th></tr></thead>
                        <tbody>
                            {details.map((d, i) => (
                                <tr key={d.id || i} className="border-b hover:bg-slate-50">
                                    <td className="p-3">{i+1}</td>
                                    <td className="p-3"><div>{d.product_code}</div><div className="text-xs text-slate-500">{d.product_name}</div></td>
                                    <td className="p-3 flex items-center gap-2"><Barcode size={14} className="text-slate-400"/> {d.serialno || '-'}</td>
                                    <td className="p-3 text-right">{(d.total_amount||0).toLocaleString()}</td>
                                    <td className="p-3 text-center"><button onClick={() => handleRemove(d.id!)} className="text-rose-500"><Trash2 size={16}/></button></td>
                                </tr>
                            ))}
                            {details.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic">No Items</td></tr>}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    </div>
  );
};
