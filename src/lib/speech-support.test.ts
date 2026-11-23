import { describe, expect, it } from "vitest";
import {
  buildSpeechEnv,
  canRetry,
  DEFAULT_SPEECH_ENV,
  detectPlatform,
  mapRecognitionError,
  voiceHelpKey,
} from "./speech-support";

const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 13; SM-A515F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";
const IOS_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
const IOS_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1";
const IPAD = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.1 Safari/605.1.15";
const ANDROID_WEBVIEW =
  "Mozilla/5.0 (Linux; Android 13; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0 Mobile Safari/537.36";

describe("detectPlatform", () => {
  it("detects Android Chrome", () => expect(detectPlatform(ANDROID_CHROME)).toBe("android"));
  it("detects iPhone Safari", () => expect(detectPlatform(IOS_SAFARI)).toBe("ios"));
  it("detects an iPad that reports itself as a Mac", () => expect(detectPlatform(IPAD, 5)).toBe("ios"));
  it("treats a real Mac as other", () => expect(detectPlatform(IPAD, 0)).toBe("other"));
});

describe("mapRecognitionError", () => {
  it("treats not-allowed as mic permission denied", () =>
    expect(mapRecognitionError("not-allowed", "android")).toBe("denied"));
  it("treats service-not-allowed on iPhone as dictation switched off", () =>
    expect(mapRecognitionError("service-not-allowed", "ios")).toBe("dictation-off"));
  it("treats service-not-allowed on Android as permission denied", () =>
    expect(mapRecognitionError("service-not-allowed", "android")).toBe("denied"));
  it("ignores aborted (user stopped)", () => expect(mapRecognitionError("aborted", "ios")).toBeNull());
  it("reports no internet", () => expect(mapRecognitionError("network", "android")).toBe("network"));
  it("reports missing microphone", () => expect(mapRecognitionError("audio-capture", "ios")).toBe("no-mic"));
});

describe("voiceHelpKey", () => {
  it("gives Android steps when the mic is blocked in Chrome", () =>
    expect(voiceHelpKey("denied", buildSpeechEnv({ ua: ANDROID_CHROME }))).toBe("deniedAndroid"));
  it("gives iPhone steps when the mic is blocked in Safari", () =>
    expect(voiceHelpKey("denied", buildSpeechEnv({ ua: IOS_SAFARI }))).toBe("deniedIos"));
  it("tells Chrome-on-iPhone users to open Safari", () => {
    const env = buildSpeechEnv({ ua: IOS_CHROME });
    expect(voiceHelpKey("unsupported", env)).toBe("unsupportedIosOther");
    expect(voiceHelpKey("denied", env)).toBe("deniedIosOther");
  });
  it("tells in-app browser users to open a real browser", () =>
    expect(voiceHelpKey("unsupported", buildSpeechEnv({ ua: ANDROID_WEBVIEW }))).toBe("unsupportedInApp"));
  it("explains a blocked preview frame", () =>
    expect(voiceHelpKey("denied", buildSpeechEnv({ ua: ANDROID_CHROME, inFrame: true }))).toBe("deniedFrame"));
  it("falls back to generic unsupported", () =>
    expect(voiceHelpKey("unsupported", DEFAULT_SPEECH_ENV)).toBe("unsupported"));
});

describe("canRetry", () => {
  it("offers retry after permission is denied", () => expect(canRetry("deniedAndroid")).toBe(true));
  it("does not offer retry when the browser has no voice support", () =>
    expect(canRetry("unsupported")).toBe(false));
});
