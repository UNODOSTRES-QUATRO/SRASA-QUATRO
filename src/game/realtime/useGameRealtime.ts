"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { VehicleState } from "../vehicle/vehicleTypes";

export interface RemotePlayer {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  heading: number;
  speed: number;
  scaleMode: "BIG" | "POCKET";
  scaleFactor: number;
  status: string;
  lastUpdated: number;
}

interface UseGameRealtimeProps {
  vehicleState: VehicleState;
  playerName?: string;
  isEnabled?: boolean;
}

export function useGameRealtime({
  vehicleState,
  playerName = "Driver ;",
  isEnabled = true,
}: UseGameRealtimeProps) {
  const [remotePlayers, setRemotePlayers] = useState<Map<string, RemotePlayer>>(
    new Map()
  );
  const [connectionStatus, setConnectionStatus] = useState<
    "OFFLINE" | "CONNECTING" | "CONNECTED"
  >("OFFLINE");

  const playerIdRef = useRef<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("quatro_player_id") ||
        `player_${Math.random().toString(36).substring(2, 9)}`
      : "local_player"
  );

  const lastBroadcastRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quatro_player_id", playerIdRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setConnectionStatus("OFFLINE");
      return;
    }

    setConnectionStatus("CONNECTING");

    // Realtime broadcast & presence channel for Project Quatro world
    const channel = supabase.channel("room:quatro-world", {
      config: {
        broadcast: { self: false },
        presence: { key: playerIdRef.current },
      },
    });

    // Listen for broadcast movement packets from other drivers
    channel.on("broadcast", { event: "player_move" }, ({ payload }) => {
      const data = payload as RemotePlayer;
      if (!data || data.id === playerIdRef.current) return;

      setRemotePlayers((prev) => {
        const next = new Map(prev);
        next.set(data.id, {
          ...data,
          lastUpdated: Date.now(),
        });
        return next;
      });
    });

    // Clean up stale players (inactive > 8 seconds)
    const pruneInterval = setInterval(() => {
      const now = Date.now();
      setRemotePlayers((prev) => {
        let changed = false;
        const next = new Map(prev);
        for (const [id, player] of next.entries()) {
          if (now - player.lastUpdated > 8000) {
            next.delete(id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 4000);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setConnectionStatus("CONNECTED");
      }
    });

    return () => {
      clearInterval(pruneInterval);
      supabase.removeChannel(channel);
    };
  }, [isEnabled]);

  // Throttled broadcast (10Hz = 100ms) for efficient networking
  useEffect(() => {
    if (!isEnabled) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase || connectionStatus !== "CONNECTED") return;

    const now = performance.now();
    if (now - lastBroadcastRef.current < 100) return;
    lastBroadcastRef.current = now;

    const channel = supabase.channel("room:quatro-world");
    channel.send({
      type: "broadcast",
      event: "player_move",
      payload: {
        id: playerIdRef.current,
        name: playerName,
        position: vehicleState.position,
        heading: vehicleState.heading,
        speed: vehicleState.speed,
        scaleMode: vehicleState.scaleMode,
        scaleFactor: vehicleState.scaleFactor,
        status: vehicleState.scaleMode === "POCKET" ? "POCKET_CAR" : "DRIVING",
      },
    });
  }, [vehicleState, playerName, isEnabled, connectionStatus]);

  return {
    remotePlayers: Array.from(remotePlayers.values()),
    connectionStatus,
    playerId: playerIdRef.current,
  };
}
