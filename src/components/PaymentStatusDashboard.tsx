import React, { useState, useMemo } from 'react';
import { Sale, Role } from '../types';
import { Language } from '../translations';
import { 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Search, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  DollarSign, 
  Filter, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

interface PaymentStatusDashboardProps {
  sales: Sale[];
  currentRole: Role;
  currentUser: string;
  onUpdateSaleStatus: (saleId: string, newStatus: 'Paid' | 'Unpaid' | 'COD') => void;
  lang: Language;
}

export default function PaymentStatusDashboard({
  sales,
  currentRole,
  currentUser,
  onUpdateSaleStatus,
  lang
}: PaymentStatusDashboardProps) {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'this_month' | 'last_30_days'>('all');
  const [activeColumnTab, setActiveColumnTab] = useState<'all' | 'Paid' | 'Unpaid' | 'COD'>('all');

  // Khmer & English Translations
  const t = {
    title: lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រងស្ថានភាពទូទាត់ និងការប្រមូលប្រាក់' : 'Payment Status & Collections Dashboard',
    subtitle: lang === 'km' ? 'តាមដាន គ្រប់គ្រង និងសម្គាល់ប្រាក់ចំណូលដែលមិនទាន់ទូទាត់ ឬ COD' : 'Track, manage, and settle outstanding incomes or COD funds.',
    
    // Stats Card
    cardPaid: lang === 'km' ? 'ទទួលបានរួចរាល់ (Paid)' : 'Total Received (Paid)',
    cardUnpaid: lang === 'km' ? 'មិនទាន់បង់ប្រាក់ (Unpaid)' : 'Outstanding (Unpaid)',
    cardCOD: lang === 'km' ? 'សេវាដឹកជញ្ជូន COD' : 'Pending COD (In-Transit)',
    cardTotalOutstanding: lang === 'km' ? 'ប្រាក់ត្រូវប្រមូលសរុប' : 'Total Outstanding Collections',
    cardCount: lang === 'km' ? 'ប្រតិបត្តិការ' : 'transactions',
    cardTotalSales: lang === 'km' ? 'លក់សរុប' : 'Grand Total Sales',

    // Search and Filters
    searchPlaceholder: lang === 'km' ? 'ស្វែងរកតាមឈ្មោះអតិថិជន លេខទូរស័ព្ទ ផលិតផល ទីតាំង...' : 'Search by customer name, phone, product, location...',
    filterAll: lang === 'km' ? 'ទាំងអស់' : 'All Time',
    filterToday: lang === 'km' ? 'ថ្ងៃនេះ' : 'Today',
    filterThisMonth: lang === 'km' ? 'ខែនេះ' : 'This Month',
    filterLast30Days: lang === 'km' ? '៣០ថ្ងៃចុងក្រោយ' : 'Last 30 Days',
    
    // Columns & Tabs
    tabAll: lang === 'km' ? 'ទាំងអស់' : 'All Payments',
    tabPaid: lang === 'km' ? '💵 បង់រួច' : 'Paid',
    tabUnpaid: lang === 'km' ? '❌ មិនទាន់បង់' : 'Unpaid',
    tabCOD: lang === 'km' ? '🚚 COD' : 'COD',

    // Table / Card Details
    saleDate: lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date',
    customer: lang === 'km' ? 'អតិថិជន' : 'Customer',
    product: lang === 'km' ? 'ទំនិញ/សេវាកម្ម' : 'Product / Service',
    amount: lang === 'km' ? 'ចំនួនទឹកប្រាក់' : 'Amount',
    courier: lang === 'km' ? 'ដឹកជញ្ជូន' : 'Courier / Delivery',
    location: lang === 'km' ? 'ទីតាំង' : 'Location',
    handledBy: lang === 'km' ? 'លក់ដោយ' : 'Handled By',
    noSales: lang === 'km' ? 'មិនមានការលក់ក្នុងលក្ខខណ្ឌនេះទេ' : 'No sale records found matching filters.',
    
    // Actions
    actionMarkPaid: lang === 'km' ? 'សម្គាល់ថា៖ បានបង់លុយរួច (Paid)' : 'Mark as Paid',
    actionChangeStatus: lang === 'km' ? 'កែប្រែស្ថានភាពទូទាត់' : 'Change Status',
    confirmSettle: lang === 'km' ? 'តើអ្នកពិតជាចង់សម្គាល់វិក្កយបត្រនេះថា "បានបង់លុយរួច (Paid)" មែនទេ? លុយនឹងចូលគណនីរបស់អ្នក។' : 'Are you sure you want to mark this transaction as Paid? The outstanding money is received.',
    confirmChange: lang === 'km' ? 'តើអ្នកចង់កែប្រែស្ថានភាពទូទាត់សម្រាប់ប្រតិបត្តិការនេះឡើងវិញទេ?' : 'Do you want to adjust the payment status for this transaction?',
    typePrompt: lang === 'km' 
      ? 'វាយបញ្ចូល៖\n1 សម្រាប់ បង់រួច (Paid)\n2 សម្រាប់ មិនទាន់បង់ (Unpaid)\n3 សម្រាប់ COD'
      : 'Type:\n1 for Paid\n2 for Unpaid\n3 for COD',
    
    // Other Label
    inStore: lang === 'km' ? 'ទិញផ្ទាល់នៅហាង' : 'In-store Pick',
    codWait: lang === 'km' ? 'កំពុងដឹកជញ្ជូន - រង់ចាំលុយចូល' : 'Delivering - Awaiting COD Settle',
    unpaidWait: lang === 'km' ? 'ជំពាក់ - មិនទាន់ទូទាត់' : 'Pending Payment / Unpaid',
    paidSuccess: lang === 'km' ? 'ប្រមូលប្រាក់រួចរាល់' : 'Fully Received & Settled',
    totalText: lang === 'km' ? 'សរុប' : 'Total'
  };

  // 1. Filter Sales by Date Range
  const dateFilteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter(sale => {
      if (dateRange === 'all') return true;
      
      const saleDate = new Date(sale.date);
      if (isNaN(saleDate.getTime())) return true; // fallback for malformed dates

      if (dateRange === 'today') {
        return saleDate.toDateString() === now.toDateString();
      }
      
      if (dateRange === 'this_month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }

      if (dateRange === 'last_30_days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return saleDate >= thirtyDaysAgo;
      }

      return true;
    });
  }, [sales, dateRange]);

  // 2. Filter by Search Term
  const searchedSales = useMemo(() => {
    return dateFilteredSales.filter(sale => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = (sale.productName || '').toLowerCase();
      const custName = (sale.customerName || '').toLowerCase();
      const custPhone = (sale.customerPhone || '').toLowerCase();
      const location = (sale.shippingLocation || '').toLowerCase();
      const courier = (sale.deliveryCompany || '').toLowerCase();
      const handled = (sale.handledBy || '').toLowerCase();

      return name.includes(term) || 
             custName.includes(term) || 
             custPhone.includes(term) || 
             location.includes(term) || 
             courier.includes(term) ||
             handled.includes(term);
    });
  }, [dateFilteredSales, searchTerm]);

  // 3. Category Group Summaries
  const stats = useMemo(() => {
    let paidTotal = 0;
    let paidCount = 0;
    let unpaidTotal = 0;
    let unpaidCount = 0;
    let codTotal = 0;
    let codCount = 0;

    searchedSales.forEach(sale => {
      const status = sale.paymentStatus || 'Paid'; // Default to Paid if not defined
      const amount = sale.totalSelling || 0;

      if (status === 'Paid') {
        paidTotal += amount;
        paidCount++;
      } else if (status === 'Unpaid') {
        unpaidTotal += amount;
        unpaidCount++;
      } else if (status === 'COD') {
        codTotal += amount;
        codCount++;
      }
    });

    return {
      paid: { total: paidTotal, count: paidCount },
      unpaid: { total: unpaidTotal, count: unpaidCount },
      cod: { total: codTotal, count: codCount },
      outstanding: { total: unpaidTotal + codTotal, count: unpaidCount + codCount },
      all: { total: paidTotal + unpaidTotal + codTotal, count: searchedSales.length }
    };
  }, [searchedSales]);

  // Action: Settle Payment easily
  const handleQuickSettle = (saleId: string) => {
    if (confirm(t.confirmSettle)) {
      onUpdateSaleStatus(saleId, 'Paid');
    }
  };

  // Action: Custom adjust status
  const handleCustomSettle = (saleId: string) => {
    if (confirm(t.confirmChange)) {
      const opt = prompt(t.typePrompt, '1');
      if (opt === '1') onUpdateSaleStatus(saleId, 'Paid');
      else if (opt === '2') onUpdateSaleStatus(saleId, 'Unpaid');
      else if (opt === '3') onUpdateSaleStatus(saleId, 'COD');
    }
  };

  // Grouped Lists
  const paidSalesList = useMemo(() => searchedSales.filter(s => (!s.paymentStatus || s.paymentStatus === 'Paid')), [searchedSales]);
  const unpaidSalesList = useMemo(() => searchedSales.filter(s => s.paymentStatus === 'Unpaid'), [searchedSales]);
  const codSalesList = useMemo(() => searchedSales.filter(s => s.paymentStatus === 'COD'), [searchedSales]);

  return (
    <div className="space-y-6" id="payment-status-dashboard">
      {/* Upper Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/65 backdrop-blur-md shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
              <Receipt className="w-5 h-5" />
            </span>
            {t.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{t.subtitle}</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Period'}:
          </span>
          <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex gap-1">
            {(['all', 'today', 'this_month', 'last_30_days'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  dateRange === range
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {range === 'all' && t.filterAll}
                {range === 'today' && t.filterToday}
                {range === 'this_month' && t.filterThisMonth}
                {range === 'last_30_days' && t.filterLast30Days}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Summaries (Total cards for each category) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: PAID */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800/60 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t.cardPaid}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">${stats.paid.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-850 flex justify-between text-[10px] text-slate-500">
            <span className="font-semibold">{stats.paid.count} {t.cardCount}</span>
            <span className="text-emerald-600 font-bold">{t.paidSuccess}</span>
          </div>
        </div>

        {/* CARD 2: UNPAID */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-800/60 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t.cardUnpaid}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">${stats.unpaid.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
              <XCircle className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-850 flex justify-between text-[10px] text-slate-500">
            <span className="font-semibold">{stats.unpaid.count} {t.cardCount}</span>
            <span className="text-rose-600 font-bold flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> {t.unpaidWait}
            </span>
          </div>
        </div>

        {/* CARD 3: COD */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-800/60 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-pulse"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{t.cardCOD}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">${stats.cod.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Truck className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-850 flex justify-between text-[10px] text-slate-500">
            <span className="font-semibold">{stats.cod.count} {t.cardCount}</span>
            <span className="text-amber-600 font-bold">{t.codWait}</span>
          </div>
        </div>

        {/* CARD 4: OUTSTANDING SUM (Unpaid + COD) */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800/60 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">{t.cardTotalOutstanding}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">${stats.outstanding.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
              <DollarSign className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex justify-between text-[10px] text-slate-500 font-bold">
            <span>{stats.outstanding.count} {t.cardCount}</span>
            <span className="text-slate-400 font-normal">
              {t.cardTotalSales}: <span className="font-black text-slate-700 dark:text-slate-300 font-mono">${stats.all.total.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Row / Search Input */}
      <div className="bg-white/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/65 backdrop-blur-md flex flex-col md:flex-row gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Mobile/Layout switch Column Tab buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60 gap-1 shrink-0 self-start md:self-auto overflow-x-auto max-w-full">
          {(['all', 'Paid', 'Unpaid', 'COD'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveColumnTab(tab)}
              className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeColumnTab === tab
                  ? tab === 'Paid'
                    ? 'bg-emerald-500 text-white'
                    : tab === 'Unpaid'
                    ? 'bg-rose-500 text-white'
                    : tab === 'COD'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-indigo-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900/50'
              }`}
            >
              {tab === 'all' && `${t.tabAll} (${searchedSales.length})`}
              {tab === 'Paid' && `${t.tabPaid} (${paidSalesList.length})`}
              {tab === 'Unpaid' && `${t.tabUnpaid} (${unpaidSalesList.length})`}
              {tab === 'COD' && `${t.tabCOD} (${codSalesList.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Kanban / Dashboard Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: UNPAID (Outstanding) - Higher attention */}
        {(activeColumnTab === 'all' || activeColumnTab === 'Unpaid') && (
          <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-200/50 dark:border-rose-900/30 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <h3 className="font-black text-sm text-slate-850 dark:text-slate-200">{t.tabUnpaid}</h3>
              </div>
              <div className="font-mono text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-md border border-rose-200/40">
                ${stats.unpaid.total.toFixed(2)}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {unpaidSalesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-slate-350 dark:text-slate-650 text-2xl font-bold">✔</span>
                  <p className="text-[11px] text-slate-400 mt-1 font-bold">{lang === 'km' ? 'គ្មានវិក្កយបត្រជំពាក់ឡើយ' : 'No unpaid transactions.'}</p>
                </div>
              ) : (
                unpaidSalesList.map((sale) => (
                  <SaleCard 
                    key={sale.id}
                    sale={sale}
                    lang={lang}
                    t={t}
                    onSettle={handleQuickSettle}
                    onChangeStatus={handleCustomSettle}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* COLUMN 2: COD (In-Transit) */}
        {(activeColumnTab === 'all' || activeColumnTab === 'COD') && (
          <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 dark:border-amber-900/30 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h3 className="font-black text-sm text-slate-850 dark:text-slate-200">{t.tabCOD}</h3>
              </div>
              <div className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-200/45">
                ${stats.cod.total.toFixed(2)}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {codSalesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-slate-350 dark:text-slate-650 text-2xl font-bold">🚚</span>
                  <p className="text-[11px] text-slate-400 mt-1 font-bold">{lang === 'km' ? 'គ្មានវិក្កយបត្រ COD ឡើយ' : 'No pending COD transactions.'}</p>
                </div>
              ) : (
                codSalesList.map((sale) => (
                  <SaleCard 
                    key={sale.id}
                    sale={sale}
                    lang={lang}
                    t={t}
                    onSettle={handleQuickSettle}
                    onChangeStatus={handleCustomSettle}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* COLUMN 3: PAID (Settled) */}
        {(activeColumnTab === 'all' || activeColumnTab === 'Paid') && (
          <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/50 dark:border-emerald-900/30 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-black text-sm text-slate-850 dark:text-slate-200">{t.tabPaid}</h3>
              </div>
              <div className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200/40">
                ${stats.paid.total.toFixed(2)}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {paidSalesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-slate-350 dark:text-slate-650 text-2xl font-bold">📋</span>
                  <p className="text-[11px] text-slate-400 mt-1 font-bold">{t.noSales}</p>
                </div>
              ) : (
                paidSalesList.map((sale) => (
                  <SaleCard 
                    key={sale.id}
                    sale={sale}
                    lang={lang}
                    t={t}
                    onSettle={handleQuickSettle}
                    onChangeStatus={handleCustomSettle}
                  />
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Single Sale Card component for neat clean layout inside Kanban lists
function SaleCard({ 
  sale, 
  lang, 
  t, 
  onSettle, 
  onChangeStatus 
}: { 
  key?: string;
  sale: Sale; 
  lang: Language; 
  t: any;
  onSettle: (id: string) => void;
  onChangeStatus: (id: string) => void;
}) {
  const isPending = sale.paymentStatus === 'COD' || sale.paymentStatus === 'Unpaid';
  const displayDate = useMemo(() => {
    try {
      const d = new Date(sale.date);
      if (isNaN(d.getTime())) return sale.date;
      return d.toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return sale.date;
    }
  }, [sale.date, lang]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/70 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all relative group">
      {/* Upper line: Customer & Date */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="space-y-0.5">
          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            {sale.customerName ? sale.customerName : <span className="text-slate-400 italic font-normal">{lang === 'km' ? 'អតិថិជនទូទៅ' : 'Walk-in Customer'}</span>}
          </div>
          {sale.customerPhone && (
            <div className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              {sale.customerPhone}
            </div>
          )}
        </div>
        <div className="text-[9px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850 shrink-0">
          {displayDate}
        </div>
      </div>

      {/* Main product and pricing */}
      <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-900/60 mb-2.5">
        <div className="flex justify-between items-center gap-1.5">
          <div className="text-[11px] font-black text-slate-850 dark:text-slate-100 truncate flex-1">
            {sale.productName}
            {sale.isService && <span className="ml-1 text-[8px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-1 rounded font-black uppercase">Service</span>}
          </div>
          <div className="text-[10px] font-bold text-slate-500 shrink-0">
            x{sale.quantity}
          </div>
        </div>
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-200/40 dark:border-slate-850/40">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.amount}</span>
          <span className="text-sm font-extrabold text-slate-850 dark:text-slate-100 font-mono">
            ${(sale.totalSelling || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Delivery / Channel Location detail */}
      {(sale.shippingLocation || sale.deliveryCompany || sale.saleChannel) && (
        <div className="grid grid-cols-1 gap-1 text-[9.5px] border-t border-slate-100 dark:border-slate-850 pt-2 mb-2.5">
          {sale.shippingLocation && (
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{sale.shippingLocation}</span>
            </div>
          )}
          {sale.deliveryCompany && (
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold">
              <Truck className="w-3 h-3 shrink-0" />
              <span className="truncate">{sale.deliveryCompany}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer: Handled by, and settling buttons */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-850/60 pt-2">
        <span className="text-[8.5px] text-slate-400 font-bold block">
          👤 {sale.handledBy || 'Unknown'}
        </span>

        {/* Interactive buttons */}
        <div className="flex items-center gap-1">
          {isPending ? (
            <>
              {/* Change status option dropdown-like click */}
              <button
                type="button"
                onClick={() => onChangeStatus(sale.id)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 rounded border border-slate-200/50 dark:border-slate-800 cursor-pointer text-[9px] font-bold"
                title={t.actionChangeStatus}
              >
                ⚙
              </button>
              {/* Quick settle button */}
              <button
                type="button"
                onClick={() => onSettle(sale.id)}
                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-extrabold text-[9px] rounded-md shadow-xs cursor-pointer flex items-center gap-0.5"
              >
                💵 {t.actionMarkPaid}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onChangeStatus(sale.id)}
              className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-[8.5px] text-slate-450 dark:text-slate-500 rounded font-black hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
            >
              🔄 {lang === 'km' ? 'កែស្ថានភាព' : 'Change'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
