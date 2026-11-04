export type Flower = 'marigold' | 'lotus' | 'orchid' | 'rose';
export type Base = 'leaf' | 'coconut' | 'bread';
export type Style = 'classic' | 'dessert' | 'gl' | 'bl';

export type WishStatus = 'visible' | 'pending' | 'hidden';

/** 寫入 Firestore 的願望文件 */
export interface WishDoc {
  id: string;
  wish: string; // 願望文字（1–100 字，審查後）
  nickname: string; // 暱稱（v1.2 M2：1–20 字必填；舊空值顯示「匿名」）
  flower: Flower;
  base: Base;
  style: Style;
  theme?: string | null; // GL 應援主題 / CP 名（C4）
  createdAt: number; // server timestamp (ms)
  status: WishStatus; // 審查狀態（§12）
  blessings?: number; // 撈願望收到的祝福數（C5）
}

/** 前端渲染用（含漂流參數，不寫入 DB） */
export interface FloatingWish extends WishDoc {
  lane: number; // 0..1 垂直水道（越大越近前景）
  scale: number; // 深度縮放
  duration: number; // 漂流一輪秒數
  delay: number; // 動畫延遲
  isNew?: boolean; // 本次使用者剛放
}

/** 許願面板草稿 */
export interface WishDraft {
  wish: string;
  nickname: string;
  flower: Flower;
  base: Base;
  style: Style;
  theme: string;
}

/** C4/N7 應援榜項目（2026 水燈節活動期間累計） */
export interface ThemeRank {
  id: string;
  name: string;
  eventBlessings: number;
  style: 'gl' | 'bl'; // N7 榜單標籤
}

/** N1 許願預設例句 */
export interface WishPreset {
  id: string;
  th: string; // 泰文願望（可含 {CP} 佔位）
  zh: string; // 中文對照
  category?: 'health' | 'wealth' | 'love' | 'travel' | 'study' | 'luck' | 'family';
  fandom?: boolean; // true = 追星應援組，GL/BL 款時優先顯示
}

/** 放水燈的寫入內容 */
export interface ReleasePayload {
  wish: string;
  nickname: string;
  flower: Flower;
  base: Base;
  style: Style;
  theme?: string | null;
}

export type ReleaseErrorCode = 'rate-limit' | 'moderation-pending' | 'write-failed';

export class ReleaseError extends Error {
  code: ReleaseErrorCode;
  constructor(code: ReleaseErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
