import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdoptPetDto } from './dto/adopt-pet.dto';
import { PetResponseDto } from './dto/pet-response.dto';
import { ActionResponseDto } from './dto/action-response.dto';
import { ChatDto, ChatResponseDto } from './dto/chat.dto';

/**
 * 宠物相关接口控制器
 *
 * 路由前缀：`/api/pets`
 * 说明：所有接口默认都需要通过 `AuthGuard` 校验，
 *       请求头中应携带 `Authorization: Bearer <token>`。
 */
@Controller('api/pets')
@UseGuards(AuthGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  /**
   * 领养宠物
   *
   * - 路由：POST `/api/pets/adopt`
   * - 需要先通过 `/api/pet-eggs/draw` 抽取到 `pet_egg_id`
   * - Body：`{ pet_egg_id, name }`
   */
  @Post('adopt')
  async adopt(
    @Request() req: { user: { userId: number } },
    @Body() adoptDto: AdoptPetDto,
  ): Promise<PetResponseDto> {
    return this.petsService.adopt(req.user.userId, adoptDto);
  }

  /**
   * 获取当前登录用户的宠物信息
   *
   * - 路由：GET `/api/pets`
   * - 如果还未领养宠物，返回 `null`（会被拦截器包装为统一格式）
   */
  @Get()
  async getMyPet(
    @Request() req: { user: { userId: number } },
  ): Promise<PetResponseDto | null> {
    return this.petsService.findByUserId(req.user.userId);
  }

  /**
   * 根据宠物 ID 获取详情
   *
   * - 路由：GET `/api/pets/:id`
   * - 只允许查询当前用户自己的宠物
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
  ): Promise<PetResponseDto> {
    return this.petsService.findOne(+id, req.user.userId);
  }

  /**
   * 喂食
   *
   * - 路由：POST `/api/pets/:id/feed`
   * - 内部包含 8 小时冷却逻辑和饥饿值上限判断
   */
  @Post(':id/feed')
  async feed(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
  ): Promise<ActionResponseDto> {
    return this.petsService.feed(+id, req.user.userId);
  }

  /**
   * 玩耍
   *
   * - 路由：POST `/api/pets/:id/play`
   * - 影响健康、经验等属性，同样有冷却限制
   */
  @Post(':id/play')
  async play(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
  ): Promise<ActionResponseDto> {
    return this.petsService.play(+id, req.user.userId);
  }

  /**
   * 抚摸
   *
   * - 路由：POST `/api/pets/:id/touch`
   * - 主要提升快乐/亲密度，有冷却限制
   */
  @Post(':id/touch')
  async touch(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
  ): Promise<ActionResponseDto> {
    return this.petsService.touch(+id, req.user.userId);
  }

  /**
   * 与宠物聊天
   *
   * - 路由：POST `/api/pets/:id/chat`
   * - Body：`{ message: string }`
   * - 返回宠物回复及可能的状态更新（快乐值/经验值）
   */
  @Post(':id/chat')
  async chat(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
    @Body() chatDto: ChatDto,
  ): Promise<ChatResponseDto> {
    return this.petsService.chat(+id, req.user.userId, chatDto.message);
  }

  /**
   * 获取聊天记录
   *
   * - 路由：GET `/api/pets/:id/chat-history?limit=50`
   * - 默认返回最近 50 条消息
   */
  @Get(':id/chat-history')
  async getChatHistory(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
    @Query('limit') limit?: string,
  ) {
    return this.petsService.getChatHistory(
      +id,
      req.user.userId,
      limit ? +limit : 50,
    );
  }
}
