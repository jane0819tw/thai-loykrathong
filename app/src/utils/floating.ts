import type { FloatingWish, WishDoc } from '../types';

export const uid = (): string => Math.random().toString(36).slice(2, 9);

export interface FloatParams {
  lane: number;
  scale: number;
  duration: number;
  delay: number;
}

/**
 * v1.3 P1 — 同屏約 4–5 盞、不重疊的排程設計：
 * - 5 條固定水道，水燈依序輪流分配（垂直分層，深度 scale 綁定水道：遠小近大）。
 * - drift 行程拉長為 -150vw → 400vw（550vw）：可視區約佔週期 1/3，
 *   總量 15 盞 × 1/3 ≈ 同屏 4–5 盞（MAX_VISIBLE ≈ 5）。
 * - 同水道 3 盞共用同一 duration、相位各差 1/3 週期 → 同水道永不追撞；
 *   各水道 duration 不同（遠慢近快）且相位錯開 → 一盞接一盞漂過。
 */
const LANES = [0.1, 0.28, 0.46, 0.64, 0.82];
const LANE_DURATION = [126, 112, 100, 90, 82]; // 秒；遠景慢、近景快
const SLOTS_PER_LANE = 3;

export function makeFloatParams(orderIndex: number): FloatParams {
  const laneIdx = orderIndex % LANES.length;
  const slot = Math.floor(orderIndex / LANES.length) % SLOTS_PER_LANE;
  const duration = LANE_DURATION[laneIdx];
  const phase = (slot / SLOTS_PER_LANE + laneIdx * 0.13) % 1;
  return {
    lane: LANES[laneIdx] + (Math.random() * 0.04 - 0.02),
    scale: 0.5 + LANES[laneIdx] * 0.55 + Math.random() * 0.05,
    duration,
    delay: -phase * duration,
  };
}

/** P2 — 新放水燈：立即從畫面左側入場（drift-own 起點 -90vw），不排隊 */
export const NEW_WISH_PARAMS: FloatParams = {
  lane: 0.34,
  scale: 1,
  duration: 80,
  delay: 0,
};

export function toFloating(doc: WishDoc, params: FloatParams, isNew = false): FloatingWish {
  return { ...doc, ...params, isNew };
}
