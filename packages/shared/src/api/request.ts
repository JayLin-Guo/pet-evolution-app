/**
 * API 请求封装
 * 处理基础路径、Header 注入及错误拦截
 */

const BASE_URL = "https://api.pet-evolution.com"; // 预留 API 域名

export const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  // 预留：从存储中获取 Token
  // const token = await AsyncStorage.getItem('auth_token');

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // 处理未授权等通用错误
    if (response.status === 401) {
      // 触发登出或重定向到登录页
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "网络请求错误");
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${url}:`, error);
    throw error;
  }
};
