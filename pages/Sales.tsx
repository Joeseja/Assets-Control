
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SearchableSelect, Badge } from '../components/ui';
import { BrwcHead, BrwcDetail, CompanyItem, StaffItem, LocationItem, StockItem, Product } from '../types';
import { api } from '../services/apiService'; 
import { Plus, Trash2, Save, FilePlus, Search, ArrowUpFromLine, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Sales = () => {
  const { t } = useLanguage();

  const [compCode, setCompCode] = useState('');
  const [brwNo, setBrwNo] = useState('');
  const [brwDate, setBrwDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffCode, setStaffCode] = useState('');
  const [remark, setRemark] = useState('');
  const [outLocation, setOutLocation] = useState('');
  const [outStock, setOutStock] = useState('');
  const [inLocation, setInLocation] = useState('');
  const [inStock, setInStock] = useState('');
  
  const [details, setDetails] = useState<BrwcDetail[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Masters
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => { loadMasters(); }, []);

  const loadMasters = async () => {
      try {
          const [c, s, l, p] = await Promise.all([api.getCompanies(), api.getStaff(), api.getLocations(), api.getProducts()]);
          setCompanies(c || []); setStaffList(s || []); setLocations(l || []); setProducts(p || []);
          if (c.length > 0) setCompCode(c[0].comp_code);
      } catch (e) { console.error(e); }
  };

  const handleRetrieve = async (no: string) => {
      if (!compCode || !no) return alert("Select Company and Document No.");
      setIsLoading(true);
      try {
          const data = await api.getBrwcDocument(compCode, no);
          if (data) {
              const { head, details: dtls } = data;
              setBrwNo(head.brw_no);
              setBrwDate(head.brw_date.split('T')[0]);
              setStaffCode(head.staff_code || '');
              setOutLocation(head.outlocation_code || '');
              setOutStock(head.outstock_code || '');
              setInLocation(head.inlocation_code || '');
              setInStock(head.instock_code || '');
              setRemark(head.remark || '');
              setDetails(dtls.map((d, i) => ({ ...d, id: `e-${i}` })));
              setIsEditMode(true);
          }
      } catch (e) { alert("Document not found in Sales/BRWC records."); }
      setIsLoading(false);
  };

  const handleSave = async () => {
      if (!compCode || !brwNo) return alert("Required fields missing");
      const head: BrwcHead = {
          comp_code: compCode, brw_no: brwNo, brw_date: brwDate, staff_code: staffCode,
          outlocation_code: outLocation, outstock_code: outStock,
          remark, is_status: 'ACTIVE'
      };
      try {
          setIsLoading(true);
          await api.saveBrwc(head, details);
          alert(t('msg.save_success'));
          setIsEditMode(true);
      } catch (e) { alert(t('msg.save_fail')); }
      finally { setIsLoading.bind(false); }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3">
           <div className="p-3 rounded-lg bg-blue-50 text-blue-800"><ArrowUpFromLine size={28} /></div>
           <div><h1 className="text-2xl font-bold text-primary-900">{t('sale.title_mat')}</h1><p className="text-slate-500 text-sm">Material Sales / Withdraw</p></div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" onClick={() => { setIsEditMode(false); setBrwNo(''); setDetails([]); }}><FilePlus size={18} /> {t('btn.clear')}</Button>
           <Button onClick={handleSave}><Save size={18} /> {t('btn.save')}</Button>
        </div>
      </div>
      
      <Card title={t('rec.info')}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="md:col-span-2">
                <SearchableSelect label={t('rec.company')} options={companies.map(c => ({ value: c.comp_code, label: c.comp_name }))} value={compCode} onChange={setCompCode} disabled={isEditMode} />
            </div>
            <div className="relative">
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">{t('sale.doc_no')}</label>
                <div className="flex gap-2">
                    <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold" value={brwNo} onChange={e => setBrwNo(e.target.value)} />
                    <button onClick={() => handleRetrieve(brwNo)} className="bg-primary-100 text-primary-700 p-2 rounded-lg"><Search size={18}/></button>
                </div>
            </div>
            <Input label={t('rec.date')} type="date" value={brwDate} onChange={e => setBrwDate(e.target.value)} />
          </div>
      </Card>

      <Card title={t('rec.items')}>
          <div className="p-8 text-center text-slate-300 italic border-2 border-dashed rounded-xl font-bold uppercase tracking-widest">
              Please enter Product Code or select from Retrieve search
          </div>
      </Card>

      {isLoading && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center">
              <RefreshCw className="animate-spin text-primary-600" size={40} />
          </div>
      )}
    </div>
  );
};
