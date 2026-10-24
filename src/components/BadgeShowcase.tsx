import React, { useState } from 'react';
import { Trophy, Star, Award, Edit2, Check, Sparkles } from 'lucide-react';
import { Badge, UserProfile, Language } from '../types/math';
import { getUIText, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds } from '../utils/audio';

interface Props {
  profile: UserProfile;
  badges: Badge[];
  onUpdateProfileName: (newName: string) => void;
  onUpdateAvatar: (avatarUrl: string) => void;
  owlAvatarUrl: string;
  tigerAvatarUrl: string;
  language: Language;
}

export const BadgeShowcase: React.FC<Props> = ({
  profile,
  badges,
  onUpdateProfileName,
  onUpdateAvatar,
  owlAvatarUrl,
  tigerAvatarUrl,
  language,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  const handleSaveName = () => {
    sounds.playClick();
    if (tempName.trim()) {
      onUpdateProfileName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Profile Card */}
      <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center gap-6">
        {/* Avatar with options */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-amber-300 shadow-md bg-amber-100"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('avatar_cute_owl') && !target.src.includes('mascot_little_tiger')) {
                  target.src = owlAvatarUrl;
                }
              }}
            />
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateAvatar(owlAvatarUrl);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                profile.avatar === owlAvatarUrl
                  ? 'bg-amber-100 border-amber-400 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🦉 {language === 'en' ? 'Wise Owl' : 'Cú Thông Thái'}
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateAvatar(tigerAvatarUrl);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                profile.avatar === tigerAvatarUrl
                  ? 'bg-amber-100 border-amber-400 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🐯 {language === 'en' ? 'Speedy Tiger' : 'Hổ Tốc Độ'}
            </button>
          </div>
        </div>

        {/* Player Stats */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2">
            {!isEditingName ? (
              <>
                <h2 className="text-2xl font-black text-slate-800">{profile.name}</h2>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsEditingName(true);
                  }}
                  className="p-1 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                  title={getUIText(language, 'changeName')}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-3 py-1 text-lg font-bold border-2 border-amber-400 rounded-xl focus:outline-hidden"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 font-medium">
            {language === 'en'
              ? 'Distinguished Grade 2 Math Explorer · Connecting Knowledge to Life Curriculum'
              : 'Học sinh lớp 2 xuất sắc · Khám phá SGK Kết nối tri thức với cuộc sống'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">
                {language === 'en' ? 'Total Stars' : 'Tổng sao'}
              </span>
              <div className="text-xl font-black text-amber-900 font-mono flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>{profile.totalStars}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase text-blue-800 block">
                {language === 'en' ? 'Badges' : 'Huy hiệu'}
              </span>
              <div className="text-xl font-black text-blue-900 font-mono flex items-center justify-center gap-1">
                <Award className="w-4 h-4 text-blue-600" />
                <span>
                  {unlockedCount} / {badges.length}
                </span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase text-orange-800 block">
                {language === 'en' ? 'Race High Score' : 'Đua xe'}
              </span>
              <div className="text-xl font-black text-orange-900 font-mono flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-orange-600" />
                <span>{profile.speedHighScore}</span>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase text-rose-800 block">
                {language === 'en' ? 'Mario High Score' : 'Mario Run'}
              </span>
              <div className="text-xl font-black text-rose-900 font-mono flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-rose-600" />
                <span>{profile.marioHighScore || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Cabinet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>{getUIText(language, 'badgesTitle')}</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {language === 'en' ? 'Unlocked: ' : 'Đã mở khóa: '}
            {unlockedCount} / {badges.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-3xl border-2 transition-all flex items-start gap-4 ${
                badge.unlocked
                  ? 'bg-white border-amber-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 ${
                  badge.unlocked ? 'bg-amber-100 border border-amber-300' : 'bg-slate-200'
                }`}
              >
                {badge.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-800">
                    {language === 'en' ? badge.titleEn : badge.title}
                  </h4>
                  {badge.unlocked && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                      {language === 'en' ? 'Unlocked' : 'Đạt'}
                    </span>
                  )}
                </div>
                {language === 'bilingual' && (
                  <p className="text-[11px] font-bold text-sky-700 italic">{badge.titleEn}</p>
                )}
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {language === 'en' ? badge.descriptionEn : badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
