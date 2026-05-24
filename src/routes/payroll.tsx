import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, CalendarCheck } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/hooks/use-storage";
import { computePayroll, currentMonth, formatCurrency, monthLabel } from "@/lib/payroll";
import { MonthPicker } from "@/components/month-picker";
import type { PayrollEntry, Employee } from "@/lib/types";
import { SalarySlip } from "@/components/salary-slip";
import { AttendanceDialog } from "@/components/attendance-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/payroll")({
  head: () => ({ meta: [{ title: "Payroll — Kitchen HRMS" }] }),
  component: PayrollPage,
});

function emptyEntry(employeeId: string, month: string): PayrollEntry {
  return {
    employeeId, month,
    informedLeaves: 0, uninformedLeaves: 0,
    overtimePay: 0, advancePay: 0,
    dressPenalty: 0, eatingDues: 0, notes: "",
  };
}

function PayrollPage() {
  useStorageVersion();
  const [month, setMonth] = useState(currentMonth());
  const employees = storage.listEmployees().filter((e) => e.active);
  const [slipFor, setSlipFor] = useState<Employee | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
          <p className="text-sm text-muted-foreground">Enter leaves and adjustments for {monthLabel(month)}</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {employees.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No active employees. Add employees first.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {employees.map((e) => (
            <PayrollRow
              key={e.id}
              employee={e}
              month={month}
              onOpenSlip={() => setSlipFor(e)}
            />
          ))}
        </div>
      )}

      {slipFor && (
        <SalarySlip
          open={!!slipFor}
          onOpenChange={(o) => !o && setSlipFor(null)}
          employee={slipFor}
          month={month}
        />
      )}
    </div>
  );
}

function PayrollRow({ employee, month, onOpenSlip }: { employee: Employee; month: string; onOpenSlip: () => void }) {
  const saved = storage.getPayroll(employee.id, month);
  const [entry, setEntry] = useState<PayrollEntry>(saved ?? emptyEntry(employee.id, month));
  const [dirty, setDirty] = useState(false);

  // Reset on month/employee change
  useEffect(() => {
    setEntry(storage.getPayroll(employee.id, month) ?? emptyEntry(employee.id, month));
    setDirty(false);
  }, [employee.id, month]);

  const c = computePayroll(employee, entry);

  const set = <K extends keyof PayrollEntry>(k: K, v: PayrollEntry[K]) => {
    setEntry((e) => ({ ...e, [k]: v }));
    setDirty(true);
  };

  const save = () => {
    storage.upsertPayroll(entry);
    setDirty(false);
    toast.success(`Saved payroll for ${employee.name}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">{employee.name}</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{employee.role} · {formatCurrency(employee.monthlySalary)}/mo · daily {formatCurrency(c.dailyWage)}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Net payable</div>
          <div className="text-lg font-semibold tabular-nums">{formatCurrency(c.finalSalary)}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <NumField label="Informed leaves" value={entry.informedLeaves} onChange={(v) => set("informedLeaves", v)} />
          <NumField label="Uninformed leaves" value={entry.uninformedLeaves} onChange={(v) => set("uninformedLeaves", v)} />
          <NumField label="Overtime pay" value={entry.overtimePay} onChange={(v) => set("overtimePay", v)} />
          <NumField label="Advance pay" value={entry.advancePay} onChange={(v) => set("advancePay", v)} />
          <NumField label="Dress penalty" value={entry.dressPenalty} onChange={(v) => set("dressPenalty", v)} />
          <NumField label="Eating dues" value={entry.eatingDues} onChange={(v) => set("eatingDues", v)} />
        </div>
        <Textarea
          placeholder="Notes (optional)"
          value={entry.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
        />
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {c.unusedInformedLeaves > 0 && <span>+{formatCurrency(c.unusedLeavePay)} unused leave pay</span>}
          {c.informedLeaveDeduction > 0 && <span>−{formatCurrency(c.informedLeaveDeduction)} extra informed</span>}
          {c.uninformedLeaveDeduction > 0 && <span>−{formatCurrency(c.uninformedLeaveDeduction)} uninformed</span>}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onOpenSlip}><FileText className="h-4 w-4" /> Salary slip</Button>
          <Button onClick={save} disabled={!dirty}>{dirty ? "Save changes" : "Saved"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input
        type="number"
        inputMode="decimal"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
