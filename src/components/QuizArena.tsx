import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, HelpCircle, CheckCircle2, ArrowRight, RotateCcw, X, Sparkles, BookOpen } from 'lucide-react';
import { LevelInfo, MathQuestion, Language } from '../types/math';
import { VisualAidView } from './VisualAidView';
import { getUIText, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds, speakText } from '../utils/audio';

interface Props {
  level: LevelInfo;
  onClose: () => void;
  onLevelComplete: (levelId: string, starsEarned: number) => void;
  owlAvatarUrl: string;
  language: Language;
}

export const QuizArena: React.FC<Props> = ({
  level,
  onClose,
  onLevelComplete,
  owlAvatarUrl,
  language,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ: MathQuestion = level.questions[currentIdx];

  const handleSelect = (option: string | number) => {
    if (isAnswered && isCorrect) return; // already solved

    sounds.playClick();
    setSelectedOption(option);
    const correct = String(option).trim() === String(currentQ.correctAnswer).trim();

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#34d399', '#facc15', '#f43f5e'],
      });
    } else {
      sounds.playWrong();
      setMistakesCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentIdx + 1 < level.questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      // Completed level
      setIsFinished(true);
      sounds.playFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });

      // Calculate stars: 0 mistakes = 3 stars; 1 mistake = 2 stars; 2+ = 1 star
      let stars = 3;
      if (mistakesCount === 1) stars = 2;
      else if (mistakesCount >= 2) stars = 1;

      onLevelComplete(level.id, stars);
    }
  };

  const handleListenSpeechVi = () => {
    sounds.playClick();
    speakText(currentQ.speechText || currentQ.promptText, 'vi');
  };

  const handleListenSpeechEn = () => {
    sounds.playClick();
    speakText(currentQ.speechTextEn || currentQ.promptTextEn || currentQ.promptText, 'en');
  };

  // Calculate stars earned
  const earnedStars = mistakesCount === 0 ? 3 : mistakesCount <= 2 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white/90 text-amber-800 font-extrabold flex items-center justify-center text-sm shadow-xs">
              {level.levelNumber}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white drop-shadow-xs">
                  {language === 'en' && level.titleEn ? level.titleEn : level.title}
                </h3>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                {level.textbookLesson && (
                  <span className="inline-block mr-1 opacity-90 underline underline-offset-2">
                    {language === 'en' && level.textbookLessonEn ? level.textbookLessonEn : level.textbookLesson}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-white/30 backdrop-blur-xs px-2.5 py-1 rounded-full text-white">
              {language === 'en'
                ? `Q ${currentIdx + 1} / ${level.questions.length}`
                : `Câu ${currentIdx + 1} / ${level.questions.length}`}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Đóng màn chơi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-amber-100 h-2">
          <div
            className="bg-emerald-500 h-2 transition-all duration-300"
            style={{
              width: `${((currentIdx + (isAnswered && isCorrect ? 1 : 0)) / level.questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Modal Body */}
        {!isFinished ? (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {/* Mascot guidance banner & Bilingual Audio buttons */}
            <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3">
              <img
                src={owlAvatarUrl}
                alt="Bé Cú Thông Thái"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0 bg-amber-100"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('avatar_cute_owl')) {
                    target.src = '/assets/images/avatar_cute_owl_1792732530016.jpg';
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-blue-900 flex flex-wrap items-center gap-2">
                  <span>{language === 'en' ? 'Wise Owl says:' : 'Cú Thông Thái:'}</span>

                  <div className="flex items-center gap-1.5">
                    {/* Vietnamese voice button */}
                    {(language === 'vi' || language === 'bilingual') && (
                      <button
                        onClick={handleListenSpeechVi}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-white border border-blue-300 px-2 py-0.5 rounded-full hover:bg-blue-100/70 active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="Nghe giọng đọc tiếng Việt"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>🇻🇳 VI</span>
                      </button>
                    )}

                    {/* English voice button */}
                    {(language === 'en' || language === 'bilingual') && (
                      <button
                        onClick={handleListenSpeechEn}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded-full hover:bg-emerald-100/70 active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="Listen in English"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>🇬🇧 EN</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-blue-800 font-medium mt-0.5">
                  {language === 'en'
                    ? 'Read the problem carefully and choose the correct answer!'
                    : 'Bé hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất nhé!'}
                </p>
              </div>
            </div>

            {/* Question Text & Equation (Bilingual Support) */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block px-3 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[11px] font-bold">
                  {language === 'en' && currentQ.titleEn ? currentQ.titleEn : currentQ.title}
                </span>
                {currentQ.textbookRef && (
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-semibold">
                    {currentQ.textbookRef}
                  </span>
                )}
              </div>

              {/* Primary prompt based on language mode */}
              {language === 'en' ? (
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
                  {currentQ.promptTextEn || currentQ.promptText}
                </h2>
              ) : language === 'bilingual' ? (
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                    {currentQ.promptText}
                  </h2>
                  {currentQ.promptTextEn && (
                    <p className="text-xs sm:text-sm font-semibold text-emerald-700 italic">
                      🇬🇧 {currentQ.promptTextEn}
                    </p>
                  )}
                </div>
              ) : (
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
                  {currentQ.promptText}
                </h2>
              )}

              {/* Equation Display */}
              {currentQ.equation && (
                <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-wider pt-1">
                  {currentQ.equation}
                </div>
              )}
            </div>

            {/* Key Vocabulary Pill Box (if available for this question) */}
            {currentQ.keyVocab && currentQ.keyVocab.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>{language === 'en' ? 'Curriculum Terms:' : 'Thuật ngữ SGK:'}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {currentQ.keyVocab.map((vocab, vIdx) => (
                    <span
                      key={vIdx}
                      className="bg-white border border-amber-200 px-2 py-0.5 rounded-lg font-semibold text-slate-800 shadow-2xs"
                    >
                      <strong className="text-amber-900">{vocab.vi}</strong>
                      <span className="text-slate-400 mx-1">·</span>
                      <em className="text-emerald-700 not-italic font-bold">{vocab.en}</em>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Aid (Que tính, Đồng hồ, Cân...) */}
            {currentQ.visualAid && <VisualAidView data={currentQ.visualAid} />}

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {currentQ.options.map((option, idx) => {
                const isThisSelected = selectedOption === option;
                const isThisCorrect = String(option).trim() === String(currentQ.correctAnswer).trim();

                let btnStyle =
                  'bg-white hover:bg-amber-50/80 border-2 border-slate-200 text-slate-800 shadow-xs hover:border-amber-400';

                if (isAnswered) {
                  if (isThisCorrect) {
                    btnStyle = 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-md scale-102';
                  } else if (isThisSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500 border-2 border-rose-600 text-white animate-shake';
                  } else {
                    btnStyle = 'bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                // Display label
                let optionLabel: React.ReactNode = option;
                if (language === 'en' && currentQ.optionsEn && currentQ.optionsEn[idx] !== undefined) {
                  optionLabel = currentQ.optionsEn[idx];
                } else if (language === 'bilingual' && currentQ.optionsEn && currentQ.optionsEn[idx] !== undefined && currentQ.optionsEn[idx] !== option) {
                  optionLabel = (
                    <div className="flex flex-col items-center">
                      <span>{option}</span>
                      <span className="text-xs opacity-80 font-medium">({currentQ.optionsEn[idx]})</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option)}
                    disabled={isAnswered && isCorrect}
                    className={`py-3.5 sm:py-4 px-3 sm:px-4 rounded-2xl text-base sm:text-lg font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 min-h-[52px] select-none ${btnStyle}`}
                  >
                    <span>{optionLabel}</span>
                    {isAnswered && isThisCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback / Hint Box */}
            {isAnswered && (
              <div
                className={`p-4 rounded-2xl border text-sm font-medium transition-all ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-base mb-1">
                      {isCorrect ? (
                        <>
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                          <span>
                            {language === 'en'
                              ? 'Correct! Excellent job! 🎉'
                              : 'Chính xác rồi! Bé giỏi quá! 🎉'}
                          </span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-5 h-5 text-rose-600" />
                          <span>
                            {language === 'en'
                              ? 'Not quite yet! Try again!'
                              : 'Chưa đúng rồi! Bé thử lại nhé!'}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
                      <p>
                        {language === 'en' && currentQ.explanationEn
                          ? currentQ.explanationEn
                          : currentQ.explanation}
                      </p>
                      {language === 'bilingual' && currentQ.explanationEn && (
                        <p className="text-emerald-700 italic text-xs pt-0.5 border-t border-emerald-200/50">
                          <strong>EN: </strong>
                          {currentQ.explanationEn}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isCorrect && !showHint && (
                    <button
                      onClick={() => setShowHint(true)}
                      className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span>{getUIText(language, 'hintButton')}</span>
                    </button>
                  )}
                </div>

                {showHint && !isCorrect && (
                  <div className="mt-3 pt-3 border-t border-rose-200 text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl font-medium">
                    💡 <strong>{language === 'en' ? 'Hint: ' : 'Gợi ý: '}</strong>
                    {language === 'en' && currentQ.hintEn ? currentQ.hintEn : currentQ.hint}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Level Completed Screen */
          <div className="p-8 text-center space-y-6">
            <div className="inline-block p-4 bg-amber-100 rounded-full animate-bounce">
              <span className="text-5xl">🏆</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                {language === 'en' ? 'Outstanding! Level Completed!' : 'Tuyệt Vời! Đã Hoàn Thành!'}
              </h2>
              <p className="text-slate-600 text-sm">
                {language === 'en'
                  ? `You have conquered lesson: ${level.titleEn || level.title}`
                  : `Bé đã xuất sắc vượt qua màn ${level.title}`}
              </p>
            </div>

            {/* Stars */}
            <div className="flex justify-center items-center gap-3">
              {[1, 2, 3].map((starIdx) => (
                <div
                  key={starIdx}
                  className={`text-4xl sm:text-5xl transition-transform ${
                    starIdx <= earnedStars ? 'text-amber-400 scale-110 drop-shadow-md' : 'text-slate-200'
                  }`}
                >
                  ⭐
                </div>
              ))}
            </div>

            <div className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-2.5 px-4 rounded-2xl inline-block">
              {earnedStars === 3
                ? (language === 'en' ? 'Perfect! You earned 3 Gold Stars! 🌟🌟🌟' : 'Xuất sắc tuyệt đối! Đạt trọn vẹn 3 Ngôi Sao Vàng! 🌟🌟🌟')
                : earnedStars === 2
                ? (language === 'en' ? 'Great job! You earned 2 Gold Stars! 🌟🌟' : 'Rất giỏi! Đạt được 2 Ngôi Sao Vàng! 🌟🌟')
                : (language === 'en' ? 'Good effort! You earned 1 Gold Star! 🌟' : 'Cố gắng rất tốt! Đạt được 1 Ngôi Sao Vàng! 🌟')}
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>{language === 'en' ? 'Back to Map' : 'Tiếp tục bản đồ'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer (Controls) */}
        {!isFinished && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-semibold">
              {language === 'en' ? 'Mistakes: ' : 'Số lần chưa đúng: '}
              <span className="font-bold text-slate-800">{mistakesCount}</span>
            </div>

            {isAnswered && isCorrect && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>
                  {currentIdx + 1 < level.questions.length
                    ? getUIText(language, 'nextQuestion')
                    : getUIText(language, 'finishLevel')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
