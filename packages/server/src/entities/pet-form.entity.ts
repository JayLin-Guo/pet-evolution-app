import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PetSpecies } from './pet-species.entity';
import { Pet } from './pet.entity';

@Entity('pet_forms')
export class PetForm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '物种ID' })
  species_id: number;

  @Column({ type: 'int', comment: '分组内的排序序号 (从1开始)' })
  rank_order: number;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '资源文件夹名称 (e.g. mon_acorn_girl_01)',
  })
  resource_folder: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: '可用的动画动作列表',
  })
  available_animations: string[];

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @ManyToOne(() => PetSpecies, (species) => species.forms)
  @JoinColumn({ name: 'species_id' })
  species: PetSpecies;

  @OneToMany(() => Pet, (pet) => pet.currentForm)
  pets: Pet[];
}
