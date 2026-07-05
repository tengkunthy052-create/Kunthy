import { Product, Sale, TeamMember, ActionLog, Expense } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'នាឡិកាដៃ Seiko Prospex Divers Automatic',
    sku: 'SK-PRO-AUT-01',
    category: 'នាឡិកាដៃ Automatic (Automatic)',
    stock: 12,
    purchasePrice: 280.0, // Owner only visible
    sellingPrice: 420.0,
    updatedAt: '2026-06-17T14:30:00Z',
    updatedBy: 'Teng SreyPich (បុគ្គលិក)',
  },
  {
    id: 'prod-2',
    name: 'នាឡិកាដៃ Casio G-Shock Rugged Quartz',
    sku: 'CS-GSH-BTR-02',
    category: 'នាឡិកាដៃ ប្រភេទថ្ម (Quartz)',
    stock: 35,
    purchasePrice: 65.0, // Owner only visible
    sellingPrice: 110.0,
    updatedAt: '2026-06-16T10:15:00Z',
    updatedBy: 'Bo Vannak',
  },
  {
    id: 'prod-3',
    name: 'នាឡិកាដៃ Garmin Fenix 7 Pro Solar Edition',
    sku: 'GM-FNX-SP-03',
    category: 'នាឡិកាដៃកីឡា (Sports Watch)',
    stock: 8,
    purchasePrice: 450.0, // Owner only visible
    sellingPrice: 680.0,
    updatedAt: '2026-06-17T09:40:00Z',
    updatedBy: 'Teng SreyPich (បុគ្គលិក)',
  },
  {
    id: 'prod-4',
    name: 'នាឡិកាឆ្លាតវៃ Apple Watch Series 9 GPS',
    sku: 'AP-W9-SMT-04',
    category: 'នាឡិកាដៃ Smart Watch (Smart Watch)',
    stock: 18,
    purchasePrice: 260.0, // Owner only visible
    sellingPrice: 399.0,
    updatedAt: '2026-06-15T16:20:00Z',
    updatedBy: 'Bo Vannak',
  },
  {
    id: 'prod-5',
    name: 'នាឡិកាដៃ Citizen Eco-Drive Aviator Series',
    sku: 'CT-ECO-AVV-05',
    category: 'នាឡិកាដៃ ប្រភេទថ្ម (Quartz)',
    stock: 15,
    purchasePrice: 120.0, // Owner only visible
    sellingPrice: 195.0,
    updatedAt: '2026-06-17T11:05:00Z',
    updatedBy: 'Teng SreyPich (បុគ្គលិក)',
  },
  {
    id: 'prod-6',
    name: 'ប្រអប់ទុកដាក់នាឡិកាប្រណិត និងឈុតថែទាំស្បែក',
    sku: 'BOX-LUX-CLE-06',
    category: 'ផ្សេងៗ (Others)',
    stock: 40,
    purchasePrice: 15.0, // Owner only visible
    sellingPrice: 35.0,
    updatedAt: '2026-06-17T12:00:00Z',
    updatedBy: 'Bo Vannak',
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    productName: 'នាឡិកាដៃ Seiko Prospex Divers Automatic',
    productId: 'prod-1',
    quantity: 1,
    sellingPrice: 420.0,
    totalSelling: 420.0,
    totalCost: 280.0, // Owner only
    date: '2026-06-17T18:10:00Z',
    handledBy: 'Teng SreyPich (បុគ្គលិក)',
  },
  {
    id: 'sale-2',
    productName: 'នាឡិកាដៃ Casio G-Shock Rugged Quartz',
    productId: 'prod-2',
    quantity: 2,
    sellingPrice: 110.0,
    totalSelling: 220.0,
    totalCost: 130.0, // 2 * 65.0 (Owner only)
    date: '2026-06-17T16:45:00Z',
    handledBy: 'Teng SreyPich (បុគ្គលិក)',
  },
  {
    id: 'sale-3',
    productName: 'នាឡិកាឆ្លាតវៃ Apple Watch Series 9 GPS',
    productId: 'prod-4',
    quantity: 1,
    sellingPrice: 399.0,
    totalSelling: 399.0,
    totalCost: 260.0,
    date: '2026-06-16T11:24:00Z',
    handledBy: 'Bo Vannak',
  }
];

