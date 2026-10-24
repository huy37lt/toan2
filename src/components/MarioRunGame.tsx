import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Gamepad2, Heart, Sparkles, Star, Volume2, RotateCcw, Trophy, Play, ArrowUp, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { Language } from '../types/math';
import { getUIText, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds, speakText } from '../utils/audio';

interface Props {
  onUpdateHighScore: (newScore: number) => void;
  highScore: number;
  mascotTigerUrl?: string;
  language: Language;
}

interface QuestionBlock {
  id: number;
  x: number; // percentage 0 - 100
  type: 'mystery' | 'brick' | 'pipe';
  solved?: boolean;
}

interface MathProblem {
  promptVi: string;
  promptEn: string;
  speechVi: string;
  speechEn: string;
  equation: string;
  options: number[];
  answer: number;
  explanationVi: string;
  explanationEn: string;
  category: string;
}

type DifficultyMode = 'easy' | 'medium' | 'hard';

export const MarioRunGame: React.FC<Props> = ({
  onUpdateHighScore,
  highScore,
  mascotTigerUrl = '/assets/images/mascot_little_tiger_1792732530821.jpg',
  language,
}) => {
  // Game lifecycle state
  const [gameState, setGameState] = useState<'idle' | 'running' | 'answering' | 'gameover'>('idle');
  const [difficulty, setDifficulty] = useState<DifficultyMode>('easy');
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [distance, setDistance] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Character physics
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isSuper, setIsSuper] = useState<boolean>(false); // Magic mushroom invincibility boost
  const [powerUpMessage, setPowerUpMessage] = useState<string | null>(null);

  // Active math question when hitting [ ? ] block
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null);

  // Animation & scrolling reference
  const stageRef = useRef<HTMLDivElement | null>(null);
  const runLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const nextMysteryDistanceRef = useRef<number>(30); // Next block at 30 meters

  // Generate dynamic Grade 2 textbook problems (SGK Kết nối tri thức)
  const generateMathProblem = useCallback((diff: DifficultyMode): MathProblem => {
    let equation = '';
    let promptVi = '';
    let promptEn = '';
    let speechVi = '';
    let speechEn = '';
    let answer = 0;
    let explanationVi = '';
    let explanationEn = '';
    let category = '';

    if (diff === 'easy') {
      // Phạm vi 20 (Cộng trừ qua 10 & Nhân 2 cơ bản)
      const r = Math.random();
      if (r < 0.4) {
        // Phép cộng qua 10 (9 + 5, 8 + 6, 7 + 7)
        const a = Math.floor(Math.random() * 4) + 6; // 6,7,8,9
        const b = Math.floor(Math.random() * 7) + 4; // 4 to 10
        answer = a + b;
        equation = `${a} + ${b} = ?`;
        category = 'Cộng qua 10';
        promptVi = `Tính nhẩm nhanh: ${a} + ${b} bằng bao nhiêu?`;
        promptEn = `Quick math: What is ${a} + ${b}?`;
        speechVi = `${a} cộng ${b} bằng bao nhiêu?`;
        speechEn = `What is ${a} plus ${b}?`;
        explanationVi = `Tách số để được 10: ${a} + ${10 - a} = 10, rồi 10 + ${b - (10 - a)} = ${answer}.`;
        explanationEn = `Make a ten first: ${a} + ${10 - a} = 10, then 10 + ${b - (10 - a)} = ${answer}.`;
      } else if (r < 0.75) {
        // Phép trừ qua 10 (14 - 6, 12 - 5, 16 - 8)
        const b = Math.floor(Math.random() * 7) + 3; // 3 to 9
        const answerVal = Math.floor(Math.random() * 7) + 3;
        const a = b + answerVal;
        answer = answerVal;
        equation = `${a} - ${b} = ?`;
        category = 'Trừ qua 10';
        promptVi = `Tính nhẩm nhanh: ${a} - ${b} bằng bao nhiêu?`;
        promptEn = `Quick math: What is ${a} - ${b}?`;
        speechVi = `${a} trừ ${b} bằng bao nhiêu?`;
        speechEn = `What is ${a} minus ${b}?`;
        explanationVi = `Trừ để được 10: ${a} - ${a - 10} = 10, rồi 10 - ${b - (a - 10)} = ${answer}.`;
        explanationEn = `Subtract to make 10 first, then subtract the remaining to get ${answer}.`;
      } else {
        // Bảng nhân 2
        const factor = Math.floor(Math.random() * 8) + 2; // 2 to 9
        answer = 2 * factor;
        equation = `2 × ${factor} = ?`;
        category = 'Bảng nhân 2';
        promptVi = `Bảng nhân 2: 2 × ${factor} bằng bao nhiêu?`;
        promptEn = `Multiplication table of 2: What is 2 × ${factor}?`;
        speechVi = `2 nhân ${factor} bằng bao nhiêu?`;
        speechEn = `What is 2 times ${factor}?`;
        explanationVi = `2 được lấy ${factor} lần: 2 × ${factor} = ${answer}.`;
        explanationEn = `2 taken ${factor} times equals ${answer}.`;
      }
    } else if (diff === 'medium') {
      // Cộng trừ có nhớ trong phạm vi 100 & Bảng nhân 5, chia 2
      const r = Math.random();
      if (r < 0.4) {
        // Phép cộng có nhớ trong phạm vi 100 (37 + 25, 48 + 16)
        const a = Math.floor(Math.random() * 40) + 18;
        const b = Math.floor(Math.random() * 30) + 15;
        answer = a + b;
        equation = `${a} + ${b} = ?`;
        category = 'Cộng có nhớ (phạm vi 100)';
        promptVi = `Cộng có nhớ: ${a} + ${b} = ?`;
        promptEn = `Addition with regrouping: ${a} + ${b} = ?`;
        speechVi = `${a} cộng ${b} bằng bao nhiêu?`;
        speechEn = `What is ${a} plus ${b}?`;
        explanationVi = `Cộng hàng đơn vị rồi cộng hàng chục và thêm 1 vào hàng chục: ${a} + ${b} = ${answer}.`;
        explanationEn = `Add ones column first, then add tens with carry-over: ${answer}.`;
      } else if (r < 0.75) {
        // Bảng nhân 5 hoặc bảng chia 5
        const factor = Math.floor(Math.random() * 8) + 2;
        if (Math.random() > 0.5) {
          answer = 5 * factor;
          equation = `5 × ${factor} = ?`;
          category = 'Bảng nhân 5';
          promptVi = `Bảng nhân 5: 5 × ${factor} bằng bao nhiêu?`;
          promptEn = `Multiplication table of 5: What is 5 × ${factor}?`;
          speechVi = `5 nhân ${factor} bằng bao nhiêu?`;
          speechEn = `What is 5 times ${factor}?`;
          explanationVi = `5 được lấy ${factor} lần, kết quả là ${answer}.`;
          explanationEn = `5 taken ${factor} times is ${answer}.`;
        } else {
          answer = factor;
          const dividend = 5 * factor;
          equation = `${dividend} : 5 = ?`;
          category = 'Bảng chia 5';
          promptVi = `Bảng chia 5: ${dividend} : 5 bằng bao nhiêu?`;
          promptEn = `Division table of 5: What is ${dividend} ÷ 5?`;
          speechVi = `${dividend} chia 5 bằng bao nhiêu?`;
          speechEn = `What is ${dividend} divided by 5?`;
          explanationVi = `Vì 5 × ${factor} = ${dividend} nên ${dividend} : 5 = ${answer}.`;
          explanationEn = `Since 5 × ${factor} = ${dividend}, ${dividend} ÷ 5 = ${answer}.`;
        }
      } else {
        // Phép trừ có nhớ phạm vi 100
        const a = Math.floor(Math.random() * 40) + 50;
        const b = Math.floor(Math.random() * 25) + 18;
        answer = a - b;
        equation = `${a} - ${b} = ?`;
        category = 'Trừ có nhớ';
        promptVi = `Trừ có nhớ: ${a} - ${b} = ?`;
        promptEn = `Subtraction with borrowing: ${a} - ${b} = ?`;
        speechVi = `${a} trừ ${b} bằng bao nhiêu?`;
        speechEn = `What is ${a} minus ${b}?`;
        explanationVi = `Mượn 1 chục ở hàng chục để trừ hàng đơn vị: ${a} - ${b} = ${answer}.`;
        explanationEn = `Borrow one ten from the tens column: ${answer}.`;
      }
    } else {
      // Dũng sĩ toàn diện: Nhân chia 2, 5, Tìm thành phần phép tính, Đo lường
      const r = Math.random();
      if (r < 0.4) {
        // Tìm số hạng / số bị trừ / số trừ
        const total = Math.floor(Math.random() * 40) + 30;
        const part = Math.floor(Math.random() * 20) + 10;
        answer = total - part;
        equation = `? + ${part} = ${total}`;
        category = 'Tìm thành phần chưa biết';
        promptVi = `Muốn tìm số hạng chưa biết: ? + ${part} = ${total}`;
        promptEn = `Find missing addend: ? + ${part} = ${total}`;
        speechVi = `Số nào cộng với ${part} thì bằng ${total}?`;
        speechEn = `What number plus ${part} equals ${total}?`;
        explanationVi = `Quy tắc SGK: Muốn tìm số hạng chưa biết, ta lấy Tổng trừ đi số hạng đã biết: ${total} - ${part} = ${answer}.`;
        explanationEn = `Textbook rule: Missing addend = Total - Known addend: ${total} - ${part} = ${answer}.`;
      } else if (r < 0.7) {
        // Bảng chia 2
        const factor = Math.floor(Math.random() * 8) + 2;
        const dividend = 2 * factor;
        answer = factor;
        equation = `${dividend} : 2 = ?`;
        category = 'Bảng chia 2';
        promptVi = `Bảng chia 2: ${dividend} : 2 = ?`;
        promptEn = `Division table of 2: ${dividend} ÷ 2 = ?`;
        speechVi = `${dividend} chia 2 bằng bao nhiêu?`;
        speechEn = `What is ${dividend} divided by 2?`;
        explanationVi = `Vì 2 × ${factor} = ${dividend} nên ${dividend} : 2 = ${answer}.`;
        explanationEn = `Because 2 × ${factor} = ${dividend}, ${dividend} ÷ 2 = ${answer}.`;
      } else {
        // Đo lường Lớp 2 (ki-lô-gam hoặc lít)
        const unit = Math.random() > 0.5 ? 'kg' : 'l';
        const a = Math.floor(Math.random() * 30) + 15;
        const b = Math.floor(Math.random() * 20) + 8;
        answer = a + b;
        equation = `${a} ${unit} + ${b} ${unit} = ? ${unit}`;
        category = `Đo lường (${unit})`;
        promptVi = `Đo lường SGK: ${a} ${unit} + ${b} ${unit} bằng bao nhiêu ${unit}?`;
        promptEn = `Measurement: What is ${a} ${unit} + ${b} ${unit}?`;
        speechVi = `${a} ${unit === 'kg' ? 'ki lô gam' : 'lít'} cộng ${b} ${unit === 'kg' ? 'ki lô gam' : 'lít'} bằng bao nhiêu?`;
        speechEn = `What is ${a} plus ${b} ${unit}?`;
        explanationVi = `Cộng các số đo cùng đơn vị: ${a} + ${b} = ${answer} ${unit}.`;
        explanationEn = `Add values with the same unit: ${a} + ${b} = ${answer} ${unit}.`;
      }
    }

    // Generate 3 clever distractors
    const distractors = new Set<number>();
    distractors.add(answer);
    const offsets = [-10, -5, -2, -1, 1, 2, 5, 10];
    while (distractors.size < 4) {
      const off = offsets[Math.floor(Math.random() * offsets.length)];
      const candidate = answer + off;
      if (candidate > 0 && candidate !== answer) {
        distractors.add(candidate);
      }
    }

    const options = Array.from(distractors).sort(() => Math.random() - 0.5);

    return {
      promptVi,
      promptEn,
      speechVi,
      speechEn,
      equation,
      options,
      answer,
      explanationVi,
      explanationEn,
      category,
    };
  }, []);

  // Start game handler
  const handleStartGame = () => {
    sounds.playPowerUp();
    setScore(0);
    setCoins(0);
    setLives(3);
    setDistance(0);
    setStreak(0);
    setIsSuper(false);
    setPowerUpMessage(null);
    setCurrentProblem(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
    nextMysteryDistanceRef.current = 15; // First question block at 15m
    setGameState('running');
  };

  // Jump control
  const handleJump = useCallback(() => {
    if (gameState !== 'running') return;
    if (isJumping) return;

    sounds.playJump();
    setIsJumping(true);

    // Collect jump coin
    setCoins((prev) => prev + 1);
    setScore((prev) => prev + 5);

    setTimeout(() => {
      setIsJumping(false);
    }, 550);
  }, [gameState, isJumping]);

  // Main game runner loop
  useEffect(() => {
    if (gameState !== 'running') {
      if (runLoopRef.current) cancelAnimationFrame(runLoopRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Increase distance based on run speed
      setDistance((prevDist) => {
        const nextDist = prevDist + dt * 10; // ~10 meters/second

        // Check if we reached the next Mystery Block
        if (nextDist >= nextMysteryDistanceRef.current) {
          // Pause runner and present Math Challenge
          const newProblem = generateMathProblem(difficulty);
          setCurrentProblem(newProblem);
          setSelectedAnswer(null);
          setAnswerResult(null);
          setGameState('answering');
          sounds.playPowerUp();

          // Auto speak question
          if (language === 'en') {
            speakText(newProblem.speechEn, 'en');
          } else {
            speakText(newProblem.speechVi, 'vi');
          }

          // Schedule next block 20-30 meters ahead
          nextMysteryDistanceRef.current = Math.floor(nextDist) + Math.floor(Math.random() * 15) + 20;
          return nextDist;
        }

        return nextDist;
      });

      // Passive points while running
      setScore((prev) => prev + 1);

      runLoopRef.current = requestAnimationFrame(loop);
    };

    runLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (runLoopRef.current) cancelAnimationFrame(runLoopRef.current);
    };
  }, [gameState, difficulty, generateMathProblem, language]);

  // Handle Answer Selection
  const handleAnswerSubmit = (choice: number) => {
    if (!currentProblem || selectedAnswer !== null) return;

    setSelectedAnswer(choice);

    if (choice === currentProblem.answer) {
      // Correct!
      sounds.playCorrect();
      sounds.playCoin();
      setAnswerResult('correct');

      const streakBonus = (streak + 1) * 10;
      const pointsEarned = 50 + streakBonus;
      const newScore = score + pointsEarned;
      const newCoins = coins + 5;
      const newStreak = streak + 1;

      setScore(newScore);
      setCoins(newCoins);
      setStreak(newStreak);

      // Trigger Confetti & Super Mushroom Boost
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
      });

      setIsSuper(true);
      setPowerUpMessage(
        language === 'en'
          ? `🍄 Magic Mushroom Power! +${pointsEarned} pts!`
          : `🍄 Nhặt Được Nấm Thần Kỳ! +${pointsEarned} điểm!`
      );

      setTimeout(() => {
        setIsSuper(false);
        setPowerUpMessage(null);
        setGameState('running');
        setCurrentProblem(null);
      }, 1300);
    } else {
      // Wrong!
      sounds.playWrong();
      setAnswerResult('wrong');
      setStreak(0);
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        // Game Over
        setTimeout(() => {
          setGameState('gameover');
          if (score > highScore) {
            onUpdateHighScore(score);
          }
        }, 1500);
      } else {
        // Continue after showing feedback
        setTimeout(() => {
          setGameState('running');
          setCurrentProblem(null);
        }, 2200);
      }
    }
  };

  // Keyboard controls for desktop or tablet keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 animate-fade-in">
      {/* Header & Dashboard Pill */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-sm border border-amber-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Gamepad2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {getUIText(language, 'marioTitle')}
                </h1>
                <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                  Lớp 2
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {getUIText(language, 'marioDesc')}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Lives */}
            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-2xl">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <div className="flex gap-0.5">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i <= lives ? 'bg-rose-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-2xl text-xs font-black text-amber-900">
              <span className="text-base leading-none">🪙</span>
              <span className="font-mono">{coins}</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-2xl text-xs font-black text-blue-900">
              <Star className="w-4 h-4 text-blue-600 fill-blue-500" />
              <span className="font-mono">{score}</span>
            </div>

            {/* High Score */}
            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-2xl text-xs font-black text-purple-900">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span className="font-mono">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Chooser (Only visible before starting or in gameover) */}
        {gameState === 'idle' && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-600">
              {language === 'en' ? 'Select Grade 2 curriculum mode:' : 'Chọn chặng luyện tập theo SGK:'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDifficulty('easy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  difficulty === 'easy'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🟢 Khởi Động (Phạm vi 20 & Bảng ×2)
              </button>
              <button
                onClick={() => setDifficulty('medium')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  difficulty === 'medium'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🟡 Nấm Vàng (Cộng trừ có nhớ & ×5, :5)
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  difficulty === 'hard'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🟣 Dũng Sĩ Toàn Diện (Tổng hợp)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Retro 2D Mario Stage (Mobile-Responsive Stage) */}
      <div
        ref={stageRef}
        onClick={handleJump}
        className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden shadow-lg border-4 border-amber-300 select-none cursor-pointer bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100"
      >
        {/* Parallax Pixel Clouds */}
        <div className="absolute top-4 left-6 text-white/80 text-4xl animate-pulse">☁️</div>
        <div className="absolute top-10 right-16 text-white/70 text-5xl">☁️</div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/90 text-3xl">☁️</div>

        {/* Distance Marker */}
        <div className="absolute top-3 left-4 z-10 bg-black/40 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-black font-mono flex items-center gap-1.5">
          <span>🚩</span>
          <span>{Math.floor(distance)}m</span>
          {streak > 1 && (
            <span className="text-amber-300 ml-1">🔥 x{streak}</span>
          )}
        </div>

        {/* Floating PowerUp Toast */}
        {powerUpMessage && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-amber-400 text-amber-950 font-black px-4 py-2 rounded-2xl shadow-lg border-2 border-white animate-bounce text-sm">
            {powerUpMessage}
          </div>
        )}

        {/* Floating Question & Brick Blocks Along the Route */}
        <div className="absolute bottom-28 left-0 right-0 h-16 flex items-center justify-around pointer-events-none px-4">
          {/* Mystery Question Block */}
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 border-3 border-amber-700 flex items-center justify-center font-black text-amber-950 text-xl shadow-md ${
              gameState === 'running' ? 'animate-bounce' : ''
            }`}
          >
            ?
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-700 border-2 border-orange-950 flex items-center justify-center text-orange-200 text-xs font-mono font-bold">
            🧱
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 border-3 border-amber-700 flex items-center justify-center font-black text-amber-950 text-xl shadow-md animate-bounce delay-150">
            ?
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-700 border-2 border-orange-950 flex items-center justify-center text-orange-200 text-xs font-mono font-bold">
            🧱
          </div>
        </div>

        {/* Floating Golden Coins to Collect on Jump */}
        <div className="absolute bottom-40 left-0 right-0 flex items-center justify-around pointer-events-none px-12">
          <span className="text-2xl animate-pulse">🪙</span>
          <span className="text-2xl animate-pulse delay-75">🪙</span>
          <span className="text-2xl animate-pulse delay-150">🪙</span>
        </div>

        {/* Mario/Mascot Character */}
        <div
          className={`absolute left-12 sm:left-24 bottom-14 z-20 transition-all duration-300 ${
            isJumping ? '-translate-y-28 scale-110' : 'translate-y-0'
          }`}
        >
          <div className="relative flex flex-col items-center">
            {/* Super Star / Mushroom Sparkle */}
            {isSuper && (
              <Sparkles className="w-8 h-8 text-amber-400 absolute -top-8 animate-spin" />
            )}
            
            {/* Character Sprite Container */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-3 ${
                isSuper
                  ? 'border-amber-400 ring-4 ring-amber-300 shadow-xl'
                  : 'border-white shadow-md'
              } bg-amber-100 flex items-center justify-center transform transition-transform ${
                gameState === 'running' ? 'animate-[bounce_0.6s_infinite]' : ''
              }`}
            >
              <img
                src={mascotTigerUrl}
                alt="Mario Mascot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/assets/images/mascot_little_tiger')) {
                    target.src = '/assets/images/mascot_little_tiger_1792732530821.jpg';
                  }
                }}
              />
            </div>

            {/* Red Mario Cap Indicator */}
            <div className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full -mt-2 z-10 border border-white shadow-xs">
              M-Math
            </div>
          </div>
        </div>

        {/* Ground Terrain (Grass & Bricks) */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-emerald-600 border-t-4 border-emerald-400 flex flex-col justify-end">
          <div className="h-9 bg-amber-900 border-t-2 border-amber-800 flex items-center justify-between px-2 text-[10px] text-amber-700 font-mono overflow-hidden">
            <span>■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■</span>
          </div>
        </div>

        {/* IDLE SCREEN OVERLAY */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-16 h-16 rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center text-3xl font-black shadow-lg mb-3 animate-bounce">
              ?
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              {language === 'en' ? 'Super Math Mario Runner' : 'Nấm Nhí Toán Học Lớp 2'}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200 max-w-md font-medium mb-6">
              {language === 'en'
                ? 'Jump to collect coins, smash into [ ? ] mystery blocks, and solve grade 2 math to power up!'
                : 'Chạm để nhảy nhặt xu vàng, húc khối [ ? ] để giải toán SGK và nhặt nấm thần kỳ tăng điểm nhé!'}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-3 border-2 border-white min-h-[56px]"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>{language === 'en' ? 'START RUNNING' : 'BẮT ĐẦU CHẠY NGAY'}</span>
            </button>
          </div>
        )}

        {/* GAME OVER SCREEN OVERLAY */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center mb-2">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {getUIText(language, 'marioOver')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-4">
              {language === 'en'
                ? `You reached ${Math.floor(distance)} meters with ${score} points!`
                : `Bé đã chạy được quãng đường ${Math.floor(distance)}m với ${score} điểm!`}
            </p>
            <div className="flex items-center gap-4 bg-white/10 px-6 py-3 rounded-2xl mb-6 border border-white/20">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-bold">{getUIText(language, 'marioScore')}</span>
                <span className="text-2xl font-black text-amber-300 font-mono">{score}</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-bold">{getUIText(language, 'highScore')}</span>
                <span className="text-2xl font-black text-purple-300 font-mono">
                  {Math.max(highScore, score)}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartGame();
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 border-2 border-white min-h-[52px]"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{language === 'en' ? 'Play Again' : 'Chạy Lại Chặng Mới'}</span>
            </button>
          </div>
        )}

        {/* Mobile Large Jump Touch Button (Thumb-Friendly for Kids) */}
        {gameState === 'running' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleJump();
            }}
            className="absolute bottom-16 right-4 sm:right-6 z-30 w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 active:scale-90 text-white font-black shadow-2xl border-4 border-white flex flex-col items-center justify-center cursor-pointer transition-transform"
            aria-label="Nhảy"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
            <span className="text-[10px] tracking-tight font-extrabold uppercase mt-0.5">
              {language === 'en' ? 'JUMP' : 'NHẢY'}
            </span>
          </button>
        )}
      </div>

      {/* MATH CHALLENGE MODAL (POPS UP WHEN HITTING [ ? ] BLOCK) */}
      {gameState === 'answering' && currentProblem && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-3 border-amber-400 animate-fade-in">
          {/* Question Top Header */}
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-lg shadow-sm">
                ?
              </span>
              <div>
                <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">
                  {currentProblem.category}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {language === 'en' ? currentProblem.promptEn : currentProblem.promptVi}
                </h3>
              </div>
            </div>

            {/* Read question TTS button */}
            <button
              onClick={() => {
                if (language === 'en') {
                  speakText(currentProblem.speechEn, 'en');
                } else {
                  speakText(currentProblem.speechVi, 'vi');
                }
              }}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer shrink-0"
              title="Đọc đề bài"
              aria-label="Read Question"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Big Equation Banner */}
          <div className="bg-amber-50/80 rounded-2xl py-4 px-6 text-center border-2 border-dashed border-amber-300 mb-5">
            <div className="text-3xl sm:text-4xl font-black text-amber-950 tracking-wider font-mono">
              {currentProblem.equation}
            </div>
          </div>

          {/* 4 Large Touch Option Buttons (Mobile-First Tap Target >= 56px) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            {currentProblem.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = opt === currentProblem.answer;

              let btnStyle =
                'bg-slate-50 hover:bg-amber-50 border-2 border-slate-200 text-slate-900';

              if (selectedAnswer !== null) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-md';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500 border-2 border-rose-600 text-white shadow-md';
                } else {
                  btnStyle = 'bg-slate-100 text-slate-400 border-2 border-slate-200 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswerSubmit(opt)}
                  className={`min-h-[58px] sm:min-h-[64px] rounded-2xl text-xl sm:text-2xl font-black font-mono transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedAnswer !== null && isCorrectOpt && (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  )}
                  {selectedAnswer === opt && !isCorrectOpt && (
                    <XCircle className="w-6 h-6 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner when answered */}
          {answerResult && (
            <div
              className={`p-4 rounded-2xl text-sm font-semibold flex items-start gap-2.5 ${
                answerResult === 'correct'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {answerResult === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-black text-sm mb-0.5">
                  {answerResult === 'correct'
                    ? language === 'en'
                      ? 'Awesome! Correct Answer! 🍄'
                      : 'Chính xác! Bé nhận được Nấm Thần Kỳ 🍄'
                    : language === 'en'
                    ? 'Oops! Take a look at the solution:'
                    : 'Chưa đúng rồi! Bé xem cách giải nhé:'}
                </div>
                <div className="text-xs sm:text-sm">
                  {language === 'en'
                    ? currentProblem.explanationEn
                    : currentProblem.explanationVi}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
