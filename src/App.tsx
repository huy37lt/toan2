import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdventureMap } from './components/AdventureMap';
import { QuizArena } from './components/QuizArena';
import { SpeedRaceGame } from './components/SpeedRaceGame';
import { ManipulativesLab } from './components/ManipulativesLab';
import { BadgeShowcase } from './components/BadgeShowcase';
import { VocabularyHandbook } from './components/VocabularyHandbook';
import { INITIAL_ISLANDS, INITIAL_BADGES } from './utils/mathQuestions';
import { ActiveTab, LevelInfo, UserProfile, Badge, Language } from './types/math';
import { sounds } from './utils/audio';

// High-fidelity generated assets imported via Vite bundler
import heroBannerAsset from './assets/images/hero_math_adventure_1792732529554.jpg';
import owlAvatarAsset from './assets/images/avatar_cute_owl_1792732530016.jpg';
import tigerAvatarAsset from './assets/images/mascot_little_tiger_1792732530821.jpg';

const HERO_BANNER_URL = heroBannerAsset;
const OWL_AVATAR_URL = owlAvatarAsset;
const TIGER_AVATAR_URL = tigerAvatarAsset;

const STORAGE_KEY = 'toan_lop_2_save_v1';
const LANG_STORAGE_KEY = 'toan_lop_2_lang_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('adventure');
  const [activeLevel, setActiveLevel] = useState<LevelInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Language state: 'vi' | 'en' | 'bilingual'
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'vi' || saved === 'en' || saved === 'bilingual') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'vi';
  });

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically migrate legacy /src/ paths in localStorage
        if (typeof parsed.avatar === 'string' && parsed.avatar.includes('/src/assets/images/')) {
          parsed.avatar = parsed.avatar.includes('tiger') ? TIGER_AVATAR_URL : OWL_AVATAR_URL;
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return {
      name: 'Bé Thông Thái',
      avatar: OWL_AVATAR_URL,
      totalStars: 0,
      completedLevels: {},
      speedHighScore: 0,
      badges: [],
    };
  });

  // Badges state with unlock status
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  // Save language preference
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  };

  // Sync profile to localStorage and evaluate badges
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }

    // Evaluate badges
    const completedKeys = Object.keys(profile.completedLevels);
    const updatedBadges = INITIAL_BADGES.map((b) => {
      let isUnlocked = profile.badges.includes(b.id);

      if (!isUnlocked) {
        if (b.id === 'badge_first_step' && completedKeys.length >= 1) isUnlocked = true;
        if (
          b.id === 'badge_add_sub_master' &&
          ['lvl_1', 'lvl_2', 'lvl_3', 'lvl_4', 'lvl_5'].every((id) => profile.completedLevels[id])
        ) {
          isUnlocked = true;
        }
        if (
          b.id === 'badge_mult_div_genius' &&
          ['lvl_6', 'lvl_7', 'lvl_8', 'lvl_9', 'lvl_10'].every((id) => profile.completedLevels[id])
        ) {
          isUnlocked = true;
        }
        if (
          b.id === 'badge_time_keeper' &&
          ['lvl_11', 'lvl_12', 'lvl_13', 'lvl_14', 'lvl_15'].every((id) => profile.completedLevels[id])
        ) {
          isUnlocked = true;
        }
        if (b.id === 'badge_math_champion' && profile.completedLevels['lvl_20'] && profile.totalStars >= 50) {
          isUnlocked = true;
        }
        if (b.id === 'badge_speed_racer' && profile.speedHighScore >= 15) {
          isUnlocked = true;
        }
      }

      return {
        ...b,
        unlocked: isUnlocked,
      };
    });

    setBadges(updatedBadges);
  }, [profile]);

  // Audio mute toggle
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sounds.soundEnabled = nextVal;
    if (nextVal) sounds.playClick();
  };

  // Level Complete callback
  const handleLevelComplete = (levelId: string, starsEarned: number) => {
    setProfile((prev) => {
      const prevStars = prev.completedLevels[levelId] || 0;
      const bestStars = Math.max(prevStars, starsEarned);
      const starDiff = bestStars - prevStars;

      const newCompleted = {
        ...prev.completedLevels,
        [levelId]: bestStars,
      };

      return {
        ...prev,
        totalStars: prev.totalStars + starDiff,
        completedLevels: newCompleted,
      };
    });
  };

  // High score in Speed Race
  const handleUpdateHighScore = (newScore: number) => {
    setProfile((prev) => ({
      ...prev,
      speedHighScore: Math.max(prev.speedHighScore, newScore),
    }));
  };

  // Name and Avatar Update
  const handleUpdateProfileName = (newName: string) => {
    setProfile((prev) => ({ ...prev, name: newName }));
  };

  const handleUpdateAvatar = (avatarUrl: string) => {
    setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800">
      {/* Universal Top Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalStars={profile.totalStars}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        userAvatarUrl={profile.avatar}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main View Area */}
      <main className="flex-1 px-4 sm:px-6 py-6 md:py-8 max-w-7xl mx-auto w-full">
        {activeTab === 'adventure' && (
          <AdventureMap
            islands={INITIAL_ISLANDS}
            totalStars={profile.totalStars}
            completedLevels={profile.completedLevels}
            onSelectLevel={setActiveLevel}
            heroBannerUrl={HERO_BANNER_URL}
            language={language}
          />
        )}

        {activeTab === 'speed_race' && (
          <SpeedRaceGame
            onUpdateHighScore={handleUpdateHighScore}
            highScore={profile.speedHighScore}
            mascotTigerUrl={TIGER_AVATAR_URL}
            language={language}
          />
        )}

        {activeTab === 'manipulatives' && <ManipulativesLab language={language} />}

        {activeTab === 'vocabulary' && <VocabularyHandbook language={language} />}

        {activeTab === 'achievements' && (
          <BadgeShowcase
            profile={profile}
            badges={badges}
            onUpdateProfileName={handleUpdateProfileName}
            onUpdateAvatar={handleUpdateAvatar}
            owlAvatarUrl={OWL_AVATAR_URL}
            tigerAvatarUrl={TIGER_AVATAR_URL}
            language={language}
          />
        )}
      </main>

      {/* Quiz Modal Arena */}
      {activeLevel && (
        <QuizArena
          level={activeLevel}
          onClose={() => setActiveLevel(null)}
          onLevelComplete={handleLevelComplete}
          owlAvatarUrl={OWL_AVATAR_URL}
          language={language}
        />
      )}

      {/* Quiet Footer */}
      <footer className="py-6 border-t border-amber-200/60 bg-white/60 text-center text-xs text-slate-500 font-medium">
        <p className="font-bold text-slate-700">
          {language === 'en'
            ? 'Grade 2 Math Adventure Quest · Aligned with the textbook "Connecting Knowledge to Life"'
            : 'Toán Lớp 2 Phiêu Lưu Ký · Bám sát giáo trình SGK "Kết nối tri thức với cuộc sống"'}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Hỗ trợ song ngữ Tiếng Việt & Tiếng Anh · Chuẩn chương trình GDPT 2018 · Phát triển tư duy trực quan
        </p>
      </footer>
    </div>
  );
}
