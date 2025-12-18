
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import { api } from '../services/apiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Package, Archive, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { DashboardSummary, MovementItem, StockBalanceItem } from '../types';

export const Dashboard = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<DashboardSummary>({ totalInventory: 0, transactionCount: 0, lowStockCount: 0 });
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [stockBalance, setStockBalance] = useState<StockBalanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
        const [sumRes, movRes, balRes] = await Promise.all([
            api.getDashboardSummary(),
            api.getDashboardMovements(),
            api.getInventoryBalance()
        ]);
        setSummary(sumRes);
        setMovements(movRes);
        setStockBalance(balRes);
    } catch(e) {
        console.error("Dashboard Load Error", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
    <Card className="flex items-center space-x-4 border-l-4 border-l-primary-800 transition-all hover:shadow-md">
      <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} shadow-inner`}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-primary-900 tabular-nums">
            {loading ? <RefreshCw className="animate-spin text-slate-300" size={20}/> : value.toLocaleString()}
        </h3>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 w-full h-full animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t('dash.total_inventory')} value={summary.totalInventory} icon={Package} bgClass="bg-primary-50" colorClass="text-primary-600" />
        <StatCard title={t('dash.total_trans')} value={summary.transactionCount} icon={TrendingUp} bgClass="bg-accent-50" colorClass="text-accent-600" />
        <StatCard title={t('dash.low_stock')} value={summary.lowStockCount} icon={Archive} bgClass="bg-amber-50" colorClass="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dash.stock_balance')} className="h-[400px] border-0 shadow-xl rounded-2xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockBalance.slice(0, 10)} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="qty" fill="#003057" radius={[0, 10, 10, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t('dash.movement')} className="h-[400px] border-0 shadow-xl rounded-2xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={movements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="balance" stroke="#CF0A6D" strokeWidth={4} dot={{r:4, fill:'#CF0A6D', strokeWidth:2, stroke:'#fff'}} activeDot={{r:8}} name="Running Balance" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};
