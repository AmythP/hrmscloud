import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { Employee, PayrollEntry } from "@/lib/types";
import { computePayroll, formatCurrency, monthLabel } from "@/lib/payroll";
import { storage } from "@/lib/storage";

export function SalarySlip({
  open, onOpenChange, employee, month,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  employee: Employee;
  month: string;
}) {
  const entry = storage.getPayroll(employee.id, month);
  const c = computePayroll(employee, entry);
  const company = storage.getSettings().companyName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="no-print">
          <DialogTitle>Salary slip</DialogTitle>
        </DialogHeader>
        <div id="slip" className="space-y-4 text-sm">
          <div className="flex justify-between items-start border-b pb-3">
            <div>
              <div className="text-lg font-semibold">{company}</div>
              <div className="text-muted-foreground">Salary slip — {monthLabel(month)}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{employee.name}</div>
              <div className="text-muted-foreground">{employee.role}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Info label="Monthly salary" value={formatCurrency(c.monthlySalary)} />
            <Info label="Daily wage (÷31)" value={formatCurrency(c.dailyWage)} />
            <Info label="Informed leaves" value={String(c.informedLeaves)} />
            <Info label="Uninformed leaves" value={String(c.uninformedLeaves)} />
          </div>

          <SlipTable
            title="Earnings"
            rows={[
              ["Base salary", c.monthlySalary],
              ["Overtime pay", c.overtimePay],
              [`Unused leave pay (${c.unusedInformedLeaves} × daily)`, c.unusedLeavePay],
            ]}
            total={c.monthlySalary + c.overtimePay + c.unusedLeavePay}
          />

          <SlipTable
            title="Deductions"
            rows={[
              ["Advance pay", c.advancePay],
              ["Dress penalty", c.dressPenalty],
              ["Eating dues", c.eatingDues],
              [`Extra informed leaves (${c.extraInformedLeaves} × daily)`, c.informedLeaveDeduction],
              [`Uninformed leaves (${c.uninformedLeaves} × 2 × daily)`, c.uninformedLeaveDeduction],
            ]}
            total={c.totalDeductions}
          />

          <div className="flex justify-between items-center rounded-md bg-secondary p-3">
            <div className="font-semibold">Net payable</div>
            <div className="text-lg font-bold">{formatCurrency(c.finalSalary)}</div>
          </div>

          {entry?.notes && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              <span className="font-medium">Notes: </span>{entry.notes}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function SlipTable({ title, rows, total }: { title: string; rows: [string, number][]; total: number }) {
  return (
    <div className="rounded-md border">
      <div className="px-3 py-2 border-b bg-muted/50 font-medium">{title}</div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b last:border-b-0">
              <td className="px-3 py-1.5">{k}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{formatCurrency(v)}</td>
            </tr>
          ))}
          <tr className="bg-muted/30">
            <td className="px-3 py-1.5 font-medium">Total</td>
            <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
