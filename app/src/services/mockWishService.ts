import type { ReleasePayload, ThemeRank, WishDoc } from '../types';
import { ReleaseError } from '../types';
import { ANONYMOUS_NAME, isCoupleStyle } from '../config/krathong';
import { EVENT_END, EVENT_START } from '../config/event';
import { uid } from '../utils/floating';
import type { WishService } from './wishService';

/* ---------- 種入河面的範例願望（v1.3 P7：總量 15 盞） ---------- */
const SEED: Omit<WishDoc, 'id' | 'createdAt' | 'status'>[] = [
  { wish: 'ขอให้ครอบครัวของเรามีความสุขตลอดไป', nickname: 'แนน', flower: 'marigold', base: 'leaf', style: 'classic' },
  { wish: 'ขอให้สุขภาพแข็งแรงทั้งปี', nickname: 'โอ๊ต', flower: 'lotus', base: 'leaf', style: 'classic' },
  { wish: 'ขอให้เราสองคนได้อยู่ด้วยกันนาน ๆ 💕', nickname: 'มิว & ฟ้า', flower: 'rose', base: 'leaf', style: 'gl', theme: 'MewFah' },
  { wish: 'ขอให้สอบติดมหาลัยที่ฝันไว้', nickname: 'ปลาย', flower: 'orchid', base: 'bread', style: 'classic' },
  { wish: 'ขอให้ขายของดี ร่ำรวยเงินทอง', nickname: 'เจ๊หมวย', flower: 'marigold', base: 'coconut', style: 'dessert' },
  { wish: 'ขอให้ได้เที่ยวรอบโลกสักครั้ง', nickname: 'ต้นน้ำ', flower: 'lotus', base: 'leaf', style: 'classic' },
  { wish: 'ขอให้ซีรีส์วายเรื่องใหม่ปัง ๆ 🌈', nickname: 'ติ่งซีรีส์', flower: 'orchid', base: 'leaf', style: 'gl', theme: 'FreenBecky' },
  { wish: 'ขอให้ทุกความฝันเป็นจริง', nickname: 'ดาว', flower: 'marigold', base: 'leaf', style: 'dessert' },
  { wish: 'ขอให้สองหนุ่มได้เจอกันทุกชาติ 💙', nickname: 'ด้อมฟ้าคราม', flower: 'lotus', base: 'coconut', style: 'bl', theme: 'BrightWin' },
  { wish: 'ขอให้ปีหน้าได้งานใหม่ที่ดีกว่าเดิม', nickname: 'บีม', flower: 'lotus', base: 'coconut', style: 'classic' },
  { wish: 'ขอให้แม่หายป่วยไว ๆ', nickname: 'มายด์', flower: 'marigold', base: 'leaf', style: 'classic' },
  { wish: 'ขอให้ร้านกาแฟของเราไปต่อได้', nickname: 'เฟิร์น', flower: 'lotus', base: 'bread', style: 'dessert' },
  { wish: 'ขอให้เดินทางปลอดภัยตลอดปี', nickname: 'ปอ', flower: 'marigold', base: 'coconut', style: 'classic' },
  { wish: 'ขอให้คู่นี้ได้ออกอัลบั้มด้วยกัน 💙', nickname: 'แฟนคลับ', flower: 'orchid', base: 'leaf', style: 'bl', theme: 'JoongDunk' },
  { wish: 'ขอให้ engfa กับ charlotte มีความสุขมาก ๆ', nickname: 'อิงล็อต', flower: 'orchid', base: 'leaf', style: 'gl', theme: 'EngLot' },
];

