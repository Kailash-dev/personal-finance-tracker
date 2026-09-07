import React, { useState } from 'react';
import { Category, Subcategory } from '@personal-finance/types';
import { dataProvider } from '../../services/dataProvider';
import {
  X,
  Plus,
  Tag,
  Check,
  Edit2,
  FolderPlus,
  Sparkles,
  Layers,
  Palette,
} from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#EF4444', // Red
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#F97316', // Orange
  '#64748B', // Slate
];

const PRESET_EMOJIS = ['🍛', '🛒', '🏠', '⚡', '⛽', '💳', '📈', '🧹', '💊', '🛍️', '✈️', '🎮', '👶', '📚', '🤝', '☕', '🎁', '🏖️', '💻', '💼'];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [isEssential, setIsEssential] = useState(true);

  // Subcategory addition state
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('📌');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSaving(true);
    try {
      const created = await dataProvider.createCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
        isEssential,
        subcategories: [],
      });
      setSelectedCatId(created.id);
      setIsAddingNewCat(false);
      setNewCatName('');
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to create category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory || !newSubName.trim()) return;

    setIsSaving(true);
    try {
      const updatedSubs = [
        ...(activeCategory.subcategories || []),
        {
          id: `sub_${Date.now()}`,
          categoryId: activeCategory.id,
          name: newSubName.trim(),
          icon: newSubIcon,
        },
      ];

      await dataProvider.updateCategory(activeCategory.id, {
        subcategories: updatedSubs,
      });

      setIsAddingSub(false);
      setNewSubName('');
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to add subcategory');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Manage Expense Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize and organize your budget categories and subcategories
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Categories List (Left 2 cols) */}
          <div className="md:col-span-2 space-y-2 border-r border-slate-100 dark:border-slate-800 pr-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Categories</span>
              <button
                type="button"
                onClick={() => setIsAddingNewCat(true)}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCatId === cat.id && !isAddingNewCat;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCatId(cat.id);
                      setIsAddingNewCat(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base shrink-0">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </div>

                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 font-semibold">
                      {cat.subcategories?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details & Subcategories (Right 3 cols) */}
          <div className="md:col-span-3 space-y-4">
            {isAddingNewCat ? (
              /* Add New Category Form */
              <form onSubmit={handleCreateCategory} className="p-4 rounded-2xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/40 space-y-3">
                <h3 className="text-xs font-bold text-brand-900 dark:text-brand-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Create New Category</span>
                </h3>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Freelance Tools, Pet Care"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Emoji Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Choose Emoji</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCatIcon(emoji)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform ${
                          newCatIcon === emoji ? 'bg-brand-600 scale-110 shadow-sm' : 'bg-white dark:bg-slate-800 hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Badge Color</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          newCatColor === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-125' : 'hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !newCatName.trim()}
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : activeCategory ? (
              /* Subcategories List for Selected Category */
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCategory.icon}</span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {activeCategory.name}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {activeCategory.isEssential ? 'Essential Need' : 'Discretionary / Want'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingSub(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subcategory</span>
                  </button>
                </div>

                {isAddingSub && (
                  <form onSubmit={handleAddSubcategory} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-fade-in">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-3">
                        <input
                          type="text"
                          required
                          placeholder="Subcategory name (e.g. Organic Milk)"
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={newSubIcon}
                          onChange={(e) => setNewSubIcon(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingSub(false)}
                        className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving || !newSubName.trim()}
                        className="px-3.5 py-1 rounded-lg bg-brand-600 text-white font-bold text-xs"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {(!activeCategory.subcategories || activeCategory.subcategories.length === 0) ? (
                    <p className="text-xs text-slate-400 italic p-3 text-center">
                      No subcategories yet. Tap "+ Add Subcategory" to add one.
                    </p>
                  ) : (
                    activeCategory.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{sub.icon}</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {sub.name}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-extrabold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
