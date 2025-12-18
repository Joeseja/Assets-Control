
export interface XUser {
  usrid: string;
  gid?: string;
  login: string;
  usrname: string;
  password: string; // Encrypted
  isadmin?: string;
  isactive?: string;
  is_print?: string;
  is_save?: string;
  is_approve?: string;
  is_receive?: string;
  hr_code?: string;
  user_name?: string; 
}

export interface MenuItem {
  sid: string;
  sname: string;
  sname_2?: string;
  pgid: string;
  pgname: string;
  pgname_2?: string;
  pid: string;
  pname: string;
  pname_2?: string;
  sheet: string;
  param: string;
  active: string;
  sequence?: number;
}

export interface CompanyItem {
  comp_code: string;
  comp_name: string;
  comp_id?: string;
  address1?: string;
  address2?: string;
  comp_namee?: string;
  addresse1?: string;
  addresse2?: string;
  phone?: string;
  fax?: string;
  email?: string;
  tax_id?: string;
  vat_percent?: number;
  pass_no?: string;
  is_security?: string;
  is_status: string;
  is_inout?: string;
  is_comp?: string;
  is_bg?: string;
  is_group?: string;
  is_head?: string;
  update_id?: string;
  update_date?: string;
  is_type?: string;
  staff1_code?: string;
  staff2_code?: string;
  is_grouprf?: string;
  is_rf?: string;
  branch_id?: string;
  bank_code?: string;
  account_no?: string;
  account_branch?: string;
  cms_id?: string;
  [key: string]: any;
}

export interface StaffItem {
  staff_code: string;
  staff_name: string;
  dept_name?: string;
  position_name?: string;
}

export interface Product {
  product_code: string;
  product_name: string;
  std_price: number;
  unit?: string;
  product_group_code?: string;
  product_type_code?: string;
}

export interface PlanCheckHead {
  plan_no: string;
  plan_date: string;
  comp_code: string;
  staff_code: string;
  location_code?: string;
  stock_code?: string;
  checker_code?: string;
  checker_date?: string | null;
  is_enter?: string;
  enter_code?: string;
  enter_date?: string | null;
  remark?: string;
  is_status: string;
  latiude_no?: string;
  longitude_no?: string;
  vp_code?: string;
}

export interface PlanCheckDetail {
  id?: string;
  plan_no: string;
  seq: number;
  serialno: string;
  product_code?: string;
  product_name?: string;
  is_status: string;
  staff_code?: string;
  staff_name?: string;
  location_code?: string;
  stock_code?: string;
  stock_name?: string;
  comp_code?: string;
  remark?: string;
  latiude_no?: string;
  longitude_no?: string;
}

export interface ReceiveHead {
  comp_code: string;
  receive_no: string;
  receive_date: string;
  staff_code: string;
  is_status: string;
  [key: string]: any;
}

export interface ReceiveDetail {
  comp_code: string;
  receive_no: string;
  seq: number;
  product_code: string;
  total_qty: number;
  price: number;
  total_amount: number;
  [key: string]: any;
}

export interface BrwcHead {
  comp_code: string;
  brw_no: string;
  brw_date: string;
  is_status: string;
  [key: string]: any;
}

export interface BrwcDetail {
  comp_code: string;
  brw_no: string;
  seq: number;
  product_code: string;
  total_qty: number;
  price: number;
  total_amount: number;
  [key: string]: any;
}

export interface SalesHead {
  doc_no: string;
  doc_date: string;
  comp_code: string;
  is_status: string;
  [key: string]: any;
}

export interface SalesDetail {
  doc_no: string;
  product_code?: string;
  product_name?: string;
  qty: number;
  [key: string]: any;
}

export interface ProjectItem {
  project_code: string;
  description: string;
  comp_code: string;
}

export interface LocationItem {
  location_code: string;
  description: string;
}

export interface StockItem {
  stock_code: string;
  description: string;
  location_code: string;
}

export interface ProductGroupItem {
  product_group_code: string;
  description: string;
}

