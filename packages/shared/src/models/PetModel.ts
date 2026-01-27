/**
 * 成长阶段枚举
 */
export enum GrowthStage {
  /** 幼兽期 */
  BABY = "baby",
  /** 成长期 */
  CHILD = "child",
  /** 青年期 */
  TEEN = "teen",
  /** 成年期 */
  ADULT = "adult",
  /** 壮年期 */
  PRIME = "prime",
  /** 巅峰期 */
  PEAK = "peak",
}

/**
 * 终极形态枚举
 */
export enum UltimateForm {
  /** 威武神龙 */
  DRAGON = "dragon",
  /** 饕餮 */
  TAOTIE = "taotie",
  /** 天使兽 */
  ANGEL = "angel",
  /** 凤凰 */
  PHOENIX = "phoenix",
  /** 麒麟 */
  QILIN = "qilin",
}

/**
 * 宠物动画枚举
 */
export enum PetAnimation {
  /** 默认站立/呼吸 */
  IDLE = "idle1",
  /** 闲置动作变体 (更生动) */
  IDLE2 = "idle2",
  /** 行走 */
  WALK = "walk",
  /** 奔跑 */
  RUN = "run",
  /** 进食/喂养 */
  FEED = "eat",
  /** 玩耍 */
  PLAY = "play",
  /** 抚摸/互动 */
  TOUCH = "touch",
  /** 对话/交流 */
  CHAT = "chat",
  /** 出场/出生动画 */
  STARTUP = "startup",
  /** 睡眠 */
  SLEEP = "sleep",
}

/**
 * 宠物基础属性
 */
export interface PetAttributes {
  /** 力量 */
  strength: number;
  /** 智力 */
  intelligence: number;
  /** 敏捷 */
  agility: number;
  /** 精神 */
  spirit: number;
  /** 魅力 */
  charm: number;
}

/**
 * 宠物核心数据模型
 */
export interface Pet {
  /** 宠物唯一ID */
  id: string;
  /** 绑定的用户唯一ID */
  ownerId: string;
  /** 宠物昵称 */
  name: string;
  /** 当前成长阶段 */
  stage: GrowthStage;
  /** 当前子阶段 (1-3) */
  subStage: number;

  /**
   * 完整的 Spine 资源基础路径 (目录 + 文件名前缀)
   * 例如: /mon_earth_dragon_01_v38/mon_earth_dragon_01
   * 后缀 .json / .atlas 会在 web-pet 侧自动拼接
   */
  spinePath?: string;

  /** 当前等级 */
  level: number;
  /** 当前经验值 */
  exp: number;
  /** 基础属性集合 */
  attributes: PetAttributes;

  /** 饥饿度 (0-100) */
  hunger: number;
  /** 心情/快乐值 (0-100) */
  happiness: number;
  /** 健康度 (0-100) */
  health: number;
  /** 亲密度 (0-100) */
  intimacy: number;

  /** 终极形态 (仅在 PEAK 阶段有效) */
  ultimateForm: UltimateForm | null;

  /** 是否有足够的口粮 */
  hasFood: boolean;
  /** 剩余玩耍次数 */
  playCount: number;
  /** 剩余抚摸次数 */
  touchCount: number;

  /** 创建时间戳 */
  createdAt: number;
  /** 最后一次互动时间戳 */
  lastInteractTime: number;
}

/**
 * 创建新宠物实例
 * @param ownerId 拥有者ID，默认为 "guest_user"
 */
export const createNewPet = (ownerId: string = "guest_user"): Pet => {
  return {
    id: `pet_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ownerId,
    name: "小宠物",
    stage: GrowthStage.BABY,
    subStage: 1,
    spinePath: "/mon_earth_dragon_01_v38/mon_earth_dragon_03",
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
    hasFood: true,
    playCount: 10,
    touchCount: 5,
    createdAt: Date.now(),
    lastInteractTime: Date.now(),
  };
};

/**
 * 获取阶段的中文显示名称
 * @param stage 成长阶段
 * @param subStage 子阶段
 */
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

/**
 * 获取终极形态的中文名称
 * @param form 终极形态枚举值
 */
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
