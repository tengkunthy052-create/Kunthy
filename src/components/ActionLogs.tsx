import React, { useState } from 'react';
import { ActionLog, Role } from '../types';
import { Bell, Pin, MessageSquare, Terminal, Calendar, User, Send } from 'lucide-react';

interface ActionLogsProps {
  logs: ActionLog[];
  currentRole: Role;
  currentUser: string;
  onPostLog: (action: string, details: string) => void;
  onClearLogs: () => void;
}

export default function ActionLogs({
  logs,
  currentRole,
  currentUser,
  onPostLog,
  onClearLogs,
}: ActionLogsProps) {
  const [newNotice, setNewNotice] = useState('');

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.trim()) return;

    onPostLog('ប្រកាសដំណឹង (Announce Detail)', newNotice);
    setNewNotice('');
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl shadow-xl border border-slate-800 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: System Activity Logs (Audit ledger) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 tracking-wide">
                <Terminal className="text-amber-400 w-4.5 h-4.5" />
                កំណត់ហេតុរួមគ្នាក្នុងប្រព័ន្ធ (Shared Action Audit Ledger)
              </h3>
              <p className="text-slate-400 text-[10.5px]">
                រាល់សកម្មភាពទាំងឡាយរបស់ Owner និង Admin ត្រូវបានកត់ត្រទុកនៅទីនេះ (Real-time actions timeline)
              </p>
            </div>
            {currentRole === 'Owner' && (
              <button
                onClick={() => {
                  if (confirm('តើអ្នកពិតជាចង់សម្អាតកំណត់ហេតុទាំងអស់មែនទេ?')) {
                    onClearLogs();
                  }
                }}
                className="text-[10px] text-amber-500 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 px-2 py-1 rounded cursor-pointer"
              >
                Clear Logs
              </button>
            )}
          </div>

          {/* Logs Timeline */}
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 max-h-[300px] overflow-y-auto space-y-3">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                មិនទាន់មានកំណត់ហេតុសកម្មភាពនៅឡើយទេ (Logs container empty)
              </div>
            ) : (
              [...logs].reverse().map((log) => (
                <div key={log.id} className="text-xs flex items-start gap-2.5 border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
                  {/* Avatar Icon / Role Tag */}
                  <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${log.role === 'Owner' ? 'bg-amber-400' : 'bg-teal-400'}`}></span>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-200">
                        {log.user} ({log.role})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 font-sans">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        log.action.includes('លក់') || log.action.includes('Sale')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.action.includes('ដំឡើង') || log.action.includes('Config')
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-slate-300 font-medium">{log.details}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Shared Bulletins/sticky notes board (Owner/Admin collaboration) */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-800">
              <Pin className="w-3.5 h-3.5 text-amber-400 fill-current" />
              ក្តារព័ត៌មានរួមគ្នា (Shared Bulletin Board)
            </h4>
            <p className="text-[10.5px] text-slate-400 mb-4 font-sans line-clamp-2">
              ទីនេះសម្រាប់ Owner និង Admin បន្សល់ទុកសារក្រើនរំលឹក ឬសេចក្តីជូនដំណឹងជាក់ស្តែងបង្រួបបង្រួមគ្រប់គ្រងស្តុក។
            </p>

            {/* Quick pre-assigned boards pins to show off content */}
            <div className="space-y-2 max-h-[140px] overflow-y-auto mb-3">
              <div className="p-2.5 bg-slate-900 border border-slate-700/60 rounded text-[11px] space-y-1">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  📌 លោក វាសនា (Owner)
                </span>
                <p className="text-slate-300">"សូមមេត្តា Admin Lina ជួយពិនិត្យមើលស្តុក អង្ករផ្ការំដួល ផង បើថយចុះក្រោម ១០ កញ្ចប់ ត្រូវទាក់ទងមកខ្ញុំបន្ទាន់!"</p>
              </div>

              <div className="p-2.5 bg-slate-900 border border-slate-700/60 rounded text-[11px] space-y-1">
                <span className="font-bold text-teal-400 flex items-center gap-1">
                  📌 កញ្ញា លីណា (Admin)
                </span>
                <p className="text-slate-300">"ចាសបង! ខ្ញុំបានពិនិត្យប្រចាំថ្ងៃហើយ ទឹកត្រី និងម្រេចលក់ដាច់ជាងគេសប្តាហ៍នេះ។"</p>
              </div>
            </div>
          </div>

          {/* Form to post new announcement directly inside timeline */}
          <form onSubmit={handlePostNotice} className="mt-2">
            <div className="relative">
              <input
                type="text"
                placeholder="សរសេរសារផ្ញើទៅកាន់ក្រុមរួមគ្នា..."
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
                title="Send Notice"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
