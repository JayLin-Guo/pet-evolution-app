import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEggsController } from './pet-eggs.controller';
import { PetEggsService } from './pet-eggs.service';
import { PetEgg } from '../entities/pet-egg.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PetEgg])],
  controllers: [PetEggsController],
  providers: [PetEggsService],
  exports: [PetEggsService],
})
export class PetEggsModule {}

