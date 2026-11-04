import { useId } from 'react';
import type { Base, Flower, Style } from '../types';
import { BASES, FLOWERS } from '../config/krathong';

interface Props {
  flower?: Flower;
  base?: Base;
  style?: Style;
  size?: number;
}

/* ============================================================
   花材（N4）：四種花各有可辨識的花型，主色相沿用 §6.3
   ============================================================ */

function Marigold({ x, y }: { x: number; y: number }) {
  // 層疊密瓣的圓球狀橘花
  const petals = Array.from({ length: 6 });
  return (
    <g transform={`translate(${x} ${y})`}>
      {petals.map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 3} cy={Math.sin(a) * 3} r="2.3" fill="#FF9E2C" />;
      })}
      <circle r="2.7" fill="#FFB84D" />
      <circle r="1.2" fill="#C9741A" />
    </g>
  );
}

function Lotus({ x, y }: { x: number; y: number }) {
  // 尖瓣層開的粉色蓮瓣
  const petal = 'M0 2 C-2.4 1 -2.1 -2.6 0 -5.2 C2.1 -2.6 2.4 1 0 2 Z';
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={petal} transform="rotate(-52) translate(0 -0.6)" fill="#D65B84" />
      <path d={petal} transform="rotate(52) translate(0 -0.6)" fill="#D65B84" />
      <path d={petal} transform="rotate(-26)" fill="#FF8FB1" />
      <path d={petal} transform="rotate(26)" fill="#FF8FB1" />
      <path d={petal} fill="#FFA9C4" />
      <circle cy="1.6" r="1.1" fill="#D65B84" />
    </g>
  );
}

function Orchid({ x, y }: { x: number; y: number }) {
  // 展開的蝴蝶蘭瓣型（紫）
  return (
    <g transform={`translate(${x} ${y})`}>
      {[-38, 38].map((r) => (
        <ellipse key={r} rx="2.1" ry="3.1" transform={`rotate(${r}) translate(0 -2.5)`} fill="#C88FEA" />
      ))}
      {[-85, 85].map((r) => (
        <ellipse key={r} rx="1.7" ry="2.6" transform={`rotate(${r}) translate(0 -2.4)`} fill="#B978E0" />
      ))}
      <ellipse rx="1.9" ry="2.4" transform="rotate(180) translate(0 -2.3)" fill="#9B5FC4" />
      <circle r="1" fill="#7A3FA8" />
    </g>
  );
}

function Rose({ x, y }: { x: number; y: number }) {
  // 捲心層疊紅玫瑰
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="4" fill="#E8506A" />
      <circle r="2.6" fill="#D63B57" />
      <circle r="1.3" fill="#B22B45" />
      <path d="M-2.9 0 A2.9 2.9 0 0 1 2.9 0" stroke="#B22B45" strokeWidth="0.6" fill="none" opacity="0.8" />
      <path d="M1.7 -0.9 A1.9 1.9 0 0 1 -0.9 1.7" stroke="#8F1F35" strokeWidth="0.5" fill="none" opacity="0.8" />
    </g>
  );
}

const FLOWER_SHAPE: Record<Flower, (p: { x: number; y: number }) => React.JSX.Element> = {
  marigold: Marigold,
  lotus: Lotus,
  orchid: Orchid,
  rose: Rose,
};

/* ============================================================
   雙人物（N6）：水燈女神/男神 — 細節 SVG、非剪影、
   有限色盤（膚色、暖金冠、色盤內服飾色），融入夜景暖光
   ============================================================ */

interface DeityProps {
  cx: number;
  dress: string;
  dressEdge: string;
  drape?: string; // GL 披帛；BL 不披
  male?: boolean;
  goldId: string;
  /** M5：曖昧互動姿態時手臂由外層統一畫「十指相扣」，此處不畫合十 */
  arms?: boolean;
}

/**
 * v1.3 P6 — 泰服人物（非和服）：
 * 女神＝長髮＋合身上衣＋單肩披帛（sabai）＋泰式筒裙（sinh）＋高冠 chada；
 * 男神＝短髮＋金髮箍小尖飾＋立領上衣＋腰帶＋絆尾幔（chong kraben）。
 * 辨識關鍵：斜披帛 / 立領無領 / 金冠尖飾；避免和服寬交領與寬腰帶。
 */
