import { request } from './request';
import { setAuthToken, clearAuthToken, getAuthToken } from './config';

export interface AuthResponse {
  token: string;
  userId: number;
  expiresAt: string;
}

export interface UserInfo {
  userId: number;
  phone: string;
}

export const authApi = {
  /**
   * 手机号注册/登录
   */
  login: async (
    phoneNumber: string,
  ): Promise<{ token: string; userId: number }> => {
    const response = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone: phoneNumber }),
    });

    // 保存token
    await setAuthToken(response.token);

    return {
      token: response.token,
      userId: response.userId,
    };
  },

  /**
   * 验证token
   */
  verify: async (): Promise<UserInfo | null> => {
    try {
      const response = await request<{
        valid: boolean;
        userId?: number;
        phone?: string;
      }>('/api/auth/verify');

      if (response.valid && response.userId && response.phone) {
        return {
          userId: response.userId,
          phone: response.phone,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * 获取当前登录态
   */
  getCurrentUser: async (): Promise<UserInfo | null> => {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    return authApi.verify();
  },

  /**
   * 退出登录
   */
  logout: async () => {
    await clearAuthToken();
  },
};
