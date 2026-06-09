import { Project, Member, IndustryRate } from './types'

export const sampleMembers: Member[] = [
  { id: 'm1', name: '田中 健一' },
  { id: 'm2', name: '佐藤 美咲' },
  { id: 'm3', name: '鈴木 大輔' },
  { id: 'm4', name: '山田 花子' },
]

export const sampleProjects: Project[] = [
  {
    id: 'p1',
    name: '楽天系EC',
    industry: 'EC',
    media: 'both',
    memberId: 'm1',
    years: [
      { year: 2022, orderTarget: 2400, orderActual: 2350, plTarget: 2100, plActual: 2050, billingLagMonths: 2, searchBudget: 1400, metaBudget: 950 },
      { year: 2023, orderTarget: 2800, orderActual: 2900, plTarget: 2500, plActual: 2600, billingLagMonths: 2, searchBudget: 1600, metaBudget: 1300 },
      { year: 2024, orderTarget: 3200, orderActual: 3150, plTarget: 2850, plActual: 2800, billingLagMonths: 2, searchBudget: 1800, metaBudget: 1350 },
      { year: 2025, orderTarget: 3500, orderActual: 1800, plTarget: 3100, plActual: 900, billingLagMonths: 2, searchBudget: 2000, metaBudget: 1500 },
    ],
  },
  {
    id: 'p2',
    name: '保険A社',
    industry: 'Finance',
    media: 'search',
    memberId: 'm2',
    years: [
      { year: 2022, orderTarget: 1800, orderActual: 1700, plTarget: 1600, plActual: 1550, billingLagMonths: 3, searchBudget: 1700, metaBudget: 0 },
      { year: 2023, orderTarget: 1900, orderActual: 1850, plTarget: 1700, plActual: 1680, billingLagMonths: 3, searchBudget: 1850, metaBudget: 0 },
      { year: 2024, orderTarget: 2100, orderActual: 1980, plTarget: 1900, plActual: 1800, billingLagMonths: 3, searchBudget: 1980, metaBudget: 0 },
      { year: 2025, orderTarget: 2200, orderActual: 900, plTarget: 2000, plActual: 400, billingLagMonths: 3, searchBudget: 2200, metaBudget: 0 },
    ],
  },
  {
    id: 'p3',
    name: '製薬B社',
    industry: 'Healthcare',
    media: 'meta',
    memberId: 'm3',
    years: [
      { year: 2022, orderTarget: 1200, orderActual: 1150, plTarget: 1050, plActual: 1000, billingLagMonths: 2, searchBudget: 0, metaBudget: 1150 },
      { year: 2023, orderTarget: 1400, orderActual: 1380, plTarget: 1200, plActual: 1180, billingLagMonths: 2, searchBudget: 0, metaBudget: 1380 },
      { year: 2024, orderTarget: 1600, orderActual: 1620, plTarget: 1400, plActual: 1420, billingLagMonths: 2, searchBudget: 0, metaBudget: 1620 },
      { year: 2025, orderTarget: 1800, orderActual: 820, plTarget: 1600, plActual: 380, billingLagMonths: 2, searchBudget: 0, metaBudget: 1800 },
    ],
  },
  {
    id: 'p4',
    name: 'ファッションC社',
    industry: 'Retail',
    media: 'both',
    memberId: 'm4',
    years: [
      { year: 2022, orderTarget: 900, orderActual: 920, plTarget: 800, plActual: 820, billingLagMonths: 1, searchBudget: 400, metaBudget: 520 },
      { year: 2023, orderTarget: 1050, orderActual: 1020, plTarget: 950, plActual: 920, billingLagMonths: 1, searchBudget: 450, metaBudget: 570 },
      { year: 2024, orderTarget: 1200, orderActual: 1180, plTarget: 1080, plActual: 1060, billingLagMonths: 1, searchBudget: 520, metaBudget: 660 },
      { year: 2025, orderTarget: 1350, orderActual: 620, plTarget: 1200, plActual: 290, billingLagMonths: 1, searchBudget: 600, metaBudget: 750 },
    ],
  },
  {
    id: 'p5',
    name: '旅行D社',
    industry: 'Travel',
    media: 'search',
    memberId: 'm1',
    years: [
      { year: 2022, orderTarget: 1500, orderActual: 1100, plTarget: 1350, plActual: 980, billingLagMonths: 2, searchBudget: 1100, metaBudget: 0 },
      { year: 2023, orderTarget: 1800, orderActual: 1850, plTarget: 1600, plActual: 1660, billingLagMonths: 2, searchBudget: 1850, metaBudget: 0 },
      { year: 2024, orderTarget: 2200, orderActual: 2180, plTarget: 2000, plActual: 1980, billingLagMonths: 2, searchBudget: 2180, metaBudget: 0 },
      { year: 2025, orderTarget: 2500, orderActual: 1100, plTarget: 2250, plActual: 500, billingLagMonths: 2, searchBudget: 2500, metaBudget: 0 },
    ],
  },
  {
    id: 'p6',
    name: '自動車E社',
    industry: 'Automotive',
    media: 'both',
    memberId: 'm2',
    years: [
      { year: 2022, orderTarget: 2000, orderActual: 2050, plTarget: 1800, plActual: 1850, billingLagMonths: 3, searchBudget: 1200, metaBudget: 850 },
      { year: 2023, orderTarget: 2100, orderActual: 2080, plTarget: 1900, plActual: 1880, billingLagMonths: 3, searchBudget: 1250, metaBudget: 830 },
      { year: 2024, orderTarget: 2200, orderActual: 2150, plTarget: 2000, plActual: 1950, billingLagMonths: 3, searchBudget: 1300, metaBudget: 850 },
      { year: 2025, orderTarget: 2300, orderActual: 980, plTarget: 2100, plActual: 450, billingLagMonths: 3, searchBudget: 1380, metaBudget: 920 },
    ],
  },
  {
    id: 'p7',
    name: '教育F社',
    industry: 'Education',
    media: 'meta',
    memberId: 'm3',
    years: [
      { year: 2022, orderTarget: 700, orderActual: 680, plTarget: 630, plActual: 610, billingLagMonths: 1, searchBudget: 0, metaBudget: 680 },
      { year: 2023, orderTarget: 850, orderActual: 870, plTarget: 760, plActual: 780, billingLagMonths: 1, searchBudget: 0, metaBudget: 870 },
      { year: 2024, orderTarget: 1000, orderActual: 980, plTarget: 900, plActual: 880, billingLagMonths: 1, searchBudget: 0, metaBudget: 980 },
      { year: 2025, orderTarget: 1150, orderActual: 510, plTarget: 1050, plActual: 240, billingLagMonths: 1, searchBudget: 0, metaBudget: 1150 },
    ],
  },
  {
    id: 'p8',
    name: '食品G社',
    industry: 'Food',
    media: 'both',
    memberId: 'm4',
    years: [
      { year: 2022, orderTarget: 1100, orderActual: 1080, plTarget: 980, plActual: 960, billingLagMonths: 2, searchBudget: 580, metaBudget: 500 },
      { year: 2023, orderTarget: 1200, orderActual: 1220, plTarget: 1080, plActual: 1100, billingLagMonths: 2, searchBudget: 630, metaBudget: 590 },
      { year: 2024, orderTarget: 1300, orderActual: 1280, plTarget: 1170, plActual: 1150, billingLagMonths: 2, searchBudget: 680, metaBudget: 600 },
      { year: 2025, orderTarget: 1400, orderActual: 640, plTarget: 1260, plActual: 300, billingLagMonths: 2, searchBudget: 750, metaBudget: 650 },
    ],
  },
]

export const industryRates: IndustryRate[] = [
  { industry: 'EC', growthRate2023: 12.5, growthRate2024: 10.8, growthRate2025: 9.5 },
  { industry: 'Finance', growthRate2023: 5.2, growthRate2024: 6.1, growthRate2025: 5.8 },
  { industry: 'Healthcare', growthRate2023: 8.3, growthRate2024: 9.2, growthRate2025: 10.1 },
  { industry: 'Retail', growthRate2023: 6.8, growthRate2024: 7.2, growthRate2025: 7.5 },
  { industry: 'Travel', growthRate2023: 22.5, growthRate2024: 15.3, growthRate2025: 8.2 },
  { industry: 'Automotive', growthRate2023: 3.1, growthRate2024: 3.5, growthRate2025: 2.8 },
  { industry: 'Education', growthRate2023: 11.2, growthRate2024: 12.5, growthRate2025: 13.0 },
  { industry: 'Food', growthRate2023: 4.5, growthRate2024: 5.0, growthRate2025: 5.2 },
]
