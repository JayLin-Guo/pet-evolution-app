import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';
import { PetSpecies } from '../entities/pet-species.entity';
import { PetForm } from '../entities/pet-form.entity';
import { AdoptPetDto } from './dto/adopt-pet.dto';
import { PetResponseDto } from './dto/pet-response.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(PetSpecies)
    private petSpeciesRepository: Repository<PetSpecies>,
    @InjectRepository(PetForm)
    private petFormRepository: Repository<PetForm>,
  ) {}

  /**
   * 领养宠物（确认契约）
   * - 如果用户已有宠物，先删除再重新创建（方便开发测试）
   * - 绑定用户（手机号）、物种、初始形态
   * - 所有属性初始为 0
   */
  async adopt(userId: number, adoptDto: AdoptPetDto): Promise<PetResponseDto> {
    const { name, species_id } = adoptDto;

    // 1. 清理旧数据（开发阶段，允许重复领养）
    const existingPet = await this.petRepository.findOne({
      where: { user_id: userId },
    });
    if (existingPet) {
      await this.petRepository.delete({ user_id: userId });
    }

    // 2. 验证物种
    if (!species_id) {
      throw new BadRequestException('必须指定物种ID (species_id)');
    }
    const species = await this.petSpeciesRepository.findOne({
      where: { id: species_id },
    });
    if (!species) {
      throw new NotFoundException('指定的物种不存在');
    }

    // 3. 获取初始形态 (Rank 1)
    const initialForm = await this.petFormRepository.findOne({
      where: { species_id: species.id, rank_order: 1 },
    });
    if (!initialForm) {
      throw new NotFoundException(`物种 [${species.name}] 缺少初始形态配置`);
    }

    // 4. 创建宠物
    const pet = new Pet();
    pet.user_id = userId;
    pet.name = name;
    pet.species = species;
    pet.currentForm = initialForm;
    pet.cultivation_exp = 0;
    pet.cultivation_level = '幼胎境';
    pet.hunger = 0;
    pet.happiness = 0;
    pet.health = 0;
    pet.intimacy = 0;

    await this.petRepository.save(pet);

    return this.toResponseDto(pet);
  }

  /**
   * 获取当前用户的宠物
   */
  async findByUserId(userId: number): Promise<PetResponseDto | null> {
    const pet = await this.petRepository.findOne({
      where: { user_id: userId },
      relations: ['species', 'currentForm'],
    });

    if (!pet) {
      return null;
    }

    return this.toResponseDto(pet);
  }

  /**
   * DTO 转换
   */
  private toResponseDto(pet: Pet): PetResponseDto {
    return {
      id: pet.id,
      user_id: pet.user_id,
      name: pet.name,
      species_id: pet.species?.id,
      species_name: pet.species?.name,
      current_form_id: pet.currentForm?.id,
      resource_folder: pet.currentForm?.resource_folder,
      available_animations: pet.currentForm?.available_animations,
      cultivation_exp: pet.cultivation_exp,
      cultivation_level: pet.cultivation_level,
      hunger: pet.hunger,
      happiness: pet.happiness,
      health: pet.health,
      intimacy: pet.intimacy,
      created_at: pet.created_at,
      updated_at: pet.updated_at,
    };
  }
}
