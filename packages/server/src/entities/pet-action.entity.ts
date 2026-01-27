import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from './pet.entity';

export enum ActionType {
  FEED = 'feed',
  PLAY = 'play',
  TOUCH = 'touch',
}

@Entity('pet_actions')
export class PetAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '宠物ID' })
  @Index('idx_pet_id')
  pet_id: number;

  @Column({
    type: 'enum',
    enum: ActionType,
    comment: '操作类型',
  })
  @Index('idx_action_type')
  action_type: ActionType;

  @Column({ type: 'int', default: 3, comment: '操作增加值（通常为3）' })
  action_value: number;

  @Column({ type: 'int', nullable: true, comment: '操作前饥饿值' })
  before_hunger: number;

  @Column({ type: 'int', nullable: true, comment: '操作后饥饿值' })
  after_hunger: number;

  @Column({ type: 'int', nullable: true, comment: '操作前快乐值' })
  before_happiness: number;

  @Column({ type: 'int', nullable: true, comment: '操作后快乐值' })
  after_happiness: number;

  @Column({ type: 'int', nullable: true, comment: '操作前健康值' })
  before_health: number;

  @Column({ type: 'int', nullable: true, comment: '操作后健康值' })
  after_health: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  @Index('idx_created_at')
  created_at: Date;

  @ManyToOne(() => Pet, (pet) => pet.actions)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
