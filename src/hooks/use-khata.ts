import { useCallback, useEffect, useState } from "react";
import type { KhataEntry, ParsedEntry } from "@/lib/khata";
import type { Lang } from "@/lib/i18n";

const ENTRIES_KEY = "voice-khata:entries";
const LANG_KEY = "voice-khata:lang";

export function useKhata() {
  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [lang, setLangState] = useState<Lang>("hi");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ENTRIES_KEY);
      if (raw) setEntries(JSON.parse(raw) as KhataEntry[]);
      const l = localStorage.getItem(LANG_KEY);
      if (l === "hi" || l === "en") setLangState(l);
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }, [entries, loaded]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);

  const add = useCallback((p: ParsedEntry): KhataEntry => {
    const entry: KhataEntry = {
      ...p,
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      createdAt: Date.now(),
    };
    setEntries((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const restore = useCallback((entry: KhataEntry) => {
    setEntries((prev) => [entry, ...prev].sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  return { entries, lang, setLang, add, remove, restore, loaded };
}
