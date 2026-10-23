import React from 'react';
import { Volume2, VolumeX, Star, Compass, BookOpen, Globe } from 'lucide-react';
import { ActiveTab, Language } from '../types/math';
import { getUIText, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds } from '../utils/audio';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalStars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  userAvatarUrl: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  totalStars,
  soundEnabled,
  onToggleSound,
  userAvatarUrl,
  language,
  onLanguageChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-xs">
      {/* Zone 1: Brand Wordmark & Textbook tag */}
      <div
        onClick={() => {
          sounds.playClick();
          onTabChange('adventure');
        }}
        className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group select-none"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
          <Compass className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
            {getUIText(language, 'appTitle')}
          </span>
          <span className="text-[10px] text-amber-800 font-extrabold hidden md:inline-block">
            {language === 'en' ? 'Connecting Knowledge to Life' : 'SGK Kết Nối Tri Thức'}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('adventure');
          }}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'adventure'
              ? 'bg-amber-100 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          {getUIText(language, 'navMap')}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('speed_race');
          }}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'speed_race'
              ? 'bg-amber-100 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          {getUIText(language, 'navRace')}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('manipulatives');
          }}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'manipulatives'
              ? 'bg-amber-100 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          {getUIText(language, 'navLab')}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('vocabulary');
          }}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
            activeTab === 'vocabulary'
              ? 'bg-emerald-100 text-emerald-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>{getUIText(language, 'navVocab')}</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onTabChange('achievements');
          }}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-amber-100 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          {getUIText(language, 'navBadges')}
        </button>
      </nav>

      {/* Zone 3: Language Switcher & Utilities */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Language selector toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              sounds.playClick();
              onLanguageChange('vi');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
              language === 'vi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tiếng Việt (SGK Kết nối tri thức)"
          >
            VI
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onLanguageChange('bilingual');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
              language === 'bilingual' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Song ngữ VI - EN"
          >
            VI•EN
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onLanguageChange('en');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
              language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="English"
          >
            EN
          </button>
        </div>

        {/* Total Stars Pill */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-300/80 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-black text-amber-900 shadow-xs">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span className="font-mono">{totalStars}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          title={soundEnabled ? getUIText(language, 'audioOff') : getUIText(language, 'audioOn')}
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
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 hover:scale-105 transition-transform cursor-pointer shadow-xs bg-amber-100"
          title="Hồ sơ của bé"
        >
          <img
            src={userAvatarUrl}
            alt="Bé"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('/assets/images/avatar_cute_owl')) {
                target.src = '/assets/images/avatar_cute_owl_1792732530016.jpg';
              }
            }}
          />
        </button>
      </div>
    </header>
  );
};
