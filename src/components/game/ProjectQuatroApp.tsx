"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GameCanvas } from "./GameCanvas";
import { HouseInterior } from "@/game/world/HouseInterior";
import { HighwayDriveScene } from "@/game/world/HighwayDriveScene";
import { WorkplaceInterior } from "@/game/world/WorkplaceInterior";
import { MechanicShopScene } from "@/game/world/MechanicShopScene";
import { CastleExteriorScene } from "@/game/world/CastleExteriorScene";
import { CastleEscapeRoomScene } from "@/game/world/CastleEscapeRoomScene";

import { HomeRoutineOverlay } from "@/components/ui/HomeRoutineOverlay";
import { RoadNavigationModal } from "@/components/ui/RoadNavigationModal";
import { OfficeWorkstationModal } from "@/components/ui/OfficeWorkstationModal";
import { VoidLoreCutsceneModal } from "@/components/ui/VoidLoreCutsceneModal";
import { CastleLoreDialogueModal } from "@/components/ui/CastleLoreDialogueModal";
import { CastleEscapeRoomModal } from "@/components/ui/CastleEscapeRoomModal";
import { EndCreditsScene } from "@/components/ui/EndCreditsScene";
import { PauseOverlay } from "@/components/ui/PauseOverlay";

import {
  createInitialSessionState,
  advanceDay,
  arriveAtWork,
  arriveHomeForEvening,
  beginCommuteHome,
  beginCommuteToWork,
  completeWorkday,
  cookBreakfast,
  eatBreakfast,
  eatDinner,
  enterAlternateDimension,
  enterCastle,
  getCurrentObjective,
  GameSessionState,
  LocationType,
  takeEveningShower,
  takeMorningShower,
  wakeUp,
} from "@/game/core/gameStore";
import { soundManager } from "@/game/audio/SoundManager";
import { resolvePlayerPosition } from "@/game/core/playerCollision";
import { createInitialVehicleState, updateVehiclePhysics } from "@/game/vehicle/vehiclePhysics";
import { VehicleState } from "@/game/vehicle/vehicleTypes";
import { useGameRealtime } from "@/game/realtime/useGameRealtime";

function getSharedSpaceId(session: GameSessionState) {
  if (session.currentLocation === "DIMENSI_LAIN") return "void:road";
  if (session.currentLocation === "KASTIL") {
    return session.kastil.insideEscapeRoom ? "castle:escape-room" : "castle:courtyard";
  }
  return `overworld:${session.currentLocation.toLowerCase()}`;
}

