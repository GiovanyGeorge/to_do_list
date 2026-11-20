import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit2,
  Trash2,
  Folder,
  GraduationCap,
  User,
  Briefcase,
  BookOpen,
  HeartPulse,
  Dumbbell,
  Users,
  ShoppingBag,
  Wallet,
  Book,
  House,
  Circle,
  Sparkles,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useSoundManager } from "@/hooks/useSoundManager";
import { useMotion } from "@/hooks/useMotion";
import type { CategoryWithStats } from "@shared/types/database";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  User,
  Briefcase,
  BookOpen,
  HeartPulse,
  Dumbbell,
  Users,
  ShoppingBag,
  Wallet,
  Book,
  House,
  Circle,
  Folder,
  Sparkles,
};

const COLOR_PALETTE = [
  "#C2410C", // Terracotta
  "#15803D", // Warm green
  "#EA580C", // Muted orange
  "#7C3AED", // Purple
  "#16A34A", // Green
  "#65A30D", // Olive
  "#E11D48", // Rose
  "#D97706", // Amber
  "#0D9488", // Teal
  "#9A3412", // Brown
  "#475569", // Slate
  "#78716C", // Neutral
];

export const CategoriesPage: React.FC = () => {
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory } =
    useCategoryStore();
  const { playSound } = useSoundManager();
  const { enabled: motionEnabled } = useMotion();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithStats | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#C2410C");
  const [selectedIcon, setSelectedIcon] = useState("Folder");

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithStats | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setSelectedColor("#C2410C");
    setSelectedIcon("Folder");
    setIsModalOpen(true);
    playSound("navigation");
  };

  const handleOpenEdit = (cat: CategoryWithStats) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setSelectedColor(cat.color || "#C2410C");
    setSelectedIcon(cat.icon || "Folder");
    setIsModalOpen(true);
    playSound("navigation");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: name.trim(),
        description: description.trim() || null,
        color: selectedColor,
        icon: selectedIcon,
      });
      playSound("success");
    } else {
      await createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        icon: selectedIcon,
      });
      playSound("task_create");
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    await deleteCategory(deletingCategory.id);
    setDeletingCategory(null);
    playSound("delete");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[20px] bg-white border border-[rgba(28,25,23,0.08)] shadow-soft-card">
        <div>
          <h1 className="text-2xl font-bold font-sora text-[#1C1917] tracking-tight">
            Categories
          </h1>
          <p className="text-xs text-[#78716C] mt-1 font-medium">
            Organize tasks, study time, and routines with flexible personal categories.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent-gradient text-[#FFFBEB] font-semibold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon || "Folder"] || Folder;
          const progressPercent =
            cat.task_count > 0
              ? Math.round((cat.completed_task_count / cat.task_count) * 100)
              : 0;

          return (
            <motion.div
              key={cat.id}
              whileHover={motionEnabled ? { y: -2 } : undefined}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-[20px] bg-white border border-[rgba(28,25,23,0.08)] shadow-soft-card flex flex-col justify-between hover:shadow-card-hover transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: cat.color || "#C2410C" }}
                    >
                      <IconComponent className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="font-sora font-semibold text-[#1C1917] text-base group-hover:text-[#C2410C] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-[#78716C] font-mono tabular-nums mt-0.5">
                        {cat.completed_task_count} of {cat.task_count} tasks done
                      </p>
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit category"
                      className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F0EAE0] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      title="Delete category"
                      className="p-1.5 rounded-lg text-[#78716C] hover:text-[#B91C1C] hover:bg-[#F0EAE0] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs text-[#78716C] line-clamp-2 mt-1 mb-3">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="pt-3 border-t border-[rgba(28,25,23,0.06)] mt-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#78716C] mb-1 font-sora">
                  <span>Progress</span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0EAE0] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: cat.color || "#C2410C",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md p-6 rounded-[24px] bg-white shadow-soft-card border border-[rgba(28,25,23,0.12)] space-y-4"
            >
              <h2 className="text-lg font-bold font-sora text-[#1C1917]">
                {editingCategory ? "Edit Category" : "New Category"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Study, Fitness, Creative"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0EAE0] text-sm text-[#1C1917] placeholder-[#78716C] border border-[rgba(28,25,23,0.12)] focus:outline-none focus:bg-white focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F0EAE0] text-xs text-[#1C1917] placeholder-[#78716C] border border-[rgba(28,25,23,0.12)] focus:outline-none focus:bg-white focus:border-[#C2410C]"
                  />
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                          selectedColor === c ? "scale-110 ring-2 ring-offset-2 ring-[#C2410C]" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {selectedColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                    Icon
                  </label>
                  <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1">
                    {Object.entries(ICON_MAP).map(([iconKey, IconComponent]) => (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setSelectedIcon(iconKey)}
                        className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                          selectedIcon === iconKey
                            ? "bg-[#C2410C] text-white shadow-sm"
                            : "bg-[#F0EAE0] text-[#78716C] hover:text-[#1C1917]"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#78716C] hover:bg-[#F0EAE0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="px-5 py-2 rounded-full bg-accent-gradient text-[#FFFBEB] font-semibold text-xs shadow-glow hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {editingCategory ? "Save Changes" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Safe Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-[24px] bg-white shadow-soft-card border border-[rgba(28,25,23,0.12)] space-y-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#B91C1C]/10 text-[#B91C1C] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-base text-[#1C1917]">
                  Delete "{deletingCategory.name}"?
                </h3>
                <p className="text-xs text-[#78716C] mt-1.5 leading-relaxed">
                  Associated tasks will be safely preserved and moved to "No Category". No tasks will be deleted.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#78716C] hover:bg-[#F0EAE0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-full bg-[#B91C1C] text-[#FFFBEB] text-xs font-semibold hover:bg-[#991B1B] active:scale-95 shadow-sm transition-all"
                >
                  Delete Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
