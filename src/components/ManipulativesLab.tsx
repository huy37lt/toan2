import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Clock, RefreshCw, Plus, Minus, ArrowRight, BookOpen, Layers, CheckCircle2, RotateCcw } from 'lucide-react';
import { Language } from '../types/math';
import { getUIText, TEXTBOOK_NAME_VI, TEXTBOOK_NAME_EN } from '../utils/i18n';
import { sounds, speakText } from '../utils/audio';

interface Props {
  language: Language;
}

type MathScope = 'scope_10' | 'scope_20' | 'scope_100';
type OperationType = 'add' | 'sub';

interface PresetExample {
  label: string;
  scope: MathScope;
  op: OperationType;
  a: number;
  b: number;
  noteVi: string;
  noteEn: string;
}

const PRESET_EXAMPLES: PresetExample[] = [
  // Phạm vi 10
  {
    label: '6 + 4',
    scope: 'scope_10',
    op: 'add',
    a: 6,
    b: 4,
    noteVi: 'Tách gộp số tròn 10: 6 que gộp 4 que vừa đúng 1 bó chục (10).',
    noteEn: 'Number bonds to 10: 6 sticks and 4 sticks make exactly 1 ten bundle (10).',
  },
  {
    label: '7 + 3',
    scope: 'scope_10',
    op: 'add',
    a: 7,
    b: 3,
    noteVi: '7 que thêm 3 que bằng 10 que (1 chục).',
    noteEn: '7 sticks plus 3 sticks make 10 sticks (1 ten).',
  },
  {
    label: '10 - 4',
    scope: 'scope_10',
    op: 'sub',
    a: 10,
    b: 4,
    noteVi: '1 bó chục (10 que) bớt đi 4 que còn lại 6 que rời.',
    noteEn: '1 ten bundle (10 sticks) take away 4 sticks leaves 6 ones.',
  },
  {
    label: '9 - 5',
    scope: 'scope_10',
    op: 'sub',
    a: 9,
    b: 5,
    noteVi: '9 que bớt đi 5 que còn 4 que.',
    noteEn: '9 sticks take away 5 sticks leaves 4 sticks.',
  },
  // Phạm vi 20
  {
    label: '9 + 5',
    scope: 'scope_20',
    op: 'add',
    a: 9,
    b: 5,
    noteVi: 'Cộng qua 10: 9 cần thêm 1 để tròn 10. Tách 5 thành 1 và 4. 9 + 1 = 10, 10 + 4 = 14.',
    noteEn: 'Make a ten: 9 needs 1 to make 10. Split 5 into 1 and 4. 9 + 1 = 10, 10 + 4 = 14.',
  },
  {
    label: '8 + 7',
    scope: 'scope_20',
    op: 'add',
    a: 8,
    b: 7,
    noteVi: '8 cần thêm 2 để thành 10. Tách 7 = 2 + 5. 8 + 2 = 10, rồi 10 + 5 = 15.',
    noteEn: '8 needs 2 to make 10. Split 7 into 2 + 5. 8 + 2 = 10, then 10 + 5 = 15.',
  },
  {
    label: '12 - 7',
    scope: 'scope_20',
    op: 'sub',
    a: 12,
    b: 7,
    noteVi: 'Bớt 2 ở hàng đơn vị trước về 10, sau đó lấy 10 trừ 5 còn 5. Vậy 12 - 7 = 5.',
    noteEn: 'Subtract 2 first to reach 10, then subtract remaining 5 from 10. So 12 - 7 = 5.',
  },
  {
    label: '15 - 8',
    scope: 'scope_20',
    op: 'sub',
    a: 15,
    b: 8,
    noteVi: '15 bớt 5 về 10. Lấy 10 trừ 3 còn 7. Vậy 15 - 8 = 7.',
    noteEn: '15 minus 5 is 10. Then 10 minus 3 is 7. So 15 - 8 = 7.',
  },
  // Phạm vi 100
  {
    label: '37 + 25',
    scope: 'scope_100',
    op: 'add',
    a: 37,
    b: 25,
    noteVi: 'Cộng có nhớ: 7 + 5 = 12 (bó 10 que sang hàng chục, còn 2 que lẻ). Hàng chục: 3 + 2 + 1 = 6.',
    noteEn: 'Addition with carry: 7 + 5 = 12 (bundle 10 into 1 ten, 2 ones remain). Tens: 3 + 2 + 1 = 6.',
  },
  {
    label: '48 + 36',
    scope: 'scope_100',
    op: 'add',
    a: 48,
    b: 36,
    noteVi: '8 + 6 = 14 (viết 4 nhớ 1 chục). Hàng chục: 4 + 3 + 1 = 8. Kết quả là 84.',
    noteEn: '8 + 6 = 14 (write 4, carry 1 ten). Tens: 4 + 3 + 1 = 8. Total is 84.',
  },
  {
    label: '52 - 27',
    scope: 'scope_100',
    op: 'sub',
    a: 52,
    b: 27,
    noteVi: 'Trừ có nhớ: 2 que không bớt được 7 que. Tháo 1 bó chục thành 10 que lẻ: 12 - 7 = 5. Hàng chục: 5 - 2 - 1 = 2.',
    noteEn: 'Subtraction with borrow: 2 cannot subtract 7. Unbundle 1 ten into 10 ones: 12 - 7 = 5. Tens: 5 - 2 - 1 = 2.',
  },
  {
    label: '70 - 34',
    scope: 'scope_100',
    op: 'sub',
    a: 70,
    b: 34,
    noteVi: '0 không bớt được 4. Mượn 1 chục (10 que): 10 - 4 = 6. Hàng chục: 7 - 3 - 1 = 3.',
    noteEn: '0 cannot subtract 4. Borrow 1 ten: 10 - 4 = 6. Tens: 7 - 3 - 1 = 3. Total is 36.',
  },
];

