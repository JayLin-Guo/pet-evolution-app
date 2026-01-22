import { PetEggQuality } from '../../entities/pet-egg.entity';

export class PetEggResponseDto {
  id: number;
  name: string;
  description: string;
  quality: PetEggQuality;
  resource_path: string;
  spine_path: string;
  initial_stage: string;
  draw_probability: number;
  growth_config: Record<string, any>;
}

export class DrawPetEggResponseDto {
  petEgg: PetEggResponseDto;
}

