import { useEffect, useState } from 'react';
import type { WishDoc } from '../types';
import * as tts from '../services/tts';
import KrathongSVG from './KrathongSVG';

interface Props {
  wish: WishDoc | null;
  onClose: () => void;
}

type TtsState = 'checking' | 'ready' | 'unavailable';

/**
 * 願望卡（含泰文朗讀 N2）。
 * v1.2 M3：使用者端檢舉入口已依產品決策移除；
 * 敏感字過濾與管理端下架（status 欄位 + 只訂閱 visible）維持不動。
 */
export default function WishPopover({ wish, onClose }: Props) {
  const [ttsState, setTtsState] = useState<TtsState>('checking');
  const [speaking, setSpeaking] = useState(false);

  // 缺 th 語音時明確降級（不得用英文硬念）
  useEffect(() => {
    let alive = true;
    tts
      .hasVoiceFor('th-TH')
      .then((ok) => alive && setTtsState(ok ? 'ready' : 'unavailable'))
      .catch(() => alive && setTtsState('unavailable'));
    return () => {
      alive = false;
    };
  }, []);

  // 切換 / 關閉卡片時自動停止朗讀
  useEffect(() => {
    setSpeaking(false);
    return () => tts.cancel();
  }, [wish?.id]);

  if (!wish) return null;

  const toggleSpeak = async () => {
    if (speaking) {
      tts.cancel();
      setSpeaking(false);
      return;
    }
    try {
      setSpeaking(true);
      const handle = await tts.speak(wish.wish, 'th-TH');
      handle.onend(() => setSpeaking(false));
    } catch {
      setSpeaking(false);
      setTtsState('unavailable');
    }
  };

  return (
    <div className="lk-popover" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="願望卡">
      <div className="lk-popover-mini">
        <KrathongSVG flower={wish.flower} base={wish.base} style={wish.style} size={110} />
      </div>
      <p className="lk-wish">{wish.wish}</p>
      <p className="lk-nick">
        — {wish.nickname.trim() || '匿名'}
        {wish.theme ? <span className="lk-theme-tag">#{wish.theme}</span> : null}
      </p>
      <div className="lk-popover-actions">
        <button
          className="lk-speak"
          onClick={toggleSpeak}
          disabled={ttsState !== 'ready'}
          title={ttsState === 'unavailable' ? '此裝置暫不支援泰文朗讀' : undefined}
          type="button"
        >
          {speaking ? '⏸ 停止' : '🔊 唸出願望'}
        </button>
      </div>
      {ttsState === 'unavailable' && <p className="lk-tts-note">此裝置暫不支援泰文朗讀</p>}
      <button className="lk-close" onClick={onClose} aria-label="關閉">
        ✕
      </button>
    </div>
  );
}
