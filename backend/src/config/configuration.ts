export default () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    url: process.env.APP_URL ?? 'http://localhost:3001',
    frontUrl: process.env.FRONT_URL ?? 'http://localhost:3000',
  },
  mail: {
    from: process.env.MAIL_FROM ?? 'FinTrack <no-reply@fintrack.app>',
  },
});
