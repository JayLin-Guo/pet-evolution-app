import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";
import type { Pet } from "@pet-evolution/shared";

type WebToNativeMessage =
  | { type: "WEBVIEW_READY" }
  | { type: "FEED"; data?: { foodValue?: number } }
  | { type: "PLAY" }
  | { type: "TOUCH" }
  | { type: "CHAT"; data: string | { text: string; requestId?: string } }
  | { type: "LOGOUT" };

type NativeToWebMessage =
  | {
      type: "UPDATE_PET";
      data: Pet;
      /**
       * 环境标识（可选）：test/product/dev
       */
      environment?: "test" | "product" | "dev";
    }
  | { type: "CHAT_RESPONSE"; data: { reply: string; requestId?: string } }
  | { type: "ERROR"; data: { message: string; requestId?: string } };

interface PetWebViewProps {
  pet: Pet;
  onFeed: (foodValue?: number) => Promise<void> | void;
  onPlay: () => Promise<void> | void;
  onTouch: () => Promise<void> | void;
  onChat: (message: string) => Promise<string>;
  onLogout: () => Promise<void> | void;
  /**
   * Web 宠物页面地址：
   * - 开发期建议指向 web-pet dev server（如 http://<ip>:3000）
   * - 也可以替换为 CDN / 静态站点
   */
  webUrl: string;
  /**
   * 环境标识（可选）：test/product/dev
   * 用于 web-pet 内部根据环境选择对应的静态资源域名前缀
   */
  environment?: "test" | "product" | "dev";
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

export const PetWebView: React.FC<PetWebViewProps> = ({
  pet,
  onFeed,
  onPlay,
  onTouch,
  onChat,
  onLogout,
  webUrl,
  environment,
}) => {
  const webRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<View>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const source = useMemo(() => ({ uri: webUrl }), [webUrl]);

  /**
   * 发送消息给 Web 侧
   * Native -> Web
   */
  const postToWeb = useCallback((msg: NativeToWebMessage) => {
    const payload = JSON.stringify(msg);
    if (Platform.OS === "web") {
      // Web 平台：通过 iframe postMessage 发送给内部的网页
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(payload, "*");
      }
    } else {
      // 原生平台：通过 react-native-webview 的 postMessage 发送
      webRef.current?.postMessage(payload);
    }
  }, []);

  // 监听 pet 数据或环境变化，自动同步给 Web
  // 仅当 WebView 准备就绪 (WEBVIEW_READY) 后才发送
  useEffect(() => {
    if (!isReady) return;
    postToWeb({
      type: "UPDATE_PET",
      data: pet,
      environment,
    });
  }, [isReady, pet, postToWeb, environment]);

  /**
   * 接收来自 Web 侧 (iframe/WebView) 的消息
   * - Web -> Native: 通过 window.parent.postMessage (Web) 或 window.ReactNativeWebView.postMessage (Native) 发送
   * - Native -> Web: 使用 postToWeb 发送
   */
  const handleMessage = useCallback(
    async (event: WebViewMessageEvent | MessageEvent) => {
      // 1. 解析消息内容
      // Web 平台：event.data 直接就是消息内容
      // Native 平台：event.nativeEvent.data 是字符串化的消息
      const raw =
        Platform.OS === "web"
          ? (event as MessageEvent).data
          : (event as WebViewMessageEvent).nativeEvent.data;

      const parsed = safeJsonParse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const msg = parsed as WebToNativeMessage;

      try {
        // 2. 根据消息类型处理业务逻辑
        switch (msg.type) {
          case "WEBVIEW_READY": {
            // Web 侧加载完成，准备接收数据
            setIsReady(true);
            setLoadError(null);
            setIsLoading(false);

            // 立即同步一次当前宠物数据给 Web
            postToWeb({
              type: "UPDATE_PET",
              data: pet,
              environment,
            });
            return;
          }
          case "FEED": {
            // Web 请求喂食 -> 调用 Native 喂食逻辑
            await onFeed(msg.data?.foodValue);
            return;
          }
          case "PLAY": {
            // Web 请求玩耍 -> 调用 Native 玩耍逻辑
            await onPlay();
            return;
          }
          case "TOUCH": {
            // Web 请求抚摸 -> 调用 Native 抚摸逻辑
            await onTouch();
            return;
          }
          case "CHAT": {
            // Web 发送对话 -> Native 调用 AI 接口 -> 返回结果给 Web
            const data = msg.data;
            const text = typeof data === "string" ? data : data.text;
            const requestId =
              typeof data === "string" ? undefined : data.requestId;

            const reply = await onChat(text);

            // 将 AI 回复发送回 Web
            postToWeb({ type: "CHAT_RESPONSE", data: { reply, requestId } });
            return;
          }
          case "LOGOUT": {
            await onLogout();
            return;
          }
          default:
            return;
        }
      } catch (e: any) {
        const message = e?.message ? String(e.message) : "Unknown error";
        postToWeb({ type: "ERROR", data: { message } });
      }
    },
    [onFeed, onPlay, onTouch, onChat, onLogout, pet, postToWeb, environment],
  );

