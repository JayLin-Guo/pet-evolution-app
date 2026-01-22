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

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 11, unique: true, comment: '手机号' })
  @Index('idx_phone', { unique: true })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '认证token',
  })
  @Index('idx_token')
  token: string;

  @Column({ type: 'datetime', nullable: true, comment: 'token过期时间' })
  token_expires_at: Date;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[];
}
