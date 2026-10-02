"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GameCanvas } from "./GameCanvas";
import { UnifiedWorld } from "@/game/world/UnifiedWorld";
import { CastleEscapeRoomScene } from "@/game/world/CastleEscapeRoomScene";

import { HomeRoutineOverlay } from "@/components/ui/HomeRoutineOverlay";
import { OfficeWorkstationModal } from "@/components/ui/OfficeWorkstationModal";
import { VoidLoreCutsceneModal } from "@/components/ui/VoidLoreCutsceneModal";
import { CastleLoreDialogueModal } from "@/components/ui/CastleLoreDialogueModal";
import { CastleEscapeRoomModal } from "@/components/ui/CastleEscapeRoomModal";
import { EndCreditsScene } from "@/components/ui/EndCreditsScene";
import { PauseOverlay } from "@/components/ui/PauseOverlay";
import { DrivingHUD } from "@/components/ui/DrivingHUD";
import { WeaponHUD } from "@/components/ui/WeaponHUD";

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
  takeEveningShower,
  takeMorningShower,
  wakeUp,
} from "@/game/core/gameStore";
import { soundManager } from "@/game/audio/SoundManager";
import { resolvePlayerPosition } from "@/game/core/playerCollision";
import { createInitialVehicleState, updateVehiclePhysics } from "@/game/vehicle/vehiclePhysics";
import { VehicleState, CameraMode } from "@/game/vehicle/vehicleTypes";
import { useGameRealtime } from "@/game/realtime/useGameRealtime";
import { useWeaponSystem } from "@/game/weapons/WeaponSystem";
import { WEAPON_ORDER } from "@/game/weapons/weaponTypes";

export type PlayerMode = "ON_FOOT" | "DRIVING";

