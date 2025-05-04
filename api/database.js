/**
 * Database types for Supabase client
 */

// Export Vertex and Edge types for use in other files
export const Vertex = {};
export const Edge = {};

// The Database type definition has been converted to a JavaScript comment
// since JavaScript doesn't have static types

/**
 * Database structure:
 * 
 * public: {
 *   Tables: {
 *     routing_vertices: {
 *       Row: {
 *         id: number,
 *         latitude: number,
 *         longitude: number,
 *         geom: unknown, // GEOMETRY(Point, 4326)
 *       }
 *     },
 *     routing_edges: {
 *       Row: {
 *         id: number,
 *         source: number,
 *         target: number,
 *         cost: number,
 *         reverse_cost: number,
 *         geom: unknown, // GEOMETRY(LineString, 4326)
 *       }
 *     }
 *   }
 * }
 */