export default function ProjectQuatroApp() {
  const [session, setSession] = useState<GameSessionState>(createInitialSessionState);
  const [isHumanMoving, setIsHumanMoving] = useState(false);
  const [vehicleState, setVehicleState] = useState<VehicleState>(createInitialVehicleState);
  const sessionRef = useRef(session);
  const isHumanMovingRef = useRef(false);
  const vehicleStateRef = useRef(vehicleState);
  sessionRef.current = session;
  vehicleStateRef.current = vehicleState;
  const isWalkableLocation = ["RUMAH", "TEMPAT_KERJA", "BENGKEL", "KASTIL"].includes(session.currentLocation);
  const isRoadLocation = session.currentLocation === "JALAN" || session.currentLocation === "DIMENSI_LAIN";
  const realtime = useGameRealtime({
    vehicleState: {
      ...(isRoadLocation ? vehicleState : createInitialVehicleState()),
      position: isRoadLocation
        ? { x: vehicleState.position.x, y: vehicleState.position.y, z: 0 }
        : {
            x: session.humanPosition[0],
            y: 0,
            z: session.humanPosition[2],
          },
      heading: isRoadLocation ? vehicleState.heading : session.humanHeading,
      speed: isRoadLocation ? vehicleState.speed : isHumanMoving ? 1.5 : 0,
    },
    playerName: "Traveler",
    isEnabled: session.currentLocation !== "END_SCREEN",
    playerState: {
      spaceId: getSharedSpaceId(session),
      location: session.currentLocation,
      day: session.dayNumber,
      phase: session.phase,
      status: isWalkableLocation ? isHumanMoving ? "WALKING" : "ON_FOOT" : "DRIVING",
    },
  });

  // Modals state
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isVoidCutsceneOpen, setIsVoidCutsceneOpen] = useState(false);
  const [activeNpcId, setActiveNpcId] = useState<"jeffrey" | "vespera" | "barnaby" | "mechanic" | null>(null);
  const [easterEggAlert, setEasterEggAlert] = useState<string | null>(null);
  const [escapeInspectTarget, setEscapeInspectTarget] = useState<
    "CABINET" | "STOVE" | "SECRET_WALL" | "EXIT_DOOR" | null
  >(null);
  const keyboardStateRef = useRef({
    isWorkModalOpen,
    isVoidCutsceneOpen,
    activeNpcId,
    easterEggAlert,
    escapeInspectTarget,
  });
  const interactionHandlerRef = useRef<() => void>(() => undefined);
  keyboardStateRef.current = {
    isWorkModalOpen,
    isVoidCutsceneOpen,
    activeNpcId,
    easterEggAlert,
    escapeInspectTarget,
  };

  // Keyboard input state
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  const lastFootstepTime = useRef(0);
  const isInteracting = useRef(false);

  // Sound Engine initialization on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.init();
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("click", handleFirstInteraction);
    };
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("click", handleFirstInteraction);
    return () => {
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("click", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    soundManager.setMuted(session.isAudioMuted);
  }, [session.isAudioMuted]);

  // Keyboard listeners for WASD / Arrows / E / Space / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyboardState = keyboardStateRef.current;
      const currentSession = sessionRef.current;

      if (e.code === "Escape") {
        if (e.repeat) return;
        soundManager.playClick();
        if (keyboardState.isWorkModalOpen) setIsWorkModalOpen(false);
        else if (keyboardState.isVoidCutsceneOpen) setIsVoidCutsceneOpen(false);
        else if (keyboardState.activeNpcId) setActiveNpcId(null);
        else if (keyboardState.easterEggAlert) setEasterEggAlert(null);
        else if (keyboardState.escapeInspectTarget) setEscapeInspectTarget(null);
        else setSession((prev) => ({ ...prev, isPaused: !prev.isPaused }));
        inputRef.current = { forward: false, backward: false, left: false, right: false, brake: false };
        return;
      }

      if (
        currentSession.isPaused ||
        keyboardState.isWorkModalOpen ||
        keyboardState.isVoidCutsceneOpen ||
        keyboardState.activeNpcId ||
        keyboardState.easterEggAlert ||
        keyboardState.escapeInspectTarget ||
        currentSession.currentLocation === "END_SCREEN"
      ) {
        return;
      }

      const isRoad = currentSession.currentLocation === "JALAN" || currentSession.currentLocation === "DIMENSI_LAIN";
      if (e.code === "Space" && isRoad) {
        inputRef.current.brake = true;
        return;
      }

      // Interaction trigger with [E] or [Space]
      if (e.code === "KeyE" || e.code === "Space") {
        if (e.repeat) return;
        interactionHandlerRef.current();
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
        case "ShiftLeft":
        case "ShiftRight":
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
        case "ShiftLeft":
        case "ShiftRight":
          inputRef.current.brake = false;
          break;
      }
    };

    const clearMovement = () => {
      inputRef.current = { forward: false, backward: false, left: false, right: false, brake: false };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearMovement);
    document.addEventListener("visibilitychange", clearMovement);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearMovement);
      document.removeEventListener("visibilitychange", clearMovement);
    };
  }, []);

  // Main 60FPS Movement and Proximity loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (currentTime - lastTime < 1000 / 30) {
        animId = requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      const currentSession = sessionRef.current;

      const isWalkable =
        currentSession.currentLocation === "RUMAH" ||
        currentSession.currentLocation === "TEMPAT_KERJA" ||
        currentSession.currentLocation === "BENGKEL" ||
        currentSession.currentLocation === "KASTIL";

      if (
        isWalkable &&
        !currentSession.isPaused &&
        !isWorkModalOpen &&
        !isVoidCutsceneOpen &&
        !activeNpcId &&
        !easterEggAlert &&
        !escapeInspectTarget
      ) {
        let moveX = 0;
        let moveZ = 0;

        if (inputRef.current.forward) moveZ -= 1;
        if (inputRef.current.backward) moveZ += 1;
        if (inputRef.current.left) moveX -= 1;
        if (inputRef.current.right) moveX += 1;

        const isMoving = moveX !== 0 || moveZ !== 0;
        if (isHumanMovingRef.current !== isMoving) {
          isHumanMovingRef.current = isMoving;
          setIsHumanMoving(isMoving);
        }

        if (isMoving) {
          const moveLen = Math.hypot(moveX, moveZ);
          const normX = moveX / moveLen;
          const normZ = moveZ / moveLen;

          const walkSpeed = 4.2;
          let nextX = currentSession.humanPosition[0] + normX * walkSpeed * dt;
          let nextZ = currentSession.humanPosition[2] + normZ * walkSpeed * dt;
          const nextHeading = Math.atan2(normX, normZ);

          // Boundaries per room
          if (currentSession.currentLocation === "RUMAH") {
            nextX = Math.max(-3.8, Math.min(3.8, nextX));
            nextZ = Math.max(-3.8, Math.min(4.1, nextZ));

          } else if (currentSession.currentLocation === "TEMPAT_KERJA") {
            nextX = Math.max(-6.2, Math.min(6.2, nextX));
            nextZ = Math.max(-6.2, Math.min(6.5, nextZ));

            // Check if walking into Day 3 Semicolon portal at exit door
            if (
              currentSession.dayNumber === 3 &&
              currentSession.phase === "PORTAL_APPROACH" &&
              currentSession.workplace.allTasksDone &&
              Math.hypot(nextX - 0, nextZ - 5.8) < 1.4
            ) {
              soundManager.playPortalWhoosh();
              setSession((prev) => enterAlternateDimension(prev));
              setIsVoidCutsceneOpen(true);
              return;
            }
          } else if (currentSession.currentLocation === "BENGKEL") {
            nextX = Math.max(-5.2, Math.min(5.2, nextX));
            nextZ = Math.max(-5.2, Math.min(5.2, nextZ));
          } else if (currentSession.currentLocation === "KASTIL") {
            if (currentSession.kastil.insideEscapeRoom) {
              nextX = Math.max(-5.5, Math.min(5.5, nextX));
              nextZ = Math.max(-5.8, Math.min(5.8, nextZ));
            } else {
              nextX = Math.max(-10.0, Math.min(10.0, nextX));
              nextZ = Math.max(-9.0, Math.min(10.5, nextZ));

              // Auto-doorway trigger: walking into Great Keep entrance
              if (Math.hypot(nextX - 0, nextZ - (-8.0)) < 1.6) {
                soundManager.playDoorSlam();
                setSession((prev) => ({
                  ...prev,
                  humanPosition: [0, 0, 4.5],
                  kastil: {
                    ...prev.kastil,
                    insideEscapeRoom: true,
                  },
                  activePrompt:
                    "✦ PINTU TERBANTING MENUTUP! Kamu terkunci di aula kastil! Cari cara keluar (Escape Room).",
                }));
                return;
              }
            }
          }

          const [resolvedX, , resolvedZ] = resolvePlayerPosition(
            currentSession.humanPosition,
            [nextX, 0, nextZ],
            currentSession.currentLocation,
            currentSession.kastil.insideEscapeRoom,
            0.32,
            currentSession.kastil.escapeRoom.doorUnlocked
          );
          nextX = resolvedX;
          nextZ = resolvedZ;

          // Sound footstep throttle
          if (currentTime - lastFootstepTime.current > 320) {
            soundManager.playFootstep();
            lastFootstepTime.current = currentTime;
          }

          setSession((prev) => ({
            ...prev,
            humanPosition: [nextX, 0, nextZ],
            humanHeading: nextHeading,
          }));
        }
      } else if (
        (currentSession.currentLocation === "JALAN" || currentSession.currentLocation === "DIMENSI_LAIN") &&
        !currentSession.isPaused &&
        !isVoidCutsceneOpen
      ) {
        const input = inputRef.current;
        const nextVehicle = updateVehiclePhysics(
          vehicleStateRef.current,
          {
            forward: input.forward,
            backward: input.backward,
            left: input.left,
            right: input.right,
            brake: input.brake,
          },
          dt
        );
        nextVehicle.position.x = THREE.MathUtils.clamp(nextVehicle.position.x, -3.8, 3.8);
        nextVehicle.position.z = 0;
        nextVehicle.heading = THREE.MathUtils.clamp(nextVehicle.heading, -0.8, 0.8);
        vehicleStateRef.current = nextVehicle;
        setVehicleState(nextVehicle);
        soundManager.updateEngine(nextVehicle.speed);
        if (isHumanMovingRef.current) {
          isHumanMovingRef.current = false;
          setIsHumanMoving(false);
        }
      } else if (isHumanMovingRef.current) {
        isHumanMovingRef.current = false;
        setIsHumanMoving(false);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    session.currentLocation,
    session.isPaused,
    isWorkModalOpen,
    isVoidCutsceneOpen,
    activeNpcId,
    easterEggAlert,
    escapeInspectTarget,
  ]);

  // Context-sensitive interaction logic for [E] or Click
  const handleContextInteraction = useCallback(() => {
    const [hx, , hz] = session.humanPosition;

    // 1. RUMAH INTERACTIONS
    if (session.currentLocation === "RUMAH") {
      const distToBed = Math.hypot(hx - (-2.4), hz - (-3.2));
      const distToStove = Math.hypot(hx - (-3.8), hz - 1.0);
      const distToTable = Math.hypot(hx - 0.8, hz - 1.6);
      const distToShower = Math.hypot(hx - 3.4, hz - (-3.4));
      const distToDoor = Math.hypot(hx - 0, hz - 4.0);

      // Morning wake up
      if (
        distToBed < 2.0 &&
        session.phase === "MORNING_ROUTINE" &&
        !session.rumah.wokenUp
      ) {
        soundManager.playClick();
        setSession((prev) => wakeUp(prev));
        return;
      }

      // Cook at stove
      if (
        distToStove < 1.8 &&
        session.phase === "MORNING_ROUTINE" &&
        session.rumah.wokenUp &&
        !session.rumah.hasCooked
      ) {
        soundManager.playCook();
        setSession((prev) => cookBreakfast(prev));
        return;
      }

      // Eat at dining table
      if (distToTable < 1.8) {
        if (
          session.phase === "EVENING_ROUTINE" &&
          session.rumah.hasShoweredEvening &&
          !session.rumah.hasEatenEvening
        ) {
          // Evening dinner
          soundManager.playEat();
          setSession((prev) => eatDinner(prev));
          return;
        } else if (
          session.phase === "MORNING_ROUTINE" &&
          session.rumah.hasCooked &&
          !session.rumah.hasEaten
        ) {
          // Morning breakfast
          soundManager.playEat();
          setSession((prev) => eatBreakfast(prev));
          return;
        }
      }

      // Shower in bathroom
      if (distToShower < 2.0) {
        if (session.phase === "EVENING_ROUTINE" && !session.rumah.hasShoweredEvening) {
          // Evening shower
          soundManager.playWater();
          setSession((prev) => takeEveningShower(prev));
          return;
        } else if (
          session.phase === "MORNING_ROUTINE" &&
          session.rumah.hasEaten &&
          !session.rumah.hasShowered
        ) {
          // Morning shower
          soundManager.playWater();
          setSession((prev) => takeMorningShower(prev));
          return;
        }
      }

      // Front Door Exit to Jalan
      if (distToDoor < 1.8 && session.phase === "MORNING_ROUTINE" && session.rumah.canExitHouse) {
        soundManager.playDoorOpen();
        setVehicleState(createInitialVehicleState());
        setSession((prev) => beginCommuteToWork(prev));
        return;
      }

      // Evening sleep in bed
      if (distToBed < 2.0 && session.phase === "EVENING_ROUTINE") {
        if (session.rumah.canSleepEvening && session.currentLocation === "RUMAH") {
          soundManager.playPurr();
          const next = advanceDay(session);
          setSession(next);
          return;
        } else {
          setSession((prev) => ({
            ...prev,
            activePrompt: "Kamu harus mandi dan makan malam terlebih dahulu sebelum tidur!",
          }));
          return;
        }
      }
    }

    // 2. TEMPAT KERJA INTERACTIONS
    if (session.currentLocation === "TEMPAT_KERJA") {
      const distToPC = Math.hypot(hx - 3.0, hz - (-1.4));
      const distToExit = Math.hypot(hx - 0, hz - 6.2);

      // Workstation PC
      if (distToPC < 2.0 && !session.workplace.allTasksDone) {
        soundManager.playClick();
        setIsWorkModalOpen(true);
        return;
      }

      // Exit Doorway
      if (distToExit < 2.0 && session.workplace.allTasksDone) {
        if (session.dayNumber === 3 && session.phase === "PORTAL_APPROACH") {
          // Enter Portal
          soundManager.playPortalWhoosh();
          setSession((prev) => enterAlternateDimension(prev));
          setIsVoidCutsceneOpen(true);
        } else if (session.dayNumber < 3 && session.phase === "AT_WORK") {
          // Return to Jalan (Evening Commute Home)
          soundManager.playDoorOpen();
          setVehicleState(createInitialVehicleState());
          setSession((prev) => beginCommuteHome(prev));
        }
        return;
      }
    }

    // 3. BENGKEL INTERACTIONS
    if (session.currentLocation === "BENGKEL") {
      const distToMontir = Math.hypot(hx - 2.0, hz - (-1.5));
      const distToExit = Math.hypot(hx - 0, hz - 5.0);

      if (distToMontir < 2.0) {
        soundManager.playPurr();
        setActiveNpcId("mechanic");
        return;
      }

      if (distToExit < 2.0) {
        soundManager.playDoorOpen();
        setVehicleState(createInitialVehicleState());
        setSession((prev) => ({
          ...prev,
          currentLocation: "JALAN",
          activePrompt: "Keluar dari bengkel. Berkendara di jalan raya.",
        }));
        return;
      }
    }

    // 4. KASTIL INTERACTIONS
    if (session.currentLocation === "KASTIL") {
      if (!session.kastil.insideEscapeRoom) {
        // Courtyard: NPCs & Easter Eggs
        const distToJeffrey = Math.hypot(hx - (-3.5), hz - (-4.0));
        const distToVespera = Math.hypot(hx - 3.5, hz - (-4.0));
        const distToBarnaby = Math.hypot(hx - (-5.0), hz - 0);

        const distToFountain = Math.hypot(hx - 0, hz - 1.0);
        const distToHay = Math.hypot(hx - 5.5, hz - 3.0);
        const distToKeepDoor = Math.hypot(hx - 0, hz - (-8.0));

        if (distToJeffrey < 2.0) {
          soundManager.playClick();
          setActiveNpcId("jeffrey");
          return;
        }
        if (distToVespera < 2.0) {
          soundManager.playClick();
          setActiveNpcId("vespera");
          return;
        }
        if (distToBarnaby < 2.0) {
          soundManager.playClick();
          setActiveNpcId("barnaby");
          return;
        }

        // Easter Egg 1: Fountain
        if (distToFountain < 2.2 && !session.kastil.easterEggs.fountain) {
          soundManager.playPurr();
          setSession((prev) => ({
            ...prev,
            kastil: {
              ...prev.kastil,
              easterEggs: { ...prev.kastil.easterEggs, fountain: true },
              easterEggCount: prev.kastil.easterEggCount + 1,
            },
            stats: { ...prev.stats, easterEggsFound: prev.stats.easterEggsFound + 1 },
          }));
          setEasterEggAlert("Kamu menemukan Easter Egg Semicolon di dalam air mancur kuno!");
          return;
        }

        // Easter Egg 2: Hay Bales
        if (distToHay < 2.2 && !session.kastil.easterEggs.hayBales) {
          soundManager.playPurr();
          setSession((prev) => ({
            ...prev,
            kastil: {
              ...prev.kastil,
              easterEggs: { ...prev.kastil.easterEggs, hayBales: true },
              easterEggCount: prev.kastil.easterEggCount + 1,
            },
            stats: { ...prev.stats, easterEggsFound: prev.stats.easterEggsFound + 1 },
          }));
          setEasterEggAlert("Kamu menemukan Easter Egg Semicolon tersembunyi di balik tumpukan jerami!");
          return;
        }

        // Enter Keep Door
        if (distToKeepDoor < 2.2) {
          soundManager.playDoorSlam();
          setSession((prev) => ({
            ...prev,
            humanPosition: [0, 0, 4.5],
            kastil: { ...prev.kastil, insideEscapeRoom: true },
            activePrompt:
              "✦ PINTU TERBANTING MENUTUP! Kamu terkunci di aula kastil! Cari cara keluar (Escape Room).",
          }));
          return;
        }
      } else {
        // Inside Escape Room
        const distToCabinet = Math.hypot(hx - (-5.2), hz - 0);
        const distToStove = Math.hypot(hx - 5.2, hz - 0);
        const distToSecretWall = Math.hypot(hx - (-1.4), hz - (-5.8));
        const distToExitDoor = Math.hypot(hx - 2.0, hz - (-5.8));

        if (distToCabinet < 2.0) {
          soundManager.playClick();
          setEscapeInspectTarget("CABINET");
          return;
        }
        if (distToStove < 2.0 && session.kastil.escapeRoom.cabinetSearched) {
          soundManager.playClick();
          setEscapeInspectTarget("STOVE");
          return;
        }
        if (
          distToSecretWall < 2.0 &&
          session.kastil.escapeRoom.cabinetSearched &&
          session.kastil.escapeRoom.stoveChecked
        ) {
          soundManager.playClick();
          setEscapeInspectTarget("SECRET_WALL");
          return;
        }
        if (distToExitDoor < 2.0) {
          soundManager.playClick();
          setEscapeInspectTarget("EXIT_DOOR");
          return;
        }
      }
    }
  }, [session]);
  interactionHandlerRef.current = handleContextInteraction;

  // Destination Selection Handler from Jalan & Dimensi Lain
  const handleSelectDestination = (dest: "RUMAH" | "TEMPAT_KERJA" | "BENGKEL" | "KASTIL") => {
    soundManager.playDoorOpen();
    if (dest === "RUMAH") {
      setVehicleState(createInitialVehicleState());
      setSession((prev) => arriveHomeForEvening(prev));
    } else if (dest === "TEMPAT_KERJA") {
      setVehicleState(createInitialVehicleState());
      setSession((prev) => arriveAtWork(prev));
    } else if (dest === "BENGKEL") {
      setVehicleState(createInitialVehicleState());
      setSession((prev) => ({
        ...prev,
        currentLocation: "BENGKEL",
        humanPosition: [0, 0, 4.0],
        activePrompt: "Tiba di bengkel mobil. Bincang dengan Pak Montir [E] atau servis mobil.",
      }));
    } else if (dest === "KASTIL") {
      setVehicleState(createInitialVehicleState());
      setSession((prev) => enterCastle(prev));
    }
  };

  // Complete Workplace PC Tasks
  const handleCompleteOfficeWork = () => {
    setIsWorkModalOpen(false);
    setSession((prev) => completeWorkday(prev));
  };

  // Escape Room Updates
  const handleUpdateEscapeRoom = (updates: any) => {
    setSession((prev) => ({
      ...prev,
      kastil: {
        ...prev.kastil,
        escapeRoom: { ...prev.kastil.escapeRoom, ...updates },
      },
    }));
  };

  // Final Escape to End Screen!
  const handleEscapeToVictory = () => {
    setEscapeInspectTarget(null);
    soundManager.playPurr();
    soundManager.setCinematicMode(true);
    setSession((prev) => ({
      ...prev,
      currentLocation: "END_SCREEN",
    }));
  };

  // Play Again Restart
  const handlePlayAgain = () => {
    soundManager.setCinematicMode(false);
    setSession(createInitialSessionState());
  };

  // Calculate nearby action prompt for Home
  let nearbyHomeAction: "WAKE" | "COOK" | "EAT" | "SHOWER" | "SLEEP" | "EXIT" | null = null;
  if (session.currentLocation === "RUMAH") {
    const [hx, , hz] = session.humanPosition;
    const isEvening = session.phase === "EVENING_ROUTINE";
    if (Math.hypot(hx - (-2.4), hz - (-3.2)) < 2.0) {
      if (isEvening && session.rumah.canSleepEvening) nearbyHomeAction = "SLEEP";
      else if (!isEvening && !session.rumah.wokenUp) nearbyHomeAction = "WAKE";
    } else if (!isEvening && Math.hypot(hx - (-3.8), hz - 1.0) < 1.8 && session.rumah.wokenUp && !session.rumah.hasCooked) {
      nearbyHomeAction = "COOK";
    } else if (Math.hypot(hx - 0.8, hz - 1.6) < 1.8) {
      if (isEvening && !session.rumah.hasEatenEvening) nearbyHomeAction = "EAT";
      else if (!isEvening && session.rumah.hasCooked && !session.rumah.hasEaten) nearbyHomeAction = "EAT";
    } else if (Math.hypot(hx - 3.4, hz - (-3.4)) < 2.0) {
      if (isEvening && !session.rumah.hasShoweredEvening) nearbyHomeAction = "SHOWER";
      else if (!isEvening && session.rumah.hasEaten && !session.rumah.hasShowered) nearbyHomeAction = "SHOWER";
    } else if (!isEvening && Math.hypot(hx - 0, hz - 4.0) < 1.8 && session.rumah.canExitHouse) {
      nearbyHomeAction = "EXIT";
    }
  }

  let contextualAction: string | null = null;
  const [playerX, , playerZ] = session.humanPosition;
  if (nearbyHomeAction) {
    contextualAction = {
      WAKE: "Wake up",
      COOK: "Cook",
      EAT: "Eat",
      SHOWER: "Shower",
      SLEEP: "Sleep",
      EXIT: "Leave home",
    }[nearbyHomeAction];
  } else if (session.currentLocation === "TEMPAT_KERJA") {
    if (Math.hypot(playerX - 3.0, playerZ + 1.4) < 2 && !session.workplace.allTasksDone) {
      contextualAction = "Workstation";
    } else if (Math.hypot(playerX, playerZ - 6.2) < 2 && session.workplace.allTasksDone) {
      contextualAction = session.dayNumber === 3 ? "Enter portal" : "Return home";
    }
  } else if (session.currentLocation === "BENGKEL") {
    if (Math.hypot(playerX - 2.0, playerZ + 1.5) < 2) contextualAction = "Talk · Mechanic";
    else if (Math.hypot(playerX, playerZ - 5.0) < 2) contextualAction = "Leave workshop";
  } else if (session.currentLocation === "KASTIL") {
    if (session.kastil.insideEscapeRoom) {
      if (Math.hypot(playerX + 5.2, playerZ) < 2) contextualAction = "Inspect · Cabinet";
      else if (session.kastil.escapeRoom.cabinetSearched && Math.hypot(playerX - 5.2, playerZ) < 2) contextualAction = "Inspect · Hearth";
      else if (
        session.kastil.escapeRoom.cabinetSearched &&
        session.kastil.escapeRoom.stoveChecked &&
        Math.hypot(playerX + 1.4, playerZ + 5.8) < 2
      ) contextualAction = "Inspect · Loose stone";
      else if (Math.hypot(playerX - 2.0, playerZ + 5.8) < 2) contextualAction = "Inspect · Exit door";
    } else if (Math.hypot(playerX + 3.5, playerZ + 4.0) < 2) contextualAction = "Talk · Jeffrey";
    else if (Math.hypot(playerX - 3.5, playerZ + 4.0) < 2) contextualAction = "Talk · Vespera";
    else if (Math.hypot(playerX + 5.0, playerZ) < 2) contextualAction = "Talk · Barnaby";
    else if (Math.hypot(playerX, playerZ + 8.0) < 2.2) contextualAction = "Enter keep";
    else if (Math.hypot(playerX, playerZ - 1.0) < 2.2 && !session.kastil.easterEggs.fountain) contextualAction = "Inspect · Fountain";
    else if (Math.hypot(playerX - 5.5, playerZ - 3.0) < 2.2 && !session.kastil.easterEggs.hayBales) contextualAction = "Inspect · Hay bales";
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* 3D Canvas Rendering Active Scene */}
      {session.currentLocation !== "END_SCREEN" && (
        <GameCanvas
          location={session.currentLocation}
          humanPos={isRoadLocation
            ? [vehicleState.position.x, 0, 0]
            : session.humanPosition}
          humanHeading={isRoadLocation ? vehicleState.heading : session.humanHeading}
          isHumanMoving={isHumanMoving}
          isInsideEscapeRoom={session.kastil.insideEscapeRoom}
          remotePlayers={realtime.remotePlayers}
        >
          {/* Location 1: RUMAH */}
          {session.currentLocation === "RUMAH" && (
            <HouseInterior
              rumahState={session.rumah}
              dayNumber={session.dayNumber}
              playerPos={session.humanPosition}
              isEvening={session.phase === "EVENING_ROUTINE"}
            />
          )}

          {/* Location 2: JALAN */}
          {session.currentLocation === "JALAN" && (
            <HighwayDriveScene isVoidHighway={false} vehicleState={vehicleState} />
          )}

          {/* Location 3: TEMPAT KERJA */}
          {session.currentLocation === "TEMPAT_KERJA" && (
            <WorkplaceInterior
              workplaceState={session.workplace}
              dayNumber={session.dayNumber}
              playerPos={session.humanPosition}
            />
          )}

          {/* LOCATION: BENGKEL */}
          {session.currentLocation === "BENGKEL" && (
            <MechanicShopScene playerPos={session.humanPosition} />
          )}

          {/* Location 4: DIMENSI LAIN */}
          {session.currentLocation === "DIMENSI_LAIN" && (
            <HighwayDriveScene isVoidHighway={true} vehicleState={vehicleState} />
          )}

          {/* Location 5: KASTIL */}
          {session.currentLocation === "KASTIL" && (
            <>
              {session.kastil.insideEscapeRoom ? (
                <CastleEscapeRoomScene
                  escapeRoomState={session.kastil.escapeRoom}
                  playerPos={session.humanPosition}
                />
              ) : (
                <CastleExteriorScene
                  kastilState={session.kastil}
                  playerPos={session.humanPosition}
                />
              )}
            </>
          )}
        </GameCanvas>
      )}

      {/* Global Quest Banner */}
      {session.currentLocation !== "END_SCREEN" && (
        <div
          aria-live="polite"
          className="fixed top-4 right-4 z-40 flex max-w-[min(22rem,calc(100vw-2rem))] items-center gap-3 border-l border-quatro-amber/70 bg-quatro-navy/80 px-3 py-2 text-quatro-cream shadow-lg backdrop-blur-sm"
        >
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-quatro-amber">
            Day {session.dayNumber}
          </span>
          <span className="h-5 w-px bg-quatro-cream/15" />
          <span className="text-xs leading-snug">{getCurrentObjective(session)}</span>
        </div>
      )}

      {contextualAction && session.currentLocation !== "END_SCREEN" && (
        <button
          type="button"
          onClick={handleContextInteraction}
          className="fixed bottom-7 left-1/2 z-40 -translate-x-1/2 border border-quatro-cream/20 bg-quatro-navy/75 px-4 py-2 text-[11px] font-mono tracking-wide text-quatro-cream/90 shadow-lg backdrop-blur-sm transition-colors hover:border-quatro-amber/50 hover:text-quatro-amber focus-visible:outline focus-visible:outline-1 focus-visible:outline-quatro-amber"
        >
          <span className="mr-2 text-quatro-amber">E</span>
          <span className="mr-2 text-quatro-cream/45">/ CLICK</span>
          {contextualAction}
        </button>
      )}

      {session.currentLocation !== "END_SCREEN" && (
        <div className="fixed bottom-3 right-4 z-30 pointer-events-none font-mono text-[9px] uppercase tracking-wider text-quatro-cream/55">
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${realtime.connectionStatus === "CONNECTED" ? "bg-emerald-400" : realtime.connectionStatus === "CONNECTING" ? "bg-amber-300 animate-pulse" : "bg-quatro-cream/30"}`} />
          {realtime.connectionStatus === "CONNECTED"
            ? `${Math.max(0, realtime.onlineCount - 1)} nearby`
            : realtime.connectionStatus.toLowerCase()}
        </div>
      )}

      {/* Location 1 Overlay: Rumah Routine Checklist */}
      {session.currentLocation === "RUMAH" && (
        <HomeRoutineOverlay
          dayNumber={session.dayNumber}
          rumahState={session.rumah}
          isEvening={session.phase === "EVENING_ROUTINE"}
        />
      )}

      {/* Location 2 & 4 Overlay: Road Navigation Modal */}
      {(session.currentLocation === "JALAN" || session.currentLocation === "DIMENSI_LAIN") && (
        <RoadNavigationModal
          isVoidHighway={session.currentLocation === "DIMENSI_LAIN"}
          allowedDestinations={
            session.currentLocation === "DIMENSI_LAIN"
              ? session.phase === "CASTLE_EXPLORATION" ? ["KASTIL"] : []
              : session.phase === "COMMUTE_TO_WORK"
              ? ["TEMPAT_KERJA", "BENGKEL"]
              : session.phase === "COMMUTE_HOME"
              ? ["RUMAH", "BENGKEL"]
              : ["BENGKEL"]
          }
          onSelectDestination={handleSelectDestination}
        />
      )}

      {/* Location 3 Modal: Workplace PC Workstation Minigames */}
      <OfficeWorkstationModal
        key={session.dayNumber}
        isOpen={isWorkModalOpen}
        dayNumber={session.dayNumber}
        onComplete={handleCompleteOfficeWork}
        onClose={() => setIsWorkModalOpen(false)}
      />

      {/* Location 4 Modal: Dimensi Lain Old Man Cutscene */}
      <VoidLoreCutsceneModal
        isOpen={isVoidCutsceneOpen}
        onEnterVoidHighway={() => setIsVoidCutsceneOpen(false)}
      />

      {/* Location 5 Modals: Castle NPCs, Lore & Escape Room */}
      <CastleLoreDialogueModal
        npcId={activeNpcId}
        easterEggNotification={easterEggAlert}
        onClose={() => {
          setActiveNpcId(null);
          setEasterEggAlert(null);
        }}
      />

      <CastleEscapeRoomModal
        isOpen={escapeInspectTarget !== null}
        inspectTarget={escapeInspectTarget}
        escapeRoomState={session.kastil.escapeRoom}
        onUpdateEscapeRoom={handleUpdateEscapeRoom}
        onEscapeCastle={handleEscapeToVictory}
        onClose={() => setEscapeInspectTarget(null)}
      />

      {/* Location 6: Cinematic End Credits */}
      {session.currentLocation === "END_SCREEN" && (
        <EndCreditsScene onPlayAgain={handlePlayAgain} />
      )}

      {/* Pause Menu */}
      <PauseOverlay
        isOpen={session.isPaused}
        onResume={() => setSession((prev) => ({ ...prev, isPaused: false }))}
        isAudioMuted={session.isAudioMuted}
        onToggleAudio={() =>
          setSession((prev) => ({ ...prev, isAudioMuted: !prev.isAudioMuted }))
        }
      />
    </div>
  );
}
