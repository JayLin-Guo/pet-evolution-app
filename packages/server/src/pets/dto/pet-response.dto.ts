export class PetResponseDto {
  id: number;
  user_id: number;
  name: string;

  // 物种 & 形态
  species_id: number;
  species_name?: string;
  current_form_id: number;
  resource_folder?: string;
  available_animations?: string[];

  // 修真
  cultivation_exp: number;
  cultivation_level: string;

  // 互动属性
  hunger: number;
  happiness: number;
  health: number;
  intimacy: number;

  // 时间
  created_at: Date;
  updated_at: Date;
}
