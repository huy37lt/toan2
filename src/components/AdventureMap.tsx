import React from 'react';
import { Star, Lock, CheckCircle, Play, Sparkles } from 'lucide-react';
import { IslandInfo, LevelInfo } from '../types/math';
import { sounds } from '../utils/audio';

interface Props {
  islands: IslandInfo[];
  totalStars: number;
  completedLevels: Record<string, number>;
  onSelectLevel: (level: LevelInfo) => void;
  heroBannerUrl: string;
}

export const AdventureMap: React.FC<Props> = ({
  islands,
  totalStars,
  completedLevels,
  onSelectLevel,
  heroBannerUrl,
}) => {
  const totalLevels = islands.reduce((acc, isl) => acc + isl.levels.length, 0);
  const completedCount = Object.keys(completedLevels).length;
  const progressPercent = Math.round((completedCount / totalLevels) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-amber-200 bg-amber-50">
        <div className="relative h-56 sm:h-72 w-full overflow-hidden">
          <img
            src={heroBannerUrl}
            alt="Bản đồ học toán lớp 2"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-black px-3 py-1 rounded-full text-xs max-w-fit shadow-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
              <span>Chương trình chuẩn Toán Lớp 2</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md text-white text-balance">
              Hành Trình Chinh Phục Toán Học
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl font-medium mt-1">
              Khám phá 4 hòn đảo kỳ thú: rèn luyện cộng trừ có nhớ, bảng nhân chia 2 & 5, xem đồng hồ kim và hình học vui nhộn!
            </p>
          </div>
        </div>

        {/* Global Progress Bar Strip */}
        <div className="bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-100">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="text-sm font-black text-amber-950 font-mono">
                {totalStars} Sao vàng
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-2xl">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-black text-blue-950 font-mono">
                {completedCount} / {totalLevels} Màn
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Tiến độ hành trình</span>
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
              className="bg-white/90 backdrop-blur-xs border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Island Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-amber-50 border border-amber-200">
                    {island.icon}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Hòn Đảo 0{islandIdx + 1}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                      {island.title}
                    </h2>
                  </div>
                </div>
                <p className="text-xs text-slate-500 max-w-md sm:text-right font-medium">
                  {island.description}
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
                      className={`relative group rounded-2xl p-4 text-left transition-all border-2 flex flex-col justify-between h-40 cursor-pointer ${
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
                            <span>Chơi</span>
                          </span>
                        )}
                      </div>

                      {/* Level Title and subtitle */}
                      <div className="my-2">
                        <h4 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">
                          {lvl.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-medium">
                          {lvl.subtitle}
                        </p>
                      </div>

                      {/* Status footer */}
                      <div className="text-[10px] font-bold mt-auto text-slate-400">
                        {isCompleted
                          ? `${starsEarned}/3 Sao đạt được`
                          : isUnlocked
                          ? 'Sẵn sàng thử thách'
                          : `Cần ${lvl.requiredStarsToUnlock} sao mở khóa`}
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
