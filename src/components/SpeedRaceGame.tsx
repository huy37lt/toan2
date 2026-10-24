import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Timer, Zap, Trophy, Play, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { Language } from '../types/math';
import { getUIText, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds, speakText } from '../utils/audio';

interface Props {
  onUpdateHighScore: (newScore: number) => void;
  highScore: number;
  mascotTigerUrl: string;
  language: Language;
}

interface QuickProblem {
  prompt: string;
  speechVi: string;
  speechEn: string;
  options: number[];
  answer: number;
}

export const SpeedRaceGame: React.FC<Props> = ({
  onUpdateHighScore,
  highScore,
  mascotTigerUrl,
  language,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<QuickProblem | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [carPosition, setCarPosition] = useState(10); // percentage 10% -> 90%
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate dynamic grade 2 math problems based on Kết nối tri thức SGK
  const generateProblem = (): QuickProblem => {
    const types = ['add', 'sub', 'mult', 'div'];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    let prompt = '';
    let speechVi = '';
    let speechEn = '';
    let answer = 0;

    if (selectedType === 'add') {
      const a = Math.floor(Math.random() * 45) + 12;
      const b = Math.floor(Math.random() * 40) + 9;
      answer = a + b;
      prompt = `${a} + ${b} = ?`;
      speechVi = `${a} cộng ${b} bằng bao nhiêu?`;
      speechEn = `What is ${a} plus ${b}?`;
    } else if (selectedType === 'sub') {
      const a = Math.floor(Math.random() * 50) + 30;
      const b = Math.floor(Math.random() * 25) + 6;
      answer = a - b;
      prompt = `${a} - ${b} = ?`;
      speechVi = `${a} trừ ${b} bằng bao nhiêu?`;
      speechEn = `What is ${a} minus ${b}?`;
    } else if (selectedType === 'mult') {
      const table = Math.random() > 0.5 ? 2 : 5;
      const factor = Math.floor(Math.random() * 9) + 2;
      answer = table * factor;
      prompt = `${table} × ${factor} = ?`;
      speechVi = `${table} nhân ${factor} bằng bao nhiêu?`;
      speechEn = `What is ${table} times ${factor}?`;
    } else {
      const table = Math.random() > 0.5 ? 2 : 5;
      const quotient = Math.floor(Math.random() * 8) + 2;
      const dividend = table * quotient;
      answer = quotient;
      prompt = `${dividend} : ${table} = ?`;
      speechVi = `${dividend} chia ${table} bằng bao nhiêu?`;
      speechEn = `What is ${dividend} divided by ${table}?`;
    }

    // Generate 3 plausible distractors
    const distractors = new Set<number>();
    distractors.add(answer);

    const offsets = [-2, -1, 1, 2, 5, 10, -10];
    while (distractors.size < 4) {
      const offset = offsets[Math.floor(Math.random() * offsets.length)];
      const fake = answer + offset;
      if (fake > 0 && fake !== answer) {
        distractors.add(fake);
      }
    }

    const options = Array.from(distractors).sort(() => Math.random() - 0.5);

    return {
      prompt,
      speechVi,
      speechEn,
      options,
      answer,
    };
  };

  const startGame = () => {
    sounds.playFanfare();
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCarPosition(10);
    setFeedback(null);
    setCurrentProblem(generateProblem());
  };

  // Timer tick
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
        if (timeLeft <= 5) {
          sounds.playCountTick();
        }
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      // Game over
      setIsPlaying(false);
      setIsGameOver(true);
      sounds.playFanfare();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
      onUpdateHighScore(score);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft, score, onUpdateHighScore]);

  const handleAnswer = (selected: number) => {
    if (!currentProblem || !isPlaying) return;

    if (selected === currentProblem.answer) {
      sounds.playCorrect();
      setFeedback('correct');

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));

      const points = 10 + nextCombo * 2;
      setScore((prev) => prev + points);

      // Advance car along the track
      setCarPosition((prev) => Math.min(85, prev + 3.5));

      setTimeout(() => {
        setFeedback(null);
        setCurrentProblem(generateProblem());
      }, 250);
    } else {
      sounds.playWrong();
      setFeedback('wrong');
      setCombo(0);
      setCarPosition((prev) => Math.max(10, prev - 2));

      setTimeout(() => {
        setFeedback(null);
      }, 400);
    }
  };

  const handleSpeech = () => {
    if (!currentProblem) return;
    sounds.playClick();
    if (language === 'en') {
      speakText(currentProblem.speechEn, 'en');
    } else {
      speakText(currentProblem.speechVi, 'vi');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'en' ? TEXTBOOK_NAME_EN : TEXTBOOK_NAME_VI}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
            {getUIText(language, 'speedTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 font-medium">
            {getUIText(language, 'speedDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/20">
            <Trophy className="w-5 h-5 text-amber-300" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-amber-200 block">
                {getUIText(language, 'highScore')}
              </span>
              <span className="text-lg font-black font-mono">{highScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Race Track Viewport */}
      <div className="relative w-full h-36 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl overflow-hidden border-4 border-amber-300 shadow-md">
        {/* Road Surface */}
        <div className="absolute inset-x-0 bottom-4 top-10 bg-slate-800 border-y-2 border-slate-600 flex items-center">
          <div className="w-full border-t-2 border-dashed border-amber-200/60" />
        </div>

        {/* Start & Finish Lines */}
        <div className="absolute left-6 top-8 bottom-3 w-3 bg-white/70 rounded-xs flex items-center justify-center">
          <span className="text-[9px] font-black text-slate-900 -rotate-90 select-none">
            {language === 'en' ? 'START' : 'XUẤT PHÁT'}
          </span>
        </div>
        <div className="absolute right-6 top-8 bottom-3 w-5 bg-repeating-linear-gradient flex items-center justify-center bg-amber-400">
          <span className="text-[9px] font-black text-slate-900 -rotate-90 select-none">
            {language === 'en' ? 'FINISH' : 'ĐÍCH'}
          </span>
        </div>

        {/* Road scenery & flags */}
        <div className="absolute top-2 left-1/4 text-sm">🚩</div>
        <div className="absolute top-2 left-2/4 text-sm">⛽</div>
        <div className="absolute top-2 left-3/4 text-sm">🏁</div>

        {/* The Racing Car with Animation */}
        <div
          className="absolute bottom-6 transition-all duration-300 flex items-center select-none"
          style={{ left: `${carPosition}%` }}
        >
          {combo >= 3 && (
            <span className="text-2xl animate-pulse -mr-1" title="Nitro Thần Tốc">
              🔥
            </span>
          )}
          <div className="relative flex flex-col items-center">
            <span className="text-3xl drop-shadow-md">🏎️</span>
            {combo >= 2 && (
              <span className="text-[10px] font-black text-amber-300 bg-slate-900/80 px-1.5 rounded-full absolute -top-3">
                x{combo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Card */}
      {!isPlaying && !isGameOver ? (
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-8 text-center space-y-6 shadow-xs">
          {/* Mascot Mascot Coach */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={mascotTigerUrl}
              alt="Hổ Con Tăng Tốc"
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-md bg-amber-100"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('mascot_little_tiger')) {
                  target.src = '/assets/images/mascot_little_tiger_1792732530821.jpg';
                }
              }}
            />
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {language === 'en' ? 'Ready to Race?' : 'Sẵn Sàng Tăng Tốc?'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {language === 'en'
                  ? 'Answer quick Grade 2 math problems in 60 seconds to turbo-charge your racer across the finish line!'
                  : 'Trong vòng 60 giây, bé hãy tính nhẩm thật nhanh các phép tính lớp 2 để xe đua phóng về đích nhé!'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-600">
            <span className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              ⚡ {language === 'en' ? 'Addition & Subtraction' : 'Phép cộng & trừ'}
            </span>
            <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              🌟 {language === 'en' ? 'Tables 2 & 5' : 'Bảng nhân chia 2 & 5'}
            </span>
            <span className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
              🔥 {language === 'en' ? 'Score Multiplier Combo' : 'Chuỗi Combo điểm thưởng'}
            </span>
          </div>

          <div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{getUIText(language, 'startRace')}</span>
            </button>
          </div>
        </div>
      ) : isPlaying ? (
        /* Playing state */
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          {/* HUD: Time, Score, Combo */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Timer className={`w-6 h-6 ${timeLeft <= 10 ? 'text-rose-500 animate-spin' : 'text-blue-600'}`} />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {getUIText(language, 'timeRemaining')}
                </span>
                <span className={`text-xl font-black font-mono ${timeLeft <= 10 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-2xl">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                  {getUIText(language, 'score')}
                </span>
                <span className="text-xl font-black text-amber-900 font-mono">{score}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-1.5 rounded-2xl">
              <Zap className="w-5 h-5 text-rose-500" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">
                  {getUIText(language, 'combo')}
                </span>
                <span className="text-xl font-black text-rose-600 font-mono">x{combo}</span>
              </div>
            </div>
          </div>

          {/* Question Display */}
          {currentProblem && (
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                <span>{language === 'en' ? 'Solve fast:' : 'Tính nhanh kết quả'}</span>
                <button
                  onClick={handleSpeech}
                  className="hover:text-blue-600 p-0.5 cursor-pointer flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-slate-200"
                  title="Nghe đọc đề"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'EN' : 'VI'}</span>
                </button>
              </div>

              <div
                className={`text-4xl sm:text-5xl font-black tracking-wider transition-transform font-mono ${
                  feedback === 'correct'
                    ? 'text-emerald-600 scale-105'
                    : feedback === 'wrong'
                    ? 'text-rose-600 animate-shake'
                    : 'text-slate-900'
                }`}
              >
                {currentProblem.prompt}
              </div>
            </div>
          )}

          {/* Options Grid */}
          {currentProblem && (
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {currentProblem.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className="py-4 sm:py-5 px-4 sm:px-6 rounded-2xl border-2 border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/70 text-slate-800 font-black text-xl sm:text-2xl shadow-xs transition-all active:scale-95 cursor-pointer font-mono min-h-[58px]"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Game Over Summary */
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-8 text-center space-y-6 shadow-xs">
          <div className="inline-block p-4 bg-amber-100 rounded-full animate-bounce">
            <Trophy className="w-12 h-12 text-amber-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800">
              {getUIText(language, 'raceFinish')}
            </h3>
            <p className="text-sm text-slate-600">
              {language === 'en'
                ? 'Great effort! You finished the 60-second math sprint!'
                : 'Bé đã hoàn thành chặng đua 60 giây đầy dũng cảm!'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
              <span className="text-[11px] text-amber-800 font-bold block">
                {getUIText(language, 'score')}
              </span>
              <span className="text-2xl font-black text-amber-900 font-mono">{score}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
              <span className="text-[11px] text-rose-800 font-bold block">
                {getUIText(language, 'combo')}
              </span>
              <span className="text-2xl font-black text-rose-600 font-mono">x{maxCombo}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-bold block">
                {getUIText(language, 'highScore')}
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {score > highScore ? (language === 'en' ? 'NEW! 🌟' : 'MỚI! 🌟') : `${highScore}`}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{getUIText(language, 'raceAgain')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
