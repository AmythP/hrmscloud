import type { Employee, PayrollEntry, Settings } from "./types";

/**
 * Storage adapter. localStorage-backed for now. Swap with Supabase /
 * Google Sheets implementation later by replacing this module's exports.
 */

const KEY = "hrms:v1";

type DB = {
  employees: Employee[];
  payroll: PayrollEntry[];
  settings: Settings;
};

const defaultDB: DB = {
  employees: [],
  payroll: [],
  settings: { companyName: "Cloud Kitchen", gasWebAppUrl: "" },
};

function read(): DB {
  if (typeof window === "undefined") return defaultDB;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDB;
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      employees: parsed.employees ?? [],
      payroll: parsed.payroll ?? [],
      settings: { ...defaultDB.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return defaultDB;
  }
}

function write(db: DB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event("hrms:change"));
}

export const storage = {
  getAll: read,
  // employees
  listEmployees: () => read().employees,
  upsertEmployee: (e: Employee) => {
    const db = read();
    const i = db.employees.findIndex((x) => x.id === e.id);
    if (i >= 0) db.employees[i] = e;
    else db.employees.push(e);
    write(db);
  },
  removeEmployee: (id: string) => {
    const db = read();
    db.employees = db.employees.filter((e) => e.id !== id);
    db.payroll = db.payroll.filter((p) => p.employeeId !== id);
    write(db);
  },
  // payroll
  listPayroll: (month?: string) => {
    const all = read().payroll;
    return month ? all.filter((p) => p.month === month) : all;
  },
  getPayroll: (employeeId: string, month: string) =>
    read().payroll.find((p) => p.employeeId === employeeId && p.month === month),
  upsertPayroll: (entry: PayrollEntry) => {
    const db = read();
    const i = db.payroll.findIndex(
      (p) => p.employeeId === entry.employeeId && p.month === entry.month,
    );
    if (i >= 0) db.payroll[i] = entry;
    else db.payroll.push(entry);
    write(db);
  },
  // settings
  getSettings: () => read().settings,
  saveSettings: (s: Settings) => {
    const db = read();
    db.settings = s;
    write(db);
  },
  // backup
  exportJSON: () => JSON.stringify(read(), null, 2),
  importJSON: (raw: string) => {
    const parsed = JSON.parse(raw) as DB;
    if (!parsed.employees || !parsed.payroll)
      throw new Error("Invalid backup file");
    write({
      employees: parsed.employees,
      payroll: parsed.payroll,
      settings: { ...defaultDB.settings, ...(parsed.settings ?? {}) },
    });
  },
  clear: () => write(defaultDB),
};

