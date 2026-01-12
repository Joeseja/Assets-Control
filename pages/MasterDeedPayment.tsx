
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination, Badge, SearchableSelect } from '../components/ui';
import { api } from '../services/apiService';
import { MsDeedPayment, MsDeedUtility } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Edit, Plus, Save, X, Search, RefreshCw, Trash2, 
  ShieldCheck, CheckCircle, AlertTriangle, ListTree, Activity, Coins, Calendar, ArrowRight, Tag
} from 'lucide-react';

export const MasterDeedPayment = () => {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<MsDeedPayment[]>([]);
  const [utilities, setUtilities] = useState<MsDeedUtility[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedUtility, setSelectedUtility] = useState<string>('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const initialForm: MsDeedPayment = { 
    year_no: new Date().getFullYear(),
    utility_code: '',
    seq: 1,
    begin_date: `${new Date().getFullYear()}-01-01`,
    end_date: `${new Date().getFullYear()}-12-31`,
    sland_amount: 0,
    eland_amount: 0,
    tax_rate_percent: 0,
    tax_paid_amount: 0,
    is_status: 'Y'
  };
  
  const [formData, setFormData] = useState<MsDeedPayment>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const utils = await api.getDeedUtilities();
      setUtilities(Array.isArray(utils) ? utils : []);
      if (utils.length > 0) {
          const firstUtil = utils[0].utility_code;
          setSelectedUtility(firstUtil);
          loadPayments(selectedYear, firstUtil);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadPayments = async (year: number, utility: string) => {
    setLoading(true);
    try {
      const data = await api.getDeedPayments(year, utility);
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) { 
        setPayments([]); 
    }
    setLoading(false);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleEdit = (p: MsDeedPayment) => {
    setFormData({ ...initialForm, ...p });
    setEditMode('update');
    setIsEditing(true);
  };

  const handleDelete = async (p: MsDeedPayment) => {
    if (!confirm(`⚠️ ยืนยันการลบอัตราภาษีลำดับที่: ${p.seq}?`)) return;
    setLoading(true);
    try {
        await api.deleteDeedPayment(p.year_no, p.utility_code, p.seq);
        showStatus('success', 'ลบข้อมูลสำเร็จ');
        loadPayments(selectedYear, selectedUtility);
    } catch (e: any) { 
        showStatus('error', 'ลบไม่สำเร็จ: ' + e.message); 
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.utility_code || !formData.year_no || !formData.seq) {
        return showStatus('error', 'กรุณาระบุข้อมูลที่จำเป็นให้ครบถ้วน');
    }
    setLoading(true);
    try {
      await api.saveDeedPayment(formData);
      setIsEditing(false);
      loadPayments(selectedYear, selectedUtility);
      showStatus('success', 'บันทึกข้อมูลเรียบร้อย');
    } catch (e: any) { 
        showStatus('error', 'บันทึกไม่สำเร็จ: ' + e.message); 
    }
    setLoading(false);
  };

  // Helper to calculate Tax Amount automatically if needed
  useEffect(() => {
    if (formData.eland_amount && formData.tax_rate_percent) {
        // Example simple logic for UI suggestion (can be manual override)
        // const suggested = (formData.eland_amount * formData.tax_rate_percent) / 100;
        // setFormData(p => ({...p, tax_paid_amount: suggested}));
    }
  }, [formData.eland_amount, formData.tax_rate_percent]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return payments.filter(p => 
        p.seq.toString().includes(term) || 
        p.utility_code.toLowerCase().includes(term)
    );
  }, [payments, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (isEditing) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300 pb-20 text-[11px] h-full overflow-y-auto custom-scrollbar font-sans">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-800 text-white rounded-xl shadow-lg"><Coins size={20}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none uppercase">
                            {editMode === 'create' ? 'เพิ่มระดับอัตราภาษี' : 'แก้ไขระดับอัตราภาษี'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-1">
                           <ShieldCheck size={10} className="text-emerald-500"/> MS_DEED_PAYMENT: TAX TIERS
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} className="px-5 text-[10px] border-slate-200"><X size={14}/> ยกเลิก</Button>
                    <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-black shadow-lg text-[10px]" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} บันทึกข้อมูล
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card title="ข้อมูลหลักอัตราภาษี" className="lg:col-span-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                            <Input label="ปีภาษี (Year) *" type="number" dbField="year_no" value={formData.year_no} onChange={e => setFormData({...formData, year_no: parseInt(e.target.value)})} disabled={editMode==='update'} className="font-black text-indigo-700 text-center" />
                        </div>
                        <div className="md:col-span-6">
                            <SearchableSelect 
                                label="ลักษณะการทำประโยชน์ *" 
                                dbField="utility_code"
                                options={utilities.map(u => ({value: u.utility_code, label: `${u.utility_code}: ${u.description}`}))}
                                value={formData.utility_code}
                                onChange={v => setFormData({...formData, utility_code: v})}
                                disabled={editMode==='update'}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input label="ลำดับที่ (Seq) *" type="number" dbField="seq" value={formData.seq} onChange={e => setFormData({...formData, seq: parseInt(e.target.value)})} disabled={editMode==='update'} className="font-black text-center" />
                        </div>

                        <div className="md:col-span-6">
                            <Input label="วันที่เริ่มมีผล" type="date" dbField="begin_date" value={formData.begin_date?.split('T')[0]} onChange={e => setFormData({...formData, begin_date: e.target.value})} icon={Calendar} />
                        </div>
                        <div className="md:col-span-6">
                            <Input label="วันที่สิ้นสุด" type="date" dbField="end_date" value={formData.end_date?.split('T')[0]} onChange={e => setFormData({...formData, end_date: e.target.value})} icon={Calendar} />
                        </div>

                        <div className="md:col-span-6">
                            <Input label="มูลค่าเริ่มต้น (>=)" type="number" dbField="sland_amount" value={formData.sland_amount} onChange={e => setFormData({...formData, sland_amount: parseFloat(e.target.value)})} className="font-bold text-emerald-600" />
                        </div>
                        <div className="md:col-span-6">
                            <Input label="มูลค่าสูงสุด (<=)" type="number" dbField="eland_amount" value={formData.eland_amount} onChange={e => setFormData({...formData, eland_amount: parseFloat(e.target.value)})} className="font-bold text-rose-600" />
                        </div>

                        <div className="md:col-span-4">
                            <Input label="อัตราภาษี (%)" type="number" dbField="tax_rate_percent" value={formData.tax_rate_percent} onChange={e => setFormData({...formData, tax_rate_percent: parseFloat(e.target.value)})} step="0.01" className="font-black" />
                        </div>
                        <div className="md:col-span-4">
                            <Input label="จำนวนเงินภาษี" type="number" dbField="tax_paid_amount" value={formData.tax_paid_amount} onChange={e => setFormData({...formData, tax_paid_amount: parseFloat(e.target.value)})} className="font-black text-indigo-700" />
                        </div>
                        <div className="md:col-span-4">
                           <div className="flex flex-col space-y-1">
                             <label className="text-sm font-semibold text-slate-600 ml-1 flex justify-between">สถานะใช้งาน <span className="text-rose-400 font-mono text-[9px]">[is_status]</span></label>
                             <select className="bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 text-[11px]" value={formData.is_status} onChange={e => setFormData({...formData, is_status: e.target.value})}>
                                <option value="Y">Y - Active (ปกติ)</option>
                                <option value="N">N - Inactive (ไม่ใช้งาน)</option>
                             </select>
                           </div>
                        </div>
                    </div>
                </Card>

                <Card title="ข้อมูลการบันทึก" className="lg:col-span-4 shadow-sm">
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Technical Footprint</p>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400">RECORD ID:</span>
                                    <span className="font-bold text-slate-600">{formData.record_id || '1'}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400">LAST UPDATE:</span>
                                    <span className="font-bold text-slate-600">{formData.update_date ? new Date(formData.update_date).toLocaleDateString('th-TH') : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-3 h-full flex flex-col animate-in fade-in text-[11px] overflow-hidden font-sans">
       {statusMsg && (
            <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-right-10 ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                {statusMsg.type === 'success' ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-rose-500" />}
                <div className="max-w-md">
                    <span className="font-bold block text-xs">{statusMsg.type === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</span>
                    <span className="text-[10px]">{statusMsg.text}</span>
                </div>
                <button onClick={() => setStatusMsg(null)} className="ml-2 opacity-50 hover:opacity-100"><X size={14}/></button>
            </div>
        )}

       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 gap-3">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-800 text-white rounded-lg shadow-md"><Coins size={20} /></div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-32">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">ปีภาษี (Year)</label>
                    <input type="number" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} />
                </div>
                <div className="min-w-[250px]">
                    <SearchableSelect 
                        label="เลือกลักษณะการทำประโยชน์"
                        options={utilities.map(u => ({value: u.utility_code, label: `${u.utility_code}: ${u.description}`}))}
                        value={selectedUtility}
                        onChange={setSelectedUtility}
                    />
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto self-end">
              <button onClick={() => loadPayments(selectedYear, selectedUtility)} className="p-2 bg-indigo-800 text-white rounded-lg hover:bg-indigo-700 shadow-md active:scale-95 transition-all flex items-center gap-2 font-bold px-4"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> เรียกดูข้อมูล</button>
              <Button onClick={() => { setFormData({...initialForm, year_no: selectedYear, utility_code: selectedUtility, seq: payments.length + 1}); setEditMode('create'); setIsEditing(true); }} size="sm" className="bg-emerald-600 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider border-0 hover:bg-emerald-700"><Plus size={14} /> เพิ่มระดับใหม่</Button>
          </div>
       </div>

       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10 shadow-sm">
                       <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                           <th className="py-2.5 px-4 border-b border-slate-200 w-16 text-center">Seq</th>
                           <th className="py-2.5 px-4 border-b border-slate-200">ช่วงมูลค่าทรัพย์สิน (Amount Tier)</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-24 text-center">อัตราภาษี (%)</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-right">จำนวนภาษี</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-24 text-center">สถานะ</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && payments.length === 0 ? (
                           <tr><td colSpan={6} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Tax Table...</td></tr>
                       ) : payments.length === 0 ? (
                           <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-bold italic">กรุณาเลือก ปี และ ประเภท เพื่อแสดงข้อมูลอัตราภาษี</td></tr>
                       ) : (
                        payments.map(p => (
                           <tr key={`${p.year_no}-${p.utility_code}-${p.seq}`} className="group hover:bg-indigo-50/30 transition-all duration-150">
                               <td className="py-2 px-4 text-center align-middle font-mono font-black text-indigo-700">{p.seq}</td>
                               <td className="py-2 px-4 align-middle">
                                   <div className="flex items-center gap-3">
                                       <div className="flex flex-col text-right min-w-[120px]">
                                           <span className="text-[9px] text-slate-400 font-bold uppercase">ตั้งแต่</span>
                                           <span className="font-bold text-emerald-600">{p.sland_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                       </div>
                                       <ArrowRight size={14} className="text-slate-300" />
                                       <div className="flex flex-col text-left min-w-[120px]">
                                           <span className="text-[9px] text-slate-400 font-bold uppercase">ถึงไม่เกิน</span>
                                           <span className="font-bold text-rose-500">{p.eland_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                       </div>
                                   </div>
                               </td>
                               <td className="py-2 px-4 text-center align-middle font-mono font-black bg-slate-50 border-x border-slate-100">
                                   {p.tax_rate_percent.toFixed(2)}%
                               </td>
                               <td className="py-2 px-4 text-right align-middle font-mono font-black text-indigo-800">
                                   {p.tax_paid_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <Badge type={p.is_status === 'Y' ? 'success' : 'neutral'}>{p.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEdit(p)} className="p-2 text-indigo-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-indigo-100"><Edit size={16}/></button>
                                       <button onClick={() => handleDelete(p)} className="p-2 text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
                                   </div>
                               </td>
                           </tr>
                       )))}
                   </tbody>
               </table>
           </div>
           {payments.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-indigo-400" />
                        <span className="font-black text-slate-500 uppercase tracking-widest text-[9px]">Tax Policy {selectedYear} : {selectedUtility}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 italic">การคำนวณภาษีจะอ้างอิงตามลำดับขั้น Seq ที่กำหนดไว้นี้</div>
                </div>
           )}
       </Card>
    </div>
  );
};
