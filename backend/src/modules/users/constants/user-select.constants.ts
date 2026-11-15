export const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const SETTINGS_SELECT = {
  currency: true,
  locale: true,
  timezone: true,
  emailBudgetAlerts: true,
  emailMonthlySummary: true,
} as const;
