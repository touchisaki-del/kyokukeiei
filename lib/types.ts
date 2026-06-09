export interface YearData {
  year: number;
  orderTarget: number;
  orderActual: number;
  plTarget: number;
  plActual: number;
  billingLagMonths: number;
  searchBudget: number;
  metaBudget: number;
}

export interface Project {
  id: string;
  name: string;
  industry: string;
  media: 'search' | 'meta' | 'both';
  memberId: string;
  years: YearData[];
}

export interface Member {
  id: string;
  name: string;
}

export interface IndustryRate {
  industry: string;
  growthRate2023: number;
  growthRate2024: number;
  growthRate2025: number;
}
