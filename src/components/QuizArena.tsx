import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, HelpCircle, CheckCircle2, ArrowRight, RotateCcw, X, Sparkles } from 'lucide-react';
import { LevelInfo, MathQuestion } from '../types/math';
import { VisualAidView } from './VisualAidView';
import { sounds, speakText } from '../utils/audio';

interface Props {
  level: LevelInfo;
  onClose: () => void;
  onLevelComplete: (levelId: string, starsEarned: number) => void;
  owlAvatarUrl: string;
}

export const QuizArena: React.FC<Props> = ({
  level,
  onClose,
  onLevelComplete,
  owlAvatarUrl,
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
    if (isAnswered && isCorrect) return; // already solved this question

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

  const handleListenSpeech = () => {
    sounds.playClick();
    speakText(currentQ.speechText || currentQ.promptText);
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
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white drop-shadow-xs">
                {level.title}
              </h3>
              <p className="text-xs text-amber-100 font-medium">{level.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-white/30 backdrop-blur-xs px-2.5 py-1 rounded-full text-white">
              Câu {currentIdx + 1} / {level.questions.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
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
            {/* Mascot guidance banner & Audio button */}
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
                <div className="text-xs font-bold text-blue-900 flex items-center gap-2">
                  <span>Cú Thông Thái nói:</span>
                  <button
                    onClick={handleListenSpeech}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-white border border-blue-300 px-2.5 py-0.5 rounded-full hover:bg-blue-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nghe đọc đề</span>
                  </button>
                </div>
                <p className="text-xs text-blue-800 font-medium mt-0.5">
                  Bé hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất nhé!
                </p>
              </div>
            </div>

            {/* Question Text & Equation */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-center">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2">
                {currentQ.title}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
                {currentQ.promptText}
              </h2>
              {currentQ.equation && (
                <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2 font-mono tracking-wider">
                  {currentQ.equation}
                </div>
              )}
            </div>

            {/* Visual Aid (Que tính, Đồng hồ, Hoa quả...) */}
            {currentQ.visualAid && <VisualAidView data={currentQ.visualAid} />}

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {currentQ.options.map((option, idx) => {
                const isThisSelected = selectedOption === option;
                const isThisCorrect = String(option).trim() === String(currentQ.correctAnswer).trim();

                let btnStyle =
                  'bg-white hover:bg-amber-50/80 border-2 border-slate-200 text-slate-800 shadow-sm hover:border-amber-400';

                if (isAnswered) {
                  if (isThisCorrect) {
                    btnStyle = 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-md scale-102';
                  } else if (isThisSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500 border-2 border-rose-600 text-white animate-shake';
                  } else {
                    btnStyle = 'bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option)}
                    disabled={isAnswered && isCorrect}
                    className={`py-4 px-4 rounded-2xl text-base sm:text-lg font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isThisCorrect && <CheckCircle2 className="w-5 h-5" />}
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
                          <span>Chính xác rồi! Bé giỏi quá! 🎉</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-5 h-5 text-rose-600" />
                          <span>Chưa đúng rồi! Bé thử lại nhé!</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>

                  {!isCorrect && !showHint && (
                    <button
                      onClick={() => setShowHint(true)}
                      className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span>Xem gợi ý</span>
                    </button>
                  )}
                </div>

                {showHint && !isCorrect && (
                  <div className="mt-3 pt-3 border-t border-rose-200 text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl font-medium">
                    💡 <strong>Gợi ý:</strong> {currentQ.hint}
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
                Tuyệt Vời! Đã Hoàn Thành!
              </h2>
              <p className="text-slate-600 text-sm">
                Bé đã xuất sắc vượt qua màn <strong>{level.title}</strong>
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
                ? 'Xuất sắc tuyệt đối! Đạt trọn vẹn 3 Ngôi Sao Vàng! 🌟🌟🌟'
                : earnedStars === 2
                ? 'Rất giỏi! Đạt được 2 Ngôi Sao Vàng! 🌟🌟'
                : 'Cố gắng rất tốt! Đạt được 1 Ngôi Sao Vàng! 🌟'}
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Tiếp tục bản đồ</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer (Controls) */}
        {!isFinished && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-semibold">
              Số lần chưa đúng: <span className="font-bold text-slate-800">{mistakesCount}</span>
            </div>

            {isAnswered && isCorrect && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>{currentIdx + 1 < level.questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
