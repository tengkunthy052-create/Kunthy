import React, { useState, useEffect } from 'react';
import { Product, Sale, Role, Expense, MonthlyClosing } from '../types';
import { translations, Language } from '../translations';
import { ShoppingCart, Plus, Calendar, User, Trash2, HelpCircle, Shield, AlertTriangle, Printer, FileText, X, Check, Percent, Download, ChevronDown, TrendingUp, BarChart3, Inbox, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, CalendarCheck, HelpCircle as HelpIcon, Lock, Coins } from 'lucide-react';
import PaymentStatusDashboard from './PaymentStatusDashboard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface SalesManagerProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  currentRole: Role;
  currentUser: string;
  onAddSale: (sale: { 
    productId: string; 
    quantity: number;
    customSellingPrice?: number;
    discountAmount?: number;
    discountPercent?: number; 
    color?: string;
    saleChannel?: 'Shop' | 'Online';
    paymentMethod?: 'Cash' | 'ABA' | 'ACLEDA';
    receivedAmount?: number;
    changeAmount?: number;
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
  }) => void;
  onDeleteSale: (id: string) => void;
  onUpdateSaleStatus: (saleId: string, newStatus: 'Paid' | 'Unpaid' | 'COD') => void;
  lang: Language;
  onClearSales?: (clearType: 'all' | 'previous_months') => void;
  monthlyClosings?: MonthlyClosing[];
  onSaveMonthlyClosing?: (closingData: {
    monthYear: string;
    totalSales: number;
    totalCost: number;
    totalExpenses: number;
    netProfit: number;
    totalStockCapital: number;
    notes: string;
  }) => void;
  exchangeRate?: number;
}

