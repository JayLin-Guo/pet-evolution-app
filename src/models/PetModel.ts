// 成长阶段枚举
export enum GrowthStage {
  BABY = 'baby',
  CHILD = 'child',
  TEEN = 'teen',
  ADULT = 'adult',
  PRIME = 'prime',
  PEAK = 'peak'
}

// 终极形态枚举
export enum UltimateForm {
  DRAGON = 'dragon',
  TAOTIE = 'taotie',
  ANGEL = 'angel',
  PHOENIX = 'phoenix',
  QILIN = 'qilin'
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
  name: string;
  stage: GrowthStage;
  subStage: number;
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

// 创建新宠物
export const createNewPet = (): Pet => ({
  id: Date.now().toString(),
  name: '小宠物',
  stage: GrowthStage.BABY,
  subStage: 1,
  level: 1,
  exp: 0,
  attributes: {
    strength: 10,
    intelligence: 10,
    agility: 10,
    spirit: 10,
    charm: 10
  },
  hunger: 80,
  happiness: 80,
  health: 100,
  intimacy: 0,
  ultimateForm: null,
  createdAt: Date.now(),
  lastInteractTime: Date.now()
});

// 获取阶段名称
export const getStageName = (stage: GrowthStage, subStage: number): string => {
  const stageNames = {
    [GrowthStage.BABY]: '幼兽期',
    [GrowthStage.CHILD]: '成长期',
    [GrowthStage.TEEN]: '青年期',
    [GrowthStage.ADULT]: '成年期',
    [GrowthStage.PRIME]: '壮年期',
    [GrowthStage.PEAK]: '巅峰期'
  };
  return `${stageNames[stage]} - 阶段${subStage}`;
};

// 获取终极形态名称
export const getUltimateFormName = (form: UltimateForm): string => {
  const formNames = {
    [UltimateForm.DRAGON]: '威武神龙',
    [UltimateForm.TAOTIE]: '饕餮',
    [UltimateForm.ANGEL]: '天使兽',
    [UltimateForm.PHOENIX]: '凤凰',
    [UltimateForm.QILIN]: '麒麟'
  };
  return formNames[form];
};
