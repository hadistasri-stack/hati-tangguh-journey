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

export type QuestKey = "sholat" | "belajar" | "sosial";

export type DailyProgress = {
  day: number;            // hari ke-n dalam 30 hari
  sholat: boolean;        // bukti sajadah disetor
  belajar: boolean;       // timer 30 menit kelar
  sosial: boolean;        // ngobrol 5 menit kelar
  gameUsedMinutes: number;
  panicTaps: number;      // berapa kali pencet Astaghfirullah
};

export type PlayerState = {
  nickname: string;
  avatar: Avatar;
  consent: boolean;
  preTest?: PreTestData;
  treeLevel: number;      // 0-30, naik tiap hari quest komplit
  daily?: DailyProgress;
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
