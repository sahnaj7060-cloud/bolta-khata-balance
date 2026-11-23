import { Loader2, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  phase: "idle" | "starting" | "listening";
  onPress: () => void;
  label: string;
}

export function MicButton({ phase, onPress, label }: Props) {
  const active = phase !== "idle";
  return (
    <div className="relative flex h-52 w-52 select-none items-center justify-center">
      {phase === "listening" && (
        <>
          <span className="pointer-events-none absolute inset-4 rounded-full bg-primary animate-mic-pulse" />
          <span
            className="pointer-events-none absolute inset-4 rounded-full bg-accent animate-mic-pulse"
            style={{ animationDelay: "0.8s" }}
          />
        </>
      )}
      <button
        type="button"
        // onClick fires once per tap on touch screens and keeps the tap as a "user gesture",
        // which iPhone Safari requires before it allows the microphone.
        onClick={onPress}
        // An empty touch listener makes :active styles work on iOS Safari.
        onTouchStart={() => {}}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={label}
        aria-pressed={active}
        aria-busy={phase === "starting"}
        className={cn(
          "relative flex h-44 w-44 touch-manipulation select-none items-center justify-center rounded-full bg-mic text-primary-foreground shadow-mic [-webkit-touch-callout:none]",
          "ring-8 ring-paper transition-transform duration-200 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-accent",
          active && "scale-105",
        )}
      >
        {phase === "listening" ? (
          <Square className="pointer-events-none h-16 w-16" fill="currentColor" strokeWidth={0} />
        ) : phase === "starting" ? (
          <Loader2 className="pointer-events-none h-20 w-20 animate-spin" strokeWidth={2.2} />
        ) : (
          <Mic className="pointer-events-none h-20 w-20" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
