import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { UpdateSettingsDto } from './dto/update-settings.dto.js';
import {
  PROFILE_SELECT,
  SETTINGS_SELECT,
} from './constants/user-select.constants.js';
import { PasswordService } from '../../common/security/password.service.js';
import { generateToken, hashToken } from '../../common/security/token.utils.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly passwordService: PasswordService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...PROFILE_SELECT,
        settings: { select: SETTINGS_SELECT },
      },
    });
    this.ensureUserExists(user);

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true, name: true },
    });
    this.ensureUserExists(current);

    if (dto.email || dto.phone) {
      const conditions = [
        ...(dto.email ? [{ email: dto.email }] : []),
        ...(dto.phone ? [{ phone: dto.phone }] : []),
      ];

      if (conditions.length > 0) {
        const conflict = await this.prisma.user.findFirst({
          where: {
            id: { not: userId },
            OR: conditions,
          },
          select: { email: true, phone: true },
        });

        if (conflict) {
          const field = conflict.email === dto.email ? 'E-mail' : 'Telefone';

          throw new ConflictException(`${field} já está em uso`);
        }
      }
    }

    const emailChanged = dto.email !== undefined && dto.email !== current.email;
    const phoneChanged = dto.phone !== undefined && dto.phone !== current.phone;

    if (emailChanged) {
      return this.updateEmailAndNotify(userId, dto, current.name);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && phoneChanged && { phone: dto.phone }),
      },
      select: PROFILE_SELECT,
    });

    return updated;
  }

  private async updateEmailAndNotify(
    userId: string,
    dto: UpdateProfileDto,
    userName: string,
  ) {
    const raw = generateToken();

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.verificationToken.updateMany({
        where: { userId, type: 'EMAIL_VERIFICATION', usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.verificationToken.create({
        data: {
          userId,
          type: 'EMAIL_VERIFICATION',
          tokenHash: hashToken(raw),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
        },
      });

      return tx.user.update({
        where: { id: userId },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          email: dto.email!,
          emailVerifiedAt: null,
        },
        select: PROFILE_SELECT,
      });
    });

    void this.mailService.sendVerificationEmail(updated.email, raw, userName);

    return {
      ...updated,
      message: 'E-mail atualizado. Verifique sua caixa de entrada.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    this.ensureUserExists(user);

    await this.passwordService.validatePassword(
      user.passwordHash,
      dto.currentPassword,
    );

    const passwordHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    const fresh = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { email: true, name: true },
    });

    void this.mailService.sendPasswordChangedEmail(fresh.email, fresh.name);

    return { message: 'Senha alterada. Faça login novamente.' };
  }

  async getSettings(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: SETTINGS_SELECT,
    });
    if (!settings) throw new NotFoundException('Configurações não encontradas');
    return settings;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
      select: SETTINGS_SELECT,
    });
    return settings;
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, email: true },
    });
    this.ensureUserExists(user);

    await this.passwordService.validatePassword(user.passwordHash, password);

    await this.prisma.user.delete({ where: { id: userId } });

    this.logger.log(`Conta excluída: ${user.email} (${userId})`);
    return { message: 'Conta excluída com sucesso' };
  }

  private ensureUserExists<T>(user: T | null): asserts user is T {
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}
