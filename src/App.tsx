import React, { useState, useEffect, useMemo } from 'react';
import { Product, Sale, TeamMember, ActionLog, Expense, Role, DraftChange, StockCountSession, StockCountItem, MonthlyClosing } from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SALES, 
  INITIAL_TEAM, 
  INITIAL_EXPENSES,
  INITIAL_LOGS 
} from './data';
import { db } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { translations, Language } from './translations';
import InventoryManager from './components/InventoryManager';
import SalesManager from './components/SalesManager';
import PaymentStatusDashboard from './components/PaymentStatusDashboard';
import ServiceManager from './components/ServiceManager';
import ExpenseManager from './components/ExpenseManager';
import TeamManager from './components/TeamManager';
import ActionLogs from './components/ActionLogs';
import InstallGuide from './components/InstallGuide';
import ShopBrandingForm from './components/ShopBrandingForm';

import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  Lock, 
  Key,
  RotateCcw, 
  Briefcase, 
  DollarSign, 
  Activity, 
  Globe,
  Smartphone,
  CircleDollarSign,
  Coins,
  Layers,
  User,
  ShieldCheck,
  AlertTriangle,
  Watch,
  Clock,
  Gem,
  Award,
  Store,
  ShoppingBag,
  Sparkles,
  Flame,
  Pencil,
  Image,
  Paintbrush,
  Wrench,
  X,
  Trash2,
  Database,
  Download,
  UploadCloud,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const logoColorStylesByTheme: Record<string, { bg: string, border: string, text: string, bgDark: string, textAccent: string, glow: string }> = {
  indigo: { bg: 'bg-indigo-50/90', border: 'border-indigo-200', text: 'text-indigo-600', bgDark: 'bg-indigo-600/10', textAccent: 'text-indigo-700', glow: 'shadow-indigo-100' },
  emerald: { bg: 'bg-emerald-50/90', border: 'border-emerald-200', text: 'text-emerald-600', bgDark: 'bg-emerald-600/10', textAccent: 'text-emerald-700', glow: 'shadow-emerald-100' },
  amber: { bg: 'bg-amber-50/90', border: 'border-amber-200', text: 'text-amber-600', bgDark: 'bg-amber-600/10', textAccent: 'text-amber-700', glow: 'shadow-amber-100' },
  rose: { bg: 'bg-rose-50/90', border: 'border-rose-200', text: 'text-rose-600', bgDark: 'bg-rose-600/10', textAccent: 'text-rose-700', glow: 'shadow-rose-100' },
  cyan: { bg: 'bg-cyan-50/90', border: 'border-cyan-200', text: 'text-cyan-600', bgDark: 'bg-cyan-600/10', textAccent: 'text-cyan-700', glow: 'shadow-cyan-100' },
  teal: { bg: 'bg-teal-50/90', border: 'border-teal-200', text: 'text-teal-600', bgDark: 'bg-teal-600/10', textAccent: 'text-teal-700', glow: 'shadow-teal-100' },
  violet: { bg: 'bg-violet-50/90', border: 'border-violet-200', text: 'text-violet-600', bgDark: 'bg-violet-600/10', textAccent: 'text-violet-700', glow: 'shadow-violet-100' },
  slate: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600', bgDark: 'bg-slate-800/20', textAccent: 'text-slate-700', glow: 'shadow-slate-100' },
};

interface ShopLogoProps {
  type: 'icon' | 'image';
  iconName: string;
  imgUrl: string;
  className?: string;
}

