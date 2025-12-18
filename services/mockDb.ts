

import { 
  Product, 
  SerialItem, 
  ReceiveHead, 
  ReceiveDetail, 
  SalesHead, 
  SalesDetail, 
  WarehouseType,
  StockMovement,
  ProjectItem,
  CompanyItem,
  StaffItem,
  LocationItem,
  StockItem,
  SupplierItem,
  ProductGroupItem,
  ProductTypeItem,
  UnitItem,
  XUser
} from '../types';
import { encodeCase1, decodepass } from '../utils/legacyEncryption';

// Initial Mock Data
// Updated codes to '03' and '07' as requested
const MOCK_PRODUCT_GROUPS: ProductGroupItem[] = [
  { product_group_code: '03', description: 'Construction Materials (วัสดุก่อสร้าง)' },
  { product_group_code: '07', description: 'Steel & Metal (เหล็กและโลหะ)' },
  { product_group_code: '99', description: 'General Hardware (ฮาร์ดแวร์ทั่วไป)' }
];

const MOCK_PRODUCT_TYPES: ProductTypeItem[] = [
  { product_type_code: 'T01', description: 'Type A (General)' },
  { product_type_code: 'T02', description: 'Type B (Special)' },
  { product_type_code: 'T03', description: 'Type C (Heavy)' }
];

const MOCK_UNITS: UnitItem[] = [
    { unit_code: 'Bag', description: 'Bag (50kg)' },
    { unit_code: 'Pc', description: 'Piece (ชิ้น)' },
    { unit_code: 'Box', description: 'Box (กล่อง)' },
    { unit_code: 'Set', description: 'Set (ชุด)' },
    { unit_code: 'Kg', description: 'Kilogram' },
];

const MOCK_PRODUCTS: Product[] = [
  { product_code: 'MAT-001', product_name: 'Cement Bag (50kg)', std_price: 200, unit: 'Bag', product_group_code: '03', product_type_code: 'T01' },
  { product_code: 'MAT-002', product_name: 'Steel Rod 10mm', std_price: 450, unit: 'Pc', product_group_code: '07', product_type_code: 'T03' },
  { product_code: 'MAT-003', product_name: 'Red Brick', std_price: 15, unit: 'Pc', product_group_code: '03', product_type_code: 'T01' },
  { product_code: 'GEN-001', product_name: 'Nails 2 inch', std_price: 50, unit: 'Box', product_group_code: '99', product_type_code: 'T02' },
];

const MOCK_SERIALS: SerialItem[] = [
  { id: 's1', serialNo: 'SN-998877', name: 'Drill Machine Makita', basePrice: 5000, status: 'AVAILABLE' },
  { id: 's2', serialNo: 'SN-112233', name: 'Laptop Dell Latitude', basePrice: 25000, status: 'AVAILABLE' },
];

const MOCK_COMPANIES: CompanyItem[] = [
  { comp_code: 'SENA-DEV', comp_name: 'Sena Development PCL', is_status: 'Y' },
  { comp_code: 'SENA-VILL', comp_name: 'Sena Ville Co., Ltd.', is_status: 'Y' },
  { comp_code: 'AC-CONST', comp_name: 'A-Chai Construction', is_status: 'Y' },
];

const MOCK_PROJECTS: ProjectItem[] = [
  { project_code: 'PJ-001', description: 'Sena Park Ville Ramindra', comp_code: 'SENA-DEV' },
  { project_code: 'PJ-002', description: 'Sena Kith Westgate', comp_code: 'SENA-DEV' },
  { project_code: 'PJ-003', description: 'Niche Mono Mega Space', comp_code: 'SENA-VILL' },
  { project_code: 'PJ-004', description: 'Sena Grand Home Rangsit', comp_code: 'SENA-VILL' },
  { project_code: 'PJ-005', description: 'Sena Eco Town', comp_code: 'AC-CONST' },
];

const MOCK_STAFF: StaffItem[] = [
  { staff_code: 'ADMIN', staff_name: 'System Administrator' },
  { staff_code: 'S001', staff_name: 'Somchai Jaidee' },
  { staff_code: 'S002', staff_name: 'Somsri Rakchat' }
];

const MOCK_LOCATIONS: LocationItem[] = [
  { location_code: 'PT25', description: 'Pathum Thani Warehouse 25' },
  { location_code: 'PT25AS', description: 'Pathum Thani Asset Store' }
];

const MOCK_STOCKS: StockItem[] = [
  { stock_code: 'PT25-MAIN', description: 'General Material Stock', location_code: 'PT25' },
  { stock_code: 'PT25-DMG', description: 'Damaged Goods', location_code: 'PT25' },
  { stock_code: 'PT25AS-MAIN', description: 'High Value Assets', location_code: 'PT25AS' }
];

