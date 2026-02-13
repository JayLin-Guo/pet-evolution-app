import type { PetResponseDto } from "@pet-evolution/shared";

export type MessageItem = { sender: "user" | "pet"; text: string };

export interface PetSceneActions {
  feed: (
    foodValue?: number,
  ) => Promise<{ pet: PetResponseDto; message?: string }> | void;
  play: () => Promise<{ pet: PetResponseDto; message?: string }> | void;
  touch: () => Promise<{ pet: PetResponseDto; message?: string }> | void;
  chat: (text: string) => Promise<string>;
  logout: () => Promise<void> | void;
}

export interface PetSceneProps {
  pet: PetResponseDto;
  actions: PetSceneActions;
  spineBaseUrl?: string | null;
  actionMessage?: string | null;
  onActionMessageClose?: () => void;
}
