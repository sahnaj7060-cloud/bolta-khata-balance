export type EntryType = "credit" | "payment";

export interface ParsedEntry {
  name: string;
  amount: number;
  type: EntryType;
}

export interface KhataEntry extends ParsedEntry {
  id: string;
  createdAt: number;
}

const NUMBER_WORDS: Record<string, number> = {
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  // Hindi (roman)
  ek: 1, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, che: 6, saat: 7,
  aath: 8, nau: 9, das: 10, bees: 20, tees: 30, chalis: 40, pachas: 50, pachaas: 50,
  // Hindi (Devanagari)
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6, "छः": 6,
  "सात": 7, "आठ": 8, "नौ": 9, "दस": 10, "बीस": 20, "तीस": 30, "चालीस": 40, "पचास": 50,
};

const MULTIPLIERS: Record<string, number> = {
  hundred: 100, sau: 100, "सौ": 100,
  thousand: 1000, hazar: 1000, hazaar: 1000, hajar: 1000, "हज़ार": 1000, "हजार": 1000,
  lakh: 100000, lac: 100000, "लाख": 100000,
};

const PAYMENT_WORDS = new Set([
  "jama", "जमा", "paid", "pay", "payment", "received", "receive", "wapas", "vapas", "वापस",
  "mile", "mila", "मिले", "मिला", "chukaye", "चुकाए", "चुकाये", "lautaye", "लौटाए",
]);

const STOP_WORDS = new Set([
  "rupees", "rupee", "rupaye", "rupaiye", "rupay", "rupiya", "rupya", "rs", "inr", "₹",
  "रुपये", "रुपए", "रूपये", "रूपए", "रुपया", "रूपया", "रुपय", "रु",
  "ne", "ko", "ka", "ki", "ke", "se", "hai", "he", "aur", "and", "the", "of", "to", "for",
  "ने", "को", "का", "की", "के", "से", "है", "और",
  "udhaar", "udhar", "उधार", "credit", "given", "gave", "give", "add",
  "diye", "diya", "dena", "दिए", "दिये", "दिया", "देना",
  "liye", "liya", "लिए", "लिये", "लिया", "kiye", "kiya", "किए", "किये", "किया",
  "baki", "baaki", "बाकी", "बाक़ी",
]);

const DEVANAGARI_DIGITS = "०१२३४५६७८९";

function normalize(text: string): string {
  return text
    .replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)))
    .replace(/(\d),(?=\d)/g, "$1")
    .replace(/₹/g, " ₹ ")
    .replace(/(\d)([^\d\s.])/g, "$1 $2")
    .replace(/([^\d\s.₹])(\d)/g, "$1 $2")
    .replace(/[,!?।|"'()]/g, " ")
    .replace(/\.(?!\d)/g, " ")
    .toLowerCase()
    .trim();
}

function capitalize(word: string): string {
  return /^[a-z]/.test(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

/** Turns speech like "ramesh 200 rupees" or "रमेश ने 500 जमा किए" into an entry. */
export function parseSpeech(text: string): ParsedEntry | null {
  const tokens = normalize(text).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  const hasDigits = tokens.some((t) => /^\d+(\.\d+)?$/.test(t));
  const isNumeric = (t: string) =>
    /^\d+(\.\d+)?$/.test(t) || t in MULTIPLIERS || (!hasDigits && t in NUMBER_WORDS) ||
    (!hasDigits && t === "do");

  let amount = 0;
  let foundAmount = false;
  const nameParts: string[] = [];
  let type: EntryType = "credit";

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i] as string;
    if (!foundAmount && isNumeric(tok) && !(tok in MULTIPLIERS)) {
      let total = 0;
      let current = 0;
      while (i < tokens.length && isNumeric(tokens[i] as string)) {
        const t = tokens[i] as string;
        if (/^\d/.test(t)) current += parseFloat(t);
        else if (t === "do") current += 2;
        else if (t in NUMBER_WORDS) current += NUMBER_WORDS[t] as number;
        else if (t in MULTIPLIERS) {
          const m = MULTIPLIERS[t] as number;
          if (m === 100) current = (current || 1) * 100;
          else {
            total += (current || 1) * m;
            current = 0;
          }
        }
        i++;
      }
      amount = total + current;
      foundAmount = amount > 0;
      continue;
    }
    if (PAYMENT_WORDS.has(tok)) type = "payment";
    else if (!STOP_WORDS.has(tok) && !(tok in MULTIPLIERS) && !/^\d/.test(tok)) {
      nameParts.push(tok);
    }
    i++;
  }

  if (!foundAmount || nameParts.length === 0) return null;
  return {
    name: nameParts.map(capitalize).join(" "),
    amount: Math.round(amount * 100) / 100,
    type,
  };
}

export interface Totals {
  credit: number;
  payment: number;
  balance: number;
}

export function calculateTotals(entries: Pick<KhataEntry, "amount" | "type">[]): Totals {
  let credit = 0;
  let payment = 0;
  for (const e of entries) {
    if (e.type === "credit") credit += e.amount;
    else payment += e.amount;
  }
  return { credit, payment, balance: credit - payment };
}

export interface CustomerSummary {
  key: string;
  name: string;
  balance: number;
  count: number;
  lastAt: number;
}

export function summarizeCustomers(entries: KhataEntry[]): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>();
  for (const e of entries) {
    const key = e.name.trim().toLowerCase();
    const s = map.get(key) ?? { key, name: e.name, balance: 0, count: 0, lastAt: 0 };
    s.balance += e.type === "credit" ? e.amount : -e.amount;
    s.count += 1;
    s.lastAt = Math.max(s.lastAt, e.createdAt);
    map.set(key, s);
  }
  return [...map.values()].sort((a, b) => b.lastAt - a.lastAt);
}

export function formatRupees(n: number): string {
  return "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
