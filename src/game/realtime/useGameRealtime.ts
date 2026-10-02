"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { VehicleState } from "../vehicle/vehicleTypes";
import { RealtimeChannel } from "@supabase/supabase-js";

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
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Use sessionStorage so multiple tabs in the same browser have unique driver IDs
  const playerIdRef = useRef<string>("local_player");
  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("quatro_tab_driver_id");
      if (!id) {
        id = `driver_${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem("quatro_tab_driver_id", id);
      }
      playerIdRef.current = id;
    }
  }, []);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const vehicleStateRef = useRef<VehicleState>(vehicleState);
  vehicleStateRef.current = vehicleState;

  // Initialize and subscribe to Supabase Realtime Channel
  useEffect(() => {
    if (!isEnabled) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setConnectionStatus("OFFLINE");
      return;
    }

    setConnectionStatus("CONNECTING");

    const channel = supabase.channel("room:quatro-world", {
      config: {
        broadcast: { self: false },
        presence: { key: playerIdRef.current },
      },
    });

    channelRef.current = channel;

    // 1. Listen for position broadcasts from other cars
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

    // 2. Presence tracking (detect other players joining and leaving)
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const keys = Object.keys(state);
      setOnlineCount(Math.max(1, keys.length));
    });

    channel.on("presence", { event: "join" }, () => {
      const state = channel.presenceState();
      setOnlineCount(Math.max(1, Object.keys(state).length));
    });

    channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
      const state = channel.presenceState();
      setOnlineCount(Math.max(1, Object.keys(state).length));

      // Remove leaving players immediately
      if (Array.isArray(leftPresences)) {
        setRemotePlayers((prev) => {
          const next = new Map(prev);
          for (const lp of leftPresences) {
            const id = (lp as { id?: string })?.id;
            if (id) next.delete(id);
          }
          return next;
        });
      }
    });

    // 3. Subscribe to the channel and register presence
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setConnectionStatus("CONNECTED");
        channel.track({
          id: playerIdRef.current,
          name: playerName,
          onlineAt: Date.now(),
        });
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setConnectionStatus("OFFLINE");
      }
    });

    // Prune stale players after 6 seconds of silence
    const pruneTimer = setInterval(() => {
      const now = Date.now();
      setRemotePlayers((prev) => {
        let changed = false;
        const next = new Map(prev);
        for (const [id, player] of next.entries()) {
          if (now - player.lastUpdated > 6000) {
            next.delete(id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 3000);

    return () => {
      clearInterval(pruneTimer);
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [isEnabled, playerName]);

  // 10Hz Broadcast Loop
  const broadcastMovement = useCallback(() => {
    const channel = channelRef.current;
    if (!channel || connectionStatus !== "CONNECTED") return;

    const currentVehicle = vehicleStateRef.current;
    channel.send({
      type: "broadcast",
      event: "player_move",
      payload: {
        id: playerIdRef.current,
        name: playerName,
        position: currentVehicle.position,
        heading: currentVehicle.heading,
        speed: currentVehicle.speed,
        scaleMode: currentVehicle.scaleMode,
        scaleFactor: currentVehicle.scaleFactor,
        status: currentVehicle.scaleMode === "POCKET" ? "POCKET_CAR" : "DRIVING",
      },
    });
  }, [connectionStatus, playerName]);

  useEffect(() => {
    if (!isEnabled || connectionStatus !== "CONNECTED") return;

    const interval = setInterval(() => {
      broadcastMovement();
    }, 90); // ~11 times per second

    return () => clearInterval(interval);
  }, [isEnabled, connectionStatus, broadcastMovement]);

  return {
    remotePlayers: Array.from(remotePlayers.values()),
    connectionStatus,
    onlineCount,
    playerId: playerIdRef.current,
  };
}
