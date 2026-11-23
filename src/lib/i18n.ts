export type Lang = "hi" | "en";

export const STRINGS = {
  hi: {
    appName: "वॉइस खाता",
    tagline: "बोलो, और खाते में लिख जाएगा",
    totalBalance: "कुल बाकी",
    credit: "उधार",
    payment: "जमा",
    tapToSpeak: "बोलने के लिए दबाएँ",
    listening: "सुन रहा हूँ… बोलिए",
    example: "जैसे: “रमेश 200 रुपये” या “सुरेश 500 जमा”",
    notUnderstood: "समझ नहीं आया। नाम और रकम दोनों बोलिए।",
    starting: "माइक चालू हो रहा है…",
    tapToStop: "रोकने के लिए दबाएँ",
    tryAgain: "दोबारा कोशिश करें",
    typeInstead: "टाइप करके जोड़ें",
    entries: "सभी एंट्री",
    customers: "ग्राहक",
    emptyTitle: "अभी खाता खाली है",
    emptyHint: "ऊपर माइक दबाकर पहली एंट्री बोलिए",
    added: "जोड़ दिया",
    undo: "वापस लें",
    deleted: "हटा दिया",
    name: "ग्राहक का नाम",
    amount: "रकम (₹)",
    addCredit: "उधार जोड़ें",
    addPayment: "जमा जोड़ें",
    manualTitle: "नई एंट्री",
    youHeard: "सुना:",
    showAll: "सब दिखाएँ",
    entriesCount: (n: number) => `${n} एंट्री`,
    settled: "हिसाब बराबर",
    advance: "एडवांस",
    delete: "हटाएँ",
    voiceHelp: {
      unsupported: {
        title: "इस ब्राउज़र में आवाज़ नहीं चलती",
        hint: "Android पर Chrome और iPhone पर Safari में खोलें। तब तक नीचे टाइप करके जोड़ें।",
      },
      unsupportedIosOther: {
        title: "iPhone पर Safari में खोलें",
        hint: "iPhone पर आवाज़ सिर्फ़ Safari में चलती है। यह लिंक कॉपी करके Safari में खोलें।",
      },
      unsupportedInApp: {
        title: "Chrome या Safari में खोलें",
        hint: "WhatsApp / Facebook के अंदर आवाज़ नहीं चलती। ऊपर ⋮ मेनू से “ब्राउज़र में खोलें” चुनें।",
      },
      insecure: {
        title: "सुरक्षित लिंक से खोलें",
        hint: "माइक सिर्फ़ https:// वाले लिंक पर चलता है।",
      },
      denied: {
        title: "माइक की अनुमति नहीं मिली",
        hint: "ब्राउज़र की सेटिंग में इस साइट के लिए माइक्रोफ़ोन “Allow” करें, फिर दोबारा दबाएँ।",
      },
      deniedAndroid: {
        title: "माइक की अनुमति नहीं मिली",
        hint: "ऊपर पता-बार में 🔒 पर दबाएँ → अनुमतियाँ (Permissions) → माइक्रोफ़ोन → Allow। फिर दोबारा दबाएँ।",
      },
      deniedIos: {
        title: "माइक की अनुमति नहीं मिली",
        hint: "पता-बार में “aA” दबाएँ → वेबसाइट सेटिंग्स → माइक्रोफ़ोन → Allow। फिर दोबारा दबाएँ।",
      },
      deniedIosOther: {
        title: "iPhone पर Safari में खोलें",
        hint: "इस ब्राउज़र में माइक नहीं चलता। यह लिंक Safari में खोलें, या टाइप करके जोड़ें।",
      },
      deniedFrame: {
        title: "यहाँ माइक बंद है",
        hint: "यह झलक (preview) माइक रोक रही है। ऐप को नए टैब में या असली लिंक पर खोलें।",
      },
      dictationOff: {
        title: "iPhone में डिक्टेशन बंद है",
        hint: "सेटिंग्स → सामान्य → कीबोर्ड → “डिक्टेशन चालू करें” ऑन करें, फिर दोबारा दबाएँ।",
      },
      noMic: {
        title: "माइक नहीं मिला",
        hint: "कोई कॉल या रिकॉर्डर ऐप माइक तो नहीं चला रहा? उसे बंद करके दोबारा दबाएँ।",
      },
      network: {
        title: "इंटरनेट नहीं है",
        hint: "आवाज़ पहचानने के लिए इंटरनेट चाहिए। डेटा या Wi-Fi चालू करके दोबारा दबाएँ।",
      },
      noSpeech: {
        title: "कुछ सुनाई नहीं दिया",
        hint: "माइक दबाकर तुरंत और साफ़ बोलिए, जैसे “रमेश 200 रुपये”।",
      },
      language: {
        title: "इस फ़ोन पर हिंदी आवाज़ नहीं है",
        hint: "ऊपर EN चुनकर अंग्रेज़ी में बोलें, या टाइप करके जोड़ें।",
      },
      other: {
        title: "आवाज़ शुरू नहीं हो पाई",
        hint: "दोबारा दबाएँ। बार-बार हो तो पेज रीफ़्रेश करें या टाइप करके जोड़ें।",
      },
    },
  },
  en: {
    appName: "Voice Khata",
    tagline: "Just speak — it goes in the khata",
    totalBalance: "Total balance due",
    credit: "Udhaar",
    payment: "Jama",
    tapToSpeak: "Tap to speak",
    listening: "Listening… speak now",
    example: "Say: “Ramesh 200 rupees” or “Suresh 500 jama”",
    notUnderstood: "Didn't catch that. Say a name and an amount.",
    starting: "Starting the mic…",
    tapToStop: "Tap to stop",
    tryAgain: "Try again",
    typeInstead: "Add by typing",
    entries: "All entries",
    customers: "Customers",
    emptyTitle: "Your khata is empty",
    emptyHint: "Tap the mic above and speak your first entry",
    added: "Added",
    undo: "Undo",
    deleted: "Deleted",
    name: "Customer name",
    amount: "Amount (₹)",
    addCredit: "Add udhaar",
    addPayment: "Add jama",
    manualTitle: "New entry",
    youHeard: "Heard:",
    showAll: "Show all",
    entriesCount: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,
    settled: "Settled",
    advance: "Advance",
    delete: "Delete",
    voiceHelp: {
      unsupported: {
        title: "Voice doesn't work in this browser",
        hint: "Use Chrome on Android or Safari on iPhone. Meanwhile, add by typing below.",
      },
      unsupportedIosOther: {
        title: "Open in Safari on iPhone",
        hint: "On iPhone, voice only works in Safari. Copy this link and open it in Safari.",
      },
      unsupportedInApp: {
        title: "Open in Chrome or Safari",
        hint: "Voice doesn't work inside WhatsApp / Facebook. Use the ⋮ menu → “Open in browser”.",
      },
      insecure: {
        title: "Open the secure link",
        hint: "The microphone only works on links that start with https://.",
      },
      denied: {
        title: "Microphone is blocked",
        hint: "Allow the microphone for this site in your browser settings, then tap again.",
      },
      deniedAndroid: {
        title: "Microphone is blocked",
        hint: "Tap the 🔒 in the address bar → Permissions → Microphone → Allow. Then tap again.",
      },
      deniedIos: {
        title: "Microphone is blocked",
        hint: "Tap “aA” in the address bar → Website Settings → Microphone → Allow. Then tap again.",
      },
      deniedIosOther: {
        title: "Open in Safari on iPhone",
        hint: "This browser can't use the mic on iPhone. Open this link in Safari, or add by typing.",
      },
      deniedFrame: {
        title: "Mic is blocked here",
        hint: "This preview window blocks the mic. Open the app in a new tab or its real link.",
      },
      dictationOff: {
        title: "Dictation is off on this iPhone",
        hint: "Settings → General → Keyboard → turn on “Enable Dictation”, then tap again.",
      },
      noMic: {
        title: "No microphone found",
        hint: "Is a call or recorder app using the mic? Close it and tap again.",
      },
      network: {
        title: "No internet",
        hint: "Voice needs internet. Turn on mobile data or Wi-Fi and tap again.",
      },
      noSpeech: {
        title: "Didn't hear anything",
        hint: "Tap and speak right away, clearly — like “Ramesh 200 rupees”.",
      },
      language: {
        title: "English voice isn't available here",
        hint: "Tap हिंदी above and speak in Hindi, or add by typing.",
      },
      other: {
        title: "Couldn't start the mic",
        hint: "Tap again. If it keeps happening, refresh the page or add by typing.",
      },
    },
  },
} as const;

export type Strings = (typeof STRINGS)[Lang];
