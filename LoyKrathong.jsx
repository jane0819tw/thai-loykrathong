import React, { useState, useMemo, useCallback } from "react";

/* ============================================================
   水燈節許願網站 · Loy Krathong Wishing Web (MVP v0.1)
   純前端，無資料庫。願望之河 = seed 資料 + 使用者本次新增。
   單一 KrathongSVG 元件同時用於「即時預覽」與「河面漂流」。
   ============================================================ */

/* ---------- 客製選項 ---------- */
const FLOWERS = {
  marigold: { label: "萬壽菊", th: "ดาวเรือง", emoji: "🌼", color: "#FF9E2C", edge: "#C9741A" },
  lotus: { label: "蓮花", th: "บัว", emoji: "🪷", color: "#FF8FB1", edge: "#D65B84" },
  orchid: { label: "蘭花", th: "กล้วยไม้", emoji: "🌺", color: "#C88FEA", edge: "#9B5FC4" },
  rose: { label: "玫瑰", th: "กุหลาบ", emoji: "🌹", color: "#E8506A", edge: "#B22B45" },
};
const BASES = {
  leaf: { label: "香蕉葉", th: "ใบตอง", emoji: "🍌", color: "#4A7C59", edge: "#2F5A3B", top: "#6FA97C" },
  coconut: { label: "椰子殼", th: "กะลา", emoji: "🥥", color: "#6B4A2F", edge: "#4A3120", top: "#8A6440" },
  bread: { label: "環保麵包", th: "ขนมปัง", emoji: "🍞", color: "#D9A86C", edge: "#B5844A", top: "#EBC48C" },
};
const STYLES = {
  classic: { label: "經典", th: "ดั้งเดิม", emoji: "🕯️" },
  dessert: { label: "泰式甜點", th: "ขนมไทย", emoji: "🍮" },
  gl: { label: "GL 明星", th: "วายหญิง", emoji: "💖" },
};

/* ---------- 種入河面的範例願望 ---------- */
const SEED = [
  { wish: "ขอให้ครอบครัวของเรามีความสุขตลอดไป", nickname: "แนน", flower: "marigold", base: "leaf", style: "classic" },
  { wish: "ขอให้สุขภาพแข็งแรงทั้งปี", nickname: "โอ๊ต", flower: "lotus", base: "leaf", style: "classic" },
  { wish: "ขอให้เราสองคนได้อยู่ด้วยกันนาน ๆ 💕", nickname: "มิว & ฟ้า", flower: "rose", base: "leaf", style: "gl" },
  { wish: "ขอให้สอบติดมหาลัยที่ฝันไว้", nickname: "ปลาย", flower: "orchid", base: "bread", style: "classic" },
  { wish: "ขอให้ขายของดี ร่ำรวยเงินทอง", nickname: "เจ๊หมวย", flower: "marigold", base: "coconut", style: "dessert" },
  { wish: "ขอให้ได้เที่ยวรอบโลกสักครั้ง", nickname: "ต้นน้ำ", flower: "lotus", base: "leaf", style: "classic" },
  { wish: "ขอให้ซีรีส์วายเรื่องใหม่ปัง ๆ 🌈", nickname: "ติ่งซีรีส์", flower: "orchid", base: "leaf", style: "gl" },
  { wish: "ขอให้ทุกความฝันเป็นจริง", nickname: "ดาว", flower: "marigold", base: "leaf", style: "dessert" },
];

const uid = () => Math.random().toString(36).slice(2, 9);

function buildKrathong(data, i, total) {
  return {
    id: uid(),
    ...data,
    nickname: data.nickname?.trim() || "ผู้ไม่ประสงค์ออกนาม",
    lane: 0.18 + (i / Math.max(total, 1)) * 0.62 + (Math.random() * 0.08 - 0.04),
    scale: 0.55 + Math.random() * 0.5,
    duration: 34 + Math.random() * 26,
    delay: -(Math.random() * 40),
  };
}

