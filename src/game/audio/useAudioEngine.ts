"use client";

import { useEffect } from "react";
import { soundManager } from "./SoundManager";

export function useAudioEngine(speed: number, isMuted: boolean) {
  useEffect(() => {
    const handleFirstGesture = () => {
      soundManager.init();
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };

    window.addEventListener("keydown", handleFirstGesture);
    window.addEventListener("pointerdown", handleFirstGesture);

    return () => {
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };
  }, []);

  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    soundManager.updateEngine(speed);
  }, [speed]);
}
