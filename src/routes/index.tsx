import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SplashScreen } from "@/components/game/SplashScreen";
import { RolePicker } from "@/components/game/RolePicker";
import { ConsentScreen } from "@/components/game/ConsentScreen";
import { AvatarScreen } from "@/components/game/AvatarScreen";
import { TutorialScreen } from "@/components/game/TutorialScreen";
import { EmotionMeterScreen } from "@/components/game/EmotionMeterScreen";
import { QuestDashboard } from "@/components/game/QuestDashboard";
import { MuhasabahMalam } from "@/components/game/MuhasabahMalam";
import { ButuhTeman } from "@/components/game/ButuhTeman";
import { savePlayer, type Avatar, type PreTestData } from "@/lib/game-state";
import {
  createStudentSession,
  updateStudentSession,
  incrementPanicTap,
  fetchSessionSnapshot,
} from "@/lib/student-session";

export const Route = createFileRoute("/")({
  component: ResetHati,
});

type Stage =
  | "splash"
  | "role"
  | "consent"
  | "avatar"
  | "tutorial"
  | "pretest"
  | "dashboard"
  | "muhasabah";

function ResetHati() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("splash");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<Avatar>("boy-1");
  const [treeLevel, setTreeLevel] = useState(0);

  // Tombol "Astaghfirullah" muncul setelah tutorial dikenalin
  const showPanic =
    stage === "pretest" || stage === "dashboard" || stage === "muhasabah";

  return (
    <>
      {showPanic && <ButuhTeman onPanic={() => { void incrementPanicTap(); }} />}

      {stage === "splash" && <SplashScreen onDone={() => setStage("role")} />}

      {stage === "role" && (
        <RolePicker
          onPick={(role) => {
            if (role === "guru") {
              void navigate({ to: "/guru" });
            } else if (role === "ortu") {
              void navigate({ to: "/ortu" });
            } else {
              setStage("consent");
            }
          }}
        />
      )}

      {stage === "consent" && (
        <ConsentScreen
          onAgree={() => {
            savePlayer({ consent: true, treeLevel: 0 });
            setStage("avatar");
          }}
        />
      )}

      {stage === "avatar" && (
        <AvatarScreen
          onDone={async (a, n, k) => {
            setAvatar(a);
            setNickname(n);
            savePlayer({ avatar: a, nickname: n });
            try {
              await createStudentSession(n, a, k);
            } catch (e) {
              console.error("Gagal membuat sesi siswa", e);
            }
            setStage("tutorial");
          }}
        />
      )}

      {stage === "tutorial" && (
        <TutorialScreen nickname={nickname} onDone={() => setStage("pretest")} />
      )}

      {stage === "pretest" && (
        <EmotionMeterScreen
          nickname={nickname}
          onDone={(data: PreTestData) => {
            savePlayer({ preTest: data });
            void updateStudentSession({ pretest: data });
            setStage("dashboard");
          }}
        />
      )}

      {stage === "dashboard" && (
        <QuestDashboard
          nickname={nickname}
          avatar={avatar}
          treeLevel={treeLevel}
          onMuhasabah={() => setStage("muhasabah")}
          onTreeLevelChange={(lvl) => {
            setTreeLevel(lvl);
            savePlayer({ treeLevel: lvl });
          }}
        />
      )}

      {stage === "muhasabah" && (
        <MuhasabahMalam
          nickname={nickname}
          onDone={() => {
            const next = Math.min(7, treeLevel + 1);
            setTreeLevel(next);
            savePlayer({ treeLevel: next });
            void updateStudentSession({
              tree_level: next,
              muhasabah_count: next, // approx; increments each completion
              last_muhasabah_at: new Date().toISOString(),
            });
            // Ekspor otomatis snapshot harian anak ini ke file JSON.
            void exportDailySnapshot(nickname);
            setStage("dashboard");
          }}
          onBack={() => setStage("dashboard")}
        />
      )}
    </>
  );
}

async function exportDailySnapshot(nickname: string) {
  try {
    const snap = await fetchSessionSnapshot();
    if (!snap) return;
    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      exported_at: new Date().toISOString(),
      cycle_day: today,
      ...snap,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const safe = (nickname || "anak").replace(/[^a-zA-Z0-9-_]/g, "_");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ResetHati_${safe}_${today}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Gagal ekspor snapshot harian", e);
  }
}