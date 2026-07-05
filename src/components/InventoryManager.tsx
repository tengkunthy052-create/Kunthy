import React, { useState } from 'react';
import { Product, Role, StockCountSession, StockCountItem } from '../types';
import { translations, Language } from '../translations';
import { Package, Plus, Trash2, Edit3, ShieldAlert, BadgeCheck, Search, HelpCircle, Coins, Layers, FolderIcon, X, ClipboardCheck, History, ScanBarcode, QrCode, Printer } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  currentRole: Role;
  currentUser: string;
  onAddProduct: (prod: { name: string; sku: string; category: string; stock: number; purchasePrice: number; sellingPrice: number; stockType?: 'new' | 'old'; color?: string; colorStocks?: Record<string, number> }) => void;
  onEditProduct: (id: string, updatedFields: Partial<Product>) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onDeleteProduct: (id: string) => void;
  lang: Language;
  onSaveStockCount?: (items: StockCountItem[], notes: string) => void;
  stockCounts?: StockCountSession[];
  exchangeRate?: number;
}

export default function InventoryManager({
  products,
  currentRole,
  currentUser,
  onAddProduct,
  onEditProduct,
  onUpdateStock,
  onDeleteProduct,
  lang,
  onSaveStockCount,
  stockCounts = [],
  exchangeRate = 4100,
}: InventoryManagerProps) {
  const t = translations[lang];
  const hasFullOwnerAccess = true;

  // Capital/Cost summaries of current inventory
  const totalStockCapital = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const oldStockCapital = products.reduce((acc, p) => acc + (p.stockType === 'old' ? p.stock * p.purchasePrice : 0), 0);
  const newStockCapital = products.reduce((acc, p) => acc + (p.stockType === 'old' ? 0 : p.stock * p.purchasePrice), 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('នាឡិកាដៃ ប្រភេទថ្ម (Quartz)');
  const [stock, setStock] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stockType, setStockType] = useState<'new' | 'old'>('new');
  const [color, setColor] = useState('');

  // Structured Color Stocks States
  const [colorStocksList, setColorStocksList] = useState<{ color: string; stock: number }[]>([]);
  const [newColorInput, setNewColorInput] = useState('');
  const [newColorStockInput, setNewColorStockInput] = useState(1);

  // Stock count states
  const [showStockTake, setShowStockTake] = useState(false);
  const [stockTakeValues, setStockTakeValues] = useState<{ [id: string]: number }>({});
  const [stockTakeNotes, setStockTakeNotes] = useState('');
  const [showStockHistory, setShowStockHistory] = useState(false);

  // Barcode / Scanner States
  const [activeBarcodeProduct, setActiveBarcodeProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInput, setScannerInput] = useState('');

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000Hz beep sound
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("AudioContext beep failed:", e);
    }
  };

  const handleScannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerInput.trim()) return;
    const found = products.find(p => p.sku.toLowerCase() === scannerInput.trim().toLowerCase());
    if (found) {
      playBeep();
      setSearchTerm(found.sku);
      setIsScanning(false);
      setScannerInput('');
    } else {
      alert(lang === 'km' ? 'រកមិនឃើញផលិតផលដែលមានកូដ SKU នេះទេ!' : 'No product found with this SKU code!');
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.color && p.color.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pre-seeded standard categories merged with any custom ones in the database
  const defaultCategories = [
    'All',
    'នាឡិកាដៃ ប្រភេទថ្ម (Quartz)',
    'នាឡិកាដៃ Automatic (Automatic)',
    'នាឡិកាដៃកីឡា (Sports Watch)',
    'នាឡិកាដៃ Smart Watch (Smart Watch)',
    'ផ្សេងៗ (Others)'
  ];
  const categories = Array.from(new Set([...defaultCategories, ...products.map((p) => p.category)]));

  const handleStartEdit = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setStock(p.stock);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setStockType(p.stockType || 'new');
    setColor(p.color || '');
    if (p.colorStocks) {
      setColorStocksList(Object.entries(p.colorStocks).map(([c, s]) => ({ color: c, stock: s })));
    } else {
      setColorStocksList([]);
    }
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setName('');
    setSku('');
    setCategory('នាឡិកាដៃ ប្រភេទថ្ម (Quartz)');
    setStock(1);
    setPurchasePrice(0);
    setSellingPrice(0);
    setStockType('new');
    setColor('');
    setColorStocksList([]);
    setNewColorInput('');
    setNewColorStockInput(1);
    setEditingProductId(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || sellingPrice <= 0) return;

    let finalColorStocks: Record<string, number> | undefined = undefined;
    let finalStock = stock;
    let finalColor = color;

    if (colorStocksList.length > 0) {
      finalColorStocks = {};
      colorStocksList.forEach((item) => {
        finalColorStocks![item.color.trim()] = item.stock;
      });
      finalStock = colorStocksList.reduce((sum, item) => sum + item.stock, 0);
      finalColor = colorStocksList.map(item => item.color.trim()).join(', ');
    }
    
    if (editingProductId) {
      // Edit Product Mode
      onEditProduct(editingProductId, {
        name,
        sku,
        category,
        stock: finalStock,
        purchasePrice: hasFullOwnerAccess ? purchasePrice : undefined, // Only Owners can modify the Cost Price
        sellingPrice,
        stockType,
        color: finalColor,
        colorStocks: finalColorStocks || null as any, // set to null or delete if empty
      });
    } else {
      // Add Product Mode
      onAddProduct({
        name,
        sku,
        category,
        stock: finalStock,
        purchasePrice: purchasePrice || sellingPrice * 0.7, // Auto estimation
        sellingPrice,
        stockType,
        color: finalColor,
        colorStocks: finalColorStocks,
      });
    }

    // Reset Form
    handleCancelForm();
  };

  const handleStartStockTake = () => {
    const initialValues: { [id: string]: number } = {};
    products.forEach((p) => {
      initialValues[p.id] = p.stock;
    });
    setStockTakeValues(initialValues);
    setStockTakeNotes('');
    setShowStockTake(true);
  };

  const handleSaveStockTakeSubmit = () => {
    if (!onSaveStockCount) return;

    const items: StockCountItem[] = products.map((p) => {
      const physicalStock = stockTakeValues[p.id] !== undefined ? stockTakeValues[p.id] : p.stock;
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        systemStock: p.stock,
        physicalStock,
        variance: physicalStock - p.stock,
      };
    });

    onSaveStockCount(items, stockTakeNotes);
    setShowStockTake(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            {t.invTitle}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {t.invDesc}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {hasFullOwnerAccess && products.some(p => p.stock > 0) && (
            <button
              onClick={async () => {
                const message = lang === 'km' 
                  ? '🚨 ប្រយ័ត្ន៖ តើអ្នកពិតជាចង់សម្អាតស្តុកទំនិញទាំងអស់ ( reset ទៅ ០ ) មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានឡើយ!'
                  : '🚨 WARNING: Are you sure you want to clear ALL products\' stock levels to 0? This action cannot be undone!';
                if (confirm(message)) {
                  for (const p of products) {
                    if (p.stock > 0) {
                      await onUpdateStock(p.id, 0);
                    }
                  }
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer animate-fade-in"
              title={lang === 'km' ? 'សម្អាតស្តុកទាំងអស់ទៅជាសូន្យ' : 'Reset all stocks to zero'}
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              {lang === 'km' ? 'សម្អាតស្តុកទាំងអស់ (Clear All)' : 'Clear All Stocks'}
            </button>
          )}

          <button
            onClick={handleStartStockTake}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer animate-fade-in"
            title={lang === 'km' ? 'ចាប់ផ្ដើមរាប់ស្ដុកជាក់ស្ដែងប្រចាំខែ' : 'Start physical stock counting session'}
          >
            <ClipboardCheck className="w-4 h-4 text-amber-600" />
            {lang === 'km' ? '📝 រាប់ស្ដុកប្រចាំខែ' : '📝 Stock Count'}
          </button>

          {stockCounts.length > 0 && (
            <button
              onClick={() => setShowStockHistory(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer animate-fade-in"
              title={lang === 'km' ? 'មើលប្រវត្តិនៃការចុះបញ្ជីរាប់ស្តុកចាស់ៗ' : 'View past stock counting history logs'}
            >
              <History className="w-4 h-4 text-slate-500" />
              {lang === 'km' ? '📜 ប្រវត្តិនៃការរាប់ស្ដុក' : '📜 History'}
            </button>
          )}

          <button
            onClick={() => {
              if (showAddForm) {
                handleCancelForm();
              } else {
                setShowAddForm(true);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer animate-fade-in"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? t.closeFormBtn : t.addProductBtn}
          </button>
        </div>
      </div>



      {/* Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
            {editingProductId ? t.formEditTitle : t.formAddTitle}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.prodName}</label>
              <input
                type="text"
                required
                placeholder="eg. Rolex Submariner Date"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.prodSku}</label>
              <input
                type="text"
                required
                placeholder="eg. RX-SUB-M1"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.prodCategory}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="នាឡិកាដៃ ប្រភេទថ្ម (Quartz)">នាឡិកាដៃ ប្រភេទថ្ម (Quartz)</option>
                <option value="នាឡិកាដៃ Automatic (Automatic)">នាឡិកាដៃ Automatic (Automatic)</option>
                <option value="នាឡិកាដៃកីឡា (Sports Watch)">នាឡិកាដៃកីឡា (Sports Watch)</option>
                <option value="នាឡិកាដៃ Smart Watch (Smart Watch)">នាឡិកាដៃ Smart Watch (Smart Watch)</option>
                <option value="ផ្សេងៗ (Others)">ផ្សេងៗ (Others)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {editingProductId ? t.prodStockAdjust : t.prodStock}
              </label>
              <input
                type="number"
                min="0"
                disabled={colorStocksList.length > 0}
                value={colorStocksList.length > 0 ? colorStocksList.reduce((sum, item) => sum + item.stock, 0) : stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full bg-white disabled:bg-slate-50 disabled:text-slate-500 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t.prodCost}
                {!hasFullOwnerAccess && <span className="text-amber-500 ml-1">{t.prodCostAdmin}</span>}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={!hasFullOwnerAccess}
                placeholder={!hasFullOwnerAccess ? "$*.**" : "eg. 250.00"}
                value={purchasePrice === 0 ? '' : purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.prodRetail}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="eg. 350.00"
                value={sellingPrice === 0 ? '' : sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {lang === 'km' ? 'ប្រភេទស្តុក (Stock Class)' : 'Stock Classification'}
              </label>
              <select
                value={stockType}
                onChange={(e) => setStockType(e.target.value as 'new' | 'old')}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-extrabold cursor-pointer"
              >
                <option value="new" className="text-emerald-600 font-bold">
                  {lang === 'km' ? '✨ ស្តុកថ្មី (New Stock)' : '✨ New Stock'}
                </option>
                <option value="old" className="text-amber-600 font-bold">
                  {lang === 'km' ? '📦 ស្តុកចាស់ (Old Stock)' : '📦 Old Stock'}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {lang === 'km' ? 'ពណ៌ (Color)' : 'Product Color'}
              </label>
              <input
                type="text"
                disabled={colorStocksList.length > 0}
                value={colorStocksList.length > 0 ? colorStocksList.map(item => item.color).join(', ') : color}
                onChange={(e) => setColor(e.target.value)}
                placeholder={lang === 'km' ? 'ឧ. ខ្មៅ, ស, ទឹកមាស...' : 'e.g. Black, Rose Gold, White'}
                className="w-full bg-white disabled:bg-slate-50 disabled:text-slate-500 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            
            {/* INLINE COLOR STOCKS MANAGER */}
            <div className="md:col-span-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 mt-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                🎨 {lang === 'km' ? 'ការបែងចែកស្តុកតាមពណ៌ (Color-Specific Stocks)' : 'Manage Stocks per Color'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                {lang === 'km' 
                  ? 'ប្រសិនបើនាឡិកាម៉ូដែលនេះមានច្រើនពណ៌ និងស្តុកផ្សេងគ្នា សូមបញ្ចូលពណ៌ និងចំនួនរបស់វាខាងក្រោម។ ស្តុកសរុបនឹងត្រូវគណនាស្វ័យប្រវត្តិតាមពណ៌នីមួយៗ។' 
                  : 'If this watch model has multiple colors with different stock levels, enter them here. Total stock will be auto-calculated.'}
              </p>

              {/* Existing items list */}
              {colorStocksList.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  {colorStocksList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span>{item.color}:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setColorStocksList(prev => prev.map((c, i) => i === idx ? { ...c, stock: val } : c));
                        }}
                        className="w-12 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-1 py-0.5 text-center font-bold text-[11px] font-mono text-indigo-600 dark:text-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setColorStocksList(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-rose-500 hover:text-rose-700 font-bold ml-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-0.5 rounded cursor-pointer"
                        title={lang === 'km' ? 'លុបពណ៌នេះ' : 'Delete this color'}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add form */}
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  placeholder={lang === 'km' ? 'ឈ្មោះពណ៌ (ឧ. ពណ៌ខ្មៅ)...' : 'Color name (e.g. Black)...'}
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Stock"
                  value={newColorStockInput}
                  onChange={(e) => setNewColorStockInput(parseInt(e.target.value) || 1)}
                  className="w-20 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 text-center font-bold focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cleanColor = newColorInput.trim();
                    if (!cleanColor) return;
                    if (colorStocksList.some(item => item.color.toLowerCase() === cleanColor.toLowerCase())) {
                      alert(lang === 'km' ? 'ពណ៌នេះមានរួចហើយ!' : 'This color is already in the list!');
                      return;
                    }
                    setColorStocksList(prev => [...prev, { color: cleanColor, stock: newColorStockInput }]);
                    setNewColorInput('');
                    setNewColorStockInput(1);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  {lang === 'km' ? '➕ បន្ថែមពណ៌' : '➕ Add Color'}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-3.5 py-1.5 text-xs text-slate-500 rounded border border-slate-300 hover:bg-slate-100 focus:outline-none transition-colors cursor-pointer"
            >
              {t.cancelProductBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 focus:outline-none shadow-xs transition-colors cursor-pointer"
            >
              {t.saveProductBtn}
            </button>
          </div>
        </form>
      )}

      {showStockTake ? (
        <div className="bg-amber-50/50 border-2 border-amber-200/60 rounded-xl p-6 mb-6 mt-2 font-sans animate-fade-in">
          <div className="flex items-center justify-between border-b border-amber-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-amber-900">
                  {lang === 'km' ? '📝 បញ្ជីរាប់ស្តុកជាក់ស្តែងប្រចាំខែ' : '📝 Monthly Physical Stock Count Worksheet'}
                </h4>
                <p className="text-amber-700 text-xs mt-0.5 font-medium">
                  {lang === 'km' 
                    ? 'សូមបញ្ចូលចំនួនទំនិញជាក់ស្តែងនៅក្នុងដៃ ដើម្បីសម្របសម្រួលស្តុកប្រព័ន្ធទៅជាស្តុកពិតប្រាកដ។' 
                    : 'Please enter actual counts for each product. System stock levels will be updated on submission.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowStockTake(false)}
              className="p-1.5 px-3 bg-white text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            >
              {lang === 'km' ? 'បិទ / បោះបង់' : 'Cancel'}
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs max-h-[450px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">{lang === 'km' ? 'កូដទំនិញ (SKU)' : 'SKU'}</th>
                  <th className="px-4 py-3">{lang === 'km' ? 'ឈ្មោះទំនិញ' : 'Product Name'}</th>
                  <th className="px-4 py-3 text-center">{lang === 'km' ? 'ស្តុកក្នុងប្រព័ន្ធ' : 'System Stock'}</th>
                  <th className="px-4 py-3 text-center w-36">{lang === 'km' ? 'ស្តុកជាក់ស្តែង' : 'Physical Stock'}</th>
                  <th className="px-4 py-3 text-center">{lang === 'km' ? 'ខុសគ្នា (Variance)' : 'Variance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {products.map((p) => {
                  const val = stockTakeValues[p.id] !== undefined ? stockTakeValues[p.id] : p.stock;
                  const variance = val - p.stock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.sku}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        {p.color && <div className="text-[10px] text-slate-400 font-medium">ពណ៌: {p.color}</div>}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-600">{p.stock}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setStockTakeValues(prev => ({ ...prev, [p.id]: Math.max(0, val - 1) }))}
                            className="w-6 h-6 border border-slate-300 rounded hover:bg-slate-100 flex items-center justify-center font-bold font-mono text-slate-600 cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={val}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              setStockTakeValues(prev => ({ ...prev, [p.id]: v }));
                            }}
                            className="w-14 border border-slate-300 rounded px-1.5 py-1 text-center font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => setStockTakeValues(prev => ({ ...prev, [p.id]: val + 1 }))}
                            className="w-6 h-6 border border-slate-300 rounded hover:bg-slate-100 flex items-center justify-center font-bold font-mono text-slate-600 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {variance === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                            ✓ {lang === 'km' ? 'ត្រឹមត្រូវ' : 'Correct'}
                          </span>
                        ) : variance > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                            +{variance} {lang === 'km' ? 'លើស' : 'Surplus'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-100">
                            {variance} {lang === 'km' ? 'ខ្វះ' : 'Shortage'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
              {lang === 'km' ? 'ចំណាំបន្ថែមលើលទ្ធផលរាប់ស្តុក (Notes)' : 'Optional notes / remarks'}
            </label>
            <textarea
              value={stockTakeNotes}
              onChange={(e) => setStockTakeNotes(e.target.value)}
              placeholder={lang === 'km' ? 'ឧ. បានធ្វើការរាប់ទំនិញជាក់ស្តែងចុងខែមុនលក់...' : 'e.g., Monthly reconciliation complete...'}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium font-sans"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-amber-200">
            <button
              type="button"
              onClick={() => setShowStockTake(false)}
              className="px-4 py-2 text-xs text-slate-500 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer font-semibold"
            >
              {lang === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => {
                const countModifications = Object.keys(stockTakeValues).filter(k => {
                  const orig = products.find(p => p.id === k)?.stock ?? 0;
                  return stockTakeValues[k] !== orig;
                }).length;
                
                const confirmationMsg = lang === 'km'
                  ? `🚨 តើអ្នកពិតជាចង់សម្របសម្រួលស្តុកមែនទេ? មានទំនិញចំនួន ${countModifications} មុខត្រូវបានកែសម្រួលស្តុក។ សកម្មភាពនេះនឹងធ្វើបច្ចុប្បន្នភាពស្តុកក្នុងប្រព័ន្ធភ្លាមៗ!`
                  : `Are you sure you want to save this stock take? ${countModifications} products will have their stock levels adjusted immediately.`;
                
                if (confirm(confirmationMsg)) {
                  handleSaveStockTakeSubmit();
                }
              }}
              className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {lang === 'km' ? 'យល់ព្រមបន្ស៊ីស្ដុក' : 'Submit Reconciliation'}
            </button>
          </div>
        </div>
      ) : showStockHistory ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6 mt-2 font-sans animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500 text-white rounded-lg shadow-xs">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800 font-sans">
                  {lang === 'km' ? '📜 ប្រវត្តិនៃការសម្របសម្រួលស្តុកប្រចាំខែ' : '📜 Monthly Stock Reconciliation Log History'}
                </h4>
                <p className="text-slate-500 text-xs mt-0.5 font-medium font-sans">
                  {lang === 'km' ? 'ប្រវត្តិនៃការចុះបញ្ជីរាប់ស្តុកជាក់ស្តែងរបស់ហាង។' : 'Historical records of all physical stock count reconciliation operations.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowStockHistory(false)}
              className="p-1.5 px-3 bg-white text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            >
              {lang === 'km' ? 'ត្រឡប់ថយក្រោយ' : 'Go Back'}
            </button>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {stockCounts.map((session) => (
              <div key={session.id} className="bg-white border border-slate-250 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold font-mono rounded px-2 py-0.5">
                      {session.id}
                    </span>
                    <span className="text-xs font-bold text-slate-700 ml-2 font-sans">
                      {new Date(session.date).toLocaleString(lang === 'km' ? 'km-KH' : 'en-US')}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 font-sans">
                    {lang === 'km' ? 'រាប់ដោយ៖' : 'Counted by:'} <span className="font-bold text-slate-800">{session.countedBy}</span>
                  </div>
                </div>

                {session.notes && (
                  <div className="mb-3 p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg text-xs text-amber-800 font-medium font-sans">
                    <span className="font-bold text-amber-900">{lang === 'km' ? 'កំណត់ចំណាំ៖' : 'Notes:'}</span> {session.notes}
                  </div>
                )}

                <div className="text-xs font-bold text-slate-600 mb-1.5 font-sans">{lang === 'km' ? 'ទំនិញដែលបានត្រួតពិនិត្យ៖' : 'Products Audited:'}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                  {session.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100/50 transition-all">
                      <div className="font-semibold text-slate-800 truncate pr-2 max-w-[200px]">
                        {item.productName} <span className="font-mono text-[9px] text-slate-400">({item.sku})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500" title="System Stock">{item.systemStock}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-slate-900" title="Physical Stock">{item.physicalStock}</span>
                        <span>
                          {item.variance === 0 ? (
                            <span className="text-slate-400 font-bold" title="Correct">✓</span>
                          ) : item.variance > 0 ? (
                            <span className="text-emerald-600 font-bold" title="Surplus">+{item.variance}</span>
                          ) : (
                            <span className="text-rose-600 font-bold" title="Shortage">{item.variance}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Filter and Search controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsScanning(true)}
                className="px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400 rounded-lg flex items-center gap-1.5 text-xs transition-colors cursor-pointer font-semibold"
                title={lang === 'km' ? 'ស្កេនបាកូដ/QR' : 'Scan Barcode/QR'}
              >
                <ScanBarcode className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'km' ? 'ស្កេន' : 'Scan'}</span>
              </button>
            </div>

            {/* Categories filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {categories.map((cat) => {
                const count = cat === 'All' 
                  ? products.length 
                  : products.filter((p) => p.category === cat).length;
                
                // Localize category labels appropriately
                let displayName = '';
                if (cat === 'All') {
                  displayName = t.allCategories;
                } else {
                  if (lang === 'en') {
                    const match = cat.match(/\(([^)]+)\)/);
                    displayName = match ? match[1] : cat;
                  } else {
                    displayName = cat.split(' (')[0] || cat;
                  }
                }

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{displayName}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      selectedCategory === cat 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

      {/* Dynamic Filter Results Summary Banner */}
      {(searchTerm || selectedCategory !== 'All') && (
        <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-semibold mb-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/40 px-3 py-2 rounded-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {lang === 'km' 
                ? `រកឃើញទំនិញ ${filteredProducts.length} ក្នុងចំណោម ${products.length} សរុប (តម្រង៖ "${searchTerm || (selectedCategory === 'All' ? t.allCategories : selectedCategory.split(' (')[0])}")`
                : `Matched ${filteredProducts.length} of ${products.length} total products (filter: "${searchTerm || (selectedCategory === 'All' ? t.allCategories : (selectedCategory.match(/\(([^)]+)\)/)?.[1] || selectedCategory))}")`
              }
            </span>
          </div>
          <button 
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-bold focus:outline-none cursor-pointer"
          >
            {lang === 'km' ? 'សម្អាតការតម្រងទាំងអស់' : 'Reset Filters'}
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">{t.colSku}</th>
              <th className="px-4 py-3">{t.colProdName}</th>
              <th className="px-4 py-3">{t.colCategory}</th>
              <th className="px-4 py-3 text-center">{t.colStock}</th>
              <th className="px-4 py-3 text-right">
                {t.colCost}
                <span className="block text-[8px] text-slate-400 normal-case font-normal">(Owner Exclusive)</span>
              </th>
              <th className="px-4 py-3 text-right">{t.colRetail}</th>
              <th className="px-4 py-3 text-center">
                {t.colMargin}
                <span className="block text-[8px] text-slate-400 normal-case font-normal">(Owner Exclusive)</span>
              </th>
              <th className="px-4 py-3 text-center">{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium">
                  {t.noProducts}
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const marginVal = p.sellingPrice - p.purchasePrice;
                const marginPercent = p.purchasePrice > 0 ? Math.round((marginVal / p.purchasePrice) * 100) : 0;
                return (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${p.stock < 3 ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-4 py-3 font-mono font-medium text-slate-600">{p.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                          {p.name}
                          {p.stockType === 'old' ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-50 border border-amber-200 text-amber-700 uppercase tracking-wide inline-flex items-center gap-0.5">
                              📦 {lang === 'km' ? 'ស្តុកចាស់' : 'Old'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 border border-emerald-150 text-emerald-700 uppercase tracking-wide inline-flex items-center gap-0.5">
                              ✨ {lang === 'km' ? 'ស្តុកថ្មី' : 'New'}
                            </span>
                          )}
                          {p.color && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-50 border border-indigo-150 text-indigo-700 uppercase tracking-wide inline-flex items-center gap-0.5">
                              🎨 {p.color}
                            </span>
                          )}
                          {p.stock < 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 border border-rose-200 text-rose-700 uppercase tracking-wide inline-flex items-center gap-1 animate-pulse" title={lang === 'km' ? 'ស្តុកនៅសល់តិចជាង ៣' : 'Stock level is below 3 units!'}>
                              🚨 {lang === 'km' ? 'ស្តុកទាប' : 'Low Stock'}
                            </span>
                          )}
                        </div>
                        {p.colorStocks && Object.keys(p.colorStocks).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {Object.entries(p.colorStocks).map(([col, qty]) => (
                              <span key={col} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <span>{col}:</span>
                                <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{qty}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          {lang === 'km' ? 'កែប្រែចុងក្រោយដោយ៖ ' : 'Last updated by: '} {p.updatedBy}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold tracking-wider">
                        {(() => {
                          if (lang === 'en') {
                            const match = p.category.match(/\(([^)]+)\)/);
                            return match ? match[1] : p.category;
                          } else {
                            return p.category.split(' (')[0] || p.category;
                          }
                        })()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 1))}
                            className="w-6 h-6 border border-slate-300 rounded hover:bg-slate-100 active:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer font-mono"
                            title="-1"
                          >
                            -
                          </button>
                          <span className={`w-8 font-mono text-center font-bold ${p.stock < 10 ? 'text-rose-600 animate-pulse font-extrabold' : 'text-slate-850'}`}>
                            {p.stock}
                          </span>
                          <button
                            onClick={() => onUpdateStock(p.id, p.stock + 1)}
                            className="w-6 h-6 border border-slate-300 rounded hover:bg-slate-100 active:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer font-mono"
                            title="+1"
                          >
                            +
                          </button>
                        </div>

                        {/* Quick-action '±' button set */}
                        <div className="flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-900/40 p-1 rounded-md border border-slate-150 dark:border-slate-800/85" title="Quick Adjust (±)">
                          <button
                            onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 5))}
                            className="px-1.5 py-0.5 text-[9px] border border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-mono font-bold rounded cursor-pointer transition-colors"
                            title="-5"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 2))}
                            className="px-1.5 py-0.5 text-[9px] border border-rose-100 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 font-mono font-bold rounded cursor-pointer transition-colors"
                            title="-2"
                          >
                            -2
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, p.stock + 2)}
                            className="px-1.5 py-0.5 text-[9px] border border-emerald-100 dark:border-emerald-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-500 hover:text-emerald-400 font-mono font-bold rounded cursor-pointer transition-colors"
                            title="+2"
                          >
                            +2
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, p.stock + 5)}
                            className="px-1.5 py-0.5 text-[9px] border border-emerald-200 dark:border-emerald-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold rounded cursor-pointer transition-colors"
                            title="+5"
                          >
                            +5
                          </button>
                        </div>

                        {p.stock > 0 && (
                          <button
                            onClick={() => {
                              if (confirm(lang === 'km' ? `តើអ្នកពិតជាចង់សម្អាតស្តុក "${p.name}" ទៅជាសូន្យ (0) មែនទេ?` : `Are you sure you want to clear stock for "${p.name}" to 0?`)) {
                                onUpdateStock(p.id, 0);
                              }
                            }}
                            className="text-[9.5px] font-black text-rose-500 hover:text-rose-600 hover:underline cursor-pointer bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded transition-all mt-0.5 whitespace-nowrap block"
                          >
                            {lang === 'km' ? 'សម្អាតស្តុក (Clear)' : 'Clear Stock'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {hasFullOwnerAccess ? (
                        <div className="flex flex-col items-end">
                          <span className="text-amber-600 font-extrabold text-sm">${p.purchasePrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="group relative inline-flex items-center gap-1 text-slate-300 cursor-help" title="Locked: Owner Only">
                          <span className="filter blur-[4px] select-none">$*.**</span>
                          <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1 rounded font-sans scale-90">
                            {t.lockedMsg}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      <div className="flex flex-col items-end">
                        <span className="text-slate-800 font-extrabold text-sm">${p.sellingPrice.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono animate-fade-in">
                      {hasFullOwnerAccess ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 font-extrabold">
                            <span className="text-emerald-600 text-sm">${(p.sellingPrice - p.purchasePrice).toFixed(2)}</span>
                            <span className="text-[10px] text-slate-500 font-bold">({marginPercent}%)</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-normal italic">{t.lockedMsg}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 rounded flex items-center justify-center transition-colors cursor-pointer"
                          title={t.editTooltip}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setActiveBarcodeProduct(p)}
                          className="p-1 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded flex items-center justify-center transition-colors cursor-pointer"
                          title={lang === 'km' ? 'បាកូដ និងកូដ QR' : 'Barcode & QR Code'}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        
                        {hasFullOwnerAccess ? (
                          <button
                            onClick={() => {
                              if (confirm(t.deleteConfirm.replace('{{name}}', p.name))) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded flex items-center justify-center transition-colors cursor-pointer"
                            title={t.deleteTooltip}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center justify-center text-slate-300 p-1 px-2.5" title={t.lockedMsg}>
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
        </>
      )}

      {/* 1. INTERACTIVE BARCODE/QR SCANNER OVERLAY MODAL */}
      {isScanning && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <ScanBarcode className="w-5 h-5" />
                <h3 className="font-extrabold text-sm tracking-tight">
                  {lang === 'km' ? 'ម៉ាស៊ីនស្កេនបាកូដ POS' : 'POS Barcode Scanner Simulator'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsScanning(false); setScannerInput(''); }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              {/* Camera Simulation Frame */}
              <div className="relative w-64 h-44 bg-slate-950 rounded-xl border-2 border-indigo-500 overflow-hidden flex items-center justify-center shadow-inner">
                {/* Laser animation */}
                <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] top-0 animate-[scanLaser_2.5s_infinite]" />
                
                {/* Corner brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />

                <div className="text-center p-4 z-10">
                  <ScanBarcode className="w-10 h-10 text-indigo-400 mx-auto opacity-40 animate-pulse" />
                  <p className="text-[10px] text-indigo-300 font-mono mt-2 tracking-widest uppercase">
                    {lang === 'km' ? 'កំពុងស្វែងរកកូដ...' : 'Seeking Barcode...'}
                  </p>
                </div>
              </div>

              {/* Input for manual scan simulation */}
              <form onSubmit={handleScannerSubmit} className="w-full mt-6">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                  {lang === 'km' ? 'ស្កេន ឬបញ្ចូលលេខកូដ SKU ផលិតផល៖' : 'Scan or Enter Product SKU Code:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. CASIO-MTP-1302"
                    value={scannerInput}
                    onChange={(e) => setScannerInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    {lang === 'km' ? 'ស្កេន' : 'Scan'}
                  </button>
                </div>

                {/* Simulated product trigger options */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 mb-1.5">
                    {lang === 'km' ? 'ចុចទីនេះ ដើម្បីសាកល្បងស្កេនទំនិញគំរូ៖' : 'Click below to simulate physical hardware scans:'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {products.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playBeep();
                          setSearchTerm(p.sku);
                          setIsScanning(false);
                          setScannerInput('');
                        }}
                        className="text-[10px] font-semibold font-mono bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 px-2 py-0.5 rounded cursor-pointer transition-all"
                      >
                        {p.sku} (🎯 beep)
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. PREMIUM BARCODE & QR GENERATOR + PRINT MODAL */}
      {activeBarcodeProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <QrCode className="w-5 h-5" />
                <h3 className="font-extrabold text-sm tracking-tight">
                  {lang === 'km' ? 'ម៉ាស៊ីនបង្កើតស្លាកតម្លៃ និងបាកូដ' : 'Thermal Barcode & Pricing Label Generator'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveBarcodeProduct(null)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {/* Label Layout Ready for Thermal Printing */}
              <div id="printable-barcode-label" className="bg-white border-2 border-dashed border-slate-300 p-6 rounded-xl flex flex-col items-center justify-center text-slate-900 shadow-md max-w-sm mx-auto">
                {/* Header */}
                <div className="text-center w-full mb-3 pb-2 border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Luxury Watch Enterprise</p>
                  <h4 className="text-sm font-black text-slate-900 line-clamp-1">{activeBarcodeProduct.name}</h4>
                  <p className="text-[9px] text-slate-500 font-medium">{activeBarcodeProduct.category}</p>
                </div>

                {/* Dual Layout: Barcode Left, QR Right */}
                <div className="flex items-center justify-between w-full gap-4 py-2">
                  {/* Left Column: Barcode & SKU */}
                  <div className="flex-1 flex flex-col items-center">
                    {/* Simulated UPC Barcode Graphic */}
                    <div className="flex items-end justify-center h-14 w-44 bg-white px-1 py-1 border border-slate-200 rounded">
                      {activeBarcodeProduct.sku ? (
                        activeBarcodeProduct.sku.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2 === 0 ? (
                          // Render variant 1 of lines
                          Array.from({ length: 35 }).map((_, i) => {
                            const isDark = (i * 7) % 3 === 0 || (i * 13) % 4 === 1;
                            const isThick = (i * 19) % 5 === 0;
                            return (
                              <div
                                key={i}
                                className={`h-full ${isDark ? 'bg-slate-950' : 'bg-transparent'} ${isThick ? 'w-[3px]' : 'w-[1.2px]'} mx-[0.5px]`}
                              />
                            );
                          })
                        ) : (
                          // Render variant 2 of lines
                          Array.from({ length: 35 }).map((_, i) => {
                            const isDark = (i * 11) % 3 !== 0 || (i * i) % 5 === 1;
                            const isThick = (i * 17) % 7 === 0;
                            return (
                              <div
                                key={i}
                                className={`h-full ${isDark ? 'bg-slate-950' : 'bg-transparent'} ${isThick ? 'w-[2.5px]' : 'w-[1px]'} mx-[0.5px]`}
                              />
                            );
                          })
                        )
                      ) : null}
                    </div>
                    <span className="text-xs font-black font-mono tracking-widest text-slate-900 mt-1">{activeBarcodeProduct.sku}</span>
                  </div>

                  {/* Right Column: Mini QR Code */}
                  <div className="flex flex-col items-center border-l border-slate-100 pl-4">
                    <div className="w-14 h-14 bg-white border border-slate-200 p-1 rounded grid grid-cols-12 gap-[0.5px]">
                      {activeBarcodeProduct.sku ? (
                        (() => {
                          const hash = activeBarcodeProduct.sku.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                          return Array.from({ length: 144 }).map((_, idx) => {
                            const row = Math.floor(idx / 12);
                            const col = idx % 12;
                            const isFinder = (row < 4 && col < 4) || (row < 4 && col >= 8) || (row >= 8 && col < 4);
                            let isDark = false;
                            if (isFinder) {
                              const localR = row < 4 ? row : (row >= 8 ? row - 8 : row);
                              const localC = col < 4 ? col : (col >= 8 ? col - 8 : col);
                              isDark = (localR === 0 || localR === 3 || localC === 0 || localC === 3) || (localR === 1.5 && localC === 1.5);
                            } else {
                              isDark = (hash + idx * 17) % 5 < 2 || (idx * 13) % 7 === 1;
                            }
                            return (
                              <div
                                key={idx}
                                className={`${isDark ? 'bg-slate-950' : 'bg-white'} rounded-[0.5px]`}
                              />
                            );
                          });
                        })()
                      ) : null}
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Scan QR</span>
                  </div>
                </div>

                {/* Footer Pricing Tag */}
                <div className="text-center w-full mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase block">{lang === 'km' ? 'តម្លៃលក់រាយ' : 'RETAIL PRICE'}</span>
                    <span className="text-base font-black text-emerald-600 font-mono">${activeBarcodeProduct.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-500 font-bold uppercase block">{lang === 'km' ? 'ប្រាក់រៀល' : 'KHMER RIEL'}</span>
                    <span className="text-xs font-extrabold text-slate-700 font-mono">៛{(activeBarcodeProduct.sellingPrice * (exchangeRate || 4100)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Printing Advice */}
              <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  {lang === 'km' ? 'ការណែនាំអំពីការបោះពុម្ពស្លាកតម្លៃ' : 'Thermal Label Printing Tips'}
                </h5>
                <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {lang === 'km' 
                    ? 'ស្លាកតម្លៃនេះត្រូវបានកំណត់ទ្រង់ទ្រាយសម្រាប់ម៉ាស៊ីនបោះពុម្ពកម្តៅ thermal printer (ទំហំ 50mm x 30mm)។ ចុចប៊ូតុងខាងក្រោមដើម្បីបោះពុម្ពស្លាកតម្លៃ ឬស្ទីគ័របិទលើនាឡិកាដោយផ្ទាល់។' 
                    : 'This label layout is optimized for high-resolution thermal sticker printers (50mm x 30mm format). Click below to trigger the barcode and price tag printer driver.'}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setActiveBarcodeProduct(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
                >
                  {lang === 'km' ? 'បិទ' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    const printContents = document.getElementById('printable-barcode-label')?.innerHTML;
                    if (printContents) {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Print Label</title>
                              <script src="https://cdn.tailwindcss.com"></script>
                              <style>
                                @media print {
                                  body { margin: 0; padding: 10px; }
                                  @page { size: auto; margin: 0; }
                                }
                              </style>
                            </head>
                            <body class="flex items-center justify-center min-h-screen bg-white">
                              <div class="border-2 border-dashed border-slate-300 p-6 rounded-xl flex flex-col items-center justify-center text-slate-900 max-w-sm">
                                ${printContents}
                              </div>
                              <script>
                                setTimeout(() => {
                                  window.print();
                                  window.close();
                                }, 500);
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {lang === 'km' ? 'បោះពុម្ពស្លាកតម្លៃ' : 'Print Label'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
