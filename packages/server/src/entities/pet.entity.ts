import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PetEgg } from './pet-egg.entity';
import { ChatMessage } from './chat-message.entity';
import { PetAction } from './pet-action.entity';

export enum PetStage {
  BABY = 'baby',
  CHILD = 'child',
  TEEN = 'teen',
  ADULT = 'adult',
  PRIME = 'prime',
  PEAK = 'peak',
}

export enum UltimateForm {
  DRAGON = 'dragon',
  TAOTIE = 'taotie',
  ANGEL = 'angel',
  PHOENIX = 'phoenix',
  QILIN = 'qilin',
}

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  @Index('idx_user_id')
  user_id: number;

  @Column({ type: 'int', comment: '宠物蛋ID' })
  @Index('idx_pet_egg_id')
  pet_egg_id: number;

  @Column({ type: 'varchar', length: 50, comment: '宠物名称' })
  name: string;

  @Column({
    type: 'enum',
    enum: ['normal', 'premium', 'legendary'],
    default: 'normal',
    comment: '品质（冗余字段，便于查询）',
  })
  quality: string;

  @Column({
    type: 'enum',
    enum: PetStage,
    default: PetStage.BABY,
    comment: '当前成长阶段',
  })
  @Index('idx_stage')
  stage: PetStage;

  @Column({ type: 'int', default: 1, comment: '当前子阶段（1-3）' })
  sub_stage: number;

  @Column({ type: 'int', default: 1, comment: '等级' })
  level: number;

  @Column({ type: 'int', default: 0, comment: '经验值（初始0）' })
  exp: number;

  @Column({ type: 'int', default: 10, comment: '饥饿值（0-10，初始10）' })
  hunger: number;

  @Column({ type: 'int', default: 10, comment: '快乐值（0-10，初始10）' })
  happiness: number;

  @Column({ type: 'int', default: 10, comment: '健康值（0-10，初始10）' })
  health: number;

  @Column({ type: 'int', default: 0, comment: '亲密度（0-100）' })
  intimacy: number;

  @Column({
    type: 'enum',
    enum: UltimateForm,
    nullable: true,
    comment: '终极形态（仅在PEAK阶段有效）',
  })
  ultimate_form: UltimateForm | null;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '上次饥饿值减少时间（用于计算3小时间隔）',
  })
  last_hunger_decrease_at: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '上次快乐值减少时间（用于计算2小时间隔）',
  })
  last_happiness_decrease_at: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '上次经验值增长时间（用于计算3小时间隔）',
  })
  last_exp_increase_at: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '上次喂食时间（用于8小时冷却判断）',
  })
  last_feed_at: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '上次玩耍时间（用于8小时冷却判断）',
  })
  last_play_at: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '上次抚摸时间（用于8小时冷却判断）',
  })
  last_touch_at: Date;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.pets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PetEgg, (petEgg) => petEgg.pets)
  @JoinColumn({ name: 'pet_egg_id' })
  petEgg: PetEgg;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.pet)
  chatMessages!: ChatMessage[];

  @OneToMany(() => PetAction, (petAction) => petAction.pet)
  actions!: PetAction[];
}
