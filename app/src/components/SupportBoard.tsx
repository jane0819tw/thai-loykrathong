import { useEffect, useState } from 'react';
import type { ThemeRank } from '../types';
import { EVENT_NAME } from '../config/event';
import { getWishService } from '../services/wishService';

interface Props {
  open: boolean;
  activeTheme: string | null;
  onPick: (theme: string | null) => void;
  onClose: () => void;
}

/** N7 — 2026 水燈節應援榜：活動期間累計、GL/BL 同榜混排＋標籤、點榜篩河面 */
export default function SupportBoard({ open, activeTheme, onPick, onClose }: Props) {
  const [rankings, setRankings] = useState<ThemeRank[]>([]);

  useEffect(() => {
    if (!open) return;
    return getWishService().subscribeThemes(setRankings);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="lk-scrim" onClick={onClose} />
      <section className="lk-board" role="dialog" aria-label={EVENT_NAME} onClick={(e) => e.stopPropagation()}>
        <div className="lk-builder-head">
          <h2>{EVENT_NAME} 🏮</h2>
          <button className="lk-close" onClick={onClose} aria-label="關閉">
            ✕
          </button>
        </div>

        {rankings.length === 0 ? (
          <p className="lk-board-empty">還沒有主題上榜——放一盞 GL / BL 水燈，為你的 CP 開路 💖</p>
        ) : (
          <ol className="lk-board-list">
            {rankings.map((r, i) => (
              <li key={r.id}>
                <button
                  className={`lk-board-item${activeTheme === r.name ? ' on' : ''}`}
                  onClick={() => {
                    onPick(activeTheme === r.name ? null : r.name);
                    onClose();
                  }}
                  type="button"
                >
                  <span className="lk-board-rank">{i + 1}</span>
                  <span className={`lk-board-style lk-board-style-${r.style}`}>{r.style.toUpperCase()}</span>
                  <span className="lk-board-name">#{r.name}</span>
                  <span className="lk-board-score">{r.eventBlessings} 祝福</span>
                </button>
              </li>
            ))}
          </ol>
        )}
        {activeTheme && (
          <button
            className="lk-board-clear"
            onClick={() => {
              onPick(null);
              onClose();
            }}
            type="button"
          >
            清除篩選，看整條河
          </button>
        )}
      </section>
    </>
  );
}
