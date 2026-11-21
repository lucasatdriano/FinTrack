import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { PasswordService } from '../../common/security/password.service.js';
import { durationToSeconds } from '../../common/utils/duration.utils.js';
import { generateToken, hashToken } from '../../common/security/token.utils.js';
import { consumeVerificationToken } from '../../common/security/consume-token.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { TokenPair } from '../../types/auth.js';
import { CategoriesService } from '../categories/categories.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly passwordService: PasswordService,
    private readonly categoriesService: CategoriesService,
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

    const passwordHash = await this.passwordService.hash(dto.password);

    try {
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

          const raw = generateToken();
          await tx.verificationToken.create({
            data: {
              userId: user.id,
              type: 'EMAIL_VERIFICATION',
              tokenHash: hashToken(raw),
              expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
          });

          await this.categoriesService.seedDefaults(tx, user.id);

          return { user, rawVerifyToken: raw };
        },
      );

      void this.mailService.sendVerificationEmail(
        user.email,
        rawVerifyToken,
        user.name,
      );
      return { user, message: 'Conta criada. Verifique seu e-mail.' };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Não foi possível concluir o cadastro com os dados informados',
        );
      }
      throw err;
    }
  }

  async verifyEmail(rawToken: string) {
    return this.prisma.$transaction(async (tx) => {
      const { userId } = await consumeVerificationToken(
        tx,
        rawToken,
        'EMAIL_VERIFICATION',
      );
      await tx.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: new Date() },
      });
      return { message: 'E-mail verificado com sucesso' };
    });
  }

  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    await this.passwordService.validatePassword(
      user.passwordHash,
      dto.password,
    );

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException({
        message: 'E-mail não verificado. Verifique sua caixa de entrada.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    return this.issueTokens(user.id, user.email, meta);
  }

  async refresh(
    rawRefreshToken: string,
    meta: { userAgent?: string; ip?: string },
  ) {
    const tokenHash = hashToken(rawRefreshToken);

    const consumed = await this.prisma.session.updateMany({
      where: {
        refreshTokenHash: tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { revokedAt: new Date() },
    });

    if (consumed.count !== 1) {
      const reused = await this.prisma.session.findUnique({
        where: { refreshTokenHash: tokenHash },
        select: { userId: true, revokedAt: true },
      });
      if (reused?.revokedAt) {
        await this.prisma.session.updateMany({
          where: { userId: reused.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    const session = await this.prisma.session.findUniqueOrThrow({
      where: { refreshTokenHash: tokenHash },
      include: { user: { select: { id: true, email: true } } },
    });

    return this.issueTokens(session.user.id, session.user.email, {
      userAgent: meta.userAgent ?? session.userAgent ?? undefined,
      ip: meta.ip ?? session.ipAddress ?? undefined,
    });
  }

  async logout(rawRefreshToken: string) {
    const tokenHash = hashToken(rawRefreshToken);
    await this.prisma.session.updateMany({
      where: { refreshTokenHash: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logout realizado' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user)
      return { message: 'Se o e-mail existir, enviaremos instruções.' };

    const raw = generateToken();

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationToken.updateMany({
        where: { userId: user.id, type: 'PASSWORD_RESET', usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.verificationToken.create({
        data: {
          userId: user.id,
          type: 'PASSWORD_RESET',
          tokenHash: hashToken(raw),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1h
        },
      });
    });

    void this.mailService.sendPasswordResetEmail(user.email, raw, user.name);
    return { message: 'Se o e-mail existir, enviaremos instruções.' };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const passwordHash = await this.passwordService.hash(newPassword);

    return this.prisma.$transaction(async (tx) => {
      const { userId } = await consumeVerificationToken(
        tx,
        rawToken,
        'PASSWORD_RESET',
      );

      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      return { message: 'Senha redefinida com sucesso' };
    });
  }

  private async issueTokens(
    userId: string,
    email: string,
    meta: { userAgent?: string; ip?: string },
  ): Promise<TokenPair> {
    const accessExpiresIn = this.configService.get<string>(
      'jwt.accessExpiresIn',
    )!;
    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshExpiresIn',
    )!;

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, type: 'access' },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
      },
    );

    const rawRefresh = generateToken(64);
    const refreshTokenHash = hashToken(rawRefresh);
    const expiresAt = new Date(
      Date.now() + durationToSeconds(refreshExpiresIn) * 1000,
    );

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
      accessExpiresIn: durationToSeconds(accessExpiresIn),
    };
  }
}
