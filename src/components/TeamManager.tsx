import React, { useState } from 'react';
import { TeamMember, Role } from '../types';
import { translations, Language } from '../translations';
import { Shield, Users, DollarSign, Key, Plus, Trash2, KeyRound, ShieldAlert } from 'lucide-react';

interface TeamManagerProps {
  team: TeamMember[];
  currentRole: Role;
  currentUser: string;
  onModifySalary: (id: string, newSalary: number) => void;
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  lang: Language;
}

export default function TeamManager({
  team,
  currentRole,
  currentUser,
  onModifySalary,
  onAddMember,
  lang,
}: TeamManagerProps) {
  const t = translations[lang];
  const hasFullOwnerAccess = true;

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Admin');
  const [email, setEmail] = useState('');
  const [salary, setSalary] = useState(500);

  // Salary editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSalary, setEditingSalary] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const basePermissions = role === 'Owner' 
      ? ['all_access', 'delete_records', 'manage_team', 'view_profits', 'edit_salaries']
      : ['read_sales', 'write_sales', 'read_inventory', 'write_inventory'];

    onAddMember({
      name,
      role,
      status: 'Active',
      email,
      salary,
      permissions: basePermissions,
    });

    // Reset Form
    setName('');
    setRole('Admin');
    setEmail('');
    setSalary(500);
    setShowAddForm(false);
  };

  const handleStartEditSalary = (m: TeamMember) => {
    setEditingId(m.id);
    setEditingSalary(m.salary);
  };

  const handleSaveSalary = (id: string) => {
    if (editingSalary <= 0) return;
    onModifySalary(id, editingSalary);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            {t.teamTitle}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {t.teamDesc}
          </p>
        </div>

        {hasFullOwnerAccess && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? t.closeFormBtn : t.addStaffBtn}
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
            {t.formAddStaff}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.staffName}</label>
              <input
                type="text"
                required
                placeholder="eg. Teng Kunthy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.staffEmail}</label>
              <input
                type="email"
                required
                placeholder="eg. kunthy@luxurywatch.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.staffRole}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500"
              >
                <option value="Admin">Admin ({lang === 'km' ? 'បុគ្គលិកប្រតិបត្តិការ' : 'Staff Operator'})</option>
                <option value="Owner">Owner ({lang === 'km' ? 'ម្ចាស់អាជីវកម្ម' : 'Store Owner'})</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.staffSalary}</label>
              <input
                type="number"
                min="1"
                value={salary}
                onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs text-slate-500 rounded border border-slate-300 hover:bg-slate-100 focus:outline-none cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-950 text-white rounded focus:outline-none shadow-xs transition-colors cursor-pointer"
            >
              {t.createAccountBtn}
            </button>
          </div>
        </form>
      )}

      {/* Grid Layout containing Team and Rule definitions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Users List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200 animate-fade-in">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t.colNameEmail}</th>
                  <th className="px-4 py-3">{t.colStaffRole}</th>
                  <th className="px-4 py-3 text-right">{t.colSalary}</th>
                  <th className="px-4 py-3 text-center">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200 text-xs">
                {team.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {m.name}
                          {m.role === 'Owner' ? (
                            <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-600 px-1.5 py-0.2 rounded font-bold uppercase font-mono">
                              Admin-Root
                            </span>
                          ) : (
                            <span className="text-[9px] bg-teal-500/10 border border-teal-500/20 text-teal-600 px-1.5 py-0.2 rounded font-bold uppercase font-mono">
                              Op-Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{m.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {m.role === 'Owner' ? (
                          <Shield className="w-3.5 h-3.5 text-amber-500 fill-current" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-teal-500" />
                        )}
                        <span className="font-semibold text-slate-700">{m.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {hasFullOwnerAccess ? (
                        editingId === m.id ? (
                          <div className="flex items-center justify-end gap-1 animate-fade-in">
                            <input
                              type="number"
                              className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-bold focus:outline-none"
                              value={editingSalary}
                              onChange={(e) => setEditingSalary(parseInt(e.target.value) || 0)}
                            />
                            <button
                              onClick={() => handleSaveSalary(m.id)}
                              className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] uppercase font-bold hover:bg-emerald-700 transition cursor-pointer"
                            >
                              {lang === 'km' ? 'រក្សាទុក' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] hover:bg-slate-300 transition cursor-pointer"
                            >
                              X
                            </button>
                          </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 group">
                          <span className="text-slate-800 font-bold">${m.salary}</span>
                          <button
                            onClick={() => handleStartEditSalary(m)}
                            className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] flex items-center"
                            title="Edit"
                          >
                            {t.salaryEditBtn}
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-slate-300 italic">Locked ({t.lockedMsg})</span>
                    )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Access Control Rules Right column explaining roles */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            {t.matrixTitle}
          </h4>
          <p className="text-slate-500 text-xs mb-4">
            {lang === 'km' 
             ? 'សៀវភៅគោលការណ៍គ្រប់គ្រងសិទ្ធិប្រើប្រាស់ព័ត៌មាន និងចំណេញ៖' 
             : 'Role Based Access Control (RBAC) System Security Policies:'}
          </p>

          <div className="space-y-4 text-xs font-sans">
            {/* Owner Section */}
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                <Shield className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'km' ? 'ម្ចាស់ហាង (Owner - Bo Vannak)' : 'Store Owner (Bo Vannak)'}</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                {lang === 'km' ? (
                  <>
                    <li>សិទ្ធិកំពូលលើប្រព័ន្ធគ្រប់គ្រងទាំងស្រុង (All Access)</li>
                    <li>មើលឃើញថ្លៃដើម (Purchase Cost) និងប្រាក់ចំណេញសុទ្ធ</li>
                    <li>គ្រប់គ្រង និងកែសម្រួលប្រាក់ខែបុគ្គលិក កត់ត្រាចំណាយ</li>
                    <li>លុបសម្អាតទិន្នន័យ (Wipe Database) រួម</li>
                  </>
                ) : (
                  <>
                    <li>Master controller of all operations & settings</li>
                    <li>View live purchase costs & dynamic company gross margin</li>
                    <li>Modify wages structures, audit bills, adjust categories</li>
                    <li>Power to perform absolute tables wipe actions</li>
                  </>
                )}
              </ul>
            </div>

            {/* Admin Section */}
            <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-lg">
              <div className="flex items-center gap-1.5 font-bold text-teal-800 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'បុគ្គលិកលក់ (Operator Admins)' : 'Sales & Operators Admins'}</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                {lang === 'km' ? (
                  <>
                    <li>កត់ត្រាលក់ទំនិញ (Sales Checkout) កាត់ស្តុកស្វ័យប្រវត្ត</li>
                    <li>បន្ថែមផលិតផល និងកែតម្រូវចំននួនស្តុកនាឡិកា</li>
                    <li><span className="text-rose-600 font-bold">🚫 មិនអាចមើល៖</span> តម្លៃទិញចូល (Purchase Cost) របស់នាឡិកា និងរបាយការណ៍ផលចំណេញ</li>
                    <li><span className="text-rose-600 font-bold">🚫 មិនអាចមើល៖</span> ប្រាក់ខែដៃគូការងារ ឬលុបបញ្ជីចោលឡើយ</li>
                  </>
                ) : (
                  <>
                    <li>Create instant invoice checkout receipts (auto deduct inventory)</li>
                    <li>Insert new designs, correct stock levels instantly</li>
                    <li><span className="text-rose-600 font-bold">🚫 Blocked:</span> Private purchase item cost details hidden entirely</li>
                    <li><span className="text-rose-600 font-bold">🚫 Blocked:</span> Salary figures of other members hidden</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
