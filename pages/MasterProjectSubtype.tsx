
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SearchableSelect, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup, MasterType, MasterSubtype } from '../types';
import { Edit, Trash2, Plus, Save, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProjectSubtype = () => {
    const { t } = useLanguage();
    
    // Filter State
    const [groups, setGroups] = useState<MasterGroup[]>([]);
    const [types, setTypes] = useState<MasterType[]>([]);
    const [subtypes, setSubtypes] = useState<MasterSubtype[]>([]);
    
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<MasterSubtype>({
        product_group_code: '',
        product_type_code: '',
        product_subtype_code: '',
        description: '',
        is_status: 'Y'
    });
    const [editMode, setEditMode] = useState<'create'|'update'>('create');

    // 1. Load Groups on Mount
    useEffect(() => {
        const init = async () => {
            const g = await api.getMasterGroups();
            setGroups(g);
            if (g.length > 0) setSelectedGroup(g[0].product_group_code);
        };
        init();
    }, []);

    // 2. Load Types when Group Changes
    useEffect(() => {
        const loadTypes = async () => {
            if (!selectedGroup) {
                setTypes([]); 
                return;
            }
            const t = await api.getMasterTypes(selectedGroup);
            setTypes(t);
            if (t.length > 0) setSelectedType(t[0].product_type_code);
            else setSelectedType('');
        };
        loadTypes();
    }, [selectedGroup]);

    // 3. Load Subtypes when Type Changes
    useEffect(() => {
        if (selectedGroup && selectedType) loadSubtypes();
        else setSubtypes([]);
    }, [selectedGroup, selectedType]);

    const loadSubtypes = async () => {
        const data = await api.getMasterSubtypes(selectedGroup, selectedType);
        setSubtypes(data);
    };

    const handleEdit = (item: MasterSubtype) => {
        setForm(item);
        setEditMode('update');
        setIsEditing(true);
    };

    const handleDelete = async (scode: string) => {
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMasterSubtype(selectedGroup, selectedType, scode);
            loadSubtypes();
        } catch(e) { alert('Delete Failed'); }
    };

    const handleSave = async () => {
        if (!form.product_subtype_code) return alert('Code Required');
        try {
            await api.saveMasterSubtype({...form, product_group_code: selectedGroup, product_type_code: selectedType});
            setIsEditing(false);
            loadSubtypes();
        } catch(e) { alert('Save Failed'); }
    };

    if (isEditing) {
        return (
            <Card title={`${editMode === 'create' ? t('btn.add') : 'Edit'} Subtype (G:${selectedGroup} / T:${selectedType})`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Subtype Code (PK)" value={form.product_subtype_code} onChange={e => setForm({...form, product_subtype_code: e.target.value})} disabled={editMode==='update'} />
                    <Input label="Description (Thai)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <Input label="Description (Eng)" value={form.desc_eng || ''} onChange={e => setForm({...form, desc_eng: e.target.value})} />
                    <Input label="IDP Code" value={form.idp_code || ''} onChange={e => setForm({...form, idp_code: e.target.value})} />
                    <div className="flex items-center gap-2 pt-6">
                        <input type="checkbox" checked={form.is_status === 'Y'} onChange={e => setForm({...form, is_status: e.target.checked ? 'Y' : 'N'})} className="w-5 h-5 accent-emerald-600"/>
                        <span>Active Status</span>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>{t('btn.cancel')}</Button>
                    <Button onClick={handleSave}><Save size={16}/> {t('btn.save')}</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2"><Database/> {t('menu.master_product_subtype')}</h1>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <SearchableSelect 
                    label="1. Select Group" 
                    options={groups.map(g => ({value: g.product_group_code, label: `${g.product_group_code}: ${g.description}`}))}
                    value={selectedGroup}
                    onChange={setSelectedGroup}
                />
                <SearchableSelect 
                    label="2. Select Type" 
                    options={types.map(t => ({value: t.product_type_code, label: `${t.product_type_code}: ${t.description}`}))}
                    value={selectedType}
                    onChange={setSelectedType}
                />
            </div>

            <div className="flex justify-end">
                 <Button onClick={() => { 
                     if(!selectedGroup || !selectedType) return alert('Please select Group and Type first');
                     setForm({product_group_code: selectedGroup, product_type_code: selectedType, product_subtype_code:'', description:'', is_status:'Y'}); 
                     setEditMode('create'); 
                     setIsEditing(true); 
                 }}>
                    <Plus size={16}/> {t('btn.add')}
                </Button>
            </div>

            <Card>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 font-bold">
                        <tr><th className="p-3">Subtype Code</th><th className="p-3">Description</th><th className="p-3">IDP Code</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr>
                    </thead>
                    <tbody>
                        {subtypes.length === 0 ? <tr><td colSpan={5} className="p-4 text-center text-slate-400">No Data</td></tr> : 
                        subtypes.map(s => (
                            <tr key={s.product_subtype_code} className="border-b hover:bg-slate-50">
                                <td className="p-3 font-mono font-bold">{s.product_subtype_code}</td>
                                <td className="p-3">
                                    <div>{s.description}</div>
                                    <div className="text-xs text-slate-400">{s.desc_eng}</div>
                                </td>
                                <td className="p-3">{s.idp_code}</td>
                                <td className="p-3"><Badge type={s.is_status==='Y'?'success':'neutral'}>{s.is_status}</Badge></td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => handleEdit(s)} className="text-blue-600"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(s.product_subtype_code)} className="text-red-600"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
