
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup } from '../types';
import { Edit, Plus, Save, X, Layers, Search, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProductGroup = () => {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<MasterGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 12;

  const initialForm: MasterGroup = {
    product_group_code: '',
    description: '',
    is_status: 'Y'
  };
  
  const [formData, setFormData] = useState<MasterGroup>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getMasterGroups();
      setGroups(Array.isArray(data) ? data : []);
      setCurrentPage(1); 
    } catch (e) { 
      console.error("MasterProductGroup Load Error:", e);
      setGroups([]); 
    }
    setLoading(false);
  };

  const handleEdit = (group: MasterGroup) => {
    setFormData({ ...initialForm, ...group });
    setEditMode('update');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.product_group_code || !formData.description) {
      return alert(t('msg.required_fields'));
    }
    
    setLoading(true);
    try {
      await api.saveMasterGroup(formData);
      setIsEditing(false); 
      loadData(); 
      alert(t('msg.save_success'));
    } catch (e: any) { 
      alert(t('msg.save_fail') + ": " + (e.message || "Unknown Server Error")); 
    }
    setLoading(false);
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return groups.filter(g => 
      (g.product_group_code || '').toLowerCase().includes(term) || 
      (g.description || '').toLowerCase().includes(term)
    );
  }, [groups, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (isEditing) {
    return (
        <div className="space-y-3 animate-in fade-in duration-300 pb-20 text-xs font-sans h-full overflow-y-auto">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Layers size={18}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">
                            {editMode === 'create' ? 'เพิ่มข้อมูลกลุ่มสินค้าใหม่' : 'แก้ไขข้อมูลกลุ่มสินค้า'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Product Group Master (ms_product_group)</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} className="px-4 py-1.5 border-slate-200 text-xs"><X size={14}/> {t('btn.cancel')}</Button>
                    <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-1.5 font-black text-xs shadow-sm" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} {t('btn.save')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Card title="รายละเอียดกลุ่มสินค้า" className="shadow-sm border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-3">
                            <Input 
                                label="รหัสกลุ่มสินค้า *" dbField="product_group_code"
                                value={formData.product_group_code} 
                                onChange={e => setFormData({...formData, product_group_code: e.target.value.toUpperCase()})} 
                                disabled={editMode === 'update'} 
                                className={`font-black text-center text-xs ${editMode === 'update' ? 'bg-slate-50 text-indigo-700' : 'bg-white'}`}
                            />
                        </div>
                        <div className="md:col-span-9">
                            <Input 
                                label="ชื่อกลุ่มสินค้า (Description) *" dbField="description"
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                className="font-bold text-xs"
                            />
                        </div>

                        <div className="md:col-span-12 pt-4 border-t border-slate-50">
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${formData.is_status === 'Y' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <div className={`bg-white w-3 h-3 rounded-full transition-transform ${formData.is_status === 'Y' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={formData.is_status === 'Y'} 
                                    onChange={e => setFormData({...formData, is_status: e.target.checked ? 'Y' : 'N'})} 
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-700 text-[11px]">เปิดใช้งานกลุ่มสินค้า (Active Status)</span>
                                    <span className="text-[8px] text-rose-400 font-mono">[is_status]</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </Card>

                <div className="bg-slate-100/50 p-3 rounded-xl border border-dashed border-slate-200 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><span>Update By:</span> <span className="text-slate-600">{formData.update_id || 'ADMIN'}</span></div>
                    <div className="flex items-center gap-2 text-primary-500"><ShieldAlert size={12}/> Master Data Integrity Protection</div>
                    <div className="flex items-center gap-2"><span>Update Date:</span> <span className="text-slate-600">{formData.update_date ? new Date(formData.update_date).toLocaleString('th-TH') : '-'}</span></div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-3 h-full flex flex-col animate-in fade-in text-xs font-sans overflow-hidden">
       {/* Toolbar */}
       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 gap-3">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Layers size={18} /></div>
              <div>
                <h1 className="text-sm font-black text-slate-800 leading-none">{t('menu.master_product_group')}</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">Global Category Records</p>
              </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <input 
                    className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" 
                    placeholder="รหัส หรือ ชื่อกลุ่มสินค้า..." 
                    value={searchTerm} 
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                  />
                  <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
              </div>
              <button onClick={loadData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-all shadow-sm active:scale-95"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
              <Button onClick={() => { setFormData(initialForm); setEditMode('create'); setIsEditing(true); }} size="sm" className="bg-primary-800 text-white font-bold px-4 rounded-lg shadow-sm text-xs"><Plus size={14} /> {t('btn.add')}</Button>
          </div>
       </div>

       {/* Table Container */}
       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white ring-1 ring-slate-100 flex flex-col">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-xs text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10 shadow-sm">
                       <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                           <th className="py-2.5 px-4 border-b border-slate-200 w-32">Group Code</th>
                           <th className="py-2.5 px-4 border-b border-slate-200">Description</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">Status</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-16">Edit</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && groups.length === 0 ? (
                           <tr><td colSpan={4} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={32}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Category Data...</span></td></tr>
                       ) : currentItems.length === 0 ? (
                           <tr><td colSpan={4} className="p-32 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลกลุ่มสินค้า</td></tr>
                       ) : (
                        currentItems.map(g => (
                           <tr key={g.product_group_code} className="group hover:bg-primary-50/40 transition-all duration-150 cursor-pointer" onClick={() => handleEdit(g)}>
                               <td className="py-2 px-4 font-mono font-black text-primary-700 align-middle">
                                   <div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{g.product_group_code}</div>
                               </td>
                               <td className="py-2 px-4 align-middle">
                                   <div className="font-bold text-slate-800 text-[11px] uppercase tracking-tight">{g.description}</div>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <Badge type={g.is_status === 'Y' ? 'success' : 'neutral'}>{g.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <button onClick={(e) => { e.stopPropagation(); handleEdit(g); }} className="p-1.5 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100" title="Edit"><Edit size={14}/></button>
                               </td>
                           </tr>
                       )))}
                   </tbody>
               </table>
           </div>
           
           <Pagination 
             currentPage={currentPage} 
             totalItems={filteredItems.length} 
             itemsPerPage={itemsPerPage} 
             onPageChange={setCurrentPage} 
           />
       </Card>
    </div>
  );
};
