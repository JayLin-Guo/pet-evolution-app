import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { createWebViewBridge, PetScene, type PetSceneActions } from "./sdk";
import type { PetResponseDto } from "@pet-evolution/shared";

function App() {
  const bridge = useMemo(() => createWebViewBridge(), []);
  const [pet, setPet] = useState<PetResponseDto | null>(null);
  const [spineBaseUrl, setSpineBaseUrl] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const disposeBridge = bridge.connect();

    const disposePet = bridge.onPetChange(setPet);

    const disposeSpineUrl = bridge.onSpineBaseUrlChange(setSpineBaseUrl);

    const disposeActionMessage = bridge.onActionMessage(setActionMessage);

    return () => {
      disposePet();
      disposeSpineUrl();
      disposeActionMessage();
      disposeBridge();
    };
  }, [bridge]);

  const actions: PetSceneActions = useMemo(
    () => ({
      feed: async (foodValue) => {
        bridge.feed(foodValue);
        return { pet: pet!, message: actionMessage || undefined };
      },
      play: async () => {
        bridge.play();
        return { pet: pet!, message: actionMessage || undefined };
      },
      touch: async () => {
        bridge.touch();
        return { pet: pet!, message: actionMessage || undefined };
      },
      chat: (text) => bridge.chat(text),
      logout: () => bridge.logout(),
    }),
    [bridge, pet, actionMessage],
  );

  if (!pet) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🥚</div>
        <div className="loading-text">加载中...</div>
      </div>
    );
  }

  return (
    <PetScene
      pet={pet}
      actions={actions}
      spineBaseUrl={spineBaseUrl}
      actionMessage={actionMessage}
      onActionMessageClose={() => setActionMessage(null)}
    />
  );
}

export default App;
