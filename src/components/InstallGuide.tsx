import React from 'react';
import { 
  Smartphone, 
  Laptop, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Cpu, 
  Apple, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function InstallGuide() {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-8">
      
      {/* Title block */}
      <div className="border-b border-slate-100 pb-5">
        <span className="p-1 px-3 bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-widest rounded-full uppercase border border-indigo-100">
          តម្លើង និងរៀបចំកម្មវិធី (INSTALLATION PLATFORM)
        </span>
        <h3 className="text-xl font-black text-slate-800 mt-2">
          មគ្គុទ្ទេសក៍ដំឡើងកម្មវិធីនៅលើទូរស័ព្ទ iOS (iPhone/iPad) និង កុំព្យូទ័រ (Desktop)
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          អ្នកអាចប្រើប្រាស់ប្រព័ន្ធ ERP នេះជាលក្ខណៈ កម្មវិធីទូរស័ព្ទ (App) ឬដំណើរការនៅលើកុំព្យូទ័រផ្ទាល់ខ្លួនរបស់អ្នកបានយ៉ាងងាយស្រួលបំផុត។
        </p>
      </div>

      {/* Grid of platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* iOS Phone Install block */}
        <div className="border border-slate-200 rounded-xl p-5 hover:border-indigo-400 transition-colors bg-gradient-to-b from-white to-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-slate-900 text-white rounded-lg">
                <Apple className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                iPhone & iPad (iOS)
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-800">១. វិធីបង្កើតជា App លើទូរស័ព្ទ iOS (iPhone/iPad)៖</h4>
            <p className="text-[11px] text-slate-500 mt-1 mb-4 leading-normal">
              អ្នកអាចដំឡើងប្រព័ន្ធនេះឱ្យដំណើរការដូច App ពិតៗ ដោយគ្មានរបារ URL និងរុករកពេញអេក្រង់ (Full Screen App)៖
            </p>

            <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <p>បើកតំណភ្ជាប់ (Link) នៃ ERP នេះនៅលើទូរស័ព្ទរបស់អ្នកដោយប្រើកម្មវិធីរុករក <strong className="text-indigo-600">Safari</strong></p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <p>ចុចលើប៊ូតុង <strong className="text-indigo-600">Share</strong> (រូបសញ្ញាប្រអប់មានព្រួញចង្អុលឡើង 📤 នៅផ្នែកខាងក្រោមអេក្រង់)</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <p>អូសចុះក្រោម រួចជ្រើសរើសយក <strong className="text-amber-600">"Add to Home Screen"</strong> (ឬ <strong className="text-amber-600">"បន្ថែមទៅអេក្រង់ដើម" ➕</strong>)</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">4</span>
                <div>
                  <p>ចុច <strong className="text-indigo-600">Add</strong> រួចជាការស្រេច! Icon របស់ហាងនាឡិកានឹងបង្ហាញលើទូរស័ព្ទរបស់អ្នកភ្លាមៗ!</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-indigo-600 font-bold">
            <Smartphone className="w-4 h-4 text-indigo-500" />
            <span>ដំណើរការរលូន និងលឿនរហ័សលើប្រព័ន្ធ iOS 15.0+</span>
          </div>
        </div>

        {/* Windows / Mac PC Install block */}
        <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-400 transition-colors bg-gradient-to-b from-white to-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                PC & Laptop (mac/windows)
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-800">២. វិធីដំឡើងជា App លើកុំព្យូទ័រ (PWA Client)៖</h4>
            <p className="text-[11px] text-slate-500 mt-1 mb-4 leading-normal">
              ដំណើរការដូចកម្មវិធី Windows/Mac Standalone App ដែលមិនបាច់បើក Browser ច្រើនរញ៉េរញ៉ៃ៖
            </p>

            <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <p>បើកតំណភ្ជាប់ Live App នេះនៅលើកម្មវិធីរុករក <strong className="text-emerald-600">Google Chrome</strong> ឬ <strong className="text-emerald-600">Microsoft Edge</strong></p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <p>មើលទៅខាងស្តាំនៃរបារអាសយដ្ឋាន URL នឹងឃើញរូបតំណាងសញ្ញាបូក <strong className="text-emerald-600">(+)</strong></p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <p>ចុចលើវា រួចរើសយកពាក្យ <strong className="text-emerald-600">"Install"</strong> ឬ <strong className="text-emerald-600">"តំឡើង"</strong></p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">4</span>
                <div>
                  <p>កម្មវិធីនឹងបើកមកជាផ្ទាំងដាច់ដោយឡែក និងបង្កើត Icon លើ Desktop កុំព្យូទ័រស្វ័យប្រវត្តិ!</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-600 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>គាំទ្រទាំង Windows 11/10, macOS Monterey & Linux</span>
          </div>
        </div>

      </div>

      {/* Developer offline setup instruction card */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20 text-indigo-400">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">៣. វិធីដំឡើងដំណើរការក្រៅបណ្តាញលើកុំព្យូទ័រ (Download ZIP Offline Server)</h4>
            <p className="text-[10px] text-slate-400">បើកលើកុំព្យូទ័រ ទោះបីជាគ្មានអ៊ីនធឺណិត (Fully Offline Safe Localhost)</p>
          </div>
        </div>

        <p className="text-[11.5px] text-slate-300 leading-normal">
          អ្នកអាចទាញយកកូដពេញលេញនៃកម្មវិធី ERP នេះជាទម្រង់ <strong className="text-indigo-400">ZIP File</strong> ដើម្បីយកទៅដំណើរការលើម៉ាស៊ីនផ្ទាល់ខ្លួនបានយ៉ាងងាយស្រួលបំផុត៖
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-sans font-bold block uppercase">ជំហានទាញយក (EXPORT ZIP)៖</span>
            <p className="font-sans leading-relaxed text-[11px]">
              ១. សម្លឹងមើលទៅខាងស្តាំផ្នែកខាងលើនៃកម្មវិធី <strong className="text-indigo-300">Google AI Studio</strong><br />
              ២. ចុចលើ <strong className="text-indigo-300">Settings/Export Menu</strong> ហើយជ្រើសរើសយក <strong className="text-emerald-400">"Export Web Project as ZIP"</strong> ឬ <strong className="text-indigo-400">"GitHub Export"</strong> ដើម្បីរក្សាទុកកូដសំបុកនៅក្នុង Desktop កុំព្យូទ័រ។
            </p>
          </div>
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] text-slate-500 font-sans font-bold block uppercase">ពាក្យបញ្ជាដើម្បីដំណើរការ (COMMAND RUN)៖</span>
            <div className="space-y-1 text-[11px]">
              <p className="text-slate-400 font-sans">បន្ទាប់ពីពន្លា ZIP (Extract ZIP) រួច បើក Terminal ឬ CMD នៅក្នុង Folder នោះ រួចវាយ៖</p>
              <div className="bg-slate-900 border border-slate-800 p-1.5 px-2.5 rounded font-mono text-[10.5px] text-amber-400">
                npm install
              </div>
              <div className="bg-slate-900 border border-slate-800 p-1.5 px-2.5 rounded font-mono text-[10.5px] text-amber-400">
                npm run dev
              </div>
              <p className="text-slate-400 font-sans text-[10px]">រួចបើកកម្មវិធីរុករកកុំព្យូទ័រទៅកាន់អាសយដ្ឋាន <strong className="text-white">http://localhost:3000</strong></p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[10px] bg-slate-950/40 p-3 rounded border border-slate-800 text-slate-400 select-none">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>ចំណាំសំខាន់សម្រាប់ការប្រើប្រាស់ក្រៅបណ្តាញ (Local Database)៖</strong> នៅពេលអ្នកប្រើប្រាស់កម្មវិធីនេះដោយពន្លា ZIP នោះ ទិន្នន័យនាឡិកាដៃ និងការលក់នឹងត្រូវកត់ត្រា និងរក្សាទុកយ៉ាងមានសុវត្ថិភាពនៅក្នុងខួរក្បាលអង្គចងចាំរបស់ Browser (Local Storage)។ អ្នកអាចដំណើរការវាដោយគ្មានប្រព័ន្ធអុីនធឺណិត និងគ្មានការរំខាន ឬបាត់បង់ទិន្នន័យឡើយ!
          </p>
        </div>
      </div>

    </div>
  );
}
