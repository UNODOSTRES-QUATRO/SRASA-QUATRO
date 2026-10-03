"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GameCanvas } from "./GameCanvas";
import { UnifiedWorld } from "@/game/world/UnifiedWorld";

import { HomeRoutineOverlay } from "@/components/ui/HomeRoutineOverlay";
import { OfficeWorkstationModal } from "@/components/ui/OfficeWorkstationModal";
import { VoidLoreCutsceneModal } from "@/components/ui/VoidLoreCutsceneModal";
import { CastleLoreDialogueModal } from "@/components/ui/CastleLoreDialogueModal";
import { CastleEscapeRoomModal } from "@/components/ui/CastleEscapeRoomModal";
import { EndCreditsScene } from "@/components/ui/EndCreditsScene";
import { PauseOverlay } from "@/components/ui/PauseOverlay";
import { DrivingHUD } from "@/components/ui/DrivingHUD";
import { WeaponHUD } from "@/components/ui/WeaponHUD";
import { OpeningCinematic } from "@/components/ui/OpeningCinematic";
import { CharacterSelectModal } from "@/components/ui/CharacterSelectModal";
import { CharacterId } from "@/components/ui/CharacterPortraits";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import {
  useLocalizationProvider,
  LocalizationContext,
} from "@/game/localization/useLocalization";
import type { TranslationDictionary } from "@/game/localization/translations";

import {
  createInitialSessionState,
  advanceDay,
  arriveHomeForEvening,
  completeWorkday,
  cookBreakfast,
  eatBreakfast,
  eatDinner,
  enterAlternateDimension,
  getCurrentObjective,
  GameSessionState,
  takeEveningShower,
  takeMorningShower,
  wakeUp,
} from "@/game/core/gameStore";
import { soundManager } from "@/game/audio/SoundManager";
import { createInitialVehicleState, toggleVehicleScale } from "@/game/vehicle/vehiclePhysics";
import { VehicleState, CameraMode } from "@/game/vehicle/vehicleTypes";
import { useGameRealtime } from "@/game/realtime/useGameRealtime";
import { useWeaponSystem } from "@/game/weapons/WeaponSystem";
import { WEAPON_ORDER } from "@/game/weapons/weaponTypes";
import { resolvePlayerWorldPosition } from "@/game/core/playerCollision";

export type PlayerMode = "ON_FOOT" | "DRIVING";

function getLocalizedObjective(
  session: GameSessionState,
  t: (k: keyof TranslationDictionary) => string
): string {
  switch (session.phase) {
    case "MORNING_ROUTINE":
      if (session.currentLocation !== "RUMAH") return t("obj_leave_house");
      if (!session.rumah.wokenUp) return t("obj_wake_up");
      if (!session.rumah.hasCooked) return t("obj_cook");
      if (!session.rumah.hasEaten) return t("obj_eat");
      if (!session.rumah.hasShowered) return t("obj_shower");
      return t("obj_leave_house");
    case "COMMUTE_TO_WORK":
      return t("obj_drive_work");
    case "AT_WORK":
      return session.workplace.allTasksDone ? t("obj_leave_work") : t("obj_work_tasks");
    case "COMMUTE_HOME":
      return t("obj_drive_home");
    case "EVENING_ROUTINE":
      if (!session.rumah.hasShoweredEvening) return t("obj_shower_evening");
      if (!session.rumah.hasEatenEvening) return t("obj_dinner_evening");
      return t("obj_sleep_evening");
    case "PORTAL_APPROACH":
      return t("obj_enter_portal");
    case "CASTLE_EXPLORATION":
      if (session.currentLocation === "DIMENSI_LAIN") return t("obj_reach_castle");
      if (!session.kastil.insideEscapeRoom) return t("obj_escape_keep");
      if (!session.kastil.escapeRoom.cabinetSearched) return t("obj_search_cabinet");
      if (!session.kastil.escapeRoom.stoveChecked) return t("obj_inspect_hearth");
      if (!session.kastil.escapeRoom.secretWallRevealed) return t("obj_find_loose_stone");
      if (!session.kastil.escapeRoom.hasMasterKey) return t("obj_open_safe");
      return t("obj_unlock_exit");
    case "SANCTUARY_REACHED":
    case "RESTING":
    default:
      return t("obj_rest_moment");
  }
}

