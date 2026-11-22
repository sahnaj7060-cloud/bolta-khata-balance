import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  listening: boolean;
  onPress: () => void;
  label: string;
}

export function MicButton({ listening, onPress, label }: Props) {
  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      {listening && (
        <>
          <span className="absolute inset-4 rounded-full bg-primary animate-mic-pulse" />
          <span
            className="absolute inset-4 rounded-full bg-accent animate-mic-pulse"
            style={{ animationDelay: "0.8s" }}
          />
        </>
      )}
      <button
        type="button"
        onClick={onPress}
        aria-label={label}
        aria-pressed={listening}
        className={cn(
          "relative flex h-44 w-44 items-center justify-center rounded-full bg-mic text-primary-foreground shadow-mic",
          "ring-8 ring-paper transition-transform duration-200 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-accent",
          listening && "scale-105",
        )}
      >
        {listening ? (
          <Square className="h-16 w-16" fill="currentColor" strokeWidth={0} />
        ) : (
          <Mic className="h-20 w-20" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
