"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
import { EndScreenOverlay } from "@/components/ui/EndScreenOverlay";
import { PauseOverlay } from "@/components/ui/PauseOverlay";

import {
  createInitialSessionState,
  advanceDay,
  GameSessionState,
  LocationType,
} from "@/game/core/gameStore";
import { soundManager } from "@/game/audio/SoundManager";

export default function ProjectQuatroApp() {
  const [session, setSession] = useState<GameSessionState>(createInitialSessionState);
  const [isHumanMoving, setIsHumanMoving] = useState(false);

  // Modals state
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isVoidCutsceneOpen, setIsVoidCutsceneOpen] = useState(false);
  const [activeNpcId, setActiveNpcId] = useState<"jeffrey" | "vespera" | "barnaby" | null>(null);
  const [easterEggAlert, setEasterEggAlert] = useState<string | null>(null);
  const [escapeInspectTarget, setEscapeInspectTarget] = useState<
    "CABINET" | "STOVE" | "SECRET_WALL" | "EXIT_DOOR" | null
  >(null);

  // Keyboard input state
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
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

  // Keyboard listeners for WASD / Arrows / E / Space / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        soundManager.playClick();
        if (isWorkModalOpen) setIsWorkModalOpen(false);
        else if (isVoidCutsceneOpen) setIsVoidCutsceneOpen(false);
        else if (activeNpcId) setActiveNpcId(null);
        else if (easterEggAlert) setEasterEggAlert(null);
        else if (escapeInspectTarget) setEscapeInspectTarget(null);
        else setSession((prev) => ({ ...prev, isPaused: !prev.isPaused }));
        return;
      }

      if (
        session.isPaused ||
        isWorkModalOpen ||
        isVoidCutsceneOpen ||
        activeNpcId ||
        escapeInspectTarget ||
        session.currentLocation === "END_SCREEN"
      ) {
        return;
      }

      // Interaction trigger with [E] or [Space]
      if (e.code === "KeyE" || e.code === "Space") {
        handleContextInteraction();
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  });

  // Main 60FPS Movement and Proximity loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const isWalkable =
        session.currentLocation === "RUMAH" ||
        session.currentLocation === "TEMPAT_KERJA" ||
        session.currentLocation === "BENGKEL" ||
        session.currentLocation === "KASTIL";

      if (
        isWalkable &&
        !session.isPaused &&
        !isWorkModalOpen &&
        !isVoidCutsceneOpen &&
        !activeNpcId &&
        !escapeInspectTarget
      ) {
        let moveX = 0;
        let moveZ = 0;

        if (inputRef.current.forward) moveZ -= 1;
        if (inputRef.current.backward) moveZ += 1;
        if (inputRef.current.left) moveX -= 1;
        if (inputRef.current.right) moveX += 1;

        const isMoving = moveX !== 0 || moveZ !== 0;
        setIsHumanMoving(isMoving);

        if (isMoving) {
          const moveLen = Math.hypot(moveX, moveZ);
          const normX = moveX / moveLen;
          const normZ = moveZ / moveLen;

          const walkSpeed = 4.2;
          let nextX = session.humanPosition[0] + normX * walkSpeed * dt;
          let nextZ = session.humanPosition[2] + normZ * walkSpeed * dt;
          const nextHeading = Math.atan2(normX, normZ);

          // Boundaries per room
          if (session.currentLocation === "RUMAH") {
            nextX = Math.max(-3.8, Math.min(3.8, nextX));
            nextZ = Math.max(-3.8, Math.min(4.1, nextZ));

            // Auto wake-up if moving away from bed
            if (!session.rumah.wokenUp && Math.hypot(nextX - (-2.4), nextZ - (-3.2)) > 1.2) {
              setSession((prev) => ({
                ...prev,
                rumah: { ...prev.rumah, wokenUp: true },
                activePrompt: "Sudah bangun! Pergi ke kompor di dapur kecil untuk memasak.",
              }));
            }
          } else if (session.currentLocation === "TEMPAT_KERJA") {
            nextX = Math.max(-6.2, Math.min(6.2, nextX));
            nextZ = Math.max(-6.2, Math.min(6.5, nextZ));

            // Check if walking into Day 3 Semicolon portal at exit door
            if (
              session.dayNumber === 3 &&
              session.workplace.allTasksDone &&
              Math.hypot(nextX - 0, nextZ - 5.8) < 1.4
            ) {
              soundManager.playPortalWhoosh();
              setSession((prev) => ({
                ...prev,
                currentLocation: "DIMENSI_LAIN",
                dimensiLain: { ...prev.dimensiLain, cutsceneCompleted: false },
              }));
              setIsVoidCutsceneOpen(true);
              return;
            }
          } else if (session.currentLocation === "BENGKEL") {
            nextX = Math.max(-5.2, Math.min(5.2, nextX));
            nextZ = Math.max(-5.2, Math.min(5.2, nextZ));
          } else if (session.currentLocation === "KASTIL") {
            if (session.kastil.insideEscapeRoom) {
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
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    session.currentLocation,
    session.humanPosition,
    session.isPaused,
    session.dayNumber,
    session.workplace.allTasksDone,
    session.kastil.insideEscapeRoom,
    session.rumah.wokenUp,
    isWorkModalOpen,
    isVoidCutsceneOpen,
    activeNpcId,
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
      if (distToBed < 2.0 && !session.rumah.wokenUp) {
        soundManager.playClick();
        setSession((prev) => ({
          ...prev,
          rumah: { ...prev.rumah, wokenUp: true },
          activePrompt: "Sudah bangun! Pergi ke kompor di dapur kecil untuk memasak.",
        }));
        return;
      }

      // Cook at stove
      if (distToStove < 1.8 && session.rumah.wokenUp && !session.rumah.hasCooked) {
        soundManager.playCook();
        setSession((prev) => ({
          ...prev,
          rumah: { ...prev.rumah, hasCooked: true },
          activePrompt: "Sarapan telah matang! Nikmati makananmu di meja makan.",
        }));
        return;
      }

      // Eat at dining table
      if (distToTable < 1.8) {
        if (session.phase === "COMMUTE_HOME" || session.workDone) {
          // Evening dinner
          soundManager.playEat();
          setSession((prev) => ({
            ...prev,
            rumah: {
              ...prev.rumah,
              hasEatenEvening: true,
              canSleepEvening: prev.rumah.hasShoweredEvening,
            },
            activePrompt: prev.rumah.hasShoweredEvening
              ? "Kenyang! Pergi ke kamar tidur untuk tidur dan lanjut hari."
              : "Makan malam selesai. Jangan lupa mandi sebelum tidur.",
          }));
          return;
        } else if (session.rumah.hasCooked && !session.rumah.hasEaten) {
          // Morning breakfast
          soundManager.playEat();
          setSession((prev) => ({
            ...prev,
            rumah: { ...prev.rumah, hasEaten: true },
            activePrompt: "Sarapan selesai! Pergi ke kamar mandi untuk mandi.",
          }));
          return;
        }
      }

      // Shower in bathroom
      if (distToShower < 2.0) {
        if (session.phase === "COMMUTE_HOME" || session.workDone) {
          // Evening shower
          soundManager.playWater();
          setSession((prev) => ({
            ...prev,
            rumah: {
              ...prev.rumah,
              hasShoweredEvening: true,
              canSleepEvening: prev.rumah.hasEatenEvening,
            },
            activePrompt: prev.rumah.hasEatenEvening
              ? "Badan segar! Pergi ke tempat tidur untuk tidur dan lanjut hari."
              : "Sudah mandi! Jangan lupa makan malam di ruang makan.",
          }));
          return;
        } else if (session.rumah.hasEaten && !session.rumah.hasShowered) {
          // Morning shower
          soundManager.playWater();
          setSession((prev) => ({
            ...prev,
            rumah: { ...prev.rumah, hasShowered: true, canExitHouse: true },
            activePrompt: "Badan segar! Pintu depan sekarang terbuka. Siap berangkat ke mobil!",
          }));
          return;
        }
      }

      // Front Door Exit to Jalan
      if (distToDoor < 1.8 && session.rumah.canExitHouse) {
        soundManager.playDoorOpen();
        setSession((prev) => ({
          ...prev,
          currentLocation: "JALAN",
          activePrompt: "Sedang berkendara di jalan. Pilih tujuanmu pada sistem navigasi dashboard.",
        }));
        return;
      }

      // Evening sleep in bed
      if (distToBed < 2.0 && (session.phase === "COMMUTE_HOME" || session.workDone)) {
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
        if (session.dayNumber === 3) {
          // Enter Portal
          soundManager.playPortalWhoosh();
          setSession((prev) => ({
            ...prev,
            currentLocation: "DIMENSI_LAIN",
          }));
          setIsVoidCutsceneOpen(true);
        } else {
          // Return to Jalan (Evening Commute Home)
          soundManager.playDoorOpen();
          setSession((prev) => ({
            ...prev,
            currentLocation: "JALAN",
            phase: "COMMUTE_HOME",
            workDone: true,
            activePrompt: "Pekerjaan selesai. Menyetir di jalan sore hari menuju rumah.",
          }));
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
        alert("Pak Montir: 'Halo bung! Mobil Quatro-mu sudah ku-tune up dan dicuci bersih. Mesinnya bergemuruh mantap! Selamat melaju kembali!'");
        return;
      }

      if (distToExit < 2.0) {
        soundManager.playDoorOpen();
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
        if (distToStove < 2.0) {
          soundManager.playClick();
          setEscapeInspectTarget("STOVE");
          return;
        }
        if (distToSecretWall < 2.0) {
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

  // Destination Selection Handler from Jalan & Dimensi Lain
  const handleSelectDestination = (dest: "RUMAH" | "TEMPAT_KERJA" | "BENGKEL" | "KASTIL") => {
    soundManager.playDoorOpen();
    if (dest === "RUMAH") {
      setSession((prev) => ({
        ...prev,
        currentLocation: "RUMAH",
        humanPosition: [0, 0, 3.4],
        activePrompt:
          prev.workDone || prev.phase === "COMMUTE_HOME"
            ? "Kembali ke rumah! Mandi dan santap makan malam sebelum tidur."
            : "Di rumah. Selesaikan rutinitas harian.",
      }));
    } else if (dest === "TEMPAT_KERJA") {
      setSession((prev) => ({
        ...prev,
        currentLocation: "TEMPAT_KERJA",
        humanPosition: [0, 0, 5.5],
        activePrompt: "Tiba di kantor. Berjalan ke meja PC [E] untuk mengerjakan task coding.",
      }));
    } else if (dest === "BENGKEL") {
      setSession((prev) => ({
        ...prev,
        currentLocation: "BENGKEL",
        humanPosition: [0, 0, 4.0],
        activePrompt: "Tiba di bengkel mobil. Bincang dengan Pak Montir [E] atau servis mobil.",
      }));
    } else if (dest === "KASTIL") {
      setSession((prev) => ({
        ...prev,
        currentLocation: "KASTIL",
        humanPosition: [0, 0, 8.0],
        kastil: { ...prev.kastil, insideEscapeRoom: false },
        activePrompt: "Tiba di pelataran Kastil Kuno! Jelajahi halaman kastil atau dekati gerbang aula besar.",
      }));
    }
  };

  // Complete Workplace PC Tasks
  const handleCompleteOfficeWork = () => {
    setIsWorkModalOpen(false);
    setSession((prev) => ({
      ...prev,
      workDone: true,
      workplace: {
        ...prev.workplace,
        allTasksDone: true,
        codeTyped: true,
        bugsCaught: 5,
        repoPushed: true,
      },
      activePrompt:
        prev.dayNumber === 3
          ? "✦ PERINGATAN: Portal Semicolon telah terbuka di pintu keluar kantor! Langkahkan kaki ke dalam portal."
          : "Semua tugas di PC selesai! Keluar melalui pintu kantor untuk pulang ke rumah.",
    }));
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
    setSession((prev) => ({
      ...prev,
      currentLocation: "END_SCREEN",
    }));
  };

  // Play Again Restart
  const handlePlayAgain = () => {
    setSession(createInitialSessionState());
  };

  // Calculate nearby action prompt for Home
  let nearbyHomeAction: "WAKE" | "COOK" | "EAT" | "SHOWER" | "SLEEP" | "EXIT" | null = null;
  if (session.currentLocation === "RUMAH") {
    const [hx, , hz] = session.humanPosition;
    const isEvening = session.workDone || session.phase === "COMMUTE_HOME";
    if (Math.hypot(hx - (-2.4), hz - (-3.2)) < 2.0) {
      if (isEvening && session.rumah.canSleepEvening) nearbyHomeAction = "SLEEP";
      else if (!session.rumah.wokenUp) nearbyHomeAction = "WAKE";
    } else if (Math.hypot(hx - (-3.8), hz - 1.0) < 1.8 && session.rumah.wokenUp && !session.rumah.hasCooked) {
      nearbyHomeAction = "COOK";
    } else if (Math.hypot(hx - 0.8, hz - 1.6) < 1.8) {
      if (isEvening && !session.rumah.hasEatenEvening) nearbyHomeAction = "EAT";
      else if (session.rumah.hasCooked && !session.rumah.hasEaten) nearbyHomeAction = "EAT";
    } else if (Math.hypot(hx - 3.4, hz - (-3.4)) < 2.0) {
      if (isEvening && !session.rumah.hasShoweredEvening) nearbyHomeAction = "SHOWER";
      else if (session.rumah.hasEaten && !session.rumah.hasShowered) nearbyHomeAction = "SHOWER";
    } else if (Math.hypot(hx - 0, hz - 4.0) < 1.8 && session.rumah.canExitHouse) {
      nearbyHomeAction = "EXIT";
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* 3D Canvas Rendering Active Scene */}
      {session.currentLocation !== "END_SCREEN" && (
        <GameCanvas
          location={session.currentLocation}
          humanPos={session.humanPosition}
          humanHeading={session.humanHeading}
          isHumanMoving={isHumanMoving}
          isInsideEscapeRoom={session.kastil.insideEscapeRoom}
        >
          {/* Location 1: RUMAH */}
          {session.currentLocation === "RUMAH" && (
            <HouseInterior
              rumahState={session.rumah}
              dayNumber={session.dayNumber}
              playerPos={session.humanPosition}
            />
          )}

          {/* Location 2: JALAN */}
          {session.currentLocation === "JALAN" && (
            <HighwayDriveScene isVoidHighway={false} />
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
            <HighwayDriveScene isVoidHighway={true} />
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
      {session.activePrompt && session.currentLocation !== "END_SCREEN" && (
        <div className="fixed top-4 right-4 z-40 max-w-md pointer-events-auto">
          <div className="bg-quatro-navy/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-quatro-amber/40 shadow-xl flex items-center space-x-2.5 text-xs text-quatro-cream font-mono">
            <span className="text-quatro-amber text-base animate-pulse">✦</span>
            <span className="leading-snug">{session.activePrompt}</span>
          </div>
        </div>
      )}

      {/* Location 1 Overlay: Rumah Routine Checklist */}
      {session.currentLocation === "RUMAH" && (
        <HomeRoutineOverlay
          dayNumber={session.dayNumber}
          rumahState={session.rumah}
          isEvening={session.workDone || session.phase === "COMMUTE_HOME"}
          onAction={(act) => handleContextInteraction()}
          nearbyAction={nearbyHomeAction}
        />
      )}

      {/* Location 2 & 4 Overlay: Road Navigation Modal */}
      {(session.currentLocation === "JALAN" || session.currentLocation === "DIMENSI_LAIN") && (
        <RoadNavigationModal
          isVoidHighway={session.currentLocation === "DIMENSI_LAIN"}
          onSelectDestination={handleSelectDestination}
        />
      )}

      {/* Location 3 Modal: Workplace PC Workstation Minigames */}
      <OfficeWorkstationModal
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

      {/* Location 6 Overlay: End Screen */}
      {session.currentLocation === "END_SCREEN" && (
        <EndScreenOverlay
          stats={{
            daysCompleted: session.stats.daysCompleted,
            bugsCaught: session.workplace.bugsCaught,
            easterEggsFound: session.stats.easterEggsFound,
          }}
          onPlayAgain={handlePlayAgain}
        />
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
