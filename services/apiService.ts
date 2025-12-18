import { 
  ReceiveHead, ReceiveDetail, 
  CompanyItem, StaffItem, XUser,
  MenuItem, BrwcHead, BrwcDetail, PlanCheckHead, PlanCheckDetail,
  Product, LocationItem, StockItem, DashboardSummary, UnitItem,
  MovementItem, MasterGroup, MasterType, MasterSubtype, MsProduct,
  MsProductComponent, MsProductMemo, MsProject, SystemNode,
  ProgramItem, MemoBudgetHead, MemoBudgetCompany, MemoBudgetProject, MemoBudgetBgCode,
  MemoItRentalHead, MemoItRentalDetail, ReceiveCaHead, ReceiveCaDetail,
  SalesHead, SalesDetail, ProductGroupItem, ProjectItem
} from '../types';

const API_URL = '/api';

const fetchJson = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Error [${url}]:`, error);
        throw error;
    }
};

export const api = {
    // Auth
    // Fix: Added server and database optional properties to the return type to match the backend response
    checkDbConnection: async () => fetchJson<{status: string, server?: string, database?: string}>(`${API_URL}/health`),
    switchDatabase: async (target: string) => fetchJson(`${API_URL}/config/switch-db`, { method: 'POST', body: JSON.stringify({ target }) }),
    getUser: async (login: string) => fetchJson<XUser>(`${API_URL}/users/${encodeURIComponent(login)}`),
    getUserMenus: async (username: string) => fetchJson<MenuItem[]>(`${API_URL}/user-menus/${encodeURIComponent(username)}`),
    getUsersList: async () => fetchJson<XUser[]>(`${API_URL}/users`),
    
    // Master Data
    getCompanies: async () => fetchJson<CompanyItem[]>(`${API_URL}/master/companies`),
    getMasterCompanies: async () => fetchJson<CompanyItem[]>(`${API_URL}/master/companies`),
    saveCompany: async (data: CompanyItem) => fetchJson(`${API_URL}/master/companies`, { method: 'POST', body: JSON.stringify(data) }),
    deleteCompany: async (code: string) => fetchJson(`${API_URL}/master/companies/${code}`, { method: 'DELETE' }),

    getStaff: async () => fetchJson<StaffItem[]>(`${API_URL}/master/staff`),
    getProducts: async () => fetchJson<Product[]>(`${API_URL}/master/products`),
    getLocations: async () => fetchJson<LocationItem[]>(`${API_URL}/master/locations`),
    getStocks: async (loc?: string) => fetchJson<StockItem[]>(loc ? `${API_URL}/master/stocks?loc=${loc}` : `${API_URL}/master/stocks`),
    getUnits: async () => fetchJson<UnitItem[]>(`${API_URL}/master/units`),
    
    getMasterGroups: async () => fetchJson<MasterGroup[]>(`${API_URL}/master/groups`),
    getProductGroups: async () => fetchJson<ProductGroupItem[]>(`${API_URL}/master/groups`),

    saveMasterGroup: async (data: MasterGroup) => fetchJson(`${API_URL}/master/groups`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMasterGroup: async (code: string) => fetchJson(`${API_URL}/master/groups/${code}`, { method: 'DELETE' }),
    getMasterTypes: async (groupCode: string) => fetchJson<MasterType[]>(`${API_URL}/master/types?group=${groupCode}`),
    saveMasterType: async (data: MasterType) => fetchJson(`${API_URL}/master/types`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMasterType: async (group: string, code: string) => fetchJson(`${API_URL}/master/types/${group}/${code}`, { method: 'DELETE' }),
    getMasterSubtypes: async (group: string, type: string) => fetchJson<MasterSubtype[]>(`${API_URL}/master/subtypes?group=${group}&type=${type}`),
    saveMasterSubtype: async (data: MasterSubtype) => fetchJson(`${API_URL}/master/subtypes`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMasterSubtype: async (group: string, type: string, code: string) => fetchJson(`${API_URL}/master/subtypes/${group}/${type}/${code}`, { method: 'DELETE' }),

    // Modules Retrieve by ID
    getReceiveDocument: async (comp: string, no: string) => fetchJson<{head: ReceiveHead, details: ReceiveDetail[]}>(`${API_URL}/receive/${comp}/${no}`),
    getBrwcDocument: async (comp: string, no: string) => fetchJson<{head: BrwcHead, details: BrwcDetail[]}>(`${API_URL}/brwc/${comp}/${no}`),
    getMemoBudget: async (no: string) => fetchJson<{head: MemoBudgetHead, companies: MemoBudgetCompany[], projects: MemoBudgetProject[], bgcodes: MemoBudgetBgCode[]}>(`${API_URL}/memo-budget/${no}`),
    getMemoItRental: async (comp: string, no: string) => fetchJson<{head: MemoItRentalHead, details: MemoItRentalDetail[]}>(`${API_URL}/memo-it-rental/${comp}/${no}`),
    getReceiveCaDocument: async (comp: string, no: string) => fetchJson<{head: ReceiveCaHead, details: ReceiveCaDetail[]}>(`${API_URL}/receive-ca/${comp}/${no}`),

    // Common List Fetchers
    getReceiveHeaders: async () => fetchJson<ReceiveHead[]>(`${API_URL}/receive`),
    getReceiveDetails: async (no?: string) => fetchJson<ReceiveDetail[]>(no ? `${API_URL}/receive/details?no=${no}` : `${API_URL}/receive/details`),
    getBrwcList: async () => fetchJson<BrwcHead[]>(`${API_URL}/brwc`),
    getSalesHeaders: async () => fetchJson<SalesHead[]>(`${API_URL}/sales`),
    getSalesDetails: async (no?: string) => fetchJson<SalesDetail[]>(no ? `${API_URL}/sales/details?no=${no}` : `${API_URL}/sales/details`),
    getReceiveCaHeaders: async () => fetchJson<ReceiveCaHead[]>(`${API_URL}/receive-ca`),
    getReceiveCaDetails: async (no: string, comp: string) => fetchJson<ReceiveCaDetail[]>(`${API_URL}/receive-ca/${comp}/${no}/details`),
    
    // Auto Numbering
    getNextReceiveNo: async (comp: string, date: string) => fetchJson<string>(`${API_URL}/receive/next-no?comp=${comp}&date=${date}`),
    getBrwcNextNo: async (comp: string, date: string) => fetchJson<string>(`${API_URL}/brwc/next-no?comp=${comp}&date=${date}`),
    getNextReceiveCaNo: async (comp: string, date: string) => fetchJson<string>(`${API_URL}/receive-ca/next-no?comp=${comp}&date=${date}`),
    getNextLotNo: async (date: string) => fetchJson<string>(`${API_URL}/receive/next-lot?date=${date}`),
    getProductRunno: async (comp: string) => fetchJson<{runno: string}>(`${API_URL}/master/products/next-runno?comp=${comp}`),

    // Saving Actions
    saveReceive: async (head: ReceiveHead, details: ReceiveDetail[]) => fetchJson(`${API_URL}/receive`, { method: 'POST', body: JSON.stringify({ head, details }) }),
    saveBrwc: async (head: BrwcHead, details: BrwcDetail[]) => fetchJson(`${API_URL}/brwc`, { method: 'POST', body: JSON.stringify({ head, details }) }),
    saveMemoBudget: async (data: any) => fetchJson<{memo_no: string}>(`${API_URL}/memo-budget`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMemoBudget: async (no: string) => fetchJson(`${API_URL}/memo-budget/${no}`, { method: 'DELETE' }),
    searchMemoBudgetList: async (criteria: any, page: number, size: number) => fetchJson<{data: any[], total: number}>(`${API_URL}/memo-budget/search?page=${page}&size=${size}`, { method: 'POST', body: JSON.stringify(criteria) }),
    
    saveMemoItRental: async (data: any) => fetchJson(`${API_URL}/memo-it-rental`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMemoItRental: async (comp: string, no: string) => fetchJson(`${API_URL}/memo-it-rental/${comp}/${no}`, { method: 'DELETE' }),
    searchMemoItRental: async (criteria: any) => fetchJson<any[]>(`${API_URL}/memo-it-rental/search`, { method: 'POST', body: JSON.stringify(criteria) }),
    
    saveReceiveCa: async (head: ReceiveCaHead, details: ReceiveCaDetail[]) => fetchJson(`${API_URL}/receive-ca`, { method: 'POST', body: JSON.stringify({ head, details }) }),
    
    saveMsProduct: async (data: any) => fetchJson(`${API_URL}/master/ms-products`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMsProduct: async (comp: string, code: string) => fetchJson(`${API_URL}/master/ms-products/${comp}/${code}`, { method: 'DELETE' }),
    
    saveMsProject: async (data: MsProject) => fetchJson(`${API_URL}/master/ms-projects`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMsProject: async (code: string) => fetchJson(`${API_URL}/master/ms-projects/${code}`, { method: 'DELETE' }),

    saveAssetCheckPlan: async (data: {head: PlanCheckHead, details: PlanCheckDetail[]}) => fetchJson<{success: boolean, plan_no: string}>(`${API_URL}/asset-check-plan`, { method: 'POST', body: JSON.stringify(data) }),

    // Dashboard
    getDashboardSummary: async () => fetchJson<DashboardSummary>(`${API_URL}/dashboard/summary`),
    getDashboardMovements: async () => fetchJson<MovementItem[]>(`${API_URL}/dashboard/movements`),
    getInventoryBalance: async () => fetchJson<any[]>(`${API_URL}/inventory/balance`),

    // Projects
    getProjects: async (compCode?: string) => fetchJson<ProjectItem[]>(compCode ? `${API_URL}/master/projects?comp=${compCode}` : `${API_URL}/master/projects`),
    getMsProjectsList: async () => fetchJson<MsProject[]>(`${API_URL}/master/ms-projects`),
    getMsProjectDetail: async (code: string) => fetchJson<MsProject>(`${API_URL}/master/ms-projects/${code}`),
    
    // Products
    getMsProductsList: async () => fetchJson<MsProduct[]>(`${API_URL}/master/ms-products`),
    getMsProductDetail: async (comp: string, code: string) => fetchJson<{head: MsProduct, components: MsProductComponent[], memo: MsProductMemo}>(`${API_URL}/master/ms-products/${comp}/${code}`),

    // Admin
    getMenuStructure: async () => fetchJson<SystemNode[]>(`${API_URL}/admin/menu-structure`),
    getAllPrograms: async () => fetchJson<ProgramItem[]>(`${API_URL}/admin/programs`),
    getAllProgramGroups: async () => fetchJson<{pgid: string, name: string}[]>(`${API_URL}/admin/program-groups`),
    getUserGrants: async (usrid: string) => fetchJson<string[]>(`${API_URL}/admin/grants/${usrid}`),
    saveUserGrants: async (data: {usrid: string, pids: string[]}) => fetchJson(`${API_URL}/admin/grants`, { method: 'POST', body: JSON.stringify(data) }),
    saveProgram: async (data: any) => fetchJson(`${API_URL}/admin/programs`, { method: 'POST', body: JSON.stringify(data) }),
    deleteProgram: async (pid: string) => fetchJson(`${API_URL}/admin/programs/${pid}`, { method: 'DELETE' }),

    syncOfflineQueue: async () => ({ synced: 0, items: [] })
};