export interface ProductTypeItem {
  product_type_code: string;
  description: string;
}

export interface UnitItem {
  unit_code: string;
  description: string;
}

export interface MsProduct {
  comp_code: string;
  product_code: string;
  product_name: string;
  is_status: string;
  [key: string]: any;
}

export interface MsProductComponent {
  id?: string;
  comp_code: string;
  product_code: string;
  seq: number;
  component_code: string;
  component_qty: number;
}

export interface MsProductMemo {
  comp_code: string;
  product_code: string;
  product_memo: string;
}

export interface MsProject {
  project_code: string;
  description: string;
  comp_code: string;
  is_status: string;
  [key: string]: any;
}

export interface MasterGroup {
  product_group_code: string;
  description: string;
  is_status: string;
}

export interface MasterType {
  product_group_code: string;
  product_type_code: string;
  description: string;
  is_status: string;
  desc_eng?: string;
  account_code?: string;
  cost_percent?: number;
  price_percent?: number;
}

export interface MasterSubtype {
  product_group_code: string;
  product_type_code: string;
  product_subtype_code: string;
  description: string;
  is_status: string;
  desc_eng?: string;
  idp_code?: string;
}

export interface MemoBudgetHead {
  memo_no: string;
  memo_date: string;
  is_first: string;
  staff_code: string;
  memo_staff_code: string;
  department_code: string;
  user_rms: string;
  approve_code: string;
  vp_code: string;
  remark: string;
  is_status: string;
  is_approve?: string;
  is_vp?: string;
}

export interface MemoBudgetCompany {
  id?: string;
  memo_no: string;
  comp_code: string;
  seq: number;
  is_active: string;
}

export interface MemoBudgetProject {
  id?: string;
  memo_no: string;
  project_code: string;
  seq: number;
  is_active: string;
}

export interface MemoBudgetBgCode {
  id?: string;
  memo_no: string;
  budget_code: string;
  seq: number;
  is_active: string;
}

export interface MemoItRentalHead {
  comp_code: string;
  memo_no: string;
  memo_date: string;
  staff_code: string;
  approve_code: string;
  remark: string;
  project_code: string;
  due_date: string;
  is_type: string;
  is_status: string;
}

export interface MemoItRentalDetail {
  id?: string;
  comp_code: string;
  memo_no: string;
  seq: number;
  owner_staff_code?: string;
  owner_name?: string;
  position_code?: string;
  product_name?: string;
  serialno?: string;
  location_code?: string;
  stock_code?: string;
  cost_amount?: number;
  remark?: string;
  project_code?: string;
}

export interface ReceiveCaHead {
  comp_code: string;
  receive_no: string;
  receive_date: string;
  staff_code: string;
  remark: string;
  is_status: string;
}

export interface ReceiveCaDetail {
  id?: string;
  comp_code: string;
  receive_no: string;
  seq: number;
  product_code: string;
  product_name?: string;
  serialno?: string;
  total_amount?: number;
  price?: number;
}

// Fix: Added missing interfaces and types
export interface SerialItem {
  id: string;
  serialNo: string;
  name: string;
  basePrice: number;
  status: 'AVAILABLE' | 'SOLD';
}

export type WarehouseType = 'Material' | 'Asset';

export interface StockMovement {
  date: string;
  docNo: string;
  type: 'IN' | 'OUT';
  itemName: string;
  qty: number;
  balance: number;
}

export interface SupplierItem {
  supplier_code: string;
  supplier_name: string;
}

export interface DashboardSummary {
  totalInventory: number;
  transactionCount: number;
  lowStockCount: number;
}

export interface MovementItem {
  date: string;
  balance: number;
  [key: string]: any;
}

export interface StockBalanceItem {
  name: string;
  qty: number;
  [key: string]: any;
}

export interface ProgramItem {
  pid: string;
  name: string;
  pgid: string;
  pgname?: string;
}

export interface SystemNode {
  sid: string;
  name: string;
  groups: {
    pgid: string;
    name: string;
    programs: ProgramItem[];
  }[];
}
