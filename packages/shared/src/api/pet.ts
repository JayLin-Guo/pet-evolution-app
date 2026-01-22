import { Pet, GrowthStage } from '../models/PetModel';
import { request } from './request';

// 是否开启全量 Mock 模式 (拦截真实网络请求)
const IS_MOCK_ENV = process.env.NODE_ENV === 'development' && false; // 设置为false以使用真实API

/**
 * 后端Pet响应DTO（0-10范围）
 */
interface PetResponseDto {
  id: number;
  user_id: number;
  pet_egg_id: number;
  name: string;
  quality: string;
  stage: string;
  sub_stage: number;
  level: number;
  exp: number;
  hunger: number; // 0-10
  happiness: number; // 0-10
  health: number; // 0-10
  intimacy: number; // 0-100
  ultimate_form: string | null;
  spine_path?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 将后端Pet DTO转换为前端Pet模型（0-100范围）
 */
function transformPetDto(dto: PetResponseDto): Pet {
  // 将字符串 stage 转换为 GrowthStage 枚举
  const stageMap: Record<string, GrowthStage> = {
    'baby': GrowthStage.BABY,
    'child': GrowthStage.CHILD,
    'teen': GrowthStage.TEEN,
    'adult': GrowthStage.ADULT,
    'prime': GrowthStage.PRIME,
    'peak': GrowthStage.PEAK,
  };
  const stage = stageMap[dto.stage.toLowerCase()] || GrowthStage.BABY;

  return {
    id: dto.id.toString(),
    ownerId: dto.user_id.toString(),
    name: dto.name,
    stage: stage,
    subStage: dto.sub_stage,
    spinePath: dto.spine_path,
    level: dto.level,
    exp: dto.exp,
    attributes: {
      strength: 10,
      intelligence: 10,
      agility: 10,
      spirit: 10,
      charm: 10,
    },
    hunger: dto.hunger * 10, // 0-10 -> 0-100
    happiness: dto.happiness * 10, // 0-10 -> 0-100
    health: dto.health * 10, // 0-10 -> 0-100
    intimacy: dto.intimacy,
    ultimateForm: dto.ultimate_form as any,
    hasFood: true,
    playCount: 10,
    touchCount: 5,
    createdAt: new Date(dto.created_at).getTime(),
    lastInteractTime: new Date(dto.updated_at).getTime(),
  };
}

/**
 * 操作响应DTO
 */
interface ActionResponseDto {
  pet: PetResponseDto;
  cooldownRemaining?: number;
  message?: string;
}

/**
 * 聊天响应DTO
 */
interface ChatResponseDto {
  reply: string;
  statusUpdate?: {
    happiness?: number;
    exp?: number;
  };
}

/**
 * 宠物相关接口
 */
export const petApi = {
  /**
   * 获取当前用户的宠物信息
   */
  getPet: async (): Promise<Pet | null> => {
    if (IS_MOCK_ENV) {
      // Mock逻辑保留用于测试
      const { MOCK_PET, delay } = await import('./mockData');
      await delay(800);
      return MOCK_PET;
    }

    try {
      const response = await request<PetResponseDto | null>('/api/pets');
      return response ? transformPetDto(response) : null;
    } catch (error) {
      console.error('获取宠物信息失败:', error);
      return null;
    }
  },

  /**
   * 领养新宠物
   */
  adoptPet: async (
    petEggId: number,
    name: string,
  ): Promise<Pet> => {
    if (IS_MOCK_ENV) {
      const { MOCK_PET, delay } = await import('./mockData');
      await delay(1200);
      return { ...MOCK_PET, name, level: 1, stage: MOCK_PET.stage };
    }

    const response = await request<PetResponseDto>('/api/pets/adopt', {
      method: 'POST',
      body: JSON.stringify({ pet_egg_id: petEggId, name }),
    });

    return transformPetDto(response);
  },

  /**
   * 获取宠物详情
   */
  getPetById: async (petId: number): Promise<Pet> => {
    const response = await request<PetResponseDto>(`/api/pets/${petId}`);
    return transformPetDto(response);
  },

  /**
   * 喂食
   */
  feedPet: async (petId: number): Promise<{ pet: Pet; message?: string }> => {
    if (IS_MOCK_ENV) {
      const { MOCK_PET, delay } = await import('./mockData');
      await delay(500);
      return {
        pet: {
          ...MOCK_PET,
          hunger: Math.min(100, MOCK_PET.hunger + 30),
          exp: MOCK_PET.exp + 10,
        },
        message: '主人，我吃饱了！',
      };
    }

    const response = await request<ActionResponseDto>(
      `/api/pets/${petId}/feed`,
      {
        method: 'POST',
      },
    );

    return {
      pet: transformPetDto(response.pet),
      message: response.message,
    };
  },

  /**
   * 玩耍
   */
  playWithPet: async (petId: number): Promise<{ pet: Pet; message?: string }> => {
    if (IS_MOCK_ENV) {
      const { MOCK_PET, delay } = await import('./mockData');
      await delay(500);
      return {
        pet: {
          ...MOCK_PET,
          happiness: Math.min(100, MOCK_PET.happiness + 15),
          hunger: Math.max(0, MOCK_PET.hunger - 5),
          exp: MOCK_PET.exp + 15,
        },
        message: '主人，玩得好开心！',
      };
    }

    const response = await request<ActionResponseDto>(
      `/api/pets/${petId}/play`,
      {
        method: 'POST',
      },
    );

    return {
      pet: transformPetDto(response.pet),
      message: response.message,
    };
  },

  /**
   * 抚摸
   */
  touchPet: async (petId: number): Promise<{ pet: Pet; message?: string }> => {
    if (IS_MOCK_ENV) {
      const { MOCK_PET, delay } = await import('./mockData');
      await delay(300);
      return {
        pet: {
          ...MOCK_PET,
          intimacy: Math.min(100, MOCK_PET.intimacy + 5),
          exp: MOCK_PET.exp + 5,
        },
        message: '主人，好舒服~',
      };
    }

    const response = await request<ActionResponseDto>(
      `/api/pets/${petId}/touch`,
      {
        method: 'POST',
      },
    );

    return {
      pet: transformPetDto(response.pet),
      message: response.message,
    };
  },

  /**
   * 发送消息给宠物 (集成 AI 对话)
   */
  chatWithPet: async (
    petId: number,
    message: string,
  ): Promise<{ reply: string; statusUpdate?: Partial<Pet> }> => {
    if (IS_MOCK_ENV) {
      const { MOCK_PET, delay } = await import('./mockData');
      await delay(500);
      const replies = [
        '听起来很有趣！',
        '汪汪！你说得对！',
        '我听进去了，主人~',
      ];
      return {
        reply: replies[Math.floor(Math.random() * replies.length)],
        statusUpdate: {
          happiness: Math.min(100, MOCK_PET.happiness + 5),
          exp: 12,
        },
      };
    }

    const response = await request<ChatResponseDto>(
      `/api/pets/${petId}/chat`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      },
    );

    return {
      reply: response.reply,
      statusUpdate: response.statusUpdate
        ? {
            happiness: response.statusUpdate.happiness
              ? response.statusUpdate.happiness * 10
              : undefined,
            exp: response.statusUpdate.exp,
          }
        : undefined,
    };
  },

  /**
   * 获取聊天记录
   */
  getChatHistory: async (
    petId: number,
    limit: number = 50,
  ): Promise<Array<{ sender: 'user' | 'pet'; message: string; created_at: string }>> => {
    return request<Array<{ sender: 'user' | 'pet'; message: string; created_at: string }>>(
      `/api/pets/${petId}/chat-history?limit=${limit}`,
    );
  },
};
