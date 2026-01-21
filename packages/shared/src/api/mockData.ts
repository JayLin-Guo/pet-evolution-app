import { Pet, GrowthStage, UltimateForm } from "../models/PetModel";

/**
 * 模拟基础宠物数据
 */
export const MOCK_PET: Pet = {
  id: "mock-uuid-12345",
  ownerId: "mock-user-5566",
  name: "哈士奇(Mock)",
  stage: GrowthStage.CHILD,
  subStage: 2,
  spinePath: "/mon_earth_dragon_01_v38/mon_earth_dragon_01",
  level: 5,
  exp: 240,
  attributes: {
    strength: 25,
    intelligence: 15,
    agility: 30,
    spirit: 10,
    charm: 20,
  },
  hunger: 85,
  happiness: 90,
  health: 95,
  intimacy: 65,
  ultimateForm: null,

  hasFood: true,
  playCount: 5,
  touchCount: 3,

  createdAt: Date.now() - 86400000 * 5, // 5天前
  lastInteractTime: Date.now(),
};

/**
 * 模拟 API 延迟组件
 */
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
