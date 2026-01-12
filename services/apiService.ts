
import { 
  CompanyItem, StaffItem, XUser, MenuItem, MasterGroup, MsProduct, MasterType, MasterSubtype, MsProject, MsSupplier,
  DashboardSummary, MovementItem, StockBalanceItem, ReceiveHead, ReceiveDetail, BrwcHead, BrwcDetail,
  MemoBudgetHead, MemoBudgetCompany, MemoBudgetProject, MemoBudgetBgCode,
  MemoItRentalHead, MemoItRentalDetail, ReceiveCaHead, ReceiveCaDetail,
  SystemNode, PlanCheckHead, PlanCheckDetail, SalesHead, SalesDetail,
  LocationItem, StockItem, ProjectItem, ProgramItem, MsBank, BrwcaHead, BrwcaDetail,
  MsDeedUtility, MsDeedPayment, DeedBookYear
} from '../types';

const API_URL = '/api';

const fetchJson = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options?.headers },
        });
        
        if (!response.ok) {
            let errorMsg = await response.text();
            throw new Error(errorMsg || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error: any) {
        console.error(`API Error [${url}]:`, error);
        throw error;
    }
};

export const api = {
    // --- System & Connectivity ---
    checkDbConnection: async () => fetchJson(`${API_URL}/health`),
    switchDatabase: async (target: string) => fetchJson(`${API_URL}/switch-db`, { method: 'POST', body: JSON.stringify({ target, server: target }) }),
    getUser: async (login: string) => fetchJson<XUser>(`${API_URL}/users/${encodeURIComponent(login)}`),
    getUserMenus: async (username: string) => fetchJson<MenuItem[]>(`${API_URL}/user-menus/${encodeURIComponent(username)}`),
    
    // --- Master Data ---
    getCompanies: async () => fetchJson<CompanyItem[]>(`${API_URL}/master/companies`),
    getMasterCompanies: async () => fetchJson<CompanyItem[]>(`${API_URL}/master/companies`),
    deleteCompany: async (code: string) => fetchJson(`${API_URL}/master/companies/${encodeURIComponent(code)}`, { method: 'DELETE' }),
    saveCompany: async (data: CompanyItem) => fetchJson(`${API_URL}/master/companies`, { method: 'POST', body: JSON.stringify(data) }),
    
    getStaff: async () => fetchJson<StaffItem[]>(`${API_URL}/master/staff`),
    getProjects: async (compCode: string) => fetchJson<ProjectItem[]>(`${API_URL}/master/projects/list/${encodeURIComponent(compCode)}`),
    getLocations: async () => fetchJson<LocationItem[]>(`${API_URL}/master/locations`),
    getStocks: async (locationCode?: string) => fetchJson<StockItem[]>(`${API_URL}/master/stocks${locationCode ? `?location_code=${locationCode}` : ''}`),
    
    getProducts: async () => fetchJson<MsProduct[]>(`${API_URL}/master/ms-products`),
    getMsProductsList: async () => fetchJson<MsProduct[]>(`${API_URL}/master/ms-products`),
    saveMsProduct: async (data: MsProduct) => fetchJson(`${API_URL}/master/ms-products`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMsProduct: async (code: string) => fetchJson(`${API_URL}/master/ms-products/${encodeURIComponent(code)}`, { method: 'DELETE' }),

    getMsProjectsList: async () => fetchJson<MsProject[]>(`${API_URL}/master/projects`),
    getMsProjectDetail: async (code: string) => fetchJson<MsProject>(`${API_URL}/master/projects/${encodeURIComponent(code)}`),
    saveMsProject: async (data: MsProject) => fetchJson(`${API_URL}/master/projects`, { method: 'POST', body: JSON.stringify(data) }),

    getMsSuppliersList: async () => fetchJson<MsSupplier[]>(`${API_URL}/master/suppliers`),
    saveMsSupplier: async (data: MsSupplier) => fetchJson(`${API_URL}/master/suppliers`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMsSupplier: async (code: string) => fetchJson(`${API_URL}/master/suppliers/${encodeURIComponent(code)}`, { method: 'DELETE' }),

    getBanks: async () => fetchJson<MsBank[]>(`${API_URL}/master/banks`),

    getMasterGroups: async (status?: string) => fetchJson<MasterGroup[]>(`${API_URL}/master/product-groups${status ? `?status=${status}` : ''}`),
    saveMasterGroup: async (data: MasterGroup) => fetchJson(`${API_URL}/master/product-groups`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMasterGroup: async (code: string) => fetchJson(`${API_URL}/master/product-groups/${encodeURIComponent(code)}`, { method: 'DELETE' }),

    getMasterTypes: async (groupCode: string) => fetchJson<MasterType[]>(`${API_URL}/master/product-types/${encodeURIComponent(groupCode)}`),
    saveMasterType: async (data: MasterType) => fetchJson(`${API_URL}/master/product-types`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMasterType: async (groupCode: string, typeCode: string) => fetchJson(`${API_URL}/master/product-types/${encodeURIComponent(groupCode)}/${encodeURIComponent(typeCode)}`, { method: 'DELETE' }),

    getMasterSubtypes: async (groupCode: string, typeCode: string) => fetchJson<MasterSubtype[]>(`${API_URL}/master/product-subtypes/${encodeURIComponent(groupCode)}/${encodeURIComponent(typeCode)}`),
    saveMasterSubtype: async (data: MasterSubtype) => fetchJson(`${API_URL}/master/product-subtypes`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMasterSubtype: async (groupCode: string, typeCode: string, subtypeCode: string) => fetchJson(`${API_URL}/master/product-subtypes/${encodeURIComponent(groupCode)}/${encodeURIComponent(typeCode)}/${encodeURIComponent(subtypeCode)}`, { method: 'DELETE' }),

    // --- Deed Utility Master ---
    getDeedUtilities: async () => fetchJson<MsDeedUtility[]>(`${API_URL}/master/deed-utility`),
    saveDeedUtility: async (data: MsDeedUtility) => fetchJson(`${API_URL}/master/deed-utility`, { method: 'POST', body: JSON.stringify(data) }),
    deleteDeedUtility: async (code: string) => fetchJson(`${API_URL}/master/deed-utility/${encodeURIComponent(code)}`, { method: 'DELETE' }),

    // --- Deed Payment (Tax Rates) ---
    getDeedPayments: async (year?: number, utilityCode?: string) => {
        let url = `${API_URL}/master/deed-payment`;
        const params = new URLSearchParams();
        if (year) params.append('year_no', year.toString());
        if (utilityCode) params.append('utility_code', utilityCode);
        if (params.toString()) url += `?${params.toString()}`;
        return fetchJson<MsDeedPayment[]>(url);
    },
    saveDeedPayment: async (data: MsDeedPayment) => fetchJson(`${API_URL}/master/deed-payment`, { method: 'POST', body: JSON.stringify(data) }),
    deleteDeedPayment: async (year: number, utilityCode: string, seq: number) => fetchJson(`${API_URL}/master/deed-payment/${year}/${encodeURIComponent(utilityCode)}/${seq}`, { method: 'DELETE' }),

    // --- Sale Land Tax (Deed Book Year) ---
    getDeedBookYears: async (year?: number, projectCode?: string) => {
        let url = `${API_URL}/master/deed-book-year`;
        const params = new URLSearchParams();
        if (year) params.append('year_no', year.toString());
        if (projectCode) params.append('project_code', projectCode);
        if (params.toString()) url += `?${params.toString()}`;
        return fetchJson<DeedBookYear[]>(url);
    },
    saveDeedBookYear: async (data: DeedBookYear) => fetchJson(`${API_URL}/master/deed-book-year`, { method: 'POST', body: JSON.stringify(data) }),
    deleteDeedBookYear: async (year: number, bookCode: string) => fetchJson(`${API_URL}/master/deed-book-year/${year}/${encodeURIComponent(bookCode)}`, { method: 'DELETE' }),

    // --- Dashboard ---
    getDashboardSummary: async () => fetchJson<DashboardSummary>(`${API_URL}/dashboard/summary`),
    getDashboardMovements: async () => fetchJson<MovementItem[]>(`${API_URL}/dashboard/movements`),
    getInventoryBalance: async () => fetchJson<StockBalanceItem[]>(`${API_URL}/inventory/balance`),

    // --- Material Receiving ---
    getReceiveHeaders: async () => fetchJson<any[]>(`${API_URL}/receiving/headers`),
    getReceiveDetails: async (no?: string) => fetchJson<any[]>(`${API_URL}/receiving/details${no ? `/${encodeURIComponent(no)}` : ''}`),
    getReceiveDocument: async (comp: string, no: string) => fetchJson<{head: ReceiveHead, details: ReceiveDetail[]}>(`${API_URL}/receiving/${encodeURIComponent(comp)}/${encodeURIComponent(no)}`),
    saveReceive: async (head: ReceiveHead, details: ReceiveDetail[]) => fetchJson(`${API_URL}/receiving`, { method: 'POST', body: JSON.stringify({ head, details }) }),
    getNextReceiveNo: async (date: string) => fetchJson<{no: string}>(`${API_URL}/receiving/next-no?date=${encodeURIComponent(date)}`),

    // --- Material Sales (Withdrawal) ---
    getSalesHeaders: async () => fetchJson<any[]>(`${API_URL}/sales/headers`),
    getSalesDetails: async (no?: string) => fetchJson<any[]>(`${API_URL}/sales/details${no ? `/${encodeURIComponent(no)}` : ''}`),
    getBrwcDocument: async (comp: string, no: string) => fetchJson<{head: BrwcHead, details: BrwcDetail[]}>(`${API_URL}/sales/${encodeURIComponent(comp)}/${encodeURIComponent(no)}`),
    saveBrwc: async (head: BrwcHead, details: BrwcDetail[]) => fetchJson(`${API_URL}/sales`, { method: 'POST', body: JSON.stringify({ head, details }) }),

    // --- Receive Asset CA ---
    getReceiveCaHeaders: async () => fetchJson<ReceiveCaHead[]>(`${API_URL}/receive-ca/headers`),
    getReceiveCaDetails: async (no: string, comp: string) => fetchJson<ReceiveCaDetail[]>(`${API_URL}/receive-ca/details/${encodeURIComponent(comp)}/${encodeURIComponent(no)}`),
    getNextReceiveCaNo: async (comp: string, date: string) => fetchJson<{no: string}>(`${API_URL}/receive-ca/next-no?comp_code=${comp}&date=${date}`),
    saveReceiveCa: async (head: ReceiveCaHead, details: ReceiveCaDetail[]) => fetchJson(`${API_URL}/receive-ca`, { method: 'POST', body: JSON.stringify({ head, details }) }),

    // --- Sales Asset CA ---
    getSalesCaHeaders: async () => fetchJson<BrwcaHead[]>(`${API_URL}/sales-ca/headers`),
    getSalesCaDocument: async (comp: string, no: string) => fetchJson<{head: BrwcaHead, details: BrwcaDetail[]}>(`${API_URL}/sales-ca/${encodeURIComponent(comp)}/${encodeURIComponent(no)}`),
    saveSalesCa: async (head: BrwcaHead, details: BrwcaDetail[]) => fetchJson(`${API_URL}/sales-ca`, { method: 'POST', body: JSON.stringify({ head, details }) }),

    // --- Memo System ---
    getMemoBudgetList: async () => fetchJson<any[]>(`${API_URL}/memo-budget/list`),
    getMemoBudget: async (no: string) => fetchJson<{head: MemoBudgetHead, companies: MemoBudgetCompany[], projects: MemoBudgetProject[], bgcodes: MemoBudgetBgCode[]}>(`${API_URL}/memo-budget/${encodeURIComponent(no)}`),
    saveMemoBudget: async (data: {head: MemoBudgetHead, companies: MemoBudgetCompany[], projects: MemoBudgetProject[], bgcodes: MemoBudgetBgCode[]}) => fetchJson<any>(`${API_URL}/memo-budget`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMemoBudget: async (no: string) => fetchJson(`${API_URL}/memo-budget/${encodeURIComponent(no)}`, { method: 'DELETE' }),

    // --- Memo IT Rental ---
    searchMemoItRental: async (criteria: any) => fetchJson<any[]>(`${API_URL}/memo-it/search`, { method: 'POST', body: JSON.stringify(criteria) }),
    getMemoItRental: async (compCode: string, no: string) => fetchJson<{head: MemoItRentalHead, details: MemoItRentalDetail[]}>(`${API_URL}/memo-it/${encodeURIComponent(compCode)}/${encodeURIComponent(no)}`),
    saveMemoItRental: async (data: {head: MemoItRentalHead, details: MemoItRentalDetail[]}) => fetchJson(`${API_URL}/memo-it`, { method: 'POST', body: JSON.stringify(data) }),
    deleteMemoItRental: async (compCode: string, no: string) => fetchJson(`${API_URL}/memo-it/${encodeURIComponent(compCode)}/${encodeURIComponent(no)}`, { method: 'DELETE' }),

    // --- Asset Check Plan ---
    getAssetCheckPlans: async () => fetchJson<any[]>(`${API_URL}/asset-check-plan/list`),
    getAssetCheckPlanDetail: async (compCode: string, no: string) => fetchJson<{head: PlanCheckHead, details: PlanCheckDetail[]}>(`${API_URL}/asset-check-plan/${encodeURIComponent(compCode)}/${encodeURIComponent(no)}`),
    saveAssetCheckPlan: async (data: {head: PlanCheckHead, details: PlanCheckDetail[]}) => fetchJson<{success: boolean, plan_no: string}>(`${API_URL}/asset-check-plan`, { method: 'POST', body: JSON.stringify(data) }),
    deleteAssetCheckPlan: async (compCode: string, no: string) => fetchJson(`${API_URL}/asset-check-plan/${encodeURIComponent(compCode)}/${encodeURIComponent(no)}`, { method: 'DELETE' }),

    // --- System Admin ---
    getUsersList: async () => fetchJson<XUser[]>(`${API_URL}/admin/users`),
    getMenuStructure: async () => fetchJson<SystemNode[]>(`${API_URL}/admin/menu-structure`),
    getAllPrograms: async () => fetchJson<ProgramItem[]>(`${API_URL}/admin/programs`),
    getAllProgramGroups: async () => fetchJson<{pgid: string, name: string}[]>(`${API_URL}/admin/program-groups`),
    getUserGrants: async (usrid: string) => fetchJson<string[]>(`${API_URL}/admin/user-grants/${encodeURIComponent(usrid)}`),
    saveUserGrants: async (data: {usrid: string, pids: string[]}) => fetchJson(`${API_URL}/admin/user-grants`, { method: 'POST', body: JSON.stringify(data) }),
    saveProgram: async (data: any) => fetchJson(`${API_URL}/admin/programs`, { method: 'POST', body: JSON.stringify(data) }),
    deleteProgram: async (pid: string) => fetchJson(`${API_URL}/admin/programs/${encodeURIComponent(pid)}`, { method: 'DELETE' }),
};
