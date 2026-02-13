import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEggsController } from './pet-eggs.controller';
import { PetEggsService } from './pet-eggs.service';
// PetEgg removed
import { PetSpecies } from '../entities/pet-species.entity';
import { PetForm } from '../entities/pet-form.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PetSpecies, PetForm])],
  controllers: [PetEggsController],
  providers: [PetEggsService],
  exports: [PetEggsService],
})
export class PetEggsModule {}