/* ============================================================
   KrathongSVG — 唯一水燈繪製來源（預覽 + 河面共用）
   ============================================================ */
function KrathongSVG({ flower = "marigold", base = "leaf", style = "classic", size = 120 }) {
  const f = FLOWERS[flower];
  const b = BASES[base];
  const petals = Array.from({ length: 14 });

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible", display: "block" }}>
      {/* 燭光暈 */}
      <ellipse cx="60" cy="58" rx="46" ry="30" fill="url(#glow)" opacity="0.9" />
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#FFB347" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameG" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#FFF6D6" />
          <stop offset="55%" stopColor="#FFC24B" />
          <stop offset="100%" stopColor="#FF7A18" />
        </radialGradient>
      </defs>

      {/* 底座（raft） */}
      <ellipse cx="60" cy="82" rx="42" ry="16" fill={b.edge} />
      <ellipse cx="60" cy="79" rx="42" ry="15" fill={b.color} />
      <ellipse cx="60" cy="76" rx="34" ry="11" fill={b.top} />
      {/* 摺葉/邊緣紋理 */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const x = 60 + Math.cos(a) * 40;
        const y = 79 + Math.sin(a) * 14;
        return <circle key={i} cx={x} cy={y} r="2.6" fill={b.edge} opacity="0.85" />;
      })}

      {/* 花環 */}
      {petals.map((_, i) => {
        const a = (i / petals.length) * Math.PI * 2;
        const x = 60 + Math.cos(a) * 33;
        const y = 74 + Math.sin(a) * 10.5;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="4.4" fill={f.color} />
            <circle cx={x} cy={y} r="1.7" fill={f.edge} opacity="0.7" />
          </g>
        );
      })}

      {/* 中心：依款式 */}
      {style === "classic" && (
        <g>
          <rect x="55" y="46" width="10" height="26" rx="3" fill="#FFF3DA" />
          <rect x="55" y="46" width="4" height="26" rx="2" fill="#FFE3AE" />
          <line x1="49" y1="72" x2="49" y2="52" stroke="#8A5A2B" strokeWidth="1.6" />
          <line x1="71" y1="72" x2="71" y2="52" stroke="#8A5A2B" strokeWidth="1.6" />
          <circle cx="49" cy="52" r="1.6" fill="#FF7A18" />
          <circle cx="71" cy="52" r="1.6" fill="#FF7A18" />
          <g className="lk-flame">
            <ellipse cx="60" cy="40" rx="4.2" ry="8.5" fill="url(#flameG)" />
            <ellipse cx="60" cy="42" rx="2" ry="4.2" fill="#FFF6D6" opacity="0.9" />
          </g>
        </g>
      )}

      {style === "dessert" && (
        <g>
          {[
            { x: 52, y: 64, c: "#8BD98B" },
            { x: 60, y: 60, c: "#FF8FB1" },
            { x: 68, y: 64, c: "#FFD24B" },
            { x: 56, y: 57, c: "#B48CFF" },
            { x: 64, y: 57, c: "#FF9E2C" },
          ].map((d, i) => (
            <g key={i}>
              <circle cx={d.x} cy={d.y} r="5.2" fill={d.c} />
              <circle cx={d.x - 1.4} cy={d.y - 1.6} r="1.6" fill="#fff" opacity="0.6" />
            </g>
          ))}
          <line x1="60" y1="57" x2="60" y2="44" stroke="#C9741A" strokeWidth="1.4" />
          <path d="M60 44 L70 47 L60 50 Z" fill="#FF6B6B" />
          <g className="lk-flame" style={{ transformOrigin: "50px 44px" }}>
            <ellipse cx="50" cy="47" rx="3" ry="6" fill="url(#flameG)" />
          </g>
        </g>
      )}

      {style === "gl" && (
        <g>
          <path
            d="M54 60 C54 54 46 54 46 60 C46 65 54 70 54 70 C54 70 62 65 62 60 C62 54 54 54 54 60 Z"
            fill="#FF6FA5"
          />
          <path
            d="M66 60 C66 54 58 54 58 60 C58 65 66 70 66 70 C66 70 74 65 74 60 C74 54 66 54 66 60 Z"
            fill="#7AB8FF"
            opacity="0.92"
          />
          {[
            { x: 46, y: 46, r: 2.4 },
            { x: 74, y: 48, r: 2 },
            { x: 60, y: 42, r: 2.8 },
          ].map((s, i) => (
            <g key={i} className="lk-flame">
              <path
                d={`M${s.x} ${s.y - s.r} L${s.x + s.r * 0.4} ${s.y - s.r * 0.4} L${s.x + s.r} ${s.y} L${s.x + s.r * 0.4} ${s.y + s.r * 0.4} L${s.x} ${s.y + s.r} L${s.x - s.r * 0.4} ${s.y + s.r * 0.4} L${s.x - s.r} ${s.y} L${s.x - s.r * 0.4} ${s.y - s.r * 0.4} Z`}
                fill="#FFE9A8"
              />
            </g>
          ))}
          <rect x="40" y="72" width="40" height="6" rx="3" fill="url(#glow)" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}

/* ============================================================
   夜景背景
   ============================================================ */
function NightScene() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 46,
        s: Math.random() * 1.6 + 0.4,
        d: Math.random() * 4,
      })),
    []
  );
  const lanterns = useMemo(
    () =>
      Array.from({ length: 7 }).map(() => ({
        x: Math.random() * 100,
        dur: 24 + Math.random() * 20,
        delay: -(Math.random() * 30),
        s: 0.6 + Math.random() * 0.8,
      })),
    []
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
      {/* 水面 */}
      <div className="lk-water">
        <div className="lk-moon-reflect" />
        <div className="lk-shimmer" />
        <div className="lk-shimmer lk-shimmer2" />
      </div>
    </div>
  );
}

