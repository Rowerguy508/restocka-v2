// Database types for ReStocka
// These match the Supabase schema

export type Role = 'OWNER' | 'MANAGER';

export type AutomationMode = 'MANUAL' | 'ASSISTED' | 'AUTO';

export type POStatus = 'DRAFT' | 'SENT' | 'DELIVERED' | 'PROBLEM' | 'CANCELED';

export type StockStatus = 'OK' | 'LOW' | 'CRITICAL';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  address?: string;
  timezone?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  location_id?: string; // null for OWNER, set for MANAGER
  role: Role;
  created_at: string;
}

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  unit: string;
  category?: string;
  active: boolean;
  created_at: string;
}

export interface StockLevel {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  status: StockStatus;
  last_updated: string;
}

export interface UsageRate {
  id: string;
  product_id: string;
  location_id: string;
  daily_usage: number;
  updated_at: string;
}

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  whatsapp_phone?: string;
  email?: string;
  lead_time_hours: number;
  created_at: string;
}

export interface ReorderRule {
  id: string;
  product_id: string;
  location_id: string;
  supplier_id?: string;
  safety_days: number;
  reorder_qty: number;
  automation_mode: AutomationMode;
  emergency_override: boolean;
  price_cap?: number;
  max_spend?: number;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  location_id: string;
  supplier_id: string;
  status: POStatus;
  total_amount?: number;
  notes?: string;
  whatsapp_message?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price?: number;
  product?: Product;
}

export interface DeliveryConfirmation {
  id: string;
  purchase_order_id: string;
  confirmed_by: string;
  delivered: boolean;
  photo_url?: string;
  notes?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  organization_id: string;
  location_id?: string;
  type: string;
  message: string;
  resolved: boolean;
  created_at: string;
}

// View types for dashboard data
export interface LowStockItem {
  product_id: string;
  product_name: string;
  location_name: string;
  current_qty: number;
  unit: string;
  status: StockStatus;
  days_remaining?: number;
}

export interface ManagerDashboardItem {
  product_id: string;
  product_name: string;
  current_qty: number;
  unit: string;
  status: StockStatus;
}

export type IntegrationProvider = 'WHATSAPP' | 'UBER_EATS' | 'PEDIDOS_YA' | 'PRICESMART';
export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface Integration {
  id: string;
  organization_id: string;
  location_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  settings: Record<string, any>;
  created_at: string;
}
