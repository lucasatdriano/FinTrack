const DURATION_MULTIPLIERS = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
} as const;

type DurationUnit = keyof typeof DURATION_MULTIPLIERS;

export function durationToSeconds(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);

  if (!match) {
    throw new Error(`Duração inválida: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2] as DurationUnit;

  return value * DURATION_MULTIPLIERS[unit];
}
