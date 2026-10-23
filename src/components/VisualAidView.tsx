import React from 'react';
import { VisualAidData } from '../types/math';

interface Props {
  data: VisualAidData;
}

export const VisualAidView: React.FC<Props> = ({ data }) => {
  if (data.type === 'none') return null;

  // 1. Ten-bundle visual (Bó que tính & que lẻ)
  if (data.type === 'ten_bundle' && data.primaryValue !== undefined) {
    const tens1 = Math.floor(data.primaryValue / 10);
    const units1 = data.primaryValue % 10;
    const tens2 = data.secondaryValue !== undefined ? Math.floor(data.secondaryValue / 10) : 0;
    const units2 = data.secondaryValue !== undefined ? data.secondaryValue % 10 : 0;

    return (
      <div className="w-full bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 my-3 text-slate-800">
        <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Que tính trực quan</span>
          <span className="text-amber-900 font-bold">{data.primaryValue} {data.secondaryValue !== undefined ? `+ ${data.secondaryValue}` : ''}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Nhóm số thứ nhất */}
          <div className="bg-white/90 p-3 rounded-xl border border-amber-100 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold mb-1">
              Số {data.primaryValue}: <span className="text-blue-700 font-bold">{tens1} chục</span> và <span className="text-rose-600 font-bold">{units1} đơn vị</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Bó chục */}
              {Array.from({ length: tens1 }).map((_, i) => (
                <div key={`bundle1-${i}`} className="flex flex-col items-center bg-blue-100/70 border border-blue-300 rounded-lg px-2 py-1 shadow-xs" title="1 Bó 10 que tính">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s} className="w-1 h-7 bg-amber-700 rounded-full" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-blue-900 mt-1">1 Bó (10)</span>
                </div>
              ))}
              {/* Que lẻ */}
              <div className="flex flex-wrap items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1.5">
                {Array.from({ length: units1 }).map((_, i) => (
                  <span key={`unit1-${i}`} className="w-1.5 h-7 bg-amber-600 rounded-full inline-block shadow-xs" title="1 que lẻ" />
                ))}
                {units1 === 0 && <span className="text-[11px] text-slate-400 italic">0 que lẻ</span>}
              </div>
            </div>
          </div>

          {/* Nhóm số thứ hai nếu có */}
          {data.secondaryValue !== undefined && (
            <div className="bg-white/90 p-3 rounded-xl border border-amber-100 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold mb-1">
                Số {data.secondaryValue}: <span className="text-blue-700 font-bold">{tens2} chục</span> và <span className="text-rose-600 font-bold">{units2} đơn vị</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: tens2 }).map((_, i) => (
                  <div key={`bundle2-${i}`} className="flex flex-col items-center bg-blue-100/70 border border-blue-300 rounded-lg px-2 py-1 shadow-xs" title="1 Bó 10 que tính">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <span key={s} className="w-1 h-7 bg-amber-700 rounded-full" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-blue-900 mt-1">1 Bó (10)</span>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1.5">
                  {Array.from({ length: units2 }).map((_, i) => (
                    <span key={`unit2-${i}`} className="w-1.5 h-7 bg-amber-600 rounded-full inline-block shadow-xs" title="1 que lẻ" />
                  ))}
                  {units2 === 0 && <span className="text-[11px] text-slate-400 italic">0 que lẻ</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Group Array Visual (Nhóm đồ vật nhân chia)
  if (data.type === 'group_array') {
    const groupCount = data.groupCount || 2;
    const itemsPerGroup = data.itemsPerGroup || 5;
    const emoji = data.itemEmoji || '🍎';

    return (
      <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 my-3 text-slate-800">
        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Hình ảnh minh họa: {groupCount} nhóm, mỗi nhóm có {itemsPerGroup} đồ vật</span>
          <span className="text-emerald-950 font-bold">{itemsPerGroup} × {groupCount} = {itemsPerGroup * groupCount}</span>
        </div>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {Array.from({ length: groupCount }).map((_, gIdx) => (
            <div
              key={`grp-${gIdx}`}
              className="bg-white/95 rounded-xl border border-emerald-200 p-2 shadow-xs flex flex-col items-center min-w-[70px]"
            >
              <div className="flex flex-wrap gap-1 justify-center items-center py-1">
                {Array.from({ length: itemsPerGroup }).map((_, iIdx) => (
                  <span key={`item-${iIdx}`} className="text-xl select-none" role="img" aria-label="item">
                    {emoji}
                  </span>
                ))}
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                Nhóm {gIdx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Analog Clock Visual (Mặt đồng hồ kim chuẩn lớp 2)
  if (data.type === 'clock') {
    const hour = data.hour || 8;
    const minute = data.minute || 0;

    // Angles: Minute hand moves 360 deg per 60 min (6 deg per min).
    // Hour hand moves 360 deg per 12 hr (30 deg per hr + 0.5 deg per min).
    const minuteAngle = minute * 6;
    const hourAngle = (hour % 12) * 30 + minute * 0.5;

    return (
      <div className="w-full flex flex-col items-center justify-center p-3 bg-amber-50/60 rounded-2xl border border-amber-200 my-2">
        <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-sm">
          {/* Mặt đồng hồ */}
          <circle cx="100" cy="100" r="90" fill="#ffffff" stroke="#0284c7" strokeWidth="6" />
          <circle cx="100" cy="100" r="84" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

          {/* Vạch số 1 đến 12 */}
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

          {/* Vạch chia phút nhỏ */}
          {Array.from({ length: 60 }).map((_, m) => {
            if (m % 5 === 0) return null;
            const a = (m * 6 - 90) * (Math.PI / 180);
            const x1 = 100 + 80 * Math.cos(a);
            const y1 = 100 + 80 * Math.sin(a);
            const x2 = 100 + 83 * Math.cos(a);
            const y2 = 100 + 83 * Math.sin(a);
            return <line key={m} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1" />;
          })}

          {/* Kim giờ (ngắn, to, màu xanh đậm) */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="52"
            stroke="#1d4ed8"
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${hourAngle} 100 100)`}
          />

          {/* Kim phút (dài, màu cam) */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#ea580c"
            strokeWidth="3.5"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle} 100 100)`}
          />

          {/* Trục tâm */}
          <circle cx="100" cy="100" r="5" fill="#0f172a" />
          <circle cx="100" cy="100" r="2" fill="#ffffff" />
        </svg>

        <div className="flex items-center gap-4 mt-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-blue-700">
            <span className="w-3 h-1 bg-blue-700 rounded-full inline-block" /> Kim ngắn: Chỉ giờ
          </span>
          <span className="flex items-center gap-1.5 text-orange-600">
            <span className="w-3 h-1 bg-orange-600 rounded-full inline-block" /> Kim dài: Chỉ phút
          </span>
        </div>
      </div>
    );
  }

  // 4. Measure Ruler (Thước đo xăng-ti-mét)
  if (data.type === 'measure_ruler') {
    return (
      <div className="w-full bg-sky-50 border border-sky-200 rounded-2xl p-4 my-3 text-slate-800">
        <div className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">
          Thước đo cm: 1 đề-xi-mét (1 dm) = 10 xăng-ti-mét (10 cm)
        </div>
        <div className="relative bg-amber-100/90 border-2 border-amber-300 rounded-lg p-2 h-16 flex items-start overflow-x-auto shadow-inner">
          <div className="flex w-full justify-between items-start px-2">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="h-5 w-0.5 bg-amber-900" />
                <span className="text-[11px] font-bold text-amber-950 mt-1">{i}</span>
              </div>
            ))}
          </div>
          {/* Thanh highlight 1 dm (0 đến 10 cm) */}
          <div className="absolute bottom-1 left-4 right-4 bg-blue-500/20 border-b-2 border-blue-600 flex items-center justify-center py-0.5 text-[11px] font-bold text-blue-800">
            ← 1 dm = 10 cm →
          </div>
        </div>
      </div>
    );
  }

  // 5. Scale Balance (Cân đĩa quả dưa 5kg)
  if (data.type === 'scale_balance') {
    return (
      <div className="w-full bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 my-3 flex flex-col items-center">
        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
          Cân thăng bằng (Hai bên có cân nặng bằng nhau)
        </div>
        <div className="w-full max-w-sm flex items-end justify-between px-6 pb-2 border-b-4 border-slate-700 relative">
          {/* Đĩa trái: Quả dưa hấu */}
          <div className="flex flex-col items-center bg-white border border-emerald-300 rounded-xl p-3 shadow-xs min-w-[110px]">
            <span className="text-4xl">🍉</span>
            <span className="text-xs font-bold text-slate-700 mt-1">Quả dưa hấu</span>
            <span className="text-xs text-emerald-600 font-bold">? kg</span>
          </div>

          <div className="text-2xl font-black text-slate-400 mb-6">=</div>

          {/* Đĩa phải: 2 quả cân 3kg và 2kg */}
          <div className="flex flex-col items-center bg-white border border-emerald-300 rounded-xl p-3 shadow-xs min-w-[110px]">
            <div className="flex gap-2 items-center">
              <span className="px-2.5 py-1.5 bg-slate-800 text-white rounded-md text-xs font-bold">3 kg</span>
              <span className="text-slate-400 font-bold">+</span>
              <span className="px-2.5 py-1.5 bg-slate-800 text-white rounded-md text-xs font-bold">2 kg</span>
            </div>
            <span className="text-xs font-bold text-slate-700 mt-2">Tổng: 5 kg</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. Shape Puzzle (Đường gấp khúc / Tam giác / Tứ giác)
  if (data.type === 'shape_puzzle') {
    if (data.shapeType === 'broken_line') {
      const segments = data.lineSegments || [12, 18];
      return (
        <div className="w-full bg-violet-50/70 border border-violet-200 rounded-2xl p-4 my-3">
          <div className="text-xs font-bold text-violet-800 uppercase tracking-wider mb-2">
            Đường gấp khúc: Độ dài = Tổng độ dài các đoạn thẳng
          </div>
          <svg viewBox="0 0 320 90" className="w-full h-24">
            {segments.length === 2 ? (
              <>
                <polyline points="20,70 140,25 300,65" fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="20" cy="70" r="5" fill="#4338ca" />
                <circle cx="140" cy="25" r="5" fill="#4338ca" />
                <circle cx="300" cy="65" r="5" fill="#4338ca" />
                <text x="20" y="86" fontSize="12" fontWeight="bold" fill="#312e81">A</text>
                <text x="140" y="16" fontSize="12" fontWeight="bold" fill="#312e81">B</text>
                <text x="300" y="84" fontSize="12" fontWeight="bold" fill="#312e81">C</text>
                <text x="75" y="40" fontSize="11" fontWeight="bold" fill="#6d28d9">AB = {segments[0]} cm</text>
                <text x="215" y="40" fontSize="11" fontWeight="bold" fill="#6d28d9">BC = {segments[1]} cm</text>
              </>
            ) : (
              <>
                <polyline points="20,65 110,25 210,75 300,30" fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="20" cy="65" r="4" fill="#4338ca" />
                <circle cx="110" cy="25" r="4" fill="#4338ca" />
                <circle cx="210" cy="75" r="4" fill="#4338ca" />
                <circle cx="300" cy="30" r="4" fill="#4338ca" />
                <text x="20" y="82" fontSize="11" fontWeight="bold" fill="#312e81">M</text>
                <text x="110" y="18" fontSize="11" fontWeight="bold" fill="#312e81">N</text>
                <text x="210" y="88" fontSize="11" fontWeight="bold" fill="#312e81">P</text>
                <text x="300" y="24" fontSize="11" fontWeight="bold" fill="#312e81">Q</text>
                <text x="60" y="40" fontSize="10" fontWeight="bold" fill="#6d28d9">{segments[0]} cm</text>
                <text x="155" y="45" fontSize="10" fontWeight="bold" fill="#6d28d9">{segments[1]} cm</text>
                <text x="250" y="45" fontSize="10" fontWeight="bold" fill="#6d28d9">{segments[2]} cm</text>
              </>
            )}
          </svg>
        </div>
      );
    }

    if (data.shapeType === 'quadrilateral') {
      return (
        <div className="w-full bg-violet-50/70 border border-violet-200 rounded-2xl p-4 my-3 flex items-center justify-around">
          <svg viewBox="0 0 160 120" className="w-36 h-28">
            <polygon points="25,30 135,20 150,95 20,105" fill="#ede9fe" stroke="#7c3aed" strokeWidth="3" />
            <circle cx="25" cy="30" r="4" fill="#6d28d9" />
            <circle cx="135" cy="20" r="4" fill="#6d28d9" />
            <circle cx="150" cy="95" r="4" fill="#6d28d9" />
            <circle cx="20" cy="105" r="4" fill="#6d28d9" />
          </svg>
          <div className="text-xs text-slate-700 space-y-1">
            <div className="font-bold text-violet-900">Hình tứ giác:</div>
            <div>• Có đúng 4 cạnh bao quanh</div>
            <div>• Có đúng 4 đỉnh và 4 góc</div>
          </div>
        </div>
      );
    }

    if (data.shapeType === 'triangle') {
      return (
        <div className="w-full bg-violet-50/70 border border-violet-200 rounded-2xl p-4 my-3 flex items-center justify-around">
          <svg viewBox="0 0 160 120" className="w-36 h-28">
            <polygon points="80,15 145,100 15,100" fill="#fee2e2" stroke="#dc2626" strokeWidth="3" />
            <circle cx="80" cy="15" r="4" fill="#991b1b" />
            <circle cx="145" cy="100" r="4" fill="#991b1b" />
            <circle cx="15" cy="100" r="4" fill="#991b1b" />
          </svg>
          <div className="text-xs text-slate-700 space-y-1">
            <div className="font-bold text-rose-900">Hình tam giác:</div>
            <div>• Có 3 cạnh</div>
            <div>• Có 3 đỉnh và 3 góc</div>
          </div>
        </div>
      );
    }
  }

  // 7. Comparison Bar (Lan và Mai - Nhiều hơn / Ít hơn)
  if (data.type === 'comparison_bar') {
    return (
      <div className="w-full bg-amber-50/80 border border-amber-200 rounded-2xl p-4 my-3">
        <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
          Sơ đồ đoạn thẳng (Nhiều hơn)
        </div>
        <div className="space-y-3">
          {/* Lan */}
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs font-bold text-slate-700">Lan:</span>
            <div className="h-7 bg-blue-400 rounded-lg flex items-center justify-center text-white text-xs font-bold px-3 shadow-xs" style={{ width: '55%' }}>
              15 ngôi sao
            </div>
          </div>

          {/* Mai */}
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs font-bold text-slate-700">Mai:</span>
            <div className="flex items-center" style={{ width: '80%' }}>
              <div className="h-7 bg-blue-400 rounded-l-lg flex items-center justify-center text-white text-xs font-bold px-3 shadow-xs" style={{ width: '68%' }}>
                15
              </div>
              <div className="h-7 bg-amber-400 border-l border-dashed border-white rounded-r-lg flex items-center justify-center text-amber-950 text-xs font-extrabold px-2 shadow-xs" style={{ width: '32%' }}>
                +6 sao
              </div>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-slate-600 mt-2 italic text-right">
          Phần nhiều hơn: +6 ngôi sao → Mai có: 15 + 6 = 21 ngôi sao
        </div>
      </div>
    );
  }

  return null;
};
