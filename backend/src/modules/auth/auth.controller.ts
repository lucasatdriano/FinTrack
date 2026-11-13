import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
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

const REFRESH_COOKIE = 'ft_refresh';
const REFRESH_PATHS = ['/auth/refresh', '/auth/logout'];

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, accessExpiresIn } =
      await this.auth.login(dto, {
        userAgent: req.headers['user-agent'],
        ip,
      });
    this.setRefreshCookie(res, refreshToken, accessExpiresIn);
    return { accessToken, expiresIn: accessExpiresIn };
  }

  @Public()
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
      await this.auth.refresh(raw, {
        userAgent: req.headers['user-agent'],
        ip,
      });
    this.setRefreshCookie(res, refreshToken, accessExpiresIn);
    return { accessToken, expiresIn: accessExpiresIn };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (raw) await this.auth.logout(raw);
    this.clearRefreshCookie(res);
    return { message: 'Logout realizado' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema)) dto: ForgotPasswordDto,
  ) {
    return this.auth.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  // ---------------- helpers de cookie ----------------
  private setRefreshCookie(
    res: Response,
    token: string,
    accessExpiresIn: number,
  ) {
    const isProd = this.config.get('app.nodeEnv') === 'production';
    const maxAge = this.durationToMs(
      this.config.get<string>('jwt.refreshExpiresIn')!,
    );
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/auth',
      maxAge,
    });
    void accessExpiresIn;
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
  }

  private durationToMs(d: string): number {
    const m = /^(\d+)([smhd])$/.exec(d);
    if (!m) return 30 * 86400 * 1000;
    const n = Number(m[1]);
    const ms = ({ s: 1e3, m: 60e3, h: 3600e3, d: 86400e3 } as const)[
      m[2] as 's' | 'm' | 'h' | 'd'
    ];
    return n * ms;
  }
}
