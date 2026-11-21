export default () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  },
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    url: process.env.API_URL ?? 'http://localhost:3001',
    frontUrl: process.env.FRONT_URL ?? 'http://localhost:3000',
  },
  security: {
    cookieSecret: process.env.COOKIE_SECRET!,
    cronSecret: process.env.CRON_SECRET!,
    internalApiSecret: process.env.INTERNAL_API_SECRET!,
  },
  mail: {
    from: process.env.MAIL_FROM ?? 'FinTrack <no-reply@fintrack.app>',
    resendApiKey: process.env.RESEND_API_KEY,
  },
});
