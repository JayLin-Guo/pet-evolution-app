import type { PetResponseDto } from "@pet-evolution/shared";
import type { Environment } from "./config";

type NativeToWebMessage =
  | {
      type: "UPDATE_PET";
      data: PetResponseDto;
      /**
       * 环境标识（可选）：test/product/dev
       * 如果不传，使用默认环境（dev）
       */
      environment?: Environment;
    }
  | { type: "CHAT_RESPONSE"; data: { reply: string; requestId?: string } }
  | { type: "ACTION_MESSAGE"; data: { message: string } }
  | { type: "ERROR"; data: { message: string; requestId?: string } };

type WebToNativeMessage =
  | { type: "WEBVIEW_READY" }
  | { type: "FEED"; data?: { foodValue?: number } }
  | { type: "PLAY" }
  | { type: "TOUCH" }
  | { type: "CHAT"; data: string | { text: string; requestId?: string } }
  | { type: "LOGOUT" };

function safeParseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

export interface WebViewBridge {
  connect: () => () => void;
  getPet: () => PetResponseDto | null;
  getSpineBaseUrl: () => string | null;
  onPetChange: (listener: (pet: PetResponseDto) => void) => () => void;
  onSpineBaseUrlChange: (listener: (url: string | null) => void) => () => void;
  onActionMessage: (listener: (message: string) => void) => () => void;
  feed: (foodValue?: number) => void;
  play: () => void;
  touch: () => void;
  chat: (text: string) => Promise<string>;
  logout: () => void;
}

export function createWebViewBridge(): WebViewBridge {
  let pet: PetResponseDto | null = null;
  let spineBaseUrl: string | null = null;
  const petListeners = new Set<(p: PetResponseDto) => void>();
  const spineBaseUrlListeners = new Set<(url: string | null) => void>();
  const actionMessageListeners = new Set<(message: string) => void>();

  const pendingChats = new Map<
    string,
    { resolve: (r: string) => void; reject: (e: unknown) => void }
  >();
  let seq = 0;

  const post = (msg: WebToNativeMessage) => {
    const payload = JSON.stringify(msg);

    // 优先检查 React Native WebView（原生平台）
    if ((window as any).ReactNativeWebView?.postMessage) {
      (window as any).ReactNativeWebView.postMessage(payload);
      return;
    }

    // 检查是否在 iframe 中（Web 平台）
    if (window.parent && window.parent !== window) {
      // 在 iframe 中，向父窗口发送消息
      window.parent.postMessage(payload, "*");
      return;
    }

    // 独立运行时（开发/调试）
    console.log("[bridge->native]", msg);
  };

  const handleNativeMessage = (raw: string) => {
    const parsed = safeParseJson(raw);
    if (!parsed || typeof parsed !== "object") return;
    const msg = parsed as NativeToWebMessage;

    if (msg.type === "UPDATE_PET") {
      pet = msg.data;
      petListeners.forEach((fn) => fn(msg.data));

      // 从 PetResponseDto 中获取资源文件夹路径
      if (msg.data.resource_folder) {
        const newSpineBaseUrl = msg.data.resource_folder;

        if (newSpineBaseUrl !== spineBaseUrl) {
          spineBaseUrl = newSpineBaseUrl;
          spineBaseUrlListeners.forEach((fn) => fn(spineBaseUrl));
        }
      }
      return;
    }

    if (msg.type === "CHAT_RESPONSE") {
      const requestId = msg.data?.requestId;
      if (requestId && pendingChats.has(requestId)) {
        pendingChats.get(requestId)!.resolve(msg.data.reply);
        pendingChats.delete(requestId);
      }
      return;
    }

    if (msg.type === "ACTION_MESSAGE") {
      actionMessageListeners.forEach((fn) => fn(msg.data.message));
      return;
    }

    if (msg.type === "ERROR") {
      const requestId = msg.data?.requestId;
      if (requestId && pendingChats.has(requestId)) {
        pendingChats.get(requestId)!.reject(new Error(msg.data.message));
        pendingChats.delete(requestId);
      } else {
        console.error("[native error]", msg.data?.message);
      }
      return;
    }
  };

  return {
    connect: () => {
      const listener = (event: MessageEvent) => {
        if (typeof event.data === "string") handleNativeMessage(event.data);
      };
      window.addEventListener("message", listener);
      document.addEventListener("message", listener as any);
      post({ type: "WEBVIEW_READY" });
      return () => {
        window.removeEventListener("message", listener);
        document.removeEventListener("message", listener as any);
      };
    },
    getPet: () => pet,
    getSpineBaseUrl: () => spineBaseUrl,
    onPetChange: (fn) => {
      petListeners.add(fn);
      if (pet) fn(pet);
      return () => petListeners.delete(fn);
    },
    onSpineBaseUrlChange: (fn) => {
      spineBaseUrlListeners.add(fn);
      if (spineBaseUrl) fn(spineBaseUrl);
      return () => spineBaseUrlListeners.delete(fn);
    },
    onActionMessage: (fn) => {
      actionMessageListeners.add(fn);
      return () => actionMessageListeners.delete(fn);
    },
    feed: (foodValue) => post({ type: "FEED", data: { foodValue } }),
    play: () => post({ type: "PLAY" }),
    touch: () => post({ type: "TOUCH" }),
    chat: (text) => {
      const requestId = `chat_${Date.now()}_${seq++}`;
      post({ type: "CHAT", data: { text, requestId } });
      return new Promise<string>((resolve, reject) => {
        pendingChats.set(requestId, { resolve, reject });
        // 超时兜底
        setTimeout(() => {
          if (!pendingChats.has(requestId)) return;
          pendingChats.get(requestId)!.reject(new Error("Chat timeout"));
          pendingChats.delete(requestId);
        }, 15000);
      });
    },
    logout: () => post({ type: "LOGOUT" }),
  };
}
