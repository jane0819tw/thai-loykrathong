import { useCallback, useEffect, useRef, useState } from 'react';
import type { WishDoc, WishDraft } from './types';
import { ReleaseError } from './types';
import { getWishService } from './services/wishService';
import { isCoupleStyle } from './config/krathong';
import { storeLink } from './config/links';
import { useWishes } from './hooks/useWishes';
import { useLanternCount } from './hooks/useLanternCount';
import NightScene from './components/NightScene';
import AmbientHeader from './components/AmbientHeader';
import RiverOfKrathongs from './components/RiverOfKrathongs';
import WishPopover from './components/WishPopover';
import WishCTA from './components/WishCTA';
import WishBuilder from './components/WishBuilder';
import RitualOverlay from './components/RitualOverlay';
import ShareCard from './components/ShareCard';
import SupportBoard from './components/SupportBoard';
import ScoopWish from './components/ScoopWish';

const EMPTY_DRAFT: WishDraft = {
  wish: '',
  nickname: '',
  flower: 'marigold',
  base: 'leaf',
  style: 'classic',
  theme: '',
};

export default function App() {
  const { wishes, markAsOwn } = useWishes();
  const lanternCount = useLanternCount();

  const [draft, setDraft] = useState<WishDraft>(EMPTY_DRAFT);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [ritualActive, setRitualActive] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);

  const [selected, setSelected] = useState<WishDoc | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [ownTagId, setOwnTagId] = useState<string | null>(null); // P2 提示標籤
  const [shareOffer, setShareOffer] = useState<WishDoc | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [scoopOpen, setScoopOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [themeFilter, setThemeFilter] = useState<string | null>(null);

  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setField = useCallback(
    <K extends keyof WishDraft>(key: K, value: WishDraft[K]) => setDraft((d) => ({ ...d, [key]: value })),
    [],
  );

  /* C3：按「放水燈」先進入合十默念過場，過場結束才寫入（§8.6） */
  const startRelease = () => {
    if (!draft.wish.trim() || !draft.nickname.trim()) return; // M2：暱稱必填
    setReleaseError(null);
    setRitualActive(true);
  };

  const doRelease = async () => {
    setRitualActive(false);
    setReleasing(true);
    try {
      const doc = await getWishService().releaseWish({
        wish: draft.wish.trim(),
        nickname: draft.nickname.trim(),
        flower: draft.flower,
        base: draft.base,
        style: draft.style,
        theme: isCoupleStyle(draft.style) && draft.theme.trim() ? draft.theme.trim() : null,
      });
      markAsOwn(doc.id);
      setBuilderOpen(false);
      setDraft(EMPTY_DRAFT);
      setShareOffer(doc);
      // P2：短暫高光 + 「這是你的水燈」標籤，數秒後融入河流
      setHighlightId(doc.id);
      setOwnTagId(doc.id);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => {
        setHighlightId(null);
        setOwnTagId(null);
      }, 6500);
    } catch (e) {
      setReleaseError(e instanceof ReleaseError ? e.message : '水燈沒能放出去，再試一次');
    } finally {
      setReleasing(false);
    }
  };

  /* Esc 關閉最上層彈窗（無障礙） */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (ritualActive) return; // 過場有自己的跳過鈕
      if (shareOpen) setShareOpen(false);
      else if (scoopOpen) setScoopOpen(false);
      else if (boardOpen) setBoardOpen(false);
      else if (builderOpen) setBuilderOpen(false);
      else setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ritualActive, shareOpen, scoopOpen, boardOpen, builderOpen]);

  const riverWishes = themeFilter ? wishes.filter((w) => w.theme === themeFilter) : wishes;
  const activeId = selected?.id ?? highlightId;

  return (
    <div className="lk-root" onClick={() => setSelected(null)}>
      <NightScene />

      <AmbientHeader lanternCount={lanternCount} />

      {/* v1.3-patch：常駐入口升級為暖金膠囊按鈕（左下角常駐，不遮標題與主操作） */}
      <a
        className="lk-store-pill"
        href={storeLink('header')}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label="逛泰時刻選物（開新分頁）"
      >
        🏮 泰時刻選物
      </a>

      {/* 右上工具：撈願望（C5）、應援榜（C4/N7） */}
      <div className="lk-tools">
        <button
          className="lk-tool"
          onClick={(e) => {
            e.stopPropagation();
            setScoopOpen(true);
          }}
          aria-label="撈一盞願望"
        >
          🫧<span>撈一盞</span>
        </button>
        <button
          className="lk-tool"
          onClick={(e) => {
            e.stopPropagation();
            setBoardOpen(true);
          }}
          aria-label="GL 應援榜"
        >
          🌈<span>應援榜</span>
        </button>
      </div>

      {/* 主題篩選提示（C4） */}
      {themeFilter && (
        <button className="lk-filter-chip" onClick={() => setThemeFilter(null)} type="button">
          只看 #{themeFilter} 的水燈 ✕
        </button>
      )}

      <RiverOfKrathongs wishes={riverWishes} selectedId={activeId ?? null} ownTagId={ownTagId} onSelect={setSelected} />

      {selected && <WishPopover wish={selected} onClose={() => setSelected(null)} />}

      {!builderOpen && <WishCTA onOpen={() => setBuilderOpen(true)} />}

      {/* 放流後的分享入口（C1） */}
      {shareOffer && !shareOpen && !builderOpen && (
        <button
          className="lk-share-offer"
          onClick={(e) => {
            e.stopPropagation();
            setShareOpen(true);
          }}
          type="button"
        >
          ✦ 儲存 / 分享你的許願卡
        </button>
      )}

      <WishBuilder
        open={builderOpen}
        draft={draft}
        releasing={releasing}
        error={releaseError}
        onChange={setField}
        onRelease={startRelease}
        onClose={() => setBuilderOpen(false)}
      />

      {ritualActive && <RitualOverlay onDone={doRelease} />}

      {shareOpen && shareOffer && <ShareCard wish={shareOffer} onClose={() => setShareOpen(false)} />}

      <ScoopWish open={scoopOpen} onClose={() => setScoopOpen(false)} />

      <SupportBoard
        open={boardOpen}
        activeTheme={themeFilter}
        onPick={setThemeFilter}
        onClose={() => setBoardOpen(false)}
      />
    </div>
  );
}
