import { delay } from "./mockData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "@user_auth";

export const authApi = {
  /**
   * 模拟手机号登录/注册
   */
  login: async (
    phoneNumber: string,
  ): Promise<{ token: string; userId: string }> => {
    await delay(1000);
    const userId = `user_${phoneNumber}`;
    const token = `token_${phoneNumber}_${Date.now()}`;

    // 保存登录状态
    await AsyncStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ userId, token, phoneNumber }),
    );

    return { userId, token };
  },

  /**
   * 获取当前登录态
   */
  getCurrentUser: async (): Promise<{
    userId: string;
    phoneNumber: string;
  } | null> => {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  /**
   * 退出登录
   */
  logout: async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
  },
};
