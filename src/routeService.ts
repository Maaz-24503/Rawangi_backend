import supabase from "./supabaseClient.js";
import { Request, Response } from "express";
import { Vertex, Edge } from "./database.js";

class RouteService {

  async findNearestNode(lat: number, lon: number): Promise<Vertex> {
    const { data, error } = await supabase.rpc("find_nearest_vertex", {
      target_lat: lat,
      target_lon: lon
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
  async findShortestPathHandlerWithPruning(req: Request, res: Response): Promise<Response | void> {
    const startId: number = parseInt(req.query.start as string);
    const endId: number = parseInt(req.query.end as string);

    if (isNaN(startId) || isNaN(endId)) {
      res.status(400).json({ error: "Invalid start/end node IDs" });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('shortest_path', {
        start_vertex_id: startId,
        end_vertex_id: endId
      });
      if (error) {
        return res.status(400).json(error)
      }
      else {
        return res.status(200).json(data)
      }


    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }



}

export default new RouteService();
