
// Types for Assets Management System

export interface Product {
  product_code: string;
  product_name: string;
  std_price: number;
  unit: string;
  product_group_code: string;
  product_type_code: string;
}

export interface SerialItem {
  id: string;
  serialNo: string;
  name: string;
  basePrice: number;
  status: 'AVAILABLE' | 'SOLD';
}

export interface ReceiveHead {
  comp_code: string;
  receive_no: string;
  receive_date: string;
  staff_code: string;
  outlocation_code?: string;
  outstock_code?: string;
  inlocation_code?: string;
  instock_code?: string;
  lot_no?: string;
  manager_code?: string;
  checker_code?: string;
  approve_code?: string;
  remark?: string;
  is_status: string;
}

export interface ReceiveDetail {
  comp_code: string;
  receive_no: string;
  seq: number;
  product_code: string;
  product_name?: string;
  total_qty: number;
  price: number;
  total_amount: number;
  id?: string;
}

export interface SalesHead {
  doc_no: string;
  doc_date: string;
  comp_code: string;
  is_status: string;
}

export interface SalesDetail {
  doc_no: string;
  product_code: string;
  product_name: string;
  qty: number;
}

export type WarehouseType = 'IN' | 'OUT';

export interface StockMovement {
  date: string;
  docNo: string;
  type: 'IN' | 'OUT';
  itemName: string;
  qty: number;
  balance: number;
}

export interface ProjectItem {
  project_code: string;
  description: string;
  comp_code: string;
}

export interface CompanyItem {
  comp_code: string;
  comp_name: string;
  is_status: string;
  cms_id?: string;
  tax_id?: string;
  address1?: string;
  addresse1?: string;
  phone?: string;
  fax?: string;
  email?: string;
  comp_namee?: string;
  update_id?: string;
  update_date?: string;
}

