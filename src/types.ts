export type Role = 'Owner' | 'Admin';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  purchasePrice: number; // Sensitive information (Owner only)
  sellingPrice: number;  // Shared information
  updatedAt: string;
  updatedBy: string;
  stockType?: 'new' | 'old'; // Stock type: new or old stock
  color?: string; // Product color
  colorStocks?: Record<string, number>; // Structured color stock levels (e.g. {"Black": 10, "Green": 15})
}

export interface Sale {
  id: string;
  productName: string;
  productId: string;
  quantity: number;
  sellingPrice: number;
  totalSelling: number;
  totalCost: number; // Used to calculate profit (Owner only)
  date: string;
  handledBy: string;
  originalSellingPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  color?: string; // Sold product color
  saleChannel?: 'Shop' | 'Online';
  receivedAmount?: number; // Received cash/money
  changeAmount?: number;   // Change returned
  paymentMethod?: 'Cash' | 'ABA' | 'ACLEDA' | 'Mixed'; // Payment source
  mixedBankAmount?: number;
  mixedCashUsdAmount?: number;
  mixedCashRielAmount?: number;
  isService?: boolean;     // Whether it is a service (Battery, Strap, Repair)
  serviceType?: 'Battery' | 'Strap' | 'Repair'; // Service category
  serviceNote?: string;    // Extra service description
  customerName?: string;
  customerPhone?: string;
  warrantyPeriod?: string;
  shippingLocation?: string; // e.g. "Phnom Penh" or "ខេត្តសៀមរាប"
  paymentStatus?: 'Paid' | 'Unpaid' | 'COD'; // Payment status: Paid, Unpaid or Cash-on-delivery
  deliveryCompany?: string; // Delivery company name (e.g. J&T, Vireak Buntham, Capitol, etc.)
  qrPaymentUrl?: string;   // Link or Data URL for the QR payment code
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  status: 'Active' | 'Inactive';
  email: string;
  salary: number; // Sensitive information (Owner only can see / edit)
  permissions: string[];
}

export interface ActionLog {
  id: string;
  user: string;
  role: Role;
  action: string;
  details: string;
  timestamp: string;
}

export interface Expense {
  id: string;
  category: 'Capital' | 'Salary' | 'Rent' | 'Utilities' | 'Marketing' | 'Renovation' | 'Other';
  title: string;
  amount: number;
  date: string;
  recordedBy: string;
  description?: string;
}

export interface DraftChange {
  id: string;
  collection: 'products' | 'sales' | 'expenses' | 'team' | 'logs' | 'stockCounts' | 'monthlyClosings';
  action: 'insert' | 'update' | 'delete';
  documentId: string;
  data: any;
  summaryKm: string;
  summaryEn: string;
  timestamp: string;
}

export interface StockCountItem {
  productId: string;
  productName: string;
  sku: string;
  systemStock: number;
  physicalStock: number;
  variance: number;
}

export interface StockCountSession {
  id: string;
  date: string;
  countedBy: string;
  items: StockCountItem[];
  notes?: string;
}

export interface MonthlyClosing {
  id: string;
  monthYear: string; // e.g. "2026-06"
  closedAt: string;
  closedBy: string;
  totalSales: number;
  totalCost: number;
  totalExpenses: number;
  netProfit: number;
  totalStockCapital: number;
  notes?: string;
}

export interface AppState {
  currentRole: Role;
  currentUser: string;
  products: Product[];
  sales: Sale[];
  team: TeamMember[];
  logs: ActionLog[];
}
