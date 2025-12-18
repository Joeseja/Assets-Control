import React, { useState, useEffect, useMemo } from 'react';
// Fixed: Removed non-existent 'Select' from imports as it is not used in this file
import { Card, Button, Input, Pagination } from '../components/ui';
import { api } from '../services/apiService';
import { CompanyItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Edit, Trash2, Plus, Save, X, Building2, Search, RefreshCw, 
  Globe, ShieldCheck, Mail, Phone, Hash
} from 'lucide-react';

export const MasterCompany = () => {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const initialForm: CompanyItem = {
    comp_code: '', comp_name: '', is_status: 'Y', update_id: 'SYSTEM'
  };

  const [formData, setFormData] = useState<CompanyItem>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getMasterCompanies();
      setCompanies(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (e) { 
      console.error(e);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comp: CompanyItem) => {
    setFormData(comp);
    setEditMode('update');
    setIsEditing(true);
  };

  const handleCreate = () => {
    setFormData(initialForm);
    setEditMode('create');
    setIsEditing(true);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(t('msg.confirm_delete'))) return;
    try {
      await api.deleteCompany(code);
      loadData();
    } catch (e) { alert(t('msg.delete_fail')); }
  };

  const handleSave = async () => {
    if (!formData.comp_code || !formData.comp_name) {
      alert(t('msg.required_fields'));
      return;
    }
    setLoading(true);
    try {
      await api.saveCompany(formData);
      setIsEditing(false);
      loadData();
    } catch (e: any) { alert(t('msg.save_fail')); }
    setLoading(false);
  };

  const filteredCompanies = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return companies.filter(c => 
      (c.comp_code?.toLowerCase() || '').includes(term) || 
      (c.comp_name?.toLowerCase() || '').includes(term)
    );
  }, [companies, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  if (isEditing) {
      return (
          <div className="space-y-4 animate-in fade-in duration-300 pb-20">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-800 text-white rounded-xl shadow-lg"><Building2 size={24}/></div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">{editMode === 'create' ? t('btn.add') : 'แก้ไขข้อมูลบริษัท'}</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master File Maintenance</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={loading} className="rounded-xl px-6 font-bold"><X size={16}/> {t('btn.cancel')}</Button>
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-black shadow-lg" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>} {t('btn.save')}
                    </Button>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card title="ข้อมูลพื้นฐานเอกลักษณ์บริษัท" className="border-0 shadow-xl ring-1 ring-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <Input label="รหัสบริษัท *" dbField="comp_code" value={formData.comp_code} onChange={e => setFormData({...formData, comp_code: e.target.value})} disabled={editMode === 'update'} className={editMode==='update' ? 'bg-slate-50 font-black' : 'font-black'} />
                            <Input label="รหัส CMS" dbField="cms_id" value={formData.cms_id || ''} onChange={e => setFormData({...formData, cms_id: e.target.value})} />
                            <div className="md:col-span-2"><Input label="ชื่อบริษัท (ภาษาไทย) *" value={formData.comp_name} onChange={e => setFormData({...formData, comp_name: e.target.value})} className="font-bold" /></div>
                            <div className="md:col-span-2"><Input label="ชื่อบริษัท (English)" value={formData.comp_namee || ''} onChange={e => setFormData({...formData, comp_namee: e.target.value})} /></div>
                        </div>
                    </Card>
                    <Card title="สถานที่ตั้งและการติดต่อ" className="border-0 shadow-xl ring-1 ring-slate-100">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe size={12} className="text-primary-500"/> ที่อยู่ไทย</label>
                                    <textarea className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-primary-500/10 outline-none" value={formData.address1 || ''} onChange={e => setFormData({...formData, address1: e.target.value})} placeholder="ที่อยู่..."></textarea>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe size={12} className="text-primary-500"/> English Address</label>
                                    <textarea className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-primary-500/10 outline-none" value={formData.addresse1 || ''} onChange={e => setFormData({...formData, addresse1: e.target.value})} placeholder="Address..."></textarea>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                                <Input label="โทรศัพท์" icon={Phone} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <Input label="โทรสาร (Fax)" icon={Phone} value={formData.fax || ''} onChange={e => setFormData({...formData, fax: e.target.value})} />
                                <Input label="อีเมล (Email)" icon={Mail} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <Card title="สถานะ" className="border-0 shadow-xl ring-1 ring-slate-100">
                        <label className={`group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all ${formData.is_status === 'Y' ? 'bg-primary-50/20 border-primary-100' : ''}`}>
                            <span className={`text-[11px] font-black uppercase tracking-wider ${formData.is_status === 'Y' ? 'text-primary-700' : 'text-slate-500'}`}>สถานะใช้งาน (Active)</span>
                            <div className="relative inline-flex items-center">
                                <input type="checkbox" className="sr-only peer" checked={formData.is_status === 'Y'} onChange={(e) => setFormData({...formData, is_status: e.target.checked ? 'Y' : 'N'})} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                        </label>
                    </Card>
                </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row justify-between items-center shrink-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-800 text-white rounded-2xl shadow-lg"><Building2 size={24} /></div>
              <div>
                  <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('menu.master_company')}</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Management Console</p>
              </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                  <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10" placeholder="ค้นหารหัส หรือ ชื่อบริษัท..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors"/>
              </div>
              <Button onClick={handleCreate} className="bg-primary-800 text-white rounded-xl py-2.5 px-6 font-black shadow-lg"><Plus size={18} /> {t('btn.add')}</Button>
          </div>
       </div>

       <Card className="flex-1 flex flex-col overflow-hidden p-0 border-0 shadow-xl rounded-2xl bg-white ring-1 ring-slate-100">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-xs text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10">
                       <tr className="bg-slate-100 text-slate-700 uppercase font-bold shadow-sm">
                           <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] w-24">Code</th>
                           <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px]">Company Name</th>
                           <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] hidden md:table-cell w-48">Tax & CMS ID</th>
                           <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] text-center w-24">Status</th>
                           <th className="py-2 px-3 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] text-center w-32">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading ? (
                           <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={40}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Data...</span></td></tr>
                       ) : currentItems.map((comp) => (
                           <tr key={comp.comp_code} className="group hover:bg-primary-50/30 transition-all duration-150">
                               <td className="py-1 px-3 align-middle font-mono font-bold text-primary-700"><div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{comp.comp_code}</div></td>
                               <td className="py-1 px-3 align-middle"><div className="font-bold text-slate-800">{comp.comp_name}</div></td>
                               <td className="py-1 px-3 align-middle hidden md:table-cell"><div className="flex flex-col gap-0.5"><span className="text-[10px] font-bold text-slate-500">TAX: {comp.tax_id || '-'}</span></div></td>
                               <td className="py-1 px-3 align-middle text-center">{comp.is_status === 'Y' ? <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span> : <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>}</td>
                               <td className="py-1 px-3 align-middle text-center">
                                   <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                       <button onClick={() => handleEdit(comp)} className="p-1 text-primary-600 hover:bg-primary-50 rounded" title="Edit"><Edit size={14}/></button>
                                       <button onClick={() => handleDelete(comp.comp_code)} className="p-1 text-rose-600 hover:bg-rose-50 rounded" title="Delete"><Trash2 size={14}/></button>
                                   </div>
                               </td>
                           </tr>
                       ))}
                       {!loading && currentItems.length === 0 && <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">No records found</td></tr>}
                   </tbody>
               </table>
           </div>
           <Pagination currentPage={currentPage} totalItems={filteredCompanies.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
       </Card>
    </div>
  );
};