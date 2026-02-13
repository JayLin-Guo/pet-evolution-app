import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PetSpecies } from '../entities/pet-species.entity';
import { PetForm } from '../entities/pet-form.entity';

@Injectable()
export class PetScannerService {
  private readonly logger = new Logger(PetScannerService.name);
  private readonly staticRootDir =
    process.env.STATIC_ROOT_PATH || 'D:\\petZoom\\spine-role';

  constructor(
    @InjectRepository(PetSpecies)
    private speciesRepo: Repository<PetSpecies>,
    @InjectRepository(PetForm)
    private formRepo: Repository<PetForm>,
    private entityManager: EntityManager,
  ) {}

  /**
   * 扫描并更新数据库
   */
  async scanAndSync() {
    this.logger.log(`开始扫描宠物资源目录: ${this.staticRootDir}`);

    if (!fs.existsSync(this.staticRootDir)) {
      this.logger.error(`目录不存在: ${this.staticRootDir}`);
      return { success: false, message: '目录不存在' };
    }

    const speciesMap = new Map<string, string[]>(); // prefix -> [folderName1, folderName2]

    // 1. 扫描所有一级子目录
    const items = fs.readdirSync(this.staticRootDir, { withFileTypes: true });
    for (const item of items) {
      if (!item.isDirectory()) continue;

      const folderName = item.name;
      // 解析前缀： mon_acorn_girl_01 -> mon_acorn_girl
      const match = folderName.match(/^(.+)_(\d+)$/);
      if (match) {
        const prefix = match[1];
        if (!speciesMap.has(prefix)) {
          speciesMap.set(prefix, []);
        }
        speciesMap.get(prefix)!.push(folderName);
      } else {
        if (!speciesMap.has(folderName)) {
          speciesMap.set(folderName, []);
        }
        speciesMap.get(folderName)!.push(folderName);
      }
    }

    this.logger.log(`发现 ${speciesMap.size} 个潜在物种组`);

    // 2. 遍历分组，更新数据库
    await this.entityManager.transaction(async (manager) => {
      for (const [prefix, folders] of speciesMap) {
        // (1) 处理 Species
        let species = await manager.findOne(PetSpecies, {
          where: { folder_prefix: prefix },
        });

        if (!species) {
          species = new PetSpecies();
          species.folder_prefix = prefix;
          const humanName = prefix
            .replace(/^mon_/, '')
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          species.name = humanName;
          species = await manager.save(species);
          this.logger.log(`新建物种: ${humanName} (${prefix})`);
        }

        // (2) 处理 Forms
        folders.sort((a, b) => {
          const numA = parseInt(a.match(/_(\d+)$/)?.[1] || '0', 10);
          const numB = parseInt(b.match(/_(\d+)$/)?.[1] || '0', 10);
          return numA - numB;
        });

        for (let i = 0; i < folders.length; i++) {
          const folderName = folders[i];
          const rankOrder = i + 1;

          let form = await manager.findOne(PetForm, {
            where: {
              species_id: species.id,
              rank_order: rankOrder,
            },
          });

          const existingForm = await manager.findOne(PetForm, {
            where: { resource_folder: folderName },
          });

          if (existingForm) {
            form = existingForm;
            if (
              form.species_id !== species.id ||
              form.rank_order !== rankOrder
            ) {
              form.species_id = species.id;
              form.rank_order = rankOrder;
              await manager.save(form);
            }
          } else {
            form = new PetForm();
            form.species = species;
            form.rank_order = rankOrder;
            form.resource_folder = folderName;
            form.available_animations = [];
          }

          // (3) 扫描动画文件 (.gif)
          const folderPath = path.join(this.staticRootDir, folderName);
          const animations: string[] = [];
          if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
              if (file.toLowerCase().endsWith('.gif')) {
                const animName = path.basename(file, path.extname(file));
                animations.push(animName);
              }
            }
          }

          if (
            JSON.stringify(form.available_animations) !==
            JSON.stringify(animations)
          ) {
            form.available_animations = animations;
            await manager.save(form);
            this.logger.log(
              `更新形态: ${folderName} (动画数: ${animations.length})`,
            );
          } else if (!existingForm) {
            await manager.save(form);
            this.logger.log(`新建形态: ${folderName}`);
          }
        }
      }
    });

    this.logger.log('扫描完成');
    return { success: true, count: speciesMap.size };
  }
}
