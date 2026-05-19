import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/hooks/use-storage";
import { computePayroll, currentMonth, formatCurrency, monthLabel } from "@/lib/payroll";
import { MonthPicker } from "@/components/month-picker";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Kitchen HRMS" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  useStorageVersion();
  const [month, setMonth] = useState(currentMonth());
  const employees = storage.listEmployees().filter((e) => e.active);

  const rows = useMemo(() => {
    return employees.map((e) => {
      const entry = storage.getPayroll(e.id, month);
      const c = computePayroll(e, entry);
      return { e, c };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, employees.length]);

  const totals = rows.reduce(
    (a, { c }) => ({
      salary: a.salary + c.monthlySalary,
      ot: a.ot + c.overtimePay,
      unused: a.unused + c.unusedLeavePay,
      adv: a.adv + c.advancePay,
      ded: a.ded + (c.dressPenalty + c.eatingDues + c.informedLeaveDeduction + c.uninformedLeaveDeduction),
      net: a.net + c.finalSalary,
    }),
    { salary: 0, ot: 0, unused: 0, adv: 0, ded: 0, net: 0 },
  );

  const exportCSV = () => {
    const headers = ["Name", "Role", "Salary", "Daily", "Informed", "Uninformed", "Overtime", "Unused leave pay", "Advance", "Dress penalty", "Eating dues", "Informed deduction", "Uninformed deduction", "Net payable"];
    const csv = [
      headers.join(","),
      ...rows.map(({ e, c }) =>
        [
          csvEscape(e.name), csvEscape(e.role),
          c.monthlySalary, c.dailyWage.toFixed(2),
          c.informedLeaves, c.uninformedLeaves,
          c.overtimePay, c.unusedLeavePay.toFixed(2),
          c.advancePay, c.dressPenalty, c.eatingDues,
          c.informedLeaveDeduction.toFixed(2),
          c.uninformedLeaveDeduction.toFixed(2),
          c.finalSalary.toFixed(2),
        ].join(","),
      ),
    ].join("\n");
    downloadBlob(csv, `payroll-${month}.csv`, "text/csv");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monthly report</h1>
          <p className="text-sm text-muted-foreground">{monthLabel(month)} · {rows.length} active employees</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker value={month} onChange={setMonth} />
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / PDF</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payroll summary — {monthLabel(month)}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead className="text-right">OT</TableHead>
                  <TableHead className="text-right">Unused</TableHead>
                  <TableHead className="text-right">Advance</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No active employees.</TableCell></TableRow>
                )}
                {rows.map(({ e, c }) => {
                  const ded = c.dressPenalty + c.eatingDues + c.informedLeaveDeduction + c.uninformedLeaveDeduction;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="text-muted-foreground">{e.role}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(c.monthlySalary)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(c.overtimePay)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(c.unusedLeavePay)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(c.advancePay)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(ded)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(c.finalSalary)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              {rows.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="font-medium">Totals</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.salary)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.ot)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.unused)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.adv)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.ded)}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">{formatCurrency(totals.net)}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function csvEscape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadBlob(content: string, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
