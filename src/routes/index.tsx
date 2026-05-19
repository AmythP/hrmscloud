import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, ArrowDownToLine, MinusCircle, Plus } from "lucide-react";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/hooks/use-storage";
import { computePayroll, formatCurrency, currentMonth, monthLabel } from "@/lib/payroll";
import { MonthPicker } from "@/components/month-picker";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Kitchen HRMS" },
      { name: "description", content: "Payroll and people overview" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  useStorageVersion();
  const [month, setMonth] = useState(currentMonth());
  const employees = storage.listEmployees();
  const active = employees.filter((e) => e.active);

  const metrics = useMemo(() => {
    let payable = 0, advances = 0, deductions = 0;
    for (const e of active) {
      const entry = storage.getPayroll(e.id, month);
      const c = computePayroll(e, entry);
      payable += c.finalSalary;
      advances += c.advancePay;
      deductions += c.totalDeductions;
    }
    return { payable, advances, deductions };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, employees.length, useStorageVersion()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview for {monthLabel(month)}</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric icon={<Users className="h-4 w-4" />} label="Active employees" value={String(active.length)} sub={`${employees.length} total`} />
        <Metric icon={<Wallet className="h-4 w-4" />} label="Total payable" value={formatCurrency(metrics.payable)} />
        <Metric icon={<ArrowDownToLine className="h-4 w-4" />} label="Advances given" value={formatCurrency(metrics.advances)} />
        <Metric icon={<MinusCircle className="h-4 w-4" />} label="Total deductions" value={formatCurrency(metrics.deductions)} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild><Link to="/employees"><Plus className="h-4 w-4" /> Manage employees</Link></Button>
          <Button asChild variant="secondary"><Link to="/payroll">Open payroll</Link></Button>
          <Button asChild variant="outline"><Link to="/reports">View reports</Link></Button>
        </CardContent>
      </Card>

      {employees.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No employees yet. <Link to="/employees" className="text-primary font-medium underline-offset-4 hover:underline">Add your first employee</Link> to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs uppercase tracking-wide">{label}</span>
          {icon}
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-semibold tabular-nums">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
