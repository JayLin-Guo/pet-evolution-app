import { Pet } from "../models/PetModel";
import { request } from "./request";
import { MOCK_PET, delay } from "./mockData";

// 是否开启全量 Mock 模式 (拦截真实网络请求)
const IS_MOCK_ENV = true;

/**
 * 宠物相关接口设计
 */
export const petApi = {
  /**
   * 获取当前用户的宠物信息
   */
  getPet: async (): Promise<Pet | null> => {
    if (IS_MOCK_ENV) {
      await delay(800); // 模拟网络延迟
      // 模拟 80% 几率有宠物，20% 几率没领养（测试用）
      return Math.random() > 0.2 ? MOCK_PET : null;
    }
    return request<Pet | null>("/v1/pet");
  },

  /**
   * 领养新宠物
   */
  adoptPet: async (name: string): Promise<Pet> => {
    if (IS_MOCK_ENV) {
      await delay(1200);
      return { ...MOCK_PET, name, level: 1, stage: MOCK_PET.stage }; // 简单返回
    }
    return request<Pet>("/v1/pet/adopt", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  /**
   * 同步宠物状态
   */
  updateStatus: async (petData: Pet): Promise<Pet> => {
    if (IS_MOCK_ENV) {
      // Mock 环境下不延迟，直接返回最新态
      return petData;
    }
    return request<Pet>("/v1/pet/sync", {
      method: "PUT",
      body: JSON.stringify(petData),
    });
  },

  /**
   * 喂食
   */
  feedPet: async (foodValue: number): Promise<Pet> => {
    if (IS_MOCK_ENV) {
      await delay(500);
      return {
        ...MOCK_PET,
        hunger: Math.min(100, MOCK_PET.hunger + foodValue),
        exp: MOCK_PET.exp + 10,
      };
    }
    return request<Pet>("/v1/pet/feed", {
      method: "POST",
      body: JSON.stringify({ foodValue }),
    });
  },

  /**
   * 玩耍
   */
  playWithPet: async (): Promise<Pet> => {
    if (IS_MOCK_ENV) {
      await delay(500);
      return {
        ...MOCK_PET,
        happiness: Math.min(100, MOCK_PET.happiness + 15),
        hunger: Math.max(0, MOCK_PET.hunger - 5),
        exp: MOCK_PET.exp + 15,
      };
    }
    return request<Pet>("/v1/pet/play", { method: "POST" });
  },

  /**
   * 抚摸
   */
  touchPet: async (): Promise<Pet> => {
    if (IS_MOCK_ENV) {
      await delay(300);
      return {
        ...MOCK_PET,
        intimacy: Math.min(100, MOCK_PET.intimacy + 5),
        exp: MOCK_PET.exp + 5,
      };
    }
    return request<Pet>("/v1/pet/touch", { method: "POST" });
  },

  /**
   * 发送消息给宠物 (集成 AI 对话)
   */
  chatWithPet: async (
    message: string,
  ): Promise<{ reply: string; statusUpdate?: Partial<Pet> }> => {
    if (IS_MOCK_ENV) {
      await delay(500);
      const replies = [
        "听起来很有趣！",
        "汪汪！你说得对！",
        "我听进去了，主人~",
      ];
      return {
        reply: replies[Math.floor(Math.random() * replies.length)],
        statusUpdate: {
          happiness: Math.min(100, MOCK_PET.happiness + 5),
          exp: 12,
        },
      };
    }
    return request<{ reply: string; statusUpdate?: Partial<Pet> }>(
      "/v1/pet/chat",
      {
        method: "POST",
        body: JSON.stringify({ message }),
      },
    );
  },
};
