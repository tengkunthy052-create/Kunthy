import React, { useState, useMemo } from 'react';
import { Sale, Role } from '../types';
import { Language } from '../translations';
import { 
  Plus, Search, Calendar, User, Phone, 
  Wrench, Battery, Trash2, Receipt, 
  DollarSign, Check, Eye, X, AlertCircle, Bookmark, ShieldCheck, CreditCard
} from 'lucide-react';

interface ServiceManagerProps {
  sales: Sale[];
  currentRole: Role;
  currentUser: string;
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onDeleteSale: (id: string) => void;
  onUpdateSaleStatus: (saleId: string, newStatus: 'Paid' | 'Unpaid' | 'COD') => void;
  lang: Language;
}

export default function ServiceManager({
  sales,
  currentRole,
  currentUser,
  onAddSale,
  onDeleteSale,
  onUpdateSaleStatus,
  lang
}: ServiceManagerProps) {
  // Only display service/repair items
  const serviceSales = useMemo(() => {
    return sales.filter(s => s.isService === true);
  }, [sales]);

  // States
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'Battery' | 'Strap' | 'Repair'>('All');

  // New Service states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceType, setServiceType] = useState<'Battery' | 'Strap' | 'Repair'>('Battery');
  const [serviceNote, setServiceNote] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'ABA' | 'ACLEDA'>('Cash');
  const [warrantyPeriod, setWarrantyPeriod] = useState('None');
  const [shippingLocation, setShippingLocation] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'COD'>('Paid');
  const [deliveryCompany, setDeliveryCompany] = useState('J&T Express');

  // Print Receipt states
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Computed metrics
  const totalServicesCount = serviceSales.length;
  const totalRevenue = serviceSales
    .filter(s => !s.paymentStatus || s.paymentStatus === 'Paid')
    .reduce((acc, s) => acc + s.totalSelling, 0);
  const batteryCount = serviceSales.filter(s => s.serviceType === 'Battery').length;
  const strapCount = serviceSales.filter(s => s.serviceType === 'Strap').length;
  const repairCount = serviceSales.filter(s => s.serviceType === 'Repair').length;

  // Filtered services
  const filteredServices = useMemo(() => {
    return serviceSales.filter(s => {
      const matchSearch = 
        (s.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.customerPhone || '').includes(searchTerm) ||
        (s.serviceNote || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = selectedTypeFilter === 'All' ? true : s.serviceType === selectedTypeFilter;
      return matchSearch && matchType;
    });
  }, [serviceSales, searchTerm, selectedTypeFilter]);

  const handleResetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setServiceType('Battery');
    setServiceNote('');
    setSellingPrice(0);
    setPaymentMethod('Cash');
    setWarrantyPeriod('None');
    setShippingLocation('');
    setPaymentStatus('Paid');
    setDeliveryCompany('J&T Express');
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sellingPrice <= 0 || !customerName) {
      alert(lang === 'km' ? 'សូមបញ្ចូលឈ្មោះអតិថិជន និងតម្លៃសេវាកម្មឲ្យបានត្រឹមត្រូវ!' : 'Please enter customer name and price!');
      return;
    }

    // A service uses isService=true and a default ProductId like 'SERVICE-ITEM'
    // Cost of service is assumed 0 or extremely low (0.10) for pure profit calculation
    onAddSale({
      productName: serviceType === 'Battery' 
        ? 'សេវាប្តូរថ្មនាឡិកា (Watch Battery Replacement)' 
        : serviceType === 'Strap' 
        ? 'សេវាប្តូរខ្សែនាឡិកា (Watch Strap Replacement)' 
        : 'សេវាជួសជុលនាឡិកា (Watch Repair Service)',
      productId: 'SERVICE-ITEM',
      quantity: 1,
      sellingPrice: sellingPrice,
      totalSelling: sellingPrice,
      totalCost: 0, // pure gross service income
      date: new Date().toISOString(),
      handledBy: currentUser,
      isService: true,
      serviceType: serviceType,
      serviceNote: serviceNote,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      warrantyPeriod: warrantyPeriod !== 'None' ? warrantyPeriod : undefined,
      paymentMethod: paymentMethod,
      shippingLocation: shippingLocation.trim() || undefined,
      paymentStatus: paymentStatus,
      deliveryCompany: deliveryCompany
    });

    handleResetForm();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Repairs */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {lang === 'km' ? 'ការជួសជុលសរុប' : 'Total Services'}
            </span>
            <span className="text-xl font-black font-mono mt-1 block dark:text-white">{totalServicesCount} {lang === 'km' ? 'ដង' : 'times'}</span>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between col-span-1 sm:col-span-1 lg:col-span-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {lang === 'km' ? 'ចំណូលពីការជួសជុល/សេវាកម្ម' : 'Repair Services Revenue'}
            </span>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Battery / Strap counts */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {lang === 'km' ? 'ប្តូរថ្ម & ប្តូរខ្សែ' : 'Battery & Strap'}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1.5 block">
              🔋 {batteryCount} | 🏷️ {strapCount}
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Battery className="w-5 h-5" />
          </div>
        </div>

        {/* Complex repair count */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {lang === 'km' ? 'ជួសជុលទូទៅ' : 'Complex Repairs'}
            </span>
            <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
              {repairCount}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            🛠️ {lang === 'km' ? 'បញ្ជីសេវាកម្ម និងជួសជុលនាឡិកា (Service Records)' : 'Watch Repair & Services'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            {lang === 'km' 
              ? 'កត់ត្រា និងគ្រប់គ្រងការជួសជុលនាឡិកាដៃអតិថិជនដូចជា ប្តូរថ្ម ប្តូរខ្សែ និងជួសជុលកញ្ចក់/ម៉ាស៊ីន។' 
              : 'Add, search, track, and print receipts for customer watch repairs, batteries, strap services and warranties.'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wider rounded-xl cursor-pointer shadow-md shadow-indigo-150 flex items-center gap-1.5 transition-all shrink-0"
        >
          {showAddForm ? (
            <>✕ {lang === 'km' ? 'បិទផ្ទាំងកត់ត្រា' : 'Close'}</>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[2.5]" />
              {lang === 'km' ? 'កត់ត្រាការជួសជុលថ្មី' : 'Record Service'}
            </>
          )}
        </button>
      </div>

      {/* Record service form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-6 shadow-xl animate-fade-in space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
            <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              📝 {lang === 'km' ? 'បញ្ចូលព័ត៌មានជួសជុលនាឡិកាអតិថិជន' : 'Enter Customer Repair Details'}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            {/* Customer Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'km' ? 'ឈ្មោះអតិថិជន (Customer Name) *' : 'Customer Name *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={lang === 'km' ? 'ឈ្មោះអតិថិជន...' : 'e.g. Sok Dara'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'km' ? 'លេខទូរស័ព្ទ (Customer Phone)' : 'Customer Phone'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 092 123 456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'km' ? 'ប្រភេទសេវាកម្ម (Service Type)' : 'Service Category'}
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold cursor-pointer"
              >
                <option value="Battery">🔋 {lang === 'km' ? 'ប្តូរថ្ម (Battery Change)' : 'Battery Change'}</option>
                <option value="Strap">🏷️ {lang === 'km' ? 'ប្តូរខ្សែ (Strap / Bracelet)' : 'Strap / Bracelet'}</option>
                <option value="Repair">🛠️ {lang === 'km' ? 'ជួសជុលទូទៅ (General Repair)' : 'General Repair'}</option>
              </select>
            </div>

            {/* Price Received */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'km' ? 'តម្លៃសេវាកម្ម ($ USD) *' : 'Service Cost ($ USD) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  required
                  placeholder="e.g. 5.00"
                  value={sellingPrice === 0 ? '' : sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-extrabold text-emerald-600 dark:text-emerald-400"
                />
                <DollarSign className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold cursor-pointer"
              >
                <option value="Cash">💵 {lang === 'km' ? 'សាច់ប្រាក់សុទ្ធ (Cash)' : 'Cash'}</option>
                <option value="ABA">📱 ABA Pay (Online)</option>
                <option value="ACLEDA">📱 ACLEDA Pay (Online)</option>
              </select>
            </div>

            {/* Warranty Period */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'km' ? 'រយៈពេលធានា (Warranty Period)' : 'Warranty Period'}
              </label>
              <select
                value={warrantyPeriod}
                onChange={(e) => setWarrantyPeriod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold cursor-pointer"
              >
                <option value="None">{lang === 'km' ? 'គ្មានការធានា (No Warranty)' : 'No Warranty'}</option>
                <option value="1 Month">{lang === 'km' ? 'ធានា ១ ខែ (1 Month)' : '1 Month'}</option>
                <option value="3 Months">{lang === 'km' ? 'ធានា ៣ ខែ (3 Months)' : '3 Months'}</option>
                <option value="6 Months">{lang === 'km' ? 'ធានា ៦ ខែ (6 Months)' : '6 Months'}</option>
                <option value="1 Year">{lang === 'km' ? 'ធានា ១ ឆ្នាំ (1 Year)' : '1 Year'}</option>
              </select>
            </div>

            {/* Delivery Location */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                📍 {lang === 'km' ? 'ទីតាំងទទួល/ដឹកជញ្ជូន' : 'Location / Destination'}
              </label>
              <input
                type="text"
                value={shippingLocation}
                onChange={(e) => setShippingLocation(e.target.value)}
                placeholder={lang === 'km' ? 'វាយបញ្ចូលទីតាំង (ឧ. សែនសុខ, ខេត្តសៀមរាប...)' : 'Type destination (e.g. Siem Reap...)'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>

            {/* Delivery Company */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                📦 {lang === 'km' ? 'ក្រុមហ៊ុនដឹកជញ្ជូន' : 'Courier / Delivery Partner'}
              </label>
              <select
                value={deliveryCompany}
                onChange={(e) => setDeliveryCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold cursor-pointer"
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

            {/* Payment Status (Paid / COD) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                🚚 {lang === 'km' ? 'ស្ថានភាពទូទាត់' : 'Payment Status'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('Paid')}
                  className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'km' ? '💵 បង់រួច (Paid)' : 'Paid'}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('Unpaid')}
                  className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    paymentStatus === 'Unpaid'
                      ? 'bg-rose-500 text-white border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'km' ? '❌ មិនទាន់បង់ (Unpaid)' : 'Unpaid'}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('COD')}
                  className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    paymentStatus === 'COD'
                      ? 'bg-amber-500 text-slate-950 border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'km' ? '🚚 COD / ពេលដល់' : 'COD'}
                </button>
              </div>
            </div>

            {/* Service note / description */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'km' ? 'ការពិពណ៌នាអំពីការជួសជុល (Service Details & Fault Description)' : 'Service Details & Fault Description'}
              </label>
              <textarea
                placeholder={lang === 'km' ? 'ឧ. នាឡិកាខូចថ្ម, ប្តូរខ្សែពណ៌ខ្មៅ, ប៉ូលាកញ្ចក់...' : 'e.g. Replaced battery. Adjusted hand alignment.'}
                value={serviceNote}
                onChange={(e) => setServiceNote(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4.5 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              {lang === 'km' ? 'បដិសេធ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-md shadow-emerald-100 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {lang === 'km' ? 'រក្សាទុកការជួសជុល (Save & Record)' : 'Save & Record'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col md:flex-row items-center gap-3.5">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder={lang === 'km' ? 'ស្វែងរកតាម ឈ្មោះអតិថិជន លេខទូរស័ព្ទ ឬការពិពណ៌នា...' : 'Search customer name, phone, details...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 select-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === 'km' ? 'ប្រភេទ៖' : 'Type:'}</span>
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10.5px]">
            {(['All', 'Battery', 'Strap', 'Repair'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedTypeFilter(type)}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  selectedTypeFilter === type
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {type === 'All' 
                  ? (lang === 'km' ? 'ទាំងអស់' : 'All') 
                  : type === 'Battery' 
                  ? (lang === 'km' ? '🔋 ប្តូរថ្ម' : 'Battery') 
                  : type === 'Strap' 
                  ? (lang === 'km' ? '🏷️ ប្តូរខ្សែ' : 'Strap') 
                  : (lang === 'km' ? '🛠️ ជួសជុល' : 'Repair')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Table/List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <tr>
                <th className="px-4 py-3">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                <th className="px-4 py-3">{lang === 'km' ? 'ព័ត៌មានអតិថិជន' : 'Customer Info'}</th>
                <th className="px-4 py-3">{lang === 'km' ? 'ប្រភេទសេវា' : 'Service Type'}</th>
                <th className="px-4 py-3">{lang === 'km' ? 'ការពិពណ៌នា' : 'Fault Note'}</th>
                <th className="px-4 py-3 text-center">{lang === 'km' ? 'រយៈពេលធានា' : 'Warranty'}</th>
                <th className="px-4 py-3 text-center">{lang === 'km' ? 'ទីតាំង' : 'Location'}</th>
                <th className="px-4 py-3 text-center">{lang === 'km' ? 'ទូទាត់' : 'Payment'}</th>
                <th className="px-4 py-3 text-right">{lang === 'km' ? 'តម្លៃសរុប' : 'Price'}</th>
                <th className="px-4 py-3 text-center">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                    {lang === 'km' ? '📭 មិនមានកំណត់ត្រាជួសជុលស្វែងរកឡើយ' : 'No service records found.'}
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                      {new Date(s.date).toLocaleDateString()}
                      <span className="block text-[10px] opacity-75">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{s.customerName}</div>
                      {s.customerPhone && (
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{s.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide inline-flex items-center gap-1 ${
                        s.serviceType === 'Battery'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/45'
                          : s.serviceType === 'Strap'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/45'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/45'
                      }`}>
                        {s.serviceType === 'Battery' ? '🔋 ' : s.serviceType === 'Strap' ? '🏷️ ' : '🛠️ '}
                        {s.serviceType === 'Battery' 
                          ? (lang === 'km' ? 'ប្តូរថ្ម' : 'Battery') 
                          : s.serviceType === 'Strap' 
                          ? (lang === 'km' ? 'ប្តូរខ្សែ' : 'Strap') 
                          : (lang === 'km' ? 'ជួសជុល' : 'Repair')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={s.serviceNote}>
                        {s.serviceNote || <span className="text-slate-400 italic">{lang === 'km' ? 'គ្មាន' : 'No description'}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10.5px] font-bold ${s.warrantyPeriod && s.warrantyPeriod !== 'None' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
                        {s.warrantyPeriod && s.warrantyPeriod !== 'None' ? s.warrantyPeriod : 'None'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                        {s.shippingLocation || <span className="text-slate-400 italic font-normal">{lang === 'km' ? 'ផ្ទាល់ខ្លួន' : 'In-store / Pick'}</span>}
                      </div>
                      {s.deliveryCompany && (
                        <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5">
                          📦 {s.deliveryCompany}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const currentStatus = s.paymentStatus || 'Paid';
                          if (currentStatus === 'COD' || currentStatus === 'Unpaid') {
                            if (confirm(lang === 'km' ? 'តើអ្នកចង់សម្គាល់វិក្កយបត្រសេវាកម្មនេះថា "បានបង់រួច (Paid)" មែនទេ?' : 'Do you want to mark this service transaction as Paid?')) {
                              onUpdateSaleStatus(s.id, 'Paid');
                            }
                          } else {
                            if (confirm(lang === 'km' ? 'តើអ្នកចង់កែប្រែស្ថានភាពទូទាត់សម្រាប់សេវាកម្មនេះឡើងវិញទេ?' : 'Do you want to adjust the payment status for this service?')) {
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
                        className={`px-2 py-0.5 rounded-md text-[9.5px] font-black inline-block border transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                          (!s.paymentStatus || s.paymentStatus === 'Paid')
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-250/40'
                            : s.paymentStatus === 'COD'
                            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-250/40 animate-pulse'
                            : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-250/40'
                        }`}
                        title={(!s.paymentStatus || s.paymentStatus === 'Paid')
                          ? (lang === 'km' ? 'បានបង់រួច (ចុចដើម្បីប្តូរ)' : 'Paid (Click to change)')
                          : (lang === 'km' ? 'ចុចទីនេះដើម្បីសម្គាល់ថាបានបង់លុយរួច' : 'Click to mark as Paid')
                        }
                      >
                        {(!s.paymentStatus || s.paymentStatus === 'Paid') && (lang === 'km' ? '💵 បង់រួច' : 'Paid')}
                        {s.paymentStatus === 'Unpaid' && (lang === 'km' ? '❌ មិនទាន់បង់' : 'Unpaid')}
                        {s.paymentStatus === 'COD' && (lang === 'km' ? '🚚 COD' : 'COD')}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                      ${s.totalSelling.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveReceipt(s)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title={lang === 'km' ? 'មើលវិក្កយបត្រ / បោះពុម្ព' : 'View / Print Invoice'}
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(lang === 'km' ? `តើលោកអ្នកពិតជាចង់លុបសេវាកម្មជួសជុលរបស់ "${s.customerName}" នេះមែនទេ?` : `Are you sure you want to delete repair service for "${s.customerName}"?`)) {
                              onDeleteSale(s.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title={lang === 'km' ? 'លុបចោល' : 'Delete Record'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT / INVOICE VIEW MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 relative z-10 animate-scale-up text-slate-850">
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute right-4 top-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Printable Area */}
            <div id="repair-receipt-printable" className="font-sans py-2">
              <div className="text-center space-y-1 mb-4">
                <h3 className="text-base font-black tracking-widest text-slate-900 uppercase">KUNTHY WATCH</h3>
                <p className="text-[9px] text-slate-400 font-mono tracking-wider">REPAIR SERVICE RECEIPT</p>
                <p className="text-[10px] text-slate-500 font-medium">📍 Phnom Penh, Cambodia</p>
                <p className="text-[10px] text-slate-500 font-mono">📱 Tel: 092 123 456</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-200 py-3 text-[11px] space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'km' ? 'វិក្កយបត្រ #' : 'Invoice #'}</span>
                  <span className="font-mono text-slate-800 font-bold">{activeReceipt.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}</span>
                  <span className="text-slate-800 font-bold">{new Date(activeReceipt.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'km' ? 'អតិថិជន' : 'Customer'}</span>
                  <span className="text-slate-850 font-extrabold">{activeReceipt.customerName}</span>
                </div>
                {activeReceipt.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'km' ? 'ទូរស័ព្ទ' : 'Phone'}</span>
                    <span className="font-mono text-slate-800 font-bold">{activeReceipt.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'km' ? 'បុគ្គលិកដោះស្រាយ' : 'Handled By'}</span>
                  <span className="text-slate-800 font-bold">{activeReceipt.handledBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'km' ? 'ទីតាំង' : 'Location'}</span>
                  <span className="text-slate-800 font-bold">{activeReceipt.shippingLocation || (lang === 'km' ? 'ផ្ទាល់ខ្លួន' : 'In-store / Pick')}</span>
                </div>
                {activeReceipt.deliveryCompany && (
                  <div className="flex justify-between text-[10.5px]">
                    <span className="text-slate-400">{lang === 'km' ? 'ក្រុមហ៊ុនដឹកជញ្ជូន' : 'Courier / Delivery'}</span>
                    <span className="text-indigo-700 font-black">📦 {activeReceipt.deliveryCompany}</span>
                  </div>
                )}
              </div>

              {/* Items Details */}
              <div className="py-4 space-y-3">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                  {lang === 'km' ? 'សេចក្តីលម្អិតសេវាកម្ម' : 'Service Details'}
                </span>
                
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs font-black text-slate-800">
                    <span className="flex items-center gap-1.5">
                      {activeReceipt.serviceType === 'Battery' ? '🔋' : activeReceipt.serviceType === 'Strap' ? '🏷️' : '🛠️'}
                      {activeReceipt.serviceType === 'Battery' 
                        ? (lang === 'km' ? 'ប្តូរថ្មនាឡិកា' : 'Battery Replacement') 
                        : activeReceipt.serviceType === 'Strap' 
                        ? (lang === 'km' ? 'ប្តូរខ្សែនាឡិកា' : 'Strap Change') 
                        : (lang === 'km' ? 'ជួសជុលនាឡិកាដៃ' : 'General Watch Repair')}
                    </span>
                    <span className="font-mono font-bold">${activeReceipt.totalSelling.toFixed(2)}</span>
                  </div>
                  {activeReceipt.serviceNote && (
                    <p className="text-[10px] text-slate-500 font-medium italic pl-5 leading-relaxed">
                      "{activeReceipt.serviceNote}"
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 text-xs space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}</span>
                  <span className="text-slate-800 font-bold">{activeReceipt.paymentMethod || 'Cash'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'km' ? 'រយៈពេលធានា' : 'Warranty Period'}</span>
                  <span className="text-indigo-600 font-black">{activeReceipt.warrantyPeriod && activeReceipt.warrantyPeriod !== 'None' ? activeReceipt.warrantyPeriod : (lang === 'km' ? 'គ្មាន' : 'No Warranty')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'km' ? 'ស្ថានភាពទូទាត់' : 'Payment Status'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    activeReceipt.paymentStatus === 'COD' 
                      ? 'bg-amber-100 text-amber-800' 
                      : activeReceipt.paymentStatus === 'Unpaid'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeReceipt.paymentStatus === 'COD' 
                      ? (lang === 'km' ? 'COD / បង់ក្រោយ' : 'COD') 
                      : activeReceipt.paymentStatus === 'Unpaid'
                      ? (lang === 'km' ? 'មិនទាន់ទូទាត់' : 'Unpaid')
                      : (lang === 'km' ? 'បង់រួច' : 'Paid')}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>{lang === 'km' ? 'តម្លៃសរុប (TOTAL)' : 'TOTAL'}</span>
                  <span className="font-mono text-emerald-600 font-black">${activeReceipt.totalSelling.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-6 space-y-1 select-none">
                <p className="text-[10px] text-indigo-600 font-extrabold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === 'km' ? 'អរគុណសម្រាប់ការជ្រើសរើសយើងខ្ញុំ!' : 'Thank you for trusting Kunthy Watch!'}
                </p>
                <p className="text-[8.5px] text-slate-400">
                  {lang === 'km' ? '* សូមរក្សាទុកវិក្កយបត្រនេះសម្រាប់ការធានា' : '* Please keep this invoice for warranty service.'}
                </p>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="mt-5 flex gap-3.5 pt-4 border-t border-slate-100 select-none">
              <button
                onClick={() => setActiveReceipt(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                {lang === 'km' ? 'បិទ' : 'Close'}
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 transition-all"
              >
                <Receipt className="w-4 h-4" />
                {lang === 'km' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