export function ShopLogo({ type, iconName, imgUrl, className = "w-6 h-6" }: ShopLogoProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imgUrl]);

  if (type === 'image' && imgUrl && !imgError) {
    return (
      <img 
        src={imgUrl} 
        alt="Logo" 
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${className} object-cover rounded`}
      />
    );
  }
  
  switch (iconName) {
    case 'Watch': return <Watch className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'Gem': return <Gem className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Store': return <Store className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Flame': return <Flame className={className} />;
    default: return <Watch className={className} />;
  }
}

export type LoginThemeId = 'emerald' | 'sapphire' | 'rosegold' | 'amber' | 'amethyst' | 'cyan';

export interface LoginThemeConfig {
  nameKm: string;
  nameEn: string;
  bgGlows: string;
  logoBorder: string;
  logoGlow: string;
  watchColor: string;
  subtitleColor: string;
  lineColor: string;
  cardTopBorder: string;
  cardFocusRing: string;
  checkboxBg: string;
  checkboxBorder: string;
  buttonBg: string;
  buttonHoverBg: string;
  buttonActiveBg: string;
  footerColor: string;
}

export const LOGIN_THEMES: Record<LoginThemeId, LoginThemeConfig> = {
  emerald: {
    nameKm: 'រតនភណ្ឌបៃតង (Rolex Emerald)',
    nameEn: 'Rolex Emerald',
    bgGlows: 'from-emerald-950/20 via-slate-950 to-black',
    logoBorder: 'border-emerald-500/40',
    logoGlow: 'shadow-emerald-500/15',
    watchColor: 'text-emerald-400',
    subtitleColor: 'text-emerald-400',
    lineColor: 'from-transparent via-emerald-500/40 to-transparent',
    cardTopBorder: 'from-transparent via-emerald-500 to-transparent',
    cardFocusRing: 'focus-within:border-emerald-500/80 focus:border-emerald-500/80 focus:ring-emerald-500/30',
    checkboxBg: 'bg-emerald-600',
    checkboxBorder: 'border-emerald-500/30',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700',
    buttonHoverBg: 'hover:bg-emerald-500',
    buttonActiveBg: 'active:bg-emerald-700',
    footerColor: 'text-emerald-600/40',
  },
  sapphire: {
    nameKm: 'កែវកក់ខៀវ (Royal Sapphire)',
    nameEn: 'Royal Sapphire',
    bgGlows: 'from-blue-950/20 via-slate-950 to-black',
    logoBorder: 'border-blue-500/40',
    logoGlow: 'shadow-blue-500/15',
    watchColor: 'text-blue-400',
    subtitleColor: 'text-blue-400',
    lineColor: 'from-transparent via-blue-500/40 to-transparent',
    cardTopBorder: 'from-transparent via-blue-500 to-transparent',
    cardFocusRing: 'focus-within:border-blue-500/80 focus:border-blue-500/80 focus:ring-blue-500/30',
    checkboxBg: 'bg-blue-600',
    checkboxBorder: 'border-blue-500/30',
    buttonBg: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
    buttonHoverBg: 'hover:bg-blue-500',
    buttonActiveBg: 'active:bg-blue-700',
    footerColor: 'text-blue-600/40',
  },
  rosegold: {
    nameKm: 'មាសផ្កាឈូក (Rose Gold)',
    nameEn: 'Imperial Rose Gold',
    bgGlows: 'from-rose-950/20 via-slate-950 to-black',
    logoBorder: 'border-rose-400/40',
    logoGlow: 'shadow-rose-400/15',
    watchColor: 'text-rose-400',
    subtitleColor: 'text-rose-400',
    lineColor: 'from-transparent via-rose-400/40 to-transparent',
    cardTopBorder: 'from-transparent via-rose-400 to-transparent',
    cardFocusRing: 'focus-within:border-rose-400/80 focus:border-rose-400/80 focus:ring-rose-400/30',
    checkboxBg: 'bg-rose-500',
    checkboxBorder: 'border-rose-400/30',
    buttonBg: 'bg-rose-500 hover:bg-rose-400 active:bg-rose-600',
    buttonHoverBg: 'hover:bg-rose-400',
    buttonActiveBg: 'active:bg-rose-600',
    footerColor: 'text-rose-600/40',
  },
  amber: {
    nameKm: 'គន្ធីមាស (Kunthy Amber)',
    nameEn: 'Kunthy Amber',
    bgGlows: 'from-amber-950/20 via-slate-950 to-black',
    logoBorder: 'border-amber-500/40',
    logoGlow: 'shadow-amber-500/15',
    watchColor: 'text-amber-500',
    subtitleColor: 'text-amber-500',
    lineColor: 'from-transparent via-amber-500/40 to-transparent',
    cardTopBorder: 'from-transparent via-amber-500 to-transparent',
    cardFocusRing: 'focus-within:border-amber-500/80 focus:border-amber-500/80 focus:ring-amber-500/30',
    checkboxBg: 'bg-amber-500',
    checkboxBorder: 'border-amber-500/30',
    buttonBg: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700',
    buttonHoverBg: 'hover:bg-amber-500',
    buttonActiveBg: 'active:bg-amber-700',
    footerColor: 'text-amber-600/40',
  },
  amethyst: {
    nameKm: 'កែវពណ៌ស្វាយ (Royal Amethyst)',
    nameEn: 'Royal Amethyst',
    bgGlows: 'from-violet-950/20 via-slate-950 to-black',
    logoBorder: 'border-violet-500/40',
    logoGlow: 'shadow-violet-500/15',
    watchColor: 'text-violet-400',
    subtitleColor: 'text-violet-400',
    lineColor: 'from-transparent via-violet-500/40 to-transparent',
    cardTopBorder: 'from-transparent via-violet-500 to-transparent',
    cardFocusRing: 'focus-within:border-violet-500/80 focus:border-violet-500/80 focus:ring-violet-500/30',
    checkboxBg: 'bg-violet-600',
    checkboxBorder: 'border-violet-500/30',
    buttonBg: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700',
    buttonHoverBg: 'hover:bg-violet-500',
    buttonActiveBg: 'active:bg-violet-700',
    footerColor: 'text-violet-600/40',
  },
  cyan: {
    nameKm: 'កែវមរកតខ្ចី (Teal Mint)',
    nameEn: 'Teal Mint',
    bgGlows: 'from-teal-950/20 via-slate-950 to-black',
    logoBorder: 'border-teal-400/40',
    logoGlow: 'shadow-teal-400/15',
    watchColor: 'text-teal-400',
    subtitleColor: 'text-teal-400',
    lineColor: 'from-transparent via-teal-400/40 to-transparent',
    cardTopBorder: 'from-transparent via-teal-400 to-transparent',
    cardFocusRing: 'focus-within:border-teal-400/80 focus:border-teal-400/80 focus:ring-teal-400/30',
    checkboxBg: 'bg-teal-500',
    checkboxBorder: 'border-teal-400/30',
    buttonBg: 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700',
    buttonHoverBg: 'hover:bg-teal-500',
    buttonActiveBg: 'active:bg-teal-700',
    footerColor: 'text-teal-600/40',
  },
};

export default function App() {
  // Multilingual Configuration
  const [lang, setLang] = useState<Language>(() => {
    const cachedLang = localStorage.getItem('erp_language_preference');
    return (cachedLang === 'en' || cachedLang === 'km') ? cachedLang : 'km';
  });

  const t = translations[lang];

  // Shop Settings Configuration
  const [shopNameKm, setShopNameKm] = useState<string>(() => {
    return localStorage.getItem('op_erp_shop_name_km') || 'ប្រព័ន្ធគ្រប់គ្រងការលក់ និងស្តុកនាឡិកាដៃប្រណិត ERP';
  });

  const [shopNameEn, setShopNameEn] = useState<string>(() => {
    return localStorage.getItem('op_erp_shop_name_en') || 'Luxury Watch Enterprise ERP Tracker';
  });

  const [shopLogoType, setShopLogoType] = useState<'icon' | 'image'>(() => {
    return (localStorage.getItem('op_erp_shop_logo_type') as 'icon' | 'image') || 'icon';
  });

  const [shopLogoIcon, setShopLogoIcon] = useState<string>(() => {
    return localStorage.getItem('op_erp_shop_logo_icon') || 'Watch';
  });

  const [shopLogoImgUrl, setShopLogoImgUrl] = useState<string>(() => {
    return localStorage.getItem('op_erp_shop_logo_img_url') || '';
  });

  const [shopLogoColor, setShopLogoColor] = useState<string>(() => {
    return localStorage.getItem('op_erp_shop_logo_color') || 'indigo';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    return Number(localStorage.getItem('op_erp_exchange_rate')) || 4100;
  });

  const [isEditingShop, setIsEditingShop] = useState(false);

  const handleSaveShopConfig = async (config: { 
    nameKm: string; 
    nameEn: string; 
    logoType: 'icon' | 'image'; 
    logoIcon: string; 
    logoImgUrl: string; 
    logoColor: string;
    exchangeRate?: number;
  }) => {
    const brandingData = {
      id: 'branding',
      ...config,
      exchangeRate: config.exchangeRate || 4100
    };
    
    // 1. Instantly update local state
    setShopNameKm(config.nameKm);
    setShopNameEn(config.nameEn);
    setShopLogoType(config.logoType);
    setShopLogoIcon(config.logoIcon);
    setShopLogoImgUrl(config.logoImgUrl);
    setShopLogoColor(config.logoColor);
    setExchangeRate(config.exchangeRate || 4100);

    // 2. Instantly update localStorage keys
    localStorage.setItem('op_erp_shop_name_km', config.nameKm);
    localStorage.setItem('op_erp_shop_name_en', config.nameEn);
    localStorage.setItem('op_erp_shop_logo_type', config.logoType);
    localStorage.setItem('op_erp_shop_logo_icon', config.logoIcon);
    localStorage.setItem('op_erp_shop_logo_img_url', config.logoImgUrl);
    localStorage.setItem('op_erp_shop_logo_color', config.logoColor);
    localStorage.setItem('op_erp_exchange_rate', String(config.exchangeRate || 4100));

    // 3. Try Firestore
    try {
      await setDoc(doc(db, 'shopSettings', 'branding'), brandingData);
    } catch (err: any) {
      console.warn("Firestore save shop config failed, proceeding locally:", err);
    }

    await logSystemAction(
      'កែសម្រួលព័ត៌មានហាង (Update Shop Branding)', 
      `បានកែប្រែឈ្មោះហាងទៅជា "${config.nameKm}" (${config.nameEn}) រួមនិងនិមិត្តសញ្ញា`
    );
    setIsEditingShop(false);
  };

  // Secure Authentication Lock Screen States (ពេល Website បើកដំបូង ត្រូវ Username and password)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('erp_is_logged_in') === 'true';
  });
  
  // Credentials
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Password, Remember Me and Login Theme states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem('erp_remember_me') !== 'false';
  });
  const [loginThemeId, setLoginThemeId] = useState<LoginThemeId>(() => {
    return (localStorage.getItem('erp_login_theme') as LoginThemeId) || 'emerald';
  });

  // Load or initialize state
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    return (sessionStorage.getItem('erp_current_role') as Role) || 'Owner';
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return sessionStorage.getItem('erp_current_user') || 'Bo Vannak';
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('op_erp_products');
    return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const cached = localStorage.getItem('op_erp_sales');
    return cached ? JSON.parse(cached) : INITIAL_SALES;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const cached = localStorage.getItem('op_erp_expenses');
    return cached ? JSON.parse(cached) : INITIAL_EXPENSES;
  });
  const [team, setTeam] = useState<TeamMember[]>(() => {
    const cached = localStorage.getItem('op_erp_team');
    return cached ? JSON.parse(cached) : INITIAL_TEAM;
  });
  const [logs, setLogs] = useState<ActionLog[]>(() => {
    const cached = localStorage.getItem('op_erp_logs');
    return cached ? JSON.parse(cached) : INITIAL_LOGS;
  });

  const [stockCounts, setStockCounts] = useState<StockCountSession[]>(() => {
    const cached = localStorage.getItem('op_erp_stock_counts');
    return cached ? JSON.parse(cached) : [];
  });
  const [monthlyClosings, setMonthlyClosings] = useState<MonthlyClosing[]>(() => {
    const cached = localStorage.getItem('op_erp_monthly_closings');
    return cached ? JSON.parse(cached) : [];
  });

  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Backup & Restore state variables
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [dragOverActive, setDragOverActive] = useState(false);
  const [backupFileToImport, setBackupFileToImport] = useState<any | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importStatus, setImportStatus] = useState<{ status: 'idle' | 'reading' | 'valid' | 'invalid' | 'restoring' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

  const handleExportBackup = () => {
    try {
      const backupPayload = {
        version: "1.0",
        appName: "luxury_watch_erp_backup",
        backupDate: new Date().toISOString(),
        shopSettings: {
          nameKm: shopNameKm,
          nameEn: shopNameEn,
          logoType: shopLogoType,
          logoIcon: shopLogoIcon,
          logoImgUrl: shopLogoImgUrl,
          logoColor: shopLogoColor
        },
        data: {
          products,
          sales,
          expenses,
          team,
          logs
        }
      };

      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const fileDate = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
      const filename = `luxury_watch_erp_backup_${fileDate}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logSystemAction(
        'រក្សាទុកទិន្នន័យ (Backup ERP)',
        `បានចម្លង និងទាញយកទិន្នន័យស្តុក វិក្កយបត្រ ចំណាយ និងបុគ្គលិកទៅជា File JSON [${filename}]`
      );
    } catch (err: any) {
      console.error(err);
      alert(lang === 'km' ? `ការចម្លងបរាជ័យ៖ ${err.message}` : `Backup failed: ${err.message}`);
    }
  };

  const handleFileDropOrSelect = (file: File) => {
    if (!file) return;
    setImportFileName(file.name);
    setImportStatus({ status: 'reading', message: lang === 'km' ? 'កំពុងអានឯកសារ...' : 'Reading file...' });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        
        const isValid = parsed && 
          (parsed.appName === "luxury_watch_erp_backup" || 
           (parsed.data && (Array.isArray(parsed.data.products) || Array.isArray(parsed.data.sales))));
           
        if (isValid) {
          setBackupFileToImport(parsed);
          const statsKm = `រកឃើញទិន្នន័យ៖ ទំនិញ (${parsed.data?.products?.length || 0}), លក់ចេញ (${parsed.data?.sales?.length || 0}), ចំណាយ (${parsed.data?.expenses?.length || 0})`;
          const statsEn = `Loaded and validated. Found: Products (${parsed.data?.products?.length || 0}), Sales (${parsed.data?.sales?.length || 0}), Expenses (${parsed.data?.expenses?.length || 0})`;
          setImportStatus({ 
            status: 'valid', 
            message: lang === 'km' ? statsKm : statsEn 
          });
        } else {
          setBackupFileToImport(null);
          setImportStatus({ 
            status: 'invalid', 
            message: lang === 'km' 
              ? 'ឯកសារមិនត្រឹមត្រូវទេ! សូមប្រាកដថាអ្នកបានជ្រើសរើស Backup file ស្តង់ដារដែលទាញចេញពីកម្មវិធីនេះ។' 
              : 'Invalid backup format! Please use a JSON backup file downloaded of this app.' 
          });
        }
      } catch (err: any) {
        setBackupFileToImport(null);
        setImportStatus({ 
          status: 'invalid', 
          message: lang === 'km' 
            ? 'មិនអាចអាន JSON បានឡើយ! ឯកសារប្រហែលជាខូចខាត។' 
            : 'JSON parse error! The file might be corrupted.' 
        });
      }
    };
    reader.onerror = () => {
      setBackupFileToImport(null);
      setImportStatus({ status: 'error', message: 'Failed to read file.' });
    };
    reader.readAsText(file);
  };

  const handleRestoreDatabase = async () => {
    if (!backupFileToImport || !backupFileToImport.data) return;
    
    setImportStatus({ 
      status: 'restoring', 
      message: lang === 'km' ? 'កំពុងសម្អាត និងបញ្ចូលទិន្នន័យទៅ Firestore...' : 'Wiping database and restoring to Firestore...' 
    });
    
    try {
      const payloadData = backupFileToImport.data;
      
      const newProducts = Array.isArray(payloadData.products) ? payloadData.products : [];
      const newSales = Array.isArray(payloadData.sales) ? payloadData.sales : [];
      const newExpenses = Array.isArray(payloadData.expenses) ? payloadData.expenses : [];
      const newTeam = Array.isArray(payloadData.team) ? payloadData.team : [];
      const newLogs = Array.isArray(payloadData.logs) ? payloadData.logs : [];
      
      // Update local storage and states instantly
      localStorage.setItem('op_erp_products', JSON.stringify(newProducts));
      localStorage.setItem('op_erp_sales', JSON.stringify(newSales));
      localStorage.setItem('op_erp_expenses', JSON.stringify(newExpenses));
      localStorage.setItem('op_erp_team', JSON.stringify(newTeam));
      localStorage.setItem('op_erp_logs', JSON.stringify(newLogs));
      
      setProducts(newProducts);
      setSales(newSales);
      setExpenses(newExpenses);
      setTeam(newTeam);
      setLogs(newLogs);

      if (backupFileToImport.shopSettings) {
        const ss = backupFileToImport.shopSettings;
        if (ss.nameKm) {
          localStorage.setItem('op_erp_shop_name_km', ss.nameKm);
          setShopNameKm(ss.nameKm);
        }
        if (ss.nameEn) {
          localStorage.setItem('op_erp_shop_name_en', ss.nameEn);
          setShopNameEn(ss.nameEn);
        }
        if (ss.logoType) {
          localStorage.setItem('op_erp_shop_logo_type', ss.logoType);
          setShopLogoType(ss.logoType);
        }
        if (ss.logoIcon) {
          localStorage.setItem('op_erp_shop_logo_icon', ss.logoIcon);
          setShopLogoIcon(ss.logoIcon);
        }
        if (ss.logoColor) {
          localStorage.setItem('op_erp_shop_logo_color', ss.logoColor);
          setShopLogoColor(ss.logoColor);
        }
      }

      // Sync down to cloud Firestore
      try {
        const collectionsToClear = ['products', 'sales', 'expenses', 'team', 'logs'];
        for (const coll of collectionsToClear) {
          const snap = await getDocs(collection(db, coll));
          const batch = writeBatch(db);
          snap.forEach((docSnap) => batch.delete(docSnap.ref));
          await batch.commit();
        }

        // Add Products
        for (const p of newProducts) {
          await setDoc(doc(db, 'products', p.id), p);
        }
        // Add Sales
        for (const s of newSales) {
          await setDoc(doc(db, 'sales', s.id), s);
        }
        // Add Expenses
        for (const e of newExpenses) {
          await setDoc(doc(db, 'expenses', e.id), e);
        }
        // Add Team
        for (const tm of newTeam) {
          await setDoc(doc(db, 'team', tm.id), tm);
        }

        const restoreLog: ActionLog = {
          id: `log-${Date.now()}`,
          user: currentUser,
          role: currentRole,
          action: 'សង្គ្រោះទិន្នន័យ (Restore Backup)',
          details: `បានសង្គ្រោះទិន្នន័យ និងព័ត៌មានហាងទាំងស្រុងពី Backup File៖ [${importFileName}]`,
          timestamp: new Date().toISOString(),
        };
        await setDoc(doc(db, 'logs', restoreLog.id), restoreLog);

        for (const l of newLogs.slice(0, 15)) {
          await setDoc(doc(db, 'logs', l.id), l);
        }
        setSyncError(null);
      } catch (dbErr: any) {
        console.warn("Firestore error during restore:", dbErr);
      }

      setImportStatus({ 
        status: 'success', 
        message: lang === 'km' 
          ? 'បានសង្គ្រោះទិន្នន័យ និងព័ត៌មានហាងពី Backup File ដោយជោគជ័យ!' 
          : 'All shop and ERP datasets restored successfully from the backup file!' 
      });
      setBackupFileToImport(null);
    } catch (err: any) {
      console.error(err);
      setImportStatus({ 
        status: 'error', 
        message: lang === 'km' ? `សង្គ្រោះទិន្នន័យបរាជ័យ៖ ${err.message}` : `Restore Failed: ${err.message}` 
      });
    }
  };

  // Draft & Publish state
  const [isDraftMode, setIsDraftMode] = useState<boolean>(() => {
    return localStorage.getItem('op_erp_is_draft_mode') === 'true';
  });

  const [draftChanges, setDraftChanges] = useState<DraftChange[]>(() => {
    const saved = localStorage.getItem('op_erp_draft_changes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('op_erp_is_draft_mode', String(isDraftMode));
  }, [isDraftMode]);

  useEffect(() => {
    localStorage.setItem('op_erp_draft_changes', JSON.stringify(draftChanges));
  }, [draftChanges]);

  const addDraftChange = (change: Omit<DraftChange, 'id' | 'timestamp'>) => {
    const newChange: DraftChange = {
      ...change,
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    setDraftChanges(prev => [...prev, newChange]);
  };

  // computed/visible arrays backed by local drafts
  const visibleProducts = useMemo(() => {
    let result = [...products];
    draftChanges.filter(c => c.collection === 'products').forEach(change => {
      if (change.action === 'insert') {
        if (!result.some(p => p.id === change.documentId)) {
          result.push(change.data);
        }
      } else if (change.action === 'update') {
        result = result.map(p => p.id === change.documentId ? { ...p, ...change.data } : p);
      } else if (change.action === 'delete') {
        result = result.filter(p => p.id !== change.documentId);
      }
    });
    return result;
  }, [products, draftChanges]);

  const visibleSales = useMemo(() => {
    let result = [...sales];
    draftChanges.filter(c => c.collection === 'sales').forEach(change => {
      if (change.action === 'insert') {
        if (!result.some(s => s.id === change.documentId)) {
          result.push(change.data);
        }
      } else if (change.action === 'update') {
        result = result.map(s => s.id === change.documentId ? { ...s, ...change.data } : s);
      } else if (change.action === 'delete') {
        result = result.filter(s => s.id !== change.documentId);
      }
    });
    return result;
  }, [sales, draftChanges]);

  const visibleExpenses = useMemo(() => {
    let result = [...expenses];
    draftChanges.filter(c => c.collection === 'expenses').forEach(change => {
      if (change.action === 'insert') {
        if (!result.some(e => e.id === change.documentId)) {
          result.push(change.data);
        }
      } else if (change.action === 'update') {
        result = result.map(e => e.id === change.documentId ? { ...e, ...change.data } : e);
      } else if (change.action === 'delete') {
        result = result.filter(e => e.id !== change.documentId);
      }
    });
    return result;
  }, [expenses, draftChanges]);

  const visibleTeam = useMemo(() => {
    let result = [...team];
    draftChanges.filter(c => c.collection === 'team').forEach(change => {
      if (change.action === 'insert') {
        if (!result.some(t => t.id === change.documentId)) {
          result.push(change.data);
        }
      } else if (change.action === 'update') {
        result = result.map(t => t.id === change.documentId ? { ...t, ...change.data } : t);
      } else if (change.action === 'delete') {
        result = result.filter(t => t.id !== change.documentId);
      }
    });
    return result;
  }, [team, draftChanges]);

  const visibleLogs = useMemo(() => {
    let result = [...logs];
    draftChanges.filter(c => c.collection === 'logs').forEach(change => {
      if (change.action === 'insert') {
        if (!result.some(l => l.id === change.documentId)) {
          result.push(change.data);
        }
      } else if (change.action === 'update') {
        result = result.map(l => l.id === change.documentId ? { ...l, ...change.data } : l);
      } else if (change.action === 'delete') {
        result = result.filter(l => l.id !== change.documentId);
      }
    });
    return result;
  }, [logs, draftChanges]);

  const visibleStockCounts = useMemo(() => {
    let result = [...stockCounts];
    draftChanges.filter(c => c.collection === 'stockCounts').forEach(change => {
      if (change.action === 'insert') {
        if (!result.some(s => s.id === change.documentId)) {
          result.push(change.data);
        }
      }
    });
    return result;
  }, [stockCounts, draftChanges]);

  const visibleMonthlyClosings = useMemo(() => {
    let result = [...monthlyClosings];
    draftChanges.filter(c => c.collection === 'monthlyClosings').forEach(change => {
      if (change.action === 'insert') {
        if (!result.some(m => m.id === change.documentId)) {
          result.push(change.data);
        }
      }
    });
    return result;
  }, [monthlyClosings, draftChanges]);

  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'payments' | 'service' | 'expenses' | 'staff' | 'install'>('inventory');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("App went online");
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log("App went offline");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (currentUser === 'Teng SreyPich' && activeTab === 'staff') {
      setActiveTab('inventory');
    }
  }, [currentUser, activeTab]);

  // Theme & Refresh States
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('erp_is_dark') === 'true';
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());

  const handleRefreshApp = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 850);
  };

  const toggleDarkMode = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    localStorage.setItem('erp_is_dark', String(newVal));
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // PWA Install Prompt state and triggers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('PWA was installed successfully');
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Real-time Firestore synchronization and intelligent seeding on initial mount
  useEffect(() => {
    // CAPTURE local cached values immediately before any onSnapshot can trigger and overwrite them!
    const localProductsRaw = localStorage.getItem('op_erp_products');
    const localSalesRaw = localStorage.getItem('op_erp_sales');
    const localExpensesRaw = localStorage.getItem('op_erp_expenses');
    const localTeamRaw = localStorage.getItem('op_erp_team');
    const localLogsRaw = localStorage.getItem('op_erp_logs');

    // 1. Listen to Shop Settings & Branding. Seed if not initialized.
    const unsubBranding = onSnapshot(doc(db, 'shopSettings', 'branding'), async (documentSnap) => {
      if (!documentSnap.exists()) {
        try {
          const initialBranding = {
            id: 'branding',
            nameKm: localStorage.getItem('op_erp_shop_name_km') || 'ប្រព័ន្ធគ្រប់គ្រងការលក់ និងស្តុកនាឡិកាដៃប្រណិត ERP',
            nameEn: localStorage.getItem('op_erp_shop_name_en') || 'Luxury Watch Enterprise ERP Tracker',
            logoType: localStorage.getItem('op_erp_shop_logo_type') || 'icon',
            logoIcon: localStorage.getItem('op_erp_shop_logo_icon') || 'Watch',
            logoImgUrl: localStorage.getItem('op_erp_shop_logo_img_url') || '',
            logoColor: localStorage.getItem('op_erp_shop_logo_color') || 'indigo',
            exchangeRate: Number(localStorage.getItem('op_erp_exchange_rate')) || 4100,
          };
          await setDoc(doc(db, 'shopSettings', 'branding'), initialBranding);

          // Seed products (using batch to prevent partial state / race condition onSnapshot updates)
          const productsToSeed: Product[] = (localProductsRaw && JSON.parse(localProductsRaw).length > 0)
            ? JSON.parse(localProductsRaw)
            : INITIAL_PRODUCTS;
          const prodBatch = writeBatch(db);
          for (const item of productsToSeed) {
            prodBatch.set(doc(db, 'products', item.id), item);
          }
          await prodBatch.commit();

          // Seed sales (using batch to prevent partial state / race condition onSnapshot updates)
          const salesToSeed: Sale[] = (localSalesRaw && JSON.parse(localSalesRaw).length > 0)
            ? JSON.parse(localSalesRaw)
            : INITIAL_SALES;
          const salesBatch = writeBatch(db);
          for (const item of salesToSeed) {
            salesBatch.set(doc(db, 'sales', item.id), item);
          }
          await salesBatch.commit();

          // Seed expenses (using batch to prevent partial state / race condition onSnapshot updates)
          const expensesToSeed: Expense[] = (localExpensesRaw && JSON.parse(localExpensesRaw).length > 0)
            ? JSON.parse(localExpensesRaw)
            : INITIAL_EXPENSES;
          const expensesBatch = writeBatch(db);
          for (const item of expensesToSeed) {
            expensesBatch.set(doc(db, 'expenses', item.id), item);
          }
          await expensesBatch.commit();

          // Seed team members (using batch to prevent partial state / race condition onSnapshot updates)
          const teamToSeed: TeamMember[] = (localTeamRaw && JSON.parse(localTeamRaw).length > 0)
            ? JSON.parse(localTeamRaw)
            : INITIAL_TEAM;
          const teamBatch = writeBatch(db);
          for (const item of teamToSeed) {
            teamBatch.set(doc(db, 'team', item.id), item);
          }
          await teamBatch.commit();

          // Seed logs (using batch to prevent partial state / race condition onSnapshot updates)
          const logsToSeed: ActionLog[] = (localLogsRaw && JSON.parse(localLogsRaw).length > 0)
            ? JSON.parse(localLogsRaw)
            : INITIAL_LOGS;
          const logsBatch = writeBatch(db);
          for (const item of logsToSeed) {
            logsBatch.set(doc(db, 'logs', item.id), item);
          }
          await logsBatch.commit();

        } catch (seedErr: any) {
          console.warn("Firestore auto-seeding failed on mount, local cache remains loaded:", seedErr);
        }
      } else {
        const data = documentSnap.data();
        if (data) {
          setShopNameKm(data.nameKm);
          setShopNameEn(data.nameEn);
          setShopLogoType(data.logoType || 'icon');
          setShopLogoIcon(data.logoIcon || 'Watch');
          setShopLogoImgUrl(data.logoImgUrl || '');
          setShopLogoColor(data.logoColor || 'indigo');
          setExchangeRate(data.exchangeRate || 4100);
        }
      }
    }, (error) => {
      console.error("Firestore connection/rules error for branding:", error);
      setSyncError(error.message);
    });

    // 2. Listen to Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Product);
      });
      list.sort((a, b) => a.id.localeCompare(b.id));
      setProducts(list);
      localStorage.setItem('op_erp_products', JSON.stringify(list));
    }, (error) => {
      console.error("Firestore connection/rules error for products:", error);
      setSyncError(error.message);
    });

    // 3. Listen to Sales
    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const list: Sale[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Sale);
      });
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSales(list);
      localStorage.setItem('op_erp_sales', JSON.stringify(list));
    }, (error) => {
      console.error("Firestore connection/rules error for sales:", error);
      setSyncError(error.message);
    });

    // 4. Listen to Expenses
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Expense);
      });
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setExpenses(list);
      localStorage.setItem('op_erp_expenses', JSON.stringify(list));
    }, (error) => {
      console.error("Firestore connection/rules error for expenses:", error);
      setSyncError(error.message);
    });

    // 5. Listen to Team
    const unsubTeam = onSnapshot(collection(db, 'team'), (snapshot) => {
      const list: TeamMember[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as TeamMember);
      });
      list.sort((a, b) => a.id.localeCompare(b.id));
      setTeam(list);
      localStorage.setItem('op_erp_team', JSON.stringify(list));
    }, (error) => {
      console.error("Firestore connection/rules error for team:", error);
      setSyncError(error.message);
    });

    // 6. Listen to Action Logs
    const unsubLogs = onSnapshot(collection(db, 'logs'), (snapshot) => {
      const list: ActionLog[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ActionLog);
      });
      list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setLogs(list);
      localStorage.setItem('op_erp_logs', JSON.stringify(list));
    }, (error) => {
      console.error("Firestore connection/rules error for logs:", error);
      setSyncError(error.message);
    });

    // 7. Listen to Stock Counts
    const unsubStockCounts = onSnapshot(collection(db, 'stockCounts'), (snapshot) => {
      const list: StockCountSession[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as StockCountSession);
      });
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setStockCounts(list);
      localStorage.setItem('op_erp_stock_counts', JSON.stringify(list));
    }, (error) => {
      console.error("Firestore connection/rules error for stockCounts:", error);
    });

    // 8. Listen to Monthly Closings
    const unsubMonthlyClosings = onSnapshot(collection(db, 'monthlyClosings'), (snapshot) => {
      const list: MonthlyClosing[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as MonthlyClosing);
      });
      list.sort((a, b) => a.monthYear.localeCompare(b.monthYear));
      setMonthlyClosings(list);
      localStorage.setItem('op_erp_monthly_closings', JSON.stringify(list));
    }, (error) => {
      console.error("Firestore connection/rules error for monthlyClosings:", error);
    });

    return () => {
      unsubBranding();
      unsubProducts();
      unsubSales();
      unsubExpenses();
      unsubTeam();
      unsubLogs();
      unsubStockCounts();
      unsubMonthlyClosings();
    };
  }, []);

  const handlePublishDrafts = async () => {
    if (draftChanges.length === 0) return;
    setIsRefreshing(true);
    try {
      for (const change of draftChanges) {
        if (change.action === 'insert' || change.action === 'update') {
          await setDoc(doc(db, change.collection, change.documentId), change.data);
         } else if (change.action === 'delete') {
          await deleteDoc(doc(db, change.collection, change.documentId));
        }
      }

      setDraftChanges([]);
      
      const publishLog: ActionLog = {
        id: `log-${Date.now()}`,
        user: currentUser,
        role: currentRole,
        action: 'ផ្សព្វផ្សាយការព្រាង (Publish Drafts)',
        details: `បានផ្សព្វផ្សាយរាល់ការកែប្រែចំនួន ${draftChanges.length} ទៅកាន់ Live Server ផ្លូវការដោយជោគជ័យ។`,
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, 'logs', publishLog.id), publishLog);

      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (error: any) {
      console.error("Error publishing drafts:", error);
      setSyncError(`ការផ្សព្វផ្សាយបរាជ័យ៖ ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDiscardDrafts = () => {
    if (window.confirm(lang === 'km' ? 'តើអ្នកប្រាកដជាចង់លុបចោលរាល់ការកែប្រែព្រាងទាំងស្រុងមែនទេ?' : 'Are you sure you want to discard all draft changes?')) {
      setDraftChanges([]);
    }
  };

  // Dispatch global system audits/notices
  const logSystemAction = async (action: string, details: string) => {
    const newLog: ActionLog = {
      id: `log-${Date.now()}`,
      user: currentUser,
      role: currentRole,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    if (isDraftMode) {
      addDraftChange({
        collection: 'logs',
        action: 'insert',
        documentId: newLog.id,
        data: newLog,
        summaryKm: `កត់ត្រាសកម្មភាព៖ ${action}`,
        summaryEn: `Logged Action: ${action}`,
      });
    } else {
      try {
        await setDoc(doc(db, 'logs', newLog.id), newLog);
      } catch (err: any) {
        console.warn("Firestore logs write failed, writing locally:", err);
        const nextLogs = [newLog, ...logs];
        setLogs(nextLogs);
        localStorage.setItem('op_erp_logs', JSON.stringify(nextLogs));
      }
    }
  };

  // Add Product (SHARED - BOTH Owner/Admin can perform)
  const handleAddProduct = async (prod: { name: string; sku: string; category: string; stock: number; purchasePrice: number; sellingPrice: number; stockType?: 'new' | 'old'; color?: string }) => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      stock: prod.stock,
      purchasePrice: prod.purchasePrice,
      sellingPrice: prod.sellingPrice,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser,
      stockType: prod.stockType || 'new',
      color: prod.color || '',
    };
    if (isDraftMode) {
      addDraftChange({
        collection: 'products',
        action: 'insert',
        documentId: newProduct.id,
        data: newProduct,
        summaryKm: `បន្ថែមទំនិញថ្មី៖ ${prod.name}`,
        summaryEn: `Added new product: ${prod.name}`,
      });
    } else {
      // Optimistic local state update for zero-latency screen updates
      const nextList = [...products, newProduct];
      setProducts(nextList);
      localStorage.setItem('op_erp_products', JSON.stringify(nextList));

      try {
        await setDoc(doc(db, 'products', newProduct.id), newProduct);
      } catch (err: any) {
        console.warn("Firestore add product failed, fallback remained local:", err);
      }
    }
    await logSystemAction('បន្ថែមទំនិញថ្មី (Add Product)', `បានផ្ទុកចូលទំនិញ "${prod.name}" ក្នុង SKU: ${prod.sku}`);
  };

  // Edit Product / Adjust Stock properties (SHARED - BOTH can perform, but owner only edits cost basis)
  const handleEditProduct = async (id: string, updatedFields: Partial<Product>) => {
    const target = visibleProducts.find((p) => p.id === id);
    if (!target) return;

    const updated = {
      ...target,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser,
    };

    if (isDraftMode) {
      addDraftChange({
        collection: 'products',
        action: 'update',
        documentId: id,
        data: updated,
        summaryKm: `កែប្រែទំនិញ៖ ${target.name}`,
        summaryEn: `Edited product: ${target.name}`,
      });
    } else {
      // Optimistic local state update
      const nextList = products.map(p => p.id === id ? updated : p);
      setProducts(nextList);
      localStorage.setItem('op_erp_products', JSON.stringify(nextList));

      try {
        await setDoc(doc(db, 'products', id), updated);
      } catch (err: any) {
        console.warn("Firestore edit product failed:", err);
      }
    }
    await logSystemAction('កែប្រែព័ត៌មានទំនិញ (Edit Product)', `បានកែសម្រួលព័ត៌មាន ឬស្តុក "${target.name}" (${updatedFields.sku || target.sku})`);
  };

  // Update product stock (SHARED - BOTH)
  const handleUpdateStock = async (id: string, newStock: number) => {
    const target = visibleProducts.find((p) => p.id === id);
    if (!target) return;
    const diff = newStock - target.stock;
    const direction = diff > 0 ? `តម្រង់កើនឡើង [x${diff}]` : `តម្រង់ថយចុះ [x${Math.abs(diff)}]`;

    const updated = {
      ...target,
      stock: newStock,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser,
    };

    if (isDraftMode) {
      addDraftChange({
        collection: 'products',
        action: 'update',
        documentId: id,
        data: updated,
        summaryKm: `កែប្រែស្តុក (${target.name}) ទៅ ${newStock}`,
        summaryEn: `Adjusted stock (${target.name}) to ${newStock}`,
      });
    } else {
      // Optimistic local state update
      const nextList = products.map(p => p.id === id ? updated : p);
      setProducts(nextList);
      localStorage.setItem('op_erp_products', JSON.stringify(nextList));

      try {
        await setDoc(doc(db, 'products', id), updated);
      } catch (err: any) {
        console.warn("Firestore update stock failed:", err);
      }
    }
    await logSystemAction('កែប្រែចំនួនស្តុក (Adjust Stock)', `កែសម្រួលស្តុក "${target.name}" មក ${newStock} ឯកតា (${direction})`);
  };

  // Delete product (OWNER OR KUNTHY ONLY)
  const handleDeleteProduct = async (id: string) => {
    if (currentRole !== 'Owner' && currentUser !== 'Teng Kunthy') return;
    const target = visibleProducts.find((p) => p.id === id);
    if (!target) return;

    if (isDraftMode) {
      addDraftChange({
        collection: 'products',
        action: 'delete',
        documentId: id,
        data: null,
        summaryKm: `លុបទំនិញ៖ ${target.name}`,
        summaryEn: `Deleted product: ${target.name}`,
      });
    } else {
      // Optimistic local state update
      const nextList = products.filter(p => p.id !== id);
      setProducts(nextList);
      localStorage.setItem('op_erp_products', JSON.stringify(nextList));

      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err: any) {
        console.warn("Firestore delete product failed:", err);
      }
    }
    await logSystemAction('លុបចោលទំនិញ (Delete Product)', `បានលុបចោលផលិតផលរបស់ក្រុមហ៊ុន "${target.name}" ពីស្តុកលក់`);
  };

  // Add Sale (SHARED - BOTH)
  const handleAddSale = async (sale: { 
    productId: string; 
    quantity: number; 
    customSellingPrice?: number;
    discountAmount?: number;
    discountPercent?: number;
    color?: string;
    saleChannel?: 'Shop' | 'Online';
    receivedAmount?: number;
    changeAmount?: number;
    paymentMethod?: 'Cash' | 'ABA' | 'ACLEDA' | 'Mixed';
    mixedBankAmount?: number;
    mixedCashUsdAmount?: number;
    mixedCashRielAmount?: number;
    isService?: boolean;
    serviceType?: 'Battery' | 'Strap' | 'Repair';
    serviceNote?: string;
    customerName?: string;
    customerPhone?: string;
    warrantyPeriod?: string;
    shippingLocation?: string;
    paymentStatus?: 'Paid' | 'Unpaid' | 'COD';
    deliveryCompany?: string;
    qrPaymentUrl?: string;
  }) => {
    let productName = "";
    let totalCost = 0;
    let originalSellingPrice = 0;
    let productTarget: Product | undefined;

    if (sale.isService) {
      productName = sale.serviceType === 'Battery' 
        ? `សេវាកម្ម៖ ថ្ម (Battery)` 
        : sale.serviceType === 'Strap' 
        ? `សេវាកម្ម៖ ដាក់ខ្សែ (Strap Replacement)` 
        : `សេវាកម្ម៖ ជួសជុល (Repair)`;
      if (sale.serviceNote) {
        productName += ` - ${sale.serviceNote}`;
      }
      totalCost = 0; // Service does not have product cost
      originalSellingPrice = sale.customSellingPrice || 0;
    } else {
      productTarget = visibleProducts.find((p) => p.id === sale.productId);
      if (!productTarget || productTarget.stock < sale.quantity) return;
      productName = productTarget.name;
      totalCost = productTarget.purchasePrice * sale.quantity;
      originalSellingPrice = productTarget.sellingPrice;
    }

    const unitSellingPrice = sale.customSellingPrice !== undefined ? sale.customSellingPrice : (productTarget ? productTarget.sellingPrice : 0);

    // Create Sale
    const totalSelling = unitSellingPrice * sale.quantity;
    const trackingChannel = sale.saleChannel || 'Shop';
    
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      productName,
      productId: sale.productId,
      quantity: sale.quantity,
      sellingPrice: unitSellingPrice,
      totalSelling,
      totalCost,
      date: new Date().toISOString(),
      handledBy: currentUser,
      originalSellingPrice,
      discountAmount: sale.discountAmount || 0,
      discountPercent: sale.discountPercent || 0,
      color: sale.color !== undefined ? sale.color : (productTarget ? (productTarget.color || '') : ''),
      saleChannel: trackingChannel,
      receivedAmount: sale.receivedAmount || 0,
      changeAmount: sale.changeAmount || 0,
      paymentMethod: sale.paymentMethod || 'Cash',
      mixedBankAmount: sale.paymentMethod === 'Mixed' ? sale.mixedBankAmount : undefined,
      mixedCashUsdAmount: sale.paymentMethod === 'Mixed' ? sale.mixedCashUsdAmount : undefined,
      mixedCashRielAmount: sale.paymentMethod === 'Mixed' ? sale.mixedCashRielAmount : undefined,
      isService: sale.isService || false,
      serviceType: sale.serviceType,
      serviceNote: sale.serviceNote,
      customerName: sale.customerName || '',
      customerPhone: sale.customerPhone || '',
      warrantyPeriod: sale.warrantyPeriod || '',
      shippingLocation: sale.shippingLocation || '',
      paymentStatus: sale.paymentStatus || 'Paid',
      deliveryCompany: sale.deliveryCompany || '',
      qrPaymentUrl: sale.qrPaymentUrl || '',
    };

    // Deduct stock levels of products instantly if not a service
    let nextColor = productTarget ? (productTarget.color || '') : '';
    let nextColorStocks = productTarget && productTarget.colorStocks ? { ...productTarget.colorStocks } : undefined;
    if (sale.color && productTarget) {
      if (nextColorStocks && nextColorStocks[sale.color] !== undefined) {
        nextColorStocks[sale.color] = Math.max(0, nextColorStocks[sale.color] - sale.quantity);
        // Rebuild nextColor string from colors with stock > 0
        const activeColors = Object.entries(nextColorStocks)
          .filter(([_, stk]) => typeof stk === 'number' && stk > 0)
          .map(([col]) => col);
        nextColor = activeColors.join(', ');
      } else if (productTarget.color) {
        const normalizedSold = sale.color.trim().toLowerCase();
        const currentColors = productTarget.color.split(/[,/;|]+/).map(c => c.trim()).filter(Boolean);
        const idx = currentColors.findIndex(c => c.toLowerCase() === normalizedSold);
        if (idx !== -1) {
          currentColors.splice(idx, 1); // remove one occurrence
        }
        nextColor = currentColors.join(', ');
      }
    }

    const updatedProduct = (!sale.isService && productTarget) ? {
      ...productTarget,
      stock: productTarget.stock - sale.quantity,
      color: nextColor,
      colorStocks: nextColorStocks,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser,
    } : null;

    if (isDraftMode) {
      if (updatedProduct && !sale.isService) {
        addDraftChange({
          collection: 'products',
          action: 'update',
          documentId: sale.productId,
          data: updatedProduct,
          summaryKm: `កាត់ស្តុកលក់៖ ${productTarget?.name} -${sale.quantity}`,
          summaryEn: `Sold stock: ${productTarget?.name} -${sale.quantity}`,
        });
      }
      addDraftChange({
        collection: 'sales',
        action: 'insert',
        documentId: newSale.id,
        data: newSale,
        summaryKm: sale.isService 
          ? `កត់ត្រាសេវាកម្ម៖ ${productName} (${trackingChannel === 'Online' ? 'លក់ Online' : 'លក់នៅហាង'}) [${sale.paymentMethod || 'Cash'}]`
          : `កត់ត្រាលក់ចេញ៖ ${productName} x${sale.quantity} (${trackingChannel === 'Online' ? 'លក់ Online' : 'លក់នៅហាង'}) [${sale.paymentMethod || 'Cash'}]`,
        summaryEn: sale.isService
          ? `Added service: ${productName} (${trackingChannel}) [${sale.paymentMethod || 'Cash'}]`
          : `Added sale: ${productName} x${sale.quantity} (${trackingChannel}) [${sale.paymentMethod || 'Cash'}]`,
      });
    } else {
      // Optimistic local state update instantly for zero latency
      const nextProducts = updatedProduct ? products.map(p => p.id === sale.productId ? updatedProduct : p) : products;
      const nextSales = [...sales, newSale];
      setProducts(nextProducts);
      setSales(nextSales);
      localStorage.setItem('op_erp_products', JSON.stringify(nextProducts));
      localStorage.setItem('op_erp_sales', JSON.stringify(nextSales));

      try {
        if (updatedProduct && !sale.isService) {
          await setDoc(doc(db, 'products', sale.productId), updatedProduct);
        }
        await setDoc(doc(db, 'sales', newSale.id), newSale);
      } catch (err: any) {
        console.warn("Firestore write for sale failed:", err);
      }
    }

    const discountLogInfo = sale.discountAmount && sale.discountAmount > 0 
      ? ` (បញ្ចុះតម្លៃ $${sale.discountAmount.toFixed(2)}${sale.discountPercent ? ` ឬ ${sale.discountPercent}%` : ''} សល់តម្លៃលក់ជាក់ស្តែងម្នាក់ៗ $${unitSellingPrice.toFixed(2)})`
      : '';
    const paymentMethodLabel = sale.paymentMethod === 'ABA' 
      ? 'ABA' 
      : sale.paymentMethod === 'ACLEDA' 
      ? 'ACLEDA' 
      : sale.paymentMethod === 'Mixed'
      ? 'ចម្រុះ (Mixed)'
      : 'លុយសុទ្ធ';
    await logSystemAction('បញ្ចូលការលក់ (Add Sale)', `${sale.isService ? 'សេវាកម្ម' : 'លក់ចេញ'} (${trackingChannel === 'Online' ? 'លក់ Online' : 'លក់នៅហាង'}) "${productName}" x${sale.quantity} តាមរយៈ ${paymentMethodLabel}។ ទឹកប្រាក់ទទួលបានគឺ $${totalSelling.toFixed(2)}${discountLogInfo}`);
  };

  // Void Sale (OWNER OR KUNTHY ONLY)
  const handleDeleteSale = async (saleId: string) => {
    if (currentRole !== 'Owner' && currentUser !== 'Teng Kunthy') return;
    const saleTarget = visibleSales.find((s) => s.id === saleId);
    if (!saleTarget) return;

    // Revert stock
    const productTarget = visibleProducts.find((p) => p.id === saleTarget.productId);
    
    if (isDraftMode) {
      if (productTarget) {
        let nextColor = productTarget.color || '';
        let nextColorStocks = productTarget.colorStocks ? { ...productTarget.colorStocks } : undefined;
        if (saleTarget.color) {
          if (nextColorStocks && nextColorStocks[saleTarget.color] !== undefined) {
            nextColorStocks[saleTarget.color] += saleTarget.quantity;
            const activeColors = Object.entries(nextColorStocks)
              .filter(([_, stk]) => typeof stk === 'number' && stk > 0)
              .map(([col]) => col);
            nextColor = activeColors.join(', ');
          } else {
            const currentColors = productTarget.color ? productTarget.color.split(/[,/;|]+/).map(c => c.trim()).filter(Boolean) : [];
            if (!currentColors.includes(saleTarget.color.trim())) {
              currentColors.push(saleTarget.color.trim());
            }
            nextColor = currentColors.join(', ');
          }
        }

        const updatedProduct = {
          ...productTarget,
          stock: productTarget.stock + saleTarget.quantity,
          color: nextColor,
          colorStocks: nextColorStocks,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser,
        };
        addDraftChange({
          collection: 'products',
          action: 'update',
          documentId: saleTarget.productId,
          data: updatedProduct,
          summaryKm: `បង្វិលសងស្តុកលក់វិញ៖ ${productTarget.name} +${saleTarget.quantity}`,
          summaryEn: `Reverted stock: ${productTarget.name} +${saleTarget.quantity}`,
        });
      }
      addDraftChange({
        collection: 'sales',
        action: 'delete',
        documentId: saleId,
        data: null,
        summaryKm: `លុបការលក់រំលាយ៖ ${saleTarget.productName} x${saleTarget.quantity}`,
        summaryEn: `Voided sale: ${saleTarget.productName} x${saleTarget.quantity}`,
      });
    } else {
      let updatedProduct = null;
      if (productTarget) {
        let nextColor = productTarget.color || '';
        let nextColorStocks = productTarget.colorStocks ? { ...productTarget.colorStocks } : undefined;
        if (saleTarget.color) {
          if (nextColorStocks && nextColorStocks[saleTarget.color] !== undefined) {
            nextColorStocks[saleTarget.color] += saleTarget.quantity;
            const activeColors = Object.entries(nextColorStocks)
              .filter(([_, stk]) => typeof stk === 'number' && stk > 0)
              .map(([col]) => col);
            nextColor = activeColors.join(', ');
          } else {
            const currentColors = productTarget.color ? productTarget.color.split(/[,/;|]+/).map(c => c.trim()).filter(Boolean) : [];
            if (!currentColors.includes(saleTarget.color.trim())) {
              currentColors.push(saleTarget.color.trim());
            }
            nextColor = currentColors.join(', ');
          }
        }

        updatedProduct = {
          ...productTarget,
          stock: productTarget.stock + saleTarget.quantity,
          color: nextColor,
          colorStocks: nextColorStocks,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser,
        };
      }

      // Optimistic local state update instantly for zero latency
      if (updatedProduct) {
        const nextProducts = products.map(p => p.id === saleTarget.productId ? updatedProduct : p);
        setProducts(nextProducts);
        localStorage.setItem('op_erp_products', JSON.stringify(nextProducts));
      }
      const nextSales = sales.filter(s => s.id !== saleId);
      setSales(nextSales);
      localStorage.setItem('op_erp_sales', JSON.stringify(nextSales));

      try {
        if (updatedProduct) {
          await setDoc(doc(db, 'products', saleTarget.productId), updatedProduct);
        }
        await deleteDoc(doc(db, 'sales', saleId));
      } catch (err: any) {
        console.warn("Firestore delete sale failed:", err);
      }
    }
    await logSystemAction('លុបការលក់រំលាយ (Void Sale Record)', `បានលុបចោលវិក្កយបត្រលក់ "${saleTarget.productName}" x${saleTarget.quantity} មកវិញ`);
  };

  // Update Sale Status (SHARED - BOTH can perform)
  const handleUpdateSaleStatus = async (saleId: string, newStatus: 'Paid' | 'Unpaid' | 'COD') => {
    const saleTarget = sales.find(s => s.id === saleId);
    if (!saleTarget) return;

    const updatedSale: Sale = {
      ...saleTarget,
      paymentStatus: newStatus,
    };

    if (isDraftMode) {
      addDraftChange({
        collection: 'sales',
        action: 'update',
        documentId: saleId,
        data: updatedSale,
        summaryKm: `កែប្រែស្ថានភាពទូទាត់សម្រាប់៖ ${saleTarget.productName} ទៅជា ${newStatus === 'Paid' ? 'បង់រួច (Paid)' : newStatus === 'COD' ? 'COD' : 'មិនទាន់បង់ (Unpaid)'}`,
        summaryEn: `Updated payment status for ${saleTarget.productName} to ${newStatus}`,
      });
    } else {
      const nextSales = sales.map(s => s.id === saleId ? updatedSale : s);
      setSales(nextSales);
      localStorage.setItem('op_erp_sales', JSON.stringify(nextSales));

      try {
        await setDoc(doc(db, 'sales', saleId), updatedSale);
      } catch (err: any) {
        console.warn("Firestore update sale status failed:", err);
      }
    }
    await logSystemAction('កែប្រែស្ថានភាពទូទាត់ (Update Payment Status)', `បានប្តូរស្ថានភាពទូទាត់សម្រាប់វិក្កយបត្រ "${saleTarget.productName}" ទៅជា ${newStatus === 'Paid' ? 'បង់រួច' : newStatus === 'COD' ? 'COD' : 'មិនទាន់បង់'}`);
  };

  // Add Operational Expense (SHARED - BOTH can perform, Owner only deletes)
  const handleAddExpense = async (exp: { title: string; category: Expense['category']; amount: number; description?: string }) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      category: exp.category,
      title: exp.title,
      amount: exp.amount,
      date: new Date().toISOString(),
      recordedBy: currentUser,
      description: exp.description || "",
    };
    if (isDraftMode) {
      addDraftChange({
        collection: 'expenses',
        action: 'insert',
        documentId: newExpense.id,
        data: newExpense,
        summaryKm: `កត់ត្រាចំណាយ៖ ${exp.title} $${exp.amount}`,
        summaryEn: `Added expense: ${exp.title} $${exp.amount}`,
      });
    } else {
      // Optimistic local state update instantly for zero latency
      const nextList = [...expenses, newExpense];
      setExpenses(nextList);
      localStorage.setItem('op_erp_expenses', JSON.stringify(nextList));

      try {
        await setDoc(doc(db, 'expenses', newExpense.id), newExpense);
      } catch (err: any) {
        console.warn("Firestore add expense failed:", err);
      }
    }
    await logSystemAction('កត់ត្រាចំណាយ (Log Expense)', `បានកត់ត្រាការចំណាយលើ "${exp.title}" ចំនួន $${exp.amount.toFixed(2)} [ប្រភេទ: ${exp.category}]`);
  };

  // Delete Operational Expense (OWNER OR KUNTHY ONLY)
  const handleDeleteExpense = async (id: string) => {
    if (currentRole !== 'Owner' && currentUser !== 'Teng Kunthy') return;
    const target = visibleExpenses.find((e) => e.id === id);
    if (!target) return;

    if (isDraftMode) {
      addDraftChange({
        collection: 'expenses',
        action: 'delete',
        documentId: id,
        data: null,
        summaryKm: `លុបការចំណាយ៖ ${target.title}`,
        summaryEn: `Deleted expense: ${target.title}`,
      });
    } else {
      // Optimistic local state update instantly for zero latency
      const nextList = expenses.filter(e => e.id !== id);
      setExpenses(nextList);
      localStorage.setItem('op_erp_expenses', JSON.stringify(nextList));

      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (err: any) {
        console.warn("Firestore delete expense failed:", err);
      }
    }
    await logSystemAction('លុបការចំណាយ (Delete Expense)', `បានលុបគណនីចំណាយ "${target.title}" ចំនួន $${target.amount.toFixed(2)}`);
  };

  // Modify Staff Salary (OWNER OR KUNTHY ONLY)
  const handleModifySalary = async (id: string, newSalary: number) => {
    if (currentRole !== 'Owner' && currentUser !== 'Teng Kunthy') return;
    const target = visibleTeam.find((t) => t.id === id);
    if (!target) return;

    const updated = { ...target, salary: newSalary };
    if (isDraftMode) {
      addDraftChange({
        collection: 'team',
        action: 'update',
        documentId: id,
        data: updated,
        summaryKm: `កែប្រែប្រាក់ខែបុគ្គលិក (${target.name}) ទៅ $${newSalary}`,
        summaryEn: `Adjusted staff salary (${target.name}) to $${newSalary}`,
      });
    } else {
      // Optimistic local state update instantly for zero latency
      const nextList = team.map(t => t.id === id ? updated : t);
      setTeam(nextList);
      localStorage.setItem('op_erp_team', JSON.stringify(nextList));

      try {
        await setDoc(doc(db, 'team', id), updated);
      } catch (err: any) {
        console.warn("Firestore update staff salary failed:", err);
      }
    }
    await logSystemAction('កែប្រែប្រាក់ខែបុគ្គលិក (Update Salary)', `បានកែសម្រួលប្រាក់ខែបុគ្គលិក "${target.name}" ពី $${target.salary} ទៅ $${newSalary}`);
  };

  // Add Member (OWNER OR KUNTHY ONLY)
  const handleAddMember = async (member: Omit<TeamMember, 'id'>) => {
    if (currentRole !== 'Owner' && currentUser !== 'Teng Kunthy') return;
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      ...member,
    };
    if (isDraftMode) {
      addDraftChange({
        collection: 'team',
        action: 'insert',
        documentId: newMember.id,
        data: newMember,
        summaryKm: `ចុះឈ្មោះបុគ្គលិកថ្មី៖ ${member.name}`,
        summaryEn: `Added team member: ${member.name}`,
      });
    } else {
      // Optimistic local state update instantly for zero latency
      const nextList = [...team, newMember];
      setTeam(nextList);
      localStorage.setItem('op_erp_team', JSON.stringify(nextList));

      try {
        await setDoc(doc(db, 'team', newMember.id), newMember);
      } catch (err: any) {
        console.warn("Firestore add team member failed:", err);
      }
    }
    await logSystemAction('ចុះឈ្មោះបុគ្គលិកថ្មី (Add Team Member)', `បានបញ្ចូលគណនីបុគ្គលិកថ្មី "${member.name}" ក្នុងឋានៈ ${member.role}`);
  };

  // Broadcast announcements
  const handlePostLog = async (action: string, details: string) => {
    await logSystemAction(action, details);
  };

  // Clear Audit trails (OWNER OR KUNTHY ONLY)
  const handleClearLogs = async () => {
    if (currentRole !== 'Owner' && currentUser !== 'Teng Kunthy') return;
    const querySnapshot = await getDocs(collection(db, 'logs'));
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  };

  // Reset Sandbox simulator back to factory parameters
  const handleResetSandbox = async () => {
    if (confirm(t.resetConfirm)) {
      setIsRefreshing(true);
      try {
        // 1. Reset local state and localStorage instantly
        localStorage.setItem('op_erp_products', JSON.stringify(INITIAL_PRODUCTS));
        localStorage.setItem('op_erp_sales', JSON.stringify(INITIAL_SALES));
        localStorage.setItem('op_erp_expenses', JSON.stringify(INITIAL_EXPENSES));
        localStorage.setItem('op_erp_team', JSON.stringify(INITIAL_TEAM));
        localStorage.setItem('op_erp_logs', JSON.stringify(INITIAL_LOGS));
        
        setProducts(INITIAL_PRODUCTS);
        setSales(INITIAL_SALES);
        setExpenses(INITIAL_EXPENSES);
        setTeam(INITIAL_TEAM);
        setLogs(INITIAL_LOGS);

        // 2. Clear & Seed Firestore concurrently/in background
        try {
          const collectionsToClear = ['products', 'sales', 'expenses', 'team', 'logs'];
          for (const coll of collectionsToClear) {
            const querySnapshot = await getDocs(collection(db, coll));
            const batch = writeBatch(db);
            querySnapshot.forEach((docSnap) => {
              batch.delete(docSnap.ref);
            });
            await batch.commit();
          }

          for (const p of INITIAL_PRODUCTS) await setDoc(doc(db, 'products', p.id), p);
          for (const s of INITIAL_SALES) await setDoc(doc(db, 'sales', s.id), s);
          for (const e of INITIAL_EXPENSES) await setDoc(doc(db, 'expenses', e.id), e);
          for (const t of INITIAL_TEAM) await setDoc(doc(db, 'team', t.id), t);
          
          const resetLog: ActionLog = {
            id: `log-${Date.now()}`,
            user: currentUser,
            role: currentRole,
            action: 'កំណត់ឡើងវិញ (Reset Sandbox)',
            details: 'បានសម្អាតទិន្នន័យសាកល្បងទាំងអស់ទៅកាន់ដើមវិញ',
            timestamp: new Date().toISOString(),
          };
          await setDoc(doc(db, 'logs', resetLog.id), resetLog);
          setSyncError(null);
        } catch (dbErr: any) {
          console.warn("Firestore error during reset sandbox:", dbErr);
          // Set informative fallback notification but do not crash!
          setSyncError(lang === 'km' 
            ? 'គណនីរក្សាទុកក្នុងឧបករណ៍ត្រូវបានកំណត់ឡើងវិញដោយជោគជ័យ (សេវាកម្មពពក Cloud មិនអាចភ្ជាប់បានឡើយ)។' 
            : 'Device local cache was successfully reset, but system failed to connect with Firestore clouds.'
          );
        }
      } catch (err: any) {
        console.error("General reset sandbox failed:", err);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleClearProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    const batch = writeBatch(db);
    snap.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
    await logSystemAction('លុបស្តុកទាំងអស់ (Clear Stock)', 'បានលុបទិន្នន័យផលិតផលទាំងអស់ពី ERP');
  };

  const handleClearSales = async () => {
    const snap = await getDocs(collection(db, 'sales'));
    const batch = writeBatch(db);
    snap.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
    await logSystemAction('លុបប្រវត្តិលក់ទាំងអស់ (Clear Sales)', 'បានលុបប្រវត្តិប្រតិបត្តិការទាំងអស់ថ្ងៃនេះ');
  };

  const handleWipeDatabase = async () => {
    const colls = ['products', 'sales', 'expenses', 'logs'];
    for (const coll of colls) {
      const snap = await getDocs(collection(db, coll));
      const batch = writeBatch(db);
      snap.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
    }
    await logSystemAction('លុបសម្អាតទិន្នន័យ (Wipe DB)', 'បានលុបសម្អាត database modules ទាំងអស់ជាលក្ខណៈទទេស្អាត');
  };

  const handleSaveStockCount = async (items: StockCountItem[], notes: string) => {
    const newSession: StockCountSession = {
      id: `count-${Date.now()}`,
      date: new Date().toISOString(),
      countedBy: currentUser,
      items,
      notes,
    };

    // Update products stock level in bulk
    const updatedProductsList = [...products];
    for (const item of items) {
      const idx = updatedProductsList.findIndex(p => p.id === item.productId);
      if (idx !== -1) {
        updatedProductsList[idx] = {
          ...updatedProductsList[idx],
          stock: item.physicalStock,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser,
        };
      }
    }

    if (isDraftMode) {
      addDraftChange({
        collection: 'stockCounts',
        action: 'insert',
        documentId: newSession.id,
        data: newSession,
        summaryKm: `រាយការណ៍រាប់ស្ដុកប្រចាំខែដោយ៖ ${currentUser}`,
        summaryEn: `Monthly stock count recorded by: ${currentUser}`,
      });
      for (const item of items) {
        const prod = products.find(p => p.id === item.productId);
        if (prod && prod.stock !== item.physicalStock) {
          addDraftChange({
            collection: 'products',
            action: 'update',
            documentId: item.productId,
            data: { 
              ...prod,
              stock: item.physicalStock, 
              updatedAt: new Date().toISOString(), 
              updatedBy: currentUser 
            },
            summaryKm: `សម្រួលស្តុក ${prod.name} ពី ${prod.stock} ទៅ ${item.physicalStock}`,
            summaryEn: `Reconciled stock for ${prod.name} from ${prod.stock} to ${item.physicalStock}`,
          });
        }
      }
    } else {
      setProducts(updatedProductsList);
      setStockCounts(prev => [...prev, newSession]);
      localStorage.setItem('op_erp_products', JSON.stringify(updatedProductsList));
      localStorage.setItem('op_erp_stock_counts', JSON.stringify([...stockCounts, newSession]));

      try {
        await setDoc(doc(db, 'stockCounts', newSession.id), newSession);
        for (const item of items) {
          const originalProd = products.find(p => p.id === item.productId);
          if (originalProd) {
            await setDoc(doc(db, 'products', item.productId), {
              ...originalProd,
              stock: item.physicalStock,
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser,
            });
          }
        }
      } catch (err: any) {
        console.warn("Firestore stock count save failed:", err);
      }
    }

    const itemsDescription = items.map(item => `${item.productName} (ប្រព័ន្ធ: ${item.systemStock} ជាក់ស្តែង: ${item.physicalStock}, Variance: ${item.variance > 0 ? '+' : ''}${item.variance})`).join(', ');
    await logSystemAction(
      'សម្របសម្រួលស្តុកប្រចាំខែ',
      `បានធ្វើការរាប់ស្តុកចុងខែដោយជោគជ័យ។ ទំនិញ៖ ${itemsDescription}. ${notes ? `កំណត់សម្គាល់៖ ${notes}` : ''}`
    );
  };

  const handleClearSalesData = async (mode: 'all' | 'previous_months') => {
    setIsRefreshing(true);
    try {
      if (mode === 'all') {
        if (isDraftMode) {
          for (const s of sales) {
            addDraftChange({
              collection: 'sales',
              action: 'delete',
              documentId: s.id,
              data: null,
              summaryKm: `លុបការលក់ ID: ${s.id}`,
              summaryEn: `Delete sale ID: ${s.id}`,
            });
          }
        } else {
          setSales([]);
          localStorage.setItem('op_erp_sales', JSON.stringify([]));
          try {
            const snap = await getDocs(collection(db, 'sales'));
            const batch = writeBatch(db);
            snap.forEach((docSnap) => batch.delete(docSnap.ref));
            await batch.commit();
          } catch (dbErr) {
            console.warn("Firestore error during clear all sales:", dbErr);
          }
        }
        await logSystemAction('ជម្រះទិន្នន័យលក់ទាំងអស់', `បានលុបសម្អាតទិន្នន័យលក់ទាំងអស់ពីប្រព័ន្ធ ERP`);
      } else {
        const currentMonthPrefix = new Date().toISOString().substring(0, 7);
        const previousSales = sales.filter(s => !s.date.startsWith(currentMonthPrefix));
        const currentMonthSales = sales.filter(s => s.date.startsWith(currentMonthPrefix));

        if (isDraftMode) {
          for (const s of previousSales) {
            addDraftChange({
              collection: 'sales',
              action: 'delete',
              documentId: s.id,
              data: null,
              summaryKm: `លុបទិន្នន័យលក់ចាស់ (ខែមុនៗ) ID: ${s.id}`,
              summaryEn: `Delete past month sale ID: ${s.id}`,
            });
          }
        } else {
          setSales(currentMonthSales);
          localStorage.setItem('op_erp_sales', JSON.stringify(currentMonthSales));
          try {
            const batch = writeBatch(db);
            for (const s of previousSales) {
              batch.delete(doc(db, 'sales', s.id));
            }
            await batch.commit();
          } catch (dbErr) {
            console.warn("Firestore error during clear old sales:", dbErr);
          }
        }
        await logSystemAction(
          'ជម្រះទិន្នន័យលក់ខែចាស់ៗ',
          `បានលុបសម្អាតទិន្នន័យលក់ចាស់ៗក្នុងខែមុនៗ ដោយរក្សាទុកតែទិន្នន័យលក់ក្នុងខែថ្មីនេះ (${currentMonthPrefix}) ចំនួន ${currentMonthSales.length} ប្រតិបត្តិការ។`
        );
      }
    } catch (err: any) {
      console.error("Clear sales data failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveMonthlyClosing = async (closing: Omit<MonthlyClosing, 'id' | 'closedAt' | 'closedBy'>) => {
    const newClosing: MonthlyClosing = {
      ...closing,
      id: `closing-${closing.monthYear}-${Date.now()}`,
      closedAt: new Date().toISOString(),
      closedBy: currentUser,
    };

    if (isDraftMode) {
      addDraftChange({
        collection: 'monthlyClosings',
        action: 'insert',
        documentId: newClosing.id,
        data: newClosing,
        summaryKm: `បិទបញ្ជីចុងខែសម្រាប់៖ ${closing.monthYear}`,
        summaryEn: `Closed monthly accounts for: ${closing.monthYear}`,
      });
    } else {
      setMonthlyClosings(prev => [...prev, newClosing]);
      localStorage.setItem('op_erp_monthly_closings', JSON.stringify([...monthlyClosings, newClosing]));
      try {
        await setDoc(doc(db, 'monthlyClosings', newClosing.id), newClosing);
      } catch (err) {
        console.warn("Firestore save monthly closing failed:", err);
      }
    }

    await logSystemAction(
      'បិទបញ្ជីចុងខែ',
      `បានបិទបញ្ជីចុងខែ ${closing.monthYear} ដោយជោគជ័យ។ ចំណូល៖ $${closing.totalSales.toFixed(2)}, ថ្លៃដើម៖ $${closing.totalCost.toFixed(2)}, ចំណាយផ្សេងៗ៖ $${closing.totalExpenses.toFixed(2)}, ប្រាក់ចំណេញសុទ្ធ៖ $${closing.netProfit.toFixed(2)}`
    );
  };

  const handleMainMenuClearAll = async () => {
    setIsClearingAll(true);
    try {
      // 1. Wipe database collections: products, sales, expenses, logs
      const colls = ['products', 'sales', 'expenses', 'logs'];
      for (const coll of colls) {
        const snap = await getDocs(collection(db, coll));
        const batch = writeBatch(db);
        snap.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }

      // 2. Clear any local draft changes
      setDraftChanges([]);
      localStorage.removeItem('op_erp_draft_changes');

      // 3. Log the system action so there's an audit trail
      const clearLog: ActionLog = {
        id: `log-${Date.now()}`,
        user: currentUser,
        role: currentRole,
        action: 'លុបសម្អាតទិន្នន័យ (Clear All Data)',
        details: 'បានលុបសម្អាតទិន្នន័យពីគ្រប់ Modules ទាំងអស់ (Products, Sales, Expenses, Logs)',
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, 'logs', clearLog.id), clearLog);

      // Close confirmation dialog
      setIsConfirmingClearAll(false);
    } catch (err: any) {
      console.error("Clear All error: ", err);
      setSyncError(lang === 'km' ? `ការសម្អាតបរាជ័យ៖ ${err.message || err}` : `Clear failed: ${err.message || err}`);
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleResetFactory = async () => {
    // 1. Reset local state and localStorage instantly
    localStorage.setItem('op_erp_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('op_erp_sales', JSON.stringify(INITIAL_SALES));
    localStorage.setItem('op_erp_expenses', JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem('op_erp_team', JSON.stringify(INITIAL_TEAM));
    localStorage.setItem('op_erp_logs', JSON.stringify(INITIAL_LOGS));
    
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
    setTeam(INITIAL_TEAM);
    setLogs(INITIAL_LOGS);

    // 2. Attempt to seed Firestore
    try {
      const colls = ['products', 'sales', 'expenses', 'team', 'logs'];
      for (const coll of colls) {
        const snap = await getDocs(collection(db, coll));
        const batch = writeBatch(db);
        snap.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
      for (const p of INITIAL_PRODUCTS) await setDoc(doc(db, 'products', p.id), p);
      for (const s of INITIAL_SALES) await setDoc(doc(db, 'sales', s.id), s);
      for (const e of INITIAL_EXPENSES) await setDoc(doc(db, 'expenses', e.id), e);
      for (const t of INITIAL_TEAM) await setDoc(doc(db, 'team', t.id), t);
      for (const l of INITIAL_LOGS) await setDoc(doc(db, 'logs', l.id), l);
    } catch (err: any) {
      console.warn("Firestore seeding failed during reset factory, fallback to local preset completed successfully:", err);
    }
  };

  // Change language dynamically
  const handleChangeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('erp_language_preference', newLang);
  };

  // Secure Portal Login Submission Handler
  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Credentials map
    const CREDENTIALS = [
      { username: 'vannak', password: 'admin8888', name: 'Bo Vannak', role: 'Owner' as Role },
      { username: 'kunthy', password: 'admin123', name: 'Teng Kunthy', role: 'Admin' as Role },
      { username: 'sreypich', password: 'admin123', name: 'Teng SreyPich', role: 'Admin' as Role }
    ];

    const found = CREDENTIALS.find(
      (c) => c.username.toLowerCase() === loginUsername.trim().toLowerCase() && c.password === loginPassword.trim()
    );

    if (found) {
      setCurrentRole(found.role);
      setCurrentUser(found.name);
      setIsLoggedIn(true);
      sessionStorage.setItem('erp_is_logged_in', 'true');
      sessionStorage.setItem('erp_current_role', found.role);
      sessionStorage.setItem('erp_current_user', found.name);
      
      // Post an audit log for successful login
      const initLog: ActionLog = {
        id: `log-${Date.now()}`,
        user: found.name,
        role: found.role,
        action: 'ចូលប្រព័ន្ធ (Login Session)',
        details: `បានបើកដំណើរការម៉ាស៊ីន ERP ប្រព័ន្ធសុវត្ថិភាពខ្ពស់`,
        timestamp: new Date().toISOString(),
      };
      
      // Concat to existing logs or save directly to local storage safely
      const cachedLogs = localStorage.getItem('op_erp_logs');
      const parsedLogs : ActionLog[] = cachedLogs ? JSON.parse(cachedLogs) : INITIAL_LOGS;
      localStorage.setItem('op_erp_logs', JSON.stringify([...parsedLogs, initLog]));
      setLogs([...parsedLogs, initLog]);
    } else {
      setLoginError(t.loginError);
    }
  };

  // Logout safe
  const handlePortalLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('erp_is_logged_in');
    sessionStorage.removeItem('erp_current_role');
    sessionStorage.removeItem('erp_current_user');
    setLoginUsername('');
    setLoginPassword('');
  };

  // Computed metrics - Both Owner and Admin observe shared values dynamically
  const outOfStockCount = visibleProducts.filter((p) => p.stock === 0).length;
  const totalItemsCount = visibleProducts.reduce((acc, p) => acc + p.stock, 0);
  
  // Capital/Cost summaries of current inventory (ចំនួនស្តុកសរុប × តម្លៃដើមទិញចូល)
  const totalStockCapital = visibleProducts.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const oldStockCapital = visibleProducts.reduce((acc, p) => acc + (p.stockType === 'old' ? p.stock * p.purchasePrice : 0), 0);
  const newStockCapital = visibleProducts.reduce((acc, p) => acc + (p.stockType === 'old' ? 0 : p.stock * p.purchasePrice), 0);
  
  // Total Revenue ($ sum of transactions where payment is settled)
  const totalRevenue = visibleSales
    .filter((s) => !s.paymentStatus || s.paymentStatus === 'Paid')
    .reduce((acc, s) => acc + s.totalSelling, 0);

  // Total Expenses ($ sum of employee wages, rent, utilities etc)
  const totalExpenses = visibleExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Total Cost ($ sum of purchase cost pricing of those transactions where payment is settled)
  const totalCostOfSales = visibleSales
    .filter((s) => !s.paymentStatus || s.paymentStatus === 'Paid')
    .reduce((acc, s) => acc + s.totalCost, 0);

  // Profit Formula: Gross Revenue ($) - Units Product Cost ($) - Operating Expenses ($)
  const netProfit = totalRevenue - totalCostOfSales - totalExpenses;

  // Check if current user is owner or Teng Kunthy (Admin with full rights)
  const isOwnerOrKunthy = true;

  // Render LOCK SCREEN portal if not authenticated
  if (!isLoggedIn) {
    const theme = LOGIN_THEMES[loginThemeId];
    return (
      <div className="min-h-screen bg-[#030611] flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-100 selection:bg-indigo-600 selection:text-white font-sans">
        {/* Dynamic theme ambient glow */}
        <div className={`absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br ${theme.bgGlows} blur-[120px] opacity-75 pointer-events-none z-0`}></div>
        <div className={`absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br ${theme.bgGlows} blur-[120px] opacity-60 pointer-events-none z-0`}></div>

        {/* Floating Controls Bar (Language & Dynamic Luxury Theme Switcher) */}
        <div className="z-10 mb-8 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/60 p-2 sm:p-1.5 px-4 rounded-3xl border border-slate-800/80 text-xs shadow-xl backdrop-blur-md">
          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">{lang === 'km' ? 'ភាសា' : 'Language'}:</span>
            <button
              onClick={() => handleChangeLanguage('km')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all text-[10px] cursor-pointer ${
                lang === 'km' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ខ្មែរ (KM)
            </button>
            <button
              onClick={() => handleChangeLanguage('en')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all text-[10px] cursor-pointer ${
                lang === 'en' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English (EN)
            </button>
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-slate-800"></div>

          {/* Theme Color Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">{lang === 'km' ? 'ពណ៌ប្រព័ន្ធ' : 'Login Color'}:</span>
            <div className="flex items-center gap-1.5">
              {(Object.keys(LOGIN_THEMES) as LoginThemeId[]).map((themeId) => {
                const tConfig = LOGIN_THEMES[themeId];
                let colorBallClass = '';
                if (themeId === 'emerald') colorBallClass = 'bg-emerald-500';
                else if (themeId === 'sapphire') colorBallClass = 'bg-blue-500';
                else if (themeId === 'rosegold') colorBallClass = 'bg-rose-400';
                else if (themeId === 'amber') colorBallClass = 'bg-amber-500';
                else if (themeId === 'amethyst') colorBallClass = 'bg-violet-500';
                else if (themeId === 'cyan') colorBallClass = 'bg-teal-400';

                return (
                  <button
                    key={themeId}
                    type="button"
                    title={lang === 'km' ? tConfig.nameKm : tConfig.nameEn}
                    onClick={() => {
                      setLoginThemeId(themeId);
                      localStorage.setItem('erp_login_theme', themeId);
                    }}
                    className={`w-5 h-5 rounded-full ${colorBallClass} transition-all duration-200 hover:scale-115 cursor-pointer relative flex items-center justify-center ${
                      loginThemeId === themeId 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {loginThemeId === themeId && (
                      <span className="absolute w-1.5 h-1.5 bg-slate-950 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Brand Header */}
        <div className="z-10 flex flex-col items-center select-none text-center">
          {/* Outer Watch Logo Container */}
          <div className={`w-[110px] h-[110px] bg-[#090f1d] border ${theme.logoBorder} rounded-[28px] flex items-center justify-center relative shadow-2xl ${theme.logoGlow} transition-all duration-300`}>
            <div className={`transition-colors duration-300 ${theme.watchColor}`}>
              <Watch className="w-14 h-14 stroke-[1.5]" />
            </div>
            {/* PRO badge matching theme */}
            <div className={`absolute -bottom-1 -right-2 ${theme.checkboxBg} text-slate-950 font-black tracking-wider text-[9px] px-2.5 py-0.5 rounded-full shadow-lg border border-[#090f1d] transition-all duration-300`}>
              PRO
            </div>
          </div>

          <h1 className="text-slate-100 font-serif tracking-[0.2em] text-4xl sm:text-[2.65rem] font-black text-center mt-6 uppercase leading-none text-shadow">
            KUNTHY WATCH
          </h1>

          {/* Subtitle with dynamic separator lines */}
          <div className="flex items-center justify-center gap-4 w-full max-w-sm mt-3.5 mb-8 px-4">
            <div className={`h-[1px] flex-1 bg-gradient-to-r ${theme.lineColor}`}></div>
            <span className={`text-[10px] tracking-[0.2em] font-mono font-bold uppercase ${theme.subtitleColor} whitespace-nowrap transition-colors duration-300`}>
              {lang === 'km' ? 'ប្រព័ន្ធគ្រប់គ្រងការលក់ និងស្តុក' : 'PREMIUM INVENTORY MANAGEMENT'}
            </span>
            <div className={`h-[1px] flex-1 bg-gradient-to-r ${theme.lineColor}`}></div>
          </div>
        </div>

        {/* Lock Card Container */}
        <div className="w-full max-w-md bg-[#090f1d]/85 backdrop-blur-2xl border border-slate-800/80 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 transition-all duration-300 relative overflow-hidden space-y-6">
          {/* Card Top Glowing line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.cardTopBorder} opacity-80 transition-all duration-300`}></div>

          {/* Inner Header - SYSTEM LOGIN badge */}
          <div className="w-full bg-[#030611] border border-slate-800/40 rounded-2xl py-3 px-4 flex items-center justify-center gap-2.5 shadow-inner">
            <span className="text-sm">🔑</span>
            <span className="text-xs font-extrabold text-slate-300 tracking-wider uppercase font-sans">
              {lang === 'km' ? 'ផ្ទាំងចូលប្រើប្រាស់ប្រព័ន្ធ' : 'SYSTEM LOGIN'}
            </span>
          </div>

          <form onSubmit={handlePortalLogin} className="space-y-4 pt-1 text-left">
            {/* Username Input */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1.5 font-bold uppercase tracking-widest pl-1">
                {lang === 'km' ? 'ឈ្មោះគណនី (USERNAME)' : 'USERNAME'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={lang === 'km' ? 'បញ្ចូលឈ្មោះគណនី...' : 'Enter username...'}
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full bg-[#ebf2ff] border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 font-sans text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all font-semibold"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  autoFocus
                />
                <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2]" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1.5 font-bold uppercase tracking-widest pl-1">
                {lang === 'km' ? 'លេខសម្ងាត់ (PASSWORD)' : 'PASSWORD'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full bg-[#ebf2ff] border border-transparent rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 font-sans text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all font-semibold tracking-wider"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2]" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer focus:outline-none p-1 rounded-full transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5 stroke-[2]" /> : <Eye className="w-4.5 h-4.5 stroke-[2]" />}
                </button>
              </div>
            </div>

            {/* Custom Remember Me Switch */}
            <div className="pt-1.5 pl-1">
              <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                      localStorage.setItem('erp_remember_me', String(e.target.checked));
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    rememberMe 
                      ? `${theme.checkboxBg} border-transparent shadow-md` 
                      : 'border-slate-700 bg-[#030611]'
                  }`}>
                    {rememberMe && (
                      <CheckCircle2 className="w-4.5 h-4.5 text-slate-950 font-black fill-current stroke-2" />
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold tracking-wide">
                  {lang === 'km' ? 'ចងចាំគណនី (Remember me)' : 'Remember me'}
                </span>
              </label>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="text-[10.5px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-3 px-4 rounded-2xl flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 stroke-[2]" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              className={`w-full py-4 ${theme.buttonBg} text-slate-950 font-extrabold rounded-2xl text-xs transition duration-200 shadow-xl cursor-pointer text-center uppercase tracking-widest flex items-center justify-center gap-2.5 border-t border-white/20`}
            >
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
              <span>{lang === 'km' ? 'ចូលប្រើប្រាស់ប្រព័ន្ធ (SIGN IN)' : 'SIGN IN'}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className={`mt-12 text-center text-[10px] ${theme.footerColor} font-mono tracking-[0.18em] select-none transition-colors duration-300`}>
          © 2026 KUNTHY WATCH STORE. ALL RIGHTS RESERVED.
        </div>
      </div>
    );
  }

  // MAIN RUNNING APP (Once isLoggedIn is validated to prevent direct access bypass)
  const activeTheme = LOGIN_THEMES[loginThemeId] || LOGIN_THEMES.emerald;

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-250 ${isDark ? 'dark bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'} relative overflow-hidden`}>
      {/* Top Banner Accent with dynamic luxury theme gradient */}
      <div className={`h-1.5 bg-gradient-to-r ${activeTheme.cardTopBorder} opacity-90 transition-all duration-500`}></div>

      {/* Dynamic luxury brand ambient background glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${activeTheme.bgGlows} blur-[130px] opacity-10 dark:opacity-25 transition-all duration-700`}></div>
        <div className={`absolute bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${activeTheme.bgGlows} blur-[130px] opacity-10 dark:opacity-20 transition-all duration-700`}></div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 relative z-10">
        


        {/* Header Hero Area */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* BRAND LOGO DISPLAY ACCENT */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${logoColorStylesByTheme[shopLogoColor]?.bg || 'bg-indigo-50'} ${logoColorStylesByTheme[shopLogoColor]?.border || 'border-indigo-100'} ${logoColorStylesByTheme[shopLogoColor]?.text || 'text-indigo-600'}`}>
              <ShopLogo type={shopLogoType} iconName={shopLogoIcon} imgUrl={shopLogoImgUrl} className="w-8 h-8 rounded-md" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="p-1 px-2.2 bg-indigo-600/10 text-indigo-700 text-[10px] font-bold tracking-widest rounded-full uppercase border border-indigo-600/15">
                  Enterprise Hub
                </span>
                <span className="flex items-center gap-1 text-[10.5px] text-slate-500 font-mono">
                  <Globe className="w-3.5 h-3.5 text-slate-400 animate-spin-slow" />
                  Live Hub Sync
                </span>

                {/* Edit Shop Branding Settings */}
                {currentUser !== 'Teng SreyPich' && (
                  <button
                    onClick={() => setIsEditingShop(true)}
                    className="flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-indigo-700 hover:text-indigo-800 rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    <Pencil className="w-2.5 h-2.5 text-indigo-600" />
                    {lang === 'km' ? 'កែប្រែហាង និង Logo' : 'Edit Shop & Logo'}
                  </button>
                )}

                {/* Secure Session Sign-Out button */}
                <button
                  onClick={handlePortalLogout}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition-colors"
                >
                  {lang === 'km' ? '🔒 ចាកចេញពីប្រព័ន្ធ (Log Out)' : '🔒 Sign Out'}
                </button>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1 leading-tight">
                {lang === 'km' ? shopNameKm : shopNameEn}
              </h1>
              <p className="text-slate-500 text-xs mt-1 max-w-2xl leading-relaxed">
                {t.syncDesc}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto lg:justify-end">
            {/* Locked Active Operator Badge showing active user securely */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow shrink-0"></span>
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                {currentUser === 'Bo Vannak' ? '👑 Bo Vannak' : currentUser === 'Teng Kunthy' ? '💼 Teng Kunthy' : '👧 Teng SreyPich'} 
                <span className="text-slate-400 dark:text-slate-500 font-bold ml-1">
                  ({currentRole === 'Owner' ? (lang === 'km' ? 'ម្ចាស់ហាង' : 'Owner') : (lang === 'km' ? 'គ្រប់គ្រងប្រតិបត្តិការ' : 'Operations Admin')})
                </span>
              </span>
            </div>

            {/* Theme Color Selector Pill inside main dashboard */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-1.5 rounded-xl shadow-xs shrink-0 select-none">
              <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold px-1 uppercase tracking-wider">{lang === 'km' ? 'ពណ៌' : 'Brand Theme'}:</span>
              <div className="flex items-center gap-1.5">
                {(Object.keys(LOGIN_THEMES) as LoginThemeId[]).map((themeId) => {
                  const tConfig = LOGIN_THEMES[themeId];
                  let colorBallClass = '';
                  if (themeId === 'emerald') colorBallClass = 'bg-emerald-500';
                  else if (themeId === 'sapphire') colorBallClass = 'bg-blue-500';
                  else if (themeId === 'rosegold') colorBallClass = 'bg-rose-400';
                  else if (themeId === 'amber') colorBallClass = 'bg-amber-500';
                  else if (themeId === 'amethyst') colorBallClass = 'bg-violet-500';
                  else if (themeId === 'cyan') colorBallClass = 'bg-teal-400';

                  return (
                    <button
                      key={themeId}
                      type="button"
                      title={lang === 'km' ? tConfig.nameKm : tConfig.nameEn}
                      onClick={() => {
                        setLoginThemeId(themeId);
                        localStorage.setItem('erp_login_theme', themeId);
                      }}
                      className={`w-3.5 h-3.5 rounded-full ${colorBallClass} transition-all duration-200 hover:scale-125 cursor-pointer relative flex items-center justify-center ${
                        loginThemeId === themeId 
                          ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {loginThemeId === themeId && (
                        <span className="absolute w-1 h-1 bg-white rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Online / Offline status badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs select-none ${
              isOnline 
                ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-rose-50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span>{isOnline ? (lang === 'km' ? 'ភ្ជាប់បណ្តាញ (Online)' : 'Online') : (lang === 'km' ? 'ក្រៅបណ្តាញ (Offline)' : 'Offline Mode')}</span>
            </div>

            {/* Language Selection Pill */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-1 rounded-xl shadow-xs shrink-0 select-none">
              <button
                onClick={() => handleChangeLanguage('km')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'km'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Khmer Language (KM)"
              >
                ខ្មែរ
              </button>
              <button
                onClick={() => handleChangeLanguage('en')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="English Language (EN)"
              >
                EN
              </button>
            </div>

            {/* Sync Mode Toggle Button */}
            <button
              onClick={() => setIsDraftMode(!isDraftMode)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border font-bold cursor-pointer transition-all shrink-0 shadow-xs ${
                isDraftMode
                  ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-250 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100/50'
                  : 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50'
              }`}
              title={isDraftMode ? (lang === 'km' ? 'របៀបព្រាងទុក (Draft & Publish) - ចុចដើម្បីប្តូរទៅផ្ទាល់ៗ' : 'Draft & Publish Mode - Click to switch to Live') : (lang === 'km' ? 'របៀបផ្ទាល់ៗ (Live Sync) - ចុចដើម្បីប្តូរទៅព្រាងទុក' : 'Live Sync Mode - Click to switch to Draft')}
            >
              {isDraftMode ? <Layers className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> : <Activity className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{isDraftMode ? (lang === 'km' ? 'ព្រាងទុក' : 'Draft') : (lang === 'km' ? 'ផ្ទាល់ៗ' : 'Live')}</span>
              {isDraftMode && draftChanges.length > 0 && (
                <span className="ml-1 bg-amber-600 text-white rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none">
                  {draftChanges.length}
                </span>
              )}
            </button>
            {/* Open standalone link in new tab */}
            <a
              href={typeof window !== 'undefined' ? window.location.href : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all shrink-0 font-bold shadow-xs"
              title={lang === 'km' ? 'បើកក្នុង Tab ថ្មីដើម្បីតម្លើងជា App' : 'Open standalone in New Tab to install'}
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>{lang === 'km' ? 'បើកក្នុង Tab ថ្មី' : 'Open standalone'}</span>
            </a>

            {/* Refresh Button */}
            <button
              onClick={handleRefreshApp}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all shrink-0 font-bold shadow-xs disabled:opacity-50"
              title="Refresh ERP application and re-fetch status from live Firestore"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{lang === 'km' ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}</span>
            </button>

            {/* Database Backup & Restore Control Button */}
            <button
              onClick={() => {
                setIsBackupModalOpen(true);
                setImportStatus({ status: 'idle', message: '' });
                setBackupFileToImport(null);
                setImportFileName('');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-teal-600 hover:text-teal-700 dark:text-teal-450 dark:hover:text-teal-400 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-950/30 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 rounded-xl cursor-pointer transition-all shrink-0 font-bold shadow-xs"
              title="Download backup file or import existing JSON DB backup"
            >
              <Database className="w-3.5 h-3.5 text-teal-500" />
              <span>{lang === 'km' ? 'ចម្លង/សង្គ្រោះ (Backup)' : 'Backup & Restore'}</span>
            </button>

            {/* Clear All Data Button */}
            {isOwnerOrKunthy && (
              <button
                onClick={() => setIsConfirmingClearAll(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-450 dark:hover:text-rose-400 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/30 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer transition-all shrink-0 font-bold shadow-xs"
                title="Clear all database content (Wipe products, sales, expenses, and logs)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>{lang === 'km' ? 'សម្អាតទិន្នន័យ (Clear All)' : 'Clear All'}</span>
              </button>
            )}

            {/* Dark/Light mode toggle button */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all shrink-0 font-bold shadow-xs"
              title="Toggle Light / Dark Mode"
            >
              {isDark ? (
                <>
                  <span>☀️</span>
                  <span>{lang === 'km' ? 'ភ្លឺ' : 'Light'}</span>
                </>
              ) : (
                <>
                  <span>🌙</span>
                  <span>{lang === 'km' ? 'ងងឹត' : 'Dark'}</span>
                </>
              )}
            </button>
          </div>
        </header>

        {syncError && (
          <div className="mb-6 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-800 dark:text-rose-200 p-5 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-fade-in animate-duration-300">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="font-extrabold text-[12.5px] text-rose-950 dark:text-rose-100">{lang === 'km' ? 'បញ្ហាការតភ្ជាប់ទិន្នន័យ (Database Connection / Permissions Issue)' : 'Database Connection / Permissions Issue'}</p>
                <p className="opacity-90 leading-relaxed text-[11px] text-slate-500 dark:text-slate-400 mt-1">{syncError}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto justify-end shrink-0">
              <button 
                onClick={() => {
                  setSyncError(null);
                  window.location.reload();
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg cursor-pointer transition-colors shadow-xs text-[11px]"
              >
                {lang === 'km' ? 'សាកល្បងឡើងវិញ (Retry)' : 'Retry'}
              </button>
            </div>
          </div>
        )}

        {/* Compact Draft & Publish Notifier Banner */}
        {isDraftMode && draftChanges.length > 0 && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/40 p-4.5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm animate-fade-in animate-duration-300">
            <div className="flex gap-3">
              <span className="p-2.5 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-5.5 h-5.5 animate-pulse" />
              </span>
              <div>
                <h4 className="text-sm font-black text-amber-950 dark:text-amber-305 leading-tight">
                  {lang === 'km' ? '📥 សកម្មភាពព្រាងទុកដែលមិនទាន់រក្សាទុក (Pending Operations)' : '📥 Unsaved Local Draft Changes'}
                </h4>
                <p className="text-[11.5px] text-amber-900/80 dark:text-slate-400 mt-1.5 leading-snug">
                  {lang === 'km'
                    ? `អ្នកមាន ${draftChanges.length} សកម្មភាពកំពុងព្រាងទុកក្នុងឧបករណ៍នេះ។ ការកែប្រែនេះនឹងមិនទាន់ផ្សព្វផ្សាយជាសកលទេ រហូតទាល់តែអ្នកចុចប៊ូតុង "បោះពុម្ពផ្សាយឥឡូវនេះ"`
                    : `You have ${draftChanges.length} pending operations locally. These modifications will not take effect worldwide until you click "Publish Changes Now".`}
                </p>
                
                {/* List of pending changes inline */}
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                  {draftChanges.slice(0, 5).map((change) => (
                    <span key={change.id} className="text-[10px] bg-white/70 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-950 text-slate-700 dark:text-slate-300 font-medium">
                      {lang === 'km' ? change.summaryKm : change.summaryEn}
                    </span>
                  ))}
                  {draftChanges.length > 5 && (
                    <span className="text-[10px] text-amber-700 font-bold">
                      +{draftChanges.length - 5} {lang === 'km' ? 'ផ្សេងទៀត...' : 'more...'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full lg:w-auto self-stretch lg:self-auto justify-end shrink-0">
              <button
                onClick={handleDiscardDrafts}
                disabled={isRefreshing}
                className="px-4 py-2 text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {lang === 'km' ? '❌ លុបការព្រាងទាំងស្រុង' : 'Discard Drafts'}
              </button>
              <button
                onClick={handlePublishDrafts}
                disabled={isRefreshing}
                className="px-4.5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 rounded-xl cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-all outline-hidden ring-2 ring-indigo-500/15 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 animate-pulse text-yellow-300" />
                {lang === 'km' ? '📤 ផ្សព្វផ្សាយឥឡូវនេះ (Publish)' : 'Publish Changes Now'}
              </button>
            </div>
          </div>
        )}





        {/* Stat Cards Grid Column structure with beautiful colored bento-style styling */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4.5 mb-8">
          
          {/* Card 1: Live Stock level */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/85"></div>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t.cardStockUnits}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">{totalItemsCount}</span>
                  <span className="text-slate-450 dark:text-slate-400 text-xs font-semibold">{t.pcs}</span>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl transition-colors group-hover:bg-blue-100/70 dark:group-hover:bg-blue-900/55">
                <Package className="w-5.5 h-5.5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
              {outOfStockCount > 0 ? (
                <span className="text-[10.5px] text-rose-500 font-bold block animate-pulse flex items-center gap-1">
                  ⚠️ {t.cardStockWarning.replace('{{count}}', outOfStockCount.toString())}
                </span>
              ) : (
                <span className="text-[10.5px] text-emerald-600 dark:text-emerald-450 font-bold block flex items-center gap-1">
                  ✨ {t.cardStockSafe}
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Shared Revenue Receipts */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/85"></div>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t.cardRevenue}</span>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-105 font-mono tracking-tight">${totalRevenue.toFixed(2)}</span>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors group-hover:bg-emerald-100/70 dark:group-hover:bg-emerald-900/55">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-[10.5px] text-emerald-600 dark:text-emerald-450 font-extrabold font-mono">
                +{sales.length} {t.transactions}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                {lang === 'km' ? 'សមកាលកម្មទិន្នន័យ' : 'Live Sync'}
              </span>
            </div>
          </div>

          {/* Card 2.5: Total Stock Capital */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/85"></div>
            <div className="flex items-start justify-between">
              <div className="space-y-1 w-full">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t.cardStockCapital}</span>
                
                {isOwnerOrKunthy ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">${totalStockCapital.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="filter blur-[4px] select-none text-xl font-bold font-mono text-slate-300 dark:text-slate-700">$9,999.00</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[8px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded">
                      <Lock className="w-2.5 h-2.5 shrink-0" />
                      {t.cardNetProfitLock}
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${isOwnerOrKunthy ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 group-hover:bg-amber-100/70 dark:group-hover:bg-amber-900/55' : 'bg-slate-50 dark:bg-slate-900 text-slate-300'}`}>
                <Coins className="w-5.5 h-5.5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
              {isOwnerOrKunthy ? (
                <div className="flex justify-between items-center text-[9.5px] text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-450 font-bold">{lang === 'km' ? 'ថ្មី:' : 'New:'} ${newStockCapital.toFixed(0)}</span>
                  <span className="text-amber-600 dark:text-amber-450 font-bold">{lang === 'km' ? 'ចាស់:' : 'Old:'} ${oldStockCapital.toFixed(0)}</span>
                </div>
              ) : (
                <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium">
                  {lang === 'km' ? 'រក្សាសុវត្ថិភាពទិន្នន័យ' : 'Protected field'}
                </span>
              )}
            </div>
          </div>

          {/* Card 3: OPERATIONAL EXPENSES */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/85"></div>
            <div className="flex items-start justify-between">
              <div className="space-y-1 w-full">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t.cardTotalExpenses}</span>
                
                {isOwnerOrKunthy ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">${totalExpenses.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="filter blur-[4px] select-none text-xl font-bold font-mono text-slate-300 dark:text-slate-700">$1,350.00</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[8px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded">
                      <Lock className="w-2.5 h-2.5 shrink-0" />
                      {t.cardNetProfitLock}
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${isOwnerOrKunthy ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 group-hover:bg-rose-100/70 dark:group-hover:bg-rose-900/55' : 'bg-slate-50 dark:bg-slate-900 text-slate-300'}`}>
                <CircleDollarSign className="w-5.5 h-5.5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] text-rose-500 dark:text-rose-450 font-bold block">
                {isOwnerOrKunthy ? `✨ ${t.cardExpensesCalc}` : (lang === 'km' ? 'រក្សាសុវត្ថិភាពទិន្នន័យ' : 'Protected field')}
              </span>
            </div>
          </div>

          {/* Card 4: NET PROFITS */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/85"></div>
            <div className="flex items-start justify-between">
              <div className="space-y-1 w-full">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t.cardNetProfit}</span>
                
                {isOwnerOrKunthy ? (
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black font-mono tracking-tight ${netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-450'}`}>
                      {netProfit >= 0 ? '' : '-'}${Math.abs(netProfit).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="filter blur-[4px] select-none text-xl font-bold font-mono text-slate-300 dark:text-slate-700">$854.20</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[8px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded">
                      <Lock className="w-2.5 h-2.5 shrink-0" />
                      {t.cardNetProfitLock}
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${isOwnerOrKunthy ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 group-hover:bg-indigo-100/70 dark:group-hover:bg-indigo-900/55' : 'bg-slate-50 dark:bg-slate-900 text-slate-300'}`}>
                <BarChart3 className="w-5.5 h-5.5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-455 font-bold block">
                {isOwnerOrKunthy ? `✨ ${t.cardNetProfitCalc}` : (lang === 'km' ? 'រក្សាសុវត្ថិភាពទិន្នន័យ' : 'Protected field')}
              </span>
            </div>
          </div>

        </section>





        {/* Modules navigation Tabs in modern premium pill style */}
        <div className="bg-white/70 dark:bg-[#0f172a]/60 p-2 rounded-2xl mb-8 flex flex-wrap gap-2 border border-slate-200/50 dark:border-slate-800/65 backdrop-blur-md shadow-inner select-none transition-all">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-350 cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white shadow-md shadow-indigo-500/20 scale-[1.02] font-black'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.tabInventory}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-350 cursor-pointer flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white shadow-md shadow-emerald-500/20 scale-[1.02] font-black'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t.tabSales}</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-350 cursor-pointer flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white shadow-md shadow-indigo-500/20 scale-[1.02] font-black'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{t.tabPaymentDashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('service')}
            className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-350 cursor-pointer flex items-center gap-2 ${
              activeTab === 'service'
                ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white shadow-md shadow-blue-500/20 scale-[1.02] font-black'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{t.tabService}</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-350 cursor-pointer flex items-center gap-2 ${
              activeTab === 'expenses'
                ? 'bg-rose-600 text-white dark:bg-rose-600 dark:text-white shadow-md shadow-rose-500/20 scale-[1.02] font-black'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
            }`}
          >
            <CircleDollarSign className="w-4 h-4" />
            <span>{t.tabExpenses}</span>
          </button>

          {currentUser !== 'Teng SreyPich' && (
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-350 cursor-pointer flex items-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-amber-500 text-white dark:bg-amber-500 dark:text-white shadow-md shadow-amber-500/20 scale-[1.02] font-black'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.tabStaff}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('install')}
            className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-350 cursor-pointer flex items-center gap-2 ${
              activeTab === 'install'
                ? 'bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white shadow-md shadow-indigo-500/20 scale-[1.02] font-black'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
            }`}
          >
            <Smartphone className="w-4 h-4 animate-bounce" />
            <span>{t.tabInstall}</span>
          </button>
        </div>

        {/* Module Content Switcher render */}
        <main className="mb-8">
          {activeTab === 'inventory' && (
            <InventoryManager 
              products={visibleProducts}
              currentRole={currentRole}
              currentUser={currentUser}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onUpdateStock={handleUpdateStock}
              onDeleteProduct={handleDeleteProduct}
              lang={lang}
              onSaveStockCount={handleSaveStockCount}
              stockCounts={visibleStockCounts}
              exchangeRate={exchangeRate}
            />
          )}

          {activeTab === 'sales' && (
            <SalesManager 
              sales={visibleSales}
              products={visibleProducts}
              expenses={visibleExpenses}
              currentRole={currentRole}
              currentUser={currentUser}
              onAddSale={handleAddSale}
              onDeleteSale={handleDeleteSale}
              onUpdateSaleStatus={handleUpdateSaleStatus}
              lang={lang}
              onClearSales={handleClearSalesData}
              monthlyClosings={visibleMonthlyClosings}
              onSaveMonthlyClosing={handleSaveMonthlyClosing}
              exchangeRate={exchangeRate}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentStatusDashboard 
              sales={visibleSales}
              currentRole={currentRole}
              currentUser={currentUser}
              onUpdateSaleStatus={handleUpdateSaleStatus}
              lang={lang}
            />
          )}

          {activeTab === 'service' && (
            <ServiceManager 
              sales={visibleSales}
              currentRole={currentRole}
              currentUser={currentUser}
              onAddSale={handleAddSale}
              onDeleteSale={handleDeleteSale}
              onUpdateSaleStatus={handleUpdateSaleStatus}
              lang={lang}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseManager 
              expenses={visibleExpenses}
              currentRole={currentRole}
              currentUser={currentUser}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              lang={lang}
            />
          )}

          {activeTab === 'staff' && currentUser !== 'Teng SreyPich' && (
            <TeamManager 
              team={visibleTeam}
              currentRole={currentRole}
              currentUser={currentUser}
              onModifySalary={handleModifySalary}
              onAddMember={handleAddMember}
              lang={lang}
            />
          )}

          {activeTab === 'install' && (
            <InstallGuide />
          )}
        </main>

        {/* Bottom Section: Real-time action log always available to display collaboration */}
        <section>
          <ActionLogs 
            logs={currentUser === 'Teng SreyPich' ? visibleLogs.filter(l => l.user === 'Teng SreyPich') : visibleLogs}
            currentRole={currentRole}
            currentUser={currentUser}
            onPostLog={handlePostLog}
            onClearLogs={handleClearLogs}
          />
        </section>

        {/* EDIT BRAND SHOP MODAL DIALOG */}
        {isEditingShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setIsEditingShop(false)}
            ></div>
            
            {/* Modal Body */}
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative z-10 transition-all max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl border ${logoColorStylesByTheme[shopLogoColor]?.bg || 'bg-indigo-50'} ${logoColorStylesByTheme[shopLogoColor]?.border || 'border-indigo-100'} ${logoColorStylesByTheme[shopLogoColor]?.text || 'text-indigo-600'}`}>
                    <Paintbrush className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-850">
                    {lang === 'km' ? 'កែសម្រួលព័ត៌មានហាង និង Logo' : 'Edit Shop Branding & Logo'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsEditingShop(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-655 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <ShopBrandingForm 
                initialConfig={{
                  nameKm: shopNameKm,
                  nameEn: shopNameEn,
                  logoType: shopLogoType,
                  logoIcon: shopLogoIcon,
                  logoImgUrl: shopLogoImgUrl,
                  logoColor: shopLogoColor,
                  exchangeRate: exchangeRate
                }}
                onSave={handleSaveShopConfig}
                onCancel={() => setIsEditingShop(false)}
                lang={lang}
              />
            </div>
          </div>
        )}
        {/* CLEAR ALL DATA CONFIRMATION MODAL */}
        {isConfirmingClearAll && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-red-500/20 dark:border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-6 text-slate-800 dark:text-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-150 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200/50 dark:border-red-500/20 shadow-inner">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-850 dark:text-slate-100">
                    {lang === 'km' ? 'លុបសម្អាតទិន្នន័យ (Clear All Data)' : 'Clear All Data Operation'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {lang === 'km' ? 'សកម្មភាពសម្អាតទិន្នន័យពី Cloud Firestore' : 'High danger database purge'}
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 p-3.5 rounded-xl text-xs space-y-2.5">
                <p className="font-semibold text-amber-700 dark:text-amber-400 leading-relaxed text-[11.5px]">
                  {lang === 'km' ? '⚠️ ព្រមាន៖ រាល់ទិន្នន័យផលិតផលស្តុក (Products), របាយការណ៍លក់ (Sales), ការចំណាយ (Expenses), និងប្រវត្តិសកម្មភាព (Logs) ទាំងអស់ នឹងត្រូវលុបចេញពីប្រព័ន្ធជាស្ថាពរ!' : '⚠️ Warning: ALL records including Stock Inventory, Invoices, Sales Ledger, Expenses, and logs will be permanently erased.'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                  {lang === 'km' ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ និងមិនអាចទាញយកមកវិញបានឡើយ។' : 'This database action cannot be undone or restored.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsConfirmingClearAll(false)}
                  disabled={isClearingAll}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-extrabold text-[11px] cursor-pointer transition-colors"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleMainMenuClearAll}
                  disabled={isClearingAll}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold text-[11px] cursor-pointer shadow-md shadow-rose-200/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isClearingAll ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                      <span>{lang === 'km' ? 'កំពុងសម្អាត...' : 'Clearing...'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? 'សម្អាតទាំងអស់' : 'Yes, Clear All'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DATABASE BACKUP AND RESTORE MODAL */}
        {isBackupModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-6 text-slate-800 dark:text-slate-100">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-50 dark:bg-teal-950/50 rounded-lg text-teal-600 dark:text-teal-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-slate-100">
                      {lang === 'km' ? 'មជ្ឈមណ្ឌល រក្សាទុក & សង្គ្រោះទិន្នន័យ ERP' : 'Database Backup & Recovery Console'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                      {lang === 'km' ? 'គ្រប់គ្រងចុះប្រចាំការ ឬទាញយកទិន្នន័យស្តុក វិក្កយបត្រ ចំណាយ និងបុគ្គលិក' : 'Export local datasets or import existing JSON logs safely'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBackupModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Sections */}
              <div className="space-y-5">
                
                {/* 1. EXPORT COLUMN */}
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/40 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === 'km' ? '១. ចម្លងទុកទិន្នន័យ (Export Database to JSON)' : '1. Export System Database to JSON File'}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {lang === 'km' 
                          ? 'រក្សាទុករាល់ទិន្នន័យផលិតផលក្នុងស្តុក វិក្កយបត្រលក់ចេញ បញ្ជីចំណាយ និងគណនីបុគ្គលិក ទៅជាឯកសារ JSON ក្នុងកុំព្យូទ័ររបស់អ្នក ដើម្បីបង្ការការបាត់បង់ដោយចៃដន្យ។' 
                          : 'Package and download all live inventories, transaction ledger, expense vouchers and staff profiles as a secure portable JSON archive.'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black cursor-pointer shadow-md shadow-emerald-250/20 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? 'ទាញយក Backup File (Download Backup)' : 'Download Backup JSON'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. IMPORT FILE UPLOAD ZONE (Drag and Drop / Manual Select) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 flex-wrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    {lang === 'km' ? '២. សង្គ្រោះទិន្នន័យពីក្រៅ (Restore Backup File)' : '2. Restore Complete Database from Local Archive'}
                  </h4>

                  {/* Drag and drop sandbox box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverActive(true);
                    }}
                    onDragLeave={() => setDragOverActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileDropOrSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => document.getElementById('backup-file-picker')?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      dragOverActive
                        ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30'
                    }`}
                  >
                    <input
                      id="backup-file-picker"
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileDropOrSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <UploadCloud className={`w-8 h-8 text-teal-500 transition-transform ${dragOverActive ? 'animate-bounce' : ''}`} />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
                      {lang === 'km' ? 'អូសទម្លាក់ Backup JSON នៅទីនេះ ឬ ចុចដើម្បីជ្រើសរើស' : 'Drag & drop JSON back-up file here, or click to browse'}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                      {lang === 'km' ? 'គាំទ្រតែប្រភេទឯកសារ (*.json) ប៉ុណ្ណោះ' : 'Only standardized ERP JSON backup config file (*.json) is supported'}
                    </p>
                  </div>

                  {/* File Upload Status Banner */}
                  {importStatus.status !== 'idle' && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-fade-in ${
                      importStatus.status === 'reading' || importStatus.status === 'restoring'
                        ? 'bg-blue-50/70 border-blue-100 text-blue-800 dark:bg-blue-950/10 dark:border-blue-900/30 dark:text-blue-300'
                        : importStatus.status === 'valid' || importStatus.status === 'success'
                        ? 'bg-emerald-50/70 border-emerald-100 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-900/30 dark:text-emerald-300'
                        : 'bg-rose-50/70 border-rose-100 text-rose-800 dark:bg-rose-950/10 dark:border-rose-900/30 dark:text-rose-300'
                    }`}>
                      {importStatus.status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {(importStatus.status === 'reading' || importStatus.status === 'restoring') && (
                        <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5"></span>
                      )}
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-[11.5px] flex items-center gap-1.5 flex-wrap">
                          {importFileName && <span className="bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.2 rounded text-[10px] tracking-tight">{importFileName}</span>}
                          <span>
                            {importStatus.status === 'reading' && (lang === 'km' ? 'កំពុងអាន...' : 'Reading...')}
                            {importStatus.status === 'restoring' && (lang === 'km' ? 'កំពុងបញ្ចូលទិន្នន័យ...' : 'Restoring records...')}
                            {importStatus.status === 'valid' && (lang === 'km' ? 'ស្កេនជោគជ័យ! រៀបចំរួចរាល់' : 'Load Approved')}
                            {importStatus.status === 'success' && (lang === 'km' ? 'សង្គ្រោះរួចរាល់!' : 'Complete!')}
                            {importStatus.status === 'invalid' && (lang === 'km' ? 'ឯកសារមិនត្រឹមត្រូវ' : 'Validation Error')}
                            {importStatus.status === 'error' && (lang === 'km' ? 'កំហុសបច្ចេកទេស' : 'Execution Error')}
                          </span>
                        </p>
                        <p className="text-[10px] opacity-90 leading-relaxed font-semibold">{importStatus.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Warning disclaimer panel for active valid restoring operations */}
                  {importStatus.status === 'valid' && backupFileToImport && (
                    <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 p-4 rounded-xl space-y-2.5 animate-pulse-slow">
                      <p className="text-[11px] font-black text-rose-700 dark:text-rose-400 leading-relaxed flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>{lang === 'km' ? '⚠️ ប្រុងប្រយ័ត្នខ្ពស់៖ រាល់ទិន្នន័យបច្ចុប្បន្ននឹងត្រូវលុបជំនួស!' : '⚠️ Critical High-Danger Reset Warning'}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {lang === 'km' 
                          ? 'សកម្មភាពសង្គ្រោះនេះ នឹងធ្វើការលុបសម្អាត និងសរសេរជាន់លើរាល់ទិន្នន័យផលិតផល ស្លាកលក់ ស្ថិតិហិរញ្ញវត្ថុ និងប្រវត្តិសកម្មភាពបច្ចុប្បន្នទាំងស្រុងនៅក្នុង database Firestore។' 
                          : 'Restoring this backup package overwrites all live transactions, clock entries and stock margins. Please authorize fully.'
                        }
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  onClick={() => {
                    setIsBackupModalOpen(false);
                    setImportStatus({ status: 'idle', message: '' });
                    setBackupFileToImport(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-[11px] cursor-pointer transition-colors"
                >
                  {lang === 'km' ? 'បិទចោល' : 'Close Console'}
                </button>
                {importStatus.status === 'valid' && backupFileToImport && (
                  <button
                    onClick={handleRestoreDatabase}
                    className="px-4 py-2 bg-teal-650 hover:bg-teal-705 text-white rounded-xl font-black text-[11px] cursor-pointer shadow-md shadow-teal-200/25 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>{lang === 'km' ? 'យល់ព្រមសង្គ្រោះ (Begin Complete Restore)' : 'Authorize & Rewrite Database'}</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
