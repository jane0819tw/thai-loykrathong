import { useEffect, useMemo, useRef, useState } from 'react';
import type { Base, Flower, Style, WishDraft, WishPreset } from '../types';
import { BASES, FLOWERS, isCoupleStyle, NICKNAME_MAX, STYLES, THEME_MAX, WISH_MAX } from '../config/krathong';
import { fillPreset, WISH_PRESETS } from '../config/wishPresets';
import KrathongSVG from './KrathongSVG';

interface ChoiceProps {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  sub?: string;
}

function Choice({ active, onClick, emoji, label, sub }: ChoiceProps) {
  return (
    <button className={`lk-choice${active ? ' on' : ''}`} onClick={onClick} type="button">
      <span className="lk-choice-emoji">{emoji}</span>
      <span className="lk-choice-label">{label}</span>
      {sub && <span className="lk-choice-sub">{sub}</span>}
    </button>
  );
}

/* P3：例句分類（依 category 動態分組；追星應援對應 fandom=true） */
const CATEGORY_TABS: { id: string; label: string; match: (p: WishPreset) => boolean }[] = [
  { id: 'fandom', label: '追星應援', match: (p) => p.fandom === true },
  { id: 'luck', label: '好運', match: (p) => !p.fandom && p.category === 'luck' },
  { id: 'wealth', label: '事業財運', match: (p) => !p.fandom && p.category === 'wealth' },
  { id: 'love', label: '愛情', match: (p) => !p.fandom && p.category === 'love' },
  { id: 'health', label: '健康', match: (p) => !p.fandom && p.category === 'health' },
  { id: 'study', label: '學業', match: (p) => !p.fandom && p.category === 'study' },
  { id: 'travel', label: '旅遊', match: (p) => !p.fandom && p.category === 'travel' },
  { id: 'family', label: '家庭', match: (p) => !p.fandom && p.category === 'family' },
];

interface Props {
  open: boolean;
  draft: WishDraft;
  releasing: boolean;
  error: string | null;
  onChange: <K extends keyof WishDraft>(key: K, value: WishDraft[K]) => void;
  onRelease: () => void;
  onClose: () => void;
}

/**
 * 許願面板 — v1.3 P4 兩步驟精靈：
 * Step 1 選款式（大預覽＋款式縮圖牆）→ Step 2 寫願望（上方固定已選水燈）。
 * draft 由 App 持有，切步驟不遺失。
 */
