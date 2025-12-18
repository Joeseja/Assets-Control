
import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui';
import { api } from '../services/apiService';
import { SystemNode, XUser } from '../types';
import { Folder, File, CheckSquare, Square, Save, Shield, User, Database, Trash2, Edit, List } from 'lucide-react';

interface ProgramItem { pid: string; name: string; pgid: string; pgname?: string; }

export const SystemAdmin = () => {
    const [activeTab, setActiveTab] = useState<'STRUCTURE' | 'PERMISSION' | 'PROGRAMS'>('PROGRAMS');
    const [isLoading, setIsLoading] = useState(false);

    // Permission State
    const [users, setUsers] = useState<XUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [menuStructure, setMenuStructure] = useState<SystemNode[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

    // Program Master State
    const [programs, setPrograms] = useState<ProgramItem[]>([]);
    const [programGroups, setProgramGroups] = useState<{pgid: string, name: string}[]>([]);
    const [progForm, setProgForm] = useState<{pid: string, name: string, pgid: string}>({pid: '', name: '', pgid: ''});
    const [isEditingProg, setIsEditingProg] = useState(false);
    const [progSearch, setProgSearch] = useState('');

    useEffect(() => { loadCommonData(); }, []);
    useEffect(() => { if (activeTab === 'PERMISSION' && selectedUser) loadUserPermissions(selectedUser); }, [activeTab, selectedUser]);
    useEffect(() => { if (activeTab === 'PROGRAMS') loadProgramData(); }, [activeTab]);

    const loadCommonData = async () => {
        try {
            setUsers(await api.getUsersList());
            setMenuStructure(await api.getMenuStructure());
        } catch (e) { console.error(e); }
    };

    const loadProgramData = async () => {
        try {
            setPrograms(await api.getAllPrograms() || []);
            setProgramGroups(await api.getAllProgramGroups() || []);
        } catch (e) { console.error(e); }
    };

    const loadUserPermissions = async (usrid: string) => {
        setIsLoading(true);
        try { setSelectedPermissions(new Set(await api.getUserGrants(usrid))); } catch (e) { setSelectedPermissions(new Set()); }
        setIsLoading(false);
    };

    const handleSavePermissions = async () => {
        if (!selectedUser) return;
        setIsLoading(true);
        try {
            await api.saveUserGrants({ usrid: selectedUser, pids: Array.from(selectedPermissions) });
            alert('Permissions saved successfully!');
        } catch (e) { alert('Failed to save permissions'); }
        setIsLoading(false);
    };

    const togglePermission = (pid: string) => {
        const newSet = new Set(selectedPermissions);
        if (newSet.has(pid)) newSet.delete(pid); else newSet.add(pid);
        setSelectedPermissions(newSet);
    };

    const handleSaveProgram = async () => {
        if (!progForm.pid || !progForm.name || !progForm.pgid) return alert("All fields are required");
        try {
            await api.saveProgram(progForm);
            setIsEditingProg(false);
            setProgForm({pid: '', name: '', pgid: ''});
            loadProgramData();
            loadCommonData(); 
        } catch(e) { alert("Save failed"); }
    };

    const handleDeleteProgram = async (pid: string) => {
        if (!confirm(`Delete program ${pid}?`)) return;
        try { await api.deleteProgram(pid); loadProgramData(); } catch(e) { alert("Delete failed"); }
    };

    const handleEditProgram = (p: ProgramItem) => {
        setProgForm({ pid: p.pid, name: p.name, pgid: p.pgid });
        setIsEditingProg(true);
    };

    const filteredPrograms = programs.filter(p => p.pid.toLowerCase().includes(progSearch.toLowerCase()) || p.name.toLowerCase().includes(progSearch.toLowerCase()));

    return (
        <div className="space-y-6 h-full flex flex-col pb-20">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg"><Shield size={24} /></div>
                    <div><h1 className="text-xl font-bold text-primary-900">System Administration</h1><p className="text-xs text-slate-500">Manage Menus, Programs & Permissions</p></div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('PROGRAMS')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'PROGRAMS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><Database size={16}/> Program Register</button>
                    <button onClick={() => setActiveTab('PERMISSION')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'PERMISSION' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><User size={16}/> User Permission</button>
                    <button onClick={() => setActiveTab('STRUCTURE')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'STRUCTURE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><List size={16}/> Menu Structure</button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'PROGRAMS' && (
                    <div className="h-full flex gap-4">
                        <div className="w-1/3 flex flex-col gap-4">
                            <Card title={isEditingProg ? "Edit Program" : "Add New Program"}>
                                <div className="space-y-4">
                                    <Input label="Program Code (PID)" value={progForm.pid} onChange={e => setProgForm({...progForm, pid: e.target.value})} disabled={isEditingProg} placeholder="e.g. master-product"/>
                                    <Input label="Program Name / Field" value={progForm.name} onChange={e => setProgForm({...progForm, name: e.target.value})} placeholder="e.g. Product Master"/>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600 ml-1 mb-1 block">Group (PGID)</label>
                                        <select className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={progForm.pgid} onChange={e => setProgForm({...progForm, pgid: e.target.value})}>
                                            <option value="">-- Select Group --</option>
                                            {programGroups.map(g => (<option key={g.pgid} value={g.pgid}>{g.name} ({g.pgid})</option>))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        {isEditingProg && <Button variant="secondary" onClick={() => { setIsEditingProg(false); setProgForm({pid:'', name:'', pgid:''}); }}>Cancel</Button>}
                                        <Button onClick={handleSaveProgram} className="bg-indigo-600 hover:bg-indigo-700 text-white"><Save size={16}/> Save</Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="w-2/3 flex flex-col">
                            <Card className="flex-1 flex flex-col overflow-hidden p-0">
                                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Database size={18}/> All Programs</h3>
                                    <input className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-64" placeholder="Search Program..." value={progSearch} onChange={e => setProgSearch(e.target.value)}/>
                                </div>
                                <div className="flex-1 overflow-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 font-bold sticky top-0 shadow-sm"><tr><th className="p-3 w-40">Code (PID)</th><th className="p-3">Field / Name</th><th className="p-3 w-40">Group</th><th className="p-3 w-20 text-center">Action</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredPrograms.map(p => (
                                                <tr key={p.pid} className="hover:bg-slate-50">
                                                    <td className="p-3 font-mono font-bold text-indigo-700">{p.pid}</td><td className="p-3">{p.name}</td>
                                                    <td className="p-3 text-xs text-slate-500"><span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{p.pgname || p.pgid}</span></td>
                                                    <td className="p-3 text-center flex justify-center gap-2">
                                                        <button onClick={() => handleEditProgram(p)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><Edit size={16}/></button>
                                                        <button onClick={() => handleDeleteProgram(p.pid)} className="text-rose-600 hover:bg-rose-50 p-1 rounded"><Trash2 size={16}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
                {activeTab === 'STRUCTURE' && (
                    <Card className="h-full overflow-auto custom-scrollbar">
                        <div className="space-y-6">
                            {menuStructure.map(sys => (
                                <div key={sys.sid} className="border border-slate-200 rounded-lg overflow-hidden">
                                    <div className="bg-slate-100 p-3 font-bold flex items-center gap-2 border-b border-slate-200"><Folder className="text-amber-500" size={20}/> {sys.name}</div>
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/30">
                                        {sys.groups.map(grp => (
                                            <div key={grp.pgid} className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                                <h4 className="font-bold text-sm text-indigo-700 mb-2 border-b pb-1 flex items-center gap-2"><Folder size={14}/> {grp.name}</h4>
                                                <ul className="space-y-1">{grp.programs.map(prog => (<li key={prog.pid} className="text-xs text-slate-600 flex items-center gap-2 p-1 hover:bg-slate-50 rounded"><File size={12} className="text-slate-400"/><span className="font-medium text-slate-800">{prog.name}</span><span className="text-[10px] text-slate-400 ml-auto font-mono">{prog.pid}</span></li>))}</ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
                {activeTab === 'PERMISSION' && (
                    <div className="h-full flex gap-6">
                        <div className="w-1/4 flex flex-col gap-4">
                            <Card className="flex-1 flex flex-col p-0 overflow-hidden">
                                <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-700">Select User</div>
                                <div className="overflow-auto flex-1 p-2 space-y-1">
                                    {users.map(u => (
                                        <button key={u.usrid} onClick={() => setSelectedUser(u.usrid)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${selectedUser === u.usrid ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedUser === u.usrid ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>{u.login.charAt(0).toUpperCase()}</div>
                                            <div><div className="font-bold">{u.user_name}</div><div className={`text-xs ${selectedUser === u.usrid ? 'text-indigo-200' : 'text-slate-400'}`}>@{u.login}</div></div>
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </div>
                        <div className="w-3/4 flex flex-col">
                            <Card className="flex-1 flex flex-col p-0 overflow-hidden relative">
                                {!selectedUser ? <div className="flex-1 flex items-center justify-center text-slate-400">Select a user to manage permissions</div> : (
                                    <>
                                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                                            <h3 className="font-bold text-indigo-900">Manage Permissions: <span className="text-indigo-600">{users.find(u=>u.usrid===selectedUser)?.user_name}</span></h3>
                                            <Button onClick={handleSavePermissions} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white"><Save size={16}/> Save Changes</Button>
                                        </div>
                                        <div className="flex-1 overflow-auto p-6 space-y-8 custom-scrollbar">
                                            {menuStructure.map(sys => (
                                                <div key={sys.sid}>
                                                    <h4 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-200 pb-2">{sys.name}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {sys.groups.map(grp => (
                                                            <div key={grp.pgid} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                                <h5 className="font-bold text-sm text-indigo-600 mb-3 flex items-center gap-2"><Folder size={16}/> {grp.name}</h5>
                                                                <div className="space-y-2">
                                                                    {grp.programs.map(prog => {
                                                                        const isChecked = selectedPermissions.has(prog.pid);
                                                                        return (
                                                                            <div key={prog.pid} onClick={() => togglePermission(prog.pid)} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border transition-all ${isChecked ? 'bg-indigo-50 border-indigo-200' : 'bg-transparent border-transparent hover:bg-slate-50'}`}>
                                                                                <div className={`text-indigo-600 transition-transform ${isChecked ? 'scale-110' : 'opacity-30'}`}>{isChecked ? <CheckSquare size={18} /> : <Square size={18} />}</div>
                                                                                <div><div className={`text-sm font-medium ${isChecked ? 'text-indigo-900' : 'text-slate-600'}`}>{prog.name}</div><div className="text-[10px] text-slate-400 font-mono">{prog.pid}</div></div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
