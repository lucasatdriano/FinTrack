export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
}
