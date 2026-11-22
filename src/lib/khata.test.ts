import { describe, expect, it } from "vitest";
import { calculateTotals, parseSpeech, summarizeCustomers, type KhataEntry } from "./khata";

describe("parseSpeech", () => {
  it("reads an English name and amount as udhaar", () => {
    expect(parseSpeech("ramesh 200 rupees")).toEqual({ name: "Ramesh", amount: 200, type: "credit" });
  });

  it("reads Hindi speech with digits", () => {
    expect(parseSpeech("रमेश 200 रुपये")).toEqual({ name: "रमेश", amount: 200, type: "credit" });
  });

  it("treats jama as a payment", () => {
    expect(parseSpeech("सुरेश ने 500 रुपये जमा किए")).toEqual({ name: "सुरेश", amount: 500, type: "payment" });
  });

  it("understands number words like do sau", () => {
    expect(parseSpeech("mohan do sau rupaye")).toEqual({ name: "Mohan", amount: 200, type: "credit" });
  });

  it("handles ₹ and commas", () => {
    expect(parseSpeech("Sita ₹1,500")).toEqual({ name: "Sita", amount: 1500, type: "credit" });
  });

  it("returns null without an amount or name", () => {
    expect(parseSpeech("ramesh")).toBeNull();
    expect(parseSpeech("200 rupees")).toBeNull();
  });
});

describe("totals", () => {
  const entries: KhataEntry[] = [
    { id: "1", name: "Ramesh", amount: 200, type: "credit", createdAt: 1 },
    { id: "2", name: "ramesh", amount: 50, type: "payment", createdAt: 2 },
    { id: "3", name: "Sita", amount: 300, type: "credit", createdAt: 3 },
  ];

  it("balance is udhaar minus jama", () => {
    expect(calculateTotals(entries)).toEqual({ credit: 500, payment: 50, balance: 450 });
  });

  it("groups each customer's balance", () => {
    const s = summarizeCustomers(entries);
    expect(s.find((c) => c.key === "ramesh")?.balance).toBe(150);
    expect(s.find((c) => c.key === "sita")?.balance).toBe(300);
  });
});
