import React, { useState } from 'react';
import { 
  Watch, 
  Clock, 
  Gem, 
  Award, 
  Store, 
  ShoppingBag, 
  Sparkles, 
  Flame, 
  Image as ImageIcon, 
  Compass, 
  Palette,
  Check,
  AlertCircle
} from 'lucide-react';
import { Language } from '../translations';

export interface ShopConfig {
  nameKm: string;
  nameEn: string;
  logoType: 'icon' | 'image';
  logoIcon: string;
  logoImgUrl: string;
  logoColor: string;
  exchangeRate?: number;
}

interface ShopBrandingFormProps {
  initialConfig: ShopConfig;
  onSave: (config: ShopConfig) => void;
  onCancel: () => void;
  lang: Language;
}

const PRESET_ICONS = [
  { id: 'Watch', icon: Watch, labelKm: 'នាឡិកាដៃ', labelEn: 'Watch' },
  { id: 'Clock', icon: Clock, labelKm: 'នាឡិកាជញ្ជាំង', labelEn: 'Clock' },
  { id: 'Gem', icon: Gem, labelKm: 'គ្រាប់ពេជ្រ', labelEn: 'Jewel Gem' },
  { id: 'Award', icon: Award, labelKm: 'គុណភាពខ្ពស់', labelEn: 'Award' },
  { id: 'Store', icon: Store, labelKm: 'ហាងលក់', labelEn: 'Store' },
  { id: 'ShoppingBag', icon: ShoppingBag, labelKm: 'កាបូបទំនិញ', labelEn: 'Shopping Bag' },
  { id: 'Sparkles', icon: Sparkles, labelKm: 'ផ្កាយភ្លឺ', labelEn: 'Sparkles' },
  { id: 'Flame', icon: Flame, labelKm: 'ពេញនិយម', labelEn: 'Flame' },
];

