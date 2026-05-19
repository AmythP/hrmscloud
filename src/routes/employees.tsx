import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/hooks/use-storage";
import { formatCurrency } from "@/lib/payroll";
import type { Employee } from "@/lib/types";
import { EmployeeForm } from "@/components/employee-form";
import { toast } from "sonner";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees — Kitchen HRMS" }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  useStorageVersion();
  const employees = storage.listEmployees();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => { setEditing(undefined); setOpen(true); };
  const openEdit = (e: Employee) => { setEditing(e); setOpen(true); };

  const confirmDelete = () => {
    if (deleteId) {
      storage.removeEmployee(deleteId);
      toast.success("Employee removed");
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">{employees.length} total · {employees.filter(e => e.active).length} active</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add employee</Button>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">All employees</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No employees yet. Click "Add employee" to start.</TableCell></TableRow>
                )}
                {employees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-muted-foreground">{e.role || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(e.monthlySalary)}</TableCell>
                    <TableCell className="text-muted-foreground">{e.joiningDate}</TableCell>
                    <TableCell>
                      {e.active
                        ? <Badge variant="secondary">Active</Badge>
                        : <Badge variant="outline">Inactive</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(e.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {open && <EmployeeForm open={open} onOpenChange={setOpen} employee={editing} />}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the employee and all their payroll history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
