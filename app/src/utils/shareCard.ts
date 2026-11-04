import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import type { WishDoc } from '../types';
import KrathongSVG from '../components/KrathongSVG';

const W = 1080;
const H = 1920;

/**
 * C1 願望許願卡分享圖：前端 canvas 即時生成，不經外部圖床。
 * 水燈圖以 KrathongSVG（唯一繪製來源）序列化後畫入，確保與河面一致。
 */
export async function renderShareCard(wish: WishDoc): Promise<Blob> {
  // 泰文字型需先載入完成，否則 fillText 會用 fallback 字型
  await Promise.all([
    document.fonts.load("700 64px 'Charmonman'"),
    document.fonts.load("400 96px 'Chonburi'"),
    document.fonts.load("400 36px 'Sarabun'"),
  ]).catch(() => undefined);
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  /* ---- 夜空背景 ---- */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1A1F4A');
  sky.addColorStop(0.55, '#0B1026');
  sky.addColorStop(1, '#0C1B30');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  /* 星星 */
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H * 0.45;
    const r = Math.random() * 2.2 + 0.6;
    ctx.fillStyle = `rgba(255,246,214,${0.35 + Math.random() * 0.55})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* 滿月＋月暈 */
  const moonX = W * 0.82;
  const moonY = H * 0.075;
  const halo = ctx.createRadialGradient(moonX, moonY, 40, moonX, moonY, 220);
  halo.addColorStop(0, 'rgba(255,231,170,0.35)');
  halo.addColorStop(1, 'rgba(255,231,170,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(moonX - 220, moonY - 220, 440, 440);
  const moon = ctx.createRadialGradient(moonX - 20, moonY - 20, 10, moonX, moonY, 78);
  moon.addColorStop(0, '#FFF8E2');
  moon.addColorStop(0.6, '#F3E2B0');
  moon.addColorStop(1, '#E6CE92');
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 78, 0, Math.PI * 2);
  ctx.fill();

  /* 水面 */
  const waterTop = H * 0.62;
  const water = ctx.createLinearGradient(0, waterTop, 0, H);
  water.addColorStop(0, '#16324F');
  water.addColorStop(0.4, '#122A45');
  water.addColorStop(1, '#0C1B30');
  ctx.fillStyle = water;
  ctx.fillRect(0, waterTop, W, H - waterTop);

  /* 鄭王廟剪影（簡化） */
  ctx.fillStyle = '#0A0E22';
  ctx.beginPath();
  const tx = W / 2;
  const ty = waterTop;
  ctx.moveTo(tx, ty - 300);
  ctx.lineTo(tx + 34, ty - 130);
  ctx.lineTo(tx + 56, ty);
  ctx.lineTo(tx - 56, ty);
  ctx.lineTo(tx - 34, ty - 130);
  ctx.closePath();
  ctx.fill();
  for (const dx of [-150, 150]) {
    ctx.beginPath();
    ctx.moveTo(tx + dx, ty - 170);
    ctx.lineTo(tx + dx + 36, ty);
    ctx.lineTo(tx + dx - 36, ty);
    ctx.closePath();
    ctx.fill();
  }

  /* 月光倒影柱 */
  const reflect = ctx.createLinearGradient(0, waterTop, 0, H);
  reflect.addColorStop(0, 'rgba(255,238,190,0.30)');
  reflect.addColorStop(0.8, 'rgba(255,238,190,0)');
  ctx.fillStyle = reflect;
  ctx.fillRect(moonX - 45, waterTop, 90, H - waterTop);

  /* ---- 標題 ---- */
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFE9A8';
  ctx.shadowColor = 'rgba(255,179,71,0.55)';
  ctx.shadowBlur = 40;
  ctx.font = "96px 'Chonburi', serif";
  ctx.fillText('ลอยกระทง', W / 2, 260);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#E8D6A8';
  ctx.font = "300 40px 'Sarabun', sans-serif";
  ctx.fillText('水 燈 節 · 昭 披 耶 河 畔 的 願 望', W / 2, 330);

  /* ---- 水燈（SVG → Image；含燭光倒影） ---- */
  const K_SIZE = 700; // M1：圖卡水燈構圖同步再放大
  const svgMarkup = renderToStaticMarkup(
    createElement(KrathongSVG, { flower: wish.flower, base: wish.base, style: wish.style, size: K_SIZE }),
  );
  // JSX 不會輸出 xmlns，但獨立 SVG 文件必須有才能被 <img> 載入
  const img = await loadSvg(svgMarkup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
  const kx = W / 2 - K_SIZE / 2;
  const ky = waterTop - K_SIZE * 0.72;
  ctx.drawImage(img, kx, ky, K_SIZE, K_SIZE);
  const glow = ctx.createRadialGradient(W / 2, waterTop + 60, 10, W / 2, waterTop + 60, 200);
  glow.addColorStop(0, 'rgba(255,190,100,0.45)');
  glow.addColorStop(1, 'rgba(255,190,100,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(W / 2 - 200, waterTop, 400, 160);

  /* ---- 願望文字（Charmonman，自動換行） ---- */
  ctx.fillStyle = '#FFF3D6';
  ctx.font = "700 64px 'Charmonman', cursive";
  const lines = wrapText(ctx, wish.wish, W - 240);
  const startY = waterTop + 300;
  lines.slice(0, 5).forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * 96);
  });

  /* 暱稱 */
  ctx.fillStyle = '#E8D6A8';
  ctx.font = "400 42px 'Sarabun', sans-serif";
  ctx.fillText(`— ${wish.nickname}`, W / 2, startY + Math.min(lines.length, 5) * 96 + 60);

  /* 浮水印 */
  ctx.fillStyle = 'rgba(232,214,168,0.55)';
  ctx.font = "italic 34px 'Cormorant', serif";
  ctx.fillText('Loy Krathong Wishing Web ✦ loykrathong.wish', W / 2, H - 80);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas toBlob failed'))), 'image/png');
  });
}

function loadSvg(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });
}

/** 逐字量測換行（泰文無空格，不能只用 word-break） */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    if (ch === '\n') {
      lines.push(line);
      line = '';
      continue;
    }
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch === ' ' ? '' : ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}
