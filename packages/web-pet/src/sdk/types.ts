import type { Pet } from "@pet-evolution/shared";

export type MessageItem = { sender: "user" | "pet"; text: string };

export interface PetSceneActions {
  feed: (foodValue?: number) => Promise<void> | void;
  play: () => Promise<void> | void;
  touch: () => Promise<void> | void;
  chat: (text: string) => Promise<string>;
  logout: () => Promise<void> | void;
}

export interface PetSceneProps {
  pet: Pet;
  actions: PetSceneActions;
  /**
   * Spine 资源基础 URL（可选）
   * 如果提供，PetScene 会使用此 URL 加载 Spine 动画资源
   * 格式：http://domain/path/to/resource_folder/
   */
  spineBaseUrl?: string | null;
}