/* ============================================================
   漂流水燈
   ============================================================ */
function FloatingKrathong({ k, onClick, active }) {
  const px = 62 + k.scale * 70;
  return (
    <button
      className={`lk-float${k.isNew ? " lk-new" : ""}${active ? " lk-active" : ""}`}
      style={{
        top: `${52 + k.lane * 40}%`,
        animationDuration: `${k.duration}s`,
        animationDelay: `${k.delay}s`,
        zIndex: Math.round(k.lane * 100),
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(k);
      }}
      aria-label={`願望水燈：${k.nickname}`}
    >
      <span className="lk-bob" style={{ width: px, opacity: 0.55 + k.lane * 0.45 }}>
        <KrathongSVG flower={k.flower} base={k.base} style={k.style} size={px} />
        <span className="lk-reflect" style={{ width: px * 0.7 }} />
      </span>
    </button>
  );
}

/* ============================================================
   選項按鈕
   ============================================================ */
function Choice({ active, onClick, emoji, label, sub }) {
  return (
    <button className={`lk-choice${active ? " on" : ""}`} onClick={onClick} type="button">
      <span className="lk-choice-emoji">{emoji}</span>
      <span className="lk-choice-label">{label}</span>
      {sub && <span className="lk-choice-sub">{sub}</span>}
    </button>
  );
}

/* ============================================================
   主元件
   ============================================================ */
