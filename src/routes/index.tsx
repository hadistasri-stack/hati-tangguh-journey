import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SplashScreen } from "@/components/game/SplashScreen";
import { ConsentScreen } from "@/components/game/ConsentScreen";
import { AvatarScreen } from "@/components/game/AvatarScreen";
import { TutorialScreen } from "@/components/game/TutorialScreen";
import { EmotionMeterScreen } from "@/components/game/EmotionMeterScreen";
import { QuestDashboard } from "@/components/game/QuestDashboard";
import { MuhasabahMalam } from "@/components/game/MuhasabahMalam";
import { ButuhTeman } from "@/components/game/ButuhTeman";
import { savePlayer, type Avatar, type PreTestData } from "@/lib/game-state";

export const Route = createFileRoute("/")({
  component: ResetHati,
});

type Stage =
  | "splash"
  | "consent"
  | "avatar"
  | "tutorial"
  | "pretest"
  | "dashboard"
  | "muhasabah";

function ResetHati() {
  const [stage, setStage] = useState<Stage>("splash");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<Avatar>("boy-1");
  const [treeLevel, setTreeLevel] = useState(0);

  // Tombol "Astaghfirullah" muncul setelah tutorial dikenalin
  const showPanic =
    stage === "pretest" || stage === "dashboard" || stage === "muhasabah";

  return (
    <>
      {showPanic && <ButuhTeman />}

      {stage === "splash" && <SplashScreen onDone={() => setStage("consent")} />}

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
          onDone={(a, n) => {
            setAvatar(a);
            setNickname(n);
            savePlayer({ avatar: a, nickname: n });
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
        />
      )}

      {stage === "muhasabah" && (
        <MuhasabahMalam
          nickname={nickname}
          onDone={() => {
            setTreeLevel((l) => Math.min(7, l + 1));
            savePlayer({ treeLevel: Math.min(7, treeLevel + 1) });
            setStage("dashboard");
          }}
          onBack={() => setStage("dashboard")}
        />
      )}
    </>
  );
}