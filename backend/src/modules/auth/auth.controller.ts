import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../types/auth.js';
import { RegisterSchema, type RegisterDto } from './dto/register.dto.js';
import { LoginSchema, type LoginDto } from './dto/login.dto.js';
import {
  ForgotPasswordSchema,
  type ForgotPasswordDto,
} from './dto/forgot-password.dto.js';
import {
  ResetPasswordSchema,
  type ResetPasswordDto,
} from './dto/reset-password.dto.js';
import { Throttle } from '@nestjs/throttler';
import {
  VerifyEmailSchema,
  type VerifyEmailDto,
} from './dto/verify-email.dto.js';
import { durationToSeconds } from '../../common/utils/duration.utils.js';

const REFRESH_COOKIE = 'ft_refresh';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(
    @Body(new ZodValidationPipe(VerifyEmailSchema)) dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, accessExpiresIn } =
      await this.authService.login(dto, {
        userAgent: req.headers['user-agent'],
        ip,
      });
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, expiresIn: accessExpiresIn };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!raw) throw new UnauthorizedException('Refresh cookie ausente');

    const { accessToken, refreshToken, accessExpiresIn } =
      await this.authService.refresh(raw, {
        userAgent: req.headers['user-agent'],
        ip,
      });
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, expiresIn: accessExpiresIn };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (raw) await this.authService.logout(raw);
    this.clearRefreshCookie(res);
    return { message: 'Logout realizado' };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema)) dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  private getRefreshToken(req: Request): string | undefined {
    const token = req.cookies?.[REFRESH_COOKIE];

    return typeof token === 'string' ? token : undefined;
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProd = this.configService.get('app.nodeEnv') === 'production';
    const maxAge =
      durationToSeconds(
        this.configService.get<string>('jwt.refreshExpiresIn')!,
      ) * 1000;

    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/auth',
      maxAge,
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
  }
}
