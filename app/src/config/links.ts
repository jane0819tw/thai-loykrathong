/** N8 — 泰時刻商店導流連結（UTM 集中組裝，勿各處硬寫） */

const STORE_BASE = 'https://thaiskr.com/store';
const UTM = 'utm_source=loykrathong&utm_medium=web&utm_campaign=loykrathong2026';

export type StoreTouchpoint = 'header' | 'post_release';

export const storeLink = (content: StoreTouchpoint): string => `${STORE_BASE}?${UTM}&utm_content=${content}`;