// As requested: Only 1 Owner (Bo Vannak) and exactly 2 Admins (Teng Kunthy & Teng SreyPich)
export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Bo Vannak',
    role: 'Owner',
    status: 'Active',
    email: 'vannak.owner@luxurywatch.com',
    salary: 2500, // Owner only visible
    permissions: ['all_access', 'delete_records', 'manage_team', 'view_profits', 'edit_salaries'],
  },
  {
    id: 'team-2',
    name: 'Teng Kunthy',
    role: 'Admin',
    status: 'Active',
    email: 'kunthy.admin@luxurywatch.com',
    salary: 600, // Owner only visible
    permissions: ['read_sales', 'write_sales', 'read_inventory', 'write_inventory'],
  },
  {
    id: 'team-3',
    name: 'Teng SreyPich',
    role: 'Admin',
    status: 'Active',
    email: 'sreypich.admin@luxurywatch.com',
    salary: 500, // Owner only visible
    permissions: ['read_sales', 'write_sales', 'read_inventory', 'write_inventory'],
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    category: 'Salary',
    title: 'ប្រាក់ខែបុគ្គលិក Teng Kunthy (Admin Salary)',
    amount: 600.0,
    date: '2026-06-01T08:00:00Z',
    recordedBy: 'Bo Vannak',
    description: 'ប្រាក់ខែប្រចាំខែមិថុនា ឆ្នាំ២០២៦',
  },
  {
    id: 'exp-2',
    category: 'Salary',
    title: 'ប្រាក់ខែបុគ្គលិក Teng SreyPich (Admin Salary)',
    amount: 500.0,
    date: '2026-06-01T08:30:00Z',
    recordedBy: 'Bo Vannak',
    description: 'ប្រាក់ខែប្រចាំខែមិថុនា ឆ្នាំ២០២៦',
  },
  {
    id: 'exp-3',
    category: 'Rent',
    title: 'ថ្លៃជួលតូបហាងនាឡិកាប្រចាំខែ (Shop Location Rent)',
    amount: 450.0,
    date: '2026-06-02T10:00:00Z',
    recordedBy: 'Bo Vannak',
    description: 'តូបផ្សារទំនើប ជាន់ទី ១',
  },
  {
    id: 'exp-4',
    category: 'Utilities',
    title: 'ថ្លៃអគ្គិសនី និងទឹកប្រចាំហាង (Electricity & Water Utilities)',
    amount: 85.5,
    date: '2026-06-10T11:15:00Z',
    recordedBy: 'Bo Vannak',
    description: 'កត់ត្រាចូលតាមវិក្កយបត្ររដ្ឋ',
  },
  {
    id: 'exp-5',
    category: 'Other',
    title: 'ការចំណាយលើការរៀបចំសម្ភារសម្រាប់ថតផលិតផល (Marketing Prop Expense)',
    amount: 40.0,
    date: '2026-06-12T15:20:00Z',
    recordedBy: 'Teng SreyPich',
    description: 'ទិញផ្កា និងផ្ទាំងរូបភាពតុបតែងដើម្បីរក្សាភាពទាក់ទាញ',
  }
];

export const INITIAL_LOGS: ActionLog[] = [
  {
    id: 'log-1',
    user: 'Teng SreyPich (បុគ្គលិក)',
    role: 'Admin',
    action: 'បញ្ចូលការលក់ (Add Sale)',
    details: 'លក់ នាឡិកាដៃ Seiko Prospex Automatic x1។ ទទួលបានទឹកប្រាក់សរុប $420.00',
    timestamp: '2026-06-17T18:10:00Z',
  },
  {
    id: 'log-2',
    user: 'Teng SreyPich (បុគ្គលិក)',
    role: 'Admin',
    action: 'កែប្រែស្តុក (Update Product)',
    details: 'បានបញ្ចូល ឬកែប្រែ ស្តុកនាឡិកា Apple Watch ទៅ 18 គ្រឿង',
    timestamp: '2026-06-17T11:05:00Z',
  },
  {
    id: 'log-3',
    user: 'Bo Vannak',
    role: 'Owner',
    action: 'ផ្លាស់ប្តូរតួនាទី (Team Config)',
    details: 'បានដំឡើងប្រាក់ខែសមាជិក Teng Kunthy ពី $550 ទៅ $600',
    timestamp: '2026-06-16T10:15:00Z',
  }
];
