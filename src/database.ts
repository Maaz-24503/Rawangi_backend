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
      routing_vertices: {
        Row: {
          id: number;
          latitude: number;
          longitude: number;
          geom: unknown; // GEOMETRY(Point, 4326) - typically stored as unknown or string
        };
        Insert: {
          id: number;
          latitude: number;
          longitude: number;
          geom: unknown; // adjust if you're serializing geometry
        };
        Update: {
          latitude?: number;
          longitude?: number;
          geom?: unknown;
        };
      };
      routing_edges: {
        Row: {
          id: number;
          source: number;
          target: number;
          cost: number;
          reverse_cost: number;
          geom: unknown; // GEOMETRY(LineString, 4326)
        };
        Insert: {
          source: number;
          target: number;
          cost: number;
          reverse_cost: number;
          geom: unknown;
        };
        Update: {
          source?: number;
          target?: number;
          cost?: number;
          reverse_cost?: number;
          geom?: unknown;
        };
      };
    };
  };
}

export type Vertex = Database['public']['Tables']['routing_vertices']['Row'];
export type Edge = Database['public']['Tables']['routing_edges']['Row'];