interface Props {
  lanternCount?: number | null;
}

/** 標題 + 集體點燈計數（C2）。計數讀取失敗（null）時隱藏而非顯示 0 */
export default function AmbientHeader({ lanternCount }: Props) {
  return (
    <header className="lk-header">
      <h1>ลอยกระทง</h1>
      <p>水燈節 · 昭披耶河畔的願望</p>
      {typeof lanternCount === 'number' && (
        <p className="lk-count" aria-live="polite">
          🏮 今晚已放 <strong>{lanternCount.toLocaleString()}</strong> 盞水燈
        </p>
      )}
    </header>
  );
}
