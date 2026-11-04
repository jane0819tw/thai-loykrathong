import { useCallback, useEffect, useRef, useState } from 'react';
import type { FloatingWish, WishDoc } from '../types';
import { RIVER_LIMIT } from '../config/krathong';
import { getWishService } from '../services/wishService';
import { makeFloatParams, NEW_WISH_PARAMS, toFloating, type FloatParams } from '../utils/floating';

/**
 * 訂閱願望之河 + 漂流參數生成（§6.2）。
 * 每個 wish id 的漂流參數只生成一次並快取，
 * 避免訂閱推送新資料時整條河重新洗牌。
 */
export function useWishes() {
  const [wishes, setWishes] = useState<FloatingWish[]>([]);
  const paramsRef = useRef(new Map<string, FloatParams>());
  const newIdsRef = useRef(new Set<string>());
  // P1：以單調遞增序號輪流分配水道，與訂閱排序無關，確保分佈穩定
  const orderRef = useRef(0);

  useEffect(() => {
    const service = getWishService();
    return service.subscribeWishes(RIVER_LIMIT, (docs: WishDoc[]) => {
      const params = paramsRef.current;
      const floating = docs.map((doc) => {
        let p = params.get(doc.id);
        if (!p) {
          p = newIdsRef.current.has(doc.id) ? NEW_WISH_PARAMS : makeFloatParams(orderRef.current++);
          params.set(doc.id, p);
        }
        return toFloating(doc, p, newIdsRef.current.has(doc.id));
      });
      // 清掉已不在河面的參數快取
      const alive = new Set(docs.map((d) => d.id));
      for (const id of params.keys()) if (!alive.has(id)) params.delete(id);
      setWishes(floating);
    });
  }, []);

  /** 寫入成功後呼叫：讓這盞用固定進場參數 + release-in 動畫（§6.2）。
   *  訂閱推送可能早於此呼叫，故同時回頭修正已在 state 的那盞。 */
  const markAsOwn = useCallback((id: string) => {
    newIdsRef.current.add(id);
    paramsRef.current.set(id, NEW_WISH_PARAMS);
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, ...NEW_WISH_PARAMS, isNew: true } : w)));
  }, []);

  return { wishes, markAsOwn };
}
