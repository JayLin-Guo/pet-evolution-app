/**
 * API 配置
 */

// 开发环境使用本地服务器，生产环境使用实际域名
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.pet-evolution.com"
    : "http://localhost:8011";

/**
 * 远程静态资源基础地址
 * 统一管理静态资源路径，避免在多处硬编码
 */
export const REMOTE_STATIC_BASE_URL =
  "http://47.93.247.175:8081/static/spine-role";
export const REMOTE_PET_IMG_BASE_URL = "http://47.93.247.175:8081/pet-imgs";

/**
 * 获取存储的token
 */
export const getAuthToken = async (): Promise<string | null> => {
  if (
    typeof globalThis !== "undefined" &&
    "window" in globalThis &&
    typeof (globalThis as any).window !== "undefined"
  ) {
    // Web环境
    const win = (globalThis as any).window;
    if (win.localStorage) {
      return win.localStorage.getItem("auth_token");
    }
  }

  // React Native环境
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    return await AsyncStorage.getItem("auth_token");
  } catch {
    return null;
  }
};

/**
 * 保存token
 */
export const setAuthToken = async (token: string): Promise<void> => {
  if (
    typeof globalThis !== "undefined" &&
    "window" in globalThis &&
    typeof (globalThis as any).window !== "undefined"
  ) {
    // Web环境
    const win = (globalThis as any).window;
    if (win.localStorage) {
      win.localStorage.setItem("auth_token", token);
      return;
    }
  }

  // React Native环境
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    await AsyncStorage.setItem("auth_token", token);
  } catch {
    // 忽略错误
  }
};

/**
 * 清除token
 */
export const clearAuthToken = async (): Promise<void> => {
  if (
    typeof globalThis !== "undefined" &&
    "window" in globalThis &&
    typeof (globalThis as any).window !== "undefined"
  ) {
    // Web环境
    const win = (globalThis as any).window;
    if (win.localStorage) {
      win.localStorage.removeItem("auth_token");
      return;
    }
  }

  // React Native环境
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    await AsyncStorage.removeItem("auth_token");
  } catch {
    // 忽略错误
  }
};
