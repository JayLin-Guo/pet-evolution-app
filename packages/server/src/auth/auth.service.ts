import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { VerifyResponseDto } from './dto/verify.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 生成token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 计算token过期时间（30天）
   */
  private getTokenExpiresAt(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30天过期
    return expiresAt;
  }

  /**
   * 手机号注册/登录
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { phone } = registerDto;

    // 查找或创建用户
    let user = await this.userRepository.findOne({
      where: { phone },
    });

    if (!user) {
      // 新用户，创建账户
      user = this.userRepository.create({
        phone,
        token: this.generateToken(),
        token_expires_at: this.getTokenExpiresAt(),
      });
    } else {
      // 已存在用户，更新token
      user.token = this.generateToken();
      user.token_expires_at = this.getTokenExpiresAt();
    }

    await this.userRepository.save(user);

    return {
      token: user.token,
      userId: user.id,
      expiresAt: user.token_expires_at,
    };
  }

  /**
   * 验证token
   */
  async verifyToken(token: string): Promise<VerifyResponseDto> {
    if (!token) {
      return { valid: false };
    }

    const user = await this.userRepository.findOne({
      where: { token },
    });

    if (!user) {
      return { valid: false };
    }

    // 检查token是否过期
    if (user.token_expires_at && user.token_expires_at < new Date()) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: user.id,
      phone: user.phone,
    };
  }

  /**
   * 根据token获取用户
   */
  async getUserByToken(token: string): Promise<User | null> {
    if (!token) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { token },
    });

    if (!user) {
      return null;
    }

    // 检查token是否过期
    if (user.token_expires_at && user.token_expires_at < new Date()) {
      return null;
    }

    return user;
  }
}
