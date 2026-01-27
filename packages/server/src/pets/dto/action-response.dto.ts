import { PetResponseDto } from './pet-response.dto';

export class ActionResponseDto {
  pet: PetResponseDto;
  cooldownRemaining?: number; // 剩余冷却时间（秒）
  message?: string; // 提示信息
}
