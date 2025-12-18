
import React from 'react';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { UserPlus } from 'lucide-react';

export const WorkforceRequest = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800">
          <UserPlus size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary-900">{t('menu.workforce_request')}</h1>
          <p className="text-slate-500 text-sm">Manpower Request System</p>
        </div>
      </div>
      <Card>
        <div className="p-10 text-center text-slate-500">
          <p className="text-lg font-medium">Coming Soon</p>
          <p className="text-sm">Functionality under development.</p>
        </div>
      </Card>
    </div>
  );
};
