
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Input, SearchableSelect, Pagination, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup, MasterType, MasterSubtype } from '../types';
import { Edit, Plus, Save, X, ListTree, Search, RefreshCw, Trash2, ShieldCheck, Fingerprint, Zap, Layers, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProductSubtype = () => {
  const { t } = useLanguage();
  
  // -- Core Data State --
  const [groups, setGroups] = useState<MasterGroup[]>([]);
  const [types, setTypes] = useState<MasterType[]>([]);
  const [subtypes, setSubtypes] = useState<MasterSubtype[]>([]);
  
  // -- Hierarchy Selection State --
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // -- UI Control State --
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // -- Form State --
  const initialForm: MasterSubtype = {
    product_group_code: '', 
    product_type_code: '', 
    product_subtype_code: '', 
    description: '', 
    is_status: 'Y',
    desc_eng: '',
    idp_code: '',
    update_id: 'ADMIN'
  };
  
  const [formData, setFormData] = useState<MasterSubtype>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  /**
   * PHASE 1: Load Groups on Mount
   * ปรับปรุง: ดึงเฉพาะ is_status='Y' และ "ไม่ต้อง Default ค่า" (ลบการเลือกค่าแรกออก)
   */
  useEffect(() => {
    const fetchInitialGroups = async () => {
      setLoading(true);
      try {
        const gData = await api.getMasterGroups('Y');
        const list = Array.isArray(gData) ? gData : [];
        setGroups(list);
        
        // ลบ Logic การตั้งค่า Default ออก เพื่อให้ Dropdown ว่างไว้รอผู้ใช้เลือก
        setTypes([]);
        setSubtypes([]);
      } catch (e) {
        console.error("Subtype Init Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialGroups();
  }, []);

  /**
   * PHASE 2: Fetch Types when Group changes
   * ปรับปรุง: ดึงข้อมูลประเภทแต่ "ไม่ต้อง Default ค่า"
   */
  const fetchTypesForGroup = async (groupCode: string) => {
    if (!groupCode) {
      setTypes([]);
      setSelectedType('');
      setSubtypes([]);
      return;
    }
    setLoading(true);
    try {
      const tData = await api.getMasterTypes(groupCode);
      const list = Array.isArray(tData) ? tData : [];
      setTypes(list);
      
      // ลบ Logic การตั้งค่า Default Selected Type ออก
      setSelectedType('');
      setSubtypes([]);
    } catch (e) {
      console.error("Fetch Types Error:", e);
      setTypes([]);
      setSubtypes([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * PHASE 3: Fetch Subtypes
   */
  const fetchSubtypesList = async (group: string, type: string) => {
    if (!group || !type) {
        setSubtypes([]);
        return;
    }
    setLoading(true);
    try {
      const sData = await api.getMasterSubtypes(group, type);
      setSubtypes(Array.isArray(sData) ? sData : []);
      setCurrentPage(1);
    } catch (e) {
      console.error("Fetch Subtypes Error:", e);
      setSubtypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Event Handlers
  const handleGroupChange = (val: string) => {
    setSelectedGroup(val);
    fetchTypesForGroup(val);
  };

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    fetchSubtypesList(selectedGroup, val);
  };

  const handleEdit = (item: MasterSubtype) => {
    setFormData({ ...initialForm, ...item });
    setEditMode('update');
    setIsEditing(true);
  };

  const handleDelete = async (scode: string) => {
    if (!confirm(`⚠️ ยืนยันการลบประเภทย่อยสินค้า: ${scode}?`)) return;
    setLoading(true);
    try {
        await api.deleteMasterSubtype(selectedGroup, selectedType, scode);
        alert('ลบข้อมูลสำเร็จ');
        await fetchSubtypesList(selectedGroup, selectedType);
    } catch (e: any) {
        alert('ลบไม่สำเร็จ: ' + e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.product_subtype_code || !formData.description) {
      return alert('กรุณาระบุรหัสประเภทย่อยและชื่อให้ครบถ้วน');
    }
    
    setLoading(true);
    try {
      const payload = { 
        ...formData, 
        product_group_code: selectedGroup, 
        product_type_code: selectedType,
        update_id: 'ADMIN'
      };
      await api.saveMasterSubtype(payload);
      setIsEditing(false); 
      alert('บันทึกข้อมูลเรียบร้อย');
      await fetchSubtypesList(selectedGroup, selectedType);
    } catch (e: any) { 
      alert('บันทึกไม่สำเร็จ: ' + e.message); 
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return subtypes.filter(s => 
      (s.product_subtype_code || '').toLowerCase().includes(term) || 
      (s.description || '').toLowerCase().includes(term)
    );
  }, [subtypes, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (isEditing) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300 pb-20 text-xs h-full overflow-y-auto">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><ListTree size={20}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none uppercase">
                            {editMode === 'create' ? 'Create New Subtype' : 'Edit Subtype Profile'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                            <Activity size={10} className="text-emerald-500"/> Composite PK Verified: {selectedGroup} / {selectedType}
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
                <Card title="รายละเอียดประเภทย่อย (Subtype Profile)" className="lg:col-span-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3">
                            <Input 
                                label="รหัสประเภทย่อย (Subtype Code) *" dbField="product_subtype_code"
                                value={formData.product_subtype_code} 
                                onChange={e => setFormData({...formData, product_subtype_code: e.target.value.toUpperCase()})} 
                                disabled={editMode === 'update'} 
                                className={`font-black text-center text-xs ${editMode === 'update' ? 'bg-slate-50 text-indigo-700' : 'bg-white'}`}
                            />
                        </div>
                        <div className="md:col-span-9">
                            <Input 
                                label="ชื่อประเภทย่อย (Thai Description) *" dbField="description"
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
                                className="text-xs"
                            />
                        </div>
                    </div>
                </Card>

                <Card title="การเชื่อมโยงข้อมูล (Technical Specs)" className="lg:col-span-4 shadow-sm">
                    <div className="space-y-4">
                        <Input 
                            label="รหัส IDP (IDP Mapping)" dbField="idp_code" icon={Fingerprint}
                            value={formData.idp_code || ''} 
                            onChange={e => setFormData({...formData, idp_code: e.target.value})} 
                            className="font-mono text-xs"
                        />
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                           <div className="flex items-center justify-between mb-2">
                               <span className="font-bold text-slate-600 text-[10px] uppercase">Active Status (is_status)</span>
                               <input 
                                    type="checkbox" 
                                    checked={formData.is_status === 'Y'} 
                                    onChange={e => setFormData({...formData, is_status: e.target.checked ? 'Y' : 'N'})} 
                                    className="w-5 h-5 accent-emerald-600 cursor-pointer shadow-sm rounded border-slate-300"
                                />
                           </div>
                           <p className="text-[9px] text-slate-400 leading-tight italic">หากปิดสถานะ ประเภทย่อยนี้จะไม่ถูกดึงไปแสดงผลในหน้าจอทำรายการใหม่</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in text-xs font-sans overflow-hidden">
       {/* Hierarchy Dynamic Filters */}
       <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0 gap-4 ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-800 text-white rounded-xl shadow-lg"><ListTree size={20} /></div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="min-w-[240px]">
                    <SearchableSelect 
                        label="1. เลือกระดับกลุ่มสินค้า (แสดงเฉพาะที่ Active)"
                        options={groups.map(g => ({value: g.product_group_code, label: `${g.product_group_code}: ${g.description}`}))}
                        value={selectedGroup}
                        onChange={handleGroupChange}
                        placeholder="-- กรุณาเลือกกลุ่มสินค้า --"
                    />
                </div>
                <div className="min-w-[240px]">
                    <SearchableSelect 
                        label="2. เลือกระดับประเภทสินค้า (Type)"
                        options={types.map(t => ({value: t.product_type_code, label: `${t.product_type_code}: ${t.description}`}))}
                        value={selectedType}
                        onChange={handleTypeChange}
                        placeholder="-- กรุณาเลือกประเภทสินค้า --"
                        disabled={!selectedGroup}
                    />
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                  <input 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" 
                    placeholder="Search by Code or Name..." 
                    value={searchTerm} 
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                  />
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400"/>
              </div>
              <button onClick={() => fetchSubtypesList(selectedGroup, selectedType)} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shadow-sm active:scale-95 transition-all">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
              </button>
              <Button onClick={() => { 
                  if (!selectedGroup || !selectedType) return alert('กรุณาเลือก กลุ่ม และ ประเภท ก่อนทำรายการ');
                  setFormData({...initialForm, product_group_code: selectedGroup, product_type_code: selectedType}); 
                  setEditMode('create'); 
                  setIsEditing(true); 
              }} size="sm" className="bg-primary-800 text-white font-bold px-6 rounded-xl shadow-md border-b-2 border-primary-950">
                <Plus size={16} /> เพิ่มประเภทย่อย
              </Button>
          </div>
       </div>

       {/* Subtype Master List Table */}
       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-2xl rounded-2xl bg-white ring-1 ring-slate-100 flex flex-col">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-xs text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10 shadow-sm">
                       <tr className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-100">
                           <th className="py-3 px-4 border-b border-slate-200 w-36">Subtype Code</th>
                           <th className="py-3 px-4 border-b border-slate-200">Description (Thai / English)</th>
                           <th className="py-3 px-4 border-b border-slate-200 w-32 text-center">IDP Code</th>
                           <th className="py-3 px-4 border-b border-slate-200 text-center w-28">Status</th>
                           <th className="py-3 px-4 border-b border-slate-200 text-center w-32">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && subtypes.length === 0 && selectedGroup && selectedType ? (
                           <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={32}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Product Hierarchy DB...</span></td></tr>
                       ) : (!selectedGroup || !selectedType) ? (
                           <tr><td colSpan={5} className="p-32 text-center">
                               <div className="flex flex-col items-center gap-2 text-slate-300">
                                   <Layers size={40} className="opacity-20" />
                                   <span className="font-bold italic">กรุณาเลือกระดับชั้นข้อมูล "กลุ่มสินค้า" และ "ประเภทสินค้า" เพื่อแสดงผล</span>
                               </div>
                           </td></tr>
                       ) : currentItems.length === 0 ? (
                           <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลประเภทย่อยสินค้าในกลุ่มที่เลือก</td></tr>
                       ) : (
                        currentItems.map(item => (
                           <tr key={`${item.product_group_code}-${item.product_type_code}-${item.product_subtype_code}`} className="group hover:bg-primary-50/40 transition-all duration-150 cursor-pointer">
                               <td className="py-2 px-4 font-mono font-black text-primary-700 align-middle">
                                   <div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center shadow-sm group-hover:bg-white">{item.product_subtype_code}</div>
                               </td>
                               <td className="py-2 px-4 align-middle">
                                   <div className="font-bold text-slate-800 uppercase leading-none mb-1 group-hover:text-primary-800 transition-colors">{item.description}</div>
                                   <div className="text-[9px] text-slate-400 font-bold italic uppercase">{item.desc_eng || '-'}</div>
                               </td>
                               <td className="py-2 px-4 text-center align-middle font-mono font-bold text-slate-500">{item.idp_code || '-'}</td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <Badge type={item.is_status === 'Y' ? 'success' : 'neutral'}>{item.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEdit(item)} className="p-2 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100" title="แก้ไขโปรไฟล์"><Edit size={16}/></button>
                                       <button onClick={() => handleDelete(item.product_subtype_code)} className="p-2 text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-rose-100" title="ลบข้อมูลถาวร"><Trash2 size={16}/></button>
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
    </div>
  );
};
