import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { createWebViewBridge, PetScene, type PetSceneActions } from "./sdk";
import type { Pet } from "@pet-evolution/shared";

function App() {
  const bridge = useMemo(() => createWebViewBridge(), []);
  const [pet, setPet] = useState<Pet | null>(null);
  const [spineBaseUrl, setSpineBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    const disposeBridge = bridge.connect();

    const disposePet = bridge.onPetChange(setPet);

    const disposeSpineUrl = bridge.onSpineBaseUrlChange(setSpineBaseUrl);

    return () => {
      disposePet();
      disposeSpineUrl();
      disposeBridge();
    };
  }, [bridge]);

  const actions: PetSceneActions = useMemo(
    () => ({
      feed: (foodValue) => bridge.feed(foodValue),
      play: () => bridge.play(),
      touch: () => bridge.touch(),
      chat: (text) => bridge.chat(text),
      logout: () => bridge.logout(),
    }),
    [bridge],
  );

  if (!pet) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🥚</div>
        <div className="loading-text">加载中...</div>
      </div>
    );
  }

  return <PetScene pet={pet} actions={actions} spineBaseUrl={spineBaseUrl} />;
}

export default App;
