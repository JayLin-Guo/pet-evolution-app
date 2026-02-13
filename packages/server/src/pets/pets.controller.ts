import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdoptPetDto } from './dto/adopt-pet.dto';
import { PetResponseDto } from './dto/pet-response.dto';

/**
 * 宠物相关接口控制器
 *
 * 路由前缀：`/api/pets`
 * 所有接口需要通过 AuthGuard 校验
 */
@Controller('api/pets')
@UseGuards(AuthGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  /**
   * 领养宠物（确认契约）
   * POST /api/pets/adopt
   * Body: { name: string, species_id: number }
   */
  @Post('adopt')
  async adopt(
    @Request() req: { user: { userId: number } },
    @Body() adoptDto: AdoptPetDto,
  ): Promise<PetResponseDto> {
    return this.petsService.adopt(req.user.userId, adoptDto);
  }

  /**
   * 获取当前用户的宠物信息
   * GET /api/pets
   */
  @Get()
  async getMyPet(
    @Request() req: { user: { userId: number } },
  ): Promise<PetResponseDto | null> {
    return this.petsService.findByUserId(req.user.userId);
  }
}
