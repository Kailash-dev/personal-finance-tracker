import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { parsePdfInBrowser, ClientParsedStatementResult } from '../lib/pdfClientParser';
import { dataProvider } from '../services/dataProvider';
import { INDIAN_BANKS, formatINR } from '@personal-finance/shared';
import { BankImportTransaction, BankName } from '@personal-finance/types';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImportPage: React.FC = () => {
  const { accounts, categories, triggerRefresh } = useFinance();
  const navigate = useNavigate();

  const [selectedBank, setSelectedBank] = useState<BankName>('HDFC');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || 'acc_hdfc_salary');
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ClientParsedStatementResult | null>(null);
  const [transactions, setTransactions] = useState<BankImportTransaction[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartParsing = async () => {
    if (!file) return;
    setIsParsing(true);
    try {
      const result = await parsePdfInBrowser(file, selectedAccountId, selectedBank);
      setParseResult(result);
      setTransactions(result.transactions);
    } catch (err) {
      console.error('Parsing failed:', err);
      alert('Failed to parse bank statement. Please verify file format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpdateCategory = (id: string, categoryId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, categoryId, confidence: 1.0 } : t))
    );
  };

  const handleToggleSkip = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isSkipped: !t.isSkipped } : t))
    );
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    try {
      await dataProvider.confirmBankImport(selectedAccountId, transactions);
      triggerRefresh();
      alert(`Successfully imported ${transactions.filter((t) => !t.isSkipped).length} transactions!`);
      navigate('/transactions');
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const totalParsed = transactions.length;
  const duplicateCount = transactions.filter((t) => t.isDuplicate).length;
  const autoCategorizedCount = transactions.filter((t) => t.confidence >= 0.7).length;
  const needReviewCount = transactions.filter((t) => t.confidence < 0.7 && !t.isSkipped).length;
  const activeImportCount = transactions.filter((t) => !t.isSkipped).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Bank Statement PDF Import
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload PDF bank statement, auto-categorize with merchant rules, review, and prevent duplicate entries
        </p>
      </div>

      {!parseResult ? (
        /* Upload & Configuration Form */
        <div className="max-w-2xl mx-auto glass-card p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Bank Format
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value as BankName)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {INDIAN_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.icon} {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatINR(a.currentBalance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag and drop upload zone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center hover:border-brand-500 dark:hover:border-brand-400 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {file ? file.name : 'Choose Bank Statement PDF'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports HDFC, SBI, ICICI, Axis, Kotak and standard Indian bank PDFs
              </p>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              onClick={handleStartParsing}
              disabled={!file || isParsing}
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting & Categorizing...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Extract Transactions</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Staged Import Review Screen */
        <div className="space-y-6">
          {/* Staging Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-card p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Found</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalParsed}</p>
              <span className="text-xs text-slate-500">Extracted from PDF</span>
            </div>
            <div className="glass-card p-4">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                Auto-Categorized
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {autoCategorizedCount}
              </p>
              <span className="text-xs text-slate-500">Confidence &gt; 70%</span>
            </div>
            <div className="glass-card p-4">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                Needs Review
              </span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{needReviewCount}</p>
              <span className="text-xs text-slate-500">Low confidence category</span>
            </div>
            <div className="glass-card p-4">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase">
                Duplicates Flagged
              </span>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{duplicateCount}</p>
              <span className="text-xs text-slate-500">Default set to Skip</span>
            </div>
          </div>

          {/* Staged Transactions Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Review Extracted Transactions
                </h3>
                <p className="text-xs text-slate-400">
                  Verify or edit categories before confirming final import
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setParseResult(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={isImporting || activeImportCount === 0}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Import {activeImportCount} Transactions</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Import?</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {transactions.map((t) => {
                    const isIncome = t.type === 'INCOME';
                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          t.isSkipped ? 'opacity-50 bg-slate-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={!t.isSkipped}
                            onChange={() => handleToggleSkip(t.id)}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{t.date}</td>
                        <td className="py-3 px-4 max-w-sm">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{t.description}</p>
                          {t.isDuplicate && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                              <ShieldAlert className="w-3 h-3" />
                              <span>{t.duplicateReason || 'Potential duplicate'}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            value={t.categoryId || 'cat_misc'}
                            onChange={(e) => handleUpdateCategory(t.id, e.target.value)}
                            className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.icon} {c.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.confidence >= 0.9
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : t.confidence >= 0.7
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {Math.round(t.confidence * 100)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-bold">
                          <span className={isIncome ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}>
                            {formatINR(Math.abs(t.amount))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
