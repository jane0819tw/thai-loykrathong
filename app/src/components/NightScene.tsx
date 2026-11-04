import { useMemo } from 'react';

/* N5：週期 300 的波形，位移一個週期即無縫循環（僅 transform 動畫） */
const WAVE_D =
  'M0 30 Q75 16 150 30 T300 30 T450 30 T600 30 T750 30 T900 30 T1050 30 T1200 30 T1350 30 T1500 30 V60 H0 Z';

/** 夜景背景 — 純視覺，無 props（§7） */
export default function NightScene() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 46,
        s: Math.random() * 1.6 + 0.4,
        d: Math.random() * 4,
      })),
    [],
  );
  const lanterns = useMemo(
    () =>
      Array.from({ length: 7 }).map(() => ({
        x: Math.random() * 100,
        dur: 24 + Math.random() * 20,
        delay: -(Math.random() * 30),
        s: 0.6 + Math.random() * 0.8,
      })),
    [],
  );

  return (
    <div className="lk-scene">
      {/* 天空 */}
      <div className="lk-sky" />
      {/* 星星 */}
      <div className="lk-stars">
        {stars.map((st, i) => (
          <span
            key={i}
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: st.s,
              height: st.s,
              animationDelay: `${st.d}s`,
            }}
          />
        ))}
      </div>
      {/* 月亮 */}
      <div className="lk-moon">
        <div className="lk-moon-halo" />
        <div className="lk-moon-body" />
      </div>
      {/* 天燈（緩升） */}
      <div className="lk-khomloi">
        {lanterns.map((l, i) => (
          <span
            key={i}
            style={{
              left: `${l.x}%`,
              transform: `scale(${l.s})`,
              animationDuration: `${l.dur}s`,
              animationDelay: `${l.delay}s`,
            }}
          />
        ))}
      </div>
      {/* 鄭王廟剪影 */}
      <svg className="lk-temple" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax meet">
        <g fill="#0A0E22">
          {/* 中央高塔 prang */}
          <path d="M200 6 L206 26 L212 50 L220 120 L180 120 L188 50 L194 26 Z" />
          <path d="M186 44 L214 44 L222 60 L178 60 Z" />
          <rect x="184" y="60" width="32" height="60" />
          <circle cx="200" cy="8" r="2.4" />
          {/* 四座小塔 */}
          <path d="M150 40 L156 70 L162 120 L138 120 L144 70 Z" />
          <rect x="142" y="70" width="16" height="50" />
          <path d="M250 40 L256 70 L262 120 L238 120 L244 70 Z" />
          <rect x="242" y="70" width="16" height="50" />
          <path d="M120 58 L126 120 L106 120 L112 80 Z" />
          <path d="M280 58 L288 80 L294 120 L274 120 Z" />
          {/* 兩岸建物 */}
          <rect x="0" y="92" width="90" height="28" />
          <rect x="20" y="80" width="10" height="14" />
          <rect x="330" y="90" width="70" height="30" />
          <rect x="360" y="78" width="8" height="14" />
        </g>
      </svg>
      {/* 水面（N5：多層波浪 + 保留月光倒影柱） */}
      <div className="lk-water">
        <div className="lk-moon-reflect" />
        <svg className="lk-waves lk-waves-back" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path className="lk-wave-path" d={WAVE_D} fill="rgba(122,168,210,0.10)" />
        </svg>
        <svg className="lk-waves lk-waves-mid" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path className="lk-wave-path" d={WAVE_D} fill="rgba(94,142,186,0.14)" />
        </svg>
        <svg className="lk-waves lk-waves-front" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path className="lk-wave-path" d={WAVE_D} fill="rgba(46,90,122,0.30)" />
        </svg>
        {/* v1.2 M4：兩條長橫線（shimmer）已移除，水面層次由 N5 波浪承擔 */}
      </div>
    </div>
  );
}
