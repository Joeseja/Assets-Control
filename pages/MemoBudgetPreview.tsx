
import React from 'react';
import { MemoBudgetHead, MemoBudgetCompany, MemoBudgetProject, MemoBudgetBgCode, StaffItem, CompanyItem, ProjectItem } from '../types';
import { X, Printer, CheckCircle } from 'lucide-react';

interface MemoBudgetPreviewProps {
    head: MemoBudgetHead;
    companies: MemoBudgetCompany[];
    projects: MemoBudgetProject[];
    bgcodes: MemoBudgetBgCode[];
    masterCompanies: CompanyItem[];
    masterProjects: ProjectItem[];
    staffList: StaffItem[];
    onClose: () => void;
}

export const MemoBudgetPreview: React.FC<MemoBudgetPreviewProps> = ({ 
    head, companies, projects, bgcodes, masterCompanies, masterProjects, staffList, onClose 
}) => {

    const f_tr_get_login_name = (code: string | undefined): string => {
        if (!code) return "";
        const staff = staffList.find(s => s.staff_code === code);
        return staff ? `(${code}) ${staff.staff_name}` : `(${code})`;
    };

    const getCompanyName = (code: string) => {
        const c = masterCompanies.find(x => x.comp_code === code);
        return c ? c.comp_name : code;
    };

    const getProjectName = (code: string) => {
        const p = masterProjects.find(x => x.project_code === code);
        return p ? p.description : code;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-800/80 backdrop-blur-sm flex justify-center overflow-y-auto p-4 md:p-8">
            <div className="relative bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl rounded-sm flex flex-col">
                
                {/* Print Toolbar */}
                <div className="print:hidden flex justify-between items-center bg-slate-900 text-white p-4 sticky top-0 z-10">
                    <h2 className="font-bold text-lg">Print Preview</h2>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded text-sm font-bold transition-colors">
                            <Printer size={18} /> Print
                        </button>
                        <button onClick={onClose} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-bold transition-colors">
                            <X size={18} /> Close
                        </button>
                    </div>
                </div>

                {/* A4 Content */}
                <div className="p-[15mm] text-slate-900 flex-1 relative font-sans text-sm leading-relaxed">
                    
                    {/* Stamp */}
                    {(head.is_approve === 'Y' || head.is_vp === 'Y') && (
                        <div className="absolute top-[150px] right-[50px] border-[5px] border-emerald-600 text-emerald-600 font-black text-6xl px-4 py-2 opacity-70 -rotate-12 select-none pointer-events-none z-0">
                            APPROVED
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-xl font-bold border-2 border-primary-900 py-3 px-6 inline-block rounded">
                            แบบคำขออนุมัติเปิดสิทธิ์การใช้งานบริษัท/โครงการ/รหัสงบประมาณ ระบบ RMS
                        </h1>
                    </div>

                    {/* Info */}
                    <div className="flex justify-between mb-6">
                        <div className="space-y-2 w-2/3">
                            <div className="flex"><span className="w-32 font-bold">เรียน</span> <span>ฝ่ายงบประมาณ</span></div>
                            <div className="flex"><span className="w-32 font-bold">ผู้จัดทำเอกสาร</span> <span>{f_tr_get_login_name(head.staff_code)}</span></div>
                            <div className="flex"><span className="w-32 font-bold">ฝ่าย</span> <span>{head.department_code || '-'}</span></div>
                            <div className="flex"><span className="w-32 font-bold">เบอร์ติดต่อ</span> <span>-</span></div>
                        </div>
                        <div className="space-y-2 w-1/3 text-right">
                            <div className="flex justify-end"><span className="font-bold mr-2">เลขที่เอกสาร:</span> <span>{head.memo_no}</span></div>
                            <div className="flex justify-end"><span className="font-bold mr-2">วันที่เอกสาร:</span> <span>{formatDate(head.memo_date)}</span></div>
                            <div className="flex justify-end"><span className="font-bold mr-2">เปิดสิทธิ์บริษัท:</span> <span>{companies.length > 0 ? companies[0].comp_code : '-'}</span></div>
                        </div>
                    </div>

                    <hr className="border-t-2 border-slate-800 mb-6" />

                    {/* Requester Info */}
                    <div className="mb-6 relative z-10">
                        <div className="flex mb-2">
                            <span className="w-32 font-bold">ชื่อผู้ขอเปิดสิทธิ์</span>
                            <span className="font-medium text-lg border-b border-dotted border-slate-400 min-w-[300px]">
                                {f_tr_get_login_name(head.memo_staff_code)}
                            </span>
                        </div>
                        <div className="flex mb-4">
                            <div className="flex mr-8">
                                <span className="w-32 font-bold">ตำแหน่ง</span>
                                <span>-</span>
                            </div>
                            <div className="flex">
                                <span className="w-16 font-bold">ฝ่าย</span>
                                <span>{head.department_code}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 border-2 border-slate-600 flex items-center justify-center ${head.is_first === '1' ? 'bg-slate-800' : ''}`}>
                                    {head.is_first === '1' && <CheckCircle size={14} className="text-white"/>}
                                </div>
                                <span>ขอสิทธิ์การใช้งานครั้งแรก</span>
                                <span className="font-bold ml-4">E Mail</span>
                                <span className="underline">{head.user_rms || '-'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className={`w-5 h-5 border-2 border-slate-600 flex items-center justify-center ${head.is_first === '2' ? 'bg-slate-800' : ''}`}>
                                {head.is_first === '2' && <CheckCircle size={14} className="text-white"/>}
                             </div>
                             <span>มีสิทธิ์การใช้งานอยู่แล้ว</span>
                             <span className="font-bold ml-8">ชื่อผู้เข้าระบบ</span>
                             <span className="border-b border-dotted border-slate-400 min-w-[150px]">{head.user_rms}</span>
                        </div>
                    </div>

                    {/* Lists Section */}
                    <div className="space-y-6 mb-8">
                        <div>
                            <h3 className="font-bold underline mb-2">ขอเพิ่มสิทธิ์บริษัท</h3>
                            <div className="pl-8 text-sm">
                                {companies.map((c, idx) => (
                                    <div key={idx} className="mb-1">
                                        ({c.comp_code}) {getCompanyName(c.comp_code)} /
                                    </div>
                                ))}
                                {companies.length === 0 && <div className="text-slate-400 italic">- ไม่มีรายการ -</div>}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold underline mb-2">ขอเพิ่มสิทธิ์โครงการ</h3>
                            <div className="pl-8 text-sm">
                                {projects.map((p, idx) => (
                                    <div key={idx} className="mb-1">
                                        ({p.project_code}) {getProjectName(p.project_code)} /
                                    </div>
                                ))}
                                {projects.length === 0 && <div className="text-slate-400 italic">- ไม่มีรายการ -</div>}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold underline mb-2">ขอเพิ่มสิทธิ์รหัสงบประมาณ</h3>
                            <div className="pl-8 text-sm flex flex-wrap gap-2">
                                {bgcodes.map((b, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-100 rounded border border-slate-300">
                                        {b.budget_code}
                                    </span>
                                ))}
                                {bgcodes.length === 0 && <div className="text-slate-400 italic">- ไม่มีรายการ -</div>}
                            </div>
                        </div>
                    </div>

                    <hr className="border-t-2 border-slate-800 mb-6" />

                    {/* Remark */}
                    <div className="mb-12">
                        <div className="flex items-start">
                            <span className="font-bold w-24 shrink-0">หมายเหตุ</span>
                            <p className="text-sm leading-relaxed">{head.remark || "-"}</p>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between items-end mt-auto pt-10 px-10">
                        {/* 3. Left Signature: Requester */}
                        <div className="text-center w-64">
                            <div className="font-bold mb-8">ผู้ขอใช้งาน</div>
                            <div className="border-t border-dashed border-slate-400 w-full mx-auto mb-2"></div>
                            <div className="text-sm mb-1">{f_tr_get_login_name(head.memo_staff_code)}</div>
                            <div className="text-xs text-slate-500">ผู้ช่วยหัวหน้าแผนก</div>
                            <div className="text-xs mt-2">{formatDate(head.memo_date)}</div>
                        </div>

                        {/* 4. Right Signature: VP/AVP/Mg (vp_code) */}
                        <div className="text-center w-64">
                            <div className="font-bold mb-8">VP/AVP/Mg อนุมัติ</div>
                            <div className="border-t border-dashed border-slate-400 w-full mx-auto mb-2"></div>
                            <div className="text-sm mb-1">
                                {/* Use vp_code if available, otherwise approve_code */}
                                {f_tr_get_login_name(head.vp_code || head.approve_code)}
                            </div>
                            <div className="text-xs text-slate-500">ผู้จัดการอาวุโส</div>
                            <div className="text-xs mt-2">{formatDate(head.memo_date)}</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
