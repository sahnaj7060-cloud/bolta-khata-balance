import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildSpeechEnv,
  DEFAULT_SPEECH_ENV,
  mapRecognitionError,
  voiceHelpKey,
  type SpeechEnv,
  type SpeechError,
  type VoiceHelpKey,
} from "@/lib/speech-support";

/* Minimal typings for the Web Speech API (not in lib.dom for all browsers). */
interface SpeechResultLike {
  isFinal: boolean;
  0?: { transcript: string };
}
interface SpeechEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechResultLike>;
}
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((e: SpeechEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => RecognitionLike;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function readEnv(): SpeechEnv {
  if (typeof window === "undefined") return DEFAULT_SPEECH_ENV;
  let inFrame = false;
  try {
    inFrame = window.self !== window.top;
  } catch {
    inFrame = true;
  }
  return buildSpeechEnv({
    ua: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    inFrame,
    secure: window.isSecureContext !== false,
  });
}

/** Stop after this much silence once words were heard (iOS Safari keeps listening otherwise). */
const SILENCE_MS = 1800;
/** Hard limit for one recording. */
const MAX_MS = 15000;
/** Ignore a second tap this soon after the first (ghost/double taps on touch screens). */
const TAP_GUARD_MS = 450;

export type SpeechPhase = "idle" | "starting" | "listening";

export function useSpeech(lang: string, onFinal: (text: string) => void) {
  const [supported, setSupported] = useState(true);
  const [phase, setPhase] = useState<SpeechPhase>("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<SpeechError | null>(null);
  const [env, setEnv] = useState<SpeechEnv>(DEFAULT_SPEECH_ENV);

  const recRef = useRef<RecognitionLike | null>(null);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;
  const envRef = useRef(env);
  envRef.current = env;
  const permRef = useRef<PermissionState | "unknown">("unknown");
  const lastTapRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    const e = readEnv();
    setEnv(e);
    setSupported(getCtor() !== null && e.secure);

    // Remember whether the mic is already blocked (Chrome/Android and newer Safari support this).
    let status: PermissionStatus | null = null;
    let cancelled = false;
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((s) => {
        if (cancelled) return;
        status = s;
        permRef.current = s.state;
        s.onchange = () => {
          permRef.current = s.state;
          if (s.state !== "denied") setError((prev) => (prev === "denied" ? null : prev));
        };
      })
      .catch(() => {
        /* not supported — we find out on first use */
      });

    // Switching apps or locking the phone mid-recording can leave the mic stuck.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") recRef.current?.abort();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (status) status.onchange = null;
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimers();
      recRef.current?.abort();
    };
  }, []);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      rec.abort();
    }
  }, []);

  /** Must be called directly from a tap — iPhone only allows the mic inside a user gesture. */
  const start = useCallback(() => {
    if (recRef.current) return;
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setError("insecure");
      return;
    }
    const Ctor = getCtor();
    if (!Ctor) {
      setError("unsupported");
      return;
    }
    if (permRef.current === "denied") {
      setError("denied");
      return;
    }

    let rec: RecognitionLike;
    try {
      rec = new Ctor();
    } catch {
      setError("unsupported");
      return;
    }
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    let delivered = false;
    let ended = false;
    let latest = "";

    const deliver = (text: string) => {
      if (delivered) return;
      const clean = text.trim();
      if (!clean) return;
      delivered = true;
      setInterim(clean);
      finalRef.current(clean);
    };

    const finish = () => {
      if (ended) return;
      ended = true;
      clearTimers();
      if (recRef.current === rec) recRef.current = null;
      setPhase("idle");
      // Safari (and sometimes Android) end without marking a result final — use what we heard.
      if (!delivered && latest) deliver(latest);
      if (!delivered) setInterim("");
    };

    const later = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    const armSilence = () => {
      clearTimers();
      later(() => stop(), SILENCE_MS);
      later(forceEnd, MAX_MS);
    };

    function forceEnd() {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      // Some iPhones never fire `end`; reset ourselves so the button keeps working.
      later(() => {
        if (!ended) {
          try {
            rec.abort();
          } catch {
            /* ignore */
          }
          finish();
        }
      }, 1500);
    }

    rec.onstart = () => setPhase("listening");
    rec.onresult = (e) => {
      // Not continuous: the last result holds the whole sentence so far.
      const r = e.results[e.results.length - 1];
      const text = r?.[0]?.transcript ?? "";
      if (!text) return;
      setPhase("listening");
      latest = text;
      setInterim(text);
      if (r?.isFinal) {
        deliver(text);
        stop();
      } else {
        armSilence();
      }
    };
    rec.onerror = (e) => {
      const mapped = mapRecognitionError(e.error, envRef.current.platform);
      if (mapped === "no-speech" && latest) return;
      if (mapped) setError(mapped);
    };
    rec.onend = finish;

    recRef.current = rec;
    setError(null);
    setInterim("");
    setPhase("starting");
    later(forceEnd, MAX_MS);
    try {
      rec.start();
    } catch {
      recRef.current = null;
      ended = true;
      clearTimers();
      setPhase("idle");
      setError("other");
    }
  }, [lang, stop]);

  /** One handler for the mic button: start, or stop if already recording. */
  const toggle = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < TAP_GUARD_MS) return;
    lastTapRef.current = now;
    if (recRef.current) stop();
    else start();
  }, [start, stop]);

  const problem: VoiceHelpKey | null = error
    ? voiceHelpKey(error, env)
    : !supported
      ? voiceHelpKey(env.secure ? "unsupported" : "insecure", env)
      : null;

  return {
    supported,
    phase,
    listening: phase !== "idle",
    interim,
    error,
    problem,
    start,
    stop,
    toggle,
    clearError: () => setError(null),
  };
}
