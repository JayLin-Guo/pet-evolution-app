/**
 * 环境配置：不同环境对应的静态资源域名前缀
 */
export type Environment = "test" | "product" | "dev";

export interface EnvironmentConfig {
  /** 静态资源基础 URL（不包含具体资源路径） */
  staticBaseUrl: string;
}

/**
 * 环境配置映射表
 */
const ENV_CONFIGS: Record<Environment, EnvironmentConfig> = {
  test: {
    // 测试环境：使用后端API从zip文件中读取（节省nginx空间）
    // 如果zip文件解压在nginx，可以改为 "/static/"
    staticBaseUrl: "/api/static/",
  },
  product: {
    // 生产环境：使用后端API从zip文件中读取
    // 如果使用CDN，可以改为 "https://your-cdn.com/static/"
    staticBaseUrl: "/api/static/",
  },
  dev: {
    // 开发环境：本地开发服务器
    staticBaseUrl: "http://localhost:8011/api/static/",
  },
};

/**
 * 根据环境标识获取配置
 */
export function getEnvironmentConfig(env: Environment): EnvironmentConfig {
  return ENV_CONFIGS[env] || ENV_CONFIGS.dev;
}

/**
 * 根据环境标识和资源后缀，拼接完整的 Spine 资源基础 URL
 * @param env 环境标识（test/product/dev）
 * @param resourceSuffix 资源后缀（如 "mon_earth_dragon_01_v38"）
 * @returns 完整的资源基础 URL（如 "http://47.93.247.175:8080/static/mon_earth_dragon_01_v38/"）
 */
export function buildSpineBaseUrl(
  env: Environment,
  resourceSuffix: string,
): string {
  const config = getEnvironmentConfig(env);
  // 确保 baseUrl 以 / 结尾，resourceSuffix 不以 / 开头
  const base = config.staticBaseUrl.endsWith("/")
    ? config.staticBaseUrl
    : config.staticBaseUrl + "/";
  const suffix = resourceSuffix.startsWith("/")
    ? resourceSuffix.slice(1)
    : resourceSuffix;
  return `${base}${suffix}/`;
}
