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

    // 在返回前先更新一次状态，确保返回最新数据
    await this.updatePetStatus(pet);

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

    // 在返回前先更新一次状态，确保返回最新数据
    await this.updatePetStatus(pet);

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

    // 记录操作前状态
    const beforeHunger = pet.hunger;
    const beforeHappiness = pet.happiness;
    const beforeHealth = pet.health;

    // 更新属性：如果已经满值，不增加但更新喂食时间
    let message: string | undefined;
    if (pet.hunger >= MAX_VALUE) {
      message = '宠物已经吃饱了';
      // 即使已满，也更新喂食时间，重置衰减时间
      pet.last_feed_at = new Date();
      pet.last_hunger_decrease_at = null;
    } else {
      // 未满时增加饥饿值
      const newHunger = Math.min(MAX_VALUE, pet.hunger + ACTION_VALUE);
      pet.hunger = newHunger;
      pet.last_feed_at = new Date();
      // 重置饥饿值减少时间，因为刚喂食，应该从这次喂食时间开始计算
      pet.last_hunger_decrease_at = null;
    }

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

    // 重新加载关联数据（petEgg）用于返回
    const updatedPet = await this.petRepository.findOne({
      where: { id, user_id: userId },
      relations: ['petEgg'],
    });

    if (!updatedPet) {
      throw new NotFoundException('宠物不存在');
    }

    // 直接返回更新后的数据，不调用updatePetStatus（因为刚操作完，状态已经是最新的）
    const result: ActionResponseDto = {
      pet: this.toResponseDto(updatedPet, updatedPet.petEgg),
    };
    if (message) {
      result.message = message;
    }
    return result;
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

    // 记录操作前状态
    const beforeHunger = pet.hunger;
    const beforeHappiness = pet.happiness;
    const beforeHealth = pet.health;

    // 更新属性：如果已经满值，不增加但更新操作时间
    let message: string | undefined;
    if (pet.health >= MAX_VALUE) {
      message = '宠物已经很健康了';
      // 即使已满，也更新操作时间
      pet.last_play_at = new Date();
    } else {
      // 未满时增加健康值
      pet.health = Math.min(MAX_VALUE, pet.health + ACTION_VALUE);
      pet.last_play_at = new Date();
    }
    // 玩耍不影响饥饿和快乐的衰减时间，所以不需要重置

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

    // 重新加载关联数据（petEgg）用于返回
    const updatedPet = await this.petRepository.findOne({
      where: { id, user_id: userId },
      relations: ['petEgg'],
    });

    if (!updatedPet) {
      throw new NotFoundException('宠物不存在');
    }

    // 直接返回更新后的数据，不调用updatePetStatus（因为刚操作完，状态已经是最新的）
    const result: ActionResponseDto = {
      pet: this.toResponseDto(updatedPet, updatedPet.petEgg),
    };
    if (message) {
      result.message = message;
    }
    return result;
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

    // 记录操作前状态
    const beforeHunger = pet.hunger;
    const beforeHappiness = pet.happiness;
    const beforeHealth = pet.health;

    // 更新属性：如果已经满值，不增加但更新操作时间
    let message: string | undefined;
    if (pet.happiness >= MAX_VALUE) {
      message = '宠物已经很开心了';
      // 即使已满，也更新操作时间，重置衰减时间
      pet.last_touch_at = new Date();
      pet.last_happiness_decrease_at = null;
    } else {
      // 未满时增加快乐值
      pet.happiness = Math.min(MAX_VALUE, pet.happiness + ACTION_VALUE);
      pet.last_touch_at = new Date();
      // 重置快乐值减少时间，因为刚抚摸，应该从这次抚摸时间开始计算
      pet.last_happiness_decrease_at = null;
    }

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

    // 重新加载关联数据（petEgg）用于返回
    const updatedPet = await this.petRepository.findOne({
      where: { id, user_id: userId },
      relations: ['petEgg'],
    });

    if (!updatedPet) {
      throw new NotFoundException('宠物不存在');
    }

    // 直接返回更新后的数据，不调用updatePetStatus（因为刚操作完，状态已经是最新的）
    const result: ActionResponseDto = {
      pet: this.toResponseDto(updatedPet, updatedPet.petEgg),
    };
    if (message) {
      result.message = message;
    }
    return result;
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
   *
   * 修复：根据最后一次操作时间计算状态衰减
   * - 饥饿值：从最后一次喂食时间开始，每3小时减少1点
   *   如果没有喂食过（last_feed_at 为 null），则从创建时间（created_at）开始计算
   * - 快乐值：从最后一次抚摸时间开始，如果饥饿<7，每2小时减少1点
   *   如果没有抚摸过（last_touch_at 为 null），则从创建时间（created_at）开始计算
   * - 健康值：根据饥饿值计算，如果饥饿<5，健康值会降低
   */
  async updatePetStatus(pet: Pet): Promise<void> {
    const now = new Date();
    let updated = false;

    // 1. 饥饿值减少：从最后一次喂食时间开始，每3小时减少1点
    // 如果没有喂食过（last_feed_at 为 null），则从创建时间开始计算
    if (pet.hunger > 0) {
      const lastFeedTime = pet.last_feed_at || pet.created_at;
      const hoursSinceLastFeed =
        (now.getTime() - lastFeedTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastFeed >= 3) {
        // 计算应该减少的点数：每3小时减1点
        const decreaseAmount = Math.floor(hoursSinceLastFeed / 3);
        const oldHunger = pet.hunger;
        pet.hunger = Math.max(0, pet.hunger - decreaseAmount);

        // 更新最后一次减少时间：最后一次喂食时间 + 实际减少的周期数 * 3小时
        const actualDecreaseCycles = Math.min(decreaseAmount, oldHunger);
        pet.last_hunger_decrease_at = new Date(
          lastFeedTime.getTime() + actualDecreaseCycles * 3 * 60 * 60 * 1000,
        );
        updated = true;
      }
    }

    // 2. 快乐值减少：如果饥饿<7，从最后一次抚摸时间开始，每2小时减少1点
    // 如果没有抚摸过（last_touch_at 为 null），则从创建时间开始计算
    if (pet.hunger < 7) {
      const lastTouchTime = pet.last_touch_at || pet.created_at;
      const hoursSinceLastTouch =
        (now.getTime() - lastTouchTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastTouch >= 2) {
        // 计算应该减少的点数：每2小时减1点
        const decreaseAmount = Math.floor(hoursSinceLastTouch / 2);
        const oldHappiness = pet.happiness;
        pet.happiness = Math.max(0, pet.happiness - decreaseAmount);

        // 更新最后一次减少时间：最后一次抚摸时间 + 实际减少的周期数 * 2小时
        const actualDecreaseCycles = Math.min(decreaseAmount, oldHappiness);
        pet.last_happiness_decrease_at = new Date(
          lastTouchTime.getTime() + actualDecreaseCycles * 2 * 60 * 60 * 1000,
        );
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

    // 4. 经验值增长：每3小时检查一次，根据当前饥饿值计算
    const lastExpIncrease = pet.last_exp_increase_at || pet.created_at;
    const hoursSinceLastExpIncrease =
      (now.getTime() - lastExpIncrease.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastExpIncrease >= 3) {
      // 计算应该增长的周期数
      const increaseCycles = Math.floor(hoursSinceLastExpIncrease / 3);

      // 根据每个周期的饥饿值计算经验增长
      // 为了简化，使用当前饥饿值作为参考（实际应该回溯计算，但这里简化处理）
      for (let i = 0; i < increaseCycles; i++) {
        // 估算该周期开始时的饥饿值（当前饥饿值 + 从该周期到现在减少的饥饿值）
        const estimatedHungerAtCycle = Math.min(
          10,
          pet.hunger + (increaseCycles - i) * 1,
        );

        if (estimatedHungerAtCycle >= 9) {
          pet.exp += 2;
        } else if (estimatedHungerAtCycle >= 7) {
          pet.exp += 1;
        }
        // 饥饿<7时不增长经验
      }

      // 更新时间为：上次增长时间 + 实际增长的周期数 * 3小时
      pet.last_exp_increase_at = new Date(
        lastExpIncrease.getTime() + increaseCycles * 3 * 60 * 60 * 1000,
      );
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
