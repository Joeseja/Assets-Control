
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination, Badge, SearchableSelect } from '../components/ui';
import { api } from '../services/apiService';
import { CompanyItem, MsBank } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Edit, Plus, Save, X, Building2, Search, RefreshCw, Trash2, 
  ShieldCheck, CheckCircle, AlertTriangle, Phone, Mail, 
  UserCheck, ShieldAlert, Fingerprint, Globe2, MapPin, Printer,
  Lock, CreditCard, Activity
} from 'lucide-react';

export const MasterCompany = () => {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [banks, setBanks] = useState<MsBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const initialForm: CompanyItem = { 
    comp_code: '', 
    comp_name: '', 
    comp_id: '', 
    address1: '', 
    address2: '',
    comp_namee: '', 
    addresse1: '', 
    addresse2: '',
    phone: '', 
    fax: '', 
    email: '',
    tax_id: '', 
    vat_percent: 7.00, 
    is_status: 'A', 
    update_id: '1', 
    cms_id: '',
    pass_no: '', 
    branch_id: '', 
    bank_code: '', 
    account_no: '', 
    account_branch: '',
    is_security: 'N', 
    is_inout: 'N', 
    is_comp: 'N', 
    is_bg: 'N', 
    is_group: 'N',
    is_head: 'N', 
    is_type: 'N', 
    is_grouprf: 'N', 
    is_rf: 'N',
    staff1_code: '', 
    staff2_code: ''
  };
  
  const [formData, setFormData] = useState<CompanyItem>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // ปรับปรุง: ใช้การเรียก API แยกกันและจัดการ Error รายตัว
      // เพื่อป้องกันไม่ให้ความล้มเหลวของ Banks ทำให้ Companies ไม่แสดงผล
      const compPromise = api.getMasterCompanies().catch(err => {
          console.error("Failed to load companies:", err);
          return [] as CompanyItem[];
      });
      
      const bankPromise = api.getBanks().catch(err => {
          console.error("Failed to load banks:", err);
          return [] as MsBank[];
      });

      const [compData, bankData] = await Promise.all([compPromise, bankPromise]);
      
      setCompanies(Array.isArray(compData) ? compData : []);
      setBanks(Array.isArray(bankData) ? bankData : []);
    } catch (e) { 
      console.error("General Load Data Error", e);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
      setStatusMsg({ type, text });
      setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleAddNew = () => {
    setFormData(initialForm);
    setEditMode('create');
    setIsEditing(true);
  };

  const handleEdit = (comp: CompanyItem) => {
    const cleanedComp = Object.fromEntries(
        Object.entries(comp).map(([key, value]) => [
          key, 
          value === null ? (key.startsWith('is_') ? 'N' : '') : 
          (typeof value === 'string' ? value.trim() : value)
        ])
    ) as any;
    setFormData({ ...initialForm, ...cleanedComp }); 
    setEditMode('update'); 
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.comp_code || formData.comp_code.trim() === '') {
        showStatus('error', 'กรุณาระบุรหัสบริษัท (Company Code)');
        return;
    }

    if (!formData.comp_name || formData.comp_name.trim() === '') {
        showStatus('error', 'ไม่สามารถบันทึกได้: กรุณาระบุ "ชื่อบริษัท (ไทย)" เนื่องจากเป็นข้อมูลบังคับ');
        return;
    }
    
    setLoading(true);
    try {
      const payload = { 
        ...formData, 
        vat_percent: Number(formData.vat_percent) || 0,
        comp_code: String(formData.comp_code).toUpperCase().substring(0, 4),
        comp_id: String(formData.comp_id || '').toUpperCase().substring(0, 4)
      };
      
      const result = await api.saveCompany(payload);
      
      if (result && (result.status === 'success' || result.success)) {
          setIsEditing(false); 
          loadData(); 
          showStatus('success', 'บันทึกข้อมูลบริษัทสำเร็จเรียบร้อยแล้ว');
      } else {
          showStatus('error', result?.message || 'ไม่สามารถบันทึกข้อมูลบริษัทได้ โปรดตรวจสอบข้อมูลอีกครั้ง');
      }
    } catch (e: any) { 
      showStatus('error', 'บันทึกไม่สำเร็จ: ' + e.message); 
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return companies.filter(c => 
      (c.comp_code || '').toLowerCase().includes(term) || 
      (c.comp_name || '').toLowerCase().includes(term)
    );
  }, [companies, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (isEditing) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300 pb-24 text-[11px] h-full overflow-y-auto custom-scrollbar font-sans bg-slate-50/50 p-1">
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

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-800 text-white rounded-xl shadow-lg"><Building2 size={20}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none uppercase">
                            {editMode === 'create' ? 'เพิ่มข้อมูลบริษัทใหม่' : 'แก้ไขข้อมูลบริษัท'}
                        </h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-1">
                           <ShieldCheck size={10} className="text-emerald-500"/> MS_COMPANY: DATA INTEGRITY ACTIVE
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
                <Card title="ข้อมูลพื้นฐานและรหัสประจำตัว" className="lg:col-span-8 shadow-sm border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-2">
                           <Input label="รหัสบริษัท *" dbField="comp_code" value={formData.comp_code} maxLength={4} onChange={e => setFormData({...formData, comp_code: e.target.value.toUpperCase()})} disabled={editMode==='update'} className="font-black text-primary-700 text-center uppercase" />
                        </div>
                        <div className="md:col-span-2">
                           <Input label="รหัสย่อ" dbField="comp_id" value={formData.comp_id || ''} maxLength={4} onChange={e => setFormData({...formData, comp_id: e.target.value.toUpperCase()})} className="font-bold text-center uppercase" />
                        </div>
                        <div className="md:col-span-8">
                           <Input 
                             label="ชื่อบริษัท (ไทย) *" dbField="comp_name" 
                             value={formData.comp_name || ''} maxLength={70} 
                             onChange={e => setFormData({...formData, comp_name: e.target.value})} 
                             className={`font-bold ${!formData.comp_name ? 'border-rose-400 ring-rose-100 ring-2' : ''}`}
                             placeholder="กรอกชื่อบริษัท (ไทย) - ฟิลด์บังคับ" 
                           />
                        </div>
                        <div className="md:col-span-12">
                           <Input label="ชื่อบริษัท (อังกฤษ)" dbField="comp_namee" icon={Globe2} value={formData.comp_namee || ''} maxLength={70} onChange={e => setFormData({...formData, comp_namee: e.target.value})} className="uppercase" />
                        </div>
                        <div className="md:col-span-4">
                           <Input label="รหัส CMS" dbField="cms_id" icon={Fingerprint} value={formData.cms_id || ''} maxLength={15} onChange={e => setFormData({...formData, cms_id: e.target.value})} />
                        </div>
                        <div className="md:col-span-4">
                           <Input label="พาสปอร์ต / Pass No" dbField="pass_no" icon={Lock} value={formData.pass_no || ''} maxLength={10} onChange={e => setFormData({...formData, pass_no: e.target.value})} />
                        </div>
                        <div className="md:col-span-4">
                           <div className="flex flex-col space-y-1">
                             <label className="text-sm font-semibold text-slate-600 ml-1 flex justify-between">สถานะการใช้งาน <span className="text-rose-400 font-mono text-[9px]">[is_status]</span></label>
                             <select className="bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-primary-500/20 text-[11px]" value={formData.is_status} onChange={e => setFormData({...formData, is_status: e.target.value})}>
                                <option value="A">A - Active (ใช้งาน)</option>
                                <option value="N">N - Inactive (ไม่ใช้งาน)</option>
                             </select>
                           </div>
                        </div>
                    </div>
                </Card>

                <Card title="สถานะทางระบบ (Flags)" className="lg:col-span-4 shadow-sm border-slate-100">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                           { label: 'สำนักงานใหญ่', field: 'is_head' },
                           { label: 'ใช้งานงบประมาณ', field: 'is_bg' },
                           { label: 'บริษัทในกลุ่ม', field: 'is_group' },
                           { label: 'ใช้งาน RF', field: 'is_rf' },
                           { label: 'กลุ่ม RF', field: 'is_grouprf' },
                           { label: 'ระบบความปลอดภัย', field: 'is_security' },
                           { label: 'สถานะบริษัท', field: 'is_comp' },
                           { label: 'รองรับ เข้า/ออก', field: 'is_inout' },
                           { label: 'ประเภทใช้งาน', field: 'is_type' }
                        ].map((flag) => (
                           <label key={flag.field} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-primary-200 transition-colors cursor-pointer group">
                               <div className="flex flex-col">
                                   <span className="font-bold text-slate-700 leading-none">{flag.label}</span>
                                   <span className="text-[8px] text-rose-400 font-mono uppercase tracking-tighter">[{flag.field}]</span>
                               </div>
                               <input 
                                   type="checkbox" 
                                   className="w-4 h-4 accent-primary-700 rounded cursor-pointer"
                                   checked={formData[flag.field as keyof CompanyItem] === 'Y'} 
                                   onChange={e => setFormData({...formData, [flag.field]: e.target.checked ? 'Y' : 'N'})} 
                               />
                           </label>
                        ))}
                    </div>
                </Card>

                <Card title="สถานที่ติดต่อและที่อยู่" className="lg:col-span-12 shadow-sm border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                           <Input label="ที่อยู่ 1 (ไทย)" dbField="address1" icon={MapPin} value={formData.address1 || ''} maxLength={70} onChange={e => setFormData({...formData, address1: e.target.value})} />
                           <Input label="ที่อยู่ 2 (ไทย)" dbField="address2" value={formData.address2 || ''} maxLength={70} onChange={e => setFormData({...formData, address2: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                           <Input label="Address 1 (Eng)" dbField="addresse1" icon={Globe2} value={formData.addresse1 || ''} maxLength={70} onChange={e => setFormData({...formData, addresse1: e.target.value})} />
                           <Input label="Address 2 (Eng)" dbField="addresse2" value={formData.addresse2 || ''} maxLength={70} onChange={e => setFormData({...formData, addresse2: e.target.value})} />
                        </div>
                    </div>
                </Card>

                <Card title="การติดต่อสื่อสารและธนาคาร" className="lg:col-span-12 shadow-sm border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input label="โทรศัพท์" dbField="phone" icon={Phone} value={formData.phone || ''} maxLength={30} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        <Input label="แฟกซ์" dbField="fax" icon={Printer} value={formData.fax || ''} maxLength={30} onChange={e => setFormData({...formData, fax: e.target.value})} />
                        <Input label="อีเมล" dbField="email" icon={Mail} value={formData.email || ''} maxLength={30} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <Input label="Tax ID" dbField="tax_id" value={formData.tax_id || ''} maxLength={15} onChange={e => setFormData({...formData, tax_id: e.target.value})} className="font-mono" />
                        
                        <div className="md:col-span-2">
                            <SearchableSelect 
                                label="รหัสธนาคาร *"
                                dbField="bank_code"
                                options={banks.map(b => ({ value: b.bank_code, label: `${b.bank_code} : ${b.description}` }))}
                                value={formData.bank_code || ''}
                                onChange={v => setFormData({ ...formData, bank_code: v })}
                                className="font-bold"
                            />
                        </div>
                        <Input label="เลขที่บัญชี" dbField="account_no" icon={CreditCard} value={formData.account_no || ''} maxLength={10} onChange={e => setFormData({...formData, account_no: e.target.value})} />
                        <Input label="สาขาที่เปิดบัญชี" dbField="account_branch" value={formData.account_branch || ''} maxLength={6} onChange={e => setFormData({...formData, account_branch: e.target.value})} />
                    </div>
                </Card>
            </div>
            
            <div className="bg-slate-900 text-white/40 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center text-[8px] font-mono uppercase tracking-[0.2em] shadow-inner gap-2 shrink-0">
                <div className="flex items-center gap-2"><ShieldAlert size={12} className="text-rose-500" /> Security Protocol: Record Integrity Lock Active</div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1"><Activity size={10} /> Mode: {editMode.toUpperCase()}</span>
                    <span className="flex items-center gap-1 text-emerald-500/60"><CheckCircle size={10} /> SQL Server Connection: Stable</span>
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
              <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Building2 size={20} /></div>
              <div>
                <h1 className="text-sm font-black text-slate-800 leading-none">ข้อมูลบริษัทหลัก (ms_company)</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1"><ShieldCheck size={10} className="text-primary-500"/> Core Database Protected</p>
              </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" placeholder="ค้นหาบริษัท..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                  <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
              </div>
              <button onClick={loadData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
              <Button onClick={handleAddNew} size="sm" className="bg-primary-800 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider"><Plus size={14} /> เพิ่มบริษัทใหม่</Button>
          </div>
       </div>

       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10 shadow-sm">
                       <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                           <th className="py-2.5 px-4 border-b border-slate-200 w-24 text-center">รหัส (PK)</th>
                           <th className="py-2.5 px-4 border-b border-slate-200">ชื่อบริษัท</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-center">เลขผู้เสียภาษี</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-center">สถานะ</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-32">จัดการ</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && companies.length === 0 ? (
                           <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Records...</td></tr>
                       ) : currentItems.length === 0 ? (
                           <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลบริษัท</td></tr>
                       ) : (
                        currentItems.map(c => (
                           <tr key={c.comp_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                               <td className="py-2 px-4 font-mono font-black text-primary-700 align-middle"><div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center shadow-sm uppercase">{c.comp_code}</div></td>
                               <td className="py-2 px-4 align-middle">
                                   <div className="font-bold text-slate-800 uppercase leading-none mb-1 text-[11px]">{c.comp_name}</div>
                                   <div className="text-[9px] text-slate-400 font-bold truncate max-w-[500px] flex items-center gap-2">
                                       <MapPin size={10} className="text-slate-300"/> {c.address1} {c.address2}
                                   </div>
                               </td>
                               <td className="py-2 px-4 text-center align-middle font-mono font-bold text-slate-500">
                                   {c.tax_id || '-'}
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <span className={`px-3 py-0.5 rounded-full font-black text-[9px] uppercase border shadow-sm ${c.is_status === 'A' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{c.is_status === 'A' ? 'Active' : 'Inactive'}</span>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEdit(c)} className="p-2 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100"><Edit size={16}/></button>
                                       <button onClick={() => { if(window.confirm('⚠️ ยืนยันการลบข้อมูลบริษัทจากระบบ?')) api.deleteCompany(c.comp_code).then(() => loadData()) }} className="p-2 text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
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
