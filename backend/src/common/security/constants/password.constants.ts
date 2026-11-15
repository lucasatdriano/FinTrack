import * as argon2 from 'argon2';

export const ARGON_OPTS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
} satisfies argon2.HashOptions;
