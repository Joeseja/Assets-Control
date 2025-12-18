
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Receiving } from './pages/Receiving';
import { Sales } from './pages/Sales';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { DocumentPreview } from './pages/DocumentPreview';
import { MasterCompany } from './pages/MasterCompany';
import { MasterProductGroup } from './pages/MasterProductGroup';
import { MasterProductType } from './pages/MasterProductType';
import { MasterProductSubtype } from './pages/MasterProductSubtype';
import { MasterProduct } from './pages/MasterProduct';
import { MasterProject } from './pages/MasterProject'; 
import { MasterSupplier } from './pages/MasterSupplier';
import { MasterStaff } from './pages/MasterStaff';
import { MemoBudgetRequest } from './pages/MemoBudgetRequest';
import { MemoItRentalRequest } from './pages/MemoItRentalRequest';
import { ReceiveAssetConstruction } from './pages/ReceiveAssetConstruction'; 
import { WorkforcePlanning } from './pages/WorkforcePlanning';
import { WorkforceRequest } from './pages/WorkforceRequest';
import { WorkforceResignation } from './pages/WorkforceResignation';
import { SystemAdmin } from './pages/SystemAdmin';
import { Inventory } from './pages/Inventory';
import { AssetCheckPlan } from './pages/AssetCheckPlan';
import { api } from './services/apiService';
import { Wifi, WifiOff, UploadCloud, AlertCircle } from 'lucide-react';

// --- Page Registry for Dynamic Loading ---
// We map database "sheet" values to React Components.
const PAGE_REGISTRY: Record<string, React.FC<any>> = {
  'dashboard': Dashboard,
  'mastercompany': MasterCompany,
  'masterproductgroup': MasterProductGroup,
  'masterproducttype': MasterProductType,
  'masterproductsubtype': MasterProductSubtype,
  'masterproject': MasterProject,
  'masterproduct': MasterProduct,
  'mastersupplier': MasterSupplier,
  'masterstaff': MasterStaff,
  'receiving': Receiving,
  'sales': Sales,
  'memobudgetrequest': MemoBudgetRequest,
  'memoitrentalrequest': MemoItRentalRequest,
  'receiveassetconstruction': ReceiveAssetConstruction,
  'workforceplanning': WorkforcePlanning,
  'workforcerequest': WorkforceRequest,
  'workforceresignation': WorkforceResignation,
  'systemadmin': SystemAdmin,
  'inventory': Inventory,
  'assetcheckplan': AssetCheckPlan,
  // Common legacy or alternate naming patterns from Database
  'ms_company': MasterCompany,
  'ms_project': MasterProject,
  'ms_product': MasterProduct,
  'w_receiving': Receiving,
  'w_sales': Sales
};

const parseParams = (paramStr: string | undefined) => {
  if (!paramStr) return {};
  const params: any = {};
  paramStr.split('&').forEach(part => {
    const [key, value] = part.split('=');
    if (key) params[key.trim()] = value?.trim();
  });
  return params;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [currentServer, setCurrentServer] = useState('192.168.0.200'); 
  const [currentDatabase, setCurrentDatabase] = useState('SenaAI_AssetsDB'); 
  
  const [currentRoute, setCurrentRoute] = useState({ 
      pid: 'dashboard', 
      sheet: 'Dashboard', 
      param: '' 
  });
  
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<{id: string, type: 'RECEIVE' | 'SALES' } | null>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (user: string, server: string, database: string) => {
    setUsername(user);
    setCurrentServer(server);
    setCurrentDatabase(database);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCurrentRoute({ pid: 'dashboard', sheet: 'Dashboard', param: '' });
  };

  const handleNavigate = (pid: string, sheet?: string, param?: string) => {
      setIsPreviewMode(false);
      let targetSheet = sheet || 'Dashboard';
      if (pid === 'dashboard') targetSheet = 'Dashboard';
      
      setCurrentRoute({ 
          pid, 
          sheet: targetSheet, 
          param: param || '' 
      });
  };

  const handlePreview = (id: string, type: 'RECEIVE' | 'SALES') => {
    setPreviewData({ id, type });
    setIsPreviewMode(true);
  };

  const renderContent = () => {
    if (isPreviewMode) {
        return <DocumentPreview data={previewData} onBack={() => setIsPreviewMode(false)} />;
    }

    const rawSheetName = currentRoute.sheet || 'Dashboard';
    
    // Robust cleaning: remove extension-like suffixes, trailing dots, and lowercase everything
    const cleanSheet = rawSheetName
      .split('.')[0] // Take only the part before the first dot if it's like "Receiving.php"
      .toLowerCase()
      .trim();
    
    const Component = PAGE_REGISTRY[cleanSheet];
    
    if (Component) {
        const props = parseParams(currentRoute.param);
        return <Component {...props} pid={currentRoute.pid} onPreview={handlePreview} />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="p-8 bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center max-w-sm">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Program Not Linked</h3>
                <p className="text-xs text-center leading-relaxed mb-6">
                    Sheet <b>"{rawSheetName}"</b> (Cleaned: "{cleanSheet}") is not mapped to a component.
                </p>
                <button onClick={() => handleNavigate('dashboard', 'Dashboard')} className="w-full py-3 bg-primary-800 text-white rounded-xl font-bold">
                   Return to Dashboard
                </button>
            </div>
        </div>
    );
  };
  
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
        activePage={currentRoute.pid} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout}
        username={username}
        connectedServer={currentServer}
        connectedDatabase={currentDatabase}
    >
        {renderContent()}
    </Layout>
  );
};

export default App;
