import { prisma } from "@/lib/prisma";
import { FOUNDERS, COMPANY_RESERVE_PERCENT } from "@/lib/founders";

export interface ProfitDistribution {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  youssef: number;
  saif: number;
  companyReserve: number;
}

export async function calculateProfitDistribution(
  periodStart: Date,
  periodEnd: Date
): Promise<ProfitDistribution> {
  const [revenues, expenses] = await Promise.all([
    prisma.revenue.aggregate({
      where: { date: { gte: periodStart, lte: periodEnd } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: periodStart, lte: periodEnd } },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = Number(revenues._sum.amount ?? 0);
  const totalExpenses = Number(expenses._sum.amount ?? 0);
  const netProfit = totalRevenue - totalExpenses;

  const youssefPercent = FOUNDERS.youssef.equityPercent / 100;
  const saifPercent = FOUNDERS.saif.equityPercent / 100;
  const reservePercent = COMPANY_RESERVE_PERCENT / 100;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    youssef: netProfit * youssefPercent,
    saif: netProfit * saifPercent,
    companyReserve: netProfit * reservePercent,
  };
}

function findFounderByKey(
  founders: { id: string; email: string }[],
  key: "youssef" | "saif"
) {
  const emails = FOUNDERS[key].emails;
  return founders.find((f) => (emails as readonly string[]).includes(f.email));
}

export async function generateMonthlyDistribution(
  year: number,
  month: number
): Promise<void> {
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0);

  const distribution = await calculateProfitDistribution(periodStart, periodEnd);
  const founders = await prisma.founder.findMany();

  const youssef = findFounderByKey(founders, "youssef");
  const saif = findFounderByKey(founders, "saif");

  const distributions = [];

  if (youssef) {
    distributions.push({
      founderId: youssef.id,
      periodStart,
      periodEnd,
      totalRevenue: distribution.totalRevenue,
      totalExpenses: distribution.totalExpenses,
      netProfit: distribution.netProfit,
      founderShare: distribution.youssef,
      reserveShare: 0,
      isReserve: false,
    });
  }

  if (saif) {
    distributions.push({
      founderId: saif.id,
      periodStart,
      periodEnd,
      totalRevenue: distribution.totalRevenue,
      totalExpenses: distribution.totalExpenses,
      netProfit: distribution.netProfit,
      founderShare: distribution.saif,
      reserveShare: 0,
      isReserve: false,
    });
  }

  distributions.push({
    founderId: null,
    periodStart,
    periodEnd,
    totalRevenue: distribution.totalRevenue,
    totalExpenses: distribution.totalExpenses,
    netProfit: distribution.netProfit,
    founderShare: 0,
    reserveShare: distribution.companyReserve,
    isReserve: true,
  });

  await prisma.equityDistribution.createMany({ data: distributions });
}
