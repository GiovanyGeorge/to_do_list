import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Copy, Check, Trash2, Bookmark, Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useBibleStore } from "@/store/useBibleStore";
import { useSoundManager } from "@/hooks/useSoundManager";

export const BibleFavoritesModal: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const {
    favorites,
    isFavoritesModalOpen,
    closeFavoritesModal,
    fetchFavorites,
    removeFavorite,
  } = useBibleStore();

  const { playSound } = useSoundManager();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (isFavoritesModalOpen) {
      fetchFavorites(searchQuery);
    }
  }, [isFavoritesModalOpen, searchQuery, fetchFavorites]);

  const handleCopy = async (verse: typeof favorites[0]) => {
    const bookName = isArabic ? verse.book_name_ar : verse.book_name_en;
    const fullText = `"${verse.text}" — ${bookName} ${verse.chapter}:${verse.verse} (ترجمة فان دايك)`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedId(verse.id);
      playSound("navigation");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy verse:", err);
    }
  };

  const handleRemove = async (verseId: number) => {
    playSound("delete");
    await removeFavorite(verseId);
  };

  return (
    <Modal
      isOpen={isFavoritesModalOpen}
      onClose={closeFavoritesModal}
      title={isArabic ? "الآيات المحفوظة في المفضلة" : "Favorite Bible Verses"}
      description={
        isArabic
          ? "مجموعتك من الآيات المفضلة من ترجمة فان دايك (Smith & Van Dyke) محفوظة بالكامل بدون إنترنت."
          : "Your saved collection of inspiring verses from the Smith & Van Dyke translation, fully offline."
      }
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              isArabic
                ? "ابحث في الآيات المحفوظة أو اسم السفر..."
                : "Search saved verses or book name..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-xl bg-white text-sm text-[#1C1917] placeholder-[#78716C] border border-[rgba(28,25,23,0.12)] focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
          />
        </div>

        {/* Favorites List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {favorites.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[rgba(28,25,23,0.08)] flex items-center justify-center text-[#C2410C] mb-3">
                <Bookmark className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h4 className="text-sm font-semibold text-[#1C1917] mb-1">
                {searchQuery
                  ? isArabic
                    ? "لا توجد نتائج مطابقة لبحثك"
                    : "No matching verses found"
                  : isArabic
                  ? "لا توجد آيات محفوظة بعد"
                  : "No favorite verses saved yet"}
              </h4>
              <p className="text-xs text-[#78716C] max-w-xs">
                {isArabic
                  ? "اضغط على أيقونة القلب في نافذة آية اليوم لإضافة الآيات إلى مفضلتك هنا."
                  : "Click the heart icon on today's verse to add it to your favorites."}
              </p>
            </div>
          ) : (
            favorites.map((item) => {
              const bookTitle = isArabic ? item.book_name_ar : item.book_name_en;
              const dateSaved = new Intl.DateTimeFormat(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date(item.favorited_at));

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#FAF7F2] hover:bg-white border border-[rgba(28,25,23,0.08)] hover:border-[#C2410C]/30 hover:shadow-card transition-all group"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#C2410C] border border-[#C2410C]/20">
                        <Sparkles className="w-3 h-3 text-[#C2410C]" />
                        <span>فان دايك</span>
                      </span>

                      <h5 className="text-sm font-bold text-[#1C1917]">
                        {bookTitle} {item.chapter}:{item.verse}
                      </h5>
                    </div>

                    <div className="flex items-center gap-1 text-[#78716C]">
                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        className="p-1.5 rounded-lg hover:text-[#1C1917] hover:bg-white transition-colors"
                        title="Copy verse"
                        aria-label="Copy verse"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-[#15803D]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Remove Favorite */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 rounded-lg hover:text-[#B91C1C] hover:bg-[#B91C1C]/10 transition-colors"
                        title="Remove from favorites"
                        aria-label="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {item.heading && (
                    <div className="text-xs font-semibold text-[#78716C] mb-1.5 font-cairo pb-1 border-b border-[rgba(28,25,23,0.06)]">
                      {item.heading}
                    </div>
                  )}
                  <p className="font-cairo text-sm leading-relaxed text-[#1C1917] font-medium text-justify rtl:text-right">
                    {item.text}
                  </p>

                  <div className="mt-2 text-[11px] text-[#78716C] flex items-center justify-between">
                    <span>
                      {isArabic ? "أُضيفت في: " : "Saved on: "}
                      {dateSaved}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
