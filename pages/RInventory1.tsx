
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import { api } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, Search } from 'lucide-react';

export const Inventory = () => {
  const { t } = useLanguage();
  const [stockBalance, setStockBalance] = useState<{name: string, code: string, qty: number, type: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
     const loadData = async () => {
         setLoading(true);
         try {
             const [rDetails, rHeads, sDetails, sHeads] = await Promise.all([
                 api.getReceiveDetails(),
                 api.getReceiveHeaders(),
                 api.getSalesDetails(),
                 api.getSalesHeaders()
             ]);

             const productMap = new Map<string, number>();
             const nameMap = new Map<string, string>();
             
             // Inbound
             rDetails.forEach(d => {
                 const h = rHeads?.find(x => x.receive_no === d.receive_no);
                 if (h && h.is_status !== 'CANCELLED') {
                    const cur = productMap.get(d.product_code) || 0;
                    productMap.set(d.product_code, cur + d.total_qty);
                    nameMap.set(d.product_code, d.product_name || d.product_code);
                 }
             });

             // Outbound
             // Fix: Property 'doc_no' does not exist on type 'BrwcHead' or 'BrwcDetail'. Use 'brw_no'.
             sDetails.forEach(d => {
                 const h = sHeads?.find(x => x.brw_no === d.brw_no);
                 if (h && h.is_status === 'ACTIVE') {
                    const cur = productMap.get(d.product_code || '') || 0;
                    productMap.set(d.product_code || '', cur - d.qty);
                 }
             });

             const balance = Array.from(productMap.entries()).map(([code, qty]) => ({
                 code: code,
                 name: nameMap.get(code) || code,
                 qty: qty,
                 type: 'Material'
             }));
             
             setStockBalance(balance);
         } catch(e) { 
             console.error("Inventory Load Error:", e); 
         } finally {
             setLoading(false);
         }
     };
     loadData();
  }, []);

  const filteredData = stockBalance.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3">
               <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg"><FileText size={24}/></div>
               <h1 className="text-2xl font-bold text-primary-900">{t('report.balance')}</h1>
           </div>
           <div className="relative">
               <input 
                 className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64" 
                 placeholder="Search product..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>
           </div>
       </div>

       <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-primary-50 text-primary-900 font-bold border-b border-primary-100">
                 <tr>
                     <th className="p-4 w-40">Code</th>
                     <th className="p-4">{t('report.col_name')}</th>
                     <th className="p-4 w-32 text-center">Type</th>
                     <th className="p-4 text-right w-40">{t('report.col_balance')}</th>
                 </tr>
               </thead>
               <tbody>
                  {loading ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">{t('loading')}</td></tr>
                  ) : filteredData.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">{t('msg.no_data')}</td></tr>
                  ) : (
                      filteredData.map((s, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-600">{s.code}</td>
                          <td className="p-4 font-medium text-slate-800">{s.name}</td>
                          <td className="p-4 text-center"><span className="px-2 py-1 rounded bg-slate-100 text-xs font-bold text-slate-500">{s.type}</span></td>
                          <td className={`p-4 text-right font-bold text-lg ${s.qty < 5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {s.qty.toLocaleString()}
                          </td>
                        </tr>
                      ))
                  )}
               </tbody>
             </table>
          </div>
       </Card>
    </div>
  )
}