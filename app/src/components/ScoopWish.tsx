import { useEffect, useRef, useState } from 'react';
import type { WishDoc } from '../types';
import { getWishService } from '../services/wishService';
import KrathongSVG from './KrathongSVG';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** C5 撈願望：隨機撈一盞他人水燈，可回應一次祝福；連續撈不重複最近 5 盞 */
export default function ScoopWish({ open, onClose }: Props) {
  const [wish, setWish] = useState<WishDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [blessed, setBlessed] = useState(false);
  const recentRef = useRef<string[]>([]);

  const scoop = async () => {
    setLoading(true);
    setBlessed(false);
    try {
      const w = await getWishService().scoopWish(recentRef.current);
      if (w) {
        recentRef.current = [...recentRef.current, w.id].slice(-5);
      }
      setWish(w);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void scoop();
    else setWish(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const bless = async () => {
    if (!wish || blessed) return;
    setBlessed(true);
    try {
      await getWishService().blessWish(wish.id);
    } catch {
      setBlessed(false);
    }
  };

  return (
    <>
      <div className="lk-scrim" onClick={onClose} />
      <section className="lk-scoop" role="dialog" aria-label="撈一盞願望" onClick={(e) => e.stopPropagation()}>
        <div className="lk-builder-head">
          <h2>撈一盞願望 🫧</h2>
          <button className="lk-close" onClick={onClose} aria-label="關閉">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="lk-share-loading">正在河裡輕輕撈…</p>
        ) : wish ? (
          <div className="lk-scoop-card">
            <KrathongSVG flower={wish.flower} base={wish.base} style={wish.style} size={165} />
            <p className="lk-wish">{wish.wish}</p>
            <p className="lk-nick">— {wish.nickname}</p>
            <button className="lk-release" onClick={bless} disabled={blessed}>
              {blessed ? '祝福已送達 ✨' : '已收到你的祝福 🙏'}
            </button>
          </div>
        ) : (
          <p className="lk-board-empty">河面暫時撈不到別的水燈，等等再來</p>
        )}

        <button className="lk-scoop-again" onClick={scoop} disabled={loading} type="button">
          再撈一盞 · ตักอีกใบ
        </button>
      </section>
    </>
  );
}
