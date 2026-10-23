import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Timer, Zap, Trophy, Play, RotateCcw, Volume2, ShieldAlert } from 'lucide-react';
import { sounds, speakText } from '../utils/audio';

interface Props {
  onUpdateHighScore: (newScore: number) => void;
  highScore: number;
  mascotTigerUrl: string;
}

interface QuickProblem {
  prompt: string;
  options: number[];
  answer: number;
}

export const SpeedRaceGame: React.FC<Props> = ({
  onUpdateHighScore,
  highScore,
  mascotTigerUrl,
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

  // Generate dynamic grade 2 math problems
  const generateProblem = (): QuickProblem => {
    const types = ['add', 'sub', 'mult', 'div'];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    let prompt = '';
    let answer = 0;

    if (selectedType === 'add') {
      // 2-digit addition (up to 100)
      const a = Math.floor(Math.random() * 45) + 12;
      const b = Math.floor(Math.random() * 40) + 9;
      answer = a + b;
      prompt = `${a} + ${b} = ?`;
    } else if (selectedType === 'sub') {
      // 2-digit subtraction
      const a = Math.floor(Math.random() * 50) + 30;
      const b = Math.floor(Math.random() * 25) + 6;
      answer = a - b;
      prompt = `${a} - ${b} = ?`;
    } else if (selectedType === 'mult') {
      // Tables 2 and 5
      const table = Math.random() > 0.5 ? 2 : 5;
      const factor = Math.floor(Math.random() * 9) + 2;
      answer = table * factor;
      prompt = `${table} × ${factor} = ?`;
    } else {
      // Division tables 2 and 5
      const table = Math.random() > 0.5 ? 2 : 5;
      const quotient = Math.floor(Math.random() * 8) + 2;
      const dividend = table * quotient;
      answer = quotient;
      prompt = `${dividend} : ${table} = ?`;
    }

    // Generate 3 plausible distractors
    const setOfOptions = new Set<number>();
    setOfOptions.add(answer);
    while (setOfOptions.size < 4) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      const fake = Math.max(1, answer + delta);
      if (fake !== answer) {
        setOfOptions.add(fake);
      }
    }

    const options = Array.from(setOfOptions).sort(() => Math.random() - 0.5);
    return { prompt, options, answer };
  };

  const startGame = () => {
    sounds.playClick();
    setIsPlaying(true);
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCarPosition(10);
    setIsGameOver(false);
    setCurrentProblem(generateProblem());
  };

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
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      if (score > highScore) {
        onUpdateHighScore(score);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft, score, highScore, onUpdateHighScore]);

  const handleAnswer = (val: number) => {
    if (!currentProblem || !isPlaying) return;

    if (val === currentProblem.answer) {
      sounds.playCorrect();
      setFeedback('correct');
      const newScore = score + 1;
      const newCombo = combo + 1;
      setScore(newScore);
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Advance car
      setCarPosition((prev) => Math.min(88, prev + 3.5));

      // Mini confetti on combo milestones
      if (newCombo > 0 && newCombo % 5 === 0) {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 },
        });
      }
    } else {
      sounds.playWrong();
      setFeedback('wrong');
      setCombo(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentProblem(generateProblem());
    }, 250);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 border border-amber-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={mascotTigerUrl}
            alt="Bé Hổ Tốc Độ"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-xs"
          />
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>Đua Xe Tính Nhẩm Thần Tốc</span>
              <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                60 Giây
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Rèn luyện phản xạ tính nhanh: Cộng trừ có nhớ & bảng nhân chia 2, 5!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Kỷ lục của bé
            </span>
            <div className="text-xl font-black text-amber-600 flex items-center justify-center gap-1">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>{highScore} điểm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Race Track Viewport */}
      <div className="relative w-full h-36 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl overflow-hidden border-4 border-amber-300 shadow-md">
        {/* Road Surface */}
        <div className="absolute inset-x-0 bottom-4 top-10 bg-slate-800 border-y-2 border-slate-600 flex items-center">
          {/* Dashed white center road lane */}
          <div className="w-full border-t-2 border-dashed border-amber-200/60" />
        </div>

        {/* Start & Finish Lines */}
        <div className="absolute left-6 top-8 bottom-3 w-3 bg-white/70 rounded-xs flex items-center justify-center">
          <span className="text-[9px] font-black text-slate-900 -rotate-90 select-none">XUẤT PHÁT</span>
        </div>
        <div className="absolute right-6 top-8 bottom-3 w-5 bg-repeating-linear-gradient flex items-center justify-center bg-amber-400">
          <span className="text-[9px] font-black text-slate-900 -rotate-90 select-none">ĐÍCH</span>
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
          {/* Nitro flames on combo */}
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
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-8 text-center space-y-5 shadow-xs">
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-slate-800">Sẵn Sàng Tăng Tốc?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Trong vòng 60 giây, bé hãy tính nhẩm thật nhanh các phép tính lớp 2 để xe đua phóng về đích nhé!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-600">
            <span className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">⚡ Phép cộng & trừ</span>
            <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">🌟 Bảng nhân chia 2 & 5</span>
            <span className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">🔥 Chuỗi Combo điểm thưởng</span>
          </div>

          <div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Bắt Đầu Đua Ngay</span>
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
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời gian</span>
                <span className={`text-xl font-black font-mono ${timeLeft <= 10 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-2xl">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Điểm số</span>
                <span className="text-xl font-black text-amber-900 font-mono">{score}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-1.5 rounded-2xl">
              <Zap className="w-5 h-5 text-rose-500" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Combo</span>
                <span className="text-xl font-black text-rose-600 font-mono">x{combo}</span>
              </div>
            </div>
          </div>

          {/* Question Display */}
          {currentProblem && (
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                <span>Tính nhanh kết quả</span>
                <button
                  onClick={() => speakText(currentProblem.prompt)}
                  className="hover:text-blue-600 p-0.5"
                  title="Nghe đọc đề"
                >
                  <Volume2 className="w-3.5 h-3.5" />
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
                  className="py-5 px-6 rounded-2xl border-2 border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/70 text-slate-800 font-black text-2xl shadow-xs transition-all active:scale-95 cursor-pointer font-mono"
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
            <h3 className="text-2xl font-black text-slate-800">Hết Giờ! Đua Rất Tuyệt Vời!</h3>
            <p className="text-sm text-slate-600">
              Bé đã hoàn thành chặng đua 60 giây đầy dũng cảm!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
              <span className="text-[11px] text-amber-800 font-bold block">Tổng Điểm</span>
              <span className="text-2xl font-black text-amber-900 font-mono">{score}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
              <span className="text-[11px] text-rose-800 font-bold block">Combo Cao Nhất</span>
              <span className="text-2xl font-black text-rose-600 font-mono">x{maxCombo}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-bold block">Kỷ Lục Mới</span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {score > highScore ? 'MỚI! 🌟' : `${highScore}`}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Đua Lại Chặng Mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