export interface StaffItem {
  staff_code: string;
  staff_name: string;
  dept_name?: string;
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

export interface SupplierItem {
  supplier_code: string;
  supplier_name: string;
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

export interface XUser {
  login: string;
  password: string;
  usrname: string;
  user_name: string;
  usrid: string;
  isadmin: string;
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
}

export interface DashboardSummary {
  totalInventory: number;
  transactionCount: number;
  lowStockCount: number;
}

export interface MovementItem {
  date: string;
  balance: number;
}

export interface StockBalanceItem {
  name: string;
  qty: number;
  code: string;
  type: string;
}

export interface BrwcHead {
  comp_code: string;
  brw_no: string;
  brw_date: string;
  staff_code: string;
  outlocation_code?: string;
  outstock_code?: string;
  inlocation_code?: string;
  instock_code?: string;
  remark?: string;
  is_status: string;
}

export interface BrwcDetail {
  comp_code: string;
  brw_no: string;
  seq: number;
  product_code: string;
  product_name?: string;
  qty: number;
  id?: string;
}

export interface PlanCheckHead {
  plan_no: string;
  plan_date: string;
  comp_code: string;
  location_code?: string;
  stock_code?: string;
  staff_code: string;
  remark?: string;
  is_enter: string;
  is_approve?: string;
  is_vp?: string;
}

export interface PlanCheckDetail {
  plan_no: string;
  seq: number;
  serialno: string;
  is_status: string;
  staff_code: string;
  staff_name?: string;
  comp_code: string;
}

export interface MasterGroup {
  product_group_code: string;
  description: string;
  is_status: string;
  update_id?: string;
  update_date?: string;
}

export interface MasterType {
  product_group_code: string;
  product_type_code: string;
  description: string;
  is_status: string;
  account_code?: string;
  desc_eng?: string;
  cost_percent?: number;
  price_percent?: number;
  update_id?: string;
  update_date?: string;
}

export interface MasterSubtype {
  product_group_code: string;
  product_type_code: string;
  product_subtype_code: string;
  description: string;
  is_status: string;
  desc_eng?: string;
  idp_code?: string;
  update_id?: string;
  update_date?: string;
}

export interface MsProduct {
  comp_code: string;
  product_code: string;
  product_name: string;
  is_status: string;
  is_spec: string;
  is_spare: string;
  is_rent: string;
  is_special: string;
  is_trade: string;
  is_type: string;
  is_rf: string;
  is_notf: string;
  product_master: string;
  is_warranty: string;
  is_depreciate: string;
  barcode?: string;
  product_brand_code?: string;
  product_group_code?: string;
  product_type_code?: string;
  product_subtype_code?: string;
  model?: string;
  assort_kit?: string;
  extra_spec?: string;
  idp_code?: string;
  photo_path_a?: string;
  photo_path_b?: string;
  unit_buy?: string;
  buyamt1?: number;
  buyamt2?: number;
  unit_sale?: string;
  saleamt1?: number;
  saleamt2?: number;
  std_price?: number;
  std_cost?: number;
  avg_cost?: number;
  stock_min?: number;
  lead_time?: number;
  total_max?: number;
  point_total?: number;
  total_warranty?: number;
  in_vat?: string;
  account_code?: string;
  account_code_c?: string;
  account_code_e?: string;
}

export interface MsProductComponent {
  comp_code: string;
  product_code: string;
  seq: number;
  component_code: string;
  component_qty: number;
  id?: string;
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
  is_project_type: string;
  is_lease: string;
  is_bg: string;
  is_opm: string;
  is_bud: string;
  is_con: string;
  is_mtop: string;
  is_case: string;
  is_rf: string;
  is_labor: string;
  is_notime: string;
  is_group: string;
  is_monthn_e?: string;
  note_sday_e?: number;
  note_eday_e?: number;
  is_monthp_e?: string;
  paid_sday_e?: number;
  paid_eday_e?: number;
  is_monthn_w?: string;
  note_sday_w?: number;
  note_eday_w?: number;
  is_monthp_w?: string;
  paid_sday_w?: number;
  paid_eday_w?: number;
  fund_amount?: number;
  center_amount?: number;
  meter_water?: number;
  meter_electric?: number;
  install_water?: number;
  install_electric?: number;
  room_qty?: number;
  tax_percent?: number;
  total_area_qty?: number;
  building_year?: number;
  tower_no?: number;
  floor_no?: number;
  level_no?: number;
  project_name_rem?: string;
  project_brand_code?: string;
  project_legal_code?: string;
  rms_code?: string;
}

export interface SystemNode {
  sid: string;
  name: string;
  groups: {
    pgid: string;
    name: string;
    programs: {
      pid: string;
      name: string;
    }[];
  }[];
}

export interface ProgramItem {
  pid: string;
  name: string;
  pgid: string;
  pgname?: string;
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
  vp_code?: string;
  remark: string;
  is_status: string;
  is_approve?: string;
  is_vp?: string;
}

export interface MemoBudgetCompany {
  memo_no: string;
  comp_code: string;
  seq: number;
  is_active: string;
  id?: string;
}

export interface MemoBudgetProject {
  memo_no: string;
  project_code: string;
  seq: number;
  is_active: string;
  id?: string;
}

export interface MemoBudgetBgCode {
  memo_no: string;
  budget_code: string;
  seq: number;
  is_active: string;
  id?: string;
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
  comp_code: string;
  memo_no: string;
  seq: number;
  location_code?: string;
  stock_code?: string;
  owner_staff_code?: string;
  owner_name?: string;
  position_code?: string;
  product_name?: string;
  serialno?: string;
  cost_amount?: number;
  remark?: string;
  id?: string;
  project_code?: string;
}

export interface ReceiveCaHead {
  comp_code: string;
  receive_no: string;
  receive_date: string;
  staff_code: string;
  remark?: string;
  is_status: string;
}

export interface ReceiveCaDetail {
  comp_code: string;
  receive_no: string;
  seq: number;
  product_code: string;
  product_name?: string;
  serialno?: string;
  total_amount?: number;
  price?: number;
  id?: string;
}
