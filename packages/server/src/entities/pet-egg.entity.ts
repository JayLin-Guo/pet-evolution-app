import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Pet } from './pet.entity';

export enum PetEggQuality {
  NORMAL = 'normal', // 普通
  PREMIUM = 'premium', // 精品
  LEGENDARY = 'legendary', // 传说
}

@Entity('pet_eggs')
export class PetEgg {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '宠物蛋名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({
    type: 'enum',
    enum: PetEggQuality,
    default: PetEggQuality.NORMAL,
    comment: '品质',
  })
  @Index('idx_quality')
  quality: PetEggQuality;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '资源路径（对应nginx static路径）',
  })
  resource_path: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Spine动画资源路径',
  })
  spine_path: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'baby',
    comment: '初始阶段（精品直接进入child阶段）',
  })
  initial_stage: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '抽取概率（0-100）',
  })
  draw_probability: number;

  @Column({
    type: 'json',
    nullable: true,
    comment: '成长配置（存储各阶段的成长时间等）',
  })
  growth_config: Record<string, any>;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  @Index('idx_is_active')
  is_active: boolean;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @OneToMany(() => Pet, (pet) => pet.petEgg)
  pets: Pet[];
}
