"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameCanvas } from "./GameCanvas";
import { WorldEnvironment } from "@/game/world/WorldEnvironment";
import { QuietHUD } from "@/components/ui/QuietHUD";
import { PauseOverlay } from "@/components/ui/PauseOverlay";
import { WorkplaceMiniGame } from "@/components/ui/WorkplaceMiniGame";
import { PortalTransitionOverlay } from "@/components/ui/PortalTransitionOverlay";
import {
  createInitialVehicleState,
  updateVehiclePhysics,
} from "@/game/vehicle/vehiclePhysics";
import { VehicleInput, VehicleState } from "@/game/vehicle/vehicleTypes";
import {
  createInitialSessionState,
  advanceDay,
  GameSessionState,
} from "@/game/core/gameStore";
import { useAudioEngine } from "@/game/audio/useAudioEngine";
import { soundManager } from "@/game/audio/SoundManager";

export default function ProjectQuatroApp() {
  const [vehicleState, setVehicleState] = useState<VehicleState>(createInitialVehicleState);
  const [session, setSession] = useState<GameSessionState>(createInitialSessionState);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);

  const inputRef = useRef<VehicleInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  const stateRef = useRef<VehicleState>(createInitialVehicleState());

  // Link audio engine with current speed and mute state
  useAudioEngine(
    vehicleState.speed,
    session.isAudioMuted || session.isPaused || isWorkModalOpen || isPortalModalOpen
  );

  // Proximity checks for Office and Portal
  useEffect(() => {
    const { position } = vehicleState;
    const { dayNumber, workDone } = session;

    // Check distance to office parking bay: [8, 0, 70]
    const distToOffice = Math.hypot(position.x - 8, position.z - 70);

    if (distToOffice < 6 && !workDone && dayNumber < 3) {
      setSession((prev) => ({
        ...prev,
        activePrompt: "Parked at office. Press [SPACE] or Click to Start Work.",
        officeParkingUnlocked: true,
      }));
    } else if (dayNumber === 3 && position.z > 98) {
      // Reached Voxel Portal!
      soundManager.playMeow();
      setIsPortalModalOpen(true);
    } else if (distToOffice >= 6 && session.officeParkingUnlocked && !workDone) {
      setSession((prev) => ({
        ...prev,
        activePrompt: null,
        officeParkingUnlocked: false,
      }));
    }
  }, [vehicleState, session.dayNumber, session.workDone, session.officeParkingUnlocked]);

  // Keyboard input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        soundManager.playClick();
        if (isWorkModalOpen) {
          setIsWorkModalOpen(false);
        } else if (isPortalModalOpen) {
          setIsPortalModalOpen(false);
        } else {
          setSession((prev) => ({ ...prev, isPaused: !prev.isPaused }));
        }
        return;
      }

      if (session.isPaused || isWorkModalOpen || isPortalModalOpen) return;

      if (e.code === "Space") {
        if (session.officeParkingUnlocked && !session.workDone) {
          soundManager.playClick();
          setIsWorkModalOpen(true);
          return;
        }
        inputRef.current.brake = true;
        return;
      }

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
  }, [session.isPaused, session.officeParkingUnlocked, session.workDone, isWorkModalOpen, isPortalModalOpen]);

  // 60FPS Physics Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!session.isPaused && !isWorkModalOpen && !isPortalModalOpen) {
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
  }, [session.isPaused, isWorkModalOpen, isPortalModalOpen]);

  const handleToggleAudio = useCallback(() => {
    soundManager.playClick();
    setSession((prev) => ({ ...prev, isAudioMuted: !prev.isAudioMuted }));
  }, []);

  const handleResume = useCallback(() => {
    soundManager.playClick();
    setSession((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const handleCompleteWork = useCallback(() => {
    setIsWorkModalOpen(false);
    soundManager.playPurr();

    // Advance to next day and reset car to home road position
    const nextSession = advanceDay(session);
    setSession(nextSession);

    // Reset car position
    const resetVehicle = createInitialVehicleState();
    stateRef.current = resetVehicle;
    setVehicleState(resetVehicle);
  }, [session]);

  const handleEnterVoxelWorld = useCallback(() => {
    soundManager.playPurr();
    setIsPortalModalOpen(false);
    setSession((prev) => ({
      ...prev,
      portalEntered: true,
      activePrompt: "Chapter 2: The Castle awaits ahead in the Voxel Dimension.",
    }));
  }, []);

  const handlePromptAction = session.officeParkingUnlocked && !session.workDone
    ? () => setIsWorkModalOpen(true)
    : undefined;

  return (
    <div className="relative w-full h-full">
      <GameCanvas vehicleState={vehicleState} isCatAlert={session.catAlert}>
        <WorldEnvironment dayNumber={session.dayNumber} />
      </GameCanvas>

      <QuietHUD
        vehicleState={vehicleState}
        activePrompt={session.activePrompt}
        dayNumber={session.dayNumber}
        catAlert={session.catAlert}
        onOpenPause={() => {
          soundManager.playClick();
          setSession((prev) => ({ ...prev, isPaused: true }));
        }}
        onPromptAction={handlePromptAction}
      />

      <WorkplaceMiniGame
        isOpen={isWorkModalOpen}
        dayNumber={session.dayNumber}
        onComplete={handleCompleteWork}
        onClose={() => setIsWorkModalOpen(false)}
      />

      <PortalTransitionOverlay
        isOpen={isPortalModalOpen}
        onEnterVoxelWorld={handleEnterVoxelWorld}
      />

      <PauseOverlay
        isOpen={session.isPaused}
        onResume={handleResume}
        isAudioMuted={session.isAudioMuted}
        onToggleAudio={handleToggleAudio}
      />
    </div>
  );
}
