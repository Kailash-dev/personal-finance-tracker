import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { storageService } from '../services/storageService';
import { dataProvider } from '../services/dataProvider';
import { MerchantRule } from '@personal-finance/types';
import { formatINR } from '@personal-finance/shared';
import {
  Settings,
  User,
  Tags,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Moon,
  Sun,
  Shield,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, theme, toggleTheme, categories, triggerRefresh } = useFinance();
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome?.toString() || '120000');
  const [rules, setRules] = useState<MerchantRule[]>([]);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newPattern, setNewPattern] = useState('');
  const [newMerchant, setNewMerchant] = useState('');
  const [newCategory, setNewCategory] = useState('cat_food');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadRules = async () => {
      const r = await dataProvider.getRules();
      setRules(r);
    };
    loadRules();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataProvider.updateUser({
      monthlyIncome: parseFloat(monthlyIncome) || 0,
    });
    setIsSaved(true);
    triggerRefresh();
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern || !newMerchant) return;

    await dataProvider.addCustomRule({
      userId: 'user_demo_1',
      pattern: newPattern,
      merchantName: newMerchant,
      categoryId: newCategory,
      confidenceScore: 0.99,
    });

    setIsAddingRule(false);
    setNewPattern('');
    setNewMerchant('');
    const updated = await dataProvider.getRules();
    setRules(updated);
  };

  const handleExportJSON = () => {
    const data = storageService.exportAllData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rupeetrack_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          storageService.importAllData(parsed);
          triggerRefresh();
          alert('Data restored successfully!');
        } catch {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all financial records back to initial realistic Indian demo data?')) {
      storageService.resetToDemo();
      triggerRefresh();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Settings & Data Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Profile configurations, merchant auto-categorization rules, and full JSON/CSV data backup
        </p>
      </div>

      {/* Profile & Currency Configuration */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
          <User className="w-4 h-4 text-brand-500" />
          <span>Financial Profile</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly In-hand Income (₹)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Currency
              </label>
              <input
                type="text"
                disabled
                value="INR (₹) - Indian Rupee"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Appearance Mode
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all"
            >
              Save Profile
            </button>
            {isSaved && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">✓ Saved</span>}
          </div>
        </form>
      </div>

      {/* Auto-Categorization Merchant Rules */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <Tags className="w-4 h-4 text-brand-500" />
              <span>Merchant Auto-Categorization Rules</span>
            </h3>
            <p className="text-xs text-slate-400">Rules applied automatically during bank statement PDF import</p>
          </div>

          <button
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>
        </div>

        {isAddingRule && (
          <form onSubmit={handleAddRule} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keyword / Pattern</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STARBUCKS"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Merchant Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks Cafe"
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              Save Rule
            </button>
          </form>
        )}

        {/* Rules Table */}
        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="pb-2">Pattern</th>
                <th className="pb-2">Merchant Name</th>
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {rules.slice(0, 10).map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 font-mono text-[11px] text-brand-600 dark:text-brand-400">{r.pattern}</td>
                  <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{r.merchantName}</td>
                  <td className="py-2.5 text-slate-500">{categories.find((c) => c.id === r.categoryId)?.name || r.categoryId}</td>
                  <td className="py-2.5 text-right font-bold text-emerald-600">{Math.round(r.confidenceScore * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" />
          <span>Data Backup & Restore</span>
        </h3>
        <p className="text-xs text-slate-500">
          Your financial records belong to you. Export a full JSON archive or restore anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete JSON Backup</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Restore From JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-900/40 transition-colors ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
