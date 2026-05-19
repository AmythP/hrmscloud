import type { Employee, PayrollEntry, PayrollComputation } from "./types";

export const DAYS_IN_MONTH = 31;
export const PAID_INFORMED_LEAVES = 4;

export function computePayroll(
  employee: Employee,
  entry: PayrollEntry | undefined,
): PayrollComputation {
  const monthlySalary = employee.monthlySalary || 0;
  const dailyWage = monthlySalary / DAYS_IN_MONTH;
  const informedLeaves = entry?.informedLeaves ?? 0;
  const uninformedLeaves = entry?.uninformedLeaves ?? 0;
  const overtimePay = entry?.overtimePay ?? 0;
  const advancePay = entry?.advancePay ?? 0;
  const dressPenalty = entry?.dressPenalty ?? 0;
  const eatingDues = entry?.eatingDues ?? 0;

  const unusedInformedLeaves = Math.max(0, PAID_INFORMED_LEAVES - informedLeaves);
  const extraInformedLeaves = Math.max(0, informedLeaves - PAID_INFORMED_LEAVES);

  const unusedLeavePay = unusedInformedLeaves * dailyWage;
  const informedLeaveDeduction = extraInformedLeaves * dailyWage;
  const uninformedLeaveDeduction = uninformedLeaves * 2 * dailyWage;

  const totalAdditions = overtimePay + unusedLeavePay;
  const totalDeductions =
    advancePay +
    dressPenalty +
    eatingDues +
    informedLeaveDeduction +
    uninformedLeaveDeduction;

  const finalSalary = monthlySalary + totalAdditions - totalDeductions;

  return {
    dailyWage,
    informedLeaves,
    uninformedLeaves,
    unusedInformedLeaves,
    extraInformedLeaves,
    unusedLeavePay,
    informedLeaveDeduction,
    uninformedLeaveDeduction,
    overtimePay,
    advancePay,
    dressPenalty,
    eatingDues,
    monthlySalary,
    totalDeductions,
    totalAdditions,
    finalSalary,
  };
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}