export default function ProjectQuatroApp() {
  const [session, setSession] = useState<GameSessionState>(createInitialSessionState);
  const [playerMode, setPlayerMode] = useState<PlayerMode>("ON_FOOT");
  const [isHumanMoving, setIsHumanMoving] = useState(false);

  // Initial vehicle parked outside Home in driveway
  const [vehicleState, setVehicleState] = useState<VehicleState>(() => ({
    ...createInitialVehicleState(),
    position: { x: 20, y: 0.35, z: -48 },
    heading: 0,
  }));
  const [cameraMode, setCameraMode] = useState<CameraMode>("CHASE");

  // Weapon system
  const weaponSystem = useWeaponSystem();
  const [weaponHUDTick, setWeaponHUDTick] = useState(0);
  const isAttackingRef = useRef(false);
  const isChargingRef = useRef(false);

  const sessionRef = useRef(session);
  const playerModeRef = useRef(playerMode);
  const isHumanMovingRef = useRef(false);
  const vehicleStateRef = useRef(vehicleState);
  const humanVelocityRef = useRef({ vx: 0, vz: 0 });
  const lastStateSyncTime = useRef(0);

  const initialWorldPos: [number, number, number] =
    session.currentLocation === "RUMAH"
      ? [20 + session.humanPosition[0], session.humanPosition[1], -60 + session.humanPosition[2]]
      : session.humanPosition;

  const humanPosRef = useRef({
    x: initialWorldPos[0],
    y: initialWorldPos[1],
    z: initialWorldPos[2],
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

  const lastFootstepTime = useRef(0);

  // Sound Engine initialization on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.init();
      soundManager.setMode(playerModeRef.current === "DRIVING" ? "DRIVING" : "WALKING");
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

  // Mount / Dismount helper functions
  const handleMountVehicle = useCallback(() => {
    soundManager.playVehicleMount();
    soundManager.setMode("DRIVING");
    humanVelocityRef.current = { vx: 0, vz: 0 };
    setPlayerMode("DRIVING");
    setSession((prev) => ({
      ...prev,
      currentLocation: "JALAN",
      activePrompt: "✦ Di dalam Quattro. [WASD] Kemudikan, [Space] Drift FR, [C] Ganti Kamera, [E] Turun.",
    }));
  }, []);

  const handleDismountVehicle = useCallback(() => {
    const car = vehicleStateRef.current;
    soundManager.playVehicleDismount();
    soundManager.setMode("WALKING");
    soundManager.updateEngine(0, false);
    soundManager.updateTireDrift(0, 0);
    humanVelocityRef.current = { vx: 0, vz: 0 };

    // Dismount left of driver door safely within world bounds
    const dismountX = THREE.MathUtils.clamp(car.position.x - Math.cos(car.heading) * 1.8, -26, 26);
    const dismountZ = THREE.MathUtils.clamp(car.position.z + Math.sin(car.heading) * 1.8, -80, 220);
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
  }, []);

  // Keyboard listeners for WASD / Arrows / E / Space / Escape / C / F / Q
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      // [E] Seamless Mount / Dismount or Context Interaction
      if (e.code === "KeyE") {
        if (e.repeat) return;
        if (currentMode === "DRIVING") {
          handleDismountVehicle();
          return;
        } else {
          // Check proximity to car in world coordinates
          const [hx, , hz] = currentSession.currentLocation === "RUMAH"
            ? [20 + currentSession.humanPosition[0], currentSession.humanPosition[1], -60 + currentSession.humanPosition[2]]
            : currentSession.humanPosition;
          const car = vehicleStateRef.current;
          const distToCar = Math.hypot(hx - car.position.x, hz - car.position.z);
          if (distToCar < 3.4) {
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
          const pos = currentSession.humanPosition;
          isAttackingRef.current = true;
          startAttack(pos, currentSession.humanHeading);
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
        const currentSession = sessionRef.current;
        if (playerModeRef.current === "ON_FOOT" && weaponSystem.stateRef.current.activeAttack?.isCharging) {
          weaponSystem.releaseAttack(currentSession.humanPosition, currentSession.humanHeading);
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

  // Main Butter-Smooth 60FPS Movement, Driving & Proximity Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const currentSession = sessionRef.current;
      const currentMode = playerModeRef.current;

      if (
        !currentSession.isPaused &&
        !isWorkModalOpen &&
        !isVoidCutsceneOpen &&
        !activeNpcId &&
        !easterEggAlert &&
        !escapeInspectTarget &&
        currentSession.currentLocation !== "END_SCREEN"
      ) {
        if (currentMode === "ON_FOOT") {
          let inputX = 0;
          let inputZ = 0;

          if (inputRef.current.forward) inputZ -= 1;
          if (inputRef.current.backward) inputZ += 1;
          if (inputRef.current.left) inputX -= 1;
          if (inputRef.current.right) inputX += 1;

          const isPressingMove = inputX !== 0 || inputZ !== 0;
          let targetVx = 0;
          let targetVz = 0;
          const walkSpeed = 4.6;

          if (isPressingMove) {
            const len = Math.hypot(inputX, inputZ);
            targetVx = (inputX / len) * walkSpeed;
            targetVz = (inputZ / len) * walkSpeed;
          }

          // Smooth exponential velocity damping (1 - exp(-14 * dt))
          const velAlpha = 1.0 - Math.exp(-14.0 * dt);
          humanVelocityRef.current.vx += (targetVx - humanVelocityRef.current.vx) * velAlpha;
          humanVelocityRef.current.vz += (targetVz - humanVelocityRef.current.vz) * velAlpha;

          const currentSpeed = Math.hypot(humanVelocityRef.current.vx, humanVelocityRef.current.vz);
          const isMoving = currentSpeed > 0.08;

          if (isHumanMovingRef.current !== isMoving) {
            isHumanMovingRef.current = isMoving;
            setIsHumanMoving(isMoving);
          }

          if (isMoving) {
            let nextX = currentSession.humanPosition[0] + humanVelocityRef.current.vx * dt;
            let nextZ = currentSession.humanPosition[2] + humanVelocityRef.current.vz * dt;

            // Shortest-arc smooth heading rotation
            const targetHeading = Math.atan2(humanVelocityRef.current.vx, humanVelocityRef.current.vz);
            let headingDiff = targetHeading - currentSession.humanHeading;
            while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
            while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
            const headingAlpha = 1.0 - Math.exp(-15.0 * dt);
            const nextHeading = currentSession.humanHeading + headingDiff * headingAlpha;

            if (currentSession.currentLocation === "RUMAH") {
              nextX = Math.max(-3.8, Math.min(3.8, nextX));
              nextZ = Math.max(-3.8, Math.min(4.2, nextZ));

              // Resolve bedroom/kitchen/bathroom walls
              const [rx, , rz] = resolvePlayerPosition(
                currentSession.humanPosition,
                [nextX, 0, nextZ],
                "RUMAH",
                false,
                0.32
              );
              nextX = rx;
              nextZ = rz;

              // Walking out front door onto driveway
              if (currentSession.rumah.canExitHouse && Math.hypot(nextX - 0, nextZ - 4.0) < 1.1) {
                soundManager.playDoorOpen();
                humanVelocityRef.current = { vx: 0, vz: 0 };
                humanPosRef.current = { x: 20.0, y: 0, z: -54.0, heading: 0 };
                setSession((prev) => ({
                  ...prev,
                  currentLocation: "JALAN",
                  phase: "COMMUTE_TO_WORK",
                  humanPosition: [20.0, 0, -54.0],
                  humanHeading: 0,
                  activePrompt: "✦ Pagi yang cerah. Mobil Quattro terparkir di depan [E].",
                }));
                return;
              }
            } else if (currentSession.currentLocation === "KASTIL" && currentSession.kastil.insideEscapeRoom) {
              // Escape Room interior bounds
              nextX = Math.max(-5.5, Math.min(5.5, nextX));
              nextZ = Math.max(-5.8, Math.min(5.8, nextZ));
              const [rx, , rz] = resolvePlayerPosition(
                currentSession.humanPosition,
                [nextX, 0, nextZ],
                "KASTIL",
                true,
                0.32,
                currentSession.kastil.escapeRoom.doorUnlocked
              );
              nextX = rx;
              nextZ = rz;
            } else {
              // Continuous Open World Map bounds
              nextX = THREE.MathUtils.clamp(nextX, -28.0, 28.0);
              nextZ = THREE.MathUtils.clamp(nextZ, -85.0, 225.0);

              // Check walking into Day 3 Semicolon Portal at Office entrance
              if (
                currentSession.dayNumber === 3 &&
                currentSession.phase === "PORTAL_APPROACH" &&
                currentSession.workplace.allTasksDone &&
                Math.hypot(nextX - 18.0, nextZ - 75.8) < 2.0
              ) {
                soundManager.playPortalWhoosh();
                setSession((prev) => enterAlternateDimension(prev));
                setIsVoidCutsceneOpen(true);
                return;
              }

              // Check walking into Keep Doorway in Castle Courtyard
              if (Math.hypot(nextX - 0, nextZ - 198.0) < 2.2) {
                soundManager.playDoorSlam();
                setSession((prev) => ({
                  ...prev,
                  currentLocation: "KASTIL",
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

            // Continuous sub-frame positioning in humanPosRef
            const worldX = currentSession.currentLocation === "RUMAH" ? 20 + nextX : nextX;
            const worldZ = currentSession.currentLocation === "RUMAH" ? -60 + nextZ : nextZ;
            humanPosRef.current.x = worldX;
            humanPosRef.current.y = 0;
            humanPosRef.current.z = worldZ;
            humanPosRef.current.heading = nextHeading;
            sessionRef.current.humanPosition = [nextX, 0, nextZ];
            sessionRef.current.humanHeading = nextHeading;

            // Audio footstep throttle
            if (currentTime - lastFootstepTime.current > 300) {
              soundManager.playFootstep();
              lastFootstepTime.current = currentTime;
            }

            if (currentTime - lastStateSyncTime.current > 40) {
              lastStateSyncTime.current = currentTime;
              setSession((prev) => ({
                ...prev,
                humanPosition: [nextX, 0, nextZ],
                humanHeading: nextHeading,
              }));
            }
          }
        } else if (currentMode === "DRIVING") {
          // DRIVING IN CONTINUOUS WORLD
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

          // World boundaries for car
          nextVehicle.position.x = THREE.MathUtils.clamp(nextVehicle.position.x, -28.0, 28.0);
          nextVehicle.position.z = THREE.MathUtils.clamp(nextVehicle.position.z, -85.0, 225.0);

          vehicleStateRef.current = nextVehicle;
          if (currentTime - lastStateSyncTime.current > 40) {
            lastStateSyncTime.current = currentTime;
            setVehicleState(nextVehicle);
          }

          // Update audio
          soundManager.updateEngine(nextVehicle.speed, true);
          soundManager.updateTireDrift(nextVehicle.driftFactor, nextVehicle.speed);

          if (isHumanMovingRef.current) {
            isHumanMovingRef.current = false;
            setIsHumanMoving(false);
          }
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
      if (distToBed < 2.0 && session.phase === "MORNING_ROUTINE" && !session.rumah.wokenUp) {
        soundManager.playClick();
        setSession((prev) => wakeUp(prev));
        return;
      }

      // Cook at stove
      if (distToStove < 1.8 && session.phase === "MORNING_ROUTINE" && session.rumah.wokenUp && !session.rumah.hasCooked) {
        soundManager.playCook();
        setSession((prev) => cookBreakfast(prev));
        return;
      }

      // Eat at dining table
      if (distToTable < 1.8) {
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
      if (distToShower < 2.0) {
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

      // Front Door Exit to Driveway
      if (distToDoor < 1.8 && session.phase === "MORNING_ROUTINE" && session.rumah.canExitHouse) {
        soundManager.playDoorOpen();
        setSession((prev) => ({
          ...prev,
          currentLocation: "JALAN",
          phase: "COMMUTE_TO_WORK",
          humanPosition: [20.0, 0, -54.0],
          humanHeading: 0,
          activePrompt: "Pagi yang cerah. Mobil Quattro terparkir di depan [E].",
        }));
        return;
      }

      // Evening sleep in bed
      if (distToBed < 2.0 && session.phase === "EVENING_ROUTINE") {
        if (session.rumah.canSleepEvening) {
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

    // 2. CONTINUOUS OPEN WORLD INTERACTIONS
    if (session.currentLocation !== "RUMAH" && (!session.kastil.insideEscapeRoom || session.currentLocation !== "KASTIL")) {
      // Proximity to Home Front Door -> Step back inside
      const distToHomeDoor = Math.hypot(hx - 20.0, hz - (-55.7));
      if (distToHomeDoor < 2.5) {
        soundManager.playDoorOpen();
        if (session.phase === "COMMUTE_HOME") {
          setSession((prev) => arriveHomeForEvening(prev));
        } else {
          setSession((prev) => ({
            ...prev,
            currentLocation: "RUMAH",
            humanPosition: [0, 0, 3.6],
            humanHeading: Math.PI,
          }));
        }
        return;
      }

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

      if (distToJeffrey < 2.4) {
        soundManager.playClick();
        setActiveNpcId("jeffrey");
        return;
      }
      if (distToVespera < 2.4) {
        soundManager.playClick();
        setActiveNpcId("vespera");
        return;
      }
      if (distToBarnaby < 2.4) {
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
        setEasterEggAlert("Kamu menemukan Easter Egg Semicolon tersembunyi di balik tumpukan jerami!");
        return;
      }

      // Keep Doorway Entry
      if (distToKeepDoor < 2.5) {
        soundManager.playDoorSlam();
        setSession((prev) => ({
          ...prev,
          currentLocation: "KASTIL",
          humanPosition: [0, 0, 4.5],
          kastil: { ...prev.kastil, insideEscapeRoom: true },
          activePrompt:
            "✦ PINTU TERBANTING MENUTUP! Kamu terkunci di aula kastil! Cari cara keluar (Escape Room).",
        }));
        return;
      }
    }

    // 3. INSIDE ESCAPE ROOM INTERACTIONS
    if (session.currentLocation === "KASTIL" && session.kastil.insideEscapeRoom) {
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
  }, [session]);

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
    });
  };

  // Dynamic rendered position: in RUMAH, seamlessly offsets local coords into the physical house at [20, 0, -60]
  const renderedHumanPos: [number, number, number] =
    session.currentLocation === "RUMAH"
      ? [20 + session.humanPosition[0], session.humanPosition[1], -60 + session.humanPosition[2]]
      : session.humanPosition;

  // Contextual HUD Prompt Calculation
  let contextualAction: string | null = null;
  const [playerWorldX, , playerWorldZ] = renderedHumanPos;
  const [playerLocalX, , playerLocalZ] = session.humanPosition;

  if (playerMode === "DRIVING") {
    contextualAction = "Turun Mobil";
  } else if (playerMode === "ON_FOOT") {
    // Check proximity to vehicle in world space
    const distToCar = Math.hypot(playerWorldX - vehicleState.position.x, playerWorldZ - vehicleState.position.z);
    if (distToCar < 3.4) {
      contextualAction = "Masuk Quattro";
    } else if (session.currentLocation === "RUMAH") {
      const isEvening = session.phase === "EVENING_ROUTINE";
      if (Math.hypot(playerLocalX - (-2.4), playerLocalZ - (-3.2)) < 2.0) {
        contextualAction = isEvening && session.rumah.canSleepEvening ? "Tidur" : !isEvening && !session.rumah.wokenUp ? "Bangun" : null;
      } else if (!isEvening && Math.hypot(playerLocalX - (-3.8), playerLocalZ - 1.0) < 1.8 && session.rumah.wokenUp && !session.rumah.hasCooked) {
        contextualAction = "Masak Sarapan";
      } else if (Math.hypot(playerLocalX - 0.8, playerLocalZ - 1.6) < 1.8) {
        if (isEvening && !session.rumah.hasEatenEvening) contextualAction = "Makan Malam";
        else if (!isEvening && session.rumah.hasCooked && !session.rumah.hasEaten) contextualAction = "Makan Sarapan";
      } else if (Math.hypot(playerLocalX - 3.4, playerLocalZ - (-3.4)) < 2.0) {
        if (isEvening && !session.rumah.hasShoweredEvening) contextualAction = "Mandi Malam";
        else if (!isEvening && session.rumah.hasEaten && !session.rumah.hasShowered) contextualAction = "Mandi Pagi";
      } else if (!isEvening && Math.hypot(playerLocalX - 0, playerLocalZ - 4.0) < 1.8 && session.rumah.canExitHouse) {
        contextualAction = "Keluar ke Halaman";
      }
    } else if (session.currentLocation === "KASTIL" && session.kastil.insideEscapeRoom) {
      if (Math.hypot(playerLocalX + 5.2, playerLocalZ) < 2) contextualAction = "Periksa Lemari";
      else if (session.kastil.escapeRoom.cabinetSearched && Math.hypot(playerLocalX - 5.2, playerLocalZ) < 2) contextualAction = "Periksa Perapian";
      else if (session.kastil.escapeRoom.cabinetSearched && session.kastil.escapeRoom.stoveChecked && Math.hypot(playerLocalX + 1.4, playerLocalZ + 5.8) < 2) contextualAction = "Periksa Batu Longgar";
      else if (Math.hypot(playerLocalX - 2.0, playerLocalZ + 5.8) < 2) contextualAction = "Periksa Pintu Keluar";
    } else {
      // In Continuous World
      if (Math.hypot(playerWorldX - 20.0, playerWorldZ - (-55.7)) < 2.5) contextualAction = "Masuk Rumah";
      else if (Math.hypot(playerWorldX - (-19.5), playerWorldZ - (-2.0)) < 3.0) contextualAction = "Bincang · Pak Montir";
      else if (Math.hypot(playerWorldX - 21.0, playerWorldZ - 68.0) < 2.8 && !session.workplace.allTasksDone) contextualAction = "Workstation · Coding";
      else if (Math.hypot(playerWorldX + 3.5, playerWorldZ - 176.0) < 2.4) contextualAction = "Bincang · Jeffrey";
      else if (Math.hypot(playerWorldX - 3.5, playerWorldZ - 176.0) < 2.4) contextualAction = "Bincang · Vespera";
      else if (Math.hypot(playerWorldX + 5.0, playerWorldZ - 180.0) < 2.4) contextualAction = "Bincang · Barnaby";
      else if (Math.hypot(playerWorldX, playerWorldZ - 179.0) < 2.4 && !session.kastil.easterEggs.fountain) contextualAction = "Periksa · Air Mancur";
      else if (Math.hypot(playerWorldX + 5.5, playerWorldZ - 183.0) < 2.4 && !session.kastil.easterEggs.hayBales) contextualAction = "Periksa · Jerami";
      else if (Math.hypot(playerWorldX, playerWorldZ - 198.0) < 2.5) contextualAction = "Masuk Great Keep";
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* 3D Canvas Rendering Active Continuous Exploration Scene */}
      {session.currentLocation !== "END_SCREEN" && (
        <GameCanvas
          playerMode={playerMode}
          humanPos={renderedHumanPos}
          humanHeading={session.humanHeading}
          isHumanMoving={isHumanMoving}
          isInsideEscapeRoom={session.kastil.insideEscapeRoom}
          remotePlayers={realtime.remotePlayers}
          vehicleState={vehicleState}
          vehicleStateRef={vehicleStateRef}
          humanPosRef={humanPosRef}
          cameraMode={cameraMode}
          weaponSystemStateRef={weaponSystem.stateRef}
          isAttackingRef={isAttackingRef}
          isChargingRef={isChargingRef}
          activeWeaponId={weaponSystem.stateRef.current.activeWeaponId}
          chargeLevel={weaponSystem.stateRef.current.chargeLevel}
          attackProgress={weaponSystem.stateRef.current.activeAttack?.progress ?? 0}
          isAttacking={isAttackingRef.current}
        >
          {session.currentLocation === "KASTIL" && session.kastil.insideEscapeRoom ? (
            <CastleEscapeRoomScene
              escapeRoomState={session.kastil.escapeRoom}
              playerPos={session.humanPosition}
            />
          ) : (
            <UnifiedWorld
              playerMode={playerMode}
              humanPos={renderedHumanPos}
              humanHeading={session.humanHeading}
              vehicleState={vehicleState}
              vehicleStateRef={vehicleStateRef}
              dayNumber={session.dayNumber}
              rumahState={session.rumah}
              workplaceState={session.workplace}
              kastilState={session.kastil}
              isEvening={session.phase === "EVENING_ROUTINE"}
              isAttacking={isAttackingRef.current}
              activeWeaponId={weaponSystem.stateRef.current.activeWeaponId}
              weaponStateRef={weaponSystem.stateRef}
            />
          )}
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
        />
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

      {/* Location 1 Overlay: Rumah Routine Checklist (shown when in morning/evening at home) */}
      {session.currentLocation === "RUMAH" && (
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
  );
}
