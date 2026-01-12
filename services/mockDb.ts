
import { 
  Product, SerialItem, ReceiveHead, ReceiveDetail, SalesHead, SalesDetail, WarehouseType,
  StockMovement, ProjectItem, CompanyItem, StaffItem, LocationItem, StockItem,
  SupplierItem, ProductGroupItem, ProductTypeItem, UnitItem, XUser, MsBank
} from '../types';
import { encodeCase1, decodepass } from '../utils/legacyEncryption';

const MOCK_PRODUCT_GROUPS: ProductGroupItem[] = [
  { product_group_code: '03', description: 'Construction Materials' },
  { product_group_code: '07', description: 'Steel & Metal' },
  { product_group_code: '99', description: 'General Hardware' }
];

const MOCK_PRODUCT_TYPES: ProductTypeItem[] = [
  { product_type_code: 'T01', description: 'Type A (General)' },
  { product_type_code: 'T02', description: 'Type B (Special)' }
];

const MOCK_PROJECTS: ProjectItem[] = [
  { project_code: 'PJ-001', description: 'Sena Park Ville Ramindra', comp_code: 'SENA-DEV' },
  { project_code: 'PJ-002', description: 'Sena Kith Westgate', comp_code: 'SENA-DEV' }
];

const MOCK_SUPPLIERS: SupplierItem[] = [
  { supplier_code: 'SUP-001', supplier_name: 'Siam Cement Group' },
  { supplier_code: 'SUP-002', supplier_name: 'Thai Watsadu' }
];

const MOCK_BANKS: MsBank[] = [
    { bank_code: 'BBL', description: 'Bangkok Bank' },
    { bank_code: 'KBANK', description: 'Kasikorn Bank' },
    { bank_code: 'SCB', description: 'Siam Commercial Bank' }
];

const MOCK_PRODUCTS: Product[] = [
  { product_code: 'MAT-001', product_name: 'Cement Bag (50kg)', std_price: 200, unit: 'Bag', product_group_code: '03', product_type_code: 'T01' },
  { product_code: 'GEN-001', product_name: 'Nails 2 inch', std_price: 50, unit: 'Box', product_group_code: '99', product_type_code: 'T02' }
];

const MOCK_XUSERS: XUser[] = [
    { login: 'admin', password: encodeCase1('1234'), usrname: 'Administrator', user_name: 'Administrator', usrid: '9999', isadmin: 'Y' },
    { login: 'ekapons', password: '4$;(5%9#7&3$0!5&', usrname: 'เอกพล ทรัพย์ทวีการณ์', user_name: 'เอกพล ทรัพย์ทวีการณ์', usrid: '14172000', isadmin: 'Y' }
];

const load = <T,>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

export const db = {
  getProductGroups: (): ProductGroupItem[] => load('db_groups', MOCK_PRODUCT_GROUPS),
  getProductTypes: (): ProductTypeItem[] => load('db_types', MOCK_PRODUCT_TYPES),
  getProducts: (): Product[] => load('db_products', MOCK_PRODUCTS),
  getProjects: (): ProjectItem[] => load('db_projects', MOCK_PROJECTS),
  getSuppliers: (): SupplierItem[] => load('db_suppliers', MOCK_SUPPLIERS),
  getBanks: (): MsBank[] => load('db_banks', MOCK_BANKS),
  getCompanies: (): CompanyItem[] => load('db_companies', [
      { comp_code: 'SENA', comp_name: 'Sena Development PCL', is_status: 'A' }
  ]),
  getStaff: (): StaffItem[] => [{ staff_code: 'ADMIN', staff_name: 'Administrator' }],
  validateLogin: (login: string, passwordInput: string): XUser | null => {
      const users = load('db_xusers', MOCK_XUSERS);
      const user = users.find(u => u.login.toLowerCase() === login.toLowerCase());
      if (!user) return null;
      return decodepass(user.password) === passwordInput ? user : null;
  }
};
