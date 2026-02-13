import { request } from "./request";

/**
 * 后端 Pet 响应 DTO（与 server PetResponseDto 对应）
 */
export interface PetResponseDto {
  id: number;
  user_id: number;
  name: string;

  // 物种 & 形态
  species_id: number;
  species_name?: string;
  current_form_id: number;
  resource_folder?: string;
  available_animations?: string[];

  // 修真
  cultivation_exp: number;
  cultivation_level: string;

  // 互动属性
  hunger: number;
  happiness: number;
  health: number;
  intimacy: number;

  // 时间
  created_at: string;
  updated_at: string;
}

/**
 * 宠物相关接口
 *
 * 当前流程：注册 → 抽取 → 确认契约（领养）→ 查看宠物
 */
export const petApi = {
  /**
   * 获取当前用户的宠物信息
   * GET /api/pets
   */
  getPet: async (): Promise<PetResponseDto | null> => {
    try {
      const response = await request<PetResponseDto | null>("/api/pets");
      return response || null;
    } catch (error) {
      console.error("获取宠物信息失败:", error);
      return null;
    }
  },

  /**
   * 领养新宠物（确认契约）
   * POST /api/pets/adopt
   *
   * @param name 宠物名称
   * @param speciesId 物种ID（来自抽取结果）
   */
  adoptPet: async (
    name: string,
    speciesId: number,
  ): Promise<PetResponseDto> => {
    const response = await request<PetResponseDto>("/api/pets/adopt", {
      method: "POST",
      body: JSON.stringify({
        name,
        species_id: speciesId,
      }),
    });

    return response;
  },
};
