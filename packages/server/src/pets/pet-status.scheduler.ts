import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PetsService } from './pets.service';
import { ChatMessage } from '../entities/chat-message.entity';

/**
 * 宠物状态定时任务
 *
 * - 每 10 分钟轮询所有宠物，按照策划规则衰减/增长属性
 * - 每天凌晨 2 点清理一周前的聊天记录，防止表无限增长
 */
@Injectable()
export class PetStatusScheduler {
  private readonly logger = new Logger(PetStatusScheduler.name);

  constructor(
    private petsService: PetsService,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
  ) {}

  /**
   * 每10分钟更新一次宠物状态
   */
  @Cron('*/10 * * * *')
  async updatePetStatus() {
    this.logger.log('开始更新宠物状态...');

    try {
      const pets = await this.petsService.findAllPetsForStatusUpdate();

      for (const pet of pets) {
        await this.petsService.updatePetStatus(pet);
      }

      this.logger.log(`成功更新 ${pets.length} 只宠物的状态`);
    } catch (error) {
      this.logger.error('更新宠物状态失败', error);
    }
  }

  /**
   * 每天凌晨2点清理一周前的聊天记录
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanOldChatMessages() {
    this.logger.log('开始清理过期聊天记录...');

    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const result = await this.chatMessageRepository.delete({
        created_at: LessThan(oneWeekAgo),
      });

      this.logger.log(`成功清理 ${result.affected || 0} 条过期聊天记录`);
    } catch (error) {
      this.logger.error('清理聊天记录失败', error);
    }
  }
}
