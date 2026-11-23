import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EntryType, ParsedEntry } from "@/lib/khata";
import type { Strings } from "@/lib/i18n";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (entry: ParsedEntry) => void;
  t: Strings;
}

export function ManualEntryDialog({ open, onOpenChange, onAdd, t }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const submit = (type: EntryType) => {
    const n = name.trim();
    const a = parseFloat(amount);
    if (!n || !(a > 0)) return;
    onAdd({ name: n, amount: a, type });
    setName("");
    setAmount("");
    onOpenChange(false);
  };

  const valid = name.trim().length > 0 && parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] rounded-3xl bg-card p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t.manualTitle}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <label className="flex flex-col gap-1.5">
            <span className="text-base font-semibold text-muted-foreground">{t.name}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-16 rounded-2xl border-2 border-input bg-paper px-4 text-2xl font-semibold outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-base font-semibold text-muted-foreground">{t.amount}</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              className="h-16 rounded-2xl border-2 border-input bg-paper px-4 font-display text-3xl font-bold outline-none focus:border-accent"
            />
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!valid}
              onClick={() => submit("credit")}
              className="h-16 touch-manipulation rounded-2xl bg-credit text-xl font-bold text-primary-foreground transition active:scale-95 disabled:opacity-40"
            >
              {t.addCredit}
            </button>
            <button
              type="button"
              disabled={!valid}
              onClick={() => submit("payment")}
              className="h-16 touch-manipulation rounded-2xl bg-payment text-xl font-bold text-primary-foreground transition active:scale-95 disabled:opacity-40"
            >
              {t.addPayment}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
