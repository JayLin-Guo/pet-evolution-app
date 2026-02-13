import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PetSpecies } from './pet-species.entity';
import { PetForm } from './pet-form.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  @Index('idx_user_id')
  user_id: number;

  @Column({ type: 'int', comment: '物种ID', nullable: true })
  @Index('idx_species_id')
  species_id: number;

  @Column({ type: 'int', comment: '当前形态ID', nullable: true })
  @Index('idx_current_form_id')
  current_form_id: number;

  @Column({ type: 'varchar', length: 50, comment: '宠物名称' })
  name: string;

  // --- 修真体系 ---

  @Column({
    type: 'bigint',
    default: 0,
    comment: '修真经验值 (Total EXP)',
  })
  cultivation_exp: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: '幼胎境',
    comment: '当前境界称号',
  })
  cultivation_level: string;

  // --- 互动属性 ---

  @Column({ type: 'int', default: 0, comment: '饥饿值 (0-10)' })
  hunger: number;

  @Column({ type: 'int', default: 0, comment: '快乐值 (0-10)' })
  happiness: number;

  @Column({ type: 'int', default: 0, comment: '健康值 (0-10)' })
  health: number;

  @Column({ type: 'int', default: 0, comment: '亲密度 (0-100)' })
  intimacy: number;

  // --- 时间戳 ---

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  // --- 关联 ---

  @ManyToOne(() => User, (user) => user.pets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PetSpecies, (species) => species.pets)
  @JoinColumn({ name: 'species_id' })
  species: PetSpecies;

  @ManyToOne(() => PetForm, (form) => form.pets)
  @JoinColumn({ name: 'current_form_id' })
  currentForm: PetForm;
}
