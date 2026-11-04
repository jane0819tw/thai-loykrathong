# ลอยกระทง · 水燈節許願網站

依《水燈節許願網站-開發規格書-交接版》實作。React 19 + Vite + TypeScript。

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產出 dist/
```

## 目前狀態

### v1.3 增補 + CTA 補丁（2026-07-10）

- **P1/P7** 河面重排：seed 總量 15 盞、5 條固定水道相位排程（`utils/floating.ts`），drift 行程拉長為 -150vw→400vw，任一瞬間同屏約 4–5 盞、同水道永不追撞（實測三個時間點均為 5 盞）。深度 scale 綁定水道（遠小近大）。
- **P2** 本人水燈：release-in（含回彈）後自畫面左緣連續起漂（`drift-own`），2 秒內可見；上方浮現金色「✨ 這是你的水燈」標籤 6.5 秒；reduced-motion 靜態呈現。
- **P3** 例句分類 tab（追星應援/好運/事業財運/愛情/健康/學業/旅遊/家庭，依 category 動態分組）；GL/BL 款自動切到追星應援。
- **P4** 許願面板兩步驟精靈（tablist 語意、左右鍵切換、draft 不遺失）：Step 1 大預覽＋款式縮圖牆（用真 KrathongSVG 縮圖），Step 2 上方固定已選水燈＋願望欄位。
- **P5** 本體加深：河面透明度改 0.86–1.0、燭光暈微降、加船底落影；燭火發光與倒影保留。
- **P6** 造型細修：經典款三炷香（扇形＋香火光點）；GL 長髮＋合身泰服＋單肩披帛＋腰鏈；BL 短髮（非光頭）＋金髮箍＋立領＋絆尾幔。去和服感。
- **CTA 補丁** 完成頁改實心暖金按鈕（🏮 把泰國帶回家…＋副文案，入場淡入＋脈動 2 次即停）；常駐入口改左下角暖金膠囊（進站脈動 1 次即停）；reduced-motion 全關動畫。

### v1.2 增補（2026-07-10）

- **M1** 水燈尺寸 ×2（河面 `160+scale*184px`、預覽 340、圖卡 700）；同屏上限依效能守則由 40 下修至 **24**（`config/krathong.ts` 有註記）；水燈改以船身對齊水道線避免出界。
- **M2** 暱稱必填（1–20）：留空不能放燈；河面水燈直接顯示暱稱標籤（隨深度縮放、半透明底、對比 AA）；舊空暱稱 fallback「匿名」。**接 Firestore 時安全規則需補 `nickname.size() >= 1`**。
- **M3** 移除使用者端檢舉與自動隱藏（產品確認的取捨）；敏感字過濾、`status` 欄位與「只訂閱 visible」機制保留，管理端仍可後端下架。
- **M4** 移除水面兩條長橫線（shimmer），層次由 N5 波浪承擔。
- **M5** GL/BL 雙人物放大 ×1.3（約佔水燈可視區 65%）＋曖昧姿態：GL 額頭相抵、BL 依偎靠肩，皆十指相扣、雙心浮於交握的手上方。

### v1.1 增補（2026-07-10）

- **N1** 例句選單：25 句（20 通用 + 5 應援）於 `config/wishPresets.ts`，GL/BL 款時應援組優先；**泰文為草稿，上線前需產品負責人校對**。
- **N2** 泰文朗讀：`services/tts.ts`（Web Speech API 封裝，介面可無痛換雲端 TTS）；缺 th 語音時按鈕停用並友善提示。
- **N3/N6** BL 款 + GL/BL 雙人物：GL 雙水燈女神（高冠、披帛）、BL 雙水燈男神（藍紫、金領腰帶），皆在 `KrathongSVG`。
- **N4** 全款精緻化 + 放大約 30%：四種花材（萬壽菊球花/尖瓣蓮/蝴蝶蘭/捲心玫瑰）、三種燈座（蕉葉摺紋/椰殼纖維/麵包烘斑）一眼可辨。
- **N5** 水面三層波浪（transform 位移、reduced-motion 靜態）。
- **N7** 「2026 水燈節應援榜」：活動期間累計（`config/event.ts`），GL/BL 同榜混排 + 標籤。
- **N8** 泰時刻導流：`config/links.ts` 集中 UTM，header 常駐入口 + 分享卡完成畫面柔性 CTA。

### v1.0

- **Phase A** 完成：單檔 MVP 拆為 §13 建議結構，視覺與互動與原 `LoyKrathong.jsx` 一致。
- **Phase B** 完成介面層：所有讀寫走 `src/services/wishService.ts` 的 `WishService` 介面，
  目前由 `MockWishService` 提供（記憶體內模擬即時訂閱、他人放燈、速率限制 ≤3/分、敏感字審查、檢舉門檻）。
- **Phase C** 完成：C1 分享圖卡（canvas 1080×1920、PNG 下載、Web Share）、C2 集體點燈計數、
  C3 合十默念過場（可跳過、reduced-motion 縮短）、C4 GL 應援榜與主題篩選、C5 撈願望（不重複最近 5 盞）。

## 接上真實 Firestore（待辦）

1. 建立 Firebase 專案，啟用 Firestore 與 App Check。
2. `npm install firebase`，新增 `src/services/firestoreWishService.ts` 實作 `WishService`：
   - `subscribeWishes` → `onSnapshot(query(collection('wishes'), where('status','==','visible'), orderBy('createdAt','desc'), limit(40)))`
   - `subscribeCount` → 訂閱 `counters/global`
   - `releaseWish` → 呼叫 Cloud Function（敏感字審查 + 計數在 onCreate 觸發器）
3. 在 `getWishService()` 依環境變數（`VITE_FIREBASE_*`）切換實作。
4. 部署規格書 §10.4 安全規則與 §12 審查 Cloud Functions。

## 結構

見規格書 §13；`KrathongSVG` 是預覽、河面與分享圖卡唯一的水燈繪製來源（§7 關鍵契約）。