export default function LoyKrathongApp() {
  const [krathongs, setKrathongs] = useState(() => SEED.map((d, i) => buildKrathong(d, i, SEED.length)));
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState({
    wish: "",
    nickname: "",
    flower: "marigold",
    base: "leaf",
    style: "classic",
  });

  const setField = useCallback((key, val) => setDraft((d) => ({ ...d, [key]: val })), []);

  const release = () => {
    if (!draft.wish.trim()) return;
    const k = { ...buildKrathong(draft, krathongs.length, krathongs.length + 1), isNew: true, lane: 0.34, scale: 1, delay: 0, duration: 44 };
    setKrathongs((prev) => [...prev, k]);
    setBuilderOpen(false);
    setDraft({ wish: "", nickname: "", flower: "marigold", base: "leaf", style: "classic" });
    setSelected(k);
    setTimeout(() => setSelected((s) => (s && s.id === k.id ? null : s)), 4200);
  };

  return (
    <div className="lk-root" onClick={() => setSelected(null)}>
      <style>{CSS}</style>

      <NightScene />

      {/* 標題 */}
      <header className="lk-header">
        <h1>ลอยกระทง</h1>
        <p>水燈節 · 昭披耶河畔的願望</p>
      </header>

      {/* 願望之河 */}
      <div className="lk-river" aria-label="願望之河">
        {krathongs.map((k) => (
          <FloatingKrathong key={k.id} k={k} active={selected?.id === k.id} onClick={setSelected} />
        ))}
      </div>

      {/* 願望卡 */}
      {selected && (
        <div className="lk-popover" onClick={(e) => e.stopPropagation()}>
          <div className="lk-popover-mini">
            <KrathongSVG flower={selected.flower} base={selected.base} style={selected.style} size={72} />
          </div>
          <p className="lk-wish">{selected.wish}</p>
          <p className="lk-nick">— {selected.nickname}</p>
          <button className="lk-close" onClick={() => setSelected(null)} aria-label="關閉">
            ✕
          </button>
        </div>
      )}

      {/* CTA */}
      {!builderOpen && (
        <button
          className="lk-cta"
          onClick={(e) => {
            e.stopPropagation();
            setBuilderOpen(true);
          }}
        >
          ✦ 許下你的願望 · ลอยกระทง ✦
        </button>
      )}

      {/* 許願面板 */}
      {builderOpen && (
        <>
          <div className="lk-scrim" onClick={() => setBuilderOpen(false)} />
          <section className="lk-builder" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="打造你的水燈">
            <div className="lk-builder-head">
              <h2>打造你的水燈</h2>
              <button className="lk-close" onClick={() => setBuilderOpen(false)} aria-label="關閉">
                ✕
              </button>
            </div>

            <div className="lk-preview">
              <KrathongSVG flower={draft.flower} base={draft.base} style={draft.style} size={160} />
            </div>

            <label className="lk-field">
              <span>願望 · คำอธิษฐาน</span>
              <textarea
                value={draft.wish}
                onChange={(e) => setField("wish", e.target.value.slice(0, 100))}
                placeholder="พิมพ์คำอธิษฐานของคุณ…（可用泰文輸入）"
                rows={2}
              />
              <em>{draft.wish.length}/100</em>
            </label>

            <label className="lk-field">
              <span>暱稱 · ชื่อ（選填）</span>
              <input
                value={draft.nickname}
                onChange={(e) => setField("nickname", e.target.value.slice(0, 20))}
                placeholder="匿名 / ผู้ไม่ประสงค์ออกนาม"
              />
            </label>

            <div className="lk-group">
              <span className="lk-group-title">花材 · ดอกไม้</span>
              <div className="lk-choices">
                {Object.entries(FLOWERS).map(([key, v]) => (
                  <Choice key={key} active={draft.flower === key} onClick={() => setField("flower", key)} emoji={v.emoji} label={v.label} sub={v.th} />
                ))}
              </div>
            </div>

            <div className="lk-group">
              <span className="lk-group-title">燈座 · ฐานกระทง</span>
              <div className="lk-choices">
                {Object.entries(BASES).map(([key, v]) => (
                  <Choice key={key} active={draft.base === key} onClick={() => setField("base", key)} emoji={v.emoji} label={v.label} sub={v.th} />
                ))}
              </div>
            </div>

            <div className="lk-group">
              <span className="lk-group-title">款式 · แบบ</span>
              <div className="lk-choices">
                {Object.entries(STYLES).map(([key, v]) => (
                  <Choice key={key} active={draft.style === key} onClick={() => setField("style", key)} emoji={v.emoji} label={v.label} sub={v.th} />
                ))}
              </div>
            </div>

            <button className="lk-release" onClick={release} disabled={!draft.wish.trim()}>
              放水燈 · ปล่อยกระทง
            </button>
          </section>
        </>
      )}
    </div>
  );
}

