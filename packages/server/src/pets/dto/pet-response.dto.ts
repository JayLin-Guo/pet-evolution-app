import { PetStage, UltimateForm } from '../../entities/pet.entity';

export class PetResponseDto {
  id: number;
  user_id: number;
  pet_egg_id: number;
  name: string;
  quality: string;
  stage: PetStage;
  sub_stage: number;
  level: number;
  exp: number;
  hunger: number;
  happiness: number;
  health: number;
  intimacy: number;
  ultimate_form: UltimateForm | null;
  spine_path?: string;
  created_at: Date;
  updated_at: Date;
}
