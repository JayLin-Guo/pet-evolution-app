import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet, PetStage } from '../entities/pet.entity';
import { PetEgg } from '../entities/pet-egg.entity';
import { ChatMessage, MessageSender } from '../entities/chat-message.entity';
import { PetAction, ActionType } from '../entities/pet-action.entity';
import { AdoptPetDto } from './dto/adopt-pet.dto';
import { PetResponseDto } from './dto/pet-response.dto';
import { ActionResponseDto } from './dto/action-response.dto';
import { ChatResponseDto } from './dto/chat.dto';

const COOLDOWN_HOURS = 8; // 操作冷却时间（小时）
const ACTION_VALUE = 3; // 每次操作增加值
const MAX_VALUE = 10; // 属性上限

/**
 * 宠物领域服务
 *
 * 负责：
 * - 宠物领养 / 查询 / 状态更新
 * - 喂食 / 玩耍 / 抚摸等互动逻辑（包含冷却、上限判定）
 * - 聊天记录及 AI 对话结果落库
 * - 定时任务调用的属性衰减 / 经验增长规则
 */
@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(PetEgg)
    private petEggRepository: Repository<PetEgg>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(PetAction)
    private petActionRepository: Repository<PetAction>,
  ) {}

  /**
   * 领养宠物
   */
  async adopt(userId: number, adoptDto: AdoptPetDto): Promise<PetResponseDto> {
    const { pet_egg_id, name } = adoptDto;

    // 检查用户是否已有宠物
    const existingPet = await this.petRepository.findOne({
      where: { user_id: userId },
    });

    if (existingPet) {
      throw new BadRequestException('您已经拥有宠物了');
    }

    // 获取宠物蛋信息
    const petEgg = await this.petEggRepository.findOne({
      where: { id: pet_egg_id, is_active: true },
    });

    if (!petEgg) {
      throw new NotFoundException('宠物蛋不存在或已禁用');
    }

    // 创建宠物
    const pet = this.petRepository.create({
      user_id: userId,
      pet_egg_id: pet_egg_id,
      name,
      quality: petEgg.quality,
      stage: petEgg.initial_stage as PetStage,
      sub_stage: 1,
      level: 1,
      exp: 0,
      hunger: 10,
      happiness: 10,
      health: 10,
      intimacy: 0,
      ultimate_form: null,
    });

    await this.petRepository.save(pet);

    return this.toResponseDto(pet, petEgg);
  }

  /**
   * 获取宠物详情
   */
  async findOne(id: number, userId: number): Promise<PetResponseDto> {
    const pet = await this.petRepository.findOne({
      where: { id, user_id: userId },
      relations: ['petEgg'],
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    return this.toResponseDto(pet, pet.petEgg);
  }

  /**
   * 获取用户的宠物
   */
  async findByUserId(userId: number): Promise<PetResponseDto | null> {
    const pet = await this.petRepository.findOne({
      where: { user_id: userId },
      relations: ['petEgg'],
    });

    if (!pet) {
      return null;
    }

    return this.toResponseDto(pet, pet.petEgg);
  }

  /**
   * 检查操作冷却时间
   */
  private checkCooldown(lastActionTime: Date | null): number | null {
    if (!lastActionTime) {
      return null;
    }

    const now = new Date();
    const diffMs = now.getTime() - lastActionTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < COOLDOWN_HOURS) {
      const remainingSeconds = Math.ceil((COOLDOWN_HOURS - diffHours) * 3600);
      return remainingSeconds;
    }

    return null;
  }

  /**
   * 喂食
   */
  async feed(id: number, userId: number): Promise<ActionResponseDto> {
    const pet = await this.petRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    // 检查冷却时间
    const cooldown = this.checkCooldown(pet.last_feed_at);
    if (cooldown !== null) {
      return {
        pet: await this.findOne(id, userId),
        cooldownRemaining: cooldown,
        message: '主人，你精力好旺盛',
      };
    }

    // 检查是否已达到上限
    if (pet.hunger >= MAX_VALUE) {
      return {
        pet: await this.findOne(id, userId),
        message: '宠物已经吃饱了',
      };
    }

    // 记录操作前状态
    const beforeHunger = pet.hunger;
    const beforeHappiness = pet.happiness;
    const beforeHealth = pet.health;

    // 更新属性
    pet.hunger = Math.min(MAX_VALUE, pet.hunger + ACTION_VALUE);
    pet.last_feed_at = new Date();

    // 记录操作
    await this.petActionRepository.save({
      pet_id: pet.id,
      action_type: ActionType.FEED,
      action_value: ACTION_VALUE,
      before_hunger: beforeHunger,
      after_hunger: pet.hunger,
      before_happiness: beforeHappiness,
      after_happiness: pet.happiness,
      before_health: beforeHealth,
      after_health: pet.health,
    });

    await this.petRepository.save(pet);

    return {
      pet: await this.findOne(id, userId),
    };
  }

  /**
   * 玩耍
   */
  async play(id: number, userId: number): Promise<ActionResponseDto> {
    const pet = await this.petRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    // 检查冷却时间
    const cooldown = this.checkCooldown(pet.last_play_at);
    if (cooldown !== null) {
      return {
        pet: await this.findOne(id, userId),
        cooldownRemaining: cooldown,
        message: '主人，你精力好旺盛',
      };
    }

    // 检查是否已达到上限
    if (pet.health >= MAX_VALUE) {
      return {
        pet: await this.findOne(id, userId),
        message: '宠物已经很健康了',
      };
    }

    // 记录操作前状态
    const beforeHunger = pet.hunger;
    const beforeHappiness = pet.happiness;
    const beforeHealth = pet.health;

    // 更新属性
    pet.health = Math.min(MAX_VALUE, pet.health + ACTION_VALUE);
    pet.last_play_at = new Date();

    // 记录操作
    await this.petActionRepository.save({
      pet_id: pet.id,
      action_type: ActionType.PLAY,
      action_value: ACTION_VALUE,
      before_hunger: beforeHunger,
      after_hunger: pet.hunger,
      before_happiness: beforeHappiness,
      after_happiness: pet.happiness,
      before_health: beforeHealth,
      after_health: pet.health,
    });

    await this.petRepository.save(pet);

    return {
      pet: await this.findOne(id, userId),
    };
  }

  /**
   * 抚摸
   */
  async touch(id: number, userId: number): Promise<ActionResponseDto> {
    const pet = await this.petRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    // 检查冷却时间
    const cooldown = this.checkCooldown(pet.last_touch_at);
    if (cooldown !== null) {
      return {
        pet: await this.findOne(id, userId),
        cooldownRemaining: cooldown,
        message: '主人，你精力好旺盛',
      };
    }

    // 检查是否已达到上限
    if (pet.happiness >= MAX_VALUE) {
      return {
        pet: await this.findOne(id, userId),
        message: '宠物已经很开心了',
      };
    }

    // 记录操作前状态
    const beforeHunger = pet.hunger;
    const beforeHappiness = pet.happiness;
    const beforeHealth = pet.health;

    // 更新属性
    pet.happiness = Math.min(MAX_VALUE, pet.happiness + ACTION_VALUE);
    pet.last_touch_at = new Date();

    // 记录操作
    await this.petActionRepository.save({
      pet_id: pet.id,
      action_type: ActionType.TOUCH,
      action_value: ACTION_VALUE,
      before_hunger: beforeHunger,
      after_hunger: pet.hunger,
      before_happiness: beforeHappiness,
      after_happiness: pet.happiness,
      before_health: beforeHealth,
      after_health: pet.health,
    });

    await this.petRepository.save(pet);

    return {
      pet: await this.findOne(id, userId),
    };
  }

  /**
   * 与宠物对话
   */
  async chat(
    id: number,
    userId: number,
    message: string,
  ): Promise<ChatResponseDto> {
    const pet = await this.petRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    // 保存用户消息
    await this.chatMessageRepository.save({
      pet_id: pet.id,
      user_id: userId,
      sender: MessageSender.USER,
      message,
    });

    // 生成宠物回复（这里可以集成AI服务）
    const reply = this.generatePetReply(message, pet);

    // 保存宠物回复
    await this.chatMessageRepository.save({
      pet_id: pet.id,
      user_id: userId,
      sender: MessageSender.PET,
      message: reply,
    });

    // 对话可能增加快乐值和经验值
    const happinessIncrease = Math.floor(Math.random() * 3) + 1; // 1-3
    const expIncrease = Math.floor(Math.random() * 5) + 5; // 5-9

    pet.happiness = Math.min(MAX_VALUE, pet.happiness + happinessIncrease);
    pet.exp += expIncrease;

    await this.petRepository.save(pet);

    return {
      reply,
      statusUpdate: {
        happiness: pet.happiness,
        exp: pet.exp,
      },
    };
  }

  /**
   * 获取聊天记录
   */
  async getChatHistory(
    id: number,
    userId: number,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    const pet = await this.petRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    return this.chatMessageRepository.find({
      where: { pet_id: id, user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * 更新宠物状态（定时任务调用）
   */
  async updatePetStatus(pet: Pet): Promise<void> {
    const now = new Date();
    let updated = false;

    // 1. 饥饿值减少：每3小时检查一次，如果饥饿>0则-1，直到0
    // 当饥饿值达到10后，每3小时减少1点，持续减少直到0
    if (pet.hunger > 0) {
      const lastDecrease = pet.last_hunger_decrease_at || pet.created_at;
      const hoursSinceLastDecrease =
        (now.getTime() - lastDecrease.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastDecrease >= 3) {
        pet.hunger = Math.max(0, pet.hunger - 1);
        pet.last_hunger_decrease_at = now;
        updated = true;
      }
    }

    // 2. 快乐值减少：每2小时检查一次，如果饥饿<7则-1快乐
    if (pet.hunger < 7) {
      const lastDecrease = pet.last_happiness_decrease_at || pet.created_at;
      const hoursSinceLastDecrease =
        (now.getTime() - lastDecrease.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastDecrease >= 2) {
        pet.happiness = Math.max(0, pet.happiness - 1);
        pet.last_happiness_decrease_at = now;
        updated = true;
      }
    }

    // 3. 健康值减少：当饥饿<5时，健康值应该根据饥饿值计算
    // 健康值 = 10 - (5 - 饥饿值)，最低为1
    if (pet.hunger < 5) {
      const expectedHealth = Math.max(1, 10 - (5 - pet.hunger));
      if (pet.health > expectedHealth) {
        pet.health = expectedHealth;
        updated = true;
      }
    }

    // 4. 经验值增长：每3小时检查一次
    const lastExpIncrease = pet.last_exp_increase_at || pet.created_at;
    const hoursSinceLastExpIncrease =
      (now.getTime() - lastExpIncrease.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastExpIncrease >= 3) {
      if (pet.hunger >= 9) {
        pet.exp += 2;
      } else if (pet.hunger >= 7) {
        pet.exp += 1;
      }
      // 饥饿<7时不增长经验
      pet.last_exp_increase_at = now;
      updated = true;
    }

    if (updated) {
      await this.petRepository.save(pet);
    }
  }

  /**
   * 获取所有需要更新状态的宠物
   */
  async findAllPetsForStatusUpdate(): Promise<Pet[]> {
    return this.petRepository.find();
  }

  /**
   * 转换为响应DTO
   */
  private toResponseDto(pet: Pet, petEgg?: PetEgg): PetResponseDto {
    return {
      id: pet.id,
      user_id: pet.user_id,
      pet_egg_id: pet.pet_egg_id,
      name: pet.name,
      quality: pet.quality,
      stage: pet.stage,
      sub_stage: pet.sub_stage,
      level: pet.level,
      exp: pet.exp,
      hunger: pet.hunger,
      happiness: pet.happiness,
      health: pet.health,
      intimacy: pet.intimacy,
      ultimate_form: pet.ultimate_form,
      spine_path: petEgg?.spine_path,
      created_at: pet.created_at,
      updated_at: pet.updated_at,
    };
  }

  /**
   * 生成宠物回复（简单实现，可以后续集成AI）
   */
  private generatePetReply(message: string, pet: Pet): string {
    const replies = [
      '听起来很有趣！',
      '汪汪！你说得对！',
      '我听进去了，主人~',
      '好的，我明白了！',
      '主人对我真好！',
    ];

    // 根据宠物状态调整回复
    if (pet.hunger < 5) {
      return '主人，我有点饿了...';
    }
    if (pet.happiness < 5) {
      return '主人，陪我玩一会儿吧~';
    }
    if (pet.health < 5) {
      return '主人，我有点不舒服...';
    }

    return replies[Math.floor(Math.random() * replies.length)];
  }
}