function Deity({ cx, dress, dressEdge, drape, male = false, goldId, arms = true }: DeityProps) {
  const skin = '#F0C79E';
  const hair = '#241A10';
  return (
    <g>
      {!male && (
        // 女神長髮（背層，垂落至肩後）
        <path
          d={`M${cx - 4.7} 43.5 Q${cx - 5.7} 49.5 ${cx - 5} 55.8 L${cx - 2.6} 55 L${cx + 2.6} 55 L${cx + 5} 55.8 Q${cx + 5.7} 49.5 ${cx + 4.7} 43.5 Z`}
          fill={hair}
        />
      )}
      {/* 身軀：合身上衣＋收腰（泰服剪裁，非和服寬袍） */}
      <path
        d={`M${cx - 3.5} 50.8 C${cx - 3.3} 53.6 ${cx - 3} 55.2 ${cx - 3.1} 56.6 C${cx - 4.5} 59.8 ${cx - 5} 62.8 ${cx - 4.8} 65.5 L${cx + 4.8} 65.5 C${cx + 5} 62.8 ${cx + 4.5} 59.8 ${cx + 3.1} 56.6 C${cx + 3} 55.2 ${cx + 3.3} 53.6 ${cx + 3.5} 50.8 Z`}
        fill={dress}
      />
      {/* 下裙底緣 */}
      <path d={`M${cx - 4.85} 63.6 L${cx + 4.85} 63.6 L${cx + 4.8} 65.5 L${cx - 4.8} 65.5 Z`} fill={dressEdge} />
      {male ? (
        <>
          {/* 立領（短立領，非交領） */}
          <path d={`M${cx - 1.6} 50.6 L${cx - 1.6} 51.8 M${cx + 1.6} 50.6 L${cx + 1.6} 51.8`} stroke={`url(#${goldId})`} strokeWidth="0.7" />
          <line x1={cx} y1={51.2} x2={cx} y2={57.8} stroke={dressEdge} strokeWidth="0.6" />
          {/* 金腰帶 + 絆尾幔（chong kraben）中央褶線 */}
          <rect x={cx - 3.9} y={57.9} width="7.8" height="1.6" rx="0.5" fill={`url(#${goldId})`} />
          <line x1={cx} y1={60} x2={cx} y2={64.8} stroke={dressEdge} strokeWidth="0.9" opacity="0.85" />
        </>
      ) : (
        <>
          {/* 單肩披帛（sabai）斜披，另一肩裸露 */}
          <path d={`M${cx - 3.3} 50.7 L${cx - 1} 50.7 L${cx + 3.6} 65.5 L${cx + 0.9} 65.5 Z`} fill={drape} opacity="0.94" />
          <ellipse cx={cx + 2.6} cy={50.9} rx="1.5" ry="1" fill={skin} />
          {/* 金腰鏈 */}
          <rect x={cx - 3.2} y={56.1} width="6.4" height="1" rx="0.5" fill={`url(#${goldId})`} opacity="0.95" />
        </>
      )}
      {/* 合十的手與手臂（曖昧姿態時由外層畫十指相扣） */}
      {arms && (
        <>
          <path d={`M${cx - 3.7} 52.6 Q${cx - 2.6} 55.2 ${cx - 0.9} 56.1`} stroke={skin} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d={`M${cx + 3.7} 52.6 Q${cx + 2.6} 55.2 ${cx + 0.9} 56.1`} stroke={skin} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d={`M${cx} 51.8 L${cx + 1.5} 55.4 L${cx} 58.4 L${cx - 1.5} 55.4 Z`} fill={skin} />
        </>
      )}
      {/* 頸與頭 */}
      <rect x={cx - 1.2} y={48.4} width="2.4" height="2.6" fill={skin} />
      <circle cx={cx} cy={45} r="4.1" fill={skin} />
      {male ? (
        <>
          {/* 男生短髮（覆蓋頭頂，非光頭）＋鬢角 */}
          <path d={`M${cx - 4.15} 45 A4.15 4.15 0 0 1 ${cx + 4.15} 45 L${cx + 3.6} 45.5 Q${cx + 2} 43.9 ${cx} 43.9 Q${cx - 2} 43.9 ${cx - 3.6} 45.5 Z`} fill={hair} />
          <rect x={cx - 4.1} y={44.6} width="0.9" height="2" rx="0.4" fill={hair} />
          <rect x={cx + 3.2} y={44.6} width="0.9" height="2" rx="0.4" fill={hair} />
          {/* 金髮箍＋小尖飾（泰式頭飾，露出頭髮） */}
          <rect x={cx - 3.6} y={42} width="7.2" height="1.1" rx="0.55" fill={`url(#${goldId})`} />
          <path d={`M${cx - 1} 42.2 L${cx} 39.3 L${cx + 1} 42.2 Z`} fill={`url(#${goldId})`} />
          <circle cx={cx} cy={39} r="0.5" fill="#FFE9A8" />
        </>
      ) : (
        <>
          {/* 女神前髮＋垂肩長髮絲 */}
          <path d={`M${cx - 4.1} 44.4 A4.1 4.1 0 0 1 ${cx + 4.1} 44.4 L${cx + 3} 42.6 A3.2 3.2 0 0 0 ${cx - 3} 42.6 Z`} fill={hair} />
          <path d={`M${cx - 4.1} 44 Q${cx - 4.9} 49 ${cx - 4.2} 53.5 L${cx - 3.2} 52.5 Q${cx - 3.7} 48 ${cx - 3.2} 44.6 Z`} fill={hair} />
          <path d={`M${cx + 4.1} 44 Q${cx + 4.9} 49 ${cx + 4.2} 53.5 L${cx + 3.2} 52.5 Q${cx + 3.7} 48 ${cx + 3.2} 44.6 Z`} fill={hair} />
        </>
      )}
      {/* 五官：安詳閉目、眉、唇 */}
      <path d={`M${cx - 2.3} 45.2 Q${cx - 1.5} 46 ${cx - 0.7} 45.2`} stroke="#3A2410" strokeWidth="0.55" fill="none" strokeLinecap="round" />
      <path d={`M${cx + 0.7} 45.2 Q${cx + 1.5} 46 ${cx + 2.3} 45.2`} stroke="#3A2410" strokeWidth="0.55" fill="none" strokeLinecap="round" />
      <path d={`M${cx - 2.4} 44.1 Q${cx - 1.5} 43.5 ${cx - 0.6} 44`} stroke="#3A2410" strokeWidth="0.4" fill="none" opacity="0.85" />
      <path d={`M${cx + 0.6} 44 Q${cx + 1.5} 43.5 ${cx + 2.4} 44.1`} stroke="#3A2410" strokeWidth="0.4" fill="none" opacity="0.85" />
      <path d={`M${cx - 0.9} 47 Q${cx} 47.7 ${cx + 0.9} 47`} stroke="#C46A5A" strokeWidth="0.6" fill="none" strokeLinecap="round" />
      {!male && (
        <>
          {/* 高冠 chada */}
          <rect x={cx - 3.4} y={41} width="6.8" height="1.6" rx="0.6" fill={`url(#${goldId})`} />
          <path
            d={`M${cx - 2.9} 41.2 L${cx - 1.4} 35.8 L${cx - 0.5} 34 L${cx} 32.6 L${cx + 0.5} 34 L${cx + 1.4} 35.8 L${cx + 2.9} 41.2 Z`}
            fill={`url(#${goldId})`}
          />
          <line x1={cx - 1.7} y1={37} x2={cx + 1.7} y2={37} stroke="#B8860B" strokeWidth="0.5" />
          <line x1={cx - 1} y1={35} x2={cx + 1} y2={35} stroke="#B8860B" strokeWidth="0.5" />
          <circle cx={cx} cy={32} r="0.7" fill="#FFE9A8" />
          <circle cx={cx - 4} cy={46.8} r="0.55" fill="#FFD98A" />
          <circle cx={cx + 4} cy={46.8} r="0.55" fill="#FFD98A" />
        </>
      )}
    </g>
  );
}

