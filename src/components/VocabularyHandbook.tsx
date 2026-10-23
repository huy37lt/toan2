import React, { useState } from 'react';
import { BookOpen, Search, Volume2, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { Language, MathVocabItem } from '../types/math';
import { MATH_VOCABULARY_LIST, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds, speakText } from '../utils/audio';

interface Props {
  language: Language;
}

export const VocabularyHandbook: React.FC<Props> = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Phép cộng', 'Phép trừ', 'Phép nhân', 'Phép chia', 'Đo lường', 'Thời gian', 'Hình phẳng'];

  const filteredList = MATH_VOCABULARY_LIST.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      item.vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.noteVi && item.noteVi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.noteEn && item.noteEn.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handlePronounce = (text: string, lang: 'vi' | 'en') => {
    sounds.playClick();
    speakText(text, lang);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'en' ? TEXTBOOK_NAME_EN : TEXTBOOK_NAME_VI}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'en'
              ? 'Grade 2 Math Bilingual Vocabulary Handbook'
              : 'Sổ Tay Thuật Ngữ Toán 2 Song Ngữ Việt - Anh'}
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            {language === 'en'
              ? 'Complete list of essential mathematical terms aligned with the standard curriculum. Listen to authentic pronunciations in both Vietnamese and English.'
              : 'Tra cứu đầy đủ các thuật ngữ chuẩn SGK "Kết nối tri thức với cuộc sống", kèm bản dịch tiếng Anh chuẩn quốc tế và giọng đọc phát âm từng từ.'}
          </p>
        </div>

        {/* Decorative corner emoji */}
        <div className="absolute right-4 bottom-2 text-7xl opacity-20 select-none">📖</div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-emerald-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search input */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              language === 'en'
                ? 'Search terms (e.g., addend, sum, minuend, kilogram)...'
                : 'Tìm kiếm thuật ngữ (ví dụ: số hạng, tổng, thừa số, lít)...'
            }
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat === 'all' ? (language === 'en' ? 'All Terms' : 'Tất cả') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Terms Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md space-y-3"
          >
            {/* Top row: Category badge & Pronounce triggers */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                {item.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePronounce(item.vi, 'vi')}
                  className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200 cursor-pointer transition-colors"
                  title="Nghe đọc tiếng Việt"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>VI</span>
                </button>
                <button
                  onClick={() => handlePronounce(item.en, 'en')}
                  className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-bold flex items-center gap-1 border border-sky-200 cursor-pointer transition-colors"
                  title="Listen in English"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-700" />
                  <span>EN</span>
                </button>
              </div>
            </div>

            {/* Term Title VI & EN */}
            <div className="space-y-0.5">
              <div className="text-lg font-black text-slate-900 flex items-baseline gap-2">
                <span>{item.vi}</span>
                {item.pronounceEn && (
                  <span className="text-xs text-slate-400 font-mono font-normal">{item.pronounceEn}</span>
                )}
              </div>
              <div className="text-sm font-extrabold text-emerald-700">{item.en}</div>
            </div>

            {/* Definitions */}
            <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              <p>
                <strong className="text-slate-800 font-bold">SGK: </strong>
                {language === 'en' && item.noteEn ? item.noteEn : item.noteVi}
              </p>
              {language === 'bilingual' && item.noteEn && (
                <p className="text-slate-500 italic border-t border-slate-200/60 pt-1">
                  <strong className="text-slate-600 not-italic font-semibold">EN: </strong>
                  {item.noteEn}
                </p>
              )}
            </div>

            {/* Example formula */}
            {(item.exampleVi || item.exampleEn) && (
              <div className="text-xs font-mono bg-emerald-50/60 border border-emerald-200/60 px-3 py-1.5 rounded-xl text-emerald-900 flex items-center justify-between">
                <span>
                  {language === 'en' && item.exampleEn ? item.exampleEn : item.exampleVi}
                </span>
                <span className="text-[10px] font-sans font-bold text-emerald-600 uppercase">Ví dụ</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-sm">
            {language === 'en' ? 'No vocabulary found matching your search.' : 'Không tìm thấy thuật ngữ phù hợp.'}
          </p>
        </div>
      )}
    </div>
  );
};
