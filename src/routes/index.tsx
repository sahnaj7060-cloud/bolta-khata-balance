import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Keyboard, Trash2, X } from "lucide-react";

import { MicButton } from "@/components/khata/MicButton";
import { ManualEntryDialog } from "@/components/khata/ManualEntryDialog";
import { useKhata } from "@/hooks/use-khata";
import { useSpeech } from "@/hooks/use-speech";
import { STRINGS, type Lang } from "@/lib/i18n";
import {
  calculateTotals,
  formatRupees,
  parseSpeech,
  summarizeCustomers,
  type KhataEntry,
  type ParsedEntry,
} from "@/lib/khata";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voice Khata — बोलकर उधार लिखें" },
      {
        name: "description",
        content: "Shopkeepers: speak “Ramesh 200 rupees” and it's added to your khata with the total balance.",
      },
      { property: "og:title", content: "Voice Khata — बोलकर उधार लिखें" },
      {
        property: "og:description",
        content: "Speak a customer name and amount in Hindi or English. Your khata updates instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tab = "entries" | "customers";

function Index() {
  const { entries, lang, setLang, add, remove, restore } = useKhata();
  const t = STRINGS[lang];
  const [tab, setTab] = useState<Tab>("entries");
  const [filter, setFilter] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [notUnderstood, setNotUnderstood] = useState(false);

  const addEntry = (p: ParsedEntry) => {
    const entry = add(p);
    setLastId(entry.id);
    setTab("entries");
    setFilter(null);
    toast.success(`${t.added}: ${entry.name} · ${formatRupees(entry.amount)} ${entry.type === "credit" ? t.credit : t.payment}`, {
      action: { label: t.undo, onClick: () => remove(entry.id) },
    });
  };

  const speech = useSpeech(lang === "hi" ? "hi-IN" : "en-IN", (text) => {
    const parsed = parseSpeech(text);
    if (parsed) {
      setNotUnderstood(false);
      addEntry(parsed);
    } else {
      setNotUnderstood(true);
    }
  });

  const totals = useMemo(() => calculateTotals(entries), [entries]);
  const customers = useMemo(() => summarizeCustomers(entries), [entries]);
  const visible = filter ? entries.filter((e) => e.name.trim().toLowerCase() === filter) : entries;

  const handleDelete = (entry: KhataEntry) => {
    remove(entry.id);
    toast(`${t.deleted}: ${entry.name} ${formatRupees(entry.amount)}`, {
      action: { label: t.undo, onClick: () => restore(entry) },
    });
  };

  const status = speech.listening
    ? t.listening
    : !speech.supported || speech.error === "unsupported"
      ? t.noSupport
      : speech.error === "denied"
        ? t.micDenied
        : notUnderstood
          ? t.notUnderstood
          : t.tapToSpeak;

  const statusIsWarning =
    !speech.listening && (!speech.supported || speech.error !== null || notUnderstood);

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col">
      {/* Ledger cover header */}
      <header className="bg-ledger px-5 pb-24 pt-6 text-primary-foreground">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-none">{t.appName}</h1>
            <p className="mt-1.5 text-base opacity-85">{t.tagline}</p>
          </div>
          <LangToggle lang={lang} onChange={setLang} />
        </div>

        <div className="mt-6">
          <p className="text-lg font-medium opacity-85">{t.totalBalance}</p>
          <p className="font-display text-6xl font-extrabold leading-tight tracking-tight">
            {totals.balance < 0 ? "−" : ""}
            {formatRupees(totals.balance)}
          </p>
          <div className="mt-3 flex gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3.5 py-1.5 text-base font-semibold">
              <ArrowUpRight className="h-4 w-4" /> {t.credit} {formatRupees(totals.credit)}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3.5 py-1.5 text-base font-semibold">
              <ArrowDownLeft className="h-4 w-4" /> {t.payment} {formatRupees(totals.payment)}
            </span>
          </div>
        </div>
      </header>

      {/* Mic card */}
      <section className="-mt-16 px-4">
        <div className="flex flex-col items-center rounded-[2rem] bg-card px-5 pb-6 pt-4 shadow-card">
          <MicButton
            listening={speech.listening}
            onPress={() => {
              setNotUnderstood(false);
              if (speech.listening) speech.stop();
              else speech.start();
            }}
            label={t.tapToSpeak}
          />
          <p
            className={cn(
              "mt-1 text-center font-display text-2xl font-bold",
              statusIsWarning ? "text-credit" : "text-foreground",
            )}
            aria-live="polite"
          >
            {status}
          </p>
          {speech.interim ? (
            <p className="mt-2 rounded-xl bg-muted px-4 py-2 text-center text-lg">
              <span className="text-muted-foreground">{t.youHeard}</span> “{speech.interim}”
            </p>
          ) : (
            <p className="mt-2 text-center text-base text-muted-foreground">{t.example}</p>
          )}

          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-border bg-secondary text-lg font-bold text-secondary-foreground transition active:scale-[0.98]"
          >
            <Keyboard className="h-6 w-6" /> {t.typeInstead}
          </button>
        </div>
      </section>

      {/* Tabs */}
      <section className="mt-6 flex-1 px-4 pb-10">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5" role="tablist">
          {(["entries", "customers"] as const).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "h-14 rounded-xl text-lg font-bold transition",
                tab === key ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
              )}
            >
              {key === "entries" ? t.entries : t.customers}
              <span className="ml-1.5 text-base font-semibold opacity-60">
                {key === "entries" ? entries.length : customers.length}
              </span>
            </button>
          ))}
        </div>

        {filter && tab === "entries" && (
          <button
            onClick={() => setFilter(null)}
            className="mt-3 flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-base font-bold text-accent-foreground"
          >
            {visible[0]?.name ?? filter} <X className="h-5 w-5" /> {t.showAll}
          </button>
        )}

        <div className="mt-3 overflow-hidden rounded-3xl border border-border bg-paper">
          {entries.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-display text-2xl font-bold">{t.emptyTitle}</p>
              <p className="mt-1 text-lg text-muted-foreground">{t.emptyHint}</p>
            </div>
          ) : tab === "entries" ? (
            <ul>
              {visible.map((e) => (
                <EntryRow
                  key={e.id}
                  entry={e}
                  highlight={e.id === lastId}
                  t={t}
                  lang={lang}
                  onDelete={() => handleDelete(e)}
                />
              ))}
            </ul>
          ) : (
            <ul>
              {customers.map((c) => (
                <li key={c.key} className="border-b border-border/60 last:border-b-0">
                  <button
                    onClick={() => {
                      setFilter(c.key);
                      setTab("entries");
                    }}
                    className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left active:bg-muted"
                  >
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-bold">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{t.entriesCount(c.count)}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-display text-2xl font-extrabold",
                          c.balance > 0 ? "text-credit" : c.balance < 0 ? "text-payment" : "text-muted-foreground",
                        )}
                      >
                        {formatRupees(c.balance)}
                      </p>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {c.balance > 0 ? t.credit : c.balance < 0 ? t.advance : t.settled}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ManualEntryDialog open={manualOpen} onOpenChange={setManualOpen} onAdd={addEntry} t={t} />
    </div>
  );
}

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex shrink-0 rounded-2xl bg-primary-deep/50 p-1" role="group" aria-label="Language">
      {(["hi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          className={cn(
            "h-12 min-w-14 rounded-xl px-3 text-lg font-bold transition",
            lang === l ? "bg-accent text-accent-foreground" : "text-primary-foreground/80",
          )}
        >
          {l === "hi" ? "हिंदी" : "EN"}
        </button>
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xl font-bold text-secondary-foreground">
      {Array.from(name.trim())[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

function EntryRow({
  entry,
  highlight,
  t,
  lang,
  onDelete,
}: {
  entry: KhataEntry;
  highlight: boolean;
  t: (typeof STRINGS)[Lang];
  lang: Lang;
  onDelete: () => void;
}) {
  const isCredit = entry.type === "credit";
  const when = new Date(entry.createdAt).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <li
      className={cn(
        "flex min-h-16 items-center gap-3 border-b border-border/60 px-4 py-3 last:border-b-0",
        highlight && "animate-entry-in",
      )}
    >
      <Avatar name={entry.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xl font-bold">{entry.name}</p>
        <p className="text-sm text-muted-foreground">{when}</p>
      </div>
      <div className="text-right">
        <p className={cn("font-display text-2xl font-extrabold", isCredit ? "text-credit" : "text-payment")}>
          {isCredit ? "+" : "−"}
          {formatRupees(entry.amount)}
        </p>
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-sm font-bold",
            isCredit ? "bg-credit-soft text-credit" : "bg-payment-soft text-payment",
          )}
        >
          {isCredit ? t.credit : t.payment}
        </span>
      </div>
      <button
        onClick={onDelete}
        aria-label={t.delete}
        className="ml-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-muted-foreground active:bg-muted"
      >
        <Trash2 className="h-6 w-6" />
      </button>
    </li>
  );
}
