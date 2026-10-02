"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameCanvas } from "./GameCanvas";
import { WorldEnvironment } from "@/game/world/WorldEnvironment";
import { QuietHUD } from "@/components/ui/QuietHUD";
import { PauseOverlay } from "@/components/ui/PauseOverlay";
import { WorkplaceMiniGame } from "@/components/ui/WorkplaceMiniGame";
import { PortalTransitionOverlay } from "@/components/ui/PortalTransitionOverlay";
import { GuardianDialogueModal } from "@/components/ui/GuardianDialogueModal";
import {
  createInitialVehicleState,
  updateVehiclePhysics,
  toggleVehicleScale,
} from "@/game/vehicle/vehiclePhysics";
import { VehicleInput, VehicleState } from "@/game/vehicle/vehicleTypes";
import {
  createInitialSessionState,
  advanceDay,
  GameSessionState,
} from "@/game/core/gameStore";
import { useAudioEngine } from "@/game/audio/useAudioEngine";
import { soundManager } from "@/game/audio/SoundManager";
import { useGameRealtime } from "@/game/realtime/useGameRealtime";

export default function ProjectQuatroApp() {
  const [vehicleState, setVehicleState] = useState<VehicleState>(createInitialVehicleState);
  const [session, setSession] = useState<GameSessionState>(createInitialSessionState);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);

  // Supabase Realtime synchronization for multiplayer positions and status
  const { remotePlayers } = useGameRealtime({
    vehicleState,
    isEnabled: true,
  });

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
    session.isAudioMuted ||
      session.isPaused ||
      isWorkModalOpen ||
      isPortalModalOpen ||
      isGuardianModalOpen
  );

  const handleTogglePocketMode = useCallback(() => {
    soundManager.playClick();
    const nextVehicle = toggleVehicleScale(stateRef.current);
    stateRef.current = nextVehicle;
    setVehicleState(nextVehicle);

    if (nextVehicle.scaleMode === "POCKET") {
      soundManager.playMeow();
    } else {
      soundManager.playPurr();
    }
  }, []);

  // Proximity checks for Office, Portal, Guardian, Puzzle, and Castle Gate
  useEffect(() => {
    const { position, scaleMode } = vehicleState;
    const { dayNumber, workDone, guardianSpoken, puzzleSolved, castleGateOpen } = session;

    // 1. Office Parking bay: [8, 0, 70]
    const distToOffice = Math.hypot(position.x - 8, position.z - 70);
    if (distToOffice < 6 && !workDone && dayNumber < 3) {
      setSession((prev) => ({
        ...prev,
        activePrompt: "Parked at office. Press [SPACE] or [E] to Start Work.",
        officeParkingUnlocked: true,
      }));
      return;
    } else if (distToOffice >= 6 && session.officeParkingUnlocked && !workDone) {
      setSession((prev) => ({
        ...prev,
        activePrompt: null,
        officeParkingUnlocked: false,
      }));
    }

    // 2. Day 3 Voxel Portal at z=100
    if (dayNumber === 3 && position.z > 98 && position.z < 108 && !session.portalEntered) {
      soundManager.playMeow();
      setIsPortalModalOpen(true);
      return;
    }

    // 3. The Guardian NPC at [-3.8, 0, 131]
    const distToGuardian = Math.hypot(position.x - (-3.8), position.z - 131);
    if (dayNumber === 3 && distToGuardian < 5.0 && !guardianSpoken) {
      setSession((prev) => ({
        ...prev,
        activePrompt: "The Guardian is observing you. Press [E] or Click to speak.",
      }));
      return;
    }

    // 4. Dual-Scale Puzzle Pressure Plate inside conduit at [7.2, 0, 141]
    const distToPlate = Math.hypot(position.x - 7.2, position.z - 141);
    if (dayNumber === 3 && scaleMode === "POCKET" && distToPlate < 1.3 && !puzzleSolved) {
      soundManager.playPurr();
      setSession((prev) => ({
        ...prev,
        puzzleSolved: true,
        castleGateOpen: true,
        activePrompt:
          "✦ Rune Activated! Castle Portcullis opened! Switch back to Big Car [Q] to drive in.",
      }));
      return;
    }

    // 5. Castle Gate Collision (Z = 135 to 137)
    if (dayNumber === 3 && !castleGateOpen && position.z > 134.6 && position.z < 137.2) {
      // If Big Car mode, gate blocks entry
      if (scaleMode === "BIG") {
        stateRef.current.position.z = 134.4;
        stateRef.current.speed = -Math.abs(stateRef.current.speed) * 0.3;
        setVehicleState({ ...stateRef.current });
        setSession((prev) => ({
          ...prev,
          activePrompt:
            "The Castle Gate is locked! Speak with The Guardian or find a smaller way [Q].",
        }));
        return;
      }
    }

    // 6. Inside Castle Courtyard (Z > 146)
    if (dayNumber === 3 && position.z > 146) {
      setSession((prev) => ({
        ...prev,
        activePrompt: "Castle Courtyard reached. The Semicolon Sanctuary awaits.",
      }));
    }
  }, [
    vehicleState,
    session.dayNumber,
    session.workDone,
    session.officeParkingUnlocked,
    session.portalEntered,
    session.guardianSpoken,
    session.puzzleSolved,
    session.castleGateOpen,
  ]);

  // Keyboard input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        soundManager.playClick();
        if (isWorkModalOpen) {
          setIsWorkModalOpen(false);
        } else if (isPortalModalOpen) {
          setIsPortalModalOpen(false);
        } else if (isGuardianModalOpen) {
          setIsGuardianModalOpen(false);
        } else {
          setSession((prev) => ({ ...prev, isPaused: !prev.isPaused }));
        }
        return;
      }

      if (
        session.isPaused ||
        isWorkModalOpen ||
        isPortalModalOpen ||
        isGuardianModalOpen
      )
        return;

      // [Q] key toggles Pocket Car Transformation!
      if (e.code === "KeyQ") {
        handleTogglePocketMode();
        return;
      }

      // [E] or [Space] for interactions
      if (e.code === "KeyE") {
        const { position } = vehicleState;
        const distToGuardian = Math.hypot(position.x - (-3.8), position.z - 131);
        if (session.dayNumber === 3 && distToGuardian < 5.5) {
          soundManager.playClick();
          setIsGuardianModalOpen(true);
          return;
        }
        if (session.officeParkingUnlocked && !session.workDone) {
          soundManager.playClick();
          setIsWorkModalOpen(true);
          return;
        }
      }

      if (e.code === "Space") {
        if (session.officeParkingUnlocked && !session.workDone) {
          soundManager.playClick();
          setIsWorkModalOpen(true);
          return;
        }
        const { position } = vehicleState;
        const distToGuardian = Math.hypot(position.x - (-3.8), position.z - 131);
        if (session.dayNumber === 3 && distToGuardian < 5.5) {
          soundManager.playClick();
          setIsGuardianModalOpen(true);
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
  }, [
    session.isPaused,
    session.officeParkingUnlocked,
    session.workDone,
    session.dayNumber,
    isWorkModalOpen,
    isPortalModalOpen,
    isGuardianModalOpen,
    handleTogglePocketMode,
    vehicleState,
  ]);

  // 60FPS Physics Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (
        !session.isPaused &&
        !isWorkModalOpen &&
        !isPortalModalOpen &&
        !isGuardianModalOpen
      ) {
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
  }, [session.isPaused, isWorkModalOpen, isPortalModalOpen, isGuardianModalOpen]);

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
      activePrompt: "Chapter 2: The Castle awaits ahead. Find The Guardian.",
    }));
  }, []);

  const handleGuardianPocketUnlocked = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      guardianSpoken: true,
      pocketUnlocked: true,
      activePrompt:
        "Guardian consulted. Press [Q] to shrink into Pocket Car and enter the low conduit.",
    }));
  }, []);

  // Determine prompt action handler
  const distToGuardian = Math.hypot(
    vehicleState.position.x - (-3.8),
    vehicleState.position.z - 131
  );
  const handlePromptAction =
    session.officeParkingUnlocked && !session.workDone
      ? () => setIsWorkModalOpen(true)
      : session.dayNumber === 3 && distToGuardian < 5.5
      ? () => setIsGuardianModalOpen(true)
      : undefined;

  return (
    <div className="relative w-full h-full">
      <GameCanvas
        vehicleState={vehicleState}
        isCatAlert={session.catAlert}
        remotePlayers={remotePlayers}
      >
        <WorldEnvironment
          dayNumber={session.dayNumber}
          gateOpen={session.castleGateOpen}
          puzzleSolved={session.puzzleSolved}
        />
      </GameCanvas>

      <QuietHUD
        vehicleState={vehicleState}
        activePrompt={session.activePrompt}
        dayNumber={session.dayNumber}
        catAlert={session.catAlert}
        pocketUnlocked={session.pocketUnlocked}
        onOpenPause={() => {
          soundManager.playClick();
          setSession((prev) => ({ ...prev, isPaused: true }));
        }}
        onPromptAction={handlePromptAction}
        onTogglePocketMode={handleTogglePocketMode}
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

      <GuardianDialogueModal
        isOpen={isGuardianModalOpen}
        onClose={() => setIsGuardianModalOpen(false)}
        onPocketUnlocked={handleGuardianPocketUnlocked}
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

