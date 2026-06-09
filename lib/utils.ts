export function formatManen(value: number): string {
  return `${value.toLocaleString()}万円`
}

export function calcGrowthRate(current: number, previous: number): number {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}

export function calcCAGR(endValue: number, startValue: number, years: number): number {
  if (!startValue || years === 0) return 0
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

export function getDifficultyLabel(projectGrowth: number, marketGrowth: number): {
  label: string; color: string
} {
  const diff = projectGrowth - marketGrowth
  if (diff < -5) return { label: '難易度高', color: 'red' }
  if (diff > 5) return { label: '市況超え', color: 'green' }
  return { label: '市況並み', color: 'yellow' }
}
