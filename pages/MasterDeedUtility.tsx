
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MsDeedUtility } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Edit, Plus, Save, X, Search, RefreshCw, Trash2, 
  ShieldCheck, CheckCircle, AlertTriangle, ListTree, Activity, Layers, Tag
} from 'lucide-react';

export const MasterDeedUtility = () => {
  const { t } = useLanguage();
  const [utilities, setUtilities] = useState<MsDeedUtility[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const initialForm: MsDeedUtility = { 
    utility_code: '', 
    description: '', 
    level_no: 1, 
    is_status: 'Y',
    update_id: 'ADMIN'
  };
  
  const [formData, setFormData] = useState<MsDeedUtility>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDeedUtilities();
      setUtilities(Array.isArray(data) ? data : []);
    } catch (e) { 
        setUtilities([]); 
    }
    setLoading(false);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleEdit = (u: MsDeedUtility) => {
    setFormData({ ...initialForm, ...u });
    setEditMode('update');
    setIsEditing(true);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`⚠️ ยืนยันการลบข้อมูลลักษณะการทำประโยชน์: ${code}?`)) return;
    setLoading(true);
    try {
        await api.deleteDeedUtility(code);
        showStatus('success', 'ลบข้อมูลสำเร็จ');
        loadData();
    } catch (e: any) { 
        showStatus('error', 'ลบไม่สำเร็จ: ' + e.message); 
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.utility_code || !formData.description) {
        return showStatus('error', 'กรุณาระบุรหัสและรายละเอียดลักษณะการทำประโยชน์');
    }
    setLoading(true);
    try {
      await api.saveDeedUtility(formData);
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
    return utilities.filter(u => 
        (u.utility_code || '').toLowerCase().includes(term) || 
        (u.description || '').toLowerCase().includes(term)
    );
  }, [utilities, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (isEditing) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300 pb-20 text-[11px] h-full overflow-y-auto custom-scrollbar font-sans">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-800 text-white rounded-xl shadow-lg"><Layers size={20}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none uppercase">
                            {editMode === 'create' ? 'เพิ่มลักษณะการทำประโยชน์' : 'แก้ไขลักษณะการทำประโยชน์'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-1">
                           <ShieldCheck size={10} className="text-emerald-500"/> MS_DEED_UTILITY: LAND POLICY
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
                <Card title="ข้อมูลหลักลักษณะการทำประโยชน์" className="lg:col-span-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                            <Input label="รหัสลักษณะ *" dbField="utility_code" value={formData.utility_code} maxLength={4} onChange={e => setFormData({...formData, utility_code: e.target.value})} disabled={editMode==='update'} className="font-black text-indigo-700 uppercase text-center" />
                        </div>
                        <div className="md:col-span-9">
                            <Input label="รายละเอียดลักษณะการทำประโยชน์ *" dbField="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="font-bold" />
                        </div>
                        <div className="md:col-span-4">
                           <div className="flex flex-col space-y-1">
                             <label className="text-sm font-semibold text-slate-600 ml-1 flex justify-between">ระดับความสำคัญ <span className="text-rose-400 font-mono text-[9px]">[level_no]</span></label>
                             <select className="bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 text-[11px]" value={formData.level_no} onChange={e => setFormData({...formData, level_no: parseInt(e.target.value)})}>
                                <option value={1}>1 - ระดับหลัก (Primary)</option>
                                <option value={2}>2 - ระดับรอง (Secondary)</option>
                             </select>
                           </div>
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

                <Card title="สถานะระบบ" className="lg:col-span-4 shadow-sm">
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Update Footprint</p>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400">BY:</span>
                                    <span className="font-bold text-slate-600">{formData.update_id || 'SYSTEM'}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400">DATE:</span>
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
              <div className="p-2 bg-indigo-800 text-white rounded-lg shadow-md"><ListTree size={20} /></div>
              <div>
                <h1 className="text-sm font-black text-slate-800 leading-none">ลักษณะการทำประโยชน์ (ms_deed_utility)</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1">Deed Utility Policy Config</p>
              </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="ค้นหารหัส หรือ รายละเอียด..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                  <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
              </div>
              <button onClick={loadData} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
              <Button onClick={() => { setFormData(initialForm); setEditMode('create'); setIsEditing(true); }} size="sm" className="bg-indigo-800 text-white font-bold px-6 rounded-lg shadow-md text-[10px] uppercase tracking-wider"><Plus size={14} /> เพิ่มลักษณะใหม่</Button>
          </div>
       </div>

       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10 shadow-sm">
                       <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                           <th className="py-2.5 px-4 border-b border-slate-200 w-24 text-center">รหัส</th>
                           <th className="py-2.5 px-4 border-b border-slate-200">ลักษณะการทำประโยชน์</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-24 text-center">ระดับ</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-24 text-center">สถานะ</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && utilities.length === 0 ? (
                           <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Master Data...</td></tr>
                       ) : currentItems.length === 0 ? (
                           <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลลักษณะการทำประโยชน์</td></tr>
                       ) : (
                        currentItems.map(u => (
                           <tr key={u.utility_code} className="group hover:bg-indigo-50/30 transition-all duration-150">
                               <td className="py-2 px-4 font-mono font-black text-indigo-700 align-middle"><div className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-center shadow-sm uppercase">{u.utility_code}</div></td>
                               <td className="py-2 px-4 align-middle">
                                   <div className={`font-bold text-slate-800 uppercase leading-none text-[11px] ${u.level_no === 2 ? 'pl-8 text-slate-500' : ''}`}>
                                       {u.level_no === 2 && <Tag size={10} className="inline mr-2 text-indigo-300"/>}
                                       {u.description}
                                   </div>
                               </td>
                               <td className="py-2 px-4 text-center align-middle font-mono font-bold text-slate-400">
                                   {u.level_no}
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <Badge type={u.is_status === 'Y' ? 'success' : 'neutral'}>{u.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEdit(u)} className="p-2 text-indigo-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-indigo-100"><Edit size={16}/></button>
                                       <button onClick={() => handleDelete(u.utility_code)} className="p-2 text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
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
