import { useEffect, useState } from 'react';
import { getWishService } from '../services/wishService';

/** C2 集體點燈計數；讀取失敗回傳 null（介面隱藏而非顯示 0） */
export function useLanternCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const service = getWishService();
    return service.subscribeCount(setCount);
  }, []);

  return count;
}
