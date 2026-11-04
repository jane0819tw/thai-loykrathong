import type { FloatingWish } from '../types';
import KrathongSVG from './KrathongSVG';

interface Props {
  wish: FloatingWish;
  active: boolean;
  /** P2：放流後數秒內顯示「這是你的水燈」標籤 */
  showOwnTag?: boolean;
  onClick: (w: FloatingWish) => void;
}

/** 漂流水燈（M2 河面暱稱標籤；P2 本人水燈提示） */
export default function FloatingKrathong({ wish, active, showOwnTag = false, onClick }: Props) {
  // M1：基準尺寸為 v1.1 的兩倍（80+scale*92 → ×2）
  const px = 160 + wish.scale * 184;
  // reduced-motion 靜態水平位置：由 duration（82–126s）映射到 8–80vw
  const staticX = wish.isNew ? 38 : Math.round(8 + Math.min(Math.max((wish.duration - 82) / 44, 0), 1) * 72);
  return (
    <button
      className={`lk-float${wish.isNew ? ' lk-new' : ''}${active ? ' lk-active' : ''}`}
      style={{
        // 放大後以船身對齊水道線，避免大型水燈超出畫面下緣
        top: `calc(${52 + wish.lane * 40}% - ${Math.round(px * 0.5)}px)`,
        // P2：本人水燈 release-in 1.4s 後接 drift-own（自左側立即入場）
        animationDuration: wish.isNew ? `1.4s, ${wish.duration}s` : `${wish.duration}s`,
        animationDelay: wish.isNew ? '0s, 1.4s' : `${wish.delay}s`,
        zIndex: Math.round(wish.lane * 100),
        ['--drift-x' as string]: `${staticX}vw`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(wish);
      }}
      aria-label={`願望水燈：${wish.nickname.trim() || '匿名'}`}
    >
      {/* P5：本體不再半透明（遠景僅極輕微退淡），實體感優先 */}
      <span className="lk-bob" style={{ width: px, opacity: 0.86 + wish.lane * 0.14 }}>
        {showOwnTag && <span className="lk-own-tag">✨ 這是你的水燈</span>}
        <KrathongSVG flower={wish.flower} base={wish.base} style={wish.style} size={px} />
        <span className="lk-reflect" style={{ width: px * 0.7 }} />
        <span className="lk-name" style={{ fontSize: Math.round(10 + wish.scale * 7), maxWidth: px }}>
          {wish.nickname.trim() || '匿名'}
        </span>
      </span>
    </button>
  );
}
