import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentMonth, monthLabel } from "@/lib/payroll";

export function MonthPicker({
  value, onChange, label = "Month",
}: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="month" className="text-sm text-muted-foreground whitespace-nowrap">{label}</Label>
      <Input
        id="month"
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value || currentMonth())}
        className="w-[180px]"
      />
      <span className="hidden sm:inline text-sm text-muted-foreground">{monthLabel(value)}</span>
    </div>
  );
}
