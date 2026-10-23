import React from 'react';
import { Star, Lock, CheckCircle, Play, Sparkles, BookOpen } from 'lucide-react';
import { IslandInfo, LevelInfo, Language } from '../types/math';
import { getUIText, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds } from '../utils/audio';

interface Props {
  islands: IslandInfo[];
  totalStars: number;
  completedLevels: Record<string, number>;
  onSelectLevel: (level: LevelInfo) => void;
  heroBannerUrl: string;
  language: Language;
}

export const AdventureMap: React.FC<Props> = ({
  islands,
  totalStars,
  completedLevels,
  onSelectLevel,
  heroBannerUrl,
  language,
}) => {
  const totalLevels = islands.reduce((acc, isl) => acc + isl.levels.length, 0);
  const completedCount = Object.keys(completedLevels).length;
  const progressPercent = Math.round((completedCount / totalLevels) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-amber-200 bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-600">
        <div className="relative h-60 sm:h-72 w-full overflow-hidden">
          <img
            src={heroBannerUrl}
            alt="Bản đồ học toán lớp 2"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('/assets/images/hero_math_adventure')) {
                target.src = '/assets/images/hero_math_adventure_1792732529554.jpg';
              }
            }}
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-black px-3 py-1 rounded-full text-xs max-w-fit shadow-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
              <span>{language === 'en' ? TEXTBOOK_NAME_EN : TEXTBOOK_NAME_VI}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md text-white text-balance">
              {getUIText(language, 'heroTitle')}
            </h1>

            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl font-medium mt-1 leading-relaxed">
              {getUIText(language, 'heroDesc')}
            </p>
          </div>
        </div>

        {/* Global Progress Bar Strip */}
        <div className="bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-100">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="text-sm font-black text-amber-950 font-mono">
                {totalStars} {getUIText(language, 'starsCount')}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-2xl">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-black text-blue-950 font-mono">
                {completedCount} / {totalLevels} {getUIText(language, 'levelsCompleted')}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>{getUIText(language, 'progressLabel')}</span>
              <span className="font-mono text-amber-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Islands Grid */}
      <div className="space-y-8">
        {islands.map((island, islandIdx) => {
          return (
            <div
              key={island.id}
              className="bg-white/90 backdrop-blur-xs border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
            >
              {/* Island Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-start sm:items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-2xl bg-amber-50 border border-amber-200 shrink-0">
                    {island.icon}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider bg-amber-100/70 px-2 py-0.5 rounded-md">
                        {language === 'en' ? `Island 0${islandIdx + 1}` : `Hòn Đảo 0${islandIdx + 1}`}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-600" />
                        <span>{language === 'en' ? island.textbookChapterEn : island.textbookChapter}</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {language === 'en' ? island.titleEn : island.title}
                    </h2>
                    {language === 'bilingual' && (
                      <p className="text-xs font-bold text-sky-700 italic">{island.titleEn}</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 max-w-md md:text-right font-medium leading-relaxed">
                  {language === 'en' ? island.descriptionEn : island.description}
                </p>
              </div>

              {/* Island Level Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {island.levels.map((lvl) => {
                  const isUnlocked = totalStars >= lvl.requiredStarsToUnlock;
                  const starsEarned = completedLevels[lvl.id] || 0;
                  const isCompleted = starsEarned > 0;

                  return (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        if (isUnlocked) {
                          sounds.playClick();
                          onSelectLevel(lvl);
                        } else {
                          sounds.playWrong();
                        }
                      }}
                      disabled={!isUnlocked}
                      className={`relative group rounded-2xl p-4 text-left transition-all border-2 flex flex-col justify-between h-44 cursor-pointer ${
                        !isUnlocked
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-300 hover:shadow-md'
                          : 'bg-amber-50/50 hover:bg-amber-100/60 border-amber-300 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Top Node Pill */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                            !isUnlocked
                              ? 'bg-slate-200 text-slate-500'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {lvl.levelNumber}
                        </span>

                        {!isUnlocked ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{lvl.requiredStarsToUnlock} ⭐</span>
                          </div>
                        ) : isCompleted ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= starsEarned
                                    ? 'text-amber-500 fill-amber-400'
                                    : 'text-slate-200 fill-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Play className="w-2.5 h-2.5 fill-amber-700" />
                            <span>{getUIText(language, 'playNow')}</span>
                          </span>
                        )}
                      </div>

                      {/* Level Title and subtitle */}
                      <div className="my-1.5 flex-1 flex flex-col justify-center">
                        {lvl.textbookLesson && (
                          <span className="text-[9px] font-bold text-slate-400 line-clamp-1 block mb-0.5">
                            {language === 'en' && lvl.textbookLessonEn ? lvl.textbookLessonEn : lvl.textbookLesson}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2">
                          {language === 'en' && lvl.titleEn ? lvl.titleEn : lvl.title}
                        </h4>
                        {language === 'bilingual' && lvl.titleEn && (
                          <p className="text-[10px] text-sky-700 font-semibold italic line-clamp-1">
                            {lvl.titleEn}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500 line-clamp-2 font-medium mt-0.5">
                          {language === 'en' && lvl.subtitleEn ? lvl.subtitleEn : lvl.subtitle}
                        </p>
                      </div>

                      {/* Status footer */}
                      <div className="text-[10px] font-bold mt-auto text-slate-400 border-t border-slate-100/80 pt-1.5">
                        {isCompleted
                          ? `${starsEarned}/3 ${getUIText(language, 'starsCount')}`
                          : isUnlocked
                          ? (language === 'en' ? 'Ready to play' : 'Sẵn sàng thử thách')
                          : (language === 'en' ? `Needs ${lvl.requiredStarsToUnlock} stars` : `Cần ${lvl.requiredStarsToUnlock} sao mở khóa`)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