const MOCK_SUPPLIERS: SupplierItem[] = [
  { supplier_code: 'SUP-001', supplier_name: 'Siam Cement Group' },
  { supplier_code: 'SUP-002', supplier_name: 'Thai Watsadu' },
  { supplier_code: 'SUP-003', supplier_name: 'Global House' }
];

// Initialize Mock Users with Encrypted Passwords (Using Case 1 Logic)
// Fixed: Added usrname property which is required by XUser interface
const MOCK_XUSERS: XUser[] = [
    { login: 'admin', password: encodeCase1('1234'), usrname: 'Administrator', user_name: 'Administrator', usrid: '9999', isadmin: 'Y' },
    { login: 'S001', password: encodeCase1('password'), usrname: 'Somchai Jaidee', user_name: 'Somchai Jaidee', usrid: '1001', isadmin: 'N' },
    { login: 'demo', password: encodeCase1('demo'), usrname: 'Demo User', user_name: 'Demo User', usrid: '8888', isadmin: 'N' },
    // Specific user from screenshot
    { login: 'ekapons', password: '4$;(5%9#7&3$0!5&', usrname: 'เอกพล ทรัพย์ทวีการณ์', user_name: 'เอกพล ทรัพย์ทวีการณ์', usrid: '14172000', isadmin: 'Y' }
];

const load = <T,>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

