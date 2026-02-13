/**
 * 获取开发机宿主 IP (用于真机调试和局域网访问)
 * Expo 会在 DEV 下注入 debuggerHost，形如 "192.168.1.12:8085"
 * 在 release 下该字段通常不存在
 */
export function getDevMachineHostIp(): string | null {
  const maybe = (globalThis as any)?.__expo?.settings?.debuggerHost;
  if (typeof maybe !== "string") return null;
  const host = maybe.split(":")[0];
  return host || null;
}

/**
 * 解析 Web Pet 页面的地址
 * 区分开发环境和生产环境
 */
export function resolveWebPetUrl(): string {
  // 开发环境：使用本地服务 (优先使用 IP 以支持真机调试)
  if (__DEV__) {
    const ip = getDevMachineHostIp();
    return ip ? `http://${ip}:3000` : "http://localhost:3000";
  }

  // 生产/构建环境：指向线上 H5 地址
  return "http://47.93.247.175:8081";
}

/**
 * 从环境变量读取环境标识（test/product/dev）
 */
export function resolveEnvironment(): "test" | "product" | "dev" | undefined {
  if (typeof process !== "undefined" && (process as any).env) {
    const raw = (process as any).env.EXPO_PUBLIC_PET_ENVIRONMENT;
    if (typeof raw === "string") {
      const env = raw.trim().toLowerCase();
      if (env === "test" || env === "product" || env === "dev") {
        return env as "test" | "product" | "dev";
      }
    }
  }
  return "test";
}

/**
 * 解析 API 地址
 */
export function resolveApiUrl(): string {
  if (__DEV__) {
    const ip = getDevMachineHostIp();
    return ip ? `http://${ip}:8011` : "http://localhost:8011";
  }
  // 生产环境 API 地址 (与 shared 配置保持一致或通过环境变量读取)
  return "https://api.pet-evolution.com";
}
