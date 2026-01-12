
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination, Badge, SearchableSelect } from '../components/ui';
import { api } from '../services/apiService';
import { MsSupplier } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Edit, Plus, Save, X, Truck, Search, RefreshCw, Trash2, 
  ShieldCheck, MapPin, Phone, Mail, Printer, Percent, 
  CheckCircle, AlertTriangle, Activity 
} from 'lucide-react';

export const MasterSupplier = () => {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<MsSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const initialForm: MsSupplier = { 
    supplier_code: '', 
    supplier_name: '', 
    address1: '', 
    address2: '',
    phone: '', 
    fax: '',
    email: '', 
    vat_percent: 7.00,
    is_vat: 'Y',
    is_status: 'Y', 
    pass_no: '', // Mapping for Tax ID
    update_id: 'ADMIN'
  };
  
  const [formData, setFormData] = useState<MsSupplier>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getMsSuppliersList();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (e) { 
        setSuppliers([]); 
    }
    setLoading(false);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleEdit = (s: MsSupplier) => {
    setFormData({ ...initialForm, ...s });
    setEditMode('update');
    setIsEditing(true);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`⚠️ ยืนยันการลบข้อมูลผู้ขาย: ${code}?`)) return;
    setLoading(true);
    try {
        await api.deleteMsSupplier(code);
        showStatus('success', 'ลบข้อมูลสำเร็จ');
        loadData();
    } catch (e: any) { 
        showStatus('error', 'ลบไม่สำเร็จ: ' + e.message); 
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.supplier_code || !formData.supplier_name) {
        return showStatus('error', 'กรุณาระบุรหัสและชื่อผู้ขาย');
    }
    setLoading(true);
    try {
      await api.saveMsSupplier(formData);
      setIsEditing(false);
      loadData();
      showStatus('success', 'บันทึกข้อมูลเรียบร้อย');
    } catch (e: any) { 
        showStatus('error', 'บันทึกไม่สำเร็จ: ' + e.message); 
    }
    setLoading(false);
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return suppliers.filter(s => 
        (s.supplier_code || '').toLowerCase().includes(term) || 
        (s.supplier_name || '').toLowerCase().includes(term) ||
        (s.phone || '').includes(term)
    );
  }, [suppliers, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (isEditing) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300 pb-20 text-[11px] h-full overflow-y-auto custom-scrollbar font-sans">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-800 text-white rounded-xl shadow-lg"><Truck size={20}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none uppercase">
                            {editMode === 'create' ? 'เพิ่มผู้ขายรายใหม่' : 'แก้ไขข้อมูลผู้ขาย'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-1">
                           <ShieldCheck size={10} className="text-primary-500"/> MS_SUPPLIER: MASTER RECORD
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
                <Card title="ข้อมูลพื้นฐานผู้ขาย" className="lg:col-span-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                            <Input label="รหัสผู้ขาย *" dbField="supplier_code" value={formData.supplier_code} onChange={e => setFormData({...formData, supplier_code: e.target.value.toUpperCase()})} disabled={editMode==='update'} className="font-black text-primary-700 uppercase" />
                        </div>
                        <div className="md:col-span-9">
                            <Input label="ชื่อบริษัท/ร้านค้า (Supplier Name) *" dbField="supplier_name" value={formData.supplier_name} onChange={e => setFormData({...formData, supplier_name: e.target.value})} className="font-bold" />
                        </div>
                        <div className="md:col-span-4">
                            <Input label="เลขประจำตัวผู้เสียภาษี (Tax ID)" dbField="pass_no" value={formData.pass_no || ''} onChange={e => setFormData({...formData, pass_no: e.target.value})} className="font-mono font-bold" />
                        </div>
                        <div className="md:col-span-4">
                           <Input label="อีเมล (E-Mail)" dbField="email" icon={Mail} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="md:col-span-4">
                           <div className="flex flex-col space-y-1">
                             <label className="text-sm font-semibold text-slate-600 ml-1 flex justify-between">สถานะใช้งาน <span className="text-rose-400 font-mono text-[9px]">[is_status]</span></label>
                             <select className="bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-primary-500/20 text-[11px]" value={formData.is_status} onChange={e => setFormData({...formData, is_status: e.target.value})}>
                                <option value="Y">Y - Active (ปกติ)</option>
                                <option value="N">N - Inactive (ระงับ)</option>
                             </select>
                           </div>
                        </div>
                    </div>
                </Card>

                <Card title="ภาษีและต้นทุน" className="lg:col-span-4 shadow-sm">
                    <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                           <div className="flex items-center justify-between mb-3">
                               <span className="font-black text-slate-600 text-[10px] uppercase">จดทะเบียนภาษีมูลค่าเพิ่ม (VAT)</span>
                               <input type="checkbox" className="w-5 h-5 accent-primary-700" checked={formData.is_vat === 'Y'} onChange={e => setFormData({...formData, is_vat: e.target.checked ? 'Y' : 'N'})} />
                           </div>
                           <Input label="อัตราภาษี (%)" dbField="vat_percent" type="number" icon={Percent} value={formData.vat_percent} onChange={e => setFormData({...formData, vat_percent: Number(e.target.value)})} disabled={formData.is_vat !== 'Y'} />
                        </div>
                    </div>
                </Card>

                <Card title="สถานที่ติดต่อและที่อยู่" className="lg:col-span-12 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Input label="ที่อยู่ 1" dbField="address1" icon={MapPin} value={formData.address1 || ''} onChange={e => setFormData({...formData, address1: e.target.value})} />
                            <Input label="ที่อยู่ 2" dbField="address2" value={formData.address2 || ''} onChange={e => setFormData({...formData, address2: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="โทรศัพท์ (Phone)" dbField="phone" icon={Phone} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            <Input label="โทรสาร (Fax)" dbField="fax" icon={Printer} value={formData.fax || ''} onChange={e => setFormData({...formData, fax: e.target.value})} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="bg-slate-900 text-white/40 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center text-[8px] font-mono uppercase tracking-[0.2em] shadow-inner gap-2 shrink-0">
                <div className="flex items-center gap-2"><Activity size={12} className="text-emerald-500" /> Database Channel: ms_supplier_master_ready</div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1">Mode: {editMode.toUpperCase()}</span>
                    <span className="flex items-center gap-1">Protocol: ERP-INTEGRATED</span>
                </div>
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
              <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Truck size={20} /></div>
              <div>
                <h1 className="text-sm font-black text-slate-800 leading-none">{t('menu.master_supplier')}</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1">Vendor Master Records</p>
              </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" placeholder="ค้นหาด้วยรหัส หรือ ชื่อผู้ขาย..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                  <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
              </div>
              <button onClick={loadData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
              <Button onClick={() => { setFormData(initialForm); setEditMode('create'); setIsEditing(true); }} size="sm" className="bg-primary-800 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider"><Plus size={14} /> เพิ่มผู้ขายใหม่</Button>
          </div>
       </div>

       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10 shadow-sm">
                       <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                           <th className="py-2.5 px-4 border-b border-slate-200 w-24 text-center">รหัส</th>
                           <th className="py-2.5 px-4 border-b border-slate-200">ชื่อผู้ขาย / บริษัท</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-32">โทรศัพท์</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-24 text-center">สถานะ</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && suppliers.length === 0 ? (
                           <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Connecting to Vendor Hub...</td></tr>
                       ) : currentItems.length === 0 ? (
                           <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลผู้ขายในระบบ</td></tr>
                       ) : (
                        currentItems.map(s => (
                           <tr key={s.supplier_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                               <td className="py-2 px-4 font-mono font-black text-primary-700 align-middle"><div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center shadow-sm uppercase">{s.supplier_code}</div></td>
                               <td className="py-2 px-4 align-middle">
                                   <div className="font-bold text-slate-800 uppercase leading-none mb-1 text-[11px]">{s.supplier_name}</div>
                                   <div className="text-[9px] text-slate-400 font-bold truncate max-w-[500px] flex items-center gap-1">
                                       <MapPin size={10} className="text-slate-300"/> {s.address1 || '-'}
                                   </div>
                               </td>
                               <td className="py-2 px-4 align-middle font-mono font-bold text-slate-600">{s.phone || '-'}</td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <Badge type={s.is_status === 'Y' ? 'success' : 'neutral'}>{s.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEdit(s)} className="p-2 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100"><Edit size={16}/></button>
                                       <button onClick={() => handleDelete(s.supplier_code)} className="p-2 text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
                                   </div>
                               </td>
                           </tr>
                       )))}
                   </tbody>
               </table>
           </div>
           <Pagination currentPage={currentPage} totalItems={filteredItems.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
       </Card>
    </div>
  );
};
