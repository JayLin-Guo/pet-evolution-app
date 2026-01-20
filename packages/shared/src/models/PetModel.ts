// 成长阶段枚举
export enum GrowthStage {
  BABY = "baby",
  CHILD = "child",
  TEEN = "teen",
  ADULT = "adult",
  PRIME = "prime",
  PEAK = "peak",
}

// 终极形态枚举
export enum UltimateForm {
  DRAGON = "dragon",
  TAOTIE = "taotie",
  ANGEL = "angel",
  PHOENIX = "phoenix",
  QILIN = "qilin",
}

// 属性类型
export interface PetAttributes {
  strength: number;
  intelligence: number;
  agility: number;
  spirit: number;
  charm: number;
}

// 宠物数据模型
export interface Pet {
  id: string;
  ownerId: string; // 绑定的用户唯一ID
  name: string;
  stage: GrowthStage;
  subStage: number;
  /**
   * 对应 Spine 静态资源目录后缀（由服务层/后端计算并下发）
   * 例如：mon_earth_dragon_01_v38
   */
  spineResourceSuffix?: string;
  level: number;
  exp: number;
  attributes: PetAttributes;
  hunger: number;
  happiness: number;
  health: number;
  intimacy: number;
  ultimateForm: UltimateForm | null;
  createdAt: number;
  lastInteractTime: number;
}

/**
 * 根据宠物当前形态/阶段计算 Spine 资源目录后缀
 * - 这里先给出一个默认映射（便于本地 mock / 过渡）
 * - 生产环境建议由服务端返回 Pet.spineResourceSuffix
 */
export const computeSpineResourceSuffix = (pet: Pick<Pet, "stage" | "subStage" | "ultimateForm">): string => {
  // TODO: 后续按 stage/subStage/ultimateForm 映射到不同资源包
  // 当前先统一走同一条龙资源，保证链路跑通
  return "mon_earth_dragon_01_v38";
};

// 创建新宠物
export const createNewPet = (ownerId: string = "guest_user"): Pet => ({
  id: `pet_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  ownerId,
  name: "小宠物",
  stage: GrowthStage.BABY,
  subStage: 1,
  spineResourceSuffix: computeSpineResourceSuffix({ stage: GrowthStage.BABY, subStage: 1, ultimateForm: null }),
  level: 1,
  exp: 0,
  attributes: {
    strength: 10,
    intelligence: 10,
    agility: 10,
    spirit: 10,
    charm: 10,
  },
  hunger: 80,
  happiness: 80,
  health: 100,
  intimacy: 0,
  ultimateForm: null,
  createdAt: Date.now(),
  lastInteractTime: Date.now(),
});

// 获取阶段名称
export const getStageName = (stage: GrowthStage, subStage: number): string => {
  const stageNames = {
    [GrowthStage.BABY]: "幼兽期",
    [GrowthStage.CHILD]: "成长期",
    [GrowthStage.TEEN]: "青年期",
    [GrowthStage.ADULT]: "成年期",
    [GrowthStage.PRIME]: "壮年期",
    [GrowthStage.PEAK]: "巅峰期",
  };
  return `${stageNames[stage]} - 阶段${subStage}`;
};

// 获取终极形态名称
export const getUltimateFormName = (form: UltimateForm): string => {
  const formNames = {
    [UltimateForm.DRAGON]: "威武神龙",
    [UltimateForm.TAOTIE]: "饕餮",
    [UltimateForm.ANGEL]: "天使兽",
    [UltimateForm.PHOENIX]: "凤凰",
    [UltimateForm.QILIN]: "麒麟",
  };
  return formNames[form];
};
