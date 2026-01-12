
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SearchableSelect, Pagination, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { CompanyItem, MsProject } from '../types';
import { Edit, Plus, Save, X, Building2, Search, RefreshCw, CheckCircle2, ShieldAlert, Zap, Droplets, Landmark } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProject = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<MsProject[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 12;

  const initialForm: MsProject = {
    project_code: '', 
    description: '', 
    comp_code: '', 
    is_status: 'Y',
    fund_amount: 0,
    room_qty: 0,
    meter_water: 0,
    meter_electric: 0,
    install_water: 0,
    install_electric: 0,
    center_amount: 0,
    tax_percent: 0,
    tower_no: 0,
    floor_no: 0,
    level_no: 0,
    is_bg: 'N',
    is_rf: 'N',
    is_rms: 'N',
    branch_id: '',
    location_code: ''
  };
  
  const [formData, setFormData] = useState<MsProject>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [comps, projs] = await Promise.all([
        api.getCompanies().catch(() => []),
        api.getMsProjectsList().catch(() => [])
      ]);
      setCompanies(Array.isArray(comps) ? comps : []);
      setProjects(Array.isArray(projs) ? projs : []);
      setCurrentPage(1); 
    } catch (e) { 
      console.error("MasterProject Load Error:", e);
      setProjects([]); 
    }
    setLoading(false);
  };

  const handleEdit = async (code: string) => {
    setLoading(true);
    try {
      const data = await api.getMsProjectDetail(code);
      if (data) {
        setFormData({ ...initialForm, ...data });
        setEditMode('update');
        setIsEditing(true);
      }
    } catch (e) {
      alert('ไม่สามารถโหลดข้อมูลโครงการได้');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.project_code || !formData.description || !formData.comp_code) {
      return alert(t('msg.required_fields'));
    }
    
    setLoading(true);
    try {
      await api.saveMsProject(formData);
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
    return projects.filter(p => 
      (p.project_code || '').toLowerCase().includes(term) || 
      (p.description || '').toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

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
                    <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Building2 size={18}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">
                            {editMode === 'create' ? 'เพิ่มข้อมูลโครงการใหม่' : 'แก้ไขข้อมูลโครงการ'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Project Master Identity (ms_project)</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} className="px-4 py-1.5 border-slate-200 text-xs"><X size={14}/> {t('btn.cancel')}</Button>
                    <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-1.5 font-black text-xs shadow-sm" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} {t('btn.save')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-4">
                    <Card title="ข้อมูลพื้นฐานโครงการ" className="shadow-sm border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-3">
                                <Input 
                                    label="รหัสโครงการ *" dbField="project_code"
                                    value={formData.project_code} 
                                    onChange={e => setFormData({...formData, project_code: e.target.value.toUpperCase()})} 
                                    disabled={editMode === 'update'} 
                                    className={`font-black text-center text-xs ${editMode === 'update' ? 'bg-slate-50 text-indigo-700' : 'bg-white'}`}
                                />
                            </div>
                            <div className="md:col-span-9">
                                <Input 
                                    label="ชื่อโครงการ *" dbField="description"
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    className="font-bold text-xs"
                                />
                            </div>
                            <div className="md:col-span-4">
                                <SearchableSelect 
                                    label="สังกัดบริษัท *" dbField="comp_code"
                                    options={companies.map(c => ({value: c.comp_code, label: `(${c.comp_code}) ${c.comp_name}`}))}
                                    value={formData.comp_code}
                                    onChange={v => setFormData({...formData, comp_code: v})}
                                />
                            </div>
                            <div className="md:col-span-4">
                                <Input label="รหัสสาขา" dbField="branch_id" value={formData.branch_id || ''} onChange={e => setFormData({...formData, branch_id: e.target.value})} />
                            </div>
                            <div className="md:col-span-4">
                                <Input label="Location Code" dbField="location_code" value={formData.location_code || ''} onChange={e => setFormData({...formData, location_code: e.target.value})} />
                            </div>
                        </div>
                    </Card>

                    <Card title="ข้อมูลมิเตอร์และงบประมาณ" className="shadow-sm border-slate-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Input label="มิเตอร์น้ำ" dbField="meter_water" type="number" icon={Droplets} value={formData.meter_water} onChange={e => setFormData({...formData, meter_water: Number(e.target.value)})} />
                            <Input label="มิเตอร์ไฟ" dbField="meter_electric" type="number" icon={Zap} value={formData.meter_electric} onChange={e => setFormData({...formData, meter_electric: Number(e.target.value)})} />
                            <Input label="ค่าประกันน้ำ" dbField="install_water" type="number" value={formData.install_water} onChange={e => setFormData({...formData, install_water: Number(e.target.value)})} />
                            <Input label="ค่าประกันไฟ" dbField="install_electric" type="number" value={formData.install_electric} onChange={e => setFormData({...formData, install_electric: Number(e.target.value)})} />
                            
                            <Input label="จำนวนห้อง" dbField="room_qty" type="number" value={formData.room_qty} onChange={e => setFormData({...formData, room_qty: Number(e.target.value)})} />
                            <Input label="พื้นที่ทั้งหมด" dbField="total_area_qty" type="number" value={formData.total_area_qty} onChange={e => setFormData({...formData, total_area_qty: Number(e.target.value)})} />
                            <Input label="ทุนจดทะเบียน" dbField="fund_amount" type="number" icon={Landmark} value={formData.fund_amount} onChange={e => setFormData({...formData, fund_amount: Number(e.target.value)})} />
                            <Input label="ค่าส่วนกลาง" dbField="center_amount" type="number" value={formData.center_amount} onChange={e => setFormData({...formData, center_amount: Number(e.target.value)})} />
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <Card title="โครงสร้างและสถานะ" className="shadow-sm border-slate-100">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <Input label="จำนวนอาคาร/Tower" dbField="tower_no" type="number" value={formData.tower_no} onChange={e => setFormData({...formData, tower_no: Number(e.target.value)})} />
                            <Input label="จำนวนชั้น" dbField="floor_no" type="number" value={formData.floor_no} onChange={e => setFormData({...formData, floor_no: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'สถานะเปิดใช้งาน', field: 'is_status', activeVal: 'Y' },
                                { label: 'ใช้งานงบประมาณ', field: 'is_bg', activeVal: 'Y' },
                                { label: 'ใช้งานระบบ RMS', field: 'is_rms', activeVal: 'Y' },
                                { label: 'ใช้งานระบบ RF', field: 'is_rf', activeVal: 'Y' },
                                { label: 'กลุ่มโครงการ', field: 'is_group', activeVal: 'Y' },
                            ].map((item) => (
                                <label key={item.field} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-400 transition-all cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700 text-[11px]">{item.label}</span>
                                        <span className="text-[8px] text-rose-400 font-mono">[{item.field}]</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={formData[item.field as keyof MsProject] === item.activeVal} 
                                        onChange={e => setFormData({...formData, [item.field]: e.target.checked ? item.activeVal : 'N'})} 
                                        className="w-4 h-4 accent-primary-700 cursor-pointer"
                                    />
                                </label>
                            ))}
                        </div>
                    </Card>

                    <div className="bg-slate-100/50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Integrity Protection</p>
                        <div className="flex items-center justify-center gap-2 text-primary-500 font-bold text-[10px]">
                            <ShieldAlert size={12}/> Locked Master Records
                        </div>
                    </div>
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
              <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Building2 size={18} /></div>
              <div>
                <h1 className="text-sm font-black text-slate-800 leading-none">{t('menu.master_project')}</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">Global Project Records</p>
              </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <input 
                    className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" 
                    placeholder="รหัส หรือ ชื่อโครงการ..." 
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
                           <th className="py-2.5 px-4 border-b border-slate-200 w-32">Project Code</th>
                           <th className="py-2.5 px-4 border-b border-slate-200">Description</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 w-32 text-center">Company</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">Status</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-16">Edit</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && projects.length === 0 ? (
                           <tr><td colSpan={5} className="p-32 text-center"><RefreshCw className="animate-spin mx-auto text-primary-500 mb-4" size={32}/><span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Project Data...</span></td></tr>
                       ) : currentItems.length === 0 ? (
                           <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">ไม่พบข้อมูลโครงการ</td></tr>
                       ) : (
                        currentItems.map(p => (
                           <tr key={p.project_code} className="group hover:bg-primary-50/40 transition-all duration-150 cursor-pointer" onClick={() => handleEdit(p.project_code)}>
                               <td className="py-2 px-4 font-mono font-black text-primary-700 align-middle">
                                   <div className="bg-primary-50 border border-primary-100 px-2 py-0.5 rounded text-center">{p.project_code}</div>
                               </td>
                               <td className="py-2 px-4 align-middle">
                                   <div className="font-bold text-slate-800 text-[11px] uppercase tracking-tight">{p.description}</div>
                               </td>
                               <td className="py-2 px-4 text-slate-500 font-mono text-center align-middle">{p.comp_code}</td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <Badge type={p.is_status === 'Y' ? 'success' : 'neutral'}>{p.is_status === 'Y' ? 'Active' : 'Inactive'}</Badge>
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <button onClick={(e) => { e.stopPropagation(); handleEdit(p.project_code); }} className="p-1.5 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100" title="Edit"><Edit size={14}/></button>
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
