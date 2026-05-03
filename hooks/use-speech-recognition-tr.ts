"use client";

import { useCallback, useState } from "react";

type Status = "idle" | "listening" | "unsupported" | "error";

type WebSpeechRecognitionResultList = {
  readonly length: number;
  [index: number]: { readonly transcript: string };
};

type WebSpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    readonly length: number;
    [index: number]: WebSpeechRecognitionResultList;
  };
};

type WebSpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

type WebSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  onresult: ((ev: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: WebSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type WebSpeechRecognitionCtor = new () => WebSpeechRecognition;

function getSpeechRecognitionCtor(): WebSpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: WebSpeechRecognitionCtor;
    webkitSpeechRecognition?: WebSpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognitionTr() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const supported =
    typeof window !== "undefined" && getSpeechRecognitionCtor() !== null;

  const listen = useCallback((onResult: (text: string) => void) => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setStatus("unsupported");
      setError(
        "Tarayıcınız sesli girişi desteklemiyor (Chrome veya Edge önerilir).",
      );
      return;
    }
    setError(null);
    setStatus("listening");
    const rec = new Ctor();
    rec.lang = "tr-TR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev: WebSpeechRecognitionEvent) => {
      let text = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript;
      }
      const t = text.trim();
      if (t) onResult(t);
      setStatus("idle");
    };
    rec.onerror = (ev: WebSpeechRecognitionErrorEvent) => {
      if (ev.error === "aborted" || ev.error === "no-speech") {
        setStatus("idle");
        return;
      }
      setStatus("error");
      setError(ev.message || "Ses tanıma hatası");
    };
    rec.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };
    try {
      rec.start();
    } catch {
      setStatus("error");
      setError("Mikrofon başlatılamadı.");
    }
  }, []);

  return {
    listen,
    status,
    error,
    supported,
    clearError: () => setError(null),
  };
}