const THEME_COLORS = [
  { id: 'indigo', nameKm: 'ខៀវទឹកប៊ិច', nameEn: 'Indigo Blue', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', fill: 'bg-indigo-600' },
  { id: 'emerald', nameKm: 'បៃតងត្បូងខ្ចី', nameEn: 'Emerald Green', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', fill: 'bg-emerald-600' },
  { id: 'amber', nameKm: 'លឿងទឹកមាស', nameEn: 'Amber Gold', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', fill: 'bg-amber-500' },
  { id: 'rose', nameKm: 'ផ្កាឈូកក្រហម', nameEn: 'Royal Rose', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', fill: 'bg-rose-600' },
  { id: 'cyan', nameKm: 'ខៀវផ្ទៃមេឃ', nameEn: 'Cyan Modern', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', fill: 'bg-cyan-500' },
  { id: 'teal', nameKm: 'បៃតងចាស់', nameEn: 'Teal Elegance', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', fill: 'bg-teal-600' },
  { id: 'violet', nameKm: 'ស្វាយបុរាណ', nameEn: 'Royal Violet', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', fill: 'bg-violet-600' },
  { id: 'slate', nameKm: 'ប្រផេះក្រូមេ', nameEn: 'Chrome Slate', bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600', fill: 'bg-slate-700' },
];

export default function ShopBrandingForm({ initialConfig, onSave, onCancel, lang }: ShopBrandingFormProps) {
  const isKhmer = lang === 'km';

  // Local editable states
  const [nameKm, setNameKm] = useState(initialConfig.nameKm);
  const [nameEn, setNameEn] = useState(initialConfig.nameEn);
  const [logoType, setLogoType] = useState<'icon' | 'image'>(initialConfig.logoType);
  const [logoIcon, setLogoIcon] = useState(initialConfig.logoIcon);
  const [logoImgUrl, setLogoImgUrl] = useState(initialConfig.logoImgUrl);
  const [logoColor, setLogoColor] = useState(initialConfig.logoColor);
  const [exchangeRate, setExchangeRate] = useState<number>(initialConfig.exchangeRate || 4100);

  const [urlError, setUrlError] = useState(false);

  // Active theme helper styles
  const activeTheme = THEME_COLORS.find(c => c.id === logoColor) || THEME_COLORS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKm.trim() || !nameEn.trim()) return;
    onSave({
      nameKm: nameKm.trim(),
      nameEn: nameEn.trim(),
      logoType,
      logoIcon,
      logoImgUrl: logoType === 'image' ? logoImgUrl.trim() : '',
      logoColor,
      exchangeRate,
    });
  };

  // Preview helper element
  const renderPreviewLogo = () => {
    if (logoType === 'image' && logoImgUrl && !urlError) {
      return (
        <img 
          src={logoImgUrl} 
          alt="Preview brand logo" 
          referrerPolicy="no-referrer"
          onError={() => setUrlError(true)}
          className="w-10 h-10 object-cover rounded-xl"
        />
      );
    }

    const matchedIconObj = PRESET_ICONS.find(p => p.id === logoIcon) || PRESET_ICONS[0];
    const IconCmp = matchedIconObj.icon;
    return <IconCmp className="w-6 h-6" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      
      {/* Dynamic BRANDING PREVIEW HEADER card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          {isKhmer ? '📍 ទិដ្ឋភាពគំរូនៃនិមិត្តសញ្ញាហាង' : '📍 Real-time Branding Preview'}
        </h4>
        <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-lg border border-slate-100 shadow-2xs">
          <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 transition-all ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}>
            {renderPreviewLogo()}
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded-full uppercase border border-slate-200">
              {isKhmer ? activeTheme.nameKm : activeTheme.nameEn}
            </span>
            <h5 className="text-sm font-black text-slate-800 truncate leading-snug">
              {isKhmer ? (nameKm || 'ឈ្មោះហាងឡូហ្គោ') : (nameEn || 'Shop Name Logo')}
            </h5>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {logoType === 'image' ? (logoImgUrl || 'No image URL') : `Icon Preset: ${logoIcon}`}
            </p>
          </div>
        </div>
      </div>

      {/* Inputs: Shop Name Khmer / English / Exchange Rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wide">
            {isKhmer ? 'ឈ្មោះហាង (ភាសាខ្មែរ) *' : 'Shop Name (Khmer) *'}
          </label>
          <input
            type="text"
            required
            value={nameKm}
            onChange={(e) => setNameKm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-sans focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="ប្រព័ន្ធគ្រប់គ្រងការលក់ និងស្តុកនាឡិកាដៃប្រណិត ERP"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wide">
            {isKhmer ? 'ឈ្មោះហាង (ភាសាអង់គ្លេស) *' : 'Shop Name (English) *'}
          </label>
          <input
            type="text"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-sans focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Luxury Watch Enterprise ERP Tracker"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wide">
            {isKhmer ? 'អត្រាប្តូរប្រាក់ (1$ = ៛) *' : 'Exchange Rate (1$ = KHR) *'}
          </label>
          <input
            type="number"
            required
            min="100"
            max="10000"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseInt(e.target.value) || 4000)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="4100"
          />
        </div>
      </div>

      {/* Choice: Logo Type Selector */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">
          {isKhmer ? 'ប្រភេទរូបតំណាងហាង (Logo type)' : 'Logo Icon Selection Mode'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setLogoType('icon');
              setUrlError(false);
            }}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              logoType === 'icon' 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span className="text-xs">{isKhmer ? 'រូបតំណាងគំរូ (Presets)' : 'Preset Icon Grid'}</span>
          </button>

          <button
            type="button"
            onClick={() => setLogoType('image')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              logoType === 'image' 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-5 h-5 shrink-0" />
            <span className="text-xs">{isKhmer ? 'តំណលីងរូបភាព (Image Link)' : 'Custom Image URL'}</span>
          </button>
        </div>
      </div>

      {/* Conditional: Presets Grid */}
      {logoType === 'icon' ? (
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">
            {isKhmer ? 'ជ្រើសរើសរូបតំណាង (Choose Icon Preset)' : 'Select Icon Preset'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_ICONS.map((p) => {
              const PresIcon = p.icon;
              const isSelected = logoIcon === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLogoIcon(p.id)}
                  className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white font-extrabold shadow-sm scale-102' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                  title={isKhmer ? p.labelKm : p.labelEn}
                >
                  <PresIcon className="w-5 h-5 shrink-0 mb-1" />
                  <span className="text-[9px] truncate max-w-full block">
                    {isKhmer ? p.labelKm : p.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">
            {isKhmer ? 'តំណលីងរូបភាពឡូហ្គោ (Direct Image Link URL)' : 'Logo Direct Image URL Link'}
          </label>
          <div className="space-y-2">
            <input
              type="url"
              value={logoImgUrl}
              onChange={(e) => {
                setLogoImgUrl(e.target.value);
                setUrlError(false);
              }}
              placeholder="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200..."
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[10px] text-slate-400">
              {isKhmer ? '⚠️ ជំនួយគោលការណ៍៖ ត្រូវប្រើប្រាស់ Direct Link Web Image ដែលមានកន្ទុយ .png, .jpg (Unsplash / Imgur ត្រូវបានគាំទ្រ)' : '💡 Tip: Must link directly to a web image (Unsplash, Imgur or CDN hosting).'}
            </p>
            {urlError && logoImgUrl && (
              <div className="text-[10px] text-rose-500 flex items-center gap-1 font-medium bg-rose-50 border border-rose-100 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>
                  {isKhmer ? 'តំណលីងរូបភាពមិនដំណើរការទេ។ ប្រព័ន្ធបានប្ដូរមកកាន់រូបភាព Watch ជំនួសវិញ។' : 'Failed to render image URL. Handing over to watch fallback automatically.'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Color Palette Theme customized select */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">
            {isKhmer ? 'ពណ៌ចម្បងនៃស្លាកយីហោ (Branding Theme Colors)' : 'Main Brand Styling Theme'}
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {THEME_COLORS.map((color) => {
            const isSelected = logoColor === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => setLogoColor(color.id)}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                  isSelected 
                    ? `border-indigo-500 ring-2 ring-indigo-600/10 ${color.bg}` 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${color.fill} block shadow-sm flex items-center justify-center`}>
                  {isSelected && <Check className="w-2 h-2 text-white" />}
                </span>
                <span className="text-[9.5px] font-semibold text-slate-700 truncate block">
                  {isKhmer ? color.nameKm : color.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          {isKhmer ? 'បោះបង់' : 'Cancel'}
        </button>
        <button
          type="submit"
          disabled={!nameKm.trim() || !nameEn.trim()}
          className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {isKhmer ? 'រក្សាទុកទិន្នន័យ' : 'Save Changes'}
        </button>
      </div>

    </form>
  );
}
