export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ambulances: {
        Row: {
          id: string;
          name: string;
          plate_number: string;
          base_price_per_km: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plate_number: string;
          base_price_per_km: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plate_number?: string;
          base_price_per_km?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ambulance_settings: {
        Row: {
          id: string;
          hospital_lat: number;
          hospital_lng: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hospital_lat: number;
          hospital_lng: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hospital_lat?: number;
          hospital_lng?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      ambulance_transactions: {
        Row: {
          id: string;
          ambulance_id: string;
          destination_lat: number;
          destination_lng: number;
          distance_km: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          ambulance_id: string;
          destination_lat: number;
          destination_lng: number;
          distance_km: number;
          total_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          ambulance_id?: string;
          destination_lat?: number;
          destination_lng?: number;
          distance_km?: number;
          total_cost?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ambulance_transactions_ambulance_id_fkey";
            columns: ["ambulance_id"];
            isOneToOne: false;
            referencedRelation: "ambulances";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