export default function WishBuilder({ open, draft, releasing, error, onChange, onRelease, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [catTab, setCatTab] = useState<string>('luck');
  const [undoWish, setUndoWish] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  // 開啟時回到 Step 1；GL/BL 款預設展開追星應援分類（P3）
  useEffect(() => {
    if (open) setStep(1);
  }, [open]);
  useEffect(() => {
    if (isCoupleStyle(draft.style)) setCatTab('fandom');
  }, [draft.style]);

  // 切步驟時焦點移至新步驟首個可操作元素（P4 無障礙）
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>('.lk-step-panel [data-autofocus]');
    first?.focus();
    panelRef.current?.scrollTo({ top: 0 });
  }, [step, open]);

  const presets = useMemo(() => {
    const tab = CATEGORY_TABS.find((t) => t.id === catTab) ?? CATEGORY_TABS[1];
    return WISH_PRESETS.filter(tab.match);
  }, [catTab]);

  if (!open) return null;

  const applyPreset = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;
    if (draft.wish.trim()) setUndoWish(draft.wish);
    onChange('wish', fillPreset(preset, draft.theme).slice(0, WISH_MAX));
  };

  const undo = () => {
    if (undoWish === null) return;
    onChange('wish', undoWish);
    setUndoWish(null);
  };

  const canRelease = !!draft.wish.trim() && !!draft.nickname.trim() && !releasing;

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setStep(2);
    if (e.key === 'ArrowLeft') setStep(1);
  };

  return (
    <>
      <div className="lk-scrim" onClick={onClose} />
      <section
        ref={panelRef}
        className="lk-builder"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="打造你的水燈"
      >
        <div className="lk-builder-head">
          <h2>打造你的水燈</h2>
          <button className="lk-close" onClick={onClose} aria-label="關閉">
            ✕
          </button>
        </div>

        {/* P4 步驟頁籤（tablist 語意，左右鍵可切換） */}
        <div className="lk-steps" role="tablist" aria-label="許願步驟">
          <button
            role="tab"
            id="lk-tab-1"
            aria-selected={step === 1}
            aria-controls="lk-panel-1"
            className={`lk-step-tab${step === 1 ? ' on' : ''}`}
            onClick={() => setStep(1)}
            onKeyDown={onTabKey}
            type="button"
          >
            ① 選款式
          </button>
          <button
            role="tab"
            id="lk-tab-2"
            aria-selected={step === 2}
            aria-controls="lk-panel-2"
            className={`lk-step-tab${step === 2 ? ' on' : ''}`}
            onClick={() => setStep(2)}
            onKeyDown={onTabKey}
            type="button"
          >
            ② 寫願望
          </button>
        </div>

        {step === 1 && (
          <div className="lk-step-panel" role="tabpanel" id="lk-panel-1" aria-labelledby="lk-tab-1">
            <div className="lk-preview">
              <KrathongSVG flower={draft.flower} base={draft.base} style={draft.style} size={300} />
            </div>

            <div className="lk-group">
              <span className="lk-group-title">款式 · แบบ（點選預覽外觀）</span>
              <div className="lk-style-wall">
                {(Object.entries(STYLES) as [Style, (typeof STYLES)[Style]][]).map(([key, v], i) => (
                  <button
                    key={key}
                    className={`lk-style-card${draft.style === key ? ' on' : ''}`}
                    onClick={() => onChange('style', key)}
                    type="button"
                    data-autofocus={i === 0 ? '' : undefined}
                  >
                    <KrathongSVG flower={draft.flower} base={draft.base} style={key} size={76} />
                    <span className="lk-choice-label">
                      {v.emoji} {v.label}
                    </span>
                    <span className="lk-choice-sub">{v.th}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lk-group">
              <span className="lk-group-title">花材 · ดอกไม้</span>
              <div className="lk-choices">
                {(Object.entries(FLOWERS) as [Flower, (typeof FLOWERS)[Flower]][]).map(([key, v]) => (
                  <Choice
                    key={key}
                    active={draft.flower === key}
                    onClick={() => onChange('flower', key)}
                    emoji={v.emoji}
                    label={v.label}
                    sub={v.th}
                  />
                ))}
              </div>
            </div>

            <div className="lk-group">
              <span className="lk-group-title">燈座 · ฐานกระทง</span>
              <div className="lk-choices">
                {(Object.entries(BASES) as [Base, (typeof BASES)[Base]][]).map(([key, v]) => (
                  <Choice
                    key={key}
                    active={draft.base === key}
                    onClick={() => onChange('base', key)}
                    emoji={v.emoji}
                    label={v.label}
                    sub={v.th}
                  />
                ))}
              </div>
            </div>

            <button className="lk-release" onClick={() => setStep(2)} type="button">
              下一步：寫願望 →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="lk-step-panel" role="tabpanel" id="lk-panel-2" aria-labelledby="lk-tab-2">
            {/* 上方固定顯示 Step 1 選好的水燈 */}
            <div className="lk-preview lk-preview-sticky">
              <KrathongSVG flower={draft.flower} base={draft.base} style={draft.style} size={170} />
            </div>

            {/* P3 分類例句 */}
            <div className="lk-group">
              <span className="lk-group-title">
                靈感例句 · ไอเดียคำอธิษฐาน
                {undoWish !== null && (
                  <button className="lk-preset-undo" onClick={undo} type="button">
                    復原原本內容
                  </button>
                )}
              </span>
              <div className="lk-cat-tabs" role="group" aria-label="例句分類">
                {CATEGORY_TABS.filter((t) => WISH_PRESETS.some(t.match)).map((t) => (
                  <button
                    key={t.id}
                    className={`lk-cat-tab${catTab === t.id ? ' on' : ''}`}
                    onClick={() => setCatTab(t.id)}
                    type="button"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="lk-presets" role="group" aria-label="許願例句">
                {presets.map((p) => (
                  <button key={p.id} className="lk-preset" onClick={() => applyPreset(p.id)} type="button" title={p.zh}>
                    <span className="lk-preset-th">{p.th}</span>
                    <span className="lk-preset-zh">{p.zh}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="lk-field">
              <span>願望 · คำอธิษฐาน</span>
              <textarea
                data-autofocus=""
                value={draft.wish}
                onChange={(e) => onChange('wish', e.target.value.slice(0, WISH_MAX))}
                placeholder="พิมพ์คำอธิษฐานของคุณ…（可用泰文輸入，或點上方例句）"
                rows={2}
              />
              <em>
                {draft.wish.length}/{WISH_MAX}
              </em>
            </label>

            <label className="lk-field">
              <span>暱稱 · ชื่อ（必填，會顯示在你的水燈上）</span>
              <input
                value={draft.nickname}
                onChange={(e) => onChange('nickname', e.target.value.slice(0, NICKNAME_MAX))}
                placeholder="เช่น แนน / 小水燈"
                required
              />
            </label>

            {isCoupleStyle(draft.style) && (
              <label className="lk-field">
                <span>應援主題 / CP 名（選填）</span>
                <input
                  value={draft.theme}
                  onChange={(e) => onChange('theme', e.target.value.slice(0, THEME_MAX))}
                  placeholder="เช่น FreenBecky / BrightWin…"
                />
              </label>
            )}

            {error && (
              <p className="lk-error" role="alert">
                {error}
              </p>
            )}

            <div className="lk-step-actions">
              <button className="lk-step-back" onClick={() => setStep(1)} type="button">
                ← 上一步
              </button>
              <button className="lk-release" onClick={onRelease} disabled={!canRelease}>
                {releasing ? '水燈放流中…' : '放水燈 · ปล่อยกระทง'}
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