export const ManipulativesLab: React.FC<Props> = ({ language }) => {
  const [activeTool, setActiveTool] = useState<'sticks' | 'clock' | 'tables'>('sticks');

  // Que tính configuration states
  const [scope, setScope] = useState<MathScope>('scope_20');
  const [operation, setOperation] = useState<OperationType>('add');
  const [numA, setNumA] = useState<number>(9);
  const [numB, setNumB] = useState<number>(5);
  const [stepAction, setStepAction] = useState<boolean>(false);

  // Clock states
  const [clockHour, setClockHour] = useState<number>(8);
  const [clockMinute, setClockMinute] = useState<number>(30);
  const [clockQuizMode, setClockQuizMode] = useState<boolean>(false);
  const [clockFeedback, setClockFeedback] = useState<string | null>(null);

  // Multiplication table states
  const [selectedTable, setSelectedTable] = useState<2 | 5>(2);
  const [tableMultiplier, setTableMultiplier] = useState<number>(4);

  // Calculate tens & units
  const tensA = Math.floor(numA / 10);
  const unitsA = numA % 10;
  const tensB = Math.floor(numB / 10);
  const unitsB = numB % 10;

  const result = operation === 'add' ? numA + numB : numA - numB;
  const unitsSum = unitsA + unitsB;
  const isAdditionCarry = operation === 'add' && unitsSum >= 10;
  const isSubtractionBorrow = operation === 'sub' && unitsA < unitsB;

  // Handle Preset Select
  const handleSelectPreset = (p: PresetExample) => {
    sounds.playClick();
    setScope(p.scope);
    setOperation(p.op);
    setNumA(p.a);
    setNumB(p.b);
    setStepAction(false);
  };

  // Change scope
  const handleScopeChange = (newScope: MathScope) => {
    sounds.playClick();
    setScope(newScope);
    setStepAction(false);
    if (newScope === 'scope_10') {
      if (operation === 'add') {
        setNumA(6);
        setNumB(4);
      } else {
        setNumA(10);
        setNumB(4);
      }
    } else if (newScope === 'scope_20') {
      if (operation === 'add') {
        setNumA(9);
        setNumB(5);
      } else {
        setNumA(12);
        setNumB(7);
      }
    } else {
      if (operation === 'add') {
        setNumA(37);
        setNumB(25);
      } else {
        setNumA(52);
        setNumB(27);
      }
    }
  };

  // Toggle operation
  const handleToggleOperation = (op: OperationType) => {
    sounds.playClick();
    setOperation(op);
    setStepAction(false);
    if (scope === 'scope_10') {
      setNumA(op === 'add' ? 7 : 10);
      setNumB(op === 'add' ? 3 : 4);
    } else if (scope === 'scope_20') {
      setNumA(op === 'add' ? 8 : 15);
      setNumB(op === 'add' ? 7 : 8);
    } else {
      setNumA(op === 'add' ? 48 : 61);
      setNumB(op === 'add' ? 36 : 28);
    }
  };

  const handleExecuteAction = () => {
    sounds.playCorrect();
    setStepAction(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleResetAction = () => {
    sounds.playClick();
    setStepAction(false);
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
      {/* Header Banner */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-black shadow-2xs">
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

      {/* Primary Tool Switcher Tabs (Large mobile touch targets) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 bg-amber-200/50 rounded-2xl max-w-lg mx-auto">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('sticks');
          }}
          className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTool === 'sticks'
              ? 'bg-white text-amber-950 shadow-sm scale-102'
              : 'text-amber-900 hover:text-amber-950 hover:bg-white/50'
          }`}
        >
          <span className="text-base sm:text-lg">🥖</span>
          <span>{getUIText(language, 'tabSticks')}</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('clock');
          }}
          className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTool === 'clock'
              ? 'bg-white text-amber-950 shadow-sm scale-102'
              : 'text-amber-900 hover:text-amber-950 hover:bg-white/50'
          }`}
        >
          <span className="text-base sm:text-lg">⏰</span>
          <span>{getUIText(language, 'tabClock')}</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('tables');
          }}
          className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTool === 'tables'
              ? 'bg-white text-amber-950 shadow-sm scale-102'
              : 'text-amber-900 hover:text-amber-950 hover:bg-white/50'
          }`}
        >
          <span className="text-base sm:text-lg">🍓</span>
          <span>{getUIText(language, 'tabTables')}</span>
        </button>
      </div>

      {/* Tool 1: Multi-Scope Sticks Lab (Phạm vi 10, 20, 100) */}
      {activeTool === 'sticks' && (
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 sm:p-7 space-y-6 shadow-xs">
          {/* Scope Selector Bar (Phạm vi 10, 20, 100) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider block">
                  {language === 'en' ? 'Grade 2 Math Scope' : 'Phạm vi số học SGK Lớp 2'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {language === 'en' ? 'Tens & Ones Manipulatives Lab' : 'Góc Thực Hành Que Tính Tương Tác'}
                </h3>
              </div>

              {/* Operation Mode Toggle (+ / -) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => handleToggleOperation('add')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    operation === 'add' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Addition (+)' : 'Phép Cộng (+)'}</span>
                </button>
                <button
                  onClick={() => handleToggleOperation('sub')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    operation === 'sub' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Subtraction (-)' : 'Phép Trừ (-)'}</span>
                </button>
              </div>
            </div>

            {/* Scope 3 Levels buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleScopeChange('scope_10')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-black transition-all cursor-pointer text-center border-2 ${
                  scope === 'scope_10'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="block text-sm">🟢</span>
                <span>{language === 'en' ? 'Within 10' : 'Phạm vi 10'}</span>
                <span className="block text-[10px] font-semibold text-slate-400">
                  {language === 'en' ? 'Make a Ten' : 'Tách gộp số 10'}
                </span>
              </button>

              <button
                onClick={() => handleScopeChange('scope_20')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-black transition-all cursor-pointer text-center border-2 ${
                  scope === 'scope_20'
                    ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="block text-sm">🟡</span>
                <span>{language === 'en' ? 'Within 20' : 'Phạm vi 20'}</span>
                <span className="block text-[10px] font-semibold text-slate-400">
                  {language === 'en' ? 'Through 10' : 'Cộng/trừ qua 10'}
                </span>
              </button>

              <button
                onClick={() => handleScopeChange('scope_100')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-black transition-all cursor-pointer text-center border-2 ${
                  scope === 'scope_100'
                    ? 'bg-purple-50 border-purple-400 text-purple-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="block text-sm">🟣</span>
                <span>{language === 'en' ? 'Within 100' : 'Phạm vi 100'}</span>
                <span className="block text-[10px] font-semibold text-slate-400">
                  {language === 'en' ? '2-Digit Regrouping' : 'Cộng/trừ có nhớ'}
                </span>
              </button>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">
                {language === 'en' ? 'Sample lessons:' : 'Bài mẫu SGK:'}
              </span>
              {PRESET_EXAMPLES.filter((p) => p.scope === scope && p.op === operation).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer whitespace-nowrap ${
                    numA === p.a && numB === p.b
                      ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-2xs scale-105'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equation summary display banner */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-center">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-wider flex items-center justify-center gap-2">
              <span className="text-blue-600">{numA}</span>
              <span className="text-slate-400">{operation === 'add' ? '+' : '-'}</span>
              <span className="text-rose-600">{numB}</span>
              <span className="text-slate-400">=</span>
              <span className={stepAction ? 'text-emerald-600 font-black scale-110 transition-transform' : 'text-slate-400'}>
                {stepAction ? result : '?'}
              </span>
            </div>

            <p className="text-xs text-amber-900 font-semibold mt-1">
              {operation === 'add'
                ? language === 'en'
                  ? `Addend A: ${numA} · Addend B: ${numB}`
                  : `Số hạng 1: ${numA} · Số hạng 2: ${numB}`
                : language === 'en'
                ? `Minuend: ${numA} · Subtrahend: ${numB}`
                : `Số bị trừ: ${numA} · Số trừ: ${numB}`}
            </p>
          </div>

          {/* Unexecuted Visual Step */}
          {!stepAction ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Number A representation */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                    <span>
                      {operation === 'add'
                        ? (language === 'en' ? `First Number: ${numA}` : `Số thứ nhất: ${numA}`)
                        : (language === 'en' ? `Minuend: ${numA}` : `Số bị trừ: ${numA}`)}
                    </span>
                    <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-lg text-[11px]">
                      {tensA > 0 ? `${tensA} ${language === 'en' ? 'tens' : 'chục'} & ` : ''}
                      {unitsA} {language === 'en' ? 'ones' : 'que lẻ'}
                    </span>
                  </div>

                  {/* Visual sticks A */}
                  <div className="flex flex-wrap items-center gap-2 min-h-[50px] p-2 bg-white/80 rounded-xl border border-blue-200/80">
                    {/* Bundles of tens */}
                    {Array.from({ length: tensA }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center bg-amber-50 border border-amber-300 rounded-xl p-1.5 shadow-2xs">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <span key={s} className="w-1.5 h-8 bg-amber-700 rounded-full" />
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-amber-900 mt-0.5">10</span>
                      </div>
                    ))}

                    {/* Single sticks */}
                    <div className="flex flex-wrap gap-1 items-center">
                      {Array.from({ length: unitsA }).map((_, i) => (
                        <span key={i} className="w-1.5 h-8 bg-amber-500 rounded-full inline-block shadow-2xs" />
                      ))}
                      {unitsA === 0 && tensA === 0 && <span className="text-xs text-slate-400 italic">0 que</span>}
                    </div>
                  </div>
                </div>

                {/* Number B representation */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-950">
                    <span>
                      {operation === 'add'
                        ? (language === 'en' ? `Second Number: ${numB}` : `Số thứ hai: ${numB}`)
                        : (language === 'en' ? `Subtrahend (To take away): ${numB}` : `Số trừ (Cần bớt đi): ${numB}`)}
                    </span>
                    <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded-lg text-[11px]">
                      {tensB > 0 ? `${tensB} ${language === 'en' ? 'tens' : 'chục'} & ` : ''}
                      {unitsB} {language === 'en' ? 'ones' : 'que lẻ'}
                    </span>
                  </div>

                  {/* Visual sticks B */}
                  <div className="flex flex-wrap items-center gap-2 min-h-[50px] p-2 bg-white/80 rounded-xl border border-rose-200/80">
                    {Array.from({ length: tensB }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center bg-amber-50 border border-amber-300 rounded-xl p-1.5 shadow-2xs">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <span key={s} className="w-1.5 h-8 bg-amber-700 rounded-full" />
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-amber-900 mt-0.5">10</span>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-1 items-center">
                      {Array.from({ length: unitsB }).map((_, i) => (
                        <span key={i} className="w-1.5 h-8 bg-amber-500 rounded-full inline-block shadow-2xs" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Gộp que tính hoặc Bớt que tính */}
              <div className="text-center pt-2">
                <button
                  onClick={handleExecuteAction}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 fill-white" />
                  <span>
                    {operation === 'add'
                      ? isAdditionCarry
                        ? language === 'en'
                          ? 'Group Sticks & Bundle 10 into 1 Ten!'
                          : 'Gộp que lẻ & Bó 10 que thành 1 bó chục mới!'
                        : language === 'en'
                        ? 'Combine Sticks to Find Sum'
                        : 'Gộp que tính để tìm Tổng'
                      : isSubtractionBorrow
                      ? language === 'en'
                        ? 'Unbundle 1 Ten to Borrow & Subtract!'
                        : 'Tháo 1 bó chục thành 10 que để mượn và trừ!'
                      : language === 'en'
                      ? 'Subtract Sticks to Find Difference'
                      : 'Bớt que tính để tìm Hiệu'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Executed / Result Step with Pedagogical Explanation */
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-emerald-950">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'en' ? 'Resulting sticks after operation:' : 'Kết quả trực quan que tính:'}
                  </span>
                </span>
                <span className="bg-emerald-200/90 text-emerald-950 px-3 py-1 rounded-full text-sm font-black font-mono">
                  {Math.floor(result / 10) > 0 ? `${Math.floor(result / 10)} ${language === 'en' ? 'tens' : 'chục'} & ` : ''}
                  {result % 10} {language === 'en' ? 'ones' : 'que lẻ'} = {result}
                </span>
              </div>

              {/* Resulting visual sticks */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-wrap items-center gap-3">
                {/* Bundles of tens */}
                {Array.from({ length: Math.floor(result / 10) }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center border rounded-xl p-2 shadow-2xs ${
                      operation === 'add' && isAdditionCarry && i === Math.floor(result / 10) - 1
                        ? 'bg-amber-100 border-amber-400 animate-pulse'
                        : 'bg-emerald-50 border-emerald-300'
                    }`}
                  >
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <span key={s} className="w-1.5 h-8 bg-amber-700 rounded-full" />
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-emerald-900 mt-1">
                      {operation === 'add' && isAdditionCarry && i === Math.floor(result / 10) - 1
                        ? language === 'en' ? 'Carried (10)' : 'Bó nhớ (10)'
                        : '10'}
                    </span>
                  </div>
                ))}

                {/* Remaining ones */}
                <div className="flex items-center gap-1 p-2 bg-amber-50/60 border border-amber-200 rounded-xl">
                  {Array.from({ length: result % 10 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-8 bg-amber-500 rounded-full inline-block shadow-2xs" />
                  ))}
                  {result % 10 === 0 && (
                    <span className="text-xs text-slate-400 italic">
                      {language === 'en' ? '0 single sticks' : '0 que lẻ'}
                    </span>
                  )}
                </div>
              </div>

              {/* Pedagogical Step-by-Step Rule */}
              <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-emerald-200 font-medium space-y-1">
                {operation === 'add' ? (
                  scope === 'scope_10' ? (
                    <p>
                      ✨ <strong>{language === 'en' ? 'Rule: ' : 'Quy tắc: '}</strong>
                      {language === 'en'
                        ? `Combining ${numA} sticks and ${numB} sticks gives exactly ${result} sticks.`
                        : `Gộp ${numA} que tính với ${numB} que tính được ${result} que tính.`}
                    </p>
                  ) : scope === 'scope_20' ? (
                    <p>
                      ✨ <strong>{language === 'en' ? 'Make a Ten Method: ' : 'Phương pháp Tách số làm tròn 10: '}</strong>
                      {language === 'en'
                        ? `${numA} needs ${10 - numA} to make 10. Split ${numB} into ${10 - numA} and ${numB - (10 - numA)}. ${numA} + ${10 - numA} = 10, then 10 + ${numB - (10 - numA)} = ${result}.`
                        : `${numA} cần thêm ${10 - numA} để thành 10. Tách ${numB} thành ${10 - numA} và ${numB - (10 - numA)}. Lấy ${numA} + ${10 - numA} = 10, rồi 10 + ${numB - (10 - numA)} = ${result}.`}
                    </p>
                  ) : (
                    <p>
                      ✨ <strong>{language === 'en' ? 'Column Addition with Regrouping: ' : 'Quy tắc Đặt tính có nhớ: '}</strong>
                      {language === 'en'
                        ? `Add ones first: ${unitsA} + ${unitsB} = ${unitsSum}. Write ${result % 10}, carry 1 ten. Add tens: ${tensA} + ${tensB} + 1 = ${Math.floor(result / 10)}. Answer: ${result}.`
                        : `Cộng hàng đơn vị: ${unitsA} + ${unitsB} = ${unitsSum}. Viết ${result % 10} nhớ 1 chục. Cộng hàng chục: ${tensA} + ${tensB} + 1 = ${Math.floor(result / 10)}. Kết quả là ${result}.`}
                    </p>
                  )
                ) : (
                  scope === 'scope_10' ? (
                    <p>
                      ✨ <strong>{language === 'en' ? 'Rule: ' : 'Quy tắc: '}</strong>
                      {language === 'en'
                        ? `Take away ${numB} sticks from ${numA} sticks. Remaining: ${result} sticks.`
                        : `Có ${numA} que tính, bớt đi ${numB} que tính. Còn lại ${result} que tính.`}
                    </p>
                  ) : scope === 'scope_20' ? (
                    <p>
                      ✨ <strong>{language === 'en' ? 'Subtract through 10: ' : 'Trừ qua 10: '}</strong>
                      {language === 'en'
                        ? `Subtract ${unitsA} first to reach 10: ${numA} - ${unitsA} = 10. Then 10 - ${numB - unitsA} = ${result}.`
                        : `Bớt ${unitsA} que ở hàng đơn vị trước để về 10: ${numA} - ${unitsA} = 10. Sau đó lấy 10 trừ ${numB - unitsA} còn ${result}.`}
                    </p>
                  ) : (
                    <p>
                      ✨ <strong>{language === 'en' ? 'Column Subtraction with Borrowing: ' : 'Quy tắc Đặt tính trừ có nhớ: '}</strong>
                      {language === 'en'
                        ? `${unitsA} cannot subtract ${unitsB}. Borrow 1 ten: ${10 + unitsA} - ${unitsB} = ${result % 10}. Tens: ${tensA} - ${tensB} - 1 = ${Math.floor(result / 10)}. Answer: ${result}.`
                        : `${unitsA} không trừ được ${unitsB}, mượn 1 chục là ${10 + unitsA} - ${unitsB} = ${result % 10}. Hàng chục: ${tensA} - ${tensB} - 1 = ${Math.floor(result / 10)}. Kết quả là ${result}.`}
                    </p>
                  )
                )}
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={handleResetAction}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{getUIText(language, 'resetSticks')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 2: Responsive Analog Clock */}
      {activeTool === 'clock' && (
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 sm:p-7 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <span>{language === 'en' ? 'Interactive Analog Clock' : 'Mặt Đồng Hồ Kim Tương Tác'}</span>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'Reading Time' : 'Xem Giờ'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {language === 'en'
                  ? 'Learn exact hours, half hours (30 mins), and quarter hours (15 mins)'
                  : 'Tập xem giờ đúng, giờ rưỡi (30 phút) và 15 phút'}
              </p>
            </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Clock SVG Canvas (Responsive for Mobile) */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
              <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-56 sm:h-56 drop-shadow-md">
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
                      fontSize="15"
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
                  y2="52"
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
                  {/* Digital readout */}
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

                  {/* Hour & Minute adjustments (Mobile-friendly large buttons) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      {language === 'en' ? 'Rotate Clock Hands:' : 'Xoay chỉnh kim:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleClockAdd(15)}
                        className="py-3 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-black text-amber-950 cursor-pointer text-center"
                      >
                        + 15 {language === 'en' ? 'mins' : 'phút'}
                      </button>
                      <button
                        onClick={() => handleClockAdd(30)}
                        className="py-3 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-black text-amber-950 cursor-pointer text-center"
                      >
                        + 30 {language === 'en' ? 'mins' : 'phút (rưỡi)'}
                      </button>
                      <button
                        onClick={() => handleClockAdd(60)}
                        className="py-3 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-black text-blue-950 cursor-pointer text-center"
                      >
                        + 1 {language === 'en' ? 'hour' : 'giờ'}
                      </button>
                      <button
                        onClick={handleRandomClock}
                        className="py-3 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-black text-emerald-950 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Random' : 'Ngẫu nhiên'}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Quiz Mode */
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                      {language === 'en' ? 'Time Challenge' : 'Câu đố xem giờ'}
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
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
                        className="py-3 px-2 bg-white hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer text-center"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {clockFeedback && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 text-center">
                      {clockFeedback}
                    </div>
                  )}

                  <button
                    onClick={handleRandomClock}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 sm:p-7 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <span>
                  {language === 'en'
                    ? 'Visual Array Trays for Tables 2 & 5'
                    : 'Khay Quả Học Bảng Nhân Chia 2 & 5'}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'Visual Arrays' : 'Trực Quan'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {language === 'en'
                  ? 'Visual representation of multiplication as equal groups'
                  : 'Xem hình ảnh các khay hoa quả để hiểu bản chất phép nhân và chia'}
              </p>
            </div>

            {/* Select Table 2 or 5 */}
            <div className="flex items-center gap-1 p-1 bg-emerald-50 rounded-xl border border-emerald-200">
              <button
                onClick={() => {
                  sounds.playClick();
                  setSelectedTable(2);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
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
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
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
                  className={`min-w-[36px] sm:w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
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
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 text-center space-y-4">
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono">
              {selectedTable} × {tableMultiplier} = {selectedTable * tableMultiplier}
            </div>
            <div className="text-xs text-emerald-700 font-bold">
              {language === 'en'
                ? `Corresponding division: ${selectedTable * tableMultiplier} ÷ ${selectedTable} = ${tableMultiplier}`
                : `Phép chia tương ứng: ${selectedTable * tableMultiplier} : ${selectedTable} = ${tableMultiplier}`}
            </div>

            {/* Trays */}
            <div className="flex flex-wrap gap-2.5 justify-center pt-2">
              {Array.from({ length: tableMultiplier }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-emerald-300 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col items-center min-w-[75px]"
                >
                  <div className="flex flex-wrap gap-1 justify-center py-1">
                    {Array.from({ length: selectedTable }).map((_, fIdx) => (
                      <span key={fIdx} className="text-xl sm:text-2xl select-none" role="img" aria-label="item">
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
