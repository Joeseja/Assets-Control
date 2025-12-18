
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SearchableSelect, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup, MasterType } from '../types';
import { Edit, Trash2, Plus, Save, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProjectType = () => {
    const { t } = useLanguage();
    const [groups, setGroups] = useState<MasterGroup[]>([]);
    const [types, setTypes] = useState<MasterType[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<MasterType>({
        product_group_code: '',
        product_type_code: '',
        description: '',
        is_status: 'Y'
    });
    const [editMode, setEditMode] = useState<'create'|'update'>('create');

    useEffect(() => {
        const init = async () => {
            const g = await api.getMasterGroups();
            setGroups(g);
            if (g.length > 0) setSelectedGroup(g[0].product_group_code);
        };
        init();
    }, []);

    useEffect(() => {
        if (selectedGroup) loadTypes();
    }, [selectedGroup]);

    const loadTypes = async () => {
        const data = await api.getMasterTypes(selectedGroup);
        setTypes(data);
    };

    const handleEdit = (item: MasterType) => {
        setForm(item);
        setEditMode('update');
        setIsEditing(true);
    };

    const handleDelete = async (tcode: string) => {
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMasterType(selectedGroup, tcode);
            loadTypes();
        } catch(e) { alert('Delete Failed'); }
    };

    const handleSave = async () => {
        if (!form.product_type_code) return alert('Code Required');
        try {
            await api.saveMasterType({...form, product_group_code: selectedGroup});
            setIsEditing(false);
            loadTypes();
        } catch(e) { alert('Save Failed'); }
    };

    if (isEditing) {
        return (
            <Card title={`${editMode === 'create' ? t('btn.add') : 'Edit'} Product Type (Group: ${selectedGroup})`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Type Code (PK)" value={form.product_type_code} onChange={e => setForm({...form, product_type_code: e.target.value})} disabled={editMode==='update'} />
                    <Input label="Description (Thai)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <Input label="Description (Eng)" value={form.desc_eng || ''} onChange={e => setForm({...form, desc_eng: e.target.value})} />
                    <Input label="Account Code" value={form.account_code || ''} onChange={e => setForm({...form, account_code: e.target.value})} />
                    <Input label="Cost %" type="number" value={form.cost_percent || 0} onChange={e => setForm({...form, cost_percent: Number(e.target.value)})} />
                    <Input label="Price %" type="number" value={form.price_percent || 0} onChange={e => setForm({...form, price_percent: Number(e.target.value)})} />
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
                <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2"><Database/> {t('menu.master_product_type')}</h1>
                <div className="w-64">
                    <SearchableSelect 
                        label="Filter by Group" 
                        options={groups.map(g => ({value: g.product_group_code, label: `${g.product_group_code}: ${g.description}`}))}
                        value={selectedGroup}
                        onChange={setSelectedGroup}
                    />
                </div>
            </div>
            
            <div className="flex justify-end">
                 <Button onClick={() => { setForm({product_group_code: selectedGroup, product_type_code:'', description:'', is_status:'Y'}); setEditMode('create'); setIsEditing(true); }}>
                    <Plus size={16}/> {t('btn.add')}
                </Button>
            </div>

            <Card>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 font-bold">
                        <tr><th className="p-3">Type Code</th><th className="p-3">Description</th><th className="p-3">Account</th><th className="p-3">Cost %</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr>
                    </thead>
                    <tbody>
                        {types.length === 0 ? <tr><td colSpan={6} className="p-4 text-center text-slate-400">No Data</td></tr> : 
                        types.map(t => (
                            <tr key={t.product_type_code} className="border-b hover:bg-slate-50">
                                <td className="p-3 font-mono font-bold">{t.product_type_code}</td>
                                <td className="p-3">
                                    <div>{t.description}</div>
                                    <div className="text-xs text-slate-400">{t.desc_eng}</div>
                                </td>
                                <td className="p-3">{t.account_code}</td>
                                <td className="p-3">{t.cost_percent}%</td>
                                <td className="p-3"><Badge type={t.is_status==='Y'?'success':'neutral'}>{t.is_status}</Badge></td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => handleEdit(t)} className="text-blue-600"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(t.product_type_code)} className="text-red-600"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
