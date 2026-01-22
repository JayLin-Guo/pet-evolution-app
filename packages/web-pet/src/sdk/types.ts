import type { Pet } from "@pet-evolution/shared";

export type MessageItem = { sender: "user" | "pet"; text: string };

export interface PetSceneActions {
  feed: (foodValue?: number) => Promise<{ pet: Pet; message?: string }> | void;
  play: () => Promise<{ pet: Pet; message?: string }> | void;
  touch: () => Promise<{ pet: Pet; message?: string }> | void;
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
  /**
   * 操作消息（可选）
   * 用于显示操作反馈消息，如"主人，我吃饱了"
   */
  actionMessage?: string | null;
  /**
   * 消息关闭回调（可选）
   */
  onActionMessageClose?: () => void;
}


