import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Clock, RefreshCw, Plus, Minus, ArrowRight, BookOpen } from 'lucide-react';
import { Language } from '../types/math';
import { getUIText, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds, speakText } from '../utils/audio';

interface Props {
  language: Language;
}

export const ManipulativesLab: React.FC<Props> = ({ language }) => {
  const [activeTool, setActiveTool] = useState<'sticks' | 'clock' | 'tables'>('sticks');

  // Que tính states
  const [numA, setNumA] = useState<number>(37);
  const [numB, setNumB] = useState<number>(25);
  const [stepMerged, setStepMerged] = useState<boolean>(false);

  // Clock states
  const [clockHour, setClockHour] = useState<number>(8);
  const [clockMinute, setClockMinute] = useState<number>(30);
  const [clockQuizMode, setClockQuizMode] = useState<boolean>(false);
  const [clockFeedback, setClockFeedback] = useState<string | null>(null);

  // Multiplication table states
  const [selectedTable, setSelectedTable] = useState<2 | 5>(2);
  const [tableMultiplier, setTableMultiplier] = useState<number>(4);

  // Helpers for sticks
  const tensA = Math.floor(numA / 10);
  const unitsA = numA % 10;
  const tensB = Math.floor(numB / 10);
  const unitsB = numB % 10;

  const totalSum = numA + numB;
  const totalUnits = unitsA + unitsB;
  const carries = totalUnits >= 10;

  const handleMergeSticks = () => {
    sounds.playCorrect();
    setStepMerged(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleResetSticks = () => {
    sounds.playClick();
    setStepMerged(false);
  };

  // Clock helpers
  const minuteAngle = clockMinute * 6;
  const hourAngle = (clockHour % 12) * 30 + clockMinute * 0.5;

  const handleClockAdd = (m: number) => {
    sounds.playClick();
    let newMin = clockMinute + m;
    let newHr = clockHour;
    while (newMin >= 60) {
      newMin -= 60;
      newHr = (newHr % 12) + 1;
    }
    while (newMin < 0) {
      newMin += 60;
      newHr = newHr === 1 ? 12 : newHr - 1;
    }
    setClockHour(newHr);
    setClockMinute(newMin);
  };

  const handleRandomClock = () => {
    sounds.playClick();
    const randomHr = Math.floor(Math.random() * 12) + 1;
    const possibleMin = [0, 15, 30, 45];
    const randomMin = possibleMin[Math.floor(Math.random() * possibleMin.length)];
    setClockHour(randomHr);
    setClockMinute(randomMin);
    setClockFeedback(null);
  };

  const handleCheckClockGuess = (guessStr: string) => {
    const isExactHour =
      clockMinute === 0 &&
      (guessStr.includes(`${clockHour} giờ`) || guessStr.includes(`${clockHour} o'clock`));
    const isHalfHour =
      clockMinute === 30 &&
      (guessStr.includes('rưỡi') || guessStr.includes('30') || guessStr.includes('Half past'));
    const is15Min = clockMinute === 15 && guessStr.includes('15');
    const is45Min = clockMinute === 45 && guessStr.includes('45');

    if (isExactHour || isHalfHour || is15Min || is45Min) {
      sounds.playCorrect();
      setClockFeedback(
        language === 'en'
          ? 'Brilliant! You read the analog clock accurately! 🎉'
          : 'Chính xác tuyệt vời! Bé xem đồng hồ rất chuẩn! 🎉'
      );
      confetti({ particleCount: 40, spread: 50 });
    } else {
      sounds.playWrong();
      setClockFeedback(
        language === 'en'
          ? `Not quite! Short hand is past ${clockHour}, long hand points to ${clockMinute / 5}. Look closely!`
          : `Chưa đúng rồi! Kim ngắn chỉ qua số ${clockHour}, kim dài chỉ số ${clockMinute / 5}. Bé xem lại nhé!`
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Curriculum Banner Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-2xs">
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span>{language === 'en' ? TEXTBOOK_NAME_EN : TEXTBOOK_NAME_VI}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {getUIText(language, 'labTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          {getUIText(language, 'labDesc')}
        </p>
      </div>

      {/* Tool Selector Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-amber-100/70 rounded-2xl max-w-lg mx-auto">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('sticks');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTool === 'sticks'
              ? 'bg-white text-amber-950 shadow-xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-white/50'
          }`}
        >
          🥖 {getUIText(language, 'tabSticks')}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('clock');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTool === 'clock'
              ? 'bg-white text-amber-950 shadow-xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-white/50'
          }`}
        >
          ⏰ {getUIText(language, 'tabClock')}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('tables');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTool === 'tables'
              ? 'bg-white text-amber-950 shadow-xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-white/50'
          }`}
        >
          🍓 {getUIText(language, 'tabTables')}
        </button>
      </div>

      {/* Tool 1: Interactive Ten-Bundles and Sticks */}
      {activeTool === 'sticks' && (
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span>
                  {language === 'en'
                    ? 'Counting Sticks: Understanding Addition with Regrouping'
                    : 'Bảng Que Tính: Hiểu Bản Chất Cộng Có Nhớ'}
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'Grade 2' : 'Lớp 2'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {language === 'en'
                  ? 'Bundle 10 single sticks into 1 new ten to carry over to the tens column!'
                  : 'Gộp 10 que tính rời thành 1 bó chục chuyển sang hàng chục!'}
              </p>
            </div>

            {/* Change numbers controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-slate-700">
                <span>{language === 'en' ? 'Term A:' : 'Số A:'}</span>
                <select
                  value={numA}
                  onChange={(e) => {
                    setNumA(Number(e.target.value));
                    setStepMerged(false);
                  }}
                  className="bg-white px-2 py-0.5 rounded-md border border-amber-300 font-black text-blue-700 cursor-pointer"
                >
                  <option value={28}>28</option>
                  <option value={37}>37</option>
                  <option value={46}>46</option>
                  <option value={59}>59</option>
                </select>
              </div>

              <span className="font-bold text-slate-400">+</span>

              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-slate-700">
                <span>{language === 'en' ? 'Term B:' : 'Số B:'}</span>
                <select
                  value={numB}
                  onChange={(e) => {
                    setNumB(Number(e.target.value));
                    setStepMerged(false);
                  }}
                  className="bg-white px-2 py-0.5 rounded-md border border-amber-300 font-black text-rose-700 cursor-pointer"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={38}>38</option>
                  <option value={27}>27</option>
                </select>
              </div>
            </div>
          </div>

          {/* Equation summary */}
          <div className="text-center py-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-wider">
              <span className="text-blue-600">{numA}</span> + <span className="text-rose-600">{numB}</span> ={' '}
              <span className="text-emerald-600">{totalSum}</span>
            </span>
          </div>

          {!stepMerged ? (
            /* Unmerged state */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Number A */}
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span>{language === 'en' ? `Number ${numA}` : `Số ${numA}`}</span>
                    <span>
                      {language === 'en'
                        ? `${tensA} tens & ${unitsA} ones`
                        : `${tensA} chục & ${unitsA} que lẻ`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {Array.from({ length: tensA }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center bg-white border border-blue-300 rounded-xl p-2 shadow-xs">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 6 }).map((_, s) => (
                            <span key={s} className="w-1.5 h-10 bg-amber-700 rounded-full" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-blue-800 mt-1">10</span>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-1 p-2 bg-white/80 rounded-xl border border-blue-200">
                      {Array.from({ length: unitsA }).map((_, i) => (
                        <span key={i} className="w-1.5 h-10 bg-amber-600 rounded-full inline-block shadow-xs" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Number B */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                    <span>{language === 'en' ? `Number ${numB}` : `Số ${numB}`}</span>
                    <span>
                      {language === 'en'
                        ? `${tensB} tens & ${unitsB} ones`
                        : `${tensB} chục & ${unitsB} que lẻ`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {Array.from({ length: tensB }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center bg-white border border-rose-300 rounded-xl p-2 shadow-xs">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 6 }).map((_, s) => (
                            <span key={s} className="w-1.5 h-10 bg-amber-700 rounded-full" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-rose-800 mt-1">10</span>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-1 p-2 bg-white/80 rounded-xl border border-rose-200">
                      {Array.from({ length: unitsB }).map((_, i) => (
                        <span key={i} className="w-1.5 h-10 bg-amber-600 rounded-full inline-block shadow-xs" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Merge sticks */}
              <div className="text-center pt-2">
                <button
                  onClick={handleMergeSticks}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{getUIText(language, 'mergeTens')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Merged state */
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 space-y-4">
              <div className="text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>
                  {language === 'en'
                    ? 'Result after regrouping ones into tens:'
                    : 'Kết quả sau khi gộp và chuyển nhớ:'}
                </span>
                <span className="bg-emerald-200/80 text-emerald-950 px-2.5 py-0.5 rounded-full">
                  {language === 'en'
                    ? `${Math.floor(totalSum / 10)} tens & ${totalSum % 10} ones = ${totalSum}`
                    : `${Math.floor(totalSum / 10)} chục và ${totalSum % 10} que lẻ = ${totalSum}`}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-wrap items-center gap-4">
                {/* Total bundles */}
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: Math.floor(totalSum / 10) }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center border rounded-xl p-2 shadow-xs ${
                        i === Math.floor(totalSum / 10) - 1 && carries
                          ? 'bg-amber-100 border-amber-400 animate-pulse'
                          : 'bg-emerald-50 border-emerald-300'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {Array.from({ length: 6 }).map((_, s) => (
                          <span key={s} className="w-1.5 h-10 bg-amber-700 rounded-full" />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-emerald-900 mt-1">
                        {i === Math.floor(totalSum / 10) - 1 && carries
                          ? (language === 'en' ? 'Carried (10)' : 'Bó nhớ (10)')
                          : '10'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Remaining units */}
                <div className="flex items-center gap-1 p-2 bg-rose-50 border border-rose-200 rounded-xl">
                  {Array.from({ length: totalSum % 10 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-10 bg-amber-600 rounded-full inline-block shadow-xs" />
                  ))}
                  {totalSum % 10 === 0 && (
                    <span className="text-xs text-slate-400 italic">
                      {language === 'en' ? '0 single sticks' : '0 que lẻ'}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-emerald-900 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-200 font-medium">
                ✨ <strong>{language === 'en' ? 'Regrouping Rule: ' : 'Quy tắc đặt tính: '}</strong>
                {language === 'en'
                  ? `Add ones first: ${unitsA} + ${unitsB} = ${totalUnits}. Since ${totalUnits} is 10 or greater, write ${totalSum % 10} and carry 1 ten over! Tens: ${tensA} + ${tensB} + 1 = ${Math.floor(totalSum / 10)}. Total: ${totalSum}!`
                  : `Lấy hàng đơn vị cộng trước: ${unitsA} + ${unitsB} = ${totalUnits}. Vì ${totalUnits} lớn hơn 10 nên ta viết ${totalSum % 10} nhớ 1 chục sang hàng chục! Hàng chục: ${tensA} + ${tensB} = ${tensA + tensB}, thêm 1 bằng ${Math.floor(totalSum / 10)}. Kết quả là ${totalSum}!`}
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={handleResetSticks}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{getUIText(language, 'resetSticks')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 2: Interactive Analog Clock */}
      {activeTool === 'clock' && (
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span>{language === 'en' ? 'Interactive Analog Clock' : 'Mặt Đồng Hồ Kim Tương Tác'}</span>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'Tell Time' : 'Xem Giờ'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {language === 'en'
                  ? 'Learn exact hours, half hours (30 mins), and quarter hours (15 mins)'
                  : 'Tập xem giờ đúng, giờ rưỡi (30 phút) và 15 phút'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setClockQuizMode(!clockQuizMode);
                  setClockFeedback(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  clockQuizMode
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {clockQuizMode
                  ? (language === 'en' ? '✓ Quiz Mode Active' : '✓ Đang bật chế độ đố vui')
                  : (language === 'en' ? 'Play Clock Quiz' : 'Chơi đố vui xem giờ')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Clock SVG Canvas */}
            <div className="flex flex-col items-center justify-center p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
              <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-md">
                <circle cx="100" cy="100" r="92" fill="#ffffff" stroke="#0284c7" strokeWidth="6" />
                <circle cx="100" cy="100" r="85" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                  const angle = (num * 30 - 90) * (Math.PI / 180);
                  const x = 100 + 70 * Math.cos(angle);
                  const y = 100 + 70 * Math.sin(angle);
                  return (
                    <text
                      key={num}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="16"
                      fontWeight="bold"
                      fill="#1e293b"
                    >
                      {num}
                    </text>
                  );
                })}

                {/* Minute markers */}
                {Array.from({ length: 60 }).map((_, m) => {
                  if (m % 5 === 0) return null;
                  const a = (m * 6 - 90) * (Math.PI / 180);
                  const x1 = 100 + 80 * Math.cos(a);
                  const y1 = 100 + 80 * Math.sin(a);
                  const x2 = 100 + 83 * Math.cos(a);
                  const y2 = 100 + 83 * Math.sin(a);
                  return <line key={m} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1" />;
                })}

                {/* Hour Hand */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="50"
                  stroke="#1d4ed8"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  transform={`rotate(${hourAngle} 100 100)`}
                />

                {/* Minute Hand */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="28"
                  stroke="#ea580c"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  transform={`rotate(${minuteAngle} 100 100)`}
                />

                <circle cx="100" cy="100" r="5.5" fill="#0f172a" />
                <circle cx="100" cy="100" r="2" fill="#ffffff" />
              </svg>

              <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="w-3 h-1 bg-blue-700 rounded-full" />
                  {language === 'en' ? 'Short hand: Hour' : 'Kim ngắn: Giờ'}
                </span>
                <span className="flex items-center gap-1 text-orange-600">
                  <span className="w-3 h-1 bg-orange-600 rounded-full" />
                  {language === 'en' ? 'Long hand: Minute' : 'Kim dài: Phút'}
                </span>
              </div>
            </div>

            {/* Controls / Quiz Panel */}
            <div className="space-y-4">
              {!clockQuizMode ? (
                <>
                  {/* Digital read out */}
                  <div className="bg-slate-900 text-amber-400 p-4 rounded-2xl text-center shadow-inner">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      {language === 'en' ? 'Digital Clock Equivalent' : 'Đồng hồ điện tử tương ứng'}
                    </span>
                    <span className="text-3xl font-black font-mono tracking-widest">
                      {String(clockHour).padStart(2, '0')} : {String(clockMinute).padStart(2, '0')}
                    </span>
                    <div className="text-xs text-amber-200 mt-1 font-bold">
                      {language === 'en'
                        ? clockMinute === 0
                          ? `${clockHour} o'clock`
                          : clockMinute === 30
                          ? `Half past ${clockHour} (${clockHour}:30)`
                          : `${clockHour}:${String(clockMinute).padStart(2, '0')}`
                        : clockMinute === 0
                        ? `${clockHour} giờ đúng`
                        : clockMinute === 30
                        ? `${clockHour} giờ rưỡi (${clockHour} giờ 30 phút)`
                        : `${clockHour} giờ ${clockMinute} phút`}
                    </div>
                  </div>

                  {/* Hour & Minute adjustments */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      {language === 'en' ? 'Rotate Clock Hands:' : 'Xoay chỉnh kim:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleClockAdd(15)}
                        className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 cursor-pointer"
                      >
                        + 15 {language === 'en' ? 'mins' : 'phút'}
                      </button>
                      <button
                        onClick={() => handleClockAdd(30)}
                        className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 cursor-pointer"
                      >
                        + 30 {language === 'en' ? 'mins (half hour)' : 'phút (giờ rưỡi)'}
                      </button>
                      <button
                        onClick={() => handleClockAdd(60)}
                        className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 cursor-pointer"
                      >
                        + 1 {language === 'en' ? 'hour' : 'giờ'}
                      </button>
                      <button
                        onClick={handleRandomClock}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Random Time' : 'Giờ ngẫu nhiên'}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Quiz Mode */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">
                      {language === 'en' ? 'Time Challenge' : 'Câu đố xem giờ'}
                    </span>
                    <p className="text-sm font-extrabold text-slate-800">
                      {language === 'en'
                        ? 'Look at the clock face and guess the correct time:'
                        : 'Bé hãy nhìn mặt đồng hồ bên cạnh và đoán xem đang là mấy giờ?'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      language === 'en' ? `${clockHour} o'clock` : `${clockHour} giờ`,
                      language === 'en' ? `Half past ${clockHour}` : `${clockHour} giờ rưỡi`,
                      language === 'en' ? `${(clockHour % 12) + 1} o'clock` : `${(clockHour % 12) + 1} giờ`,
                      language === 'en' ? `${clockHour}:15` : `${clockHour} giờ 15 phút`,
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleCheckClockGuess(opt)}
                        className="p-3 bg-white hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {clockFeedback && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
                      {clockFeedback}
                    </div>
                  )}

                  <button
                    onClick={handleRandomClock}
                    className="w-full py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{getUIText(language, 'randomClock')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tool 3: Visual Multiplication & Division Arrays */}
      {activeTool === 'tables' && (
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span>
                  {language === 'en'
                    ? 'Visual Array Trays for Tables 2 & 5'
                    : 'Khay Quả Học Bảng Nhân Chia 2 & 5'}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'Visual' : 'Trực Quan'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {language === 'en'
                  ? 'Visual representation of multiplication as equal groups'
                  : 'Xem hình ảnh các khay hoa quả để nhớ sâu bảng cửu chương'}
              </p>
            </div>

            {/* Select 2 or 5 */}
            <div className="flex items-center gap-1 p-1 bg-emerald-50 rounded-xl border border-emerald-200">
              <button
                onClick={() => {
                  sounds.playClick();
                  setSelectedTable(2);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedTable === 2 ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:bg-white/50'
                }`}
              >
                {language === 'en' ? 'Table 2' : 'Bảng 2'}
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setSelectedTable(5);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedTable === 5 ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:bg-white/50'
                }`}
              >
                {language === 'en' ? 'Table 5' : 'Bảng 5'}
              </button>
            </div>
          </div>

          {/* Multiplier Slider / Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{language === 'en' ? 'Number of Trays (Groups):' : 'Số khay (Số lần lấy):'}</span>
              <span className="text-emerald-700 font-black text-base">
                {tableMultiplier} {language === 'en' ? 'trays' : 'khay'}
              </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    sounds.playClick();
                    setTableMultiplier(num);
                  }}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                    tableMultiplier === num
                      ? 'bg-emerald-600 text-white shadow-xs scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Tray visual container */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-center space-y-4">
            <div className="text-3xl font-black text-emerald-900 font-mono">
              {selectedTable} × {tableMultiplier} = {selectedTable * tableMultiplier}
            </div>
            <div className="text-xs text-emerald-700 font-bold">
              {language === 'en'
                ? `Corresponding division: ${selectedTable * tableMultiplier} ÷ ${selectedTable} = ${tableMultiplier}`
                : `Phép chia tương ứng: ${selectedTable * tableMultiplier} : ${selectedTable} = ${tableMultiplier}`}
            </div>

            {/* Trays */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              {Array.from({ length: tableMultiplier }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-emerald-300 rounded-2xl p-3 shadow-xs flex flex-col items-center min-w-[80px]"
                >
                  <div className="flex flex-wrap gap-1 justify-center py-1">
                    {Array.from({ length: selectedTable }).map((_, fIdx) => (
                      <span key={fIdx} className="text-2xl select-none" role="img" aria-label="item">
                        {selectedTable === 2 ? '🍒' : '⭐'}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                    {language === 'en' ? `Group ${idx + 1}` : `Khay ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
