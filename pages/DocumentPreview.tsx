
import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '../components/ui';
import { ArrowLeft, Printer, Building2 } from 'lucide-react';
import { ReceiveHead, ReceiveDetail, SalesHead, SalesDetail } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/apiService';

interface DocumentPreviewProps {
  data: { id: string, type: 'RECEIVE' | 'SALES' } | null;
  onBack: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ data, onBack }) => {
  const { t } = useLanguage();
  const [doc, setDoc] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const load = async () => {
          if (!data) return;
          setLoading(true);
          try {
              if (data.type === 'RECEIVE') {
                  const headers = await api.getReceiveHeaders();
                  const foundHead = headers.find(h => h.receive_no === data.id);
                  if (foundHead) {
                      setDoc(foundHead);
                      const dtls = await api.getReceiveDetails(foundHead.receive_no);
                      setDetails(dtls);
                  }
              } else {
                  const headers = await api.getSalesHeaders();
                  // Fix: Property 'doc_no' does not exist on type 'BrwcHead'. Use 'brw_no'.
                  const foundHead = headers.find(h => h.brw_no === data.id);
                  if (foundHead) {
                      setDoc(foundHead);
                      // Fix: Property 'doc_no' does not exist on type 'BrwcHead'. Use 'brw_no'.
                      const dtls = await api.getSalesDetails(foundHead.brw_no);
                      setDetails(dtls);
                  }
              }
          } catch(e) { console.error(e); }
          finally { setLoading(false); }
      };
      load();
  }, [data]);

  if (!data || loading) return <div className="p-10 text-center">{t('loading')}</div>;
  if (!doc) return <div className="p-10 text-center text-rose-500">{t('prev.not_found')}</div>;

  const title = data.type === 'RECEIVE' ? t('prev.title_rec') : t('prev.title_sale');
  const typeLabel = data.type === 'RECEIVE' ? t('rec.receive_no') : t('sale.doc_no');

  const handlePrint = () => {
    window.print();
  };

  // Safe property access based on standardized snake_case or legacy if present
  // Fix: BrwcHead uses brw_date and brw_no instead of doc_date and doc_no
  const docDate = data.type === 'RECEIVE' ? doc.receive_date : (doc.brw_date || doc.doc_date);
  const docNo = data.type === 'RECEIVE' ? doc.receive_no : (doc.brw_no || doc.doc_no);
  const refNo = '-';
  const project = doc.project_code || '-';
  const company = doc.comp_code || '-';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={18} /> {t('btn.back')}
        </Button>
        <div className="flex space-x-2">
           <Button onClick={handlePrint} className="bg-primary-600 text-white">
             <Printer size={18} /> {t('btn.print')}
           </Button>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 shadow-lg min-h-[1000px] print:shadow-none print:p-0 print:w-full">
        <div className="border-b-2 border-primary-900 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
               <div className="text-primary-900"><Building2 size={48} /></div>
               <div>
                 <h1 className="text-2xl font-bold text-primary-900 uppercase">SENA Development PCL.</h1>
                 <p className="text-sm text-slate-500">System Generated Document</p>
               </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800">{title}</h2>
              <div className="mt-2 inline-block bg-primary-50 px-3 py-1 rounded border border-primary-100">
                 <span className="text-sm font-bold text-primary-800">{typeLabel}: {docNo}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm mb-8">
           <div>
             <div className="grid grid-cols-3 gap-2 mb-1"><span className="font-bold text-slate-600">{t('rec.company')}:</span><span className="col-span-2">{company}</span></div>
             <div className="grid grid-cols-3 gap-2 mb-1"><span className="font-bold text-slate-600">{t('rec.project')}:</span><span className="col-span-2">{project}</span></div>
           </div>
           <div>
             <div className="grid grid-cols-3 gap-2 mb-1"><span className="font-bold text-slate-600">{t('rec.date')}:</span><span className="col-span-2">{docDate}</span></div>
             <div className="grid grid-cols-3 gap-2 mb-1"><span className="font-bold">Ref Doc:</span><span className="col-span-2">{refNo}</span></div>
           </div>
        </div>

        <div className="mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-y border-slate-300">
                <th className="py-2 px-2 text-center w-12 border-x border-slate-200">#</th>
                <th className="py-2 px-4 text-left border-r border-slate-200">{t('rec.items')}</th>
                <th className="py-2 px-2 text-right w-20 border-r border-slate-200">{t('dash.qty')}</th>
                <th className="py-2 px-2 text-right w-24 border-r border-slate-200">{t('rec.price')}</th>
                <th className="py-2 px-2 text-right w-28 border-r border-slate-200">{t('rec.total')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {details.map((d: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="py-2 px-2 text-center border-x border-slate-200">{idx + 1}</td>
                    <td className="py-2 px-4 border-r border-slate-200">
                      <div className="font-bold">{d.product_code || '-'}</div>
                      <div>{d.product_name || d.productName}</div>
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200">{d.total_qty || d.qty}</td>
                    <td className="py-2 px-2 text-right border-r border-slate-200">{d.price?.toLocaleString() || d.unitPrice?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 font-bold">{d.total_amount?.toLocaleString() || d.totalPrice?.toLocaleString()}</td>
                  </tr>
              ))}
            </tbody>
            <tfoot>
               <tr className="bg-slate-50 font-bold border-y border-slate-300">
                 <td colSpan={4} className="py-2 px-4 text-right text-slate-800 border-x border-slate-200">Total</td>
                 <td className="py-2 px-2 text-right text-slate-900 border-r border-slate-200 text-lg">
                   {details.reduce((acc: number, item: any) => acc + (item.total_amount || item.totalPrice || 0), 0).toLocaleString()}
                 </td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};