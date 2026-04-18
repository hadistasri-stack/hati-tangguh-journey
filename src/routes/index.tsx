import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SplashScreen } from "@/components/game/SplashScreen";
import { ConsentScreen } from "@/components/game/ConsentScreen";
import { AvatarScreen } from "@/components/game/AvatarScreen";
import { TutorialScreen } from "@/components/game/TutorialScreen";
import { EmotionMeterScreen } from "@/components/game/EmotionMeterScreen";
import { WorldMap } from "@/components/game/WorldMap";
import { Level1Intro } from "@/components/game/Level1Intro";
import { ButuhTeman } from "@/components/game/ButuhTeman";
import { savePlayer, type Avatar, type PreTestData } from "@/lib/game-state";

export const Route = createFileRoute("/")({
  component: HatiTangguh,
});

type Stage = "splash" | "consent" | "avatar" | "tutorial" | "emotion" | "map" | "level1";

function HatiTangguh() {
  const [stage, setStage] = useState<Stage>("splash");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<Avatar>("boy-1");

  // Tombol "Butuh Teman" muncul setelah tutorial dikenalin
  const showSOS = stage === "emotion" || stage === "map" || stage === "level1";

  return (
    <>
      {showSOS && <ButuhTeman />}

      {stage === "splash" && <SplashScreen onDone={() => setStage("consent")} />}

      {stage === "consent" && (
        <ConsentScreen
          onAgree={() => {
            savePlayer({ consent: true });
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
        <TutorialScreen nickname={nickname} onDone={() => setStage("emotion")} />
      )}

      {stage === "emotion" && (
        <EmotionMeterScreen
          nickname={nickname}
          onDone={(data: PreTestData) => {
            savePlayer({ preTest: data });
            setStage("map");
          }}
        />
      )}

      {stage === "map" && (
        <WorldMap
          nickname={nickname}
          avatar={avatar}
          onEnterLevel1={() => setStage("level1")}
        />
      )}

      {stage === "level1" && (
        <Level1Intro nickname={nickname} onBack={() => setStage("map")} />
      )}
    </>
  );
}
