/**
 * N2 — 願望發音服務。
 * 一階段用瀏覽器內建 SpeechSynthesis（零成本、可離線）；
 * 日後換雲端 TTS 時僅替換此檔內部實作，對外介面不變。
 */

export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/** getVoices 在部分瀏覽器為非同步載入，需等 voiceschanged */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const got = window.speechSynthesis.getVoices();
      if (got.length > 0) return resolve(got);
      const timer = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
      window.speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          clearTimeout(timer);
          resolve(window.speechSynthesis.getVoices());
        },
        { once: true },
      );
    });
  }
  return voicesPromise;
}

/** 是否有泰文語音可用；缺 th 語音時明確降級，不得用英文硬念 */
export async function hasVoiceFor(lang: string): Promise<boolean> {
  if (!isSupported()) return false;
  const voices = await loadVoices();
  const prefix = lang.slice(0, 2).toLowerCase();
  return voices.some((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
}

export interface SpeakHandle {
  onend: (cb: () => void) => void;
}

/** 一次只播一則：先取消進行中的朗讀 */
export async function speak(text: string, lang = 'th-TH'): Promise<SpeakHandle> {
  cancel();
  const voices = await loadVoices();
  const prefix = lang.slice(0, 2).toLowerCase();
  const voice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
  if (!voice) throw new Error(`no voice for ${lang}`);

  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = voice;
  utter.lang = voice.lang;
  utter.rate = 0.92;

  const callbacks: (() => void)[] = [];
  const fire = () => callbacks.forEach((cb) => cb());
  utter.onend = fire;
  utter.onerror = fire;

  window.speechSynthesis.speak(utter);
  return { onend: (cb) => callbacks.push(cb) };
}

export function cancel(): void {
  if (isSupported()) window.speechSynthesis.cancel();
}
