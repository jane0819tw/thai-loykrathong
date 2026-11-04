import type { ReleasePayload, ThemeRank, WishDoc } from '../types';
import { MockWishService } from './mockWishService';

/**
 * 讀寫封裝介面（§10）。
 * 目前使用 MockWishService 於本機模擬 Firestore 即時行為；
 * 接上 GCP 後改為 FirestoreWishService（onSnapshot / Cloud Functions），
 * 介面刻意貼齊 Firestore 語意：subscribe 回傳 unsubscribe。
 */
export interface WishService {
  /** 河面訂閱：status=='visible' 最新 N 盞，新資料即時推送（§10.2） */
  subscribeWishes(limit: number, cb: (docs: WishDoc[]) => void): () => void;
  /** 集體點燈計數（C2）。讀取失敗時回傳 null（介面隱藏而非顯示 0） */
  subscribeCount(cb: (total: number | null) => void): () => void;
  /** 本週應援榜 Top 10（C4） */
  subscribeThemes(cb: (themes: ThemeRank[]) => void): () => void;
  /** 放水燈：審查 + 速率限制後寫入（§10.3、§12），失敗丟 ReleaseError */
  releaseWish(payload: ReleasePayload): Promise<WishDoc>;
  /** 撈願望：隨機取一盞 visible、排除指定 id（C5） */
  scoopWish(excludeIds: string[]): Promise<WishDoc | null>;
  /** 對撈到的願望送出祝福（僅計數，C5） */
  blessWish(id: string): Promise<void>;
  // v1.2 M3：使用者端檢舉與自動隱藏已移除；
  // 管理端下架走後端（直接改 wishes/{id}.status），訂閱僅取 visible 的規則不變。
}

let instance: WishService | null = null;

export function getWishService(): WishService {
  if (!instance) instance = new MockWishService();
  return instance;
}
