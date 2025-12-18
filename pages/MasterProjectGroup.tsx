
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../components/ui';
import { api } from '../services/apiService';
import { MasterGroup } from '../types';
import { Edit, Trash2, Plus, Save, X, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MasterProjectGroup = () => {
    const { t } = useLanguage();
    const [groups, setGroups] = useState<MasterGroup[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<MasterGroup>({
        product_group_code: '',
        description: '',
        is_status: 'Y'
    });
    const [editMode, setEditMode] = useState<'create'|'update'>('create');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await api.getMasterGroups();
        setGroups(data);
    };

    const handleEdit = (item: MasterGroup) => {
        setForm(item);
        setEditMode('update');
        setIsEditing(true);
    };

    const handleDelete = async (code: string) => {
        if (!confirm(t('msg.confirm_delete'))) return;
        try {
            await api.deleteMasterGroup(code);
            loadData();
        } catch(e) { alert('Delete Failed'); }
    };

    const handleSave = async () => {
        if (!form.product_group_code) return alert('Code Required');
        try {
            await api.saveMasterGroup(form);
            setIsEditing(false);
            loadData();
        } catch(e) { alert('Save Failed'); }
    };

    if (isEditing) {
        return (
            <Card title={`${editMode === 'create' ? t('btn.add') : 'Edit'} Product Group`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Group Code (PK)" value={form.product_group_code} onChange={e => setForm({...form, product_group_code: e.target.value})} disabled={editMode==='update'} />
                    <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
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
                <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2"><Database/> {t('menu.master_product_group')}</h1>
                <Button onClick={() => { setForm({product_group_code:'', description:'', is_status:'Y'}); setEditMode('create'); setIsEditing(true); }}>
                    <Plus size={16}/> {t('btn.add')}
                </Button>
            </div>
            <Card>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 font-bold">
                        <tr><th className="p-3">Code</th><th className="p-3">Description</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr>
                    </thead>
                    <tbody>
                        {groups.map(g => (
                            <tr key={g.product_group_code} className="border-b hover:bg-slate-50">
                                <td className="p-3 font-mono font-bold">{g.product_group_code}</td>
                                <td className="p-3">{g.description}</td>
                                <td className="p-3"><Badge type={g.is_status==='Y'?'success':'neutral'}>{g.is_status}</Badge></td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => handleEdit(g)} className="text-blue-600"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(g.product_group_code)} className="text-red-600"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
