import React, { useState } from 'react';
import { Expense, Role } from '../types';
import { translations, Language } from '../translations';
import { CircleDollarSign, Plus, Trash2, Calendar, ClipboardList, ShieldAlert, BadgeCheck, Download } from 'lucide-react';

interface ExpenseManagerProps {
  expenses: Expense[];
  currentRole: Role;
  currentUser: string;
  onAddExpense: (exp: { title: string; category: Expense['category']; amount: number; description?: string }) => void;
  onDeleteExpense: (id: string) => void;
  lang: Language;
}

export default function ExpenseManager({
  expenses,
  currentRole,
  currentUser,
  onAddExpense,
  onDeleteExpense,
  lang,
}: ExpenseManagerProps) {
  const t = translations[lang];
  const hasFullOwnerAccess = true;

  // Component local states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Other');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    onAddExpense({
      title,
      category,
      amount,
      description: description || undefined,
    });

    // Reset Form
    setTitle('');
    setCategory('Other');
    setAmount(0);
    setDescription('');
    setShowAddForm(false);
  };

  const handleExportExpenses30Days = () => {
    const days = 30;
    const cutOff = new Date();
    cutOff.setDate(cutOff.getDate() - days);
    
    const filteredExpenses = expenses.filter(exp => new Date(exp.date) >= cutOff);
    
    const headers = [
      lang === 'km' ? 'កាលបរិច្ឆេទ (Date)' : 'Date',
      lang === 'km' ? 'ឈ្មោះការចំណាយ (Title)' : 'Expense Title',
      lang === 'km' ? 'ប្រភេទចំណាយ (Category)' : 'Category',
      lang === 'km' ? 'ទឹកប្រាក់ចំណាយ (Amount USD)' : 'Amount (USD)',
      lang === 'km' ? 'សេចក្តីពិពណ៌នា (Description)' : 'Description',
      lang === 'km' ? 'អ្នកកត់ត្រា (Recorded By)' : 'Recorded By'
    ];
    
    const rows = filteredExpenses.map((exp) => {
      const categoryLabel = exp.category === 'Capital' ? t.expCategoryCapital :
                            exp.category === 'Salary' ? t.expCategorySalary :
                            exp.category === 'Rent' ? t.expCategoryRent :
                            exp.category === 'Utilities' ? t.expCategoryUtilities :
                            exp.category === 'Marketing' ? t.expCategoryMarketing :
                            exp.category === 'Renovation' ? t.expCategoryRenovation :
                            t.expCategoryOther;
      return [
        new Date(exp.date).toLocaleString(lang === 'km' ? 'km-KH' : 'en-US'),
        exp.title,
        categoryLabel.split(' ')[0],
        `$${exp.amount.toFixed(2)}`,
        exp.description || '',
        exp.recordedBy
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
    link.setAttribute('download', `Expense_Report_30_Days_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
      
      {/* Header block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-rose-500 animate-pulse" />
            {t.expTitle}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {t.expDesc}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportExpenses30Days}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-600" />
            {lang === 'km' ? 'ទាញរបាយការណ៍ចំណាយ ៣០ថ្ងៃ' : 'Export Expenses (30d)'}
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? t.closeFormBtn : t.addExpenseBtn}
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
            {t.formExpenseTitle}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.expName}</label>
              <input
                type="text"
                required
                placeholder={lang === 'km' ? "ឧ. ថ្លៃជួលតូបហាងជាន់ទី២" : "e.g. June Shop Rent"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.expCategory}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense['category'])}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
              >
                <option value="Capital">{t.expCategoryCapital}</option>
                <option value="Salary">{t.expCategorySalary}</option>
                <option value="Rent">{t.expCategoryRent}</option>
                <option value="Utilities">{t.expCategoryUtilities}</option>
                <option value="Marketing">{t.expCategoryMarketing}</option>
                <option value="Renovation">{t.expCategoryRenovation}</option>
                <option value="Other">{t.expCategoryOther}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.expAmount}</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount === 0 ? '' : amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.expDescLabel}</label>
              <textarea
                placeholder={lang === 'km' ? "ព័ត៌មានលម្អិតបន្ថែម..." : "Write details about this expenditure (optional)..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs text-slate-500 rounded border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.cancelProductBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
            >
              {t.saveExpenseBtn}
            </button>
          </div>
        </form>
      )}

      {/* Expense List Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">{t.colDate}</th>
              <th className="px-4 py-3">{t.colExpenseTitle}</th>
              <th className="px-4 py-3">{t.colCategory}</th>
              <th className="px-4 py-3 text-right">{t.colAmount}</th>
              <th className="px-4 py-3">{t.colRecordedBy}</th>
              <th className="px-4 py-3 text-center">{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 text-xs text-slate-700">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  {t.noExpenses}
                </td>
              </tr>
            ) : (
              expenses.map((exp) => {
                let badgeColor = "bg-slate-100 text-slate-600";
                if (exp.category === "Capital") badgeColor = "bg-rose-100 text-rose-700 border border-rose-200 font-extrabold";
                else if (exp.category === "Salary") badgeColor = "bg-purple-100 text-purple-700 border border-purple-200";
                else if (exp.category === "Rent") badgeColor = "bg-orange-100 text-orange-700 border border-orange-200";
                else if (exp.category === "Utilities") badgeColor = "bg-blue-100 text-blue-700 border border-blue-200";
                else if (exp.category === "Marketing") badgeColor = "bg-emerald-100 text-emerald-700 border border-emerald-200";
                else if (exp.category === "Renovation") badgeColor = "bg-yellow-10 border border-yellow-200 text-yellow-800";

                return (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono">
                      {new Date(exp.date).toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-slate-800">{exp.title}</div>
                        {exp.description && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">{exp.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${badgeColor}`}>
                        {exp.category === 'Capital' ? t.expCategoryCapital.split(' ')[0] :
                         exp.category === 'Salary' ? t.expCategorySalary.split(' ')[0] :
                         exp.category === 'Rent' ? t.expCategoryRent.split(' ')[0] :
                         exp.category === 'Utilities' ? t.expCategoryUtilities.split(' ')[0] :
                         exp.category === 'Marketing' ? t.expCategoryMarketing.split(' ')[0] :
                         exp.category === 'Renovation' ? t.expCategoryRenovation.split(' ')[0] :
                         t.expCategoryOther.split(' ')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      {exp.recordedBy}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasFullOwnerAccess ? (
                        <button
                          onClick={() => {
                            if (confirm(t.deleteExpenseConfirm)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded flex items-center justify-center mx-auto transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center justify-center text-slate-400" title={t.lockedMsg}>
                          <ShieldAlert className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
