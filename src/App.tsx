import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdventureMap } from './components/AdventureMap';
import { QuizArena } from './components/QuizArena';
import { SpeedRaceGame } from './components/SpeedRaceGame';
import { ManipulativesLab } from './components/ManipulativesLab';
import { BadgeShowcase } from './components/BadgeShowcase';
import { INITIAL_ISLANDS, INITIAL_BADGES } from './utils/mathQuestions';
import { ActiveTab, LevelInfo, UserProfile, Badge } from './types/math';
import { sounds } from './utils/audio';

// High-fidelity generated assets
const HERO_BANNER_URL = '/src/assets/images/hero_math_adventure_1792732529554.jpg';
const OWL_AVATAR_URL = '/src/assets/images/avatar_cute_owl_1792732530016.jpg';
const TIGER_AVATAR_URL = '/src/assets/images/mascot_little_tiger_1792732530821.jpg';

const STORAGE_KEY = 'toan_lop_2_save_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('adventure');
  const [activeLevel, setActiveLevel] = useState<LevelInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
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
          />
        )}

        {activeTab === 'speed_race' && (
          <SpeedRaceGame
            onUpdateHighScore={handleUpdateHighScore}
            highScore={profile.speedHighScore}
            mascotTigerUrl={TIGER_AVATAR_URL}
          />
        )}

        {activeTab === 'manipulatives' && <ManipulativesLab />}

        {activeTab === 'achievements' && (
          <BadgeShowcase
            profile={profile}
            badges={badges}
            onUpdateProfileName={handleUpdateProfileName}
            onUpdateAvatar={handleUpdateAvatar}
            owlAvatarUrl={OWL_AVATAR_URL}
            tigerAvatarUrl={TIGER_AVATAR_URL}
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
        />
      )}

      {/* Quiet Footer */}
      <footer className="py-6 border-t border-amber-200/60 bg-white/60 text-center text-xs text-slate-500 font-medium">
        <p>Toán Lớp 2 Phiêu Lưu Ký · Nền tảng học toán tương tác cho học sinh tiểu học</p>
      </footer>
    </div>
  );
}
