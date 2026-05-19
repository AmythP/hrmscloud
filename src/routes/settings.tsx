import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/hooks/use-storage";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Kitchen HRMS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  useStorageVersion();
  const initial = storage.getSettings();
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [gasUrl, setGasUrl] = useState(initial.gasWebAppUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveSettings = () => {
    storage.saveSettings({ companyName, gasWebAppUrl: gasUrl });
    toast.success("Settings saved");
  };

  const exportBackup = () => {
    const json = storage.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `hrms-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    try {
      const text = await file.text();
      storage.importJSON(text);
      toast.success("Backup imported");
    } catch (err) {
      toast.error(`Import failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Company info, backups, and integrations</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Company</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label>Company name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Cloud Kitchen Co." />
            <p className="text-xs text-muted-foreground">Shown on salary slips.</p>
          </div>
          <div className="grid gap-1.5">
            <Label>Google Apps Script Web App URL</Label>
            <Input value={gasUrl} onChange={(e) => setGasUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
            <p className="text-xs text-muted-foreground">Optional — used when syncing payroll to a Google Sheet. Not yet wired in this version.</p>
          </div>
          <div><Button onClick={saveSettings}>Save settings</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup & restore</CardTitle>
          <CardDescription>Your data lives in this browser. Export regularly.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportBackup}><Download className="h-4 w-4" /> Export JSON</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import JSON</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importBackup(f);
              e.target.value = "";
            }}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="h-4 w-4" /> Clear all data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Erase all HRMS data?</AlertDialogTitle>
                <AlertDialogDescription>Removes all employees, payroll, and settings from this browser. Export a backup first if you might need it.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { storage.clear(); toast.success("All data cleared"); }}>Erase everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Payroll rules</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>Every month is calculated as 31 days. Daily wage = monthly salary ÷ 31.</p>
          <p>4 paid informed leaves per month. Unused informed leaves are paid extra at daily wage. Extra informed leaves beyond 4 deduct 1 daily wage each.</p>
          <p>Every uninformed leave deducts 2 daily wages.</p>
          <p>Net = salary + overtime + unused leave pay − advance − dress penalty − eating dues − leave deductions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