/* 模擬「他人此刻放燈」的願望池（B2 展示用） */
const AMBIENT_POOL: Omit<WishDoc, 'id' | 'createdAt' | 'status'>[] = [
  { wish: 'ขอให้ปีหน้าได้งานใหม่ที่ดีกว่าเดิม', nickname: 'บีม', flower: 'lotus', base: 'coconut', style: 'classic' },
  { wish: 'ขอให้แม่หายป่วยไว ๆ', nickname: 'มายด์', flower: 'marigold', base: 'leaf', style: 'classic' },
  { wish: 'ขอให้คู่จิ้นของฉันได้งานคู่กันอีก 🌈', nickname: 'ด้อมเล็ก ๆ', flower: 'rose', base: 'leaf', style: 'gl', theme: 'FreenBecky' },
  { wish: 'ขอให้เก็บเงินซื้อบ้านได้ในปีนี้', nickname: 'กัน', flower: 'orchid', base: 'bread', style: 'classic' },
  { wish: 'ขอให้ร้านกาแฟของเราไปต่อได้', nickname: 'เฟิร์น', flower: 'lotus', base: 'bread', style: 'dessert' },
  { wish: 'ขอให้ engfa กับ charlotte มีความสุขมาก ๆ', nickname: 'อิงล็อต', flower: 'orchid', base: 'leaf', style: 'gl', theme: 'EngLot' },
  { wish: 'ขอให้เดินทางปลอดภัยตลอดปี', nickname: 'ปอ', flower: 'marigold', base: 'coconut', style: 'classic' },
  { wish: 'ขอให้ได้เจอเธออีกครั้งในเทศกาลหน้า', nickname: 'ฝน', flower: 'rose', base: 'leaf', style: 'classic' },
  { wish: 'ขอให้ขนมที่ทำขายหมดทุกวัน', nickname: 'จูน', flower: 'lotus', base: 'leaf', style: 'dessert' },
  { wish: 'ขอให้ MewFah ได้ซีซั่นสอง 💕', nickname: 'ชิปเปอร์', flower: 'rose', base: 'leaf', style: 'gl', theme: 'MewFah' },
  { wish: 'ขอให้พี่จุนโฟกัสมีงานคู่อีกเยอะๆ 💙', nickname: 'ติ่งบีแอล', flower: 'orchid', base: 'coconut', style: 'bl', theme: 'JoongDunk' },
  { wish: 'ขอให้คู่นี้ได้ออกอัลบั้มด้วยกัน', nickname: 'แฟนคลับ', flower: 'marigold', base: 'leaf', style: 'bl', theme: 'BrightWin' },
];

/* §12 敏感字過濾（模擬 Cloud Function；泰/中/英，示意清單） */
const BLOCKED_WORDS = [
  'เหี้ย', 'ควย', 'สัส', 'ไอ้สัตว์',
  '幹你', '媽的', '去死', '白癡',
  'fuck', 'shit', 'bitch', 'asshole',
];

const RATE_LIMIT_PER_MIN = 3; // §10.5

// v1.2 M3：檢舉與自動隱藏已停用；status/visible 訂閱機制保留供管理端下架
type StoredWish = WishDoc;

type Listener<T> = (v: T) => void;

export class MockWishService implements WishService {
  private wishes: StoredWish[] = [];
  private total = 0;
  private wishListeners = new Map<Listener<WishDoc[]>, number>();
  private countListeners = new Set<Listener<number | null>>();
  private themeListeners = new Set<Listener<ThemeRank[]>>();
  private releaseTimestamps: number[] = [];

  constructor() {
    const now = Date.now();
    this.wishes = SEED.map((w, i) => ({
      ...w,
      id: uid(),
      theme: w.theme ?? null,
      createdAt: now - (SEED.length - i) * 60_000,
      status: 'visible',
      blessings: 0,
    }));
    // 模擬今晚累積量，讓計數不是從 8 開始
    this.total = 1200 + Math.floor(Math.random() * 300);
    this.scheduleAmbient();
  }

  /* ---- 模擬他人即時放燈（B2 AC：他人新放 3s 內出現） ---- */
  private scheduleAmbient() {
    setTimeout(() => {
      const pick = AMBIENT_POOL[Math.floor(Math.random() * AMBIENT_POOL.length)];
      this.insert({ ...pick, theme: pick.theme ?? null });
      this.scheduleAmbient();
    }, 35_000 + Math.random() * 30_000); // P1：放慢注入節奏，維持同屏 4–5 盞
  }

