import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PetStatusScheduler } from './pet-status.scheduler';
import { AuthModule } from '../auth/auth.module';
import { Pet } from '../entities/pet.entity';
import { PetEgg } from '../entities/pet-egg.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { PetAction } from '../entities/pet-action.entity';

/**
 * 宠物领域模块
 *
 * 职责：
 * - 提供宠物增删改查、互动等核心业务能力
 * - 暴露 HTTP 控制器给前端调用
 * - 注册宠物状态定时任务（饥饿、快乐、健康、经验定时更新）
 * - 依赖 AuthModule，用于基于 token 的用户鉴权
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Pet, PetEgg, ChatMessage, PetAction]),
  ],
  controllers: [PetsController],
  providers: [PetsService, PetStatusScheduler],
  exports: [PetsService],
})
export class PetsModule {}

