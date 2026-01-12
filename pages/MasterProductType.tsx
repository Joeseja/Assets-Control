
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Input, SearchableSelect, Pagination, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup, MasterType } from '../types';
import { Edit, Plus, Save, X, Tag, Search, RefreshCw, ShieldCheck, Zap, Percent, Calculator, LayoutGrid, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProductType = () => {
  const { t } = useLanguage();
  
  // -- Local Hierarchy State --
  const [groups, setGroups] = useState<MasterGroup[]>([]);
  const [types, setTypes] = useState<MasterType[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  
  // -- UI Control State --
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const initialForm: MasterType = {
    product_group_code: '', 
    product_type_code: '', 
    description: '', 
    is_status: 'Y',
    desc_eng: '',
    account_code: '',
    cost_percent: 0,
    price_percent: 0,
    update_id: 'ADMIN'
  };
  
  const [formData, setFormData] = useState<MasterType>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  /**
   * ขั้นตอนที่ 1: โหลดข้อมูลกลุ่มสินค้า (Dropdown List) เมื่อเปิดหน้าจอ
   * ปรับปรุง: ดึงเฉพาะ is_status='Y' และ "ไม่ต้อง Default ค่า" (ลบการเลือกค่าแรกออก)
   */
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลกลุ่มสินค้า เฉพาะที่ Active (is_status='Y')
        const gData = await api.getMasterGroups('Y');
        const groupList = Array.isArray(gData) ? gData : [];
        setGroups(groupList);
        
        // ลบ Logic การตั้งค่า Default ออก เพื่อให้ Dropdown ว่างไว้รอผู้ใช้เลือก
        setTypes([]); 
      } catch (e) {
        console.error("MasterType: Initial Group Load Error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  /**
   * ขั้นตอนที่ 2: ฟังก์ชันสำหรับดึงข้อมูลประเภทสินค้าที่อยู่ภายใต้กลุ่มที่เลือก
   */
  const loadTypesByGroup = async (groupCode: string) => {
    if (!groupCode) {
      setTypes([]);
      return;
    }
    setLoading(true);
    try {
      const tData = await api.getMasterTypes(groupCode);
      setTypes(Array.isArray(tData) ? tData : []);
      setCurrentPage(1); 
    } catch (e) {
      console.error("MasterType: Filtered Type Load Error", e);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * เมื่อมีการเลือกกลุ่มสินค้าจาก Dropdown List
   */
  const handleGroupSelectionChange = (groupCode: string) => {
    setSelectedGroup(groupCode);
    loadTypesByGroup(groupCode);
  };

  const handleEdit = (item: MasterType) => {
    setFormData({ ...initialForm, ...item });
    setEditMode('update');
    setIsEditing(true);
  };

  const handleDelete = async (tcode: string) => {
    if (!confirm(`⚠️ ยืนยันการลบประเภทสินค้า: ${tcode}?\n(การลบข้อมูลนี้ถูกจำกัดเฉพาะในตารางประเภทสินค้าเท่านั้น)`)) return;
    setLoading(true);
    try {
        await api.deleteMasterType(selectedGroup, tcode);
        alert('ลบข้อมูลประเภทสินค้าสำเร็จ');
        await loadTypesByGroup(selectedGroup);
    } catch (e: any) {
        alert('ลบไม่สำเร็จ: ' + e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.product_type_code || !formData.description) {
      return alert('กรุณาระบุรหัสและชื่อประเภทสินค้าให้ครบถ้วน');
    }
    
    setLoading(true);
    try {
      const payload = { 
        ...formData, 
        product_group_code: selectedGroup, 
        update_id: 'ADMIN'
      };
      await api.saveMasterType(payload);
      setIsEditing(false); 
      alert('บันทึกข้อมูลประเภทสินค้าเรียบร้อย');
      await loadTypesByGroup(selectedGroup); 
    } catch (e: any) { 
      alert('บันทึกไม่สำเร็จ: ' + e.message); 
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return types.filter(t => 
      (t.product_type_code || '').toLowerCase().includes(term) || 
      (t.description || '').toLowerCase().includes(term)
    );
  }, [types, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (isEditing) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300 pb-20 text-xs h-full overflow-y-auto font-sans">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Tag size={20}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none uppercase">
                            {editMode === 'create' ? 'เพิ่มประเภทสินค้าใหม่' : 'แก้ไขข้อมูลประเภทสินค้า'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                            <LayoutGrid size={10} className="text-amber-500"/> สังกัดกลุ่มสินค้า: {selectedGroup}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} className="px-5"><X size={14}/> ยกเลิก</Button>
                    <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-black shadow-lg" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} ยืนยันบันทึกข้อมูล
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card title="รายละเอียดประเภทสินค้า (Type Profile)" className="lg:col-span-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3">
                            <Input 
                                label="รหัสประเภทสินค้า *" dbField="product_type_code"
                                value={formData.product_type_code} 
                                onChange={e => setFormData({...formData, product_type_code: e.target.value.toUpperCase()})} 
                                disabled={editMode === 'update'} 
                                className={`font-black text-center text-xs ${editMode === 'update' ? 'bg-slate-50 text-indigo-700' : 'bg-white'}`}
                            />
                        </div>
                        <div className="md:col-span-9">
                            <Input 
                                label="ชื่อประเภทสินค้า (ไทย) *" dbField="description"
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                className="font-bold text-xs"
                            />
                        </div>
                        <div className="md:col-span-12">
                            <Input 
                                label="ชื่อภาษาอังกฤษ (English Name)" dbField="desc_eng"
                                value={formData.desc_eng || ''} 
                                onChange={e => setFormData({...formData, desc_eng: e.target.value})} 
                                className="text-xs uppercase"
                            />
                        </div>
                    </div>
                </Card>

                <Card title="สถานะและบัญชี" className="lg:col-span-4 shadow-sm">
                    <div className="space-y-4">
                        <Input 
                            label="รหัสบัญชี (GL Account)" dbField="account_code"
                            value={formData.account_code || ''} 
                            onChange={e => setFormData({...formData, account_code: e.target.value})} 
                            className="font-mono text-xs font-bold"
                        />
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                           <div className="flex items-center justify-between mb-2">
                               <span className="font-bold text-slate-600 text-[10px] uppercase">Active Status</span>
                               <input 
                                    type="checkbox" 
                                    checked={formData.is_status === 'Y'} 
                                    onChange={e => setFormData({...formData, is_status: e.target.checked ? 'Y' : 'N'})} 
                                    className="w-5 h-5 accent-emerald-600 cursor-pointer shadow-sm"
                                />
                           </div>
                           <p className="text-[9px] text-slate-400 leading-tight italic">เมื่อปิดสถานะ ประเภทนี้จะไม่ถูกนำไปใช้งานในส่วนการรับสินค้าใหม่</p>
                        </div>
                    </div>
                </Card>

                <Card title="ต้นทุนและราคาแนะนำ (%)" className="lg:col-span-12 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-100/50">
                            <Input 
                                label="ต้นทุนมาตรฐาน (%)" dbField="cost_percent" type="number" icon={Percent}
                                value={formData.cost_percent} 
                                onChange={e => setFormData({...formData, cost_percent: Number(e.target.value)})} 
                                className="font-black text-primary-800"
                            />
                        </div>
                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                            <Input 
                                label="ราคาขายแนะนำ (%)" dbField="price_percent" type="number" icon={Calculator}
                                value={formData.price_percent} 
                                onChange={e => setFormData({...formData, price_percent: Number(e.target.value)})} 
                                className="font-black text-amber-800"
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in text-xs font-sans overflow-hidden">
       {/* Filter Area (Isolated by Group PK) */}
       <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0 gap-4 ring-1 ring-slate-100">
          <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary-800 text-white rounded-xl shadow-lg"><LayoutGrid size={22} /></div>
              <div className="min-w-[350px]">
                  <SearchableSelect 
                      label="สังกัดกลุ่มสินค้า (เลือกกลุ่มเพื่อกรองข้อมูลประเภท)"
                      options={groups.map(g => ({value: g.product_group_code, label: `${g.product_group_code}: ${g.description}`}))}
                      value={selectedGroup}
                      onChange={handleGroupSelectionChange}
                      placeholder="-- กรุณาเลือกกลุ่มสินค้า --"
                  />
              </div>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                  <input 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" 
                    placeholder="ค้นหาด้วยรหัส หรือ ชื่อประเภท..." 
                    value={searchTerm} 
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                  />
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400"/>
              </div>
              <button onClick={() => loadTypesByGroup(selectedGroup)} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
              </button>
              <Button onClick={() => { 
                  if (!selectedGroup) return alert('กรุณาเลือกกลุ่มสินค้าด้านบนก่อนเพิ่มข้อมูลประเภท');
                  setFormData({...initialForm, product_group_code: selectedGroup}); 
                  setEditMode('create'); 
                  setIsEditing(true); 
              }} size="sm" className="bg-primary-800 text-white font-bold px-6 rounded-xl shadow-md border-b-2 border-primary-950">
                <Plus size={16} /> เพิ่มประเภทสินค้า
              </Button>
          </div>
       </div>

       {/* Data Result Table */}
       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-2xl rounded-2xl bg-white ring-1 ring-slate-100 flex flex-col">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-xs text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10 shadow-sm">
                       <tr className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-100">
                           <th className="py-3 px-4 border-b border-slate-200 w-36">Type Code</th>
                           <th className="py-3 px-4 border-b border-slate-200">Description (Thai / Eng)</th>
                           <th className="py-3 px-4 border-b border-slate-200 w-32">GL Account</th>
                           <th className="py-3 px-4 border-b border-slate-200 text-center w-28">Status</th>
                           <th className="py-3 px-4 border-b border-slate-200 text-center w-32">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && types.length === 0 && selectedGroup ? (
                           <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={32}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Filtering records...</span></td></tr>
                       ) : !selectedGroup ? (
                           <tr><td colSpan={5} className="p-32 text-center">
                               <div className="flex flex-col items-center gap-2 text-slate-300">
                                   <Search size={40} className="opacity-20" />
                                   <span className="font-bold italic">กรุณาเลือก "กลุ่มสินค้า" ด้านบนเพื่อเรียกดูข้อมูล</span>
                               </div>
                           </td></tr>
                       ) : currentItems.length === 0 ? (
                           <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลประเภทสินค้าในกลุ่ม "{selectedGroup}"</td></tr>
                       ) : (
                        currentItems.map(item => (
                           <tr key={`${item.product_group_code}-${item.product_type_code}`} className="group hover:bg-primary-50/40 transition-all duration-150 cursor-pointer">
                               <td className="py-2 px-4 font-mono font-black text-primary-700 align-middle">
                                   <div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center shadow-sm group-hover:bg-white transition-colors">{item.product_type_code}</div>
                               </td>
                               <td className="py-2 px-4 align-middle">
                                   <div className="font-bold text-slate-800 uppercase leading-none mb-1 group-hover:text-primary-800 transition-colors">{item.description}</div>
                                   <div className="text-[9px] text-slate-400 font-bold italic uppercase">{item.desc_eng || '-'}</div>
                               </td>
                               <td className="py-2 px-4 align-middle font-mono font-bold text-slate-500">{item.account_code || '-'}</td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <Badge type={item.is_status === 'Y' ? 'success' : 'neutral'}>{item.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEdit(item)} className="p-2 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100" title="แก้ไขข้อมูล"><Edit size={16}/></button>
                                       <button onClick={() => handleDelete(item.product_type_code)} className="p-2 text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-rose-100" title="ลบข้อมูล"><Trash2 size={16}/></button>
                                   </div>
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
       
       <div className="bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200 flex justify-center gap-6 items-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
            <div className="flex items-center gap-2"><ShieldCheck size={12}/> Data Flow Verified</div>
            <div className="flex items-center gap-2"><Zap size={12} className="text-amber-400"/> Isolated Master Record Policy</div>
            <div className="flex items-center gap-2"><LayoutGrid size={12} className="text-primary-400"/> Product Hierarchy Secured</div>
       </div>
    </div>
  );
};
