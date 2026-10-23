import React from 'react';
import { Volume2, VolumeX, Star, Compass } from 'lucide-react';
import { ActiveTab } from '../types/math';
import { sounds } from '../utils/audio';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalStars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  userAvatarUrl: string;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  totalStars,
  soundEnabled,
  onToggleSound,
  userAvatarUrl,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8 shadow-xs">
      {/* Zone 1: Brand Wordmark (one line) */}
      <div
        onClick={() => {
          sounds.playClick();
          onTabChange('adventure');
        }}
        className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group select-none"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
          <Compass className="w-5 h-5" />
        </div>
        <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
          Toán 2 Phiêu Lưu Ký
        </span>
      </div>

      {/* Zone 2: Single-line Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('adventure');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'adventure'
              ? 'bg-amber-100 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          Bản Đồ Đảo
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('speed_race');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'speed_race'
              ? 'bg-amber-100 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          Đua Xe Tính Nhẩm
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('manipulatives');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'manipulatives'
              ? 'bg-amber-100 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          Góc Thực Hành
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('achievements');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-amber-100 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          Huy Hiệu
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Total Stars Pill */}
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300/80 px-2.5 py-1 rounded-xl text-xs font-black text-amber-900 shadow-xs">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="font-mono">{totalStars}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Avatar Mini Icon */}
        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('achievements');
          }}
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 hover:scale-105 transition-transform cursor-pointer shadow-xs"
          title="Hồ sơ của bé"
        >
          <img src={userAvatarUrl} alt="Bé" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
};