const save = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  getProductGroups: (): ProductGroupItem[] => MOCK_PRODUCT_GROUPS,
  getProductTypes: (): ProductTypeItem[] => MOCK_PRODUCT_TYPES,
  
  getProducts: (groupCode?: string): Product[] => {
    if (groupCode) {
        return MOCK_PRODUCTS.filter(p => p.product_group_code === groupCode);
    }
    return MOCK_PRODUCTS;
  },

  getUnits: (): UnitItem[] => MOCK_UNITS,
  
  getSerials: (): SerialItem[] => load('db_serials', MOCK_SERIALS),
  getProjects: (compCode?: string): ProjectItem[] => {
    if (compCode) {
      return MOCK_PROJECTS.filter(p => p.comp_code === compCode);
    }
    return MOCK_PROJECTS;
  },
  getCompanies: (): CompanyItem[] => MOCK_COMPANIES,
  getStaff: (): StaffItem[] => MOCK_STAFF,
  getLocations: (): LocationItem[] => MOCK_LOCATIONS,
  getStocks: (locationCode: string): StockItem[] => MOCK_STOCKS.filter(s => s.location_code === locationCode),
  getSuppliers: (): SupplierItem[] => MOCK_SUPPLIERS,

  // --- Auth / XUser ---
  getUser: (login: string): XUser | undefined => {
      const users = load('db_xusers', MOCK_XUSERS);
      return users.find(u => u.login.toLowerCase() === login.toLowerCase());
  },

  validateLogin: (login: string, passwordInput: string): XUser | null => {
      const users = load('db_xusers', MOCK_XUSERS);
      const user = users.find(u => u.login.toLowerCase() === login.toLowerCase());
      
      if (!user) return null;

      // Decrypt using Case 1 (decodepass)
      const decryptedDbPass = decodepass(user.password);
      
      if (decryptedDbPass === passwordInput) {
          return user;
      }
      return null;
  },

  addSerial: (item: SerialItem) => {
    const items = load('db_serials', MOCK_SERIALS);
    items.push(item);
    save('db_serials', items);
  },

  updateSerialStatus: (id: string, status: 'AVAILABLE' | 'SOLD') => {
    const items = load('db_serials', MOCK_SERIALS);
    const idx = items.findIndex(i => i.id === id);
    if (idx >= 0) {
      items[idx].status = status;
      save('db_serials', items);
    }
  },

  // --- Receiving ---
  getReceiveDocs: (): ReceiveHead[] => load('db_receive_head', []),
  
  getReceiveDetails: (receiveNo?: string): ReceiveDetail[] => {
    const all = load<ReceiveDetail[]>('db_receive_detail', []);
    if (!receiveNo) return all;
    return all.filter(d => d.receive_no === receiveNo);
  },
  
  saveReceive: (head: ReceiveHead, details: ReceiveDetail[]) => {
    const heads = load<ReceiveHead[]>('db_receive_head', []);
    const allDetails = load<ReceiveDetail[]>('db_receive_detail', []);
    
    // Check if update or new by receive_no AND comp_code
    const existingIdx = heads.findIndex(h => h.receive_no === head.receive_no && h.comp_code === head.comp_code);
    if (existingIdx >= 0) {
      heads[existingIdx] = head;
      const keptDetails = allDetails.filter(d => d.receive_no !== head.receive_no || d.comp_code !== head.comp_code);
      save('db_receive_detail', [...keptDetails, ...details]);
    } else {
      heads.push(head);
      save('db_receive_detail', [...allDetails, ...details]);
    }
    save('db_receive_head', heads);
  },

  cancelReceive: (id: string) => {
    const heads = load<ReceiveHead[]>('db_receive_head', []);
    // Note: This logic assumes ID is enough for mock, but real logic uses comp_code too
    const idx = heads.findIndex(h => h.receive_no === id); 
    if (idx >= 0) {
      // Mock delete
      heads.splice(idx, 1);
      save('db_receive_head', heads);
    }
  },

  // --- Sales ---
  getSalesDocs: (): SalesHead[] => load('db_sales_head', []),
  getSalesDetails: (headId?: string): SalesDetail[] => {
    const all = load<SalesDetail[]>('db_sales_detail', []);
    if (!headId) return all;
    return all.filter(d => d.doc_no === headId);
  },

  saveSales: (head: SalesHead, details: SalesDetail[]) => {
    const heads = load<SalesHead[]>('db_sales_head', []);
    const allDetails = load<SalesDetail[]>('db_sales_detail', []);
    
    heads.push(head);
    save('db_sales_head', heads);
    save('db_sales_detail', [...allDetails, ...details]);
  },

  cancelSales: (id: string) => {
    const heads = load<SalesHead[]>('db_sales_head', []);
    const idx = heads.findIndex(h => h.doc_no === id);
    if (idx >= 0) {
      const head = heads[idx];
      head.is_status = 'CANCELLED';
      save('db_sales_head', heads);
    }
  },

  // --- Reports ---
  getStockBalance: (): {name: string, qty: number, type: string}[] => {
    const products = MOCK_PRODUCTS;
    const rDetails = load<ReceiveDetail[]>('db_receive_detail', []);
    const sDetails = load<SalesDetail[]>('db_sales_detail', []);
    const rHeads = load<ReceiveHead[]>('db_receive_head', []);
    const sHeads = load<SalesHead[]>('db_sales_head', []);

    // Helper to check if doc is active
    const isRActive = (id: string) => rHeads.find(h => h.receive_no === id)?.is_status !== 'CANCELLED';
    const isSActive = (id: string) => sHeads.find(h => h.doc_no === id)?.is_status === 'ACTIVE';

    const balances: {name: string, qty: number, type: string}[] = [];

    // 1. Calculate Product Stocks (A-Chai)
    products.forEach(p => {
      const received = rDetails
        .filter(d => d.product_code === p.product_code && isRActive(d.receive_no))
        .reduce((sum, d) => sum + d.total_qty, 0);
      
      const sold = sDetails
        .filter(d => d.product_code === p.product_code && isSActive(d.doc_no))
        .reduce((sum, d) => sum + d.qty, 0);
      
      balances.push({
        name: p.product_name,
        qty: received - sold,
        type: 'Material'
      });
    });

    const serials = load('db_serials', MOCK_SERIALS);
    const availableSerials = serials.filter(s => s.status === 'AVAILABLE').length;
    balances.push({
      name: 'Total Assets (Sena)',
      qty: availableSerials,
      type: 'Asset'
    });

    return balances;
  },

  getMovements: (): StockMovement[] => {
    const rDetails = load<ReceiveDetail[]>('db_receive_detail', []);
    const sDetails = load<SalesDetail[]>('db_sales_detail', []);
    const rHeads = load<ReceiveHead[]>('db_receive_head', []);
    const sHeads = load<SalesHead[]>('db_sales_head', []);

    let movements: StockMovement[] = [];

    rDetails.forEach(d => {
      const h = rHeads.find(x => x.receive_no === d.receive_no);
      if (h && h.is_status !== 'CANCELLED') {
        movements.push({
          date: h.receive_date,
          docNo: h.receive_no,
          type: 'IN',
          itemName: d.product_name || d.product_code,
          qty: d.total_qty,
          balance: 0
        });
      }
    });

    sDetails.forEach(d => {
      const h = sHeads.find(x => x.doc_no === d.doc_no);
      if (h && h.is_status === 'ACTIVE') {
        movements.push({
          date: h.doc_date,
          docNo: h.doc_no,
          type: 'OUT',
          itemName: d.product_name,
          qty: d.qty,
          balance: 0
        });
      }
    });

    movements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return movements;
  }
};
