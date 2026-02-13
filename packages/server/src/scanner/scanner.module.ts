import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsStaticController } from './pets-static.controller';
import { PetImgsController } from './pet-imgs.controller';
import { PetsStaticService } from './pets-static.service';
import { PetScannerService } from './pet-scanner.service';
import { PetSpecies } from '../entities/pet-species.entity';
import { PetForm } from '../entities/pet-form.entity';

/**
 * 扫描 & 静态资源模块
 *
 * 负责：
 * - 扫描本地资源目录，写入 pet_species / pet_forms 表
 * - 提供 Spine 动画静态资源文件
 * - 提供宠物图片资源
 *
 * 此模块很少使用，与核心业务（领养/互动）分离
 */
@Module({
  imports: [TypeOrmModule.forFeature([PetSpecies, PetForm])],
  controllers: [PetsStaticController, PetImgsController],
  providers: [PetsStaticService, PetScannerService],
  exports: [PetScannerService],
})
export class ScannerModule {}
