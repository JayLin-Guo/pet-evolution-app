export enum PetEggQuality {
  NORMAL = 'normal',
  PREMIUM = 'premium',
  LEGENDARY = 'legendary',
}

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
  species_id?: number;
}

export class DrawPetEggResponseDto {
  petEgg: PetEggResponseDto;
}
