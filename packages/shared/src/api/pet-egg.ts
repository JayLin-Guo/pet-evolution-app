import { request } from "./request";

export interface PetEggDto {
  id: number;
  name: string;
  description: string;
  quality: "normal" | "premium" | "legendary";
  resource_path: string;
  spine_path: string;
  initial_stage: string;
  draw_probability: number;
  growth_config: Record<string, any>;
  species_id?: number;
}

export interface DrawPetEggResponse {
  petEgg: PetEggDto;
}

export const petEggApi = {
  /**
   * 获取所有可抽取的宠物蛋列表
   */
  getAll: async (): Promise<PetEggDto[]> => {
    return request<PetEggDto[]>("/api/pet-eggs");
  },

  /**
   * 随机抽取宠物蛋
   */
  draw: async (): Promise<DrawPetEggResponse> => {
    return request<DrawPetEggResponse>("/api/pet-eggs/draw", {
      method: "POST",
    });
  },
};
