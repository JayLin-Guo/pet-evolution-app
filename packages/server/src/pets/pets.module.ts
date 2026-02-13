import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { AuthModule } from '../auth/auth.module';
import { Pet } from '../entities/pet.entity';
import { PetSpecies } from '../entities/pet-species.entity';
import { PetForm } from '../entities/pet-form.entity';

/**
 * 宠物核心模块
 *
 * 负责：
 * - 领养（确认契约）
 * - 查询宠物信息
 */
@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Pet, PetSpecies, PetForm])],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
