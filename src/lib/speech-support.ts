/**
 * Pure helpers for voice input on phones: platform detection, mapping
 * browser speech errors, and choosing which help message to show.
 * Kept UI-free so it can be unit tested.
 */

export type Platform = "ios" | "android" | "other";

export type SpeechError =
  | "unsupported"
  | "insecure"
  | "denied"
  | "dictation-off"
  | "no-mic"
  | "network"
  | "no-speech"
  | "language"
  | "other";

export type VoiceHelpKey =
  | "unsupported"
  | "unsupportedIosOther"
  | "unsupportedInApp"
  | "insecure"
  | "denied"
  | "deniedAndroid"
  | "deniedIos"
  | "deniedIosOther"
  | "deniedFrame"
  | "dictationOff"
  | "noMic"
  | "network"
  | "noSpeech"
  | "language"
  | "other";

export interface SpeechEnv {
  platform: Platform;
  /** Chrome / Firefox / Edge on iPhone — voice only works in Safari there. */
  iosOtherBrowser: boolean;
  /** WhatsApp, Facebook, Instagram or Android WebView in-app browser. */
  inApp: boolean;
  /** Running inside an iframe (e.g. an editor preview) that may block the mic. */
  inFrame: boolean;
  secure: boolean;
}

export const DEFAULT_SPEECH_ENV: SpeechEnv = {
  platform: "other",
  iosOtherBrowser: false,
  inApp: false,
  inFrame: false,
  secure: true,
};

export function detectPlatform(ua: string, maxTouchPoints = 0): Platform {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  // iPadOS reports itself as a Mac, but has a touch screen.
  if (/Macintosh/i.test(ua) && maxTouchPoints > 1) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function isIosOtherBrowser(ua: string): boolean {
  return /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

export function isInAppBrowser(ua: string): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|; wv\)/i.test(ua);
}

export function buildSpeechEnv(opts: {
  ua: string;
  maxTouchPoints?: number;
  inFrame?: boolean;
  secure?: boolean;
}): SpeechEnv {
  const platform = detectPlatform(opts.ua, opts.maxTouchPoints ?? 0);
  return {
    platform,
    iosOtherBrowser: platform === "ios" && isIosOtherBrowser(opts.ua),
    inApp: isInAppBrowser(opts.ua),
    inFrame: opts.inFrame ?? false,
    secure: opts.secure ?? true,
  };
}

/** Map a SpeechRecognition `error` code. Returns null for errors to ignore. */
export function mapRecognitionError(code: string, platform: Platform): SpeechError | null {
  switch (code) {
    case "not-allowed":
      return "denied";
    case "service-not-allowed":
      // On iPhone this means Siri/Dictation is switched off in Settings.
      return platform === "ios" ? "dictation-off" : "denied";
    case "audio-capture":
      return "no-mic";
    case "network":
      return "network";
    case "no-speech":
      return "no-speech";
    case "language-not-supported":
      return "language";
    case "aborted":
      return null;
    default:
      return "other";
  }
}

export function voiceHelpKey(error: SpeechError, env: SpeechEnv): VoiceHelpKey {
  switch (error) {
    case "unsupported":
      if (env.inApp) return "unsupportedInApp";
      if (env.iosOtherBrowser) return "unsupportedIosOther";
      return "unsupported";
    case "insecure":
      return "insecure";
    case "denied":
      if (env.iosOtherBrowser) return "deniedIosOther";
      if (env.inFrame) return "deniedFrame";
      if (env.platform === "ios") return "deniedIos";
      if (env.platform === "android") return "deniedAndroid";
      return "denied";
    case "dictation-off":
      return env.iosOtherBrowser ? "deniedIosOther" : "dictationOff";
    case "no-mic":
      return "noMic";
    case "network":
      return "network";
    case "no-speech":
      return "noSpeech";
    case "language":
      return "language";
    default:
      return "other";
  }
}

/** Whether tapping the mic again could fix the problem. */
export function canRetry(key: VoiceHelpKey): boolean {
  return ![
    "unsupported",
    "unsupportedIosOther",
    "unsupportedInApp",
    "insecure",
    "deniedIosOther",
    "language",
  ].includes(key);
}
