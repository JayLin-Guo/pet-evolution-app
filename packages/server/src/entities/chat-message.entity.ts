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
import { User } from './user.entity';

export enum MessageSender {
  USER = 'user',
  PET = 'pet',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '宠物ID' })
  @Index('idx_pet_id')
  pet_id: number;

  @Column({ type: 'int', comment: '用户ID（冗余，便于查询）' })
  @Index('idx_user_id')
  user_id: number;

  @Column({
    type: 'enum',
    enum: MessageSender,
    comment: '发送者类型',
  })
  sender: MessageSender;

  @Column({ type: 'text', comment: '消息内容' })
  message: string;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  @Index('idx_created_at')
  created_at: Date;

  @ManyToOne(() => Pet, (pet) => pet.chatMessages)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
