export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      checkpoints: {
        Row: {
          chapter: number;
          checkpoint_key: string;
          created_at: string;
          id: string;
          location: string;
          pos_x: number;
          pos_y: number;
          pos_z: number;
          user_id: string;
        };
        Insert: {
          chapter: number;
          checkpoint_key: string;
          created_at?: string;
          id?: string;
          location: string;
          pos_x?: number;
          pos_y?: number;
          pos_z?: number;
          user_id: string;
        };
        Update: {
          chapter?: number;
          checkpoint_key?: string;
          created_at?: string;
          id?: string;
          location?: string;
          pos_x?: number;
          pos_y?: number;
          pos_z?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checkpoints_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      player_progress: {
        Row: {
          castle_gate_open: boolean;
          created_at: string;
          current_chapter: number;
          current_day: number;
          current_location: string;
          guardian_spoken: boolean;
          id: string;
          pocket_unlocked: boolean;
          progress_version: number;
          puzzle_solved: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          castle_gate_open?: boolean;
          created_at?: string;
          current_chapter?: number;
          current_day?: number;
          current_location?: string;
          guardian_spoken?: boolean;
          id?: string;
          pocket_unlocked?: boolean;
          progress_version?: number;
          puzzle_solved?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          castle_gate_open?: boolean;
          created_at?: string;
          current_chapter?: number;
          current_day?: number;
          current_location?: string;
          guardian_spoken?: boolean;
          id?: string;
          pocket_unlocked?: boolean;
          progress_version?: number;
          puzzle_solved?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      player_vehicles: {
        Row: {
          condition: number;
          created_at: string;
          id: string;
          is_active: boolean;
          updated_at: string;
          user_id: string;
          vehicle_id: string;
        };
        Insert: {
          condition?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          updated_at?: string;
          user_id: string;
          vehicle_id: string;
        };
        Update: {
          condition?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          updated_at?: string;
          user_id?: string;
          vehicle_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_vehicles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_vehicles_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      puzzle_progress: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          puzzle_key: string;
          status: Database["public"]["Enums"]["puzzle_status"];
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          puzzle_key: string;
          status?: Database["public"]["Enums"]["puzzle_status"];
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          puzzle_key?: string;
          status?: Database["public"]["Enums"]["puzzle_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "puzzle_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      story_progress: {
        Row: {
          flag_key: string;
          flag_value: boolean;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          flag_key: string;
          flag_value?: boolean;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          flag_key?: string;
          flag_value?: boolean;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "story_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicles: {
        Row: {
          base_stats: Json;
          created_at: string;
          description: string;
          id: string;
          name: string;
          unlock_requirement: string;
        };
        Insert: {
          base_stats?: Json;
          created_at?: string;
          description: string;
          id: string;
          name: string;
          unlock_requirement?: string;
        };
        Update: {
          base_stats?: Json;
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          unlock_requirement?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      puzzle_status: "locked" | "available" | "completed";
      vehicle_scale_mode: "BIG" | "POCKET";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
