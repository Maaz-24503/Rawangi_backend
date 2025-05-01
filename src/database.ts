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
      vertices: {
        Row: {
          id: number;
          latitude: number;
          longitude: number;
          data: Json | null;
        };
        Insert: {
          id: number;
          latitude: number;
          longitude: number;
          data?: Json | null;
        };
      };
      edges: {
        Row: {
          id: number;
          source: number;
          target: number;
          weight: number;
          isPedestrian: boolean;
          data: Json | null;
        };
        Insert: {
          source: number;
          target: number;
          weight: number;
          isPedestrian: boolean;
          data?: Json | null;
        };
        Update: {
          source?: number;
          target?: number;
          weight?: number;
          isPedestrian?: boolean;
          data?: Json | null;
        };
      };
    };
  };
}
export type Vertex = Database['public']['Tables']['vertices']['Row'];
export type Edge = Database['public']['Tables']['edges']['Row'];
