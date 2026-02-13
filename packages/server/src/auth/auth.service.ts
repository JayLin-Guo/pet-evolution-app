import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { VerifyResponseDto } from './dto/verify.dto';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const svgCaptcha = require('svg-captcha');

interface CaptchaEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private captchaStore = new Map<string, CaptchaEntry>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 生成图形验证码
   */
  async generateCaptcha() {
    const captcha = svgCaptcha.create({
      size: 4, // 4个字符
      ignoreChars: '0o1i', // 排除容易混淆的字符
      noise: 2, // 干扰线数量
      color: true, // 字符颜色
      background: '#f0f0f0', // 背景色
      charPreset: '123456789', // 仅数字
    });

    const captchaId = crypto.randomUUID();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟有效期

    this.captchaStore.set(captchaId, {
      code: captcha.text.toLowerCase(),
      expiresAt,
    });

    // 定期清理过期验证码 (简单的内存管理)
    if (this.captchaStore.size > 1000) {
      this.cleanupCaptchas();
    }

    return {
      captchaId,
      svg: captcha.data,
    };
  }

  private cleanupCaptchas() {
    const now = Date.now();
    for (const [key, value] of this.captchaStore.entries()) {
      if (value.expiresAt < now) {
        this.captchaStore.delete(key);
      }
    }
  }

  /**
   * 验证验证码
   */
  private verifyCaptcha(captchaId: string, code: string): boolean {
    const entry = this.captchaStore.get(captchaId);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.captchaStore.delete(captchaId);
      return false;
    }

    const isValid = entry.code === code.toLowerCase();

    // 验证一次后立即作废 (防止重放)
    this.captchaStore.delete(captchaId);

    return isValid;
  }

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
    const { phone, captchaId, captchaCode } = registerDto;

    // 校验验证码
    if (!this.verifyCaptcha(captchaId, captchaCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }

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
