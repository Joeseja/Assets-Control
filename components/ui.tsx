
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const DbLabel = ({ name }: { name?: string }) => {
  if (!name) return null;
  return <span className="ml-2 text-[10px] text-rose-400 font-mono tracking-tighter opacity-80 select-none">[{name}]</span>;
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {title && <div className="px-6 py-4 border-b border-slate-100 font-bold text-lg text-primary-800 bg-slate-50/50 rounded-t-xl">{title}</div>}
    <div className="p-6">{children}</div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger', size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  const base = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95";
  const sizeClasses = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5", lg: "px-6 py-3 text-lg" };
  const variants = {
    primary: "bg-primary-800 hover:bg-primary-900 text-white focus:ring-primary-300", 
    secondary: "bg-white border border-slate-300 hover:bg-slate-50 text-slate-700",
    danger: "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
  };
  return <button className={`${base} ${variants[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, dbField?: string, icon?: React.ElementType }> = ({ label, dbField, icon: Icon, className = '', ...props }) => (
  <div className="flex flex-col space-y-1.5 w-full">
    {label && <label className="text-sm font-semibold text-slate-600 ml-1">{label}<DbLabel name={dbField} /></label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" size={16} />}
      <input 
        className={`w-full border border-slate-300 rounded-lg ${Icon ? 'pl-10 pr-4' : 'px-4'} py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 transition-all ${className}`} 
        {...props} 
      />
    </div>
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, dbField?: string, options: {value: string, label: string}[] }> = ({ label, dbField, options, className = '', ...props }) => (
  <div className="flex flex-col space-y-1.5">
    {label && <label className="text-sm font-semibold text-slate-600 ml-1">{label}<DbLabel name={dbField} /></label>}
    <div className="relative">
      <select className={`w-full border border-slate-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 cursor-pointer appearance-none ${className}`} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
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
    const selected = options.find((o) => o.value === value);
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
    <div className="flex flex-col space-y-1.5 relative" ref={containerRef}>
      {label && <label className="text-sm font-semibold text-slate-600 ml-1">{label}<DbLabel name={dbField} /></label>}
      <div className="relative">
          <input
            type="text" className={`w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/30 text-slate-800 ${disabled ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'} ${className}`}
            value={inputValue} onChange={e => { setInputValue(e.target.value); setIsOpen(true); if(freeText) onChange(e.target.value); }}
            onFocus={() => !disabled && setIsOpen(true)} placeholder={placeholder || "Search..."} disabled={disabled}
          />
          <ChevronDown className={`absolute right-3 top-2.5 text-slate-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-[9999] top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto ring-1 ring-black/5">
            {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
              <div 
                key={opt.value} className={`px-4 py-2 text-sm cursor-pointer hover:bg-primary-50 transition-colors ${opt.value === value ? 'bg-primary-100 text-primary-900 font-bold' : 'text-slate-700'}`}
                onClick={() => { onChange(opt.value); setInputValue(opt.label); setIsOpen(false); }}
              >
                {opt.label} <span className="text-[10px] text-slate-400 ml-1">({opt.value})</span>
              </div>
            )) : <div className="px-4 py-2 text-sm text-slate-400 italic">No data found</div>}
        </div>
      )}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode, type?: 'success' | 'warning' | 'error' | 'neutral' | 'primary' }> = ({ children, type = 'neutral' }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-rose-50 text-rose-700 border-rose-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-200",
    primary: "bg-primary-50 text-primary-700 border-primary-200"
  };
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${styles[type]}`}>{children}</span>;
}

// Optimized Global Pagination Component
export const Pagination: React.FC<{
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="border-t border-slate-200 px-3 py-2 bg-slate-50 flex justify-between items-center shrink-0 shadow-sm z-20">
        <div className="text-[11px] text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{totalItems > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-slate-700">{indexOfLastItem}</span> of <span className="font-bold text-slate-700">{totalItems}</span> entries
        </div>
        
        <div className="flex items-center space-x-1">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-500" title="First Page"><ChevronsLeft size={14} /></button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-500" title="Previous Page"><ChevronLeft size={14} /></button>
            
            <div className="flex items-center space-x-2 px-2 border-l border-r border-slate-200 mx-1">
                <span className="text-[11px] text-slate-500 font-medium">Page</span>
                <select 
                    value={currentPage} 
                    onChange={(e) => onPageChange(Number(e.target.value))}
                    className="h-6 text-[11px] border border-slate-300 rounded px-1 bg-white focus:outline-none font-bold text-primary-700 cursor-pointer shadow-sm min-w-[50px]"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <option key={pageNum} value={pageNum}>{pageNum}</option>
                    ))}
                </select>
                <span className="text-[11px] text-slate-500 font-medium">of {totalPages}</span>
            </div>

            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-500" title="Next Page"><ChevronRight size={14} /></button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-500" title="Last Page"><ChevronsRight size={14} /></button>
        </div>
    </div>
  );
};
