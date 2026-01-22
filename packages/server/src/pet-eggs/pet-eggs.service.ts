import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetEgg, PetEggQuality } from '../entities/pet-egg.entity';
import { PetEggResponseDto, DrawPetEggResponseDto } from './dto/pet-egg.dto';

/**
 * 目前还没有完整的宠物蛋资源管理系统，
 * 为了打通整体领养流程，这里先内置一颗“写死”的默认宠物蛋。
 * 后续只需要在后台维护 pet_eggs 表，即可平滑替换掉这段逻辑。
 */
const DEFAULT_PET_EGG_CONFIG: Omit<
  PetEgg,
  'id' | 'created_at' | 'updated_at' | 'pets'
> = {
  name: '初始宠物蛋',
  description: '一颗神秘的初始宠物蛋，目前所有用户都会抽到它。',
  quality: PetEggQuality.PREMIUM,
  // 可以根据实际 nginx 静态资源调整
  resource_path: '/mon_earth_dragon_01_v38',
  spine_path: '/mon_earth_dragon_01_v38/mon_earth_dragon_01',
  // 新宠物从 baby（幼兽期）阶段开始
  initial_stage: 'baby',
  draw_probability: 100,
  growth_config: {},
  is_active: true,
};

@Injectable()
export class PetEggsService {
  constructor(
    @InjectRepository(PetEgg)
    private petEggRepository: Repository<PetEgg>,
  ) {}

  /**
   * 如果当前没有任何宠物蛋数据，自动创建一条默认记录，
   * 保证抽蛋/领养流程在没有后台配置的情况下也能跑通。
   */
  private async ensureDefaultPetEgg(): Promise<PetEgg> {
    let egg = await this.petEggRepository.findOne({
      where: { is_active: true },
      order: { id: 'ASC' },
    });

    if (!egg) {
      egg = this.petEggRepository.create(DEFAULT_PET_EGG_CONFIG);
      egg = await this.petEggRepository.save(egg);
    }

    return egg;
  }

  /**
   * 获取所有可抽取的宠物蛋列表
   */
  async findAll(): Promise<PetEggResponseDto[]> {
    // 确保至少有一颗默认宠物蛋
    await this.ensureDefaultPetEgg();

    const petEggs = await this.petEggRepository.find({
      where: { is_active: true },
      order: { draw_probability: 'DESC' },
    });

    return petEggs.map((egg) => this.toResponseDto(egg));
  }

  /**
   * 随机抽取宠物蛋
   * 根据抽取概率进行加权随机
   */
  async draw(): Promise<DrawPetEggResponseDto> {
    // 确保至少有一颗默认宠物蛋
    await this.ensureDefaultPetEgg();

    const petEggs = await this.petEggRepository.find({
      where: { is_active: true },
    });

    if (petEggs.length === 0) {
      throw new Error('没有可抽取的宠物蛋');
    }

    // 计算总概率
    const totalProbability = petEggs.reduce(
      (sum, egg) => sum + Number(egg.draw_probability),
      0,
    );

    // 生成随机数
    let random = Math.random() * totalProbability;

    // 根据概率选择宠物蛋
    let selectedEgg: PetEgg | null = null;
    for (const egg of petEggs) {
      random -= Number(egg.draw_probability);
      if (random <= 0) {
        selectedEgg = egg;
        break;
      }
    }

    // 如果随机数没有选中任何蛋（边界情况），选择第一个
    if (!selectedEgg) {
      selectedEgg = petEggs[0];
    }

    return {
      petEgg: this.toResponseDto(selectedEgg),
    };
  }

  /**
   * 根据ID获取宠物蛋
   */
  async findOne(id: number): Promise<PetEgg | null> {
    return this.petEggRepository.findOne({
      where: { id, is_active: true },
    });
  }

  /**
   * 转换为响应DTO
   */
  private toResponseDto(egg: PetEgg): PetEggResponseDto {
    return {
      id: egg.id,
      name: egg.name,
      description: egg.description,
      quality: egg.quality,
      resource_path: egg.resource_path,
      spine_path: egg.spine_path,
      initial_stage: egg.initial_stage,
      draw_probability: Number(egg.draw_probability),
      growth_config: egg.growth_config || {},
    };
  }
}