export default function ProjectQuatroApp() {
  const localization = useLocalizationProvider();
  const { t } = localization;

  // Character selection state with persistence
  const [characterId, setCharacterId] = useState<CharacterId>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quatro_selected_character");
      if (saved) return saved as CharacterId;
    }
    return "ORIGINAL";
  });
  const [isCharacterSelectOpen, setIsCharacterSelectOpen] = useState(false);

  // Cinematic sequence state (starts on first load, skippable)
  const [showOpeningCinematic, setShowOpeningCinematic] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("quatro_seen_cinematic");
    }
    return false;
  });

  const handleCompleteCinematic = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("quatro_seen_cinematic", "true");
    }
    setShowOpeningCinematic(false);
    // If first time playing, open character selection
    if (typeof window !== "undefined" && !localStorage.getItem("quatro_selected_character")) {
      setIsCharacterSelectOpen(true);
    }
  }, []);

  const handleSelectCharacter = useCallback((newId: CharacterId) => {
    setCharacterId(newId);
    if (typeof window !== "undefined") {
      localStorage.setItem("quatro_selected_character", newId);
    }
    setIsCharacterSelectOpen(false);
  }, []);

  const [session, setSession] = useState<GameSessionState>(createInitialSessionState);
  const [playerMode, setPlayerMode] = useState<PlayerMode>("ON_FOOT");
  const [isHumanMoving, setIsHumanMoving] = useState(false);

  // Initial vehicle parked outside Home on the driveway
  const [vehicleState, setVehicleState] = useState<VehicleState>(() => ({
    ...createInitialVehicleState(),
    position: { x: 20, y: 0.35, z: -48 },
    heading: 0,
    doorAngle: 0,
  }));
  const [cameraMode, setCameraMode] = useState<CameraMode>("CHASE");

  // Weapon system
  const weaponSystem = useWeaponSystem();
  const [, setWeaponHUDTick] = useState(0);
  const isAttackingRef = useRef(false);
  const isChargingRef = useRef(false);

  const sessionRef = useRef(session);
  const playerModeRef = useRef(playerMode);
  const vehicleStateRef = useRef(vehicleState);
  const humanVelocityRef = useRef({ vx: 0, vz: 0 });

  // Player starts beside bed inside Home in continuous world coordinates
  const humanPosRef = useRef({
    x: session.humanPosition[0],
    y: session.humanPosition[1],
    z: session.humanPosition[2],
    heading: session.humanHeading,
  });

  sessionRef.current = session;
  playerModeRef.current = playerMode;
  vehicleStateRef.current = vehicleState;

  // Realtime multiplayer
  const realtime = useGameRealtime({
    vehicleState: {
      ...vehicleState,
      position: playerMode === "DRIVING"
        ? vehicleState.position
        : { x: session.humanPosition[0], y: 0, z: session.humanPosition[2] },
      heading: playerMode === "DRIVING" ? vehicleState.heading : session.humanHeading,
      speed: playerMode === "DRIVING" ? vehicleState.speed : isHumanMoving ? 2.5 : 0,
    },
    playerName: "Traveler",
    isEnabled: session.currentLocation !== "END_SCREEN",
    playerState: {
      spaceId: "srasa-open-world",
      location: session.currentLocation,
      day: session.dayNumber,
      phase: session.phase,
      status: playerMode === "DRIVING" ? "DRIVING" : isHumanMoving ? "WALKING" : "ON_FOOT",
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

  // Keyboard inputs
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  // Sound Engine initialization on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.init();
      soundManager.resumeAudio();
      soundManager.setMode(playerModeRef.current === "DRIVING" ? "DRIVING" : "WALKING");
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    const handleFocus = () => {
      soundManager.ensureAudioContext();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    soundManager.setMuted(session.isAudioMuted);
  }, [session.isAudioMuted]);

  // ── Seamless Mount / Dismount Handlers with Animated Driver Door ──
  const handleMountVehicle = useCallback(() => {
    // Open door smoothly
    if (vehicleStateRef.current) {
      vehicleStateRef.current.doorAngle = 0.95;
    }
    soundManager.playVehicleMount();
    soundManager.setMode("DRIVING");
    humanVelocityRef.current = { vx: 0, vz: 0 };
    setPlayerMode("DRIVING");
    setSession((prev) => {
      let nextPhase = prev.phase;
      if (prev.phase === "MORNING_ROUTINE") {
        nextPhase = "COMMUTE_TO_WORK";
      } else if (prev.phase === "AT_WORK" && prev.workplace.allTasksDone && prev.dayNumber < 3) {
        nextPhase = "COMMUTE_HOME";
      }
      return {
        ...prev,
        currentLocation: "JALAN",
        phase: nextPhase,
        activePrompt: "✦ Di dalam Quattro. [WASD] Kemudikan, [Space] Drift FR, [C] Ganti Kamera, [E] Turun.",
      };
    });

    // Door closes after entry
    setTimeout(() => {
      if (vehicleStateRef.current) {
        vehicleStateRef.current.doorAngle = 0;
      }
    }, 280);
  }, []);

  const isDismountingRef = useRef(false);

  const performDismount = useCallback(() => {
    isDismountingRef.current = false;
    const car = vehicleStateRef.current;
    soundManager.playVehicleDismount();
    soundManager.setMode("WALKING");
    soundManager.updateEngine(0, false);
    soundManager.updateTireDrift(0, 0);
    humanVelocityRef.current = { vx: 0, vz: 0 };

    // Door swings open smoothly
    car.doorAngle = 0.95;

    // Dismount left of driver door safely within world bounds and collision walls
    const rawX = THREE.MathUtils.clamp(car.position.x - Math.cos(car.heading) * 1.8, -26, 26);
    const rawZ = THREE.MathUtils.clamp(car.position.z + Math.sin(car.heading) * 1.8, -80, 220);
    const [dismountX, , dismountZ] = resolvePlayerWorldPosition(
      [car.position.x, 0, car.position.z],
      [rawX, 0, rawZ],
      0.35
    );
    const dismountHeading = car.heading - Math.PI / 2;

    humanPosRef.current = {
      x: dismountX,
      y: 0,
      z: dismountZ,
      heading: dismountHeading,
    };

    setVehicleState((prev) => ({
      ...prev,
      speed: 0,
      lateralSpeed: 0,
      angularVelocity: 0,
      driftFactor: 0,
    }));
    setSession((prev) => ({
      ...prev,
      humanPosition: [dismountX, 0, dismountZ],
      humanHeading: dismountHeading,
      activePrompt: "✦ Jalan kaki. [WASD] Gerak, [F] Serang, [Q] Ganti Senjata, [E] Masuk Mobil.",
    }));
    setPlayerMode("ON_FOOT");

    // Door latches shut
    setTimeout(() => {
      if (vehicleStateRef.current) {
        vehicleStateRef.current.doorAngle = 0;
      }
    }, 380);
  }, []);

  const handleDismountVehicle = useCallback(() => {
    if (isDismountingRef.current) return;
    const car = vehicleStateRef.current;

    // If driving at speed, decelerate smoothly to a stop before dismounting
    if (Math.abs(car.speed) > 2.0) {
      isDismountingRef.current = true;
      inputRef.current.forward = false;
      inputRef.current.backward = false;
      inputRef.current.brake = true;

      const checkStop = () => {
        if (!isDismountingRef.current) return;
        if (Math.abs(vehicleStateRef.current.speed) < 1.2) {
          inputRef.current.brake = false;
          performDismount();
        } else {
          requestAnimationFrame(checkStop);
        }
      };
      requestAnimationFrame(checkStop);
    } else {
      performDismount();
    }
  }, [performDismount]);

  // ── Keyboard listeners for WASD / Arrows / E / Space / Escape / C / F / Q ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundManager.ensureAudioContext();
      const keyboardState = keyboardStateRef.current;
      const currentSession = sessionRef.current;
      const currentMode = playerModeRef.current;

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

      // [C] — toggle camera mode when driving
      if (e.code === "KeyC" && currentMode === "DRIVING" && !e.repeat) {
        setCameraMode((prev) => (prev === "CHASE" ? "COCKPIT" : "CHASE"));
        return;
      }

      // [P] — toggle Pocket Car scale when driving
      if (e.code === "KeyP" && currentMode === "DRIVING" && !e.repeat) {
        soundManager.playClick();
        if (vehicleStateRef.current) {
          vehicleStateRef.current = toggleVehicleScale(vehicleStateRef.current);
          setVehicleState({ ...vehicleStateRef.current });
        }
        return;
      }

      // [E] Seamless Mount / Dismount or Context Interaction
      if (e.code === "KeyE") {
        if (e.repeat) return;
        if (currentMode === "DRIVING") {
          handleDismountVehicle();
          return;
        } else {
          // Check proximity to car in real-time world coordinates
          const hx = humanPosRef.current?.x ?? currentSession.humanPosition[0];
          const hz = humanPosRef.current?.z ?? currentSession.humanPosition[2];
          const car = vehicleStateRef.current;
          const distToCar = Math.hypot(hx - car.position.x, hz - car.position.z);
          if (distToCar < 3.8) {
            handleMountVehicle();
            return;
          }
          // Contextual interaction
          interactionHandlerRef.current();
          return;
        }
      }

      // Weapon controls when on foot
      if (currentMode === "ON_FOOT" && !e.repeat) {
        // [F] — attack
        if (e.code === "KeyF") {
          const { startAttack } = weaponSystem;
          const pos: [number, number, number] = humanPosRef.current
            ? [humanPosRef.current.x, humanPosRef.current.y, humanPosRef.current.z]
            : currentSession.humanPosition;
          const heading = humanPosRef.current ? humanPosRef.current.heading : currentSession.humanHeading;
          isAttackingRef.current = true;
          startAttack(pos, heading);
          setWeaponHUDTick((t) => t + 1);
          return;
        }

        // [Q] — previous weapon
        if (e.code === "KeyQ") {
          weaponSystem.prevWeapon();
          setWeaponHUDTick((t) => t + 1);
          return;
        }

        // Number keys [1-5] — select weapon by index
        const numMap: Record<string, number> = {
          Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4,
        };
        if (e.code in numMap) {
          const idx = numMap[e.code];
          const ws = weaponSystem.stateRef.current;
          weaponSystem.stateRef.current = {
            ...ws,
            activeWeaponIndex: idx,
            activeWeaponId: WEAPON_ORDER[idx],
            activeAttack: null,
            chargeLevel: 0,
          };
          setWeaponHUDTick((t) => t + 1);
          return;
        }
      }

      if (e.code === "Space") {
        if (currentMode === "DRIVING") {
          inputRef.current.brake = true;
          return;
        } else {
          // Space also triggers context interaction when on foot
          if (e.repeat) return;
          interactionHandlerRef.current();
          return;
        }
      }

      if (isDismountingRef.current) return;

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
      // Release attack key — fire charge weapons on release
      if (e.code === "KeyF") {
        isAttackingRef.current = false;
        if (playerModeRef.current === "ON_FOOT" && weaponSystem.stateRef.current.activeAttack?.isCharging) {
          const pos: [number, number, number] = humanPosRef.current
            ? [humanPosRef.current.x, humanPosRef.current.y, humanPosRef.current.z]
            : sessionRef.current.humanPosition;
          const heading = humanPosRef.current ? humanPosRef.current.heading : sessionRef.current.humanHeading;
          weaponSystem.releaseAttack(pos, heading);
          setWeaponHUDTick((t) => t + 1);
        }
        return;
      }

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
  }, [handleMountVehicle, handleDismountVehicle, weaponSystem]);

  // ── Synchronized UI Update Callback from ContinuousWorldPhysics (Runs at 60Hz without 3D Stutter) ──
  const handleSyncUI = useCallback((
    x: number,
    z: number,
    heading: number,
    isMoving: boolean,
    vehicle?: VehicleState
  ) => {
    const currentSession = sessionRef.current;

    // Check walking into Day 3 Semicolon Portal at Office entrance
    if (
      currentSession.dayNumber === 3 &&
      currentSession.phase === "PORTAL_APPROACH" &&
      currentSession.workplace.allTasksDone &&
      Math.hypot(x - 18.0, z - 75.8) < 2.0
    ) {
      soundManager.playPortalWhoosh();
      if (vehicleStateRef.current) {
        vehicleStateRef.current.position = { x: 0, y: 0.35, z: 118 };
        vehicleStateRef.current.speed = 0;
      }
      humanVelocityRef.current = { vx: 0, vz: 0 };
      humanPosRef.current = { x: 0, y: 0, z: 125, heading: 0 };
      setSession((prev) => enterAlternateDimension(prev));
      setIsVoidCutsceneOpen(true);
      return;
    }

    // Check walking into Keep Doorway in Castle Courtyard
    if (Math.hypot(x - 0, z - 198.0) < 2.2 && !currentSession.kastil.insideEscapeRoom) {
      soundManager.playDoorSlam();
      humanVelocityRef.current = { vx: 0, vz: 0 };
      humanPosRef.current = { x: 0, y: 0, z: 201.0, heading: 0 };
      setSession((prev) => ({
        ...prev,
        currentLocation: "KASTIL",
        humanPosition: [0, 0, 201.0],
        humanHeading: 0,
        kastil: {
          ...prev.kastil,
          insideEscapeRoom: true,
        },
        activePrompt: "✦ PINTU TERBANTING MENUTUP! Kamu terkunci di aula kastil! Cari cara keluar (Escape Room).",
      }));
      return;
    }

    if (playerModeRef.current === "ON_FOOT") {
      setIsHumanMoving(isMoving);
      setSession((prev) => {
        let updated: GameSessionState = {
          ...prev,
          humanPosition: [x, 0, z],
          humanHeading: heading,
        };

        // Zone 1: Entered Office Building
        if (
          (updated.phase === "COMMUTE_TO_WORK" || updated.phase === "AT_WORK") &&
          x >= 11 && x <= 25 && z >= 63 && z <= 77
        ) {
          if (updated.currentLocation !== "TEMPAT_KERJA") {
            updated = {
              ...updated,
              currentLocation: "TEMPAT_KERJA",
              phase: "AT_WORK",
              activePrompt: updated.workplace.allTasksDone
                ? "✦ Tugas selesai. Kembali ke mobil untuk pulang."
                : "✦ Masuk kantor. Tekan [E] di workstation PC untuk mulai coding.",
            };
          }
        }

        // Zone 2: Returned Home
        if (
          updated.phase === "COMMUTE_HOME" &&
          x >= 16 && x <= 24 && z >= -64 && z <= -56
        ) {
          if (updated.currentLocation !== "RUMAH") {
            const arrived = arriveHomeForEvening(updated);
            updated = {
              ...arrived,
              humanPosition: [x, 0, z],
              humanHeading: heading,
            };
          }
        }

        // Zone 3: Left Home onto Driveway
        if (
          updated.phase === "MORNING_ROUTINE" &&
          updated.rumah.canExitHouse &&
          (x < 15.5 || z > -55.5)
        ) {
          if (updated.currentLocation !== "JALAN") {
            updated = {
              ...updated,
              currentLocation: "JALAN",
              phase: "COMMUTE_TO_WORK",
              activePrompt: "✦ Menuju mobil Quattro di halaman depan.",
            };
          }
        }

        return updated;
      });
    } else if (vehicle) {
      if (humanPosRef.current) {
        humanPosRef.current.x = vehicle.position.x;
        humanPosRef.current.y = vehicle.position.y;
        humanPosRef.current.z = vehicle.position.z;
        humanPosRef.current.heading = vehicle.heading;
      }
      setVehicleState({ ...vehicle });
    }
  }, []);

  const handleFootstep = useCallback(() => {
    soundManager.playFootstep();
  }, []);

  // ── Context-Sensitive Interaction Logic for [E] / Click ──
  const handleContextInteraction = useCallback(() => {
    // 0. VEHICLE MOUNT / DISMOUNT VIA CONTEXT BUTTON OR SPACE
    if (playerModeRef.current === "DRIVING") {
      handleDismountVehicle();
      return;
    }

    const [hx, , hz] = [
      humanPosRef.current?.x ?? session.humanPosition[0],
      session.humanPosition[1],
      humanPosRef.current?.z ?? session.humanPosition[2],
    ];

    // Proximity to vehicle on foot
    const car = vehicleStateRef.current;
    const distToCar = Math.hypot(hx - car.position.x, hz - car.position.z);
    if (distToCar < 3.8) {
      handleMountVehicle();
      return;
    }

    // 1. RUMAH INTERACTIONS (all in continuous world coords)
    const distToBed = Math.hypot(hx - 17.6, hz - (-63.2));
    const distToStove = Math.hypot(hx - 16.2, hz - (-59.0));
    const distToTable = Math.hypot(hx - 20.8, hz - (-58.4));
    const distToShower = Math.hypot(hx - 23.4, hz - (-63.4));
    const distToDoor = Math.hypot(hx - 20.0, hz - (-55.7));

    // Morning wake up
    if (distToBed < 2.2 && session.phase === "MORNING_ROUTINE" && !session.rumah.wokenUp) {
      soundManager.playClick();
      setSession((prev) => wakeUp(prev));
      return;
    }

    // Cook at stove
    if (distToStove < 2.0 && session.phase === "MORNING_ROUTINE" && session.rumah.wokenUp && !session.rumah.hasCooked) {
      soundManager.playCook();
      setSession((prev) => cookBreakfast(prev));
      return;
    }

    // Eat at dining table
    if (distToTable < 2.0) {
      if (session.phase === "EVENING_ROUTINE" && session.rumah.hasShoweredEvening && !session.rumah.hasEatenEvening) {
        soundManager.playEat();
        setSession((prev) => eatDinner(prev));
        return;
      } else if (session.phase === "MORNING_ROUTINE" && session.rumah.hasCooked && !session.rumah.hasEaten) {
        soundManager.playEat();
        setSession((prev) => eatBreakfast(prev));
        return;
      }
    }

    // Shower in bathroom
    if (distToShower < 2.2) {
      if (session.phase === "EVENING_ROUTINE" && !session.rumah.hasShoweredEvening) {
        soundManager.playWater();
        setSession((prev) => takeEveningShower(prev));
        return;
      } else if (session.phase === "MORNING_ROUTINE" && session.rumah.hasEaten && !session.rumah.hasShowered) {
        soundManager.playWater();
        setSession((prev) => takeMorningShower(prev));
        return;
      }
    }

    // Evening sleep in bed
    if (distToBed < 2.2 && session.phase === "EVENING_ROUTINE") {
      if (session.rumah.canSleepEvening) {
        soundManager.playPurr();
        const next = advanceDay(session);
        // Reset player ref and vehicle to driveway for fresh morning
        humanPosRef.current = {
          x: next.humanPosition[0],
          y: 0,
          z: next.humanPosition[2],
          heading: next.humanHeading,
        };
        humanVelocityRef.current = { vx: 0, vz: 0 };
        setVehicleState((prev) => ({
          ...prev,
          position: { x: 20, y: 0.35, z: -48 },
          heading: 0,
          speed: 0,
          lateralSpeed: 0,
          angularVelocity: 0,
          driftFactor: 0,
          doorAngle: 0,
        }));
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

    // Exit front door onto porch/driveway (seamless exploration)
    if (distToDoor < 2.2 && session.phase === "MORNING_ROUTINE") {
      soundManager.playClick();
      setSession((prev) => ({
        ...prev,
        currentLocation: "JALAN",
        phase: "COMMUTE_TO_WORK",
        rumah: {
          ...prev.rumah,
          canExitHouse: true,
        },
        activePrompt: "✦ Menuju mobil Quattro di halaman depan. Tekan [E] untuk masuk.",
      }));
      return;
    }

    // 2. CONTINUOUS WORLD INTERACTIONS
    // Proximity to Mechanic Pak Montir at [-19.5, 0, -2.0]
    const distToMontir = Math.hypot(hx - (-19.5), hz - (-2.0));
    if (distToMontir < 3.2) {
      soundManager.playPurr();
      setActiveNpcId("mechanic");
      return;
    }

    // Proximity to Workplace PC Workstation at [21.0, 0, 68.0]
    const distToPC = Math.hypot(hx - 21.0, hz - 68.0);
    if (distToPC < 3.0 && !session.workplace.allTasksDone) {
      soundManager.playClick();
      setIsWorkModalOpen(true);
      return;
    }

    // Proximity to Castle NPCs
    const distToJeffrey = Math.hypot(hx - (-3.5), hz - 176.0);
    const distToVespera = Math.hypot(hx - 3.5, hz - 176.0);
    const distToBarnaby = Math.hypot(hx - (-5.0), hz - 180.0);
    const distToFountain = Math.hypot(hx - 0, hz - 179.0);
    const distToHay = Math.hypot(hx - (-5.5), hz - 183.0);
    const distToKeepDoor = Math.hypot(hx - 0, hz - 198.0);

    if (distToJeffrey < 2.5) {
      soundManager.playClick();
      setActiveNpcId("jeffrey");
      return;
    }
    if (distToVespera < 2.5) {
      soundManager.playClick();
      setActiveNpcId("vespera");
      return;
    }
    if (distToBarnaby < 2.5) {
      soundManager.playClick();
      setActiveNpcId("barnaby");
      return;
    }

    // Easter Eggs
    if (distToFountain < 2.5 && !session.kastil.easterEggs.fountain) {
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

    if (distToHay < 2.5 && !session.kastil.easterEggs.hayBales) {
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
      setEasterEggAlert("Kamu menemukan Easter Egg Semicolon tersembunyi di balik jerami!");
      return;
    }

    // Keep Doorway Entry
    if (distToKeepDoor < 2.5 && !session.kastil.insideEscapeRoom) {
      soundManager.playDoorSlam();
      humanVelocityRef.current = { vx: 0, vz: 0 };
      humanPosRef.current = { x: 0, y: 0, z: 201.0, heading: 0 };
      setSession((prev) => ({
        ...prev,
        currentLocation: "KASTIL",
        humanPosition: [0, 0, 201.0],
        humanHeading: 0,
        kastil: { ...prev.kastil, insideEscapeRoom: true },
        activePrompt: "✦ PINTU TERBANTING MENUTUP! Kamu terkunci di aula kastil! Cari cara keluar (Escape Room).",
      }));
      return;
    }

    // 3. INSIDE ESCAPE ROOM (physically inside Keep at Z = 205)
    if (session.kastil.insideEscapeRoom) {
      const distToCabinet = Math.hypot(hx - 5.5, hz - 205.0);
      const distToStove = Math.hypot(hx - (-5.5), hz - 205.0);
      const distToSecretWall = Math.hypot(hx - 1.4, hz - 210.8);
      const distToExitDoor = Math.hypot(hx - (-2.0), hz - 210.8);

      if (distToCabinet < 2.5) {
        soundManager.playClick();
        setEscapeInspectTarget("CABINET");
        return;
      }
      if (distToStove < 2.5 && session.kastil.escapeRoom.cabinetSearched) {
        soundManager.playClick();
        setEscapeInspectTarget("STOVE");
        return;
      }
      if (
        distToSecretWall < 2.5 &&
        session.kastil.escapeRoom.cabinetSearched &&
        session.kastil.escapeRoom.stoveChecked
      ) {
        soundManager.playClick();
        setEscapeInspectTarget("SECRET_WALL");
        return;
      }
      if (distToExitDoor < 2.5) {
        soundManager.playClick();
        setEscapeInspectTarget("EXIT_DOOR");
        return;
      }
    }
  }, [session, handleMountVehicle, handleDismountVehicle]);

  interactionHandlerRef.current = handleContextInteraction;

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

  // Final Escape to Victory
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
    setPlayerMode("ON_FOOT");
    setVehicleState({
      ...createInitialVehicleState(),
      position: { x: 20, y: 0.35, z: -48 },
      heading: 0,
      doorAngle: 0,
    });
  };

  // ── Contextual HUD Prompt Calculation ──
  let contextualAction: string | null = null;
  const [playerWorldX, , playerWorldZ] = session.humanPosition;

  if (playerMode === "DRIVING") {
    contextualAction = "Turun Mobil";
  } else if (playerMode === "ON_FOOT") {
    // Proximity to vehicle in world space
    const distToCar = Math.hypot(playerWorldX - vehicleState.position.x, playerWorldZ - vehicleState.position.z);
    if (distToCar < 3.8) {
      contextualAction = "Masuk Quattro";
    } else {
      const isEvening = session.phase === "EVENING_ROUTINE";
      if (Math.hypot(playerWorldX - 17.6, playerWorldZ - (-63.2)) < 2.2) {
        contextualAction = isEvening && session.rumah.canSleepEvening ? "Tidur" : !isEvening && !session.rumah.wokenUp ? "Bangun" : null;
      } else if (!isEvening && Math.hypot(playerWorldX - 16.2, playerWorldZ - (-59.0)) < 2.0 && session.rumah.wokenUp && !session.rumah.hasCooked) {
        contextualAction = "Masak Sarapan";
      } else if (Math.hypot(playerWorldX - 20.8, playerWorldZ - (-58.4)) < 2.0) {
        if (isEvening && !session.rumah.hasEatenEvening) contextualAction = "Makan Malam";
        else if (!isEvening && session.rumah.hasCooked && !session.rumah.hasEaten) contextualAction = "Makan Sarapan";
      } else if (Math.hypot(playerWorldX - 23.4, playerWorldZ - (-63.4)) < 2.2) {
        if (isEvening && !session.rumah.hasShoweredEvening) contextualAction = "Mandi Malam";
        else if (!isEvening && session.rumah.hasEaten && !session.rumah.hasShowered) contextualAction = "Mandi Pagi";
      } else if (!isEvening && Math.hypot(playerWorldX - 20.0, playerWorldZ - (-55.7)) < 2.0) {
        contextualAction = session.rumah.canExitHouse ? "Keluar ke Halaman" : "Buka Pintu (Eksplorasi)";
      } else if (session.kastil.insideEscapeRoom) {
        if (Math.hypot(playerWorldX - 5.5, playerWorldZ - 205.0) < 2.5) contextualAction = "Periksa Lemari";
        else if (session.kastil.escapeRoom.cabinetSearched && Math.hypot(playerWorldX - (-5.5), playerWorldZ - 205.0) < 2.5) contextualAction = "Periksa Perapian";
        else if (session.kastil.escapeRoom.cabinetSearched && session.kastil.escapeRoom.stoveChecked && Math.hypot(playerWorldX - 1.4, playerWorldZ - 210.8) < 2.5) contextualAction = "Periksa Batu Longgar";
        else if (Math.hypot(playerWorldX - (-2.0), playerWorldZ - 210.8) < 2.5) contextualAction = "Periksa Pintu Keluar";
      } else {
        if (Math.hypot(playerWorldX - (-19.5), playerWorldZ - (-2.0)) < 3.2) contextualAction = "Bincang · Pak Montir";
        else if (Math.hypot(playerWorldX - 21.0, playerWorldZ - 68.0) < 3.0 && !session.workplace.allTasksDone) contextualAction = "Workstation · Coding";
        else if (Math.hypot(playerWorldX - (-3.5), playerWorldZ - 176.0) < 2.5) contextualAction = "Bincang · Jeffrey";
        else if (Math.hypot(playerWorldX - 3.5, playerWorldZ - 176.0) < 2.5) contextualAction = "Bincang · Vespera";
        else if (Math.hypot(playerWorldX - (-5.0), playerWorldZ - 180.0) < 2.5) contextualAction = "Bincang · Barnaby";
        else if (Math.hypot(playerWorldX, playerWorldZ - 179.0) < 2.5 && !session.kastil.easterEggs.fountain) contextualAction = "Periksa · Air Mancur";
        else if (Math.hypot(playerWorldX - (-5.5), playerWorldZ - 183.0) < 2.5 && !session.kastil.easterEggs.hayBales) contextualAction = "Periksa · Jerami";
        else if (Math.hypot(playerWorldX, playerWorldZ - 198.0) < 2.5) contextualAction = "Masuk Great Keep";
      }
    }
  }

  return (
    <LocalizationContext.Provider value={localization}>
      <div className="relative w-full h-full overflow-hidden select-none bg-black">
        {/* Opening Cinematic (shown on first visit or via replay button) */}
        {showOpeningCinematic && (
          <OpeningCinematic onComplete={handleCompleteCinematic} />
        )}

        {/* Character Selection Modal */}
        <CharacterSelectModal
          isOpen={isCharacterSelectOpen}
          onSelectCharacter={handleSelectCharacter}
          selectedId={characterId}
        />

        {/* Bottom Left Language Switcher */}
        {session.currentLocation !== "END_SCREEN" && (
          <LanguageSelector />
        )}

        {/* 3D Canvas Rendering Active Continuous Exploration Scene (only mount after cinematic completes) */}
        {!showOpeningCinematic && session.currentLocation !== "END_SCREEN" && (
          <GameCanvas
            playerMode={playerMode}
            humanPos={session.humanPosition}
            humanHeading={session.humanHeading}
            isHumanMoving={isHumanMoving}
            characterId={characterId}
            isInsideEscapeRoom={session.kastil.insideEscapeRoom}
            remotePlayers={realtime.remotePlayers}
            vehicleState={vehicleState}
            vehicleStateRef={vehicleStateRef}
          humanPosRef={humanPosRef}
          humanVelocityRef={humanVelocityRef}
          inputRef={inputRef}
          canExitHouse={session.rumah.canExitHouse || session.currentLocation !== "RUMAH"}
          isPaused={session.isPaused}
          onFootstep={handleFootstep}
          onSyncUI={handleSyncUI}
          cameraMode={cameraMode}
          weaponSystemStateRef={weaponSystem.stateRef}
          isAttackingRef={isAttackingRef}
          isChargingRef={isChargingRef}
          activeWeaponId={weaponSystem.stateRef.current.activeWeaponId}
          chargeLevel={weaponSystem.stateRef.current.chargeLevel}
          attackProgress={weaponSystem.stateRef.current.activeAttack?.progress ?? 0}
          isAttacking={isAttackingRef.current}
        >
          <UnifiedWorld
            playerMode={playerMode}
            humanPos={session.humanPosition}
            humanHeading={session.humanHeading}
            vehicleState={vehicleState}
            vehicleStateRef={vehicleStateRef}
            humanPosRef={humanPosRef}
            dayNumber={session.dayNumber}
            rumahState={session.rumah}
            workplaceState={session.workplace}
            kastilState={session.kastil}
            isEvening={session.phase === "EVENING_ROUTINE"}
            isAttacking={isAttackingRef.current}
            activeWeaponId={weaponSystem.stateRef.current.activeWeaponId}
            weaponStateRef={weaponSystem.stateRef}
            cameraMode={cameraMode}
          />
        </GameCanvas>
      )}

      {/* Driving HUD — shown when driving */}
      {playerMode === "DRIVING" && session.currentLocation !== "END_SCREEN" && (
        <DrivingHUD
          vehicleState={vehicleState}
          cameraMode={cameraMode}
          onToggleCamera={() => setCameraMode((prev) => (prev === "CHASE" ? "COCKPIT" : "CHASE"))}
          isVoidHighway={session.dayNumber === 3 || vehicleState.position.z > 120}
        />
      )}

      {/* Weapon HUD — shown when exploring on foot */}
      {playerMode === "ON_FOOT" && session.currentLocation !== "END_SCREEN" && !session.isPaused && (
        <WeaponHUD
          activeWeaponId={weaponSystem.stateRef.current.activeWeaponId}
          chargeLevel={weaponSystem.stateRef.current.chargeLevel}
          isAttacking={isAttackingRef.current}
          onNextWeapon={() => { weaponSystem.nextWeapon(); setWeaponHUDTick((t) => t + 1); }}
          onPrevWeapon={() => { weaponSystem.prevWeapon(); setWeaponHUDTick((t) => t + 1); }}
          onSelectWeapon={(idx) => {
            const ws = weaponSystem.stateRef.current;
            weaponSystem.stateRef.current = {
              ...ws,
              activeWeaponIndex: idx,
              activeWeaponId: WEAPON_ORDER[idx],
              activeAttack: null,
              chargeLevel: 0,
            };
            setWeaponHUDTick((t) => t + 1);
          }}
          onStartAttack={() => {
            const pos: [number, number, number] = humanPosRef.current
              ? [humanPosRef.current.x, humanPosRef.current.y, humanPosRef.current.z]
              : sessionRef.current.humanPosition;
            const heading = humanPosRef.current ? humanPosRef.current.heading : sessionRef.current.humanHeading;
            isAttackingRef.current = true;
            weaponSystem.startAttack(pos, heading);
            setWeaponHUDTick((t) => t + 1);
          }}
          onReleaseAttack={() => {
            isAttackingRef.current = false;
            if (weaponSystem.stateRef.current.activeAttack?.isCharging) {
              const pos: [number, number, number] = humanPosRef.current
                ? [humanPosRef.current.x, humanPosRef.current.y, humanPosRef.current.z]
                : sessionRef.current.humanPosition;
              const heading = humanPosRef.current ? humanPosRef.current.heading : sessionRef.current.humanHeading;
              weaponSystem.releaseAttack(pos, heading);
              setWeaponHUDTick((t) => t + 1);
            }
          }}
        />
      )}

      {/* Top Left: Ambient Synth & Menu HUD */}
      {session.currentLocation !== "END_SCREEN" && (
        <div className="fixed top-4 left-4 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.init();
              soundManager.ensureAudioContext();
              setSession((prev) => ({ ...prev, isAudioMuted: !prev.isAudioMuted }));
            }}
            className="flex items-center gap-2 border border-quatro-cream/20 bg-quatro-navy/85 px-3 py-2 text-quatro-cream shadow-xl backdrop-blur-md transition-all hover:bg-quatro-navy hover:border-quatro-amber active:scale-95"
            title={session.isAudioMuted ? "Unmute Ambient Audio" : "Mute Audio"}
          >
            {session.isAudioMuted ? (
              <span className="text-red-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                🔇 Audio Off
              </span>
            ) : (
              <span className="text-quatro-amber font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-quatro-amber h-1.5 animate-pulse" />
                  <span className="w-0.5 bg-quatro-amber h-3 animate-pulse delay-75" />
                  <span className="w-0.5 bg-quatro-amber h-2 animate-pulse delay-150" />
                </span>
                Synthwave Lo-fi
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSession((prev) => ({ ...prev, isPaused: !prev.isPaused }))}
            className="border border-quatro-cream/20 bg-quatro-navy/85 px-2.5 py-2 text-[10px] font-mono uppercase tracking-wider text-quatro-cream/70 shadow-xl backdrop-blur-md transition-all hover:bg-quatro-navy hover:text-quatro-cream active:scale-95"
            title="Pause [Esc]"
          >
            Esc · Menu
          </button>
        </div>
      )}

      {/* Global Quest Banner */}
      {session.currentLocation !== "END_SCREEN" && (
        <div
          aria-live="polite"
          className="fixed top-4 right-4 z-40 flex max-w-[min(24rem,calc(100vw-2rem))] items-center gap-3 border-l-2 border-quatro-amber bg-quatro-navy/85 px-3.5 py-2.5 text-quatro-cream shadow-2xl backdrop-blur-md"
        >
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-quatro-amber">
            Day {session.dayNumber} · {playerMode}
          </span>
          <span className="h-5 w-px bg-quatro-cream/20" />
          <span className="text-xs font-medium leading-snug">{getCurrentObjective(session)}</span>
        </div>
      )}

      {/* Contextual Action Button */}
      {contextualAction && session.currentLocation !== "END_SCREEN" && (
        <button
          type="button"
          onClick={handleContextInteraction}
          className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 border border-quatro-amber/60 bg-quatro-navy/85 px-5 py-2.5 text-xs font-mono tracking-wide text-quatro-cream shadow-2xl backdrop-blur-md transition-all hover:bg-quatro-navy hover:border-quatro-amber hover:scale-105 active:scale-95"
        >
          <span className="mr-2 rounded bg-quatro-amber/20 px-1.5 py-0.5 text-quatro-amber font-bold">E</span>
          <span className="mr-2 text-quatro-cream/40">/ CLICK</span>
          {contextualAction}
        </button>
      )}

      {/* Online count */}
      {session.currentLocation !== "END_SCREEN" && (
        <div className="fixed bottom-3 right-4 z-30 pointer-events-none font-mono text-[9px] uppercase tracking-wider text-quatro-cream/60 bg-black/40 px-2.5 py-1 rounded backdrop-blur-sm">
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${realtime.connectionStatus === "CONNECTED" ? "bg-emerald-400" : realtime.connectionStatus === "CONNECTING" ? "bg-amber-300 animate-pulse" : "bg-quatro-cream/30"}`} />
          {realtime.connectionStatus === "CONNECTED"
            ? `${Math.max(0, realtime.onlineCount - 1)} nearby`
            : realtime.connectionStatus.toLowerCase()}
        </div>
      )}

      {/* Location 1 Overlay: Rumah Routine Checklist (shown during morning/evening routine) */}
      {(session.phase === "MORNING_ROUTINE" || session.phase === "EVENING_ROUTINE") && (
        <HomeRoutineOverlay
          dayNumber={session.dayNumber}
          rumahState={session.rumah}
          isEvening={session.phase === "EVENING_ROUTINE"}
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
    </LocalizationContext.Provider>
  );
}