export default function SalesManager({
  sales,
  products,
  expenses,
  currentRole,
  currentUser,
  onAddSale,
  onDeleteSale,
  onUpdateSaleStatus,
  lang,
  onClearSales,
  monthlyClosings = [],
  onSaveMonthlyClosing,
  exchangeRate = 4100,
}: SalesManagerProps) {
  const t = translations[lang];
  const hasFullOwnerAccess = true;

  // Calculate trailing 7 days data for Recharts Line/Area Chart
  const getLast7DaysData = () => {
    const data = [];
    const now = new Date();
    // trailing 7 calendar days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`; // "YYYY-MM-DD"
      
      const displayDate = d.toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });

      // Filter sales on this calendar day in local time
      const daySales = sales.filter((s) => {
        try {
          const saleDateStr = new Date(s.date).toISOString().split('T')[0];
          return saleDateStr === dateKey;
        } catch {
          return s.date.startsWith(dateKey);
        }
      });

      const productSales = daySales.filter((s) => !s.isService && (!s.paymentStatus || s.paymentStatus === 'Paid')).reduce((sum, s) => sum + s.totalSelling, 0);
      const serviceSales = daySales.filter((s) => s.isService && (!s.paymentStatus || s.paymentStatus === 'Paid')).reduce((sum, s) => sum + s.totalSelling, 0);
      const totalRevenue = productSales + serviceSales;
      const totalCost = daySales.filter((s) => !s.paymentStatus || s.paymentStatus === 'Paid').reduce((sum, s) => sum + s.totalCost, 0);
      const profit = totalRevenue - totalCost;
      const quantitySold = daySales.filter((s) => !s.paymentStatus || s.paymentStatus === 'Paid').reduce((sum, s) => sum + s.quantity, 0);

      data.push({
        name: displayDate,
        [lang === 'km' ? 'លក់នាឡិកា' : 'Watch Sales']: Number(productSales.toFixed(2)),
        [lang === 'km' ? 'ជួសជុល/សេវាកម្ម' : 'Repairs & Services']: Number(serviceSales.toFixed(2)),
        [lang === 'km' ? 'ចំណូលសរុប' : 'Total Revenue']: Number(totalRevenue.toFixed(2)),
        [lang === 'km' ? 'ចំណេញ' : 'Net Profit']: Number(profit.toFixed(2)),
        [lang === 'km' ? 'បរិមាណលក់' : 'Units Sold']: quantitySold,
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  // Monthly financial calculation for the Dashboard
  const getMonthlyFinancials = () => {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth(); // 0-11

    const prevMonthDate = new Date(curYear, curMonth - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    // 1. Current Month Sales & Expenses
    const curMonthSalesList = sales.filter((s) => {
      try {
        const d = new Date(s.date);
        const isPaid = !s.paymentStatus || s.paymentStatus === 'Paid';
        return d.getFullYear() === curYear && d.getMonth() === curMonth && isPaid;
      } catch {
        return false;
      }
    });
    const curMonthSalesTotal = curMonthSalesList.reduce((sum, s) => sum + s.totalSelling, 0);

    const curMonthExpensesList = (expenses || []).filter((e) => {
      try {
        const d = new Date(e.date);
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      } catch {
        return false;
      }
    });
    const curMonthExpensesTotal = curMonthExpensesList.reduce((sum, e) => sum + e.amount, 0);
    const curMonthNetProfit = curMonthSalesTotal - curMonthExpensesTotal;

    // 2. Previous Month Sales & Expenses
    const prevMonthSalesList = sales.filter((s) => {
      try {
        const d = new Date(s.date);
        const isPaid = !s.paymentStatus || s.paymentStatus === 'Paid';
        return d.getFullYear() === prevYear && d.getMonth() === prevMonth && isPaid;
      } catch {
        return false;
      }
    });
    const prevMonthSalesTotal = prevMonthSalesList.reduce((sum, s) => sum + s.totalSelling, 0);

    const prevMonthExpensesList = (expenses || []).filter((e) => {
      try {
        const d = new Date(e.date);
        return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
      } catch {
        return false;
      }
    });
    const prevMonthExpensesTotal = prevMonthExpensesList.reduce((sum, e) => sum + e.amount, 0);
    const prevMonthNetProfit = prevMonthSalesTotal - prevMonthExpensesTotal;

    // 3. Trend Calculations
    let trendPercent = 0;
    let trendDir: 'up' | 'down' | 'flat' = 'flat';

    if (prevMonthNetProfit !== 0) {
      trendPercent = ((curMonthNetProfit - prevMonthNetProfit) / Math.abs(prevMonthNetProfit)) * 100;
      trendDir = trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'flat';
    } else if (curMonthNetProfit !== 0) {
      trendPercent = 100;
      trendDir = curMonthNetProfit > 0 ? 'up' : 'down';
    }

    // Month Names
    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesKm = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    
    const curMonthName = lang === 'km' ? monthNamesKm[curMonth] : monthNamesEn[curMonth];
    const prevMonthName = lang === 'km' ? monthNamesKm[prevMonth] : monthNamesEn[prevMonth];

    const curMonthCashSales = curMonthSalesList
      .filter((s) => !s.paymentMethod || s.paymentMethod === 'Cash')
      .reduce((sum, s) => sum + s.totalSelling, 0);

    const curMonthABASales = curMonthSalesList
      .filter((s) => s.paymentMethod === 'ABA')
      .reduce((sum, s) => sum + s.totalSelling, 0);

    const curMonthAcledaSales = curMonthSalesList
      .filter((s) => s.paymentMethod === 'ACLEDA')
      .reduce((sum, s) => sum + s.totalSelling, 0);

    // Calculate product sales vs service/repair sales
    const curMonthProductSalesList = curMonthSalesList.filter((s) => !s.isService);
    const curMonthServiceSalesList = curMonthSalesList.filter((s) => s.isService);

    const productUnitsSold = curMonthProductSalesList.reduce((sum, s) => sum + s.quantity, 0);
    const serviceUnitsDone = curMonthServiceSalesList.reduce((sum, s) => sum + s.quantity, 0);

    const productSalesRevenue = curMonthProductSalesList.reduce((sum, s) => sum + s.totalSelling, 0);
    const serviceSalesRevenue = curMonthServiceSalesList.reduce((sum, s) => sum + s.totalSelling, 0);

    return {
      curMonthName,
      prevMonthName,
      sales: curMonthSalesTotal,
      productUnitsSold,
      serviceUnitsDone,
      productSalesRevenue,
      serviceSalesRevenue,
      expenses: curMonthExpensesTotal,
      netProfit: curMonthNetProfit,
      prevNetProfit: prevMonthNetProfit,
      trendPercent: Math.abs(trendPercent),
      trendDir,
      cashSales: curMonthCashSales,
      abaSales: curMonthABASales,
      acledaSales: curMonthAcledaSales,
    };
  };

  const monthlyFinancials = getMonthlyFinancials();

  const lowStockProducts = products
    .filter((p) => p.stock <= 5)
    .sort((a, b) => a.stock - b.stock);

  // Calculate Brand Capital Investment distribution (Cost Price * stock)
  const getBrandInvestmentData = () => {
    const brandMap: { [key: string]: number } = {};

    products.forEach((p) => {
      const nameLower = p.name.toLowerCase();
      let brand = '';
      if (nameLower.includes('seiko')) brand = 'Seiko';
      else if (nameLower.includes('casio') || nameLower.includes('g-shock')) brand = 'Casio';
      else if (nameLower.includes('garmin')) brand = 'Garmin';
      else if (nameLower.includes('apple')) brand = 'Apple';
      else if (nameLower.includes('citizen')) brand = 'Citizen';
      else if (nameLower.includes('rolex')) brand = 'Rolex';
      else if (nameLower.includes('tissot')) brand = 'Tissot';
      else if (nameLower.includes('fossil')) brand = 'Fossil';
      else if (nameLower.includes('samsung')) brand = 'Samsung';
      else {
        // Find if any word is pure latin characters (english names)
        const words = p.name.trim().split(/\s+/);
        const englishWord = words.find((w) => /^[A-Za-z]+$/.test(w) && w.length >= 3);
        if (englishWord) {
          brand = englishWord.charAt(0).toUpperCase() + englishWord.slice(1).toLowerCase();
        } else {
          brand = lang === 'km' ? 'ម៉ាកផ្សេងៗ' : 'Others';
        }
      }

      const costValue = p.purchasePrice * p.stock;
      if (costValue > 0) {
        brandMap[brand] = (brandMap[brand] || 0) + costValue;
      }
    });

    const data = Object.keys(brandMap).map((brand) => ({
      name: brand,
      value: Number(brandMap[brand].toFixed(2)),
    }));

    // Sort descending by value
    return data.sort((a, b) => b.value - a.value);
  };

  const brandInvestmentData = getBrandInvestmentData();
  const totalBrandInvestment = brandInvestmentData.reduce((sum, item) => sum + item.value, 0);

  const BRAND_COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber/Gold
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#14b8a6', // Teal
    '#f43f5e', // Rose
    '#06b6d4', // Cyan
    '#a855f7', // Purple
  ];

  const [salesSubTab, setSalesSubTab] = useState<'ledger' | 'payments'>('ledger');
  const [showForm, setShowForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredProducts = React.useMemo(() => {
    if (!productSearchTerm.trim()) return products;
    const term = productSearchTerm.toLowerCase();
    return products.filter((p) => 
      p.name.toLowerCase().includes(term) || 
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.color && p.color.toLowerCase().includes(term))
    );
  }, [products, productSearchTerm]);

  // Discount and discretionary selling price states
  const [customSellingPrice, setCustomSellingPrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [saleColor, setSaleColor] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'Shop' | 'Online'>('Shop');
  const [shippingLocation, setShippingLocation] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'COD'>('Paid');
  const [deliveryCompany, setDeliveryCompany] = useState<string>('J&T Express');

  // Invoice generator state
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [previewQrCode, setPreviewQrCode] = useState<string | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Monthly closing states
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [showClosingHistory, setShowClosingHistory] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');

  // Selected product detail
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Service tracking states
  const [isService, setIsService] = useState(false);
  const [serviceType, setServiceType] = useState<'Battery' | 'Strap' | 'Repair'>('Battery');
  const [serviceNote, setServiceNote] = useState('');
  const [servicePrice, setServicePrice] = useState<number>(0);
  
  // Payment tracking states
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'ABA' | 'ACLEDA' | 'Mixed'>('Cash');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  // Mixed Payment components state
  const [mixedBankAmount, setMixedBankAmount] = useState<number>(0);
  const [mixedCashUsdAmount, setMixedCashUsdAmount] = useState<number>(0);
  const [mixedCashRielAmount, setMixedCashRielAmount] = useState<number>(0);

  // Customer details & Warranty
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>('No Warranty');

  // POS Scanner Simulation
  const [isPOSScanning, setIsPOSScanning] = useState<boolean>(false);
  const [posScannerInput, setPosScannerInput] = useState<string>('');

  // Sales Log Table filter state
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Paid' | 'Unpaid' | 'COD'>('all');

  // QR Payment Code state (link or Base64 Image)
  const [qrPaymentUrl, setQrPaymentUrl] = useState<string>('');

  // Synchronize receivedAmount for mixed payment
  useEffect(() => {
    if (paymentMethod === 'Mixed') {
      const rielToUsd = mixedCashRielAmount / (exchangeRate || 4100);
      const totalPaid = mixedBankAmount + mixedCashUsdAmount + rielToUsd;
      setReceivedAmount(parseFloat(totalPaid.toFixed(2)));
    }
  }, [paymentMethod, mixedBankAmount, mixedCashUsdAmount, mixedCashRielAmount, exchangeRate]);

  // Compute total selling price dynamically
  const totalSellingPrice = React.useMemo(() => {
    if (isService) {
      const base = servicePrice || 0;
      const discount = discountAmount || 0;
      return Math.max(0, (base - discount) * quantity);
    } else {
      return Math.max(0, customSellingPrice * quantity);
    }
  }, [isService, servicePrice, customSellingPrice, quantity, discountAmount]);

  // Compute change amount dynamically
  const changeAmount = React.useMemo(() => {
    if (!receivedAmount || receivedAmount < totalSellingPrice) return 0;
    return parseFloat((receivedAmount - totalSellingPrice).toFixed(2));
  }, [receivedAmount, totalSellingPrice]);

  // Reset / initialize values when selected product changes
  useEffect(() => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      setCustomSellingPrice(prod.sellingPrice);
      setDiscountPercent(0);
      setDiscountAmount(0);
      const firstColor = prod.color
        ? prod.color.split(/[,/;|]+/).map(c => c.trim()).filter(Boolean)[0] || ''
        : '';
      setSaleColor(firstColor);
    } else {
      setCustomSellingPrice(0);
      setDiscountPercent(0);
      setDiscountAmount(0);
      setSaleColor('');
    }
  }, [selectedProductId, products]);

  // Reset states when service toggle is clicked
  useEffect(() => {
    if (isService) {
      setSelectedProductId('');
      setCustomSellingPrice(0);
      setDiscountPercent(0);
      setDiscountAmount(0);
      setSaleColor('');
      setServicePrice(0);
      setServiceNote('');
    } else {
      setServiceNote('');
      setServicePrice(0);
    }
  }, [isService]);

  // Adjustments linked in real-time
  const handleDiscountPercentChange = (val: number) => {
    const originalPrice = isService ? servicePrice : (selectedProduct ? selectedProduct.sellingPrice : 0);
    if (originalPrice === 0) return;
    const pct = Math.max(0, Math.min(100, val));
    const amount = originalPrice * (pct / 100);
    const customPrice = originalPrice - amount;
    
    setDiscountPercent(val);
    setDiscountAmount(parseFloat(amount.toFixed(2)));
    if (!isService) {
      setCustomSellingPrice(parseFloat(customPrice.toFixed(2)));
    }
  };

  const handleDiscountAmountChange = (val: number) => {
    const originalPrice = isService ? servicePrice : (selectedProduct ? selectedProduct.sellingPrice : 0);
    if (originalPrice === 0) return;
    const amount = Math.max(0, Math.min(originalPrice, val));
    const pct = originalPrice > 0 ? (amount / originalPrice) * 100 : 0;
    const customPrice = originalPrice - amount;

    setDiscountAmount(val);
    setDiscountPercent(parseFloat(pct.toFixed(2)));
    if (!isService) {
      setCustomSellingPrice(parseFloat(customPrice.toFixed(2)));
    }
  };

  const handleCustomSellingPriceChange = (val: number) => {
    if (isService) return;
    if (!selectedProduct) return;
    const customPrice = Math.max(0, val);
    const originalPrice = selectedProduct.sellingPrice;
    
    let amount = 0;
    let pct = 0;
    if (customPrice < originalPrice) {
      amount = originalPrice - customPrice;
      pct = originalPrice > 0 ? (amount / originalPrice) * 100 : 0;
    }
    
    setCustomSellingPrice(val);
    setDiscountAmount(parseFloat(amount.toFixed(2)));
    setDiscountPercent(parseFloat(pct.toFixed(1)));
  };

  const handleScannerSubmit = () => {
    if (!posScannerInput.trim()) return;
    const found = products.find((p) => p.sku?.toUpperCase() === posScannerInput.trim().toUpperCase());
    if (found) {
      // Play simulated beep audio
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 1200; // Beep!
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.08);
      } catch (e) {
        console.log('Audio Context blocked or not supported');
      }

      setSelectedProductId(found.id);
      setQuantity(1);
      setIsPOSScanning(false);
      setPosScannerInput('');
    } else {
      alert(lang === 'km' ? `រកមិនឃើញទំនិញដែលមាន SKU: ${posScannerInput}` : `Product not found for SKU: ${posScannerInput}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isService) {
      if (servicePrice <= 0 || quantity <= 0) {
        setErrorMsg(lang === 'km' ? 'សូមបញ្ចូលតម្លៃសេវាកម្មឱ្យបានត្រឹមត្រូវ!' : 'Please enter a valid service price and quantity.');
        return;
      }

      onAddSale({
        productId: `service-${serviceType.toLowerCase()}`,
        quantity,
        customSellingPrice: Math.max(0, servicePrice - (discountAmount || 0)),
        discountAmount,
        discountPercent,
        color: saleColor || undefined,
        saleChannel: selectedChannel,
        receivedAmount,
        changeAmount,
        paymentMethod,
        mixedBankAmount: paymentMethod === 'Mixed' ? mixedBankAmount : undefined,
        mixedCashUsdAmount: paymentMethod === 'Mixed' ? mixedCashUsdAmount : undefined,
        mixedCashRielAmount: paymentMethod === 'Mixed' ? mixedCashRielAmount : undefined,
        isService: true,
        serviceType,
        serviceNote,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        warrantyPeriod: warrantyPeriod !== 'No Warranty' ? warrantyPeriod : undefined,
        shippingLocation: selectedChannel === 'Online' ? (shippingLocation.trim() || undefined) : undefined,
        paymentStatus: selectedChannel === 'Online' ? paymentStatus : 'Paid',
        deliveryCompany: selectedChannel === 'Online' ? deliveryCompany : undefined,
      } as any);
    } else {
      if (!selectedProductId || quantity <= 0) return;

      if (!selectedProduct) {
        setErrorMsg('រកមិនឃើញផលិតផលនេះទេ (Invalid Product)');
        return;
      }

      if (selectedProduct.stock < quantity) {
        setErrorMsg(`ស្តុកមិនគ្រប់គ្រាន់ទេ! សល់តែ ${selectedProduct.stock} ទៀតប៉ុណ្ណោះ (Insufficient Stock)`);
        return;
      }

      // If the product has color-specific stocks managed, validate the chosen color stock specifically
      if (selectedProduct.colorStocks && Object.keys(selectedProduct.colorStocks).length > 0) {
        if (!saleColor) {
          setErrorMsg(lang === 'km' ? 'សូមជ្រើសរើសពណ៌សម្រាប់លក់!' : 'Please select a color to sell!');
          return;
        }
        const availableColStock = selectedProduct.colorStocks[saleColor] || 0;
        if (availableColStock < quantity) {
          setErrorMsg(lang === 'km' 
            ? `ស្តុកពណ៌ "${saleColor}" មិនគ្រប់គ្រាន់ទេ! សល់តែ ${availableColStock} គ្រឿងប៉ុណ្ណោះ` 
            : `Insufficient stock for color "${saleColor}"! Only ${availableColStock} left.`);
          return;
        }
      }

      onAddSale({
        productId: selectedProductId,
        quantity,
        customSellingPrice,
        discountAmount,
        discountPercent,
        color: saleColor,
        saleChannel: selectedChannel,
        receivedAmount,
        changeAmount,
        paymentMethod,
        mixedBankAmount: paymentMethod === 'Mixed' ? mixedBankAmount : undefined,
        mixedCashUsdAmount: paymentMethod === 'Mixed' ? mixedCashUsdAmount : undefined,
        mixedCashRielAmount: paymentMethod === 'Mixed' ? mixedCashRielAmount : undefined,
        isService: false,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        warrantyPeriod: warrantyPeriod !== 'No Warranty' ? warrantyPeriod : undefined,
        shippingLocation: selectedChannel === 'Online' ? (shippingLocation.trim() || undefined) : undefined,
        paymentStatus: selectedChannel === 'Online' ? paymentStatus : 'Paid',
        deliveryCompany: selectedChannel === 'Online' ? deliveryCompany : undefined,
        qrPaymentUrl: qrPaymentUrl.trim() || undefined,
      } as any);
    }

    // Reset Form
    setSelectedProductId('');
    setProductSearchTerm('');
    setQuantity(1);
    setErrorMsg('');
    setShowForm(false);
    setIsService(false);
    setServiceNote('');
    setServicePrice(0);
    setPaymentMethod('Cash');
    setReceivedAmount(0);
    setCustomerName('');
    setCustomerPhone('');
    setWarrantyPeriod('No Warranty');
    setMixedBankAmount(0);
    setMixedCashUsdAmount(0);
    setMixedCashRielAmount(0);
    setQrPaymentUrl('');
  };

  const handleExportSalesCSV = (days: number) => {
    const cutOff = new Date();
    cutOff.setDate(cutOff.getDate() - days);

    const filteredSales = sales.filter((s) => {
      return new Date(s.date) >= cutOff;
    });

    const headers = [
      lang === 'km' ? 'កាលបរិច្ឆេទ (Date)' : 'Date',
      lang === 'km' ? 'លេខកូដវិក្កយបត្រ (Invoice No)' : 'Invoice No',
      lang === 'km' ? 'ឈ្មោះផលិតផល (Product Name)' : 'Product Name',
      lang === 'km' ? 'ប្រភពលក់ (Channel)' : 'Channel',
      lang === 'km' ? 'បរិមាណលក់ (Quantity)' : 'Quantity',
      lang === 'km' ? 'តម្លៃលក់រាយ/ឯកតា (Price per Unit)' : 'Price per Unit (USD)',
      lang === 'km' ? 'ទឹកប្រាក់លក់បាន (Total Price)' : 'Total Revenue (USD)',
      ...(hasFullOwnerAccess 
        ? [
            lang === 'km' ? 'ថ្លៃដើមសរុប (Total Cost)' : 'Total Cost (USD)',
            lang === 'km' ? 'ប្រាក់ចំណេញសុទ្ធ (Net Profit)' : 'Net Profit (USD)'
          ] 
        : []
      ),
      lang === 'km' ? 'អ្នកលក់ប្រចាំការ (Recorded By)' : 'Recorded By'
    ];

    const rows = filteredSales.map((s) => {
      const profit = s.totalSelling - s.totalCost;
      const channelLabel = s.saleChannel === 'Online' 
        ? (lang === 'km' ? 'លក់ Online' : 'Online') 
        : (lang === 'km' ? 'លក់នៅហាង' : 'Shop');
      return [
        new Date(s.date).toLocaleString(lang === 'km' ? 'km-KH' : 'en-US'),
        `#INV-${s.id.slice(-6).toUpperCase()}`,
        s.productName,
        channelLabel,
        s.quantity.toString(),
        `$${s.sellingPrice.toFixed(2)}`,
        `$${s.totalSelling.toFixed(2)}`,
        ...(hasFullOwnerAccess
          ? [
              `$${s.totalCost.toFixed(2)}`,
              `$${profit.toFixed(2)}`
            ]
          : []
        ),
        s.handledBy
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    let durationLabel = `${days}__Days`;
    if (days >= 365) durationLabel = "1_Year";
    
    link.setAttribute('download', `Sales_Report_${durationLabel}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  // Save as PDF helper using html2pdf.js
  const handleSaveInvoicePDF = (sale: Sale) => {
    const element = document.getElementById('print-invoice-area-retail');
    if (!element) return;

    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `Invoice_${sale.id.slice(-6).toUpperCase()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().from(element).set(opt).save();
  };

  const handleSaveReportPDF = () => {
    const element = document.getElementById('print-invoice-area-report');
    if (!element) return;

    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `Daily_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 relative animate-fade-in">

      {/* Sub-tab Selection */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 mb-6">
        <button
          type="button"
          onClick={() => setSalesSubTab('ledger')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            salesSubTab === 'ledger'
              ? 'bg-white text-emerald-600 shadow-2xs font-extrabold border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'សៀវភៅលក់ & ចេញវិក្កយបត្រ (Sales Ledger & POS)' : 'Sales Ledger & POS'}</span>
        </button>
        <button
          type="button"
          onClick={() => setSalesSubTab('payments')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            salesSubTab === 'payments'
              ? 'bg-white text-indigo-600 shadow-2xs font-extrabold border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'ស្ថានភាពទូទាត់ប្រាក់ (Payment Settle Status)' : 'Payment Status Dashboard'}</span>
        </button>
      </div>

      {salesSubTab === 'payments' ? (
        <div className="animate-fade-in">
          <PaymentStatusDashboard 
            sales={sales}
            currentRole={currentRole}
            currentUser={currentUser}
            onUpdateSaleStatus={onUpdateSaleStatus}
            lang={lang}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            {t.salesTitle}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {t.salesDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto relative">
          
          {/* Dropdown for Sales CSV Export options */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              {lang === 'km' ? 'ទាញរបាយការណ៍លក់ CSV' : 'Export Sales CSV'}
              <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
            </button>
            
            {showExportDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 font-sans divide-y divide-slate-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {lang === 'km' ? 'រយៈពេលរបាយការណ៍លក់' : 'Sales Time Period'}
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => handleExportSalesCSV(15)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>{lang === 'km' ? '📅 របាយការណ៍លក់ ១៥ ថ្ងៃ' : '📅 15 Days Sales'}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 rounded px-1.5 py-0.5 font-bold font-mono">15d</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSalesCSV(30)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>{lang === 'km' ? '📅 របាយការណ៍លក់ ៣០ ថ្ងៃ' : '📅 30 Days Sales'}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 rounded px-1.5 py-0.5 font-bold font-mono">30d</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSalesCSV(365)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>{lang === 'km' ? '📅 របាយការណ៍លក់ ១ ឆ្នាំ' : '📅 1 Year Sales'}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 rounded px-1.5 py-0.5 font-bold font-mono">1y</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {onClearSales && (
            <button
              type="button"
              onClick={() => {
                if (currentRole !== 'Owner') {
                  alert(lang === 'km' 
                    ? '🔒 សិទ្ធិម្ចាស់ហាង (Owner) ទើបអាចសម្អាតទិន្នន័យលក់បាន!' 
                    : '🔒 Only Owners are permitted to clear sales history.');
                  return;
                }
                const choice = confirm(lang === 'km'
                  ? '🧹 តើអ្នកចង់សម្អាតទិន្នន័យលក់ចាស់ៗមែនទេ?\n\n- ចុច "យល់ព្រម (OK)" ដើម្បីលុបទិន្នន័យលក់ "ខែមុនៗ" (រក្សាទុកខែថ្មីនេះ)\n- ចុច "បោះបង់ (Cancel)" ដើម្បីរក្សាទុកដដែល'
                  : '🧹 Would you like to clear previous sales records?\n\n- Click "OK" to wipe sales from "previous months" and keep the current month.\n- Click "Cancel" to abort.');
                
                if (choice) {
                  onClearSales('previous_months');
                  alert(lang === 'km' ? '✨ បានសម្អាតទិន្នន័យលក់ខែមុនៗរួចរាល់!' : '✨ Previous months sales cleared successfully.');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
              title={lang === 'km' ? 'សម្អាតទិន្នន័យលក់ចាស់ៗ' : 'Clear old sales history'}
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              {lang === 'km' ? 'សម្អាតទិន្នន័យចាស់' : 'Clear Old Sales'}
            </button>
          )}

          {onSaveMonthlyClosing && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setShowClosingModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-600" />
                {lang === 'km' ? 'បិទបញ្ជីចុងខែ' : 'Monthly Closing'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowClosingHistory(!showClosingHistory)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-slate-500" />
                {lang === 'km' ? 'ប្រវត្តិកាលបិទបញ្ជី' : 'Closing Log'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowReportPreview(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            {lang === 'km' ? 'សេចក្តីសង្ខេប (Daily PDF)' : 'Daily Summary PDF'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setErrorMsg('');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showForm ? t.closeFormBtn : t.newSaleBtn}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2 flex justify-between items-center">
            <span>បញ្ចូលវិក្កយបត្រលក់ថ្មី (Register Sales Receipt)</span>
            {isService && <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Mode: Service</span>}
          </h4>

          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-md text-rose-600 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Register product sale fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">{lang === 'km' ? 'ស្វែងរក និងជ្រើសរើសទំនិញ (Search & Select Product) *' : 'Search & Select Product *'}</label>
                <button
                  type="button"
                  onClick={() => setIsPOSScanning(true)}
                  className="flex items-center gap-1 text-[10.5px] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-md cursor-pointer transition-colors font-bold"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M12 7v10m-3-10v10m6-10v10" />
                  </svg>
                  <span>{lang === 'km' ? 'ស្កេនបាកូដ' : 'Scan Code'}</span>
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder={lang === 'km' ? 'វាយឈ្មោះ, ពណ៌ ឬម៉ូដែលដើម្បីស្វែងរក...' : 'Type name, color or model to search...'}
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded pl-7 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  {productSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setProductSearchTerm('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="">
                    {lang === 'km' 
                      ? `-- ជ្រើសរើសផលិតផល (${filteredProducts.length} ក្នុងបញ្ជី) --` 
                      : `-- Select Product (${filteredProducts.length} filtered) --`}
                  </option>
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} (សល់ {p.stock} | តម្លៃ ${p.sellingPrice}) {p.stock <= 0 ? ' - អស់ពីស្តុក' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">បរិមាណលក់ (Quantity) *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(parseInt(e.target.value) || 0);
                      setErrorMsg('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  
                  {/* Max Quick Button */}
                  {selectedProduct && (
                    <button
                      type="button"
                      onClick={() => setQuantity(selectedProduct.stock)}
                      className="px-3 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      យកទាំងអស់ ({selectedProduct.stock})
                    </button>
                  )}
                </div>
              </div>
            </div>

          {((!isService && selectedProduct) || (isService && servicePrice > 0)) && (
            <div className="mt-4 space-y-3">
              {/* Discounts & Custom Actual Price block */}
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg space-y-3">
                <h5 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  {lang === 'km' ? 'ការបញ្ចុះតម្លៃ និង កែសម្រួលតម្លៃលក់ជាក់ស្តែង (Discounts & Custom Price)' : 'Discounts & Actual Price Override'}
                </h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Discount Percentage (%) */}
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      {lang === 'km' ? 'បញ្ចុះតម្លៃ % (Discount %)' : 'Discount (%)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={discountPercent || ''}
                        onChange={(e) => handleDiscountPercentChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded pl-3 pr-7 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                      <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 font-mono">%</span>
                    </div>
                  </div>

                  {/* 2. Discount Amount ($) */}
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      {lang === 'km' ? 'បញ្ចុះតម្លៃជាដុល្លារ (Discount $)' : 'Discount ($ / Unit)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400 font-mono">$</span>
                      <input
                        type="number"
                        min="0"
                        max={isService ? servicePrice : (selectedProduct ? selectedProduct.sellingPrice : 0)}
                        step="any"
                        value={discountAmount || ''}
                        onChange={(e) => handleDiscountAmountChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded pl-7 pr-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* 3. Custom Selling Price ($) - Only for physical products */}
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      {lang === 'km' ? 'តម្លៃលក់ជាក់ស្តែង (Actual Price)' : 'Actual Custom Price ($)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[10px] font-bold text-indigo-500 font-mono">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        disabled={isService}
                        value={isService ? (servicePrice - discountAmount) : (customSellingPrice || '')}
                        onChange={(e) => handleCustomSellingPriceChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-indigo-200 ring-4 ring-indigo-500/10 rounded pl-7 pr-3 py-1.5 text-xs text-indigo-700 font-bold font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-75"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Color Selection for the Sale (Optional for services) */}
              {!isService && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-2.5 animate-fade-in animate-duration-300">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === 'km' ? 'ជ្រើសរើសពណ៌សម្រាប់លក់ (Select Color to Sell)' : 'Select Color to Sell'}
                  </label>
                  
                  {selectedProduct && selectedProduct.color && selectedProduct.color.trim() ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.color.split(/[,/;|]+/).map(c => c.trim()).filter(Boolean).map((colorOpt) => {
                        const isActive = saleColor.toLowerCase() === colorOpt.toLowerCase();
                        
                        // Check color-specific stock level if defined
                        const colStock = selectedProduct.colorStocks?.[colorOpt] !== undefined
                          ? selectedProduct.colorStocks[colorOpt]
                          : undefined;
                        
                        const isColOutOfStock = colStock !== undefined && colStock <= 0;

                        return (
                          <button
                            key={colorOpt}
                            type="button"
                            disabled={isColOutOfStock}
                            onClick={() => setSaleColor(colorOpt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-102'
                                : isColOutOfStock
                                ? 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed opacity-55'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>🎨 {colorOpt}</span>
                            {colStock !== undefined && (
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isActive 
                                  ? 'bg-indigo-500 text-white' 
                                  : isColOutOfStock 
                                  ? 'bg-rose-50 text-rose-500' 
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {isColOutOfStock ? (lang === 'km' ? 'អស់' : '0') : colStock}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10.5px] text-slate-500 italic">
                      {lang === 'km' ? 'ផលិតផលនេះគ្មានជម្រើសពណ៌ក្នុងស្តុកទេ' : 'No color options defined in catalog for this product'}
                    </p>
                  )}

                  <div className="pt-2 border-t border-indigo-100/60">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      {lang === 'km' ? 'ឬកំណត់ពណ៌ផ្សេងដោយខ្លួនឯង (Or type custom color)' : 'Or specify manually'}
                    </label>
                    <input
                      type="text"
                      value={saleColor}
                      onChange={(e) => setSaleColor(e.target.value)}
                      placeholder={lang === 'km' ? 'ឧ. ខ្មៅ, ស, ទឹកមាស...' : 'e.g. Black, White, Rose Gold'}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Customer Details & Warranty Info Card */}
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg space-y-3">
                <h5 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  {lang === 'km' ? 'ព័ត៌មានអតិថិជន និងការធានា (Customer Details & Warranty)' : 'Customer Info & Warranty (Optional)'}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      {lang === 'km' ? 'ឈ្មោះអតិថិជន' : 'Customer Name'}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={lang === 'km' ? 'ឧ. គឹម សុខា' : 'e.g. Kim Sokha'}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 012 345 678"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      {lang === 'km' ? 'រយៈពេលធានា' : 'Warranty'}
                    </label>
                    <select
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="No Warranty">{lang === 'km' ? 'គ្មានការធានា' : 'No Warranty'}</option>
                      <option value="3 Months">{lang === 'km' ? '៣ ខែ (3 Months)' : '3 Months'}</option>
                      <option value="6 Months">{lang === 'km' ? '៦ ខែ (6 Months)' : '6 Months'}</option>
                      <option value="12 Months">{lang === 'km' ? '១ ឆ្នាំ (1 Year)' : '1 Year'}</option>
                      <option value="24 Months">{lang === 'km' ? '២ ឆ្នាំ (2 Years)' : '2 Years'}</option>
                    </select>
                  </div>
                </div>

                {/* Shipping Destination, Courier & Payment Status (Shown beautifully) */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                        📍 {lang === 'km' ? 'ទីតាំងទទួល/ដឹកជញ្ជូន (Delivery Destination)' : 'Delivery Destination'}
                      </label>
                      <input
                        type="text"
                        value={shippingLocation}
                        onChange={(e) => setShippingLocation(e.target.value)}
                        placeholder={lang === 'km' ? 'វាយបញ្ចូលទីតាំង (ឧ. សែនសុខ, ខេត្តសៀមរាប...)' : 'Type destination (e.g. Siem Reap...)'}
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                        📦 {lang === 'km' ? 'ក្រុមហ៊ុនដឹកជញ្ជូន (Courier / Delivery)' : 'Courier / Delivery Partner'}
                      </label>
                      <select
                        value={deliveryCompany}
                        onChange={(e) => setDeliveryCompany(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="J&T Express">J&T Express Cambodia</option>
                        <option value="Vireak Buntham (VET)">Vireak Buntham (VET Express)</option>
                        <option value="Capitol Express">Capitol Express</option>
                        <option value="Larryta Express">Larryta Express</option>
                        <option value="Cambo Express (CEX)">Cambo Express (CEX)</option>
                        <option value="Grab Express">Grab Express</option>
                        <option value="NHAM24 / foodpanda">NHAM24 / foodpanda Delivery</option>
                        <option value="Other / ផ្សេងៗ">{lang === 'km' ? 'ផ្សេងៗ / ក្រុមហ៊ុនផ្សេង' : 'Other Courier'}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      🚚 {lang === 'km' ? 'ស្ថានភាពទូទាត់ប្រាក់ (Payment Status)' : 'Payment Status'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentStatus('Paid')}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded border transition-all cursor-pointer ${
                          paymentStatus === 'Paid'
                            ? 'bg-emerald-600 text-white border-transparent'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {lang === 'km' ? 'បង់រួច (Paid)' : 'Paid'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentStatus('Unpaid')}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded border transition-all cursor-pointer ${
                          paymentStatus === 'Unpaid'
                            ? 'bg-rose-500 text-white border-transparent'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {lang === 'km' ? 'មិនទាន់បង់ (Unpaid)' : 'Unpaid'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentStatus('COD')}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded border transition-all cursor-pointer ${
                          paymentStatus === 'COD'
                            ? 'bg-amber-500 text-slate-950 border-transparent animate-pulse'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {lang === 'km' ? 'COD (ពេលដល់)' : 'COD'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Realtime Calc Summary Card */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">{lang === 'km' ? 'តម្លៃដើម (Original Price):' : 'Original Price:'}</span>
                  <span className="font-semibold text-slate-500 font-mono">${isService ? servicePrice.toFixed(2) : selectedProduct?.sellingPrice?.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>{lang === 'km' ? 'បានបញ្ចុះតម្លៃ/ឯកតា (Discount Applied):' : 'Discount Applied per unit:'}</span>
                    <span className="font-bold font-mono">-${discountAmount.toFixed(2)} ({discountPercent}%)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">{lang === 'km' ? 'តម្លៃលក់ជាក់ស្តែងសម្រេច (Selected Actual Price):' : 'Actual Selling Price per Unit:'}</span>
                  <span className="font-bold text-indigo-700 font-mono">${isService ? (servicePrice - discountAmount).toFixed(2) : customSellingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{lang === 'km' ? 'បរិមាណ (Quantity Selected):' : 'Quantity selected:'}</span>
                  <span className="font-mono text-slate-800 font-bold">x{quantity}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-emerald-200 text-sm">
                  <span className="font-bold text-slate-700">{lang === 'km' ? 'ប្រាក់ចំណូលសរុបគិតជាដុល្លារ (Total Sale Amount USD):' : 'Total Revenue (USD):'}</span>
                  <span className="font-mono font-extrabold text-emerald-600">${totalSellingPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method & Cash Received Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                
                {/* Payment Method Selector */}
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                    💳 {lang === 'km' ? 'វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Method) *' : 'Payment Method *'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Cash', label: '💵 លុយសុទ្ធ', desc: 'Cash' },
                      { id: 'ABA', label: '📱 ABA', desc: 'Bank Transfer' },
                      { id: 'ACLEDA', label: '📱 ACLEDA', desc: 'Bank Transfer' },
                      { id: 'Mixed', label: '🔀 លុយចម្រុះ', desc: 'Mixed / Split' }
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(pm.id as any);
                          if (pm.id === 'Cash') {
                            setReceivedAmount(totalSellingPrice);
                          } else if (pm.id === 'Mixed') {
                            setMixedBankAmount(0);
                            setMixedCashUsdAmount(0);
                            setMixedCashRielAmount(0);
                            setReceivedAmount(0);
                          } else {
                            setReceivedAmount(0);
                          }
                        }}
                        className={`p-2 rounded-lg border text-xs text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                          paymentMethod === pm.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold">{pm.label}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{pm.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Received and Change Calculator */}
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      📥 {lang === 'km' ? 'ទទួលលុយ និងគណនាប្រាក់អាប់' : 'Cash Received & Change'}
                    </label>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-250 rounded px-1.5 py-0.5 font-mono">
                      {lang === 'km' ? 'ត្រូវបង់៖' : 'Due:'} ${totalSellingPrice.toFixed(2)}
                    </span>
                  </div>

                  {paymentMethod === 'Mixed' ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          {lang === 'km' ? '📱 វេរធនាគារ (ABA / ACLEDA) - USD' : 'Bank Transfer (ABA / ACLEDA) - USD'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono font-bold">$</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={mixedBankAmount || ''}
                            onChange={(e) => setMixedBankAmount(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-300 rounded pl-7 pr-3 py-1 text-slate-800 font-bold font-mono focus:outline-none focus:border-emerald-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            {lang === 'km' ? '💵 លុយសុទ្ធ - USD' : 'Cash - USD'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono font-bold">$</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={mixedCashUsdAmount || ''}
                              onChange={(e) => setMixedCashUsdAmount(parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-300 rounded pl-7 pr-3 py-1 text-slate-800 font-bold font-mono focus:outline-none focus:border-emerald-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            {lang === 'km' ? '💵 លុយសុទ្ធ - KHR (៛)' : 'Cash - KHR (៛)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono font-bold">៛</span>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={mixedCashRielAmount || ''}
                              onChange={(e) => setMixedCashRielAmount(parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-300 rounded pl-7 pr-3 py-1 text-slate-800 font-bold font-mono focus:outline-none focus:border-emerald-500"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Display calculations for Mixed */}
                      <div className="p-2.5 bg-indigo-50 border border-indigo-150 rounded text-[11px] space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>{lang === 'km' ? 'សរុបទទួលបានជា USD (Total Paid):' : 'Total Paid (USD):'}</span>
                          <span className="font-bold font-mono text-indigo-700">${receivedAmount.toFixed(2)}</span>
                        </div>
                        {receivedAmount > 0 && (
                          <div className={`flex justify-between items-center pt-1 border-t border-indigo-100 font-bold ${receivedAmount >= totalSellingPrice ? 'text-emerald-700' : 'text-rose-600'}`}>
                            <span>{receivedAmount >= totalSellingPrice ? (lang === 'km' ? '💸 ប្រាក់អាប់ (Change):' : '💸 Change:') : (lang === 'km' ? '⚠️ នៅខ្វះ (Shortage):' : '⚠️ Shortage:')}</span>
                            <div className="text-right">
                              <span className="font-mono text-sm block">${Math.abs(receivedAmount - totalSellingPrice).toFixed(2)}</span>
                              <span className="font-mono text-[9.5px] block font-normal">៛{(Math.abs(receivedAmount - totalSellingPrice) * (exchangeRate || 4100)).toLocaleString()} ៛</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400 font-mono">$</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={receivedAmount || ''}
                          onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded pl-7 pr-3 py-1.5 text-xs text-slate-800 font-bold font-mono focus:outline-none focus:border-emerald-500"
                          placeholder="0.00"
                          disabled={paymentMethod !== 'Cash'}
                        />
                      </div>

                      {/* Quick Cash Buttons */}
                      {paymentMethod === 'Cash' && (
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => setReceivedAmount(totalSellingPrice)}
                            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 border border-emerald-250 text-emerald-800 text-[10px] font-bold rounded cursor-pointer transition-colors"
                          >
                            {lang === 'km' ? 'គ្រប់គ្រាន់' : 'Exactly'}
                          </button>
                          {[5, 10, 20, 50, 100].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setReceivedAmount(preset)}
                              className="px-2 py-1 bg-slate-250 hover:bg-slate-300 text-slate-700 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors"
                            >
                              ${preset}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Change Returned indicators */}
                      {paymentMethod === 'Cash' && receivedAmount > 0 && (
                        <div className={`p-2 rounded text-xs flex justify-between items-center transition-all ${
                          receivedAmount >= totalSellingPrice
                            ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-150 animate-fade-in'
                            : 'bg-rose-50 text-rose-800 font-medium border border-rose-150 animate-fade-in'
                        }`}>
                          <span>{receivedAmount >= totalSellingPrice ? (lang === 'km' ? '💸 ត្រូវអាប់ជូន (Change):' : '💸 Change:') : (lang === 'km' ? '⚠️ នៅខ្វះ (Shortage):' : '⚠️ Shortage:')}</span>
                          <div className="text-right">
                            <span className="font-mono font-black text-sm block">
                              ${Math.abs(changeAmount || (receivedAmount - totalSellingPrice)).toFixed(2)}
                            </span>
                            <span className="text-[9.5px] block font-mono">
                              ៛{(Math.abs(changeAmount || (receivedAmount - totalSellingPrice)) * (exchangeRate || 4100)).toLocaleString()} ៛
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* QR Code Payment (Store & Show Instantly) */}
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">📱 {lang === 'km' ? 'កូដ QR ទូទាត់ប្រាក់ (QR Payment Code)' : 'QR Payment Code'}</span>
                    <span className="text-[9px] text-slate-400 font-normal uppercase tracking-wider">{lang === 'km' ? 'ស្រេចចិត្ត' : 'Optional'}</span>
                  </label>

                  <div className="space-y-2">
                    {/* Link Input */}
                    <div>
                      <input
                        type="text"
                        value={qrPaymentUrl}
                        onChange={(e) => setQrPaymentUrl(e.target.value)}
                        placeholder={lang === 'km' ? 'បញ្ចូលតំណភ្ជាប់ QR (ឧ. ABA link) ឬរូបភាព URL' : 'Paste QR URL (e.g. ABA Pay Link) or Image URL'}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* File Upload for Image */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 rounded py-2 cursor-pointer transition-colors text-center">
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                          📤 {lang === 'km' ? 'ជ្រើសរើស ឬទាញទម្លាក់រូបភាព' : 'Choose or Drag Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setQrPaymentUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      
                      {qrPaymentUrl && (
                        <button
                          type="button"
                          onClick={() => setQrPaymentUrl('')}
                          className="px-2.5 py-2 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded transition-colors"
                        >
                          {lang === 'km' ? 'សម្អាត' : 'Clear'}
                        </button>
                      )}
                    </div>

                    {/* Instant QR Show Area */}
                    {qrPaymentUrl && (
                      <div className="mt-3 bg-white border border-slate-250 rounded-xl p-3 flex flex-col items-center justify-center shadow-2xs animate-fade-in">
                        <span className="text-[9.5px] font-bold text-indigo-600 uppercase tracking-widest mb-2 animate-pulse">
                          {lang === 'km' ? '✨ បង្ហាញអតិថិជនស្កែនទូទាត់ប្រាក់ ✨' : '✨ Show Customer to Scan & Pay ✨'}
                        </span>
                        
                        {/* Try rendering the image URL or link */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-center max-w-[160px] max-h-[160px] overflow-hidden">
                          {qrPaymentUrl.startsWith('data:image/') || qrPaymentUrl.includes('.png') || qrPaymentUrl.includes('.jpg') || qrPaymentUrl.includes('.jpeg') || qrPaymentUrl.includes('.webp') ? (
                            <img
                              src={qrPaymentUrl}
                              alt="QR Payment Code"
                              referrerPolicy="no-referrer"
                              className="max-w-full max-h-full object-contain rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = "text-center p-4 text-[10px] text-slate-400 font-mono break-all";
                                  placeholder.innerText = qrPaymentUrl;
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="text-center p-4 text-[10px] text-slate-500 font-mono break-all font-semibold">
                              🔗 {qrPaymentUrl}
                              <div className="mt-2">
                                <a
                                  href={qrPaymentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline font-bold"
                                >
                                  {lang === 'km' ? 'បើកតំណភ្ជាប់ QR' : 'Open QR Link'}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2.5 mt-5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs text-slate-500 rounded border border-slate-300 hover:bg-slate-100 focus:outline-none cursor-pointer w-full sm:w-auto text-center"
            >
              បោះបង់ (Cancel)
            </button>
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              {/* Sell in Shop Button */}
              <button
                type="submit"
                onClick={() => setSelectedChannel('Shop')}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded focus:outline-none shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {t.saleChannelShop}
              </button>
              
              {/* Sell Online Button */}
              <button
                type="submit"
                onClick={() => setSelectedChannel('Online')}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded focus:outline-none shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
              >
                <span className="text-sm">🌐</span>
                {t.saleChannelOnline}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Monthly Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Sales Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {lang === 'km' ? `លក់ចេញខែ ${monthlyFinancials.curMonthName}` : `${monthlyFinancials.curMonthName} Revenue`}
              </span>
              <div className="text-2xl font-black text-slate-800 tracking-tight font-mono">
                ${monthlyFinancials.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10.5px] text-slate-500 block">
                {lang === 'km' ? 'ប្រាក់ចំណូលសរុបប្រចាំខែនេះ' : 'Gross collections recorded this month'}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Sales & Repairs breakdown */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 space-y-1.5 text-[11px] bg-slate-100/40 p-2.5 rounded-lg border border-slate-200/50">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1">
              {lang === 'km' ? 'ព័ត៌មានលម្អិតលក់ និងជួសជុល' : 'Sales & Repairs'}
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                🛍️ {lang === 'km' ? 'លក់នាឡិកា (Watch Sales):' : 'Watch Sales:'}
              </span>
              <span className="font-mono font-bold text-slate-800">
                {monthlyFinancials.productUnitsSold} {lang === 'km' ? 'គ្រឿង' : 'pcs'} (${monthlyFinancials.productSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                🛠️ {lang === 'km' ? 'ជួសជុល/សេវា (Service):' : 'Repairs & Service:'}
              </span>
              <span className="font-mono font-bold text-slate-800">
                {monthlyFinancials.serviceUnitsDone} {lang === 'km' ? 'គ្រឿង' : 'pcs'} (${monthlyFinancials.serviceSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="mt-4 pt-3.5 border-t border-slate-200/80 space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                💵 {lang === 'km' ? 'សាច់ប្រាក់សុទ្ធប្រាកដ (Cash in Hand):' : 'Cash in Hand:'}
              </span>
              <span className="font-mono font-bold text-slate-800">${(monthlyFinancials.cashSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                📱 {lang === 'km' ? 'គណនី ABA Bank:' : 'ABA Transfer:'}
              </span>
              <span className="font-mono font-bold text-slate-800">${(monthlyFinancials.abaSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                📱 {lang === 'km' ? 'គណនី ACLEDA Bank:' : 'ACLEDA Transfer:'}
              </span>
              <span className="font-mono font-bold text-slate-800">${(monthlyFinancials.acledaSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between transition-all hover:border-slate-300">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'km' ? `ចំណាយខែ ${monthlyFinancials.curMonthName}` : `${monthlyFinancials.curMonthName} Expenses`}
            </span>
            <div className="text-2xl font-black text-slate-800 tracking-tight font-mono">
              ${monthlyFinancials.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10.5px] text-slate-500 block">
              {lang === 'km' ? 'ប្រាក់ចំណាយប្រតិបត្តិការខែនេះ' : 'Operating costs tracked this month'}
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Net Profit Card with Trend Indicator */}
        <div className={`border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 ${
          monthlyFinancials.netProfit >= 0 
            ? 'bg-gradient-to-br from-indigo-50/30 to-emerald-50/10 border-indigo-100' 
            : 'bg-gradient-to-br from-rose-50/30 to-amber-50/10 border-rose-100'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'km' ? 'ចំណេញសុទ្ធប្រចាំខែ' : 'Monthly Net Profit'}
            </span>
            
            {/* Trend Badge */}
            {monthlyFinancials.trendDir === 'up' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 border border-emerald-250 text-emerald-700">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{monthlyFinancials.trendPercent.toFixed(1)}%
              </span>
            )}
            {monthlyFinancials.trendDir === 'down' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 border border-rose-250 text-rose-700">
                <ArrowDownRight className="w-3.5 h-3.5" />
                -{monthlyFinancials.trendPercent.toFixed(1)}%
              </span>
            )}
            {monthlyFinancials.trendDir === 'flat' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-50 border border-slate-200 text-slate-600">
                0.0%
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className={`text-2xl font-black font-mono tracking-tight ${
              monthlyFinancials.netProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'
            }`}>
              ${monthlyFinancials.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10.5px] text-slate-500 block mt-1.5">
              {lang === 'km' ? (
                <span>
                  ប្រៀបធៀបខែមុន ({monthlyFinancials.prevMonthName})៖ {monthlyFinancials.prevNetProfit >= 0 ? `$${monthlyFinancials.prevNetProfit.toLocaleString()}` : `-$${Math.abs(monthlyFinancials.prevNetProfit).toLocaleString()}`}
                </span>
              ) : (
                <span>
                  vs {monthlyFinancials.prevMonthName} ({monthlyFinancials.prevNetProfit >= 0 ? 'Profit' : 'Deficit'}: ${monthlyFinancials.prevNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-2">
        {/* Trailing 7-Day Revenue Trend Chart */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {lang === 'km' ? 'និន្នាការចំណូលលក់ប្រចាំថ្ងៃ' : 'Daily Sales Performance'}
              </h4>
              <p className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                {lang === 'km' ? 'បែងចែករវាង លក់នាឡិកា និងការជួសជុល' : 'Split between Watch Sales & Repairs'}
              </p>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 rounded-full px-2 py-0.5 font-bold">
              {lang === 'km' ? 'ផ្សាយផ្ទាល់' : 'Live Synced'}
            </span>
          </div>

          <div className="h-[200px] w-full font-sans text-[10px] text-slate-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRepair" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px'
                  }} 
                />
                <Legend iconSize={8} iconType="circle" />
                <Area 
                  type="monotone" 
                  name={lang === 'km' ? 'លក់នាឡិកា (Watch Sales)' : 'Watch Sales'}
                  dataKey={lang === 'km' ? 'លក់នាឡិកា' : 'Watch Sales'} 
                  stackId="1"
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorWatch)" 
                />
                <Area 
                  type="monotone" 
                  name={lang === 'km' ? 'ជួសជុល/សេវាកម្ម (Repairs)' : 'Repairs & Services'}
                  dataKey={lang === 'km' ? 'ជួសជុល/សេវាកម្ម' : 'Repairs & Services'} 
                  stackId="1"
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRepair)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Sale Charter Widget */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'km' ? 'សន្ទស្សន៍ស្តុកទាប' : 'Inventory Health'}
            </h4>
            <p className="text-sm font-black text-rose-600 flex items-center gap-1.5 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              {lang === 'km' ? 'ទំនិញជិតអស់ពីស្តុក (Low Stock Alert)' : 'Low Stock Sale Charter'}
            </p>
            <p className="text-[10.5px] text-slate-500 mt-1">
              {lang === 'km' ? 'ទំនិញដែលនៅសល់តិចជាង ៥ គ្រឿង' : 'Products with 5 or fewer units left in hand'}
            </p>
          </div>

          <div className="mt-4 space-y-3 overflow-y-auto max-h-[145px] pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <Inbox className="w-8 h-8 text-emerald-500 mb-1.5 animate-bounce" />
                <p className="text-[10.5px] font-semibold text-emerald-600">{lang === 'km' ? '✓ ស្តុកទំនិញទាំងអស់មានសុវត្ថិភាព' : '✓ All inventory levels healthy'}</p>
              </div>
            ) : (
              lowStockProducts.map((p) => {
                const percentage = Math.min(100, (p.stock / 5) * 100);
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 truncate max-w-[170px]" title={p.name}>
                        {p.name} {p.color ? `(${p.color})` : ''}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                        p.stock === 0 
                          ? 'bg-rose-100 text-rose-700 font-bold' 
                          : p.stock <= 2 
                          ? 'bg-amber-100 text-amber-700 font-bold' 
                          : 'bg-indigo-50 text-indigo-700 font-bold'
                      }`}>
                        {p.stock === 0 ? (lang === 'km' ? 'អស់ពីស្តុក' : 'Out') : `${p.stock} pcs`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          p.stock === 0 
                            ? 'bg-rose-500' 
                            : p.stock <= 2 
                            ? 'bg-amber-500' 
                            : 'bg-indigo-500'
                        }`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 mt-4 text-[10px] text-slate-400 flex justify-between items-center font-medium">
            <span>{lang === 'km' ? 'សរុបមាន៖' : 'Low items flag: '} <strong className="font-extrabold text-slate-700">{lowStockProducts.length}</strong></span>
            <span className="text-slate-400">{lang === 'km' ? 'សន្ទស្សន៍លក់លឿន' : 'Priority restock focus'}</span>
          </div>
        </div>
      </div>

      {/* Monthly Closing History log panel */}
      {showClosingHistory && (
        <div className="bg-slate-50 border-2 border-indigo-150 rounded-xl p-5 mb-6 font-sans animate-fade-in shadow-xs">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {lang === 'km' ? '📜 ប្រវត្តិនៃការបិទបញ្ជីគណនេយ្យប្រចាំខែ' : '📜 Monthly Accounting Closings Log'}
                </h4>
                <p className="text-slate-500 text-[11px] font-medium mt-0.5">
                  {lang === 'km' ? 'កំណត់ត្រាហិរញ្ញវត្ថុដែលត្រូវបានចាក់សោរ និងរក្សាទុកជារៀងរាល់ខែ។' : 'Historically finalized and locked monthly financial records.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowClosingHistory(false)}
              className="p-1 px-2.5 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              {lang === 'km' ? 'លាក់ប្រវត្តិ' : 'Hide Log'}
            </button>
          </div>

          {monthlyClosings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium bg-white rounded-lg border border-slate-200">
              {lang === 'km' ? '🚫 មិនទាន់មានការបិទបញ្ជីខែណាមួយនៅឡើយទេ' : 'No monthly closings have been completed yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
              {monthlyClosings.map((closing) => (
                <div key={closing.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full font-mono">
                      {closing.monthYear}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(closing.closedAt).toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2.5">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[9.5px] text-slate-400 block font-sans">{lang === 'km' ? 'សរុបការលក់' : 'Total Revenue'}</span>
                      <span className="font-extrabold text-slate-800">${closing.totalSales.toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[9.5px] text-slate-400 block font-sans">{lang === 'km' ? 'សរុបចំណាយ' : 'Expenses'}</span>
                      <span className="font-extrabold text-rose-600">${closing.totalExpenses.toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[9.5px] text-slate-400 block font-sans">{lang === 'km' ? 'ប្រាក់ចំណេញដុល' : 'Gross Profit'}</span>
                      <span className="font-extrabold text-emerald-600">${(closing.totalSales - closing.totalCost).toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-emerald-50/50 rounded-lg">
                      <span className="text-[9.5px] text-emerald-700 block font-sans">{lang === 'km' ? 'ប្រាក់ចំណេញសុទ្ធ' : 'Net Profit'}</span>
                      <span className="font-extrabold text-emerald-700">${closing.netProfit.toFixed(2)}</span>
                    </div>
                  </div>

                  {closing.notes && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2 mt-2 font-sans border border-slate-100">
                      <strong className="text-slate-800">{lang === 'km' ? 'កំណត់ចំណាំ៖' : 'Notes:'}</strong> {closing.notes}
                    </div>
                  )}

                  <div className="text-[9.5px] text-slate-400 mt-2.5 flex items-center justify-between font-sans">
                    <span>{lang === 'km' ? 'បិទដោយ៖' : 'Closed by:'} <b>{closing.closedBy}</b></span>
                    <span>{lang === 'km' ? 'មូលធនទំនិញ៖' : 'Asset Capital:'} <b>${closing.totalStockCapital?.toFixed(2) || '0.00'}</b></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Monthly Financial Closing Modal */}
      {showClosingModal && (() => {
        const now = new Date();
        const currentPeriodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Calculate dynamic live numbers for the month
        const curMonthSalesList = sales.filter((s) => {
          try {
            const d = new Date(s.date);
            const isPaid = !s.paymentStatus || s.paymentStatus === 'Paid';
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && isPaid;
          } catch {
            return false;
          }
        });

        const mSales = curMonthSalesList.reduce((sum, s) => sum + s.totalSelling, 0);
        const mCost = curMonthSalesList.reduce((sum, s) => sum + (s.totalCost || 0), 0);
        const mGrossProfit = mSales - mCost;
        
        const mExpenses = (expenses || []).filter((e) => {
          try {
            const d = new Date(e.date);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          } catch {
            return false;
          }
        }).reduce((sum, e) => sum + e.amount, 0);

        const mNetProfit = mGrossProfit - mExpenses;
        const txCount = curMonthSalesList.length;

        // Breakdown details
        const curMonthProductSalesList = curMonthSalesList.filter((s) => !s.isService);
        const curMonthServiceSalesList = curMonthSalesList.filter((s) => s.isService);

        const mProductUnitsSold = curMonthProductSalesList.reduce((sum, s) => sum + s.quantity, 0);
        const mServiceUnitsDone = curMonthServiceSalesList.reduce((sum, s) => sum + s.quantity, 0);

        const mProductSalesRevenue = curMonthProductSalesList.reduce((sum, s) => sum + s.totalSelling, 0);
        const mServiceSalesRevenue = curMonthServiceSalesList.reduce((sum, s) => sum + s.totalSelling, 0);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-scale-in">
              <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg text-white">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">{lang === 'km' ? '🔒 បិទបញ្ជីគណនេយ្យប្រចាំខែ' : '🔒 Close Monthly Account'}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{lang === 'km' ? 'ចាក់សោរ និងរក្សាទុកទិន្នន័យហិរញ្ញវត្ថុប្រចាំខែ' : 'Finalize & Lock active month stats'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClosingModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 flex gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{lang === 'km' ? 'ព័ត៌មានសំខាន់៖' : 'Verification Required:'}</span>{' '}
                    {lang === 'km' 
                      ? 'សកម្មភាពនេះនឹងបង្កើតរបាយការណ៍ហិរញ្ញវត្ថុប្រចាំខែផ្លូវការ និងចាក់សោរកំណត់ត្រាខែនេះសម្រាប់ការប្រៀបធៀបនាពេលអនាគត។' 
                      : 'This locks down the month\'s financial variables to historical records. Confirm numbers are correct.'}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">{lang === 'km' ? 'ខែបញ្ជីគណនេយ្យ (Period)' : 'Reporting Period'}</span>
                    <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{currentPeriodKey}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">{lang === 'km' ? 'ចំនួនប្រតិបត្តិការលក់' : 'Total Sales Transactions'}</span>
                    <span className="font-bold font-mono text-slate-800">{txCount} txns</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-1">
                    <span className="text-slate-500 font-medium">{lang === 'km' ? 'សរុបចំណូលលក់ (Total Revenue)' : 'Gross Revenue'}</span>
                    <span className="font-bold font-mono text-slate-800">${mSales.toFixed(2)}</span>
                  </div>

                  {/* Dynamic breakdown presentation */}
                  <div className="pl-3.5 border-l-2 border-slate-200 space-y-1.5 pb-2 border-b border-slate-100 text-[10.5px] text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">🛍️ {lang === 'km' ? 'លក់នាឡិកា (Watch Sales):' : 'Watch Sales:'}</span>
                      <span className="font-mono font-bold text-slate-700">{mProductUnitsSold} {lang === 'km' ? 'គ្រឿង' : 'pcs'} (${mProductSalesRevenue.toFixed(2)})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">🛠️ {lang === 'km' ? 'ជួសជុល/សេវាកម្ម (Repairs):' : 'Repairs & Services:'}</span>
                      <span className="font-mono font-bold text-slate-700">{mServiceUnitsDone} {lang === 'km' ? 'គ្រឿង' : 'pcs'} (${mServiceSalesRevenue.toFixed(2)})</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">{lang === 'km' ? 'ដើមទុនទំនិញលក់អស់ (COGS)' : 'Cost of Goods Sold (COGS)'}</span>
                    <span className="font-bold font-mono text-slate-800">${mCost.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">{lang === 'km' ? 'ប្រាក់ចំណេញដុល (Gross Profit)' : 'Gross Profit'}</span>
                    <span className="font-bold font-mono text-emerald-600">${mGrossProfit.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">{lang === 'km' ? 'សរុបការចំណាយហាង (Expenses)' : 'Monthly Operating Expenses'}</span>
                    <span className="font-bold font-mono text-rose-600">${mExpenses.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs p-3 bg-emerald-50 rounded-xl">
                    <span className="text-emerald-800 font-bold">{lang === 'km' ? 'ប្រាក់ចំណេញសុទ្ធ (Net Profit)' : 'Net Profit'}</span>
                    <span className="font-black font-mono text-emerald-700 text-sm">${mNetProfit.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">{lang === 'km' ? 'កំណត់ចំណាំបន្ថែមលើការបិទបញ្ជី' : 'Closing Notes / Remarks'}</label>
                  <textarea
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder={lang === 'km' ? 'ឧ. ទិន្នន័យបញ្ជីខែនេះត្រឹមត្រូវ និងទូទាត់រួចរាល់...' : 'e.g., Accounts balanced, inventory and cash registers matched.'}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    rows={2}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowClosingModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 rounded-lg hover:bg-slate-150 transition-colors cursor-pointer font-semibold"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onSaveMonthlyClosing) {
                      // Append precise breakdown details to closing notes so they are permanently archived
                      const compiledNotes = closingNotes 
                        ? `${closingNotes} [Breakdown: Watch Sales = ${mProductUnitsSold} pcs ($${mProductSalesRevenue.toFixed(2)}), Service/Repairs = ${mServiceUnitsDone} pcs ($${mServiceSalesRevenue.toFixed(2)})]`
                        : `Breakdown: Watch Sales = ${mProductUnitsSold} pcs ($${mProductSalesRevenue.toFixed(2)}), Service/Repairs = ${mServiceUnitsDone} pcs ($${mServiceSalesRevenue.toFixed(2)})`;

                      onSaveMonthlyClosing({
                        monthYear: currentPeriodKey,
                        totalSales: mSales,
                        totalCost: mCost,
                        totalExpenses: mExpenses,
                        netProfit: mNetProfit,
                        totalStockCapital: products.reduce((acc, p) => acc + p.purchasePrice * p.stock, 0),
                        notes: compiledNotes,
                      });
                    }
                    setShowClosingModal(false);
                    setClosingNotes('');
                    alert(lang === 'km' 
                      ? '🎉 បានរក្សាទុកការបិទបញ្ជីប្រចាំខែ និងចាក់សោរដោយជោគជ័យ!' 
                      : '🎉 Monthly closing period successfully logged and archived.');
                  }}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {lang === 'km' ? 'យល់ព្រមបិទបញ្ជី' : 'Finalize & Archive Month'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sales Logs Table */}
      <div className="mt-8 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
            📋 {lang === 'km' ? 'កំណត់ហេតុនៃការលក់' : 'Sales Transaction Logs'}
          </h4>
          <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
            {lang === 'km' ? 'បញ្ជីប្រតិបត្តិការទិញលក់ និងសេវាកម្មជួសជុលទាំងអស់' : 'All watches transactions and service repair details.'}
          </p>
        </div>

        {/* Quick Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
            {lang === 'km' ? 'ស្ថានភាពទូទាត់' : 'Payment Status'}:
          </span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
          >
            <option value="all">🌐 {lang === 'km' ? 'ទាំងអស់ (All)' : 'All Payments'}</option>
            <option value="Paid">💵 {lang === 'km' ? 'បានបង់រួច (Paid)' : 'Paid Only'}</option>
            <option value="Unpaid">❌ {lang === 'km' ? 'មិនទាន់បង់ (Unpaid)' : 'Unpaid Only'}</option>
            <option value="COD">🚚 {lang === 'km' ? 'COD (COD)' : 'COD Only'}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">កាលបរិច្ឆេទ (Date)</th>
              <th className="px-4 py-3">ឈ្មោះផលិតផល</th>
              <th className="px-4 py-3 text-center">បរិមាណលក់</th>
              <th className="px-4 py-3 text-right">តម្លៃលក់/ឯកតា</th>
              <th className="px-4 py-3 text-right">ទឹកប្រាក់លក់បាន</th>
              <th className="px-4 py-3 text-right">
                ប្រាក់ចំណេញសុទ្ធ
                <span className="block text-[8px] text-slate-400 normal-case font-normal">(Owner Exclusive)</span>
              </th>
              <th className="px-4 py-3">អ្នកលក់ប្រចាំការ ERP</th>
              <th className="px-5 py-3 text-center">សន្លឹកវិក្កយបត្រ (Receipt)</th>
              <th className="px-4 py-3 text-center">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 text-xs">
            {(() => {
              const filtered = sales.filter((s) => {
                if (paymentFilter === 'all') return true;
                if (paymentFilter === 'Paid') return !s.paymentStatus || s.paymentStatus === 'Paid';
                return s.paymentStatus === paymentFilter;
              });

              if (filtered.length === 0) {
                return (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400 font-medium">
                      {paymentFilter === 'all' 
                        ? (lang === 'km' ? 'មិនទាន់មានការទិញលក់ថ្ងៃនេះនៅឡើយទេ (No sales recorded yet)' : 'No sales recorded yet')
                        : (lang === 'km' ? 'គ្មានទិន្នន័យស្របតាមលក្ខខណ្ឌចម្រោះទេ (No matching sales)' : 'No matching sales for selected payment status')}
                    </td>
                  </tr>
                );
              }

              return [...filtered].reverse().map((s) => {
                const profit = s.totalSelling - s.totalCost;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(s.date).toLocaleTimeString()} {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                        {s.isService ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-100 border border-indigo-200 text-indigo-800 uppercase tracking-wide inline-flex items-center gap-1">
                            🛠️ {s.serviceType === 'Battery' ? 'ប្តូរថ្ម (Battery)' : s.serviceType === 'Strap' ? 'ប្តូរខ្សែ (Strap)' : 'ជួសជុល (Repair)'}
                          </span>
                        ) : (
                          s.productName
                        )}
                        
                        {s.color && !s.isService && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-50 border border-indigo-150 text-indigo-700 uppercase tracking-wide inline-flex items-center gap-0.5 whitespace-nowrap animate-fade-in">
                            🎨 {s.color}
                          </span>
                        )}

                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide inline-flex items-center gap-0.5 whitespace-nowrap border ${
                          s.saleChannel === 'Online'
                            ? 'bg-blue-50 border-blue-150 text-blue-700' 
                            : 'bg-emerald-50 border-emerald-150 text-emerald-700'
                        }`}>
                          {s.saleChannel === 'Online' ? '🌐 ' + t.saleChannelOnline.split(' ')[0] : '🛒 ' + t.saleChannelShop.split(' ')[0]}
                        </span>

                        {s.shippingLocation && s.saleChannel === 'Online' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 border border-slate-250 text-slate-700 uppercase tracking-wide inline-flex items-center gap-0.5 whitespace-nowrap">
                            📍 {s.shippingLocation}
                          </span>
                        )}

                        {s.deliveryCompany && s.saleChannel === 'Online' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 border border-indigo-200 text-indigo-800 uppercase tracking-wide inline-flex items-center gap-0.5 whitespace-nowrap">
                            📦 {s.deliveryCompany}
                          </span>
                        )}

                        {s.qrPaymentUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewQrCode(s.qrPaymentUrl || null);
                            }}
                            className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-50 hover:bg-indigo-100 border border-indigo-250 text-indigo-700 uppercase tracking-wide inline-flex items-center gap-0.5 cursor-pointer animate-fade-in"
                            title={lang === 'km' ? 'បង្ហាញកូដ QR ទូទាត់ប្រាក់' : 'Show QR Payment Code'}
                          >
                            📱 QR
                          </button>
                        )}

                        {/* Always show payment status badge, and make it beautifully interactive for Unpaid/COD sales */}
                        <button
                          type="button"
                          onClick={() => {
                            const currentStatus = s.paymentStatus || 'Paid';
                            if (currentStatus === 'COD' || currentStatus === 'Unpaid') {
                              if (confirm(lang === 'km' ? 'តើអ្នកចង់សម្គាល់វិក្កយបត្រនេះថា "បានបង់រួច (Paid)" មែនទេ?' : 'Do you want to mark this transaction as Paid?')) {
                                onUpdateSaleStatus(s.id, 'Paid');
                              }
                            } else {
                              // Allow owner to cycle/revert if they need to adjust paymentStatus
                              if (confirm(lang === 'km' ? 'តើអ្នកចង់កែប្រែស្ថានភាពទូទាត់សម្រាប់ប្រតិបត្តិការនេះឡើងវិញទេ?' : 'Do you want to adjust the payment status for this transaction?')) {
                                const nextOpt = prompt(
                                  lang === 'km'
                                    ? 'វាយបញ្ចូល៖ 1 សម្រាប់ បង់រួច (Paid)\n2 សម្រាប់ មិនទាន់បង់ (Unpaid)\n3 សម្រាប់ COD'
                                    : 'Type:\n1 for Paid\n2 for Unpaid\n3 for COD',
                                  '1'
                                );
                                if (nextOpt === '1') onUpdateSaleStatus(s.id, 'Paid');
                                if (nextOpt === '2') onUpdateSaleStatus(s.id, 'Unpaid');
                                if (nextOpt === '3') onUpdateSaleStatus(s.id, 'COD');
                              }
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide inline-flex items-center gap-0.5 whitespace-nowrap border cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                            (!s.paymentStatus || s.paymentStatus === 'Paid')
                              ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                              : s.paymentStatus === 'COD'
                              ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                              : 'bg-rose-100 border-rose-250 text-rose-800'
                          }`}
                          title={(!s.paymentStatus || s.paymentStatus === 'Paid')
                            ? (lang === 'km' ? 'បានបង់រួច (ចុចដើម្បីប្តូរ)' : 'Paid (Click to change)')
                            : (lang === 'km' ? 'ចុចទីនេះដើម្បីសម្គាល់ថាបានបង់លុយរួច' : 'Click to mark as Paid')
                          }
                        >
                          {(!s.paymentStatus || s.paymentStatus === 'Paid') && (
                            <>💵 {lang === 'km' ? 'បង់រួច' : 'Paid'}</>
                          )}
                          {s.paymentStatus === 'Unpaid' && (
                            <>❌ {lang === 'km' ? 'មិនទាន់បង់ ➔ ចុចបង់' : 'Unpaid ➔ Click Paid'}</>
                          )}
                          {s.paymentStatus === 'COD' && (
                            <>🚚 COD ➔ {lang === 'km' ? 'ចុចបង់' : 'Click Paid'}</>
                          )}
                        </button>

                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide inline-flex items-center gap-0.5 whitespace-nowrap border ${
                          !s.paymentMethod || s.paymentMethod === 'Cash'
                            ? 'bg-emerald-150 border-emerald-200 text-emerald-800'
                            : s.paymentMethod === 'ABA'
                            ? 'bg-blue-100 border-blue-200 text-blue-800'
                            : 'bg-purple-100 border-purple-200 text-purple-800'
                        }`}>
                          {!s.paymentMethod || s.paymentMethod === 'Cash' ? '💵 លុយសុទ្ធ' : s.paymentMethod === 'ABA' ? '📱 ABA' : '📱 ACLEDA'}
                        </span>
                      </div>

                      {s.isService && s.serviceNote && (
                        <p className="text-[10.5px] text-slate-500 font-medium italic mt-1">
                          Note: {s.serviceNote}
                        </p>
                      )}

                      {s.discountAmount && s.discountAmount > 0 ? (
                        <div className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                          <span className="bg-rose-50 border border-rose-100 rounded px-1.5 py-0.2 text-[9px] font-bold">
                            {lang === 'km' ? `បញ្ចុះតម្លៃ ` : `Discount `} 
                            {s.discountPercent ? `${s.discountPercent}%` : `-$${s.discountAmount.toFixed(2)}`}
                          </span>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">x{s.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {s.discountAmount && s.discountAmount > 0 ? (
                        <div>
                          <span className="line-through text-slate-400 text-[10px] block">${(s.originalSellingPrice || (s.sellingPrice + s.discountAmount)).toFixed(2)}</span>
                          <span className="text-slate-800 font-bold block">${s.sellingPrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        `$${s.sellingPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-600">${s.totalSelling.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {hasFullOwnerAccess ? (
                        <div className="flex flex-col items-end">
                          <span className="font-extrabold text-indigo-600 text-xs bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">+${profit.toFixed(2)}</span>
                          <span className="text-[9.5px] text-slate-500 font-bold block mt-1 pointer-events-none whitespace-nowrap">
                            ${s.totalSelling.toFixed(2)} - ${s.totalCost.toFixed(2)} = ${profit.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="filter blur-[4px] text-slate-300 font-mono select-none" title="Owner Only Option">
                          +$00.00
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span className="text-slate-600">{s.handledBy}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setSelectedSaleForInvoice(s)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px] text-indigo-700 hover:text-indigo-800 font-bold tracking-wide transition-colors cursor-pointer"
                        title="View Tax Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        បោះពុម្ភ (Print)
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasFullOwnerAccess ? (
                        <button
                          onClick={() => {
                            if (confirm(`តើអ្នកចង់លុបចោលប្រតិបត្តិការលក់នេះមែនទេ? (ទិន្នន័យស្តុកនឹងត្រឡប់មកវិញ)`)) {
                              onDeleteSale(s.id);
                            }
                          }}
                          className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded flex items-center justify-center mx-auto transition-colors cursor-pointer"
                          title="Void Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })
            })()}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal Overlay */}
      {selectedSaleForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col my-8">
            
            {/* Modal Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">ទាញយកវិក្កយបត្រជា PDF (Download PDF Invoice)</span>
              </div>
              <button
                onClick={() => setSelectedSaleForInvoice(null)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt body scroll block */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              
              {/* Actual Printable Invoice Container block */}
              <div 
                id="print-invoice-area-retail" 
                className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm font-sans"
              >
                {/* Header info */}
                <div className="text-center space-y-1.5 pb-5 border-b border-dashed border-slate-300">
                  <h2 className="text-lg font-black tracking-tight text-slate-800">
                    ហាងលក់នាឡិកាដៃប្រណិត សហគ្រាស អ៊ីអរភី
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    (PREMIUM WATCHES ERP HUB - CAMBODIA)
                  </p>
                  <p className="text-[10.5px] text-slate-500">
                    មហាវិថី សហព័ន្ធរុស្ស៊ី, ភ្នំពេញ, ប្រទេសកម្ពុជា
                  </p>
                  <p className="text-[10.5px] text-slate-500 font-mono">
                    Tel: +855 (0) 23 888 999 | Email: contact@watch-erp.com.kh
                  </p>
                  
                  <div className="pt-2">
                    <span className="p-1 px-3 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      វិក្កយបត្រលក់រាយ (TAX RECEIPT)
                    </span>
                  </div>
                </div>

                {/* Sub Metadata parameters */}
                <div className="grid grid-cols-2 gap-2 text-[11px] py-4 border-b border-slate-200 text-slate-600">
                  <div>
                    <div className="font-semibold text-slate-700">លេខកូដវិក្កយបត្រ (Inv No):</div>
                    <div className="font-mono text-[11.5px] text-slate-800 font-bold">#INV-{selectedSaleForInvoice.id.slice(-6).toUpperCase()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-700">កាលបរិច្ឆេទ (Date):</div>
                    <div className="font-mono text-slate-800">
                      {new Date(selectedSaleForInvoice.date).toLocaleDateString()} {new Date(selectedSaleForInvoice.date).toLocaleTimeString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">អ្នកលក់ (Issued By Cashier):</div>
                    <div className="text-slate-800 font-semibold">{selectedSaleForInvoice.handledBy}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-700">ប្រភពលក់ (Sales Channel):</div>
                    <div className={`inline-flex items-center gap-1 font-bold text-[11px] rounded px-1.5 py-0.5 ${selectedSaleForInvoice.saleChannel === 'Online' ? 'text-blue-700 bg-blue-50' : 'text-emerald-700 bg-emerald-50'}`}>
                      {selectedSaleForInvoice.saleChannel === 'Online' ? '🌐 ' + t.saleChannelOnline.split(' ')[0] : '🛒 ' + t.saleChannelShop.split(' ')[0]}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">ស្ថានភាពទូទាត់ (Payment Status):</div>
                    <div className={`inline-flex items-center gap-1 font-extrabold uppercase text-[10px] ${
                      selectedSaleForInvoice.paymentStatus === 'COD'
                        ? 'text-amber-600'
                        : selectedSaleForInvoice.paymentStatus === 'Unpaid'
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        selectedSaleForInvoice.paymentStatus === 'COD'
                          ? 'bg-amber-500 animate-pulse'
                          : selectedSaleForInvoice.paymentStatus === 'Unpaid'
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                      }`}></span>
                      {selectedSaleForInvoice.paymentStatus === 'COD'
                        ? (lang === 'km' ? 'COD / ដឹកមុនទូទាត់ក្រោយ' : 'COD')
                        : selectedSaleForInvoice.paymentStatus === 'Unpaid'
                        ? (lang === 'km' ? 'មិនទាន់ទូទាត់ (UNPAID)' : 'UNPAID')
                        : (lang === 'km' ? 'បានបង់ប្រាក់ (PAID)' : 'PAID')
                      }
                    </div>
                  </div>
                  {selectedSaleForInvoice.saleChannel === 'Online' && (selectedSaleForInvoice.shippingLocation || selectedSaleForInvoice.deliveryCompany) && (
                    <div className="text-right">
                      <div className="font-semibold text-slate-700">ព័ត៌មានដឹកជញ្ជូន (Delivery Info):</div>
                      {selectedSaleForInvoice.shippingLocation && (
                        <div className="font-bold text-[11px] text-slate-800">
                          📍 {selectedSaleForInvoice.shippingLocation}
                        </div>
                      )}
                      {selectedSaleForInvoice.deliveryCompany && (
                        <div className="text-[10.5px] text-indigo-700 font-extrabold mt-0.5">
                          📦 {selectedSaleForInvoice.deliveryCompany}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer & Warranty Info Block (Printed on invoice) */}
                {(selectedSaleForInvoice.customerName || selectedSaleForInvoice.customerPhone || selectedSaleForInvoice.warrantyPeriod) && (
                  <div className="py-2.5 px-3 bg-slate-50 border border-slate-150 rounded-lg text-[11px] grid grid-cols-3 gap-2 mt-3 text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[9.5px] uppercase">{lang === 'km' ? 'ឈ្មោះអតិថិជន' : 'CUSTOMER'}</span>
                      <span className="font-bold text-slate-800">{selectedSaleForInvoice.customerName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[9.5px] uppercase">{lang === 'km' ? 'លេខទូរស័ព្ទ' : 'PHONE'}</span>
                      <span className="font-mono text-slate-800 font-bold">{selectedSaleForInvoice.customerPhone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[9.5px] uppercase">{lang === 'km' ? 'រយៈពេលធានា' : 'WARRANTY'}</span>
                      <span className="text-indigo-700 font-extrabold flex items-center gap-1">
                        🛡️ {selectedSaleForInvoice.warrantyPeriod || 'No Warranty'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Products Table specs */}
                <div className="py-4">
                  <table className="w-full text-left text-[11.5px]">
                    <thead>
                      <tr className="border-b border-slate-300 font-bold text-slate-600 uppercase">
                        <th className="pb-2">ការពិពណ៌នាទំនិញ (Description)</th>
                        <th className="pb-2 text-center">បរិមាណ (Qty)</th>
                        <th className="pb-2 text-right">តម្លៃរាយ (Price)</th>
                        <th className="pb-2 text-right">សរុប (Subtotal)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 font-semibold text-slate-800 max-w-[180px]">
                          {selectedSaleForInvoice.isService ? (
                            <div>
                              <span className="font-bold text-indigo-700">
                                🛠️ {selectedSaleForInvoice.serviceType === 'Battery' ? 'ប្តូរថ្ម (Battery Service)' : selectedSaleForInvoice.serviceType === 'Strap' ? 'ប្តូរខ្សែ (Strap Service)' : 'ជួសជុល (Repair Service)'}
                              </span>
                              {selectedSaleForInvoice.serviceNote && (
                                <div className="text-[10px] text-slate-500 italic mt-0.5">
                                  Note: {selectedSaleForInvoice.serviceNote}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>{selectedSaleForInvoice.productName}</div>
                          )}
                          
                          {selectedSaleForInvoice.color && !selectedSaleForInvoice.isService && (
                            <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                              {lang === 'km' ? `🎨 ពណ៌៖ ${selectedSaleForInvoice.color}` : `🎨 Color: ${selectedSaleForInvoice.color}`}
                            </div>
                          )}
                          {selectedSaleForInvoice.discountAmount && selectedSaleForInvoice.discountAmount > 0 ? (
                            <div className="text-[10px] text-rose-500 font-medium">
                              {lang === 'km' 
                                ? `បញ្ចុះតម្លៃ -$${selectedSaleForInvoice.discountAmount.toFixed(2)}${selectedSaleForInvoice.discountPercent ? ` (${selectedSaleForInvoice.discountPercent}%)` : ''}` 
                                : `Discount -$${selectedSaleForInvoice.discountAmount.toFixed(2)}${selectedSaleForInvoice.discountPercent ? ` (${selectedSaleForInvoice.discountPercent}%)` : ''}`
                              }
                            </div>
                          ) : null}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-slate-700">
                          x{selectedSaleForInvoice.quantity}
                        </td>
                        <td className="py-3 text-right font-mono">
                          {selectedSaleForInvoice.discountAmount && selectedSaleForInvoice.discountAmount > 0 ? (
                            <div>
                              <div className="line-through text-slate-400 text-[10px]">${(selectedSaleForInvoice.originalSellingPrice || (selectedSaleForInvoice.sellingPrice + selectedSaleForInvoice.discountAmount)).toFixed(2)}</div>
                              <div className="text-slate-800 font-semibold">${selectedSaleForInvoice.sellingPrice.toFixed(2)}</div>
                            </div>
                          ) : (
                            `$${selectedSaleForInvoice.sellingPrice.toFixed(2)}`
                          )}
                        </td>
                        <td className="py-3 text-right font-bold font-mono text-slate-800">
                          ${selectedSaleForInvoice.totalSelling.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Sub Total metrics area with Dual currencies */}
                <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                    <span>វិធីសាស្ត្រទូទាត់ (Payment Method):</span>
                    <span className="uppercase text-indigo-600 font-mono">
                      {selectedSaleForInvoice.paymentMethod === 'ABA' 
                        ? '📱 ABA BANK' 
                        : selectedSaleForInvoice.paymentMethod === 'ACLEDA' 
                          ? '📱 ACLEDA BANK' 
                          : selectedSaleForInvoice.paymentMethod === 'Mixed'
                            ? '🔀 MIXED (លុយចម្រុះ)'
                            : '💵 CASH (លុយសុទ្ធ)'
                      }
                    </span>
                  </div>

                  {selectedSaleForInvoice.paymentMethod === 'Mixed' && (
                    <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[10.5px] space-y-1 my-1.5">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[8.5px]">{lang === 'km' ? 'លម្អិតនៃការទូទាត់ចម្រុះ' : 'Mixed Payment Breakdown'}:</p>
                      {!!selectedSaleForInvoice.mixedBankAmount && (
                        <div className="flex justify-between text-slate-600">
                          <span>📱 ផ្ទេរតាមធនាគារ (Bank Transfer):</span>
                          <span className="font-mono font-bold">${selectedSaleForInvoice.mixedBankAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {!!selectedSaleForInvoice.mixedCashUsdAmount && (
                        <div className="flex justify-between text-slate-600">
                          <span>💵 លុយសុទ្ធដុល្លារ (Cash USD):</span>
                          <span className="font-mono font-bold">${selectedSaleForInvoice.mixedCashUsdAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {!!selectedSaleForInvoice.mixedCashRielAmount && (
                        <div className="flex justify-between text-slate-600">
                          <span>💵 លុយសុទ្ធរៀល (Cash KHR):</span>
                          <span className="font-mono font-bold">៛{selectedSaleForInvoice.mixedCashRielAmount.toLocaleString()} ៛</span>
                        </div>
                      )}
                    </div>
                  )}

                  {(!selectedSaleForInvoice.paymentMethod || selectedSaleForInvoice.paymentMethod === 'Cash' || selectedSaleForInvoice.paymentMethod === 'Mixed') && (
                    <>
                      <div className="flex justify-between font-medium text-slate-600 text-[11px]">
                        <span>ប្រាក់ទទួលបាន (Received Amount):</span>
                        <span className="font-mono text-slate-800">
                          ${(selectedSaleForInvoice.receivedAmount || selectedSaleForInvoice.totalSelling).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-600 text-[11px]">
                        <span>ប្រាក់អាប់ជូន (Change):</span>
                        <span className="font-mono text-slate-800">
                          ${(selectedSaleForInvoice.changeAmount || Math.max(0, (selectedSaleForInvoice.receivedAmount || selectedSaleForInvoice.totalSelling) - selectedSaleForInvoice.totalSelling)).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between font-bold text-slate-800 text-sm pt-1 border-t border-slate-100">
                    <span>សរុបសាច់ប្រាក់ជាដុល្លារ (TOTAL USD):</span>
                    <span className="font-mono text-lg text-indigo-700">${selectedSaleForInvoice.totalSelling.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-500 text-[11px]">
                    <span>សរុបសាច់ប្រាក់ជារៀល (TOTAL KHR):</span>
                    <span className="font-mono">
                      ៛{(selectedSaleForInvoice.totalSelling * 4100).toLocaleString()} ៛
                      <span className="block text-[8px] text-slate-400 font-normal mt-0.5 text-right">(អត្រាគណនា 1$ = 4,100 ៛)</span>
                    </span>
                  </div>
                </div>

                {/* QR Code saved in the sale */}
                {selectedSaleForInvoice.qrPaymentUrl && (
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex flex-col items-center justify-center space-y-1.5 qr-no-print">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">
                      {lang === 'km' ? 'កូដ QR ទូទាត់ប្រាក់ (QR Payment)' : 'QR Payment Code'}
                    </span>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex items-center justify-center max-w-[120px] max-h-[120px] overflow-hidden">
                      {selectedSaleForInvoice.qrPaymentUrl.startsWith('data:image/') || selectedSaleForInvoice.qrPaymentUrl.includes('.png') || selectedSaleForInvoice.qrPaymentUrl.includes('.jpg') || selectedSaleForInvoice.qrPaymentUrl.includes('.jpeg') || selectedSaleForInvoice.qrPaymentUrl.includes('.webp') ? (
                        <img
                          src={selectedSaleForInvoice.qrPaymentUrl}
                          alt="QR Payment"
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-center p-2 text-[9px] text-slate-500 font-mono break-all font-semibold">
                          🔗 <a href={selectedSaleForInvoice.qrPaymentUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{selectedSaleForInvoice.qrPaymentUrl}</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom thank notes */}
                <div className="text-center pt-6 mt-6 border-t border-dashed border-slate-200 space-y-1">
                  <p className="text-[11px] font-bold text-slate-700">សហគ្រាស អ៊ីអរភី សូមអរគុណចំពោះការគាំទ្ររបស់លោកអ្នក!</p>
                  <p className="text-[10px] text-slate-400 italic">"នាឡិកាប្រណិត ឆ្លុះបញ្ចាំងពីតម្លៃនៃពេលវេលាប្រកបដោយទំនុកចិត្ត"</p>
                  <p className="text-[8px] text-slate-400 hover:text-slate-500 transition font-mono uppercase mt-2">
                    System Autogenerated Receipt via khmernakboy@gmail.com
                  </p>
                </div>

              </div>

              {/* PDF Tip Instructions list */}
              <div className="mt-5 p-3.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 space-y-1 font-sans">
                <span className="font-bold text-slate-200">💡 ព័ត៌មានបន្ថែមអំពីការរក្សាទុកជា PDF៖</span>
                <p>ប្រព័ន្ធដំឡើងកម្មវិធី <strong className="text-emerald-400">Save as PDF</strong> ស្វ័យប្រវត្តិកម្រិតច្បាស់ខ្ពស់។ លោកអ្នកគ្រាន់តែចុចប៊ូតុងខាងក្រោមដើម្បីទាញយកទុកភ្លាមៗ!</p>
              </div>

            </div>

            {/* Modal Actions footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950">
              <button
                type="button"
                onClick={() => setSelectedSaleForInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                បិទផ្ទាំង (Close Preview)
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoicePDF(selectedSaleForInvoice)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer animate-pulse"
              >
                <Download className="w-4 h-4" />
                រក្សាទុកជា PDF (Save as PDF)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Report Modal Preview ( Daily Watch Sales Report ) */}
      {showReportPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col my-8">
            
            {/* Modal Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold">ទាញយករបាយការណ៍ជា PDF (Download PDF Report)</span>
              </div>
              <button
                onClick={() => setShowReportPreview(false)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt body scroll block */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              
              {/* Actual Printable Invoice Container block */}
              <div 
                id="print-invoice-area-report" 
                className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm font-sans"
              >
                {/* Header info */}
                <div className="text-center space-y-1 pb-5 border-b border-dashed border-slate-300">
                  <h2 className="text-lg font-black tracking-tight text-slate-800">
                    សហគ្រាស ហាងនាឡិកាដៃប្រណិត អ៊ីអរភី
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    (PREMIUM WATCH ENTERPRISE ERP - DAILY TRANSACTION REPORT)
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    កាលបរិច្ឆេទរបាយការណ៍៖ {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </p>
                  
                  <div className="pt-2">
                    <span className="p-1 px-4 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      របាយការណ៍លក់សរុបប្រចាំថ្ងៃ (DAILY SALES LEDGER REPORT)
                    </span>
                  </div>
                </div>

                {/* KPI stats blocks for the printed report */}
                <div className="grid grid-cols-3 gap-4 text-center my-5 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <div className="border-r border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">ចំនួនលក់ចេញសរុប</p>
                    <p className="text-base font-black text-slate-800 font-mono mt-0.5">{sales.length} វិក្កយបត្រ</p>
                  </div>
                  <div className="border-r border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">ចំណូលដុល្លារសរុប (USD)</p>
                    <p className="text-base font-black text-emerald-600 font-mono mt-0.5">
                      ${sales.filter((s) => !s.paymentStatus || s.paymentStatus === 'Paid').reduce((acc, s) => acc + s.totalSelling, 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">ចំណូលជារៀល (KHR)</p>
                    <p className="text-xs font-black text-indigo-700 font-mono mt-1">
                      ៛{(sales.filter((s) => !s.paymentStatus || s.paymentStatus === 'Paid').reduce((acc, s) => acc + s.totalSelling, 0) * 4100).toLocaleString()} ៛
                    </p>
                  </div>
                </div>

                {/* Products Table specs */}
                <div className="py-2">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300 font-bold text-slate-700 bg-slate-50">
                        <th className="py-2 px-1">កាលបរិច្ឆេទ (Date)</th>
                        <th className="py-2 px-1">ឈ្មោះផលិតផលនាឡិកា (ProductName)</th>
                        <th className="py-2 px-1 text-center">ចំនួន (Qty)</th>
                        <th className="py-2 px-1 text-right">តម្លៃរាយ</th>
                        <th className="py-2 px-1 text-right text-indigo-700">សរុប (USD)</th>
                        <th className="py-2 px-1 text-right">អ្នកលក់ ERP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sales.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                            មិនទាន់មានប្រតិបត្តិការលក់សម្រាប់របាយការណ៍នេះទេ
                          </td>
                        </tr>
                      ) : (
                        sales.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-1 font-mono text-[9.5px] text-slate-500">
                              {new Date(item.date).toLocaleTimeString()}
                            </td>
                            <td className="py-2 px-1 font-semibold text-slate-800 max-w-[150px] truncate">
                              <div>{item.isService ? `🛠️ ${item.serviceType === 'Battery' ? 'ប្តូរថ្ម (Battery)' : item.serviceType === 'Strap' ? 'ប្តូរខ្សែ (Strap)' : 'ជួសជុល (Repair)'}` : item.productName}</div>
                              <div className="text-[9px] text-slate-400 font-medium">
                                {item.saleChannel === 'Online' ? '🌐 លក់ Online' : '🛒 លក់នៅហាង'}
                              </div>
                            </td>
                            <td className="py-2 px-1 text-center font-mono font-bold text-slate-700">
                              x{item.quantity}
                            </td>
                            <td className="py-2 px-1 text-right font-mono text-slate-600">${item.sellingPrice.toFixed(2)}</td>
                            <td className="py-2 px-1 text-right font-bold font-mono text-emerald-600">
                              ${item.totalSelling.toFixed(2)}
                            </td>
                            <td className="py-2 px-1 text-right text-slate-600">
                              {item.handledBy.split(' ')[0]}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Report signatures/stamp alignment */}
                <div className="grid grid-cols-2 pt-10 mt-10 border-t border-dashed border-slate-300 text-xs text-center text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-500 uppercase text-[9px] tracking-wider">រៀបចំ និងត្រួតពិនិត្យដោយ (Prepared By)</p>
                    <p className="font-bold text-slate-800 mt-8">{currentUser}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">គណនីភារកិច្ច: {currentRole}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500 uppercase text-[9px] tracking-wider">ហត្ថលេខាម្ចាស់សហគ្រាស (Owner Approval)</p>
                    <p className="font-bold text-slate-300 mt-8">....................................................</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">ការយល់ព្រមលើរបាយការណ៍ហិរញ្ញវត្ថុ</p>
                  </div>
                </div>

                <div className="text-center pt-8 text-[9px] text-slate-400 font-mono border-t border-slate-100 mt-8">
                  របាយការណ៍ស្វ័យប្រវត្តិ ERP • generate on 2026-06-18 • user: khmernakboy@gmail.com
                </div>

              </div>

              {/* PDF Tip Instructions list */}
              <div className="mt-5 p-3.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 space-y-1 font-sans">
                <span className="font-bold text-slate-200">💡 ព័ត៌មានបន្ថែមអំពីការរក្សាទុកជា PDF៖</span>
                <p>ប្រព័ន្ធដំឡើងកម្មវិធី <strong className="text-emerald-400">Save as PDF</strong> ស្វ័យប្រវត្តិកម្រិតច្បាស់ខ្ពស់។ លោកអ្នកគ្រាន់តែចុចប៊ូតុងខាងក្រោមដើម្បីទាញយកទុកភ្លាមៗ!</p>
              </div>

            </div>

            {/* Modal Actions footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950">
              <button
                type="button"
                onClick={() => setShowReportPreview(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                បិទផ្ទាំង (Close Preview)
              </button>
              <button
                type="button"
                onClick={handleSaveReportPDF}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer animate-pulse"
              >
                <Download className="w-4 h-4" />
                រក្សាទុកជារបាយការណ៍ PDF (Save Report as PDF)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POS Scanner Simulation Modal */}
      {isPOSScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            {/* Red Laser Scanning line decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="text-lg">📷</span>
                <span className="text-sm font-bold">{lang === 'km' ? 'ម៉ាស៊ីនស្កេនបាកូដ POS (Barcode Scanner Simulator)' : 'POS Barcode Scanner Simulator'}</span>
              </div>
              <button
                onClick={() => setIsPOSScanning(false)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                
                {/* Visual Laser Guide */}
                <div className="w-48 h-32 border-2 border-dashed border-indigo-500/40 rounded-lg flex items-center justify-center relative overflow-hidden bg-slate-900/60">
                  <div className="absolute w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] top-1/2 left-0 animate-bounce" />
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest">[ PLACE CODE HERE ]</span>
                </div>
                <p className="text-[10.5px] text-indigo-300 text-center">
                  {lang === 'km' ? 'ដាក់កូដទំនិញ ឬវាយបញ្ចូល SKU របស់ទំនិញ' : 'Position barcode inside laser line or type SKU code'}
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-300">
                  {lang === 'km' ? 'វាយបញ្ចូល SKU / កូដបាកូដ' : 'SKU / Barcode Input'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={posScannerInput}
                    onChange={(e) => setPosScannerInput(e.target.value)}
                    placeholder="e.g. W-ROLEX-SUB, W-SEIKO-5"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleScannerSubmit();
                      }
                    }}
                  />
                  <button
                    onClick={handleScannerSubmit}
                    className="absolute right-1.5 top-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer transition-colors"
                  >
                    {lang === 'km' ? 'ស្កេន' : 'Scan'}
                  </button>
                </div>
              </div>

              {/* Quick Simulator Picker for testing */}
              <div className="space-y-2">
                <span className="block text-[10.5px] font-bold text-slate-400">
                  {lang === 'km' ? '💡 ឬជ្រើសរើសទំនិញរហ័សដើម្បីសាកល្បង៖' : '💡 Or click any product to simulate a hardware scan:'}
                </span>
                <div className="max-h-32 overflow-y-auto border border-slate-800 rounded-lg p-2 bg-slate-950/60 space-y-1 divide-y divide-slate-900">
                  {products.filter(p => p.sku).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPosScannerInput(p.sku || '');
                        setTimeout(() => {
                          // Play simulated scan beep sound!
                          try {
                            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioCtx.createOscillator();
                            const gainNode = audioCtx.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioCtx.destination);
                            oscillator.frequency.value = 1200; // Beep!
                            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                            oscillator.start();
                            oscillator.stop(audioCtx.currentTime + 0.08);
                          } catch (e) {
                            console.log('Audio Context blocked or not supported');
                          }
                          setSelectedProductId(p.id);
                          setQuantity(1);
                          setIsPOSScanning(false);
                          setPosScannerInput('');
                        }, 200);
                      }}
                      className="w-full text-left py-1 text-[11px] text-slate-300 hover:text-white flex justify-between items-center hover:bg-indigo-950/40 px-1 rounded cursor-pointer transition-all"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950/50 border border-indigo-900/40 rounded px-1.5">{p.sku}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end text-[11px] text-slate-500">
              {lang === 'km' ? 'ចុច Enter ដើម្បីបញ្ជូនទិន្នន័យស្កេន' : 'Press Enter key to simulate hardware scan trigger'}
            </div>
          </div>
        </div>
      )}

        </>
      )}

      {/* QR Code Instant Preview Modal */}
      {previewQrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <button
              type="button"
              onClick={() => setPreviewQrCode(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-base"
            >
              ✕
            </button>
            
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                {lang === 'km' ? '📱 ស្កែនទូទាត់ប្រាក់ (Scan to Pay)' : '📱 Scan QR to Pay'}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                {lang === 'km' ? 'សូមបង្ហាញកូដ QR នេះទៅកាន់អតិថិជន' : 'Please present this QR code to the customer.'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center max-w-[280px] max-h-[280px] mx-auto overflow-hidden shadow-2xs">
              {previewQrCode.startsWith('data:image/') || previewQrCode.includes('.png') || previewQrCode.includes('.jpg') || previewQrCode.includes('.jpeg') || previewQrCode.includes('.webp') ? (
                <img
                  src={previewQrCode}
                  alt="QR Code Payment"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center p-4 text-xs text-slate-600 font-mono break-all font-semibold space-y-3">
                  <div className="text-[11px] text-slate-400">🔗 Link / URL:</div>
                  <div className="bg-slate-100 p-2.5 rounded border border-slate-200 break-words text-[10px]">
                    {previewQrCode}
                  </div>
                  <div>
                    <a
                      href={previewQrCode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      {lang === 'km' ? 'បើកតំណភ្ជាប់ QR' : 'Open QR Link'}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPreviewQrCode(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {lang === 'km' ? 'បិទផ្ទាំង (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
