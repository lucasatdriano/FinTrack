import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { ARGON_OPTS } from './constants/password.constants.js';
import { createHash } from 'node:crypto';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, ARGON_OPTS);
  }

  async validatePassword(
    passwordHash: string,
    password: string,
    errorMessage: string = 'Credenciais inválidas',
  ): Promise<void> {
    const isValid = await argon2
      .verify(passwordHash, password)
      .catch(() => false);

    if (!isValid) {
      throw new UnauthorizedException(errorMessage);
    }
  }
}