  // Web 平台：监听 window message（来自 iframe）
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleWindowMessage = (e: MessageEvent) => {
      // 开发期：允许所有消息（因为可能跨域）
      // 生产环境：应该检查 e.origin 是否匹配 webUrl
      console.log(
        "[PetWebView] Received message from iframe:",
        e.data,
        "origin:",
        e.origin,
      );

      // 尝试解析消息
      const parsed = safeJsonParse(e.data);
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed as any).type === "WEBVIEW_READY"
      ) {
        console.log(
          "[PetWebView] WEBVIEW_READY received, setting isReady=true",
        );
      }

      handleMessage(e);
    };

    window.addEventListener("message", handleWindowMessage);
    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [webUrl, handleMessage]);

  // Web 平台：使用 iframe（通过 DOM API）
  useEffect(() => {
    if (Platform.OS !== "web") return;

    // 使用 setTimeout 确保 DOM 已渲染
    const timer = setTimeout(() => {
      // 尝试多种方式获取 View 的 DOM 节点
      let containerNode: HTMLElement | null = null;

      if (containerRef.current) {
        // 方式1: 通过 _nativeNode
        containerNode = (containerRef.current as any)?._nativeNode;
        // 方式2: 通过 _internalFiberInstanceHandleDEV 或直接查找
        if (!containerNode) {
          const viewElement = document.querySelector(
            '[data-testid="pet-webview-container"]',
          );
          if (viewElement) containerNode = viewElement as HTMLElement;
        }
        // 方式3: 通过 ref 的 current 属性查找最近的 div
        if (!containerNode && typeof document !== "undefined") {
          // React Native Web 通常会把 View 渲染成 div，我们通过查找包含特定样式的元素
          const allDivs = Array.from(document.querySelectorAll("div"));
          containerNode =
            (allDivs.find((div) => {
              const style = window.getComputedStyle(div);
              return (
                style.position === "relative" ||
                div.style.position === "relative"
              );
            }) as HTMLElement) || null;
        }
      }

      if (!containerNode) {
        console.warn("PetWebView: 无法找到容器节点，尝试创建新容器");
        // 创建一个新的容器
        const newContainer = document.createElement("div");
        newContainer.id = "pet-webview-iframe-container";
        newContainer.style.width = "100%";
        newContainer.style.height = "100%";
        newContainer.style.position = "relative";
        document.body.appendChild(newContainer);
        containerNode = newContainer;
      }

      // 如果已经存在 iframe，先移除
      const existingIframe = containerNode.querySelector("iframe");
      if (existingIframe) {
        containerNode.removeChild(existingIframe);
      }

      // 创建 iframe
      const iframe = document.createElement("iframe");
      iframe.src = webUrl;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.display = "block";
      iframe.setAttribute("allow", "clipboard-read; clipboard-write");

      iframe.onload = () => {
        console.log("PetWebView: iframe loaded, waiting for WEBVIEW_READY");
        // iframe 加载完成后，等待 web-pet 发送 WEBVIEW_READY
        // 注意：isLoading 会在收到 WEBVIEW_READY 时设置为 false
      };

      iframe.onerror = () => {
        console.error("PetWebView: iframe load error");
        setLoadError("iframe 加载失败");
        setIsLoading(false);
      };

      containerNode.appendChild(iframe);
      iframeRef.current = iframe;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (iframeRef.current && iframeRef.current.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current);
      }
    };
  }, [webUrl]); // 移除 isLoading 依赖，避免循环更新

  // Web 平台：使用 iframe
  if (Platform.OS === "web") {
    return (
      <View
        style={styles.container}
        ref={containerRef}
        // @ts-ignore - React Native Web 支持 data-testid
        data-testid="pet-webview-container"
      >
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>加载宠物界面中...</Text>
          </View>
        )}

        {loadError ? (
          <View style={styles.errorOverlay} pointerEvents="none">
            <Text style={styles.errorTitle}>WebView 加载失败</Text>
            <Text style={styles.errorText}>{loadError}</Text>
            <Text style={styles.errorHint}>请确认 webUrl 可访问：{webUrl}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  // 原生平台：使用 react-native-webview
  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={source}
        onMessage={handleMessage}
        onError={(e) => setLoadError(e.nativeEvent.description)}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>加载宠物界面中...</Text>
          </View>
        )}
        // 允许本地/开发资源
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        // iOS 默认需要
        allowsInlineMediaPlayback
      />

      {loadError ? (
        <View style={styles.errorOverlay} pointerEvents="none">
          <Text style={styles.errorTitle}>WebView 加载失败</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <Text style={styles.errorHint}>请确认 webUrl 可访问：{webUrl}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#87CEEB",
  },
  loadingText: { marginTop: 10, color: "#fff", fontSize: 16 },
  errorOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 60,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
  },
  errorTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  errorText: { color: "#fff", fontSize: 12, marginBottom: 6 },
  errorHint: { color: "rgba(255,255,255,0.9)", fontSize: 12 },
});
