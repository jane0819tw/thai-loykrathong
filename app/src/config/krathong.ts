import type { Flower, Base, Style } from '../types';

/* ---------- 客製選項（§6.3 對應表，已定案勿更動語意） ---------- */

export interface FlowerMeta {
  label: string;
  th: string;
  emoji: string;
  color: string;
  edge: string;
}
export interface BaseMeta {
  label: string;
  th: string;
  emoji: string;
  color: string;
  edge: string;
  top: string;
}
export interface StyleMeta {
  label: string;
  th: string;
  emoji: string;
}

export const FLOWERS: Record<Flower, FlowerMeta> = {
  marigold: { label: '萬壽菊', th: 'ดาวเรือง', emoji: '🌼', color: '#FF9E2C', edge: '#C9741A' },
  lotus: { label: '蓮花', th: 'บัว', emoji: '🪷', color: '#FF8FB1', edge: '#D65B84' },
  orchid: { label: '蘭花', th: 'กล้วยไม้', emoji: '🌺', color: '#C88FEA', edge: '#9B5FC4' },
  rose: { label: '玫瑰', th: 'กุหลาบ', emoji: '🌹', color: '#E8506A', edge: '#B22B45' },
};

export const BASES: Record<Base, BaseMeta> = {
  leaf: { label: '香蕉葉', th: 'ใบตอง', emoji: '🍌', color: '#4A7C59', edge: '#2F5A3B', top: '#6FA97C' },
  coconut: { label: '椰子殼', th: 'กะลา', emoji: '🥥', color: '#6B4A2F', edge: '#4A3120', top: '#8A6440' },
  bread: { label: '環保麵包', th: 'ขนมปัง', emoji: '🍞', color: '#D9A86C', edge: '#B5844A', top: '#EBC48C' },
};

export const STYLES: Record<Style, StyleMeta> = {
  classic: { label: '經典', th: 'ดั้งเดิม', emoji: '🕯️' },
  dessert: { label: '泰式甜點', th: 'ขนมไทย', emoji: '🍮' },
  gl: { label: 'GL 明星', th: 'วายหญิง', emoji: '💖' },
  bl: { label: 'BL 明星', th: 'วายชาย', emoji: '💙' },
};

/** GL/BL 判斷：可帶應援主題、中心為雙人物（N3/N6） */
export const isCoupleStyle = (style: Style): style is 'gl' | 'bl' => style === 'gl' || style === 'bl';

export const ANONYMOUS_NAME = 'ผู้ไม่ประสงค์ออกนาม';

export const WISH_MAX = 100;
export const NICKNAME_MAX = 20;
export const THEME_MAX = 30;

/** 河面同時渲染的水燈總量。
 *  v1.3 P1/P7：總量 15，配合 utils/floating 的 5 水道相位排程，
 *  任一瞬間同屏可見約 4–5 盞（MAX_VISIBLE ≈ 5）、彼此不重疊。
 *  Firestore 訂閱上限（§10.2 limit 40）不受此值影響，此為渲染守門。 */
export const RIVER_LIMIT = 15;
