import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Employee } from "@/lib/types";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

export function EmployeeForm({
  open, onOpenChange, employee,
}: { open: boolean; onOpenChange: (o: boolean) => void; employee?: Employee }) {
  const [form, setForm] = useState<Employee>(
    employee ?? {
      id: crypto.randomUUID(),
      name: "", role: "", monthlySalary: 0,
      joiningDate: new Date().toISOString().slice(0, 10),
      active: true,
    },
  );

  const set = <K extends keyof Employee>(k: K, v: Employee[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (form.monthlySalary <= 0) return toast.error("Salary must be positive");
    storage.upsertEmployee(form);
    toast.success(employee ? "Employee updated" : "Employee added");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? "Edit employee" : "Add employee"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Role</Label>
            <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Chef, Rider, Packer..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Monthly salary (₹)</Label>
              <Input type="number" value={form.monthlySalary || ""} onChange={(e) => set("monthlySalary", Number(e.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Joining date</Label>
              <Input type="date" value={form.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-muted-foreground">Inactive employees skip payroll</div>
            </div>
            <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{employee ? "Save" : "Add employee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
