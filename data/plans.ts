
import { InvestmentPlan } from '../types';

export const seedPlans: InvestmentPlan[] = [
  {
    id: 'plan1',
    name: 'Prime Growth 30',
    minAmount: 100,
    maxAmount: 10000,
    roi: 0.12, // 12% for the period
    compoundingRate: 1,
    durationDays: 30,
    description: 'Short-term growth focused plan with moderate risk.',
  },
  {
    id: 'plan2',
    name: 'Prime Compound 90',
    minAmount: 500,
    maxAmount: 20000,
    roi: 0.25, // 25% for the period
    compoundingRate: 3,
    durationDays: 90,
    description: 'Quarterly compounding for higher returns over 3 months.',
  },
  {
    id: 'plan3',
    name: 'Prime Secure 180',
    minAmount: 1000,
    maxAmount: 50000,
    roi: 0.35,
    compoundingRate: 6,
    durationDays: 180,
    description: 'Lower volatility plan with steady compounding over 6 months.',
  },
];
