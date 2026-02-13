import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PetForm } from './pet-form.entity';
import { Pet } from './pet.entity';

@Entity('pet_species')
export class PetSpecies {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '物种名称 (e.g. 橡果娘)' })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '文件夹前缀 (e.g. mon_acorn_girl)',
  })
  folder_prefix: string;

  @Column({ type: 'text', nullable: true, comment: '背景故事/描述' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['metal', 'wood', 'water', 'fire', 'earth', 'none'],
    default: 'none',
    comment: '元素属性 (金木水火土)',
  })
  element: string;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @OneToMany(() => PetForm, (form) => form.species)
  forms: PetForm[];

  @OneToMany(() => Pet, (pet) => pet.species)
  pets: Pet[];
}
