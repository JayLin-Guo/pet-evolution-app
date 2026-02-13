import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { VerifyResponseDto } from './dto/verify.dto';
import { AuthGuard } from './auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('captcha')
  async getCaptcha() {
    return this.authService.generateCaptcha();
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Get('verify')
  @UseGuards(AuthGuard)
  async verify(
    @Headers('authorization') token: string,
  ): Promise<VerifyResponseDto> {
    const cleanToken = token?.replace('Bearer ', '') || token;
    return this.authService.verifyToken(cleanToken);
  }
}
