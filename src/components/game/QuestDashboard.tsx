import { useEffect, useMemo, useState } from "react";
import { AvatarIcon } from "./AvatarIcon";
import { PohonIman } from "./PohonIman";
import { TemanHati } from "./TemanHati";
import { savePlayer, type Avatar, type DailyProgress } from "@/lib/game-state";
import { BookOpen, Camera, Check, Gamepad2, Lock, MessagesSquare, Moon, Timer } from "lucide-react";

type Props = {
  nickname: string;
  avatar: Avatar;
  treeLevel: number;
  onMuhasabah: () => void;
};

// Tahap inti: Quest Dashboard Harian — 3 quest + pohon iman + unlock game
export function QuestDashboard({ nickname, avatar, treeLevel, onMuhasabah }: Props) {
  const [daily, setDaily] = useState<DailyProgress>({
    day: 1,
    sholat: false,
    belajar: false,
    sosial: false,
    gameUsedMinutes: 0,
    panicTaps: 0,
  });
  const [studyActive, setStudyActive] = useState(false);
  const [studySeconds, setStudySeconds] = useState(30 * 60);
  const [gameActive, setGameActive] = useState(false);
  const [gameSeconds, setGameSeconds] = useState(60 * 60);

  const completed = useMemo(
    () => [daily.sholat, daily.belajar, daily.sosial].filter(Boolean).length,
    [daily],
  );
  const allClear = completed === 3;

  // Timer belajar (anti-curangi simulasi: pause kalau tab hidden)
  useEffect(() => {
    if (!studyActive) return;
    const id = setInterval(() => {
      if (document.hidden) {
        setStudyActive(false);
        setStudySeconds(30 * 60);
        alert("Timer di-reset — terdeteksi pindah aplikasi. Yuk fokus lagi 🌱");
        return;
      }
      setStudySeconds((s) => {
        if (s <= 1) {
          setStudyActive(false);
          markQuest("belajar", true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [studyActive]);

  // Timer game (countdown)
  useEffect(() => {
    if (!gameActive) return;
    const id = setInterval(() => {
      setGameSeconds((s) => {
        if (s <= 1) {
          setGameActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameActive]);

  function markQuest(k: "sholat" | "belajar" | "sosial", val: boolean) {
    setDaily((d) => {
      const next = { ...d, [k]: val };
      savePlayer({ daily: next });
      return next;
    });
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  return (
    <div className="min-h-screen bg-sunset p-4 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-card rounded-3xl shadow-soft p-5 flex items-center gap-4 animate-fade-up">
          <AvatarIcon avatar={avatar} size={56} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Hari ke-{daily.day} dari 30</p>
            <p className="text-lg font-extrabold text-foreground truncate">Assalamualaikum, {nickname}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Quest hari ini</p>
            <p className="text-sm font-bold text-primary">{completed} / 3 clear</p>
          </div>
        </div>

        {/* Pohon Iman */}
        <div className="bg-card/85 backdrop-blur rounded-3xl shadow-card p-5 flex flex-col sm:flex-row items-center gap-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <PohonIman level={treeLevel + completed} size={150} className="shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pohon Iman</p>
            <p className="text-xl font-extrabold text-foreground">Level {treeLevel + completed} / 30</p>
            <p className="mt-1 text-sm text-foreground/75 leading-relaxed">
              "Hatimu butuh disiram pelan-pelan. Pohonnya tumbuh kalau kamu rawat — bukan dipaksa." 🌱
            </p>
          </div>
        </div>

        {/* 3 Quest Cards */}
        <div className="grid sm:grid-cols-3 gap-3">
          {/* Quest 1: Sholat */}
          <QuestCard
            icon={<Camera className="h-5 w-5" />}
            badge="🕌"
            title="Sholat tepat waktu"
            sub="Setor foto sajadah"
            done={daily.sholat}
            onToggle={() => markQuest("sholat", !daily.sholat)}
            ctaDone="Bukti tersimpan ✓"
            ctaTodo="📷 Setor Bukti"
            delay={0.15}
          />

          {/* Quest 2: Belajar */}
          <div
            className={`rounded-3xl p-5 transition-gentle animate-fade-up ${
              daily.belajar ? "bg-safe/30 border-2 border-safe" : "bg-card shadow-soft"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">📖</span>
              {daily.belajar && <Check className="h-5 w-5 text-safe" />}
            </div>
            <h3 className="mt-2 font-extrabold text-foreground">Belajar 30 menit</h3>
            <p className="text-xs text-muted-foreground mb-3">Timer anti-curangi</p>
            {daily.belajar ? (
              <p className="text-sm font-bold text-safe">Selesai ✓</p>
            ) : studyActive ? (
              <div className="rounded-2xl bg-foreground text-background p-3 text-center">
                <Timer className="h-4 w-4 mx-auto opacity-70" />
                <p className="text-2xl font-extrabold tabular-nums">{fmt(studySeconds)}</p>
                <p className="text-xs opacity-70">Jangan pindah app</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStudySeconds(30 * 60);
                  setStudyActive(true);
                }}
                className="w-full rounded-2xl bg-accent px-3 py-2.5 text-sm font-bold text-accent-foreground transition-gentle hover:opacity-90 inline-flex items-center justify-center gap-1.5"
              >
                <BookOpen className="h-4 w-4" /> Mulai Timer
              </button>
            )}
          </div>

          {/* Quest 3: Sosial */}
          <QuestCard
            icon={<MessagesSquare className="h-5 w-5" />}
            badge="🗣️"
            title="Ngobrol 5 menit"
            sub="Puji 1 orang di rumah"
            done={daily.sosial}
            onToggle={() => markQuest("sosial", !daily.sosial)}
            ctaDone="Selesai ✓"
            ctaTodo="✅ Sudah Ngobrol"
            delay={0.25}
          />
        </div>

        {/* Unlock Game Time */}
        <div
          className={`rounded-3xl p-5 animate-fade-up ${
            allClear ? "bg-gradient-to-r from-primary/90 to-secondary shadow-glow" : "bg-card shadow-card"
          }`}
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl p-3 ${allClear ? "bg-background/20" : "bg-muted"}`}>
              {allClear ? (
                <Gamepad2 className={`h-6 w-6 ${allClear ? "text-primary-foreground" : "text-muted-foreground"}`} />
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-xs uppercase tracking-wider ${allClear ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                Jatah Game Hari Ini
              </p>
              <p className={`text-xl font-extrabold ${allClear ? "text-primary-foreground" : "text-foreground"}`}>
                {allClear ? `${fmt(gameSeconds)} tersisa` : "Terkunci — selesaikan 3 quest dulu"}
              </p>
            </div>
            {allClear && !gameActive && gameSeconds > 0 && (
              <button
                type="button"
                onClick={() => setGameActive(true)}
                className="rounded-2xl bg-background px-5 py-3 text-sm font-bold text-foreground shadow-soft transition-gentle hover:scale-105"
              >
                🎮 Main
              </button>
            )}
            {gameActive && (
              <button
                type="button"
                onClick={() => setGameActive(false)}
                className="rounded-2xl bg-background/90 px-5 py-3 text-sm font-bold text-foreground transition-gentle"
              >
                ⏸ Jeda
              </button>
            )}
          </div>
          {allClear && (
            <p className="mt-3 text-xs text-primary-foreground/80">
              Kalau di tengah main kamu ngerasa nagih banget — pencet tombol <b>Astaghfirullah</b> di pojok kanan atas.
            </p>
          )}
        </div>

        {/* Muhasabah Malam */}
        <button
          type="button"
          onClick={onMuhasabah}
          className="w-full rounded-3xl bg-foreground/90 text-background p-5 flex items-center gap-4 animate-fade-up transition-gentle hover:scale-[1.01]"
          style={{ animationDelay: "0.35s" }}
        >
          <Moon className="h-7 w-7 opacity-90" />
          <div className="flex-1 text-left">
            <p className="text-xs uppercase tracking-wider opacity-70">Tutup hari</p>
            <p className="font-extrabold">Muhasabah Malam 🌙</p>
            <p className="text-xs opacity-70">3 pertanyaan singkat sebelum tidur</p>
          </div>
          <span className="text-2xl">→</span>
        </button>

        {/* Teman Hati narasi */}
        <div className="bg-card/70 backdrop-blur rounded-3xl p-4 flex items-start gap-3 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <TemanHati size={56} className="animate-float shrink-0" />
          <p className="text-sm text-foreground/85 leading-relaxed pt-1">
            <b>Ustadz Hati:</b> "Gak harus sempurna, {nickname}. Yang penting hari ini lebih baik dari kemarin. Ortu/guru BK kamu cuma lihat status ✓/✗ — isi muhasabah aman cuma buat kamu."
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          🌿 Tidak ada ranking · Privasi anak dijaga · 30 hari = 1 cycle hijrah
        </p>
      </div>
    </div>
  );
}

function QuestCard(props: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  sub: string;
  done: boolean;
  onToggle: () => void;
  ctaDone: string;
  ctaTodo: string;
  delay: number;
}) {
  return (
    <div
      className={`rounded-3xl p-5 transition-gentle animate-fade-up ${
        props.done ? "bg-safe/30 border-2 border-safe" : "bg-card shadow-soft"
      }`}
      style={{ animationDelay: `${props.delay}s` }}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{props.badge}</span>
        {props.done && <Check className="h-5 w-5 text-safe" />}
      </div>
      <h3 className="mt-2 font-extrabold text-foreground">{props.title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{props.sub}</p>
      <button
        type="button"
        onClick={props.onToggle}
        className={`w-full rounded-2xl px-3 py-2.5 text-sm font-bold transition-gentle inline-flex items-center justify-center gap-1.5 ${
          props.done
            ? "bg-safe text-background hover:opacity-90"
            : "bg-accent text-accent-foreground hover:opacity-90"
        }`}
      >
        {props.done ? props.ctaDone : (<><span>{props.icon}</span>{props.ctaTodo}</>)}
      </button>
    </div>
  );
}