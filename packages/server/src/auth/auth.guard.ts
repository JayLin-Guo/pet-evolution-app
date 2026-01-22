import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.replace('Bearer ', '') || 
                  request.headers?.authorization ||
                  request.query?.token;

    if (!token) {
      throw new UnauthorizedException('缺少认证token');
    }

    const result = await this.authService.verifyToken(token);
    if (!result.valid) {
      throw new UnauthorizedException('token无效或已过期');
    }

    // 将用户信息附加到请求对象
    request.user = {
      userId: result.userId,
      phone: result.phone,
    };

    return true;
  }
}

