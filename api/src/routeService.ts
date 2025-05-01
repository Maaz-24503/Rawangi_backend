import supabase from "./supabaseClient.js";
import { Request, Response } from "express";
import { Vertex, Edge } from "./database.js";

class RouteService {
  async findNearestNode(lat: number, lon: number): Promise<Vertex> {
    const { data, error } = await supabase.rpc("find_nearest_vertex", {
      target_lat: lat,
      target_lon: lon,
    });

    if (error) {
      console.error("Error calling find_nearest_vertex RPC:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No nearest vertex found");
    }

    return data[0] as Vertex;
  }

  async findNearestNodeHandler(req: Request, res: Response): Promise<Response> {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Invalid lat/lon" });
    }

    try {
      const node = await this.findNearestNode(lat, lon);
      return res.json(node);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Updated findShortestPathHandler to use the pruned graph
  async findShortestPathHandlerWithPruning(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    const startId: number = parseInt(req.query.start as string);
    const endId: number = parseInt(req.query.end as string);

    if (isNaN(startId) || isNaN(endId)) {
      res.status(400).json({ error: "Invalid start/end node IDs" });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("shortest_path", {
        start_vertex_id: startId,
        end_vertex_id: endId,
      });
      if (error) {
        return res.status(400).json(error);
      } else {
        return res.status(200).json(data);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteBusRoute(req: Request, res: Response): Promise<Response> {
    const routeId = parseInt(req.query.routeId as string, 10);
    try {
      const { data, error } = await supabase.rpc("delete_bus_route", {
        _route_id: routeId,
      });

      if (error) {
        console.error("Delete error:", error);
        return res.status(400).json({ error });
      }

      return res.status(200).json({ message: "Route deleted", data });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async insertBusRoute(req: Request, res: Response): Promise<Response> {
    const { vertices, weights, geometry, description } = req.body as {
      vertices: Vertex[];
      weights: number[];
      geometry: string[]; // Must be array of WKT strings for n - 1 segments
      description: string; // Optional description for the bus route
    };

    try {
      const { data, error } = await supabase.rpc(
        "insert_bus_route_with_edges",
        {
          _vertices: vertices.map((v) => v.id),
          _weights: weights,
          _geometries: geometry, // array of WKT strings
          _description: description || "Not Defined",
        }
      );

      if (error) {
        console.error("Insert error:", error);
        return res.status(400).json({ error });
      }

      return res.status(200).json({ message: "Edges inserted", data });
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllBusRoutes(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabase.rpc("get_all_bus_routes");

      if (error) {
        console.error("RPC error:", error);
        return res.status(400).json({ error });
      }

      return res.status(200).json({ routes: data });
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new RouteService();
