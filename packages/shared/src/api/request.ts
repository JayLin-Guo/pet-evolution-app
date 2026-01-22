/**
 * API 请求封装
 * 处理基础路径、Header 注入及错误拦截
 */

import { API_BASE_URL, getAuthToken, clearAuthToken } from './config';

/**
 * 统一响应格式
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  // 从存储中获取 Token
  const token = await getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // 处理未授权等通用错误
    if (response.status === 401) {
      // 清除token并触发登出
      await clearAuthToken();
      throw new Error('未授权，请重新登录');
    }

    // 读取响应文本（只能调用一次）
    const text = await response.text();

    // 如果响应体为空，返回 null
    if (!text || text.trim() === '') {
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }
      return null as T;
    }

    // 解析 JSON
    let responseData: ApiResponse<T>;
    try {
      responseData = JSON.parse(text);
    } catch (error) {
      console.error(`JSON 解析失败，响应内容: ${text.substring(0, 200)}`);
      throw new Error(`JSON 解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 统一响应格式处理
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      // 如果响应格式是 { code, data, msg }
      if (responseData.code !== 200) {
        // 业务错误（code 不是 200）
        throw new Error(responseData.msg || `请求失败: code ${responseData.code}`);
      }
      // 成功，返回 data 字段
      return responseData.data as T;
    }

    // 如果不是统一格式，直接返回（兼容旧接口）
    if (!response.ok) {
      throw new Error(
        (responseData as any)?.msg ||
        (responseData as any)?.message ||
        `请求失败: ${response.status} ${response.statusText}`,
      );
    }

    return responseData as T;
  } catch (error) {
    console.error(`[API Error] ${url}:`, error);
    throw error;
  }
};
