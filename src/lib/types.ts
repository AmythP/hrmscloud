export type Employee = {
  id: string;
  name: string;
  role: string;
  monthlySalary: number;
  joiningDate: string; // ISO date
  active: boolean;
};

export type AttendanceStatus = "P" | "IL" | "UL" | "O";

export type PayrollEntry = {
  employeeId: string;
  month: string; // "YYYY-MM"
  informedLeaves: number;
  uninformedLeaves: number;
  overtimePay: number;
  advancePay: number;
  dressPenalty: number;
  eatingDues: number;
  notes: string;
  attendance?: Record<number, AttendanceStatus>; // day (1-31) -> status
};

export type Settings = {
  companyName: string;
  gasWebAppUrl: string;
};

export type PayrollComputation = {
  dailyWage: number;
  informedLeaves: number;
  uninformedLeaves: number;
  unusedInformedLeaves: number;
  extraInformedLeaves: number;
  unusedLeavePay: number;
  informedLeaveDeduction: number;
  uninformedLeaveDeduction: number;
  overtimePay: number;
  advancePay: number;
  dressPenalty: number;
  eatingDues: number;
  monthlySalary: number;
  totalDeductions: number;
  totalAdditions: number;
  finalSalary: number;
};
