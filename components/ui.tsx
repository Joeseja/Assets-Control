
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Database, AlertTriangle } from 'lucide-react';

const DbLabel = ({ name }: { name?: string }) => {
  if (!name) return null;
  return <span className="ml-2 text-[10px] text-rose-400 font-mono tracking-tighter opacity-80 select-none">[{name}]</span>;
};

export const Badge: React.FC<{ children: React.ReactNode, type?: 'success' | 'neutral' | 'primary' | 'danger' | 'warning' }> = ({ children, type = 'neutral' }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    neutral: "bg-slate-50 text-slate-600 border-slate-200",
    primary: "bg-primary-50 text-primary-700 border-primary-200",
    danger: "bg-rose-50 text-rose-600 border-rose-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase border-2 tracking-widest ${styles[type]}`}>
      {children}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-200 transition-all hover:shadow-xl hover:border-slate-300 relative ${className}`}>
    {title && <div className="px-10 py-6 border-b border-slate-100 font-black text-xl text-primary-900 bg-slate-50/50 rounded-t-[2.5rem] uppercase tracking-tighter">{title}</div>}
    <div className="p-10">{children}</div>
  </div>
);

export const LoadingOverlay: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[11000] bg-[#020617]/40 backdrop-blur-[8px] flex items-center justify-center animate-in fade-in duration-500">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col items-center gap-8 border border-white ring-1 ring-slate-900/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-500/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none"></div>
        <div className="relative">
          <Loader2 className="animate-spin text-primary-900" size={80} strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-3 h-3 bg-primary-800 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-black uppercase tracking-[0.6em] text-primary-950">System Kernel Sync</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Initializing High-Frequency Data Stream</span>
        </div>
      </div>
    </div>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger', size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  const base = "rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-3 focus:ring-8 focus:ring-offset-4 disabled:opacity-40 disabled:cursor-not-allowed shadow-md active:scale-90 select-none uppercase tracking-widest";
  const sizeClasses = { sm: "px-6 py-3 text-[10px]", md: "px-8 py-4.5 text-xs", lg: "px-12 py-6 text-base" };
  const variants = {
    primary: "bg-[#003057] hover:bg-[#082038] text-white focus:ring-primary-100 shadow-primary-900/20", 
    secondary: "bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-800 shadow-xs hover:border-primary-400",
    danger: "bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200"
  };
  return <button className={`${base} ${variants[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, dbField?: string, icon?: React.ElementType }> = ({ label, dbField, icon: Icon, className = '', ...props }) => (
  <div className="flex flex-col space-y-3 w-full">
    {label && <label className="text-[11px] font-black text-slate-500 ml-2 uppercase tracking-[0.2em]">{label}<DbLabel name={dbField} /></label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-5 top-4.5 text-slate-400 group-focus-within:text-primary-700 transition-colors" size={20} />}
      <input 
        className={`w-full border-2 border-slate-100 rounded-[1.5rem] ${Icon ? 'pl-14 pr-6' : 'px-6'} py-4.5 bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500/50 text-slate-900 transition-all font-black placeholder:text-slate-300 shadow-inner ${className}`} 
        {...props} 
      />
    </div>
  </div>
);

export const SearchableSelect: React.FC<{
  label?: string; dbField?: string; options: {value: string, label: string}[]; value: string;
  onChange: (value: string) => void; placeholder?: string; disabled?: boolean; className?: string; freeText?: boolean;
}> = ({ label, dbField, options, value, onChange, placeholder, disabled, className = '', freeText = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const selected = options.find((o) => String(o.value) === String(value));
    setInputValue(selected ? selected.label : (freeText ? value : ''));
  }, [value, options, freeText]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    String(o.label || '').toLowerCase().includes(String(inputValue || '').toLowerCase()) ||
    String(o.value || '').toLowerCase().includes(String(inputValue || '').toLowerCase())
  );

  return (
    <div className={`flex flex-col space-y-3 relative ${isOpen ? 'z-[10000]' : 'z-auto'}`} ref={containerRef}>
      {label && <label className="text-[11px] font-black text-slate-500 ml-2 uppercase tracking-[0.2em]">{label}<DbLabel name={dbField} /></label>}
      <div className="relative group">
          <input
            type="text" className={`w-full border-2 border-slate-100 rounded-[1.5rem] px-6 py-4.5 focus:outline-none focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500/50 text-slate-900 ${disabled ? 'bg-slate-200 cursor-not-allowed opacity-50' : 'bg-slate-50/50'} transition-all font-black shadow-inner ${className}`}
            value={inputValue} onChange={e => { setInputValue(e.target.value); setIsOpen(true); if(freeText) onChange(e.target.value); }}
            onFocus={() => !disabled && setIsOpen(true)} placeholder={placeholder || "Initiate Node Selection..." } disabled={disabled}
          />
          <ChevronDown className={`absolute right-6 top-5 text-slate-400 pointer-events-none transition-transform duration-500 ${isOpen ? 'rotate-180 text-primary-700' : ''}`} size={22} />
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-[10001] top-[calc(100%+12px)] left-0 w-full bg-white border-2 border-slate-200 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.25)] max-h-96 overflow-y-auto ring-1 ring-black/5 animate-in fade-in slide-in-from-top-4 duration-400 custom-scrollbar">
            <div className="p-3 space-y-1.5">
            {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
              <div 
                key={opt.value} className={`px-6 py-5 text-sm cursor-pointer rounded-2xl transition-all ${String(opt.value) === String(value) ? 'bg-primary-900 text-white font-black shadow-lg scale-[1.03]' : 'text-slate-700 hover:bg-primary-50 hover:translate-x-2'}`}
                onClick={() => { onChange(opt.value); setInputValue(opt.label); setIsOpen(false); }}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate">{opt.label}</span>
                  <span className={`text-[10px] px-3 py-1 rounded-lg font-mono uppercase font-black ${String(opt.value) === String(value) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{opt.value}</span>
                </div>
              </div>
            )) : <div className="px-8 py-16 text-slate-400 flex flex-col items-center gap-4 grayscale"><AlertTriangle size={48} className="opacity-10"/><span className="text-xs font-black uppercase tracking-[0.4em]">Grid Query: Zero Results</span></div>}
            </div>
        </div>
      )}
    </div>
  );
};

export const Pagination: React.FC<{
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  useEffect(() => {
    if (currentPage > totalPages && totalItems > 0) onPageChange(totalPages);
    else if (currentPage < 1 && totalItems > 0) onPageChange(1);
  }, [totalItems, totalPages, currentPage, onPageChange]);

  if (totalItems === 0) return (
    <div className="border-t-4 border-slate-50 px-10 py-16 bg-slate-50/20 flex flex-col items-center justify-center gap-5 opacity-20 grayscale">
      <Database size={56} className="text-slate-400 animate-pulse" strokeWidth={1} />
      <span className="text-sm font-black text-slate-500 uppercase tracking-[1em]">Data Grid Exhausted</span>
    </div>
  );

  return (
    <div className="border-t-2 border-slate-100 px-10 py-7 bg-white/90 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-center gap-8 shrink-0 shadow-inner z-50">
        <div className="flex items-center gap-6">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)] animate-pulse"></div>
          <div className="text-[12px] text-slate-500 font-black uppercase tracking-[0.3em]">
              Mapped Node Index: <span className="text-primary-900 bg-primary-50 px-4 py-2 rounded-2xl border-2 border-primary-100/50">{totalItems > 0 ? indexOfFirstItem + 1 : 0} — {indexOfLastItem}</span> total record count <span className="text-slate-950 font-black">{totalItems}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-slate-100/80 p-3 rounded-[2rem] border-2 border-slate-200">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-4 rounded-2xl bg-white hover:bg-primary-950 hover:text-white text-slate-600 disabled:opacity-10 transition-all shadow-md active:scale-75"><ChevronsLeft size={24} /></button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-4 rounded-2xl bg-white hover:bg-primary-950 hover:text-white text-slate-600 disabled:opacity-10 transition-all shadow-md active:scale-75"><ChevronLeft size={24} /></button>
            
            <div className="flex items-center gap-5 px-8 py-3 bg-white rounded-2xl shadow-inner border-2 border-slate-100">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Index</span>
                <select 
                    value={currentPage} 
                    onChange={(e) => onPageChange(Number(e.target.value))}
                    className="h-10 text-[16px] font-black text-primary-950 border-none bg-primary-50/50 px-5 rounded-xl focus:ring-0 cursor-pointer outline-none transition-all hover:bg-primary-100"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <option key={pageNum} value={pageNum}>{pageNum}</option>
                    ))}
                </select>
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">/ {totalPages}</span>
            </div>

            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-4 rounded-2xl bg-white hover:bg-primary-950 hover:text-white text-slate-600 disabled:opacity-10 transition-all shadow-md active:scale-75"><ChevronRight size={24} /></button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-4 rounded-2xl bg-white hover:bg-primary-950 hover:text-white text-slate-600 disabled:opacity-10 transition-all shadow-md active:scale-75"><ChevronsRight size={24} /></button>
        </div>
    </div>
  );
};
