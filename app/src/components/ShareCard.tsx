import { useEffect, useRef, useState } from 'react';
import type { WishDoc } from '../types';
import { storeLink } from '../config/links';
import { renderShareCard } from '../utils/shareCard';

interface Props {
  wish: WishDoc;
  onClose: () => void;
}

/** C1 願望許願卡分享圖：預覽 + 下載 PNG + Web Share */
export default function ShareCard({ wish, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    renderShareCard(wish)
      .then((blob) => {
        if (cancelled) return;
        blobRef.current = blob;
        revoke = URL.createObjectURL(blob);
        setUrl(revoke);
      })
      .catch((err) => {
        console.error('share card render failed:', err);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [wish]);

  const download = () => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `loy-krathong-${wish.id}.png`;
    a.click();
  };

  const canShare =
    typeof navigator !== 'undefined' &&
    !!navigator.canShare &&
    !!blobRef.current &&
    navigator.canShare({ files: [new File([blobRef.current], 'krathong.png', { type: 'image/png' })] });

  const share = async () => {
    if (!blobRef.current) return;
    const file = new File([blobRef.current], `loy-krathong-${wish.id}.png`, { type: 'image/png' });
    try {
      await navigator.share({ files: [file], title: 'ลอยกระทง', text: '我在昭披耶河放了一盞水燈 🏮' });
    } catch {
      // 使用者取消分享，不需處理
    }
  };

  return (
    <>
      <div className="lk-scrim" onClick={onClose} />
      <section className="lk-sharecard" role="dialog" aria-label="分享你的水燈" onClick={(e) => e.stopPropagation()}>
        <div className="lk-builder-head">
          <h2>你的水燈已放流 ✦</h2>
          <button className="lk-close" onClick={onClose} aria-label="關閉">
            ✕
          </button>
        </div>

        {failed ? (
          <p className="lk-error">圖卡沒能生成，關掉再放一次試試</p>
        ) : url ? (
          <img className="lk-share-preview" src={url} alt="願望許願卡預覽" />
        ) : (
          <p className="lk-share-loading">正在為你繪製許願卡…</p>
        )}

        <div className="lk-share-actions">
          <button className="lk-release" onClick={download} disabled={!url}>
            儲存圖卡 · PNG
          </button>
          {canShare && (
            <button className="lk-release lk-share-btn" onClick={share}>
              分享 · แชร์
            </button>
          )}
        </div>

        {/* v1.3-patch：完成畫面 CTA 升級為實心按鈕＋圖示＋更明確文案（post_release 觸點） */}
        <a className="lk-store-btn" href={storeLink('post_release')} target="_blank" rel="noopener noreferrer">
          <span className="lk-store-btn-main">🏮 把泰國帶回家 · 逛逛泰時刻選物 →</span>
          <span className="lk-store-btn-sub">泰語學習 × 泰國選物</span>
        </a>
      </section>
    </>
  );
}
