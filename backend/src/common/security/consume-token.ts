import { UnauthorizedException, Logger } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { hashToken } from './token.utils.js';

type TokenType = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

const logger = new Logger('consumeVerificationToken');

export async function consumeVerificationToken(
  tx: Prisma.TransactionClient,
  rawToken: string,
  type: TokenType,
): Promise<{ userId: string }> {
  const tokenHash = hashToken(rawToken);

  const consumed = await tx.verificationToken.updateMany({
    where: {
      tokenHash,
      type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  if (consumed.count !== 1) {
    const existing = await tx.verificationToken.findUnique({
      where: { tokenHash },
      select: { type: true, usedAt: true, expiresAt: true },
    });
    if (!existing) {
      logger.debug(`Token inexistente type=${type}`);
    } else if (existing.type !== type) {
      logger.warn(
        `Token type mismatch: esperado=${type} encontrado=${existing.type}`,
      );
    } else if (existing.usedAt) {
      logger.warn(
        `Token já consumido em ${existing.usedAt.toISOString()} type=${type}`,
      );
    } else if (existing.expiresAt < new Date()) {
      logger.debug(`Token expirado type=${type}`);
    }
    throw new UnauthorizedException('Token inválido ou expirado');
  }

  const token = await tx.verificationToken.findUniqueOrThrow({
    where: { tokenHash },
    select: { userId: true },
  });

  return { userId: token.userId };
}
