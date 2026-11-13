import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';

import { MailService } from '../mail/mail.service.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TokenPair } from '../../types/auth.js';

const ARGON_OPTS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3,
  parallelism: 1,
} satisfies argon2.HashOptions;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
      select: { email: true, phone: true },
    });
    if (existing) {
      const field = existing.email === dto.email ? 'E-mail' : 'Telefone';
      throw new ConflictException(`${field} já cadastrado`);
    }

    const passwordHash = await argon2.hash(dto.password, ARGON_OPTS);

    const { user, rawVerifyToken } = await this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            settings: { create: {} },
          },
          select: { id: true, name: true, email: true, createdAt: true },
        });

        const raw = randomBytes(32).toString('hex');
        await tx.verificationToken.create({
          data: {
            userId: user.id,
            type: 'EMAIL_VERIFICATION',
            tokenHash: this.sha256(raw),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
          },
        });

        return { user, rawVerifyToken: raw };
      },
    );

    void this.mail.sendVerificationEmail(user.email, rawVerifyToken, user.name);

    return { user, message: 'Conta criada. Verifique seu e-mail.' };
  }

  async verifyEmail(rawToken: string) {
    const tokenHash = this.sha256(rawToken);
    const token = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (
      !token ||
      token.type !== 'EMAIL_VERIFICATION' ||
      token.usedAt ||
      token.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.verificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'E-mail verificado com sucesso' };
  }

  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await argon2
      .verify(user.passwordHash, dto.password)
      .catch(() => false);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    return this.issueTokens(user.id, user.email, meta);
  }

  async refresh(
    rawRefreshToken: string,
    meta: { userAgent?: string; ip?: string },
  ) {
    const tokenHash = this.sha256(rawRefreshToken);

    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(session.user.id, session.user.email, {
      userAgent: meta.userAgent ?? session.userAgent ?? undefined,
      ip: meta.ip ?? session.ipAddress ?? undefined,
    });
  }

  async logout(rawRefreshToken: string) {
    const tokenHash = this.sha256(rawRefreshToken);
    await this.prisma.session.updateMany({
      where: { refreshTokenHash: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logout realizado' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user)
      return { message: 'Se o e-mail existir, enviaremos instruções.' };

    const raw = randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        tokenHash: this.sha256(raw),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1h
      },
    });

    void this.mail.sendPasswordResetEmail(user.email, raw, user.name);
    return { message: 'Se o e-mail existir, enviaremos instruções.' };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = this.sha256(rawToken);
    const token = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (
      !token ||
      token.type !== 'PASSWORD_RESET' ||
      token.usedAt ||
      token.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const passwordHash = await argon2.hash(newPassword, ARGON_OPTS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      this.prisma.verificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.session.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Senha redefinida com sucesso' };
  }

  private async issueTokens(
    userId: string,
    email: string,
    meta: { userAgent?: string; ip?: string },
  ): Promise<TokenPair> {
    const accessExpiresIn = this.config.get<string>('jwt.accessExpiresIn')!;
    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn')!;

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, type: 'access' },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: accessExpiresIn as jwt.SignOptions['expiresIn'],
      },
    );

    const rawRefresh = randomBytes(64).toString('hex');
    const refreshTokenHash = this.sha256(rawRefresh);
    const expiresAt = this.parseDuration(refreshExpiresIn);

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        userAgent: meta.userAgent,
        ipAddress: meta.ip,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefresh,
      accessExpiresIn: this.durationToSeconds(accessExpiresIn),
    };
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private parseDuration(d: string): Date {
    const m = /^(\d+)([smhd])$/.exec(d);
    if (!m) return new Date(Date.now() + 30 * 86400 * 1000);
    const n = Number(m[1]);
    const ms = ({ s: 1e3, m: 60e3, h: 3600e3, d: 86400e3 } as const)[
      m[2] as 's' | 'm' | 'h' | 'd'
    ];
    return new Date(Date.now() + n * ms);
  }

  private durationToSeconds(d: string): number {
    const m = /^(\d+)([smhd])$/.exec(d);
    if (!m) return 900;
    const n = Number(m[1]);
    const s = ({ s: 1, m: 60, h: 3600, d: 86400 } as const)[
      m[2] as 's' | 'm' | 'h' | 'd'
    ];
    return n * s;
  }
}
