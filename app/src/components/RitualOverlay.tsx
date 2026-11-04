import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Props {
  onDone: () => void;
}

const RITUAL_MS = 2200;
const RITUAL_MS_REDUCED = 800;

/**
 * C3 合十默念過場：畫面稍暗、燭火聚焦，約 2 秒後自動完成。
 * 可跳過；reduced-motion 時以靜態呈現並縮短時間（§8.6）。
 */
export default function RitualOverlay({ onDone }: Props) {
  const reduced = useReducedMotion();
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const t = setTimeout(finish, reduced ? RITUAL_MS_REDUCED : RITUAL_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`lk-ritual${reduced ? ' lk-ritual-static' : ''}`} role="dialog" aria-label="靜心默念你的願望">
      <div className="lk-ritual-inner">
        <div className="lk-ritual-hands" aria-hidden="true">
          🙏
        </div>
        <div className="lk-ritual-flame" aria-hidden="true" />
        <p>靜心默念你的願望…</p>
        <p className="lk-ritual-th">อธิษฐานในใจ</p>
        <button className="lk-ritual-skip" onClick={finish} type="button" autoFocus>
          跳過 · ข้าม
        </button>
      </div>
    </div>
  );
}
