// Penyimpanan progres pemain dalam sessionStorage (privacy-first, tanpa data identitas)
export type Avatar = "boy-1" | "boy-2" | "girl-1" | "girl-2";

export type EmotionKey = "takut" | "marah" | "sedih" | "bingung" | "tenang";

export type EmotionEntry = {
  emotion: EmotionKey;
  intensity: number; // 1-5
};

export type PreTestData = {
  entries: EmotionEntry[];
  takenAt: string;
};

export type PlayerState = {
  nickname: string;
  avatar: Avatar;
  consent: boolean;
  preTest?: PreTestData;
};

const KEY = "hati-tangguh:player";

export function savePlayer(state: Partial<PlayerState>) {
  if (typeof window === "undefined") return;
  const current = loadPlayer() ?? ({} as PlayerState);
  const next = { ...current, ...state };
  sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function loadPlayer(): PlayerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlayerState) : null;
  } catch {
    return null;
  }
}

export function clearPlayer() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
