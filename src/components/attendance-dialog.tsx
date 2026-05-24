import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";
import type { AttendanceStatus, Employee, PayrollEntry } from "@/lib/types";
import { monthLabel } from "@/lib/payroll";
import { toast } from "sonner";

const STATUSES: { key: AttendanceStatus; label: string; cls: string }[] = [
  { key: "P", label: "Present", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  { key: "IL", label: "Informed leave", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  { key: "UL", label: "Uninformed leave", cls: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
  { key: "O", label: "Off / Holiday", cls: "bg-muted text-muted-foreground border-border" },
];

function nextStatus(s: AttendanceStatus | undefined): AttendanceStatus {
  const order: AttendanceStatus[] = ["P", "IL", "UL", "O"];
  if (!s) return "P";
  return order[(order.indexOf(s) + 1) % order.length];
}

function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function emptyEntry(employeeId: string, month: string): PayrollEntry {
  return {
    employeeId, month,
    informedLeaves: 0, uninformedLeaves: 0,
    overtimePay: 0, advancePay: 0,
    dressPenalty: 0, eatingDues: 0, notes: "",
  };
}

export function AttendanceDialog({
  open, onOpenChange, employee, month,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  employee: Employee;
  month: string;
}) {
  const [att, setAtt] = useState<Record<number, AttendanceStatus>>({});

  useEffect(() => {
    if (!open) return;
    const saved = storage.getPayroll(employee.id, month);
    setAtt(saved?.attendance ?? {});
  }, [open, employee.id, month]);

  const days = daysInMonth(month);
  const counts = useMemo(() => {
    let p = 0, il = 0, ul = 0, o = 0;
    for (let d = 1; d <= days; d++) {
      const s = att[d];
      if (s === "P") p++;
      else if (s === "IL") il++;
      else if (s === "UL") ul++;
      else if (s === "O") o++;
    }
    return { p, il, ul, o, unmarked: days - (p + il + ul + o) };
  }, [att, days]);

  const cycle = (d: number) =>
    setAtt((cur) => ({ ...cur, [d]: nextStatus(cur[d]) }));

  const setAll = (s: AttendanceStatus) => {
    const next: Record<number, AttendanceStatus> = {};
    for (let d = 1; d <= days; d++) next[d] = s;
    setAtt(next);
  };

  const clear = () => setAtt({});

  const save = () => {
    const existing = storage.getPayroll(employee.id, month) ?? emptyEntry(employee.id, month);
    storage.upsertPayroll({
      ...existing,
      attendance: att,
      informedLeaves: counts.il,
      uninformedLeaves: counts.ul,
    });
    toast.success(`Attendance saved for ${employee.name}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Daily attendance — {employee.name}</DialogTitle>
          <DialogDescription>
            {monthLabel(month)} · Tap a day to cycle Present → Informed → Uninformed → Off.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 text-xs">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setAll(s.key)}
              className={cn("px-2 py-1 rounded border", s.cls)}
              title={`Mark all as ${s.label}`}
            >
              {s.key} · {s.label}
            </button>
          ))}
          <button type="button" onClick={clear} className="px-2 py-1 rounded border text-muted-foreground">
            Clear
          </button>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5">
          {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
            const s = att[d];
            const meta = STATUSES.find((x) => x.key === s);
            return (
              <button
                key={d}
                type="button"
                onClick={() => cycle(d)}
                className={cn(
                  "aspect-square rounded-md border text-xs font-medium flex flex-col items-center justify-center gap-0.5 transition-colors",
                  meta ? meta.cls : "bg-background hover:bg-muted",
                )}
              >
                <span className="text-[11px] opacity-70">{d}</span>
                <span className="text-[11px]">{s ?? "—"}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <Stat label="Present" value={counts.p} />
          <Stat label="Informed" value={counts.il} />
          <Stat label="Uninformed" value={counts.ul} />
          <Stat label="Off" value={counts.o} />
          <Stat label="Unmarked" value={counts.unmarked} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save attendance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
