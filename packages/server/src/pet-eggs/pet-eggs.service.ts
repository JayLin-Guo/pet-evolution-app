import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PetEggResponseDto,
  DrawPetEggResponseDto,
  PetEggQuality,
} from './dto/pet-egg.dto';
import { PetSpecies } from '../entities/pet-species.entity';

@Injectable()
export class PetEggsService {
  constructor(
    @InjectRepository(PetSpecies)
    private petSpeciesRepository: Repository<PetSpecies>,
  ) {}

  /**
   * 获取所有可抽取的宠物蛋列表 (Empty since PetEgg table is removed)
   */
  async findAll(): Promise<PetEggResponseDto[]> {
    return [];
  }

  /**
   * 随机抽取：从 pet_species 表中随机抽取一个物种
   */
  async draw(): Promise<DrawPetEggResponseDto> {
    // 1. 获取所有物种
    const speciesList = await this.petSpeciesRepository.find({
      relations: ['forms'],
    });

    if (speciesList.length === 0) {
      throw new Error('No species defined in system.');
    }

    // 2. 随机抽取一个物种
    const randomIndex = Math.floor(Math.random() * speciesList.length);
    const selectedSpecies = speciesList[randomIndex];

    // 3. 找到该物种的终极形态 (Rank最大)
    let resourcePath = selectedSpecies.folder_prefix;
    if (selectedSpecies.forms && selectedSpecies.forms.length > 0) {
      const ultimateForm = selectedSpecies.forms.sort(
        (a, b) => b.rank_order - a.rank_order,
      )[0];
      resourcePath = ultimateForm.resource_folder;
    }

    // 4. 构造返回结构 (Virtual Egg)
    return {
      petEgg: {
        id: 0, // 虚拟ID
        species_id: selectedSpecies.id,
        name: selectedSpecies.name,
        description: `恭喜获得一只${selectedSpecies.name}！`,
        quality: PetEggQuality.LEGENDARY,
        resource_path: resourcePath,
        spine_path: resourcePath,
        initial_stage: 'baby',
        draw_probability: 0,
        growth_config: {},
      },
    };
  }

  async findOne(id: number): Promise<any> {
    return null;
  }
}
