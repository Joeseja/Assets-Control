
export interface MsDeedUtility {
  utility_code: string;
  description: string;
  level_no: number;
  is_status: string;
  record_id?: number;
  record_date?: string;
  update_id?: string;
  update_date?: string;
}

export interface MsDeedPayment {
  year_no: number;
  utility_code: string;
  seq: number;
  begin_date?: string;
  end_date?: string;
  sland_amount: number;
  eland_amount: number;
  tax_rate_percent: number;
  tax_paid_amount: number;
  is_status: string;
  record_id?: number;
  record_date?: string;
  update_id?: string;
  update_date?: string;
  utility_description?: string; // UI usage
}

export interface DeedBookYear {
  year_no: number;
  book_code: string;
  project_code: string;
  deed_id?: string;
  tower_no?: string;
  floor_no?: string;
  plan_no?: string;
  home_no?: string;
  land_no?: string;
  explore_no?: string;
  deed_code?: string;
  sales_status_code?: string;
  construct_date?: string;
  allocate_no?: string;
  deed_sales_qty?: number;
  deed_qty?: number;
  balcony_qty?: number;
  building_qty?: number;
  progress_percent?: number;
  appraisal_land?: number;
  appraisal_building?: number;
  appraisal_balcony?: number;
  depreciation_percent?: number;
  utility_code?: string;
  tax_rate_percent?: number;
  province_name?: string;
  amphur_name?: string;
  district_name?: string;
  is_status: string;
  record_id?: number;
  record_date?: string;
  update_id?: string;
  update_date?: string;
  project_name?: string; // UI usage
  utility_description?: string; // UI usage
}

export interface BrwcaHead {
  comp_code: string;
  brw_no: string;
  brw_date: string;
  staff_code?: string;
  outlocation_code?: string;
  outstock_code?: string;
  inlocation_code?: string;
  instock_code?: string;
  is_manager?: string;
  manager_code?: string;
  manager_date?: string;
  is_checker?: string;
  checker_code?: string;
  checker_date?: string;
  is_boq?: string;
  is_checker2?: string;
  checker2_code?: string;
  checker2_date?: string;
  approve_code?: string;
  approve_date?: string;
  budget_code?: string;
  pr_no?: string;
  is_stock?: string;
  remark?: string;
  is_status: string;
  update_id?: number;
  update_date?: string;
  is_tax?: string;
  tax_percent?: number;
  is_vat?: string;
  vat_percent?: number;
}

export interface BrwcaDetail {
  comp_code: string;
  brw_no: string;
  seq: number;
  serialno?: string;
  product_code?: string;
  product_name?: string; // UI usage
  location_code?: string;
  stock_code?: string;
  comp_code_buy?: string;
  price?: number;
  cost_percent?: number;
  cost_amount?: number;
  total_amount?: number;
  id?: string; // UI internal ID
}

export interface MsProject {
  project_code: string;
  description: string;
  comp_code: string;
  is_status: string;
  is_project_type?: string;
  is_lease?: string;
  is_bg?: string;
  is_opm?: string;
  is_bud?: string;
  is_con?: string;
  is_mtop?: string;
  is_case?: string;
  is_rf?: string;
  is_labor?: string;
  is_notime?: string;
  is_group?: string;
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
  update_id?: string;
  update_date?: string;
  location_code?: string;
  branch_id?: string;
  [key: string]: any;
}

export interface MsSupplier {
  supplier_code: string;
  supplier_name: string;
  rms_code?: string;
  address1?: string;
  address2?: string;
  supplier_name_e?: string;
  addresse1?: string;
  addresse2?: string;
  phone?: string;
  fax?: string;
  email?: string;
  vat_percent?: number;
  pass_no?: string;
  is_vat?: string;
  is_status: string;
  account_code_s?: string;
  account_code_t?: string;
  record_id?: string;
  record_date?: string;
  update_id?: string;
  update_date?: string;
}

export interface MsProduct {
  comp_code: string;
  product_code: string;
  barcode?: string;
  product_brand_code?: string;
  product_group_code?: string;
  product_type_code?: string;
  product_subtype_code?: string;
  product_name: string;
  model?: string;
  unit_buy?: string;
  buyamt1?: number;
  buyamt2?: number;
  unit_sale?: string;
  saleamt1?: number;
  saleamt2?: number;
  assort_kit?: string;
  avg_cost?: number;
  std_cost?: number;
  std_price?: number;
  stock_min?: number;
  lead_time?: number;
  photo_path_a?: string;
  photo_path_b?: string;
  is_warranty?: string;
  total_warranty?: number;
  in_vat?: string;
  extra_spec?: string;
  product_master?: string;
  point_total?: number;
  is_spec?: string;
  is_spare?: string;
  is_status: string;
  update_id?: string;
  update_date?: string;
  is_rent?: string;
  account_code?: string;
  is_depreciate?: string;
  total_max?: number;
  is_special?: string;
  idp_code?: string;
  is_notf?: string;
  is_trade?: string;
  is_type?: string;
  is_rf?: string;
  account_code_c?: string;
  account_code_e?: string;
}

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
  id?: string; // UI temporary ID
}

export interface SalesHead {
  doc_no: string;
  doc_date: string;
  is_status: string;
  comp_code?: string;
}

export interface SalesDetail {
  doc_no: string;
  product_code: string;
  product_name: string;
  qty: number;
  id?: string; // UI temporary ID
}

export interface WarehouseType {
  code: string;
  description: string;
}

export interface StockMovement {
  date: string;
  docNo: string;
  type: 'IN' | 'OUT';
  itemName: string;
  qty: number;
  balance: number;
}

export type MovementItem = StockMovement;

export interface ProjectItem {
  project_code: string;
  description: string;
  comp_code: string;
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

export interface StockBalanceItem {
  name: string;
  qty: number;
  type: string;
  code?: string;
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
  is_enter?: string;
  is_approve?: string;
  is_vp?: string;
  vp_code?: string;
}

export interface PlanCheckDetail {
  plan_no: string;
  seq: number;
  serialno: string;
  is_status: string;
  staff_code?: string;
  staff_name?: string;
  comp_code: string;
}

export interface MasterGroup extends ProductGroupItem {
  is_status: string;
  update_id?: string;
  update_date?: string;
}

export interface MasterType extends ProductTypeItem {
  product_group_code: string;
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
  idp_code?: string;
  desc_eng?: string;
  update_id?: string;
  update_date?: string;
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

export interface SystemNode {
  sid: string;
  name: string;
  groups: SystemGroupNode[];
}

export interface SystemGroupNode {
  pgid: string;
  name: string;
  programs: ProgramItem[];
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
  is_first: string; // '1' or '2'
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
  owner_staff_code?: string;
  owner_name?: string;
  position_code?: string;
  product_name?: string;
  serialno?: string;
  location_code?: string;
  stock_code?: string;
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
  total_amount: number;
  price: number;
}

// Added MsBank interface to resolve import errors in apiService and MasterCompany
export interface MsBank {
  bank_code: string;
  description: string;
}
