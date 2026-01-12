
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Pagination, Badge, SearchableSelect } from '../components/ui';
import { api } from '../services/apiService';
import { DeedBookYear, MsProject, MsDeedUtility } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Edit, Plus, Save, X, Search, RefreshCw, Trash2, 
  ShieldCheck, Calculator, Landmark, Home, MapPin, 
  Table, Calendar, FileText, ArrowRight, Activity, Percent
} from 'lucide-react';

export const MasterDeedBookYear = () => {
  const { t } = useLanguage();
  const [dataList, setDataList] = useState<DeedBookYear[]>([]);
  const [projects, setProjects] = useState<MsProject[]>([]);
  const [utilities, setUtilities] = useState<MsDeedUtility[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filters
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterProject, setFilterProject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const initialForm: DeedBookYear = { 
    year_no: new Date().getFullYear(),
    book_code: '',
    project_code: '',
    deed_id: '',
    tower_no: '',
    floor_no: '',
    plan_no: '',
    home_no: '',
    land_no: '',
    explore_no: '',
    deed_code: '',
    sales_status_code: '0',
    deed_sales_qty: 0,
    deed_qty: 0,
    balcony_qty: 0,
    building_qty: 0,
    appraisal_land: 0,
    appraisal_building: 0,
    appraisal_balcony: 0,
    depreciation_percent: 0,
    utility_code: '',
    tax_rate_percent: 0,
    is_status: 'N'
  };
  
  const [formData, setFormData] = useState<DeedBookYear>(initialForm);
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
        const [projRes, utilRes] = await Promise.all([
            api.getMsProjectsList(),
            api.getDeedUtilities()
        ]);
        setProjects(Array.isArray(projRes) ? projRes : []);
        setUtilities(Array.isArray(utilRes) ? utilRes : []);
    } catch (e) {
        console.error(e);
    }
  };

  const loadData = async (year: number, project: string) => {
    setLoading(true);
    try {
      const data = await api.getDeedBookYears(year, project);
      setDataList(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (e) { 
        setDataList([]); 
    }
    setLoading(false);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleEdit = (item: DeedBookYear) => {
    setFormData({ ...initialForm, ...item });
    setEditMode('update');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.year_no || !formData.book_code || !formData.project_code) {
        return showStatus('error', 'กรุณาระบุข้อมูล ปี, รหัสอ้างอิง และ โครงการ ให้ครบถ้วน');
    }
    setLoading(true);
    try {
      await api.saveDeedBookYear(formData);
      setIsEditing(false);
      loadData(filterYear, filterProject);
      showStatus('success', 'บันทึกข้อมูลภาษีที่ดินเรียบร้อย');
    } catch (e: any) { 
        showStatus('error', 'บันทึกไม่สำเร็จ: ' + e.message); 
    }
    setLoading(false);
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return dataList.filter(d => 
        (d.book_code || '').toLowerCase().includes(term) || 
        (d.home_no || '').toLowerCase().includes(term) ||
        (d.plan_no || '').toLowerCase().includes(term) ||
        (d.deed_id || '').toLowerCase().includes(term)
    );
  }, [dataList, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (isEditing) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300 pb-20 text-[11px] h-full overflow-y-auto custom-scrollbar font-sans">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-800 text-white rounded-xl shadow-lg"><Landmark size={20}/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none uppercase">
                            {editMode === 'create' ? 'เพิ่มข้อมูลภาษีที่ดิน' : 'แก้ไขข้อมูลภาษีที่ดินแปลงขาย'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-1">
                           <ShieldCheck size={10} className="text-emerald-500"/> DEED_BOOK_YEAR: LAND TAX DATA
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
                <Card title="ข้อมูลทรัพย์สินพื้นฐาน" className="lg:col-span-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                            <Input label="ปีภาษี *" type="number" dbField="year_no" value={formData.year_no} onChange={e => setFormData({...formData, year_no: parseInt(e.target.value)})} disabled={editMode==='update'} className="font-black text-indigo-700 text-center" />
                        </div>
                        <div className="md:col-span-9">
                            <Input label="รหัสอ้างอิงสมุดภาษี (Book Code) *" dbField="book_code" value={formData.book_code} onChange={e => setFormData({...formData, book_code: e.target.value})} disabled={editMode==='update'} className="font-black text-primary-700" />
                        </div>
                        <div className="md:col-span-6">
                            <SearchableSelect 
                                label="สังกัดโครงการ *" 
                                options={projects.map(p => ({value: p.project_code, label: `${p.project_code}: ${p.description}`}))}
                                value={formData.project_code}
                                onChange={v => setFormData({...formData, project_code: v})}
                            />
                        </div>
                        <div className="md:col-span-3"><Input label="เลขที่โฉนด (Deed ID)" dbField="deed_id" value={formData.deed_id || ''} onChange={e => setFormData({...formData, deed_id: e.target.value})} /></div>
                        <div className="md:col-span-3"><Input label="เลขที่บ้าน (Home No)" dbField="home_no" value={formData.home_no || ''} onChange={e => setFormData({...formData, home_no: e.target.value})} className="font-bold text-indigo-700" /></div>
                        
                        <div className="md:col-span-3"><Input label="อาคาร/Tower" dbField="tower_no" value={formData.tower_no || ''} onChange={e => setFormData({...formData, tower_no: e.target.value})} /></div>
                        <div className="md:col-span-3"><Input label="ชั้น (Floor)" dbField="floor_no" value={formData.floor_no || ''} onChange={e => setFormData({...formData, floor_no: e.target.value})} /></div>
                        <div className="md:col-span-3"><Input label="เลขที่แบบ (Plan)" dbField="plan_no" value={formData.plan_no || ''} onChange={e => setFormData({...formData, plan_no: e.target.value})} /></div>
                        <div className="md:col-span-3">
                           <div className="flex flex-col space-y-1">
                             <label className="text-sm font-semibold text-slate-600 ml-1">สถานะแปลงขาย</label>
                             <select className="bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold outline-none text-[11px]" value={formData.sales_status_code || '0'} onChange={e => setFormData({...formData, sales_status_code: e.target.value})}>
                                <option value="0">0 - ว่าง (Available)</option>
                                <option value="1">1 - จอง/โอนแล้ว (Sold)</option>
                             </select>
                           </div>
                        </div>
                    </div>
                </Card>

                <Card title="ข้อมูลพื้นที่ (Quantity)" className="lg:col-span-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="พท.โฉนด (Deed)" type="number" dbField="deed_qty" value={formData.deed_qty} onChange={e => setFormData({...formData, deed_qty: parseFloat(e.target.value)})} />
                        <Input label="พท.ขาย (Sales)" type="number" dbField="deed_sales_qty" value={formData.deed_sales_qty} onChange={e => setFormData({...formData, deed_sales_qty: parseFloat(e.target.value)})} />
                        <Input label="พท.ระเบียง (Balcony)" type="number" dbField="balcony_qty" value={formData.balcony_qty} onChange={e => setFormData({...formData, balcony_qty: parseFloat(e.target.value)})} />
                        <Input label="พท.สิ่งปลูกสร้าง" type="number" dbField="building_qty" value={formData.building_qty} onChange={e => setFormData({...formData, building_qty: parseFloat(e.target.value)})} />
                    </div>
                </Card>

                <Card title="ข้อมูลราคาประเมินและภาษี" className="lg:col-span-12 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <Input label="ราคาประเมินที่ดิน" icon={Landmark} type="number" dbField="appraisal_land" value={formData.appraisal_land} onChange={e => setFormData({...formData, appraisal_land: parseFloat(e.target.value)})} className="font-black text-emerald-700" />
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <Input label="ราคาประเมินอาคาร" icon={Home} type="number" dbField="appraisal_building" value={formData.appraisal_building} onChange={e => setFormData({...formData, appraisal_building: parseFloat(e.target.value)})} className="font-black text-blue-700" />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <SearchableSelect 
                                label="ลักษณะการใช้ประโยชน์ *" 
                                options={utilities.map(u => ({value: u.utility_code, label: `${u.utility_code}: ${u.description}`}))}
                                value={formData.utility_code || ''}
                                onChange={v => setFormData({...formData, utility_code: v})}
                            />
                            <Input label="อัตราภาษี (%)" icon={Percent} type="number" dbField="tax_rate_percent" value={formData.tax_rate_percent} onChange={e => setFormData({...formData, tax_rate_percent: parseFloat(e.target.value)})} step="0.01" className="font-black" />
                        </div>
                        <div className="md:col-span-1">
                             <Input label="ค่าเสื่อมราคา (%)" type="number" dbField="depreciation_percent" value={formData.depreciation_percent} onChange={e => setFormData({...formData, depreciation_percent: parseFloat(e.target.value)})} />
                        </div>
                        <div className="md:col-span-1">
                           <div className="flex flex-col space-y-1">
                             <label className="text-sm font-semibold text-slate-600 ml-1">สถานะชำระ</label>
                             <select className="bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold outline-none text-[11px]" value={formData.is_status} onChange={e => setFormData({...formData, is_status: e.target.value})}>
                                <option value="N">N - ยังไม่ชำระ</option>
                                <option value="Y">Y - ชำระเรียบร้อย</option>
                             </select>
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
                <ShieldCheck size={20} className={statusMsg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'} />
                <div className="max-w-md">
                    <span className="font-bold block text-xs">{statusMsg.type === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</span>
                    <span className="text-[10px]">{statusMsg.text}</span>
                </div>
                <button onClick={() => setStatusMsg(null)} className="ml-2 opacity-50 hover:opacity-100"><X size={14}/></button>
            </div>
        )}

       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 gap-3">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-800 text-white rounded-lg shadow-md"><Calculator size={20} /></div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-24">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">ปีภาษี</label>
                    <input type="number" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:ring-2 focus:ring-primary-500/20" value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} />
                </div>
                <div className="min-w-[250px]">
                    <SearchableSelect 
                        label="เลือกโครงการ"
                        options={projects.map(p => ({value: p.project_code, label: `${p.project_code}: ${p.description}`}))}
                        value={filterProject}
                        onChange={setFilterProject}
                    />
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto self-end">
              <div className="relative w-48">
                  <input className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="เลขที่บ้าน, โฉนด..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <Search size={14} className="absolute left-2.5 top-2 text-slate-400"/>
              </div>
              <button onClick={() => loadData(filterYear, filterProject)} className="p-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 shadow-md transition-all flex items-center gap-2 font-bold px-4"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> ดึงข้อมูล</button>
              <Button onClick={() => { setFormData({...initialForm, year_no: filterYear, project_code: filterProject}); setEditMode('create'); setIsEditing(true); }} size="sm" className="bg-emerald-600 text-white font-bold px-6 rounded-lg shadow-md hover:bg-emerald-700 border-0"><Plus size={14} /> เพิ่มข้อมูล</Button>
          </div>
       </div>

       <Card className="flex-1 overflow-hidden p-0 border-0 shadow-xl rounded-xl bg-white flex flex-col">
           <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-left border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10 shadow-sm">
                       <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                           <th className="py-2.5 px-4 border-b border-slate-200">เลขที่บ้าน / แปลง</th>
                           <th className="py-2.5 px-4 border-b border-slate-200">เลขที่ดิน / โฉนด</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-right">ประเมินที่ดิน</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-right">ประเมินอาคาร</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center">ประเภทการใช้</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center">อัตราภาษี</th>
                           <th className="py-2.5 px-4 border-b border-slate-200 text-center w-24">จัดการ</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {loading && dataList.length === 0 ? (
                           <tr><td colSpan={7} className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-[0.2em]">Synchronizing Sale Land Tax Hub...</td></tr>
                       ) : dataList.length === 0 ? (
                           <tr><td colSpan={7} className="p-20 text-center text-slate-300 font-bold italic">เลือกโครงการเพื่อแสดงข้อมูลภาษีรายแปลง</td></tr>
                       ) : (
                        currentItems.map(d => (
                           <tr key={`${d.year_no}-${d.book_code}`} className="group hover:bg-primary-50/30 transition-all duration-150">
                               <td className="py-2 px-4 align-middle">
                                   <div className="font-black text-primary-800 text-[11px] leading-none mb-1">{d.home_no || '-'}</div>
                                   <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                       <MapPin size={10} className="text-slate-300"/> Plan: {d.plan_no} {d.tower_no ? `| T:${d.tower_no}` : ''}
                                   </div>
                               </td>
                               <td className="py-2 px-4 align-middle">
                                   <div className="font-bold text-slate-700 leading-none mb-1">{d.deed_id || '-'}</div>
                                   <div className="text-[9px] text-slate-400 font-mono">Land: {d.land_no}</div>
                               </td>
                               <td className="py-2 px-4 text-right align-middle font-mono font-bold text-emerald-600">
                                   {(d.appraisal_land || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                               </td>
                               <td className="py-2 px-4 text-right align-middle font-mono font-bold text-blue-600">
                                   {(d.appraisal_building || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <Badge type="primary">{d.utility_code}</Badge>
                               </td>
                               <td className="py-2 px-4 text-center align-middle font-black text-indigo-700">
                                   {(d.tax_rate_percent || 0).toFixed(2)}%
                               </td>
                               <td className="py-2 px-4 text-center align-middle">
                                   <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEdit(d)} className="p-2 text-primary-600 hover:bg-white hover:shadow-md rounded-lg transition-all border border-transparent hover:border-primary-100"><Edit size={16}/></button>
                                       <button onClick={() => { if(confirm('ยืนยันลบข้อมูลปีนี้?')) api.deleteDeedBookYear(d.year_no, d.book_code).then(() => loadData(filterYear, filterProject)) }} className="p-2 text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
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
