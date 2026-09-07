import React, { useState } from 'react';
import { Category, Transaction } from '@personal-finance/types';
import { dataProvider } from '../../services/dataProvider';
import {
  X,
  Search,
  Check,
  Tag,
  Plus,
  Sparkles,
  Layers,
  ArrowRight,
  BookmarkPlus,
} from 'lucide-react';

interface CategorySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionsToUpdate: Transaction[];
  categories: Category[];
  onSuccess: () => void;
}

export const CategorySelectModal: React.FC<CategorySelectModalProps> = ({
  isOpen,
  onClose,
  transactionsToUpdate,
  categories,
  onSuccess,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [saveAsRule, setSaveAsRule] = useState<boolean>(true);
  const [rulePattern, setRulePattern] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // New Category Inline Form State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [newSubName, setNewSubName] = useState('');

  // Extract common pattern when modal opens for single transaction
  React.useEffect(() => {
    if (transactionsToUpdate.length === 1) {
      const tx = transactionsToUpdate[0];
      setSelectedCatId(tx.categoryId || '');
      setSelectedSubId(tx.subcategoryId || '');

      // Suggest clean keyword for merchant rule
      const raw = tx.description || '';
      const cleanMatch = raw
        .replace(/^UPI[-/](?:DR|CR|P2M|P2P)[-/]?/i, '')
        .replace(/^UPI[-/]/i, '')
        .replace(/@\w+/g, '')
        .replace(/\/.*$/, '')
        .trim();
      const keyword = cleanMatch.split(/[\s/]/)[0] || raw.slice(0, 15);
      setRulePattern(keyword.toUpperCase());
    } else if (transactionsToUpdate.length > 1) {
      setSelectedCatId('');
      setSelectedSubId('');
      setRulePattern('');
      setSaveAsRule(false);
    }
    setIsCreatingNew(false);
    setSearch('');
  }, [transactionsToUpdate, isOpen]);

  if (!isOpen || transactionsToUpdate.length === 0) return null;

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    if (c.name.toLowerCase().includes(q)) return true;
    return c.subcategories?.some((s) => s.name.toLowerCase().includes(q));
  });

  const activeCategory = categories.find((c) => c.id === selectedCatId);

  const handleSelectCategory = (catId: string, subId?: string) => {
    setSelectedCatId(catId);
    setSelectedSubId(subId || '');
  };

  const handleCreateCustomCategory = async () => {
    if (!newCatName.trim()) return;
    setIsSaving(true);
    try {
      const subcategories = newSubName.trim()
        ? [{ id: `sub_${Date.now()}`, categoryId: '', name: newSubName.trim(), icon: newCatIcon }]
        : [];

      const created = await dataProvider.createCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
        isEssential: true,
        subcategories: subcategories as any,
      });

      setSelectedCatId(created.id);
      if (created.subcategories && created.subcategories.length > 0) {
        setSelectedSubId(created.subcategories[0].id);
      }
      setIsCreatingNew(false);
      setNewCatName('');
      setNewSubName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = async () => {
    if (!selectedCatId) return;
    setIsSaving(true);
    try {
      const updates = {
        categoryId: selectedCatId,
        subcategoryId: selectedSubId || undefined,
      };

      if (transactionsToUpdate.length === 1) {
        await dataProvider.updateTransaction(transactionsToUpdate[0].id, updates);

        // If rule pattern is provided and rule saving is active
        if (saveAsRule && rulePattern.trim()) {
          const selectedCat = categories.find((c) => c.id === selectedCatId);
          await dataProvider.addCustomRule({
            userId: transactionsToUpdate[0]?.userId || 'user_kailash',
            pattern: rulePattern.trim().toUpperCase(),
            merchantName: selectedCat?.name || rulePattern.trim(),
            categoryId: selectedCatId,
            subcategoryId: selectedSubId || undefined,
            confidenceScore: 0.99,
          });

          // Run auto-categorize to apply this new rule to any other matching transactions
          await dataProvider.autoCategorizeTransactions(true);
        }
      } else {
        // Batch update
        const ids = transactionsToUpdate.map((t) => t.id);
        await dataProvider.batchUpdateTransactions(ids, updates);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to categorize:', err);
      alert('Failed to update category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isMultiple = transactionsToUpdate.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {isMultiple
                  ? `Categorize ${transactionsToUpdate.length} Transactions`
                  : 'Change Category'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {isMultiple
                  ? `Batch update selected expenses to a new category`
                  : transactionsToUpdate[0]?.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Search or Create Mode Switch */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories (e.g., Food, Groceries, Rent, Fuel)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isCreatingNew
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingNew ? 'Browse Existing' : 'New Category'}</span>
            </button>
          </div>

          {/* New Custom Category Form */}
          {isCreatingNew ? (
            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/50 space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-brand-900 dark:text-brand-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Custom Category</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Pet Care, Coaching, Books"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Subcategory Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dog Food / Tuition Fee"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={!newCatName.trim() || isSaving}
                  onClick={handleCreateCustomCategory}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  Create & Select
                </button>
              </div>
            </div>
          ) : (
            /* Category Grid */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCatId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{cat.icon}</span>
                        <span className="font-bold text-xs truncate">{cat.name}</span>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Subcategories (if selected category has subcategories) */}
              {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{activeCategory.name} Subcategories</span>
                    </span>
                    {selectedSubId && (
                      <button
                        onClick={() => setSelectedSubId('')}
                        className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline"
                      >
                        Clear Subcategory
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {activeCategory.subcategories.map((sub) => {
                      const isSubSelected = selectedSubId === sub.id;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedSubId(isSubSelected ? '' : sub.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSubSelected
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <span>{sub.icon}</span>
                          <span>{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Smart Merchant Rule Learning (Single Txn only) */}
          {!isMultiple && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveAsRule}
                  onChange={(e) => setSaveAsRule(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Always remember this categorization rule</span>
                </span>
              </label>

              {saveAsRule && (
                <div className="pl-6 space-y-1">
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80">
                    Future bank & UPI imports containing this keyword will automatically be categorized:
                  </p>
                  <input
                    type="text"
                    value={rulePattern}
                    onChange={(e) => setRulePattern(e.target.value)}
                    placeholder="Merchant / Keyword"
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedCatId || isSaving}
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSaving ? 'Applying...' : isMultiple ? `Apply to ${transactionsToUpdate.length} Transactions` : 'Save Category'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
