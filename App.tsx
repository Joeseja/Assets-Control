
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

// --- Global Component Registry ---
const COMPONENT_MAP: Record<string, React.FC<any>> = {
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
  // Alias mapping
  'ms_company': MasterCompany,
  'ms_project': MasterProject,
  'ms_product': MasterProduct,
  'w_receiving': Receiving,
  'w_sales': Sales
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
      const targetSheet = pid === 'dashboard' ? 'Dashboard' : (sheet || 'Dashboard');
      setCurrentRoute({ pid, sheet: targetSheet, param: param || '' });
  };

  const handlePreview = (id: string, type: 'RECEIVE' | 'SALES') => {
    setPreviewData({ id, type });
    setIsPreviewMode(true);
  };

  const renderContent = () => {
    if (isPreviewMode) return <DocumentPreview data={previewData} onBack={() => setIsPreviewMode(false)} />;

    // Advanced Normalization for Legacy Support
    const rawSheet = currentRoute.sheet || 'Dashboard';
    const cleanSheet = rawSheet
      .toLowerCase()
      .split('.')[0] // Remove .php, .asp, etc.
      .replace(/_/g, '') // Normalize underscores
      .trim();
    
    const Component = COMPONENT_MAP[cleanSheet] || Dashboard;
    
    // Parse parameters into props
    const props: any = {};
    if (currentRoute.param) {
      currentRoute.param.split('&').forEach(p => {
        const [k, v] = p.split('=');
        if (k) props[k.trim()] = v ? v.trim() : true;
      });
    }

    return (
        <div className="h-full animate-in fade-in zoom-in-95 duration-500">
             <Component {...props} pid={currentRoute.pid} onPreview={handlePreview} />
        </div>
    );
  };
  
  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

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
