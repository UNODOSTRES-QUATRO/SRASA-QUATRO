export interface GameUIState {
  isPaused: boolean;
  isAudioMuted: boolean;
  activePrompt: string | null;
  dayNumber: number;
}

export function createInitialUIState(): GameUIState {
  return {
    isPaused: false,
    isAudioMuted: false,
    activePrompt: null,
    dayNumber: 1,
  };
}
