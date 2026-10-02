"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameCanvas } from "./GameCanvas";
import { WorldEnvironment } from "@/game/world/WorldEnvironment";
import { QuietHUD } from "@/components/ui/QuietHUD";
import { PauseOverlay } from "@/components/ui/PauseOverlay";
import {
  createInitialVehicleState,
  updateVehiclePhysics,
} from "@/game/vehicle/vehiclePhysics";
import { VehicleInput, VehicleState } from "@/game/vehicle/vehicleTypes";
import { useAudioEngine } from "@/game/audio/useAudioEngine";
import { soundManager } from "@/game/audio/SoundManager";

export default function ProjectQuatroApp() {
  const [vehicleState, setVehicleState] = useState<VehicleState>(createInitialVehicleState);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(
    "Drive down the familiar road to work."
  );

  const inputRef = useRef<VehicleInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  const stateRef = useRef<VehicleState>(createInitialVehicleState());

  // Link audio engine with current speed and mute state
  useAudioEngine(vehicleState.speed, isAudioMuted || isPaused);

  // Clear prompt after 7 seconds of driving
  useEffect(() => {
    const timer = setTimeout(() => {
      setActivePrompt(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        soundManager.playClick();
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused) return;

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          inputRef.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          inputRef.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          inputRef.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          inputRef.current.right = true;
          break;
        case "Space":
          inputRef.current.brake = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          inputRef.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          inputRef.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          inputRef.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          inputRef.current.right = false;
          break;
        case "Space":
          inputRef.current.brake = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPaused]);

  // Main 60FPS Physics Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPaused) {
        const nextState = updateVehiclePhysics(
          stateRef.current,
          inputRef.current,
          dt
        );
        stateRef.current = nextState;
        setVehicleState(nextState);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const handleToggleAudio = useCallback(() => {
    soundManager.playClick();
    setIsAudioMuted((prev) => !prev);
  }, []);

  const handleResume = useCallback(() => {
    soundManager.playClick();
    setIsPaused(false);
  }, []);

  return (
    <div className="relative w-full h-full">
      <GameCanvas vehicleState={vehicleState}>
        <WorldEnvironment />
      </GameCanvas>

      <QuietHUD
        vehicleState={vehicleState}
        activePrompt={activePrompt}
        onOpenPause={() => {
          soundManager.playClick();
          setIsPaused(true);
        }}
      />

      <PauseOverlay
        isOpen={isPaused}
        onResume={handleResume}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
      />
    </div>
  );
}