/** 8 角星芒 */
function Star({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return (
    <g className="lk-flame">
      <path
        d={`M${x} ${y - r} L${x + r * 0.4} ${y - r * 0.4} L${x + r} ${y} L${x + r * 0.4} ${y + r * 0.4} L${x} ${y + r} L${x - r * 0.4} ${y + r * 0.4} L${x - r} ${y} L${x - r * 0.4} ${y - r * 0.4} Z`}
        fill={fill}
      />
    </g>
  );
}

/** 雙心交纏（M5：浮於相扣的手上方，作為姿態視覺焦點） */
function TwinHearts({ left, right, y = 67, s = 0.52 }: { left: string; right: string; y?: number; s?: number }) {
  return (
    <g transform={`translate(60 ${y}) scale(${s}) translate(-60 -62)`}>
      <path d="M54 60 C54 54 46 54 46 60 C46 65 54 70 54 70 C54 70 62 65 62 60 C62 54 54 54 54 60 Z" fill={left} />
      <path d="M66 60 C66 54 58 54 58 60 C58 65 66 70 66 70 C66 70 74 65 74 60 C74 54 66 54 66 60 Z" fill={right} opacity="0.92" />
    </g>
  );
}

/** M5：十指相扣 — 兩人內側手臂伸向中央交握 */
function ClaspedHands({ leftShoulder, rightShoulder, x = 60, y = 57.5 }: {
  leftShoulder: [number, number];
  rightShoulder: [number, number];
  x?: number;
  y?: number;
}) {
  const skin = '#F0C79E';
  return (
    <g>
      <path
        d={`M${leftShoulder[0]} ${leftShoulder[1]} Q${(leftShoulder[0] + x) / 2} ${y - 1.5} ${x - 1.1} ${y}`}
        stroke={skin} strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
      <path
        d={`M${rightShoulder[0]} ${rightShoulder[1]} Q${(rightShoulder[0] + x) / 2} ${y - 1.5} ${x + 1.1} ${y}`}
        stroke={skin} strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
      <ellipse cx={x - 0.8} cy={y + 0.4} rx="1.6" ry="1.9" fill={skin} />
      <ellipse cx={x + 0.8} cy={y + 0.4} rx="1.6" ry="1.9" fill={skin} />
      <line x1={x - 0.6} y1={y - 0.8} x2={x - 0.2} y2={y + 1.4} stroke="#D9A87C" strokeWidth="0.4" />
      <line x1={x + 0.6} y1={y - 0.8} x2={x + 0.2} y2={y + 1.4} stroke="#D9A87C" strokeWidth="0.4" />
    </g>
  );
}

/* ============================================================
   KrathongSVG — 唯一水燈繪製來源（預覽 + 河面 + 分享圖卡共用）。
   任何款式 / 顏色調整只能改這一個元件（§7 關鍵契約）。
   ============================================================ */
export default function KrathongSVG({ flower = 'marigold', base = 'leaf', style = 'classic', size = 120 }: Props) {
  const f = FLOWERS[flower];
  const b = BASES[base];
  const FlowerShape = FLOWER_SHAPE[flower];
  // 同畫面多個實例時漸層 id 不可相撞；useId 可能含非 XML-safe 字元（如 «»），需清掉
  const gid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const glowId = `glow-${gid}`;
  const flameId = `flame-${gid}`;
  const goldId = `gold-${gid}`;
  const candleId = `candle-${gid}`;

  const ringPositions = Array.from({ length: 9 }).map((_, i) => {
    const a = (i / 9) * Math.PI * 2 + 0.35;
    return { x: 60 + Math.cos(a) * 33, y: 74 + Math.sin(a) * 10.5 };
  });

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: 'visible', display: 'block' }}>
      {/* 燭光暈（P5：微降強度讓本體更紮實，發光仍保留） */}
      <ellipse cx="60" cy="58" rx="46" ry="30" fill={`url(#${glowId})`} opacity="0.78" />
      {/* P5：船底落影，增加實體感與水面咬合 */}
      <ellipse cx="60" cy="87" rx="41" ry="8" fill="#050810" opacity="0.38" />
      <defs>
        <radialGradient id={glowId} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#FFB347" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={flameId} cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#FFF6D6" />
          <stop offset="55%" stopColor="#FFC24B" />
          <stop offset="100%" stopColor="#FF7A18" />
        </radialGradient>
        <linearGradient id={goldId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="55%" stopColor="#F0C24B" />
          <stop offset="100%" stopColor="#C9962E" />
        </linearGradient>
        <linearGradient id={candleId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFF7E2" />
          <stop offset="60%" stopColor="#FBEBC4" />
          <stop offset="100%" stopColor="#EACB8F" />
        </linearGradient>
      </defs>

      {/* ---- 燈座（N4：三種材質可辨識） ---- */}
      {base === 'leaf' &&
        Array.from({ length: 14 }).map((_, i) => {
          // 摺葉尖角伸出船緣
          const a = (i / 14) * Math.PI * 2;
          const bx = 60 + Math.cos(a) * 42;
          const by = 79 + Math.sin(a) * 15;
          const tx = 60 + Math.cos(a) * 47;
          const ty = 79 + Math.sin(a) * 17.4;
          const px1 = 60 + Math.cos(a + 0.16) * 41;
          const py1 = 79 + Math.sin(a + 0.16) * 14.6;
          return <path key={i} d={`M${px1} ${py1} L${tx} ${ty} L${bx} ${by} Z`} fill={b.color} />;
        })}
      <ellipse cx="60" cy="82" rx="42" ry="16" fill={b.edge} />
      <ellipse cx="60" cy="79" rx="42" ry="15" fill={b.color} />
      <ellipse cx="60" cy="76" rx="34" ry="11" fill={b.top} />
      {base === 'leaf' && (
        // 蕉葉摺紋
        <g stroke={b.edge} strokeWidth="0.8" opacity="0.4">
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 + 0.2;
            return (
              <line key={i} x1={60 + Math.cos(a) * 10} y1={76 + Math.sin(a) * 3.2} x2={60 + Math.cos(a) * 33} y2={76 + Math.sin(a) * 10.6} />
            );
          })}
        </g>
      )}
      {base === 'coconut' && (
        // 椰殼纖維紋
        <g stroke={b.edge} strokeWidth="1" fill="none" opacity="0.65">
          <path d="M22 78 Q60 90 98 78" />
          <path d="M27 82 Q60 93 93 82" />
          <path d="M34 86 Q60 95 86 86" />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <circle key={i} cx={60 + Math.cos(a) * 41} cy={79 + Math.sin(a) * 14.6} r="1.6" fill={b.edge} stroke="none" />;
          })}
        </g>
      )}
      {base === 'bread' && (
        <g>
          {/* 烘烤斑點與光澤 */}
          <ellipse cx="50" cy="73.5" rx="11" ry="3.6" fill="#F5DCAF" opacity="0.55" />
          {[
            { x: 42, y: 77, r: 1.8 }, { x: 55, y: 79.5, r: 1.4 }, { x: 70, y: 77.5, r: 2 },
            { x: 80, y: 80, r: 1.3 }, { x: 62, y: 74.5, r: 1.2 }, { x: 33, y: 80.5, r: 1.5 },
          ].map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#B5844A" opacity="0.55" />
          ))}
        </g>
      )}

      {/* ---- 花環（N4：花型可辨識） ---- */}
      {ringPositions.map((p, i) => (
        <FlowerShape key={i} x={p.x} y={p.y} />
      ))}
      {/* 花環之間點綴主花色小蕾 */}
      {ringPositions.map((p, i) => {
        const next = ringPositions[(i + 1) % ringPositions.length];
        return <circle key={`bud-${i}`} cx={(p.x + next.x) / 2} cy={(p.y + next.y) / 2} r="1.4" fill={f.edge} opacity="0.8" />;
      })}

      {/* ---- 中心：依款式 ---- */}
      {style === 'classic' && (
        <g>
          {/* P6：三炷香，扇形排列、頂端各帶暖紅香火光點 */}
          <line x1="71" y1="71" x2="65" y2="49" stroke="#8A5A2B" strokeWidth="1.5" />
          <line x1="72" y1="71" x2="72" y2="46" stroke="#8A5A2B" strokeWidth="1.5" />
          <line x1="73" y1="71" x2="79" y2="50" stroke="#8A5A2B" strokeWidth="1.5" />
          <circle cx="65" cy="49" r="1.5" fill="#FF7A18" />
          <circle cx="72" cy="46" r="1.5" fill="#FF7A18" />
          <circle cx="79" cy="50" r="1.5" fill="#FF7A18" />
          <path d="M72 44 Q70.5 41 72 38.5" stroke="#D8CDB8" strokeWidth="0.7" fill="none" opacity="0.35" />
          {/* 蠟燭（漸層 + 燭淚 + 頂面） */}
          <rect x="54" y="43" width="12" height="29" rx="3" fill={`url(#${candleId})`} />
          <path d="M54.6 47 Q53.6 50 54.6 53 L56 51 L55.4 47 Z" fill="#FFF7E2" opacity="0.9" />
          <ellipse cx="60" cy="43" rx="6" ry="2" fill="#FFF3DA" />
          <line x1="60" y1="43" x2="60" y2="39.5" stroke="#6B4A2F" strokeWidth="1" />
          {/* 火焰 */}
          <g className="lk-flame">
            <ellipse cx="60" cy="34.5" rx="5" ry="9.5" fill={`url(#${flameId})`} />
            <ellipse cx="60" cy="37" rx="2.3" ry="4.6" fill="#FFF6D6" opacity="0.92" />
            <ellipse cx="60" cy="41.5" rx="1.7" ry="2" fill="#9FD0FF" opacity="0.5" />
          </g>
        </g>
      )}

      {style === 'dessert' && (
        <g>
          {/* 蕉葉小盤 */}
          <ellipse cx="60" cy="64.5" rx="17" ry="5.5" fill="#3E6B4E" />
          <ellipse cx="60" cy="63.6" rx="15" ry="4.4" fill="#4A7C59" />
          {[
            { x: 51, y: 62.5, c: '#8BD98B' },
            { x: 60, y: 58.5, c: '#FF8FB1' },
            { x: 69, y: 62.5, c: '#FFD24B' },
            { x: 55, y: 55.5, c: '#B48CFF' },
            { x: 65, y: 55.5, c: '#FF9E2C' },
          ].map((d, i) => (
            <g key={i}>
              <circle cx={d.x} cy={d.y} r="5.6" fill={d.c} />
              <circle cx={d.x - 1.6} cy={d.y - 1.8} r="1.8" fill="#fff" opacity="0.6" />
              <circle cx={d.x + 1.2} cy={d.y + 1.4} r="0.7" fill="#00000022" />
            </g>
          ))}
          {/* 小旗 */}
          <line x1="60" y1="55" x2="60" y2="40" stroke="#C9741A" strokeWidth="1.4" />
          <path d="M60 40 L72 43.2 L60 46.5 Z" fill="#FF6B6B" />
          <path d="M60 41.5 L67.5 43.2 L60 45 Z" fill="#FFD24B" />
          <rect x="46.6" y="50" width="2.8" height="9" rx="1.2" fill="#FFF3DA" />
          <g className="lk-flame" style={{ transformOrigin: '48px 48px' }}>
            <ellipse cx="48" cy="46.5" rx="2.6" ry="5" fill={`url(#${flameId})`} />
          </g>
        </g>
      )}

      {style === 'gl' && (
        <g>
          {/* M5：雙水燈女神 — 額頭相抵 + 十指相扣，人物佔比放大（×1.3，以船面為錨） */}
          <g transform="translate(60 66) scale(1.3) translate(-60 -66)">
            <g transform="rotate(6 53.5 66)">
              <Deity cx={53.5} dress="#FF8FB1" dressEdge="#D65B84" drape="#FFD1E0" goldId={goldId} arms={false} />
            </g>
            <g transform="rotate(-6 66.5 66)">
              <Deity cx={66.5} dress="#C88FEA" dressEdge="#9B5FC4" drape="#E7D1F7" goldId={goldId} arms={false} />
            </g>
            <ClaspedHands leftShoulder={[54.9, 52.8]} rightShoulder={[65.1, 52.8]} />
            <TwinHearts left="#FF6FA5" right="#C88FEA" y={52.2} s={0.36} />
          </g>
          <Star x={43} y={24} r={2.2} fill="#FFD9E8" />
          <Star x={77} y={25} r={2} fill="#FFE9A8" />
          <Star x={60} y={16.5} r={2.6} fill="#FFE9A8" />
          <rect x="40" y="70" width="40" height="6" rx="3" fill={`url(#${glowId})`} opacity="0.5" />
        </g>
      )}

      {style === 'bl' && (
        <g>
          {/* M5：雙水燈男神 — 依偎靠肩 + 十指相扣；藍紫/靛青 + 銀白星光（與 GL 區隔） */}
          <g transform="translate(60 66) scale(1.3) translate(-60 -66)">
            <g transform="rotate(3 54 66)">
              <Deity cx={54} dress="#4C7FBF" dressEdge="#2E5A7A" male goldId={goldId} arms={false} />
            </g>
            <g transform="rotate(-15 66 66)">
              <Deity cx={66} dress="#7A6FD0" dressEdge="#5A4FA8" male goldId={goldId} arms={false} />
            </g>
            <ClaspedHands leftShoulder={[55.5, 53]} rightShoulder={[63.4, 54.6]} x={59.8} y={58} />
            <TwinHearts left="#7AB8FF" right="#9B8CFF" y={52.8} s={0.36} />
          </g>
          <Star x={43} y={24} r={2.2} fill="#EAF2FF" />
          <Star x={77} y={25} r={2} fill="#EAF2FF" />
          <Star x={60} y={17} r={2.6} fill="#D6E6FF" />
          <rect x="40" y="70" width="40" height="6" rx="3" fill={`url(#${glowId})`} opacity="0.5" />
        </g>
      )}
    </svg>
  );
}