  private insert(payload: ReleasePayload): StoredWish {
    const doc: StoredWish = {
      ...payload,
      nickname: payload.nickname.trim() || ANONYMOUS_NAME,
      theme: payload.theme ?? null,
      id: uid(),
      createdAt: Date.now(),
      status: 'visible',
      blessings: 0,
    };
    this.wishes.push(doc);
    this.total += 1;
    this.emitWishes();
    this.emitCount();
    this.emitThemes();
    return doc;
  }

  /* ---- 推送 ---- */
  private visible(limit: number): WishDoc[] {
    return this.wishes
      .filter((w) => w.status === 'visible')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  private emitWishes() {
    this.wishListeners.forEach((limit, cb) => cb(this.visible(limit)));
  }
  private emitCount() {
    this.countListeners.forEach((cb) => cb(this.total));
  }
  private emitThemes() {
    const ranks = this.themeRanks();
    this.themeListeners.forEach((cb) => cb(ranks));
  }

  /** N7：2026 水燈節活動期間累計（不再每週重置）；GL/BL 同榜混排並記錄款式 */
  private themeRanks(): ThemeRank[] {
    const map = new Map<string, { blessings: number; style: 'gl' | 'bl' }>();
    for (const w of this.wishes) {
      if (w.status !== 'visible' || !w.theme || !isCoupleStyle(w.style)) continue;
      if (w.createdAt < EVENT_START || w.createdAt > EVENT_END) continue;
      const entry = map.get(w.theme) ?? { blessings: 0, style: w.style };
      entry.blessings += 1 + (w.blessings ?? 0);
      map.set(w.theme, entry);
    }
    return [...map.entries()]
      .map(([name, v]) => ({ id: name, name, eventBlessings: v.blessings, style: v.style }))
      .sort((a, b) => b.eventBlessings - a.eventBlessings)
      .slice(0, 10);
  }

  /* ---- WishService 介面 ---- */

  subscribeWishes(limit: number, cb: Listener<WishDoc[]>): () => void {
    this.wishListeners.set(cb, limit);
    cb(this.visible(limit));
    return () => this.wishListeners.delete(cb);
  }

  subscribeCount(cb: Listener<number | null>): () => void {
    this.countListeners.add(cb);
    cb(this.total);
    return () => this.countListeners.delete(cb);
  }

  subscribeThemes(cb: Listener<ThemeRank[]>): () => void {
    this.themeListeners.add(cb);
    cb(this.themeRanks());
    return () => this.themeListeners.delete(cb);
  }

  async releaseWish(payload: ReleasePayload): Promise<WishDoc> {
    await delay(300 + Math.random() * 400); // 模擬網路延遲

    // §10.5 速率限制
    const now = Date.now();
    this.releaseTimestamps = this.releaseTimestamps.filter((t) => now - t < 60_000);
    if (this.releaseTimestamps.length >= RATE_LIMIT_PER_MIN) {
      throw new ReleaseError('rate-limit', '今晚水燈放得好快！河面需要一點時間，一分鐘後再放下一盞');
    }

    // §12 敏感字過濾（正式版於 Cloud Function 執行）
    const text = `${payload.wish} ${payload.nickname}`.toLowerCase();
    if (BLOCKED_WORDS.some((w) => text.includes(w.toLowerCase()))) {
      throw new ReleaseError('moderation-pending', '這盞水燈需要先由河神看過，通過後才會漂進河面');
    }

    this.releaseTimestamps.push(now);
    return this.insert(payload);
  }

  async scoopWish(excludeIds: string[]): Promise<WishDoc | null> {
    await delay(250);
    const pool = this.wishes.filter((w) => w.status === 'visible' && !excludeIds.includes(w.id));
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  async blessWish(id: string): Promise<void> {
    await delay(150);
    const w = this.wishes.find((x) => x.id === id);
    if (w) {
      w.blessings = (w.blessings ?? 0) + 1;
      this.emitThemes();
    }
  }

}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