/* ============================================================
   樣式
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chonburi&family=Charmonman:wght@400;700&family=Sarabun:wght@300;400;600&family=Cormorant:ital,wght@0,500;1,500&display=swap');

.lk-root{position:relative;width:100%;height:100vh;min-height:560px;overflow:hidden;
  font-family:'Sarabun','Noto Sans TC',system-ui,sans-serif;color:#F5E6C8;
  background:#0B1026;user-select:none;-webkit-tap-highlight-color:transparent;}
.lk-root *{box-sizing:border-box;}

/* ---- 場景 ---- */
.lk-scene{position:absolute;inset:0;}
.lk-sky{position:absolute;inset:0;
  background:radial-gradient(120% 80% at 78% 8%, #2B2E63 0%, #171B44 34%, #0B1026 70%);}
.lk-stars span{position:absolute;border-radius:50%;background:#FFF6D6;
  box-shadow:0 0 4px #FFF6D6;animation:twinkle 4s ease-in-out infinite;}
@keyframes twinkle{0%,100%{opacity:.25}50%{opacity:1}}

.lk-moon{position:absolute;top:7%;right:14%;width:96px;height:96px;}
.lk-moon-body{position:absolute;inset:0;border-radius:50%;
  background:radial-gradient(circle at 38% 36%, #FFF8E2 0%, #F3E2B0 55%, #E6CE92 100%);
  box-shadow:0 0 40px 12px rgba(255,238,190,.35);}
.lk-moon-halo{position:absolute;inset:-60px;border-radius:50%;
  background:radial-gradient(circle, rgba(255,231,170,.30) 0%, rgba(255,231,170,0) 62%);}

.lk-khomloi span{position:absolute;bottom:36%;width:9px;height:12px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;
  background:radial-gradient(circle at 50% 70%, #FFD98A 0%, #FF9E3D 60%, rgba(255,158,61,0) 100%);
  box-shadow:0 0 8px #FFB347;animation:rise linear infinite;opacity:0;}
@keyframes rise{0%{transform:translateY(0) scale(.8);opacity:0}
  12%{opacity:.9}88%{opacity:.7}100%{transform:translateY(-70vh) scale(1);opacity:0}}

.lk-temple{position:absolute;left:0;right:0;bottom:40%;width:100%;height:22vh;min-height:120px;
  filter:drop-shadow(0 0 14px rgba(0,0,0,.6));opacity:.96;}

.lk-water{position:absolute;left:0;right:0;bottom:0;height:44%;
  background:linear-gradient(180deg,#16324F 0%,#122A45 40%,#0C1B30 100%);overflow:hidden;}
.lk-water::before{content:"";position:absolute;inset:0;
  background:linear-gradient(180deg, rgba(255,231,170,.10), transparent 30%);}
.lk-moon-reflect{position:absolute;top:0;right:14%;width:70px;height:100%;
  background:linear-gradient(180deg, rgba(255,238,190,.34), rgba(255,238,190,0) 78%);
  filter:blur(3px);animation:sway 6s ease-in-out infinite;}
@keyframes sway{0%,100%{transform:scaleX(1) translateX(0)}50%{transform:scaleX(1.25) translateX(6px)}}
.lk-shimmer{position:absolute;left:-20%;right:-20%;top:22%;height:2px;
  background:linear-gradient(90deg,transparent,rgba(255,231,170,.30),transparent);
  animation:shimmer 9s linear infinite;}
.lk-shimmer2{top:52%;animation-duration:13s;animation-direction:reverse;opacity:.7;}
@keyframes shimmer{0%{transform:translateX(-10%)}100%{transform:translateX(10%)}}

/* ---- 標題 ---- */
.lk-header{position:absolute;top:5%;left:0;right:0;text-align:center;z-index:40;pointer-events:none;}
.lk-header h1{margin:0;font-family:'Chonburi',serif;font-size:clamp(30px,7vw,54px);
  color:#FFE9A8;text-shadow:0 0 24px rgba(255,179,71,.5);letter-spacing:1px;}
.lk-header p{margin:6px 0 0;font-size:clamp(12px,3vw,15px);letter-spacing:3px;color:#E8D6A8;opacity:.85;}

/* ---- 願望之河 ---- */
.lk-river{position:absolute;inset:0;z-index:20;}
.lk-float{position:absolute;left:0;border:none;background:none;padding:0;cursor:pointer;
  animation:drift linear infinite;will-change:transform;}
@keyframes drift{0%{transform:translateX(-18vw)}100%{transform:translateX(118vw)}}
.lk-bob{position:relative;display:block;animation:bob 5s ease-in-out infinite;will-change:transform;}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-7px) rotate(1.5deg)}}
.lk-reflect{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);height:16px;border-radius:50%;
  background:radial-gradient(ellipse, rgba(255,190,100,.5), rgba(255,190,100,0) 70%);filter:blur(2px);}
.lk-float:focus-visible{outline:2px solid #FFE9A8;outline-offset:4px;border-radius:12px;}
.lk-active .lk-bob{filter:drop-shadow(0 0 12px rgba(255,220,150,.9));}
.lk-new{animation:release-in 1.6s ease-out, drift linear infinite 1.6s;}
@keyframes release-in{0%{transform:translateY(60px) scale(.6);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}

/* ---- 願望卡 ---- */
.lk-popover{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;
  width:min(86vw,340px);padding:22px 20px 18px;border-radius:20px;text-align:center;
  background:rgba(22,28,60,.86);backdrop-filter:blur(14px);
  border:1px solid rgba(255,231,170,.28);box-shadow:0 18px 60px rgba(0,0,0,.5);
  animation:pop .3s ease;}
@keyframes pop{from{opacity:0;transform:translate(-50%,-46%) scale(.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.lk-popover-mini{display:flex;justify-content:center;margin-bottom:6px;}
.lk-wish{font-family:'Charmonman',cursive;font-weight:700;font-size:22px;line-height:1.5;
  color:#FFF3D6;margin:4px 0 8px;word-break:break-word;}
.lk-nick{font-size:13px;color:#E8D6A8;opacity:.8;margin:0;}

/* ---- CTA ---- */
.lk-cta{position:absolute;left:50%;bottom:5%;transform:translateX(-50%);z-index:50;
  padding:14px 30px;border:none;border-radius:999px;cursor:pointer;
  font-family:'Sarabun',sans-serif;font-weight:600;font-size:16px;letter-spacing:1px;color:#3A2410;
  background:linear-gradient(180deg,#FFE9A8,#FFC24B);
  box-shadow:0 0 30px rgba(255,190,90,.5),0 8px 24px rgba(0,0,0,.4);
  animation:glow 3s ease-in-out infinite;}
@keyframes glow{0%,100%{box-shadow:0 0 24px rgba(255,190,90,.4),0 8px 24px rgba(0,0,0,.4)}
  50%{box-shadow:0 0 40px rgba(255,190,90,.7),0 8px 24px rgba(0,0,0,.4)}}
.lk-cta:hover{transform:translateX(-50%) translateY(-2px);}

/* ---- 面板 ---- */
.lk-scrim{position:absolute;inset:0;z-index:70;background:rgba(6,9,22,.55);backdrop-filter:blur(2px);}
.lk-builder{position:absolute;left:50%;bottom:0;transform:translateX(-50%);z-index:80;
  width:min(96vw,460px);max-height:92vh;overflow-y:auto;padding:20px 22px 26px;
  border-radius:26px 26px 0 0;background:linear-gradient(180deg,#1B2050,#141838);
  border:1px solid rgba(255,231,170,.2);box-shadow:0 -18px 60px rgba(0,0,0,.55);
  animation:slideup .4s cubic-bezier(.2,.8,.2,1);}
@keyframes slideup{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
.lk-builder-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.lk-builder-head h2{margin:0;font-family:'Chonburi',serif;font-size:22px;color:#FFE9A8;}
.lk-preview{display:flex;justify-content:center;padding:8px 0 14px;}

.lk-field{display:block;margin-bottom:14px;position:relative;}
.lk-field>span{display:block;font-size:13px;letter-spacing:1px;color:#E8D6A8;margin-bottom:6px;}
.lk-field textarea,.lk-field input{width:100%;padding:11px 13px;border-radius:12px;resize:none;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,231,170,.22);color:#FFF3D6;
  font-family:'Sarabun',sans-serif;font-size:15px;}
.lk-field textarea::placeholder,.lk-field input::placeholder{color:rgba(245,230,200,.4);}
.lk-field textarea:focus,.lk-field input:focus{outline:none;border-color:#FFC24B;
  box-shadow:0 0 0 3px rgba(255,194,75,.18);}
.lk-field em{position:absolute;right:2px;bottom:-16px;font-size:11px;color:#E8D6A8;opacity:.55;font-style:normal;}

.lk-group{margin-bottom:14px;}
.lk-group-title{display:block;font-size:13px;letter-spacing:1px;color:#E8D6A8;margin-bottom:8px;}
.lk-choices{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.lk-choice{display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 4px;cursor:pointer;
  border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,231,170,.15);
  color:#F5E6C8;transition:transform .12s,border-color .12s,background .12s;}
.lk-choice-emoji{font-size:20px;line-height:1;}
.lk-choice-label{font-size:12px;font-weight:600;}
.lk-choice-sub{font-size:9px;opacity:.6;}
.lk-choice.on{background:rgba(255,194,75,.16);border-color:#FFC24B;transform:translateY(-2px);
  box-shadow:0 0 16px rgba(255,190,90,.3);}
.lk-choice:focus-visible{outline:2px solid #FFE9A8;outline-offset:2px;}

.lk-release{width:100%;margin-top:8px;padding:15px;border:none;border-radius:16px;cursor:pointer;
  font-family:'Sarabun',sans-serif;font-weight:600;font-size:17px;letter-spacing:1px;color:#3A2410;
  background:linear-gradient(180deg,#FFE9A8,#FFB347);box-shadow:0 8px 24px rgba(255,160,60,.35);}
.lk-release:hover{filter:brightness(1.04);}
.lk-release:disabled{opacity:.45;cursor:not-allowed;filter:grayscale(.4);}

.lk-close{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,231,170,.25);
  background:rgba(255,255,255,.06);color:#F5E6C8;font-size:15px;cursor:pointer;line-height:1;}
.lk-close:hover{background:rgba(255,255,255,.14);}
.lk-popover .lk-close{position:absolute;top:10px;right:10px;width:28px;height:28px;font-size:13px;}

/* ---- 燭火 ---- */
.lk-flame{transform-origin:60px 44px;animation:flicker 1.6s ease-in-out infinite;}
@keyframes flicker{0%,100%{transform:scale(1) translateY(0);opacity:1}
  30%{transform:scale(1.08,.94) translateY(-1px);opacity:.9}
  60%{transform:scale(.94,1.06);opacity:1}}

@media (max-width:380px){.lk-choices{gap:6px}.lk-choice-label{font-size:11px}}

@media (prefers-reduced-motion:reduce){
  .lk-float,.lk-bob,.lk-flame,.lk-shimmer,.lk-moon-reflect,.lk-khomloi span,.lk-stars span,.lk-cta,.lk-new{animation:none !important}
  .lk-float{transform:translateX(40vw);}
  .lk-khomloi{display:none;}
}
`;
