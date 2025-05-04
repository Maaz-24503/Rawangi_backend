import supabase from "./supabaseClient.js";

class RouteService {
  async findNearestNode(lat, lon) {
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

    return data[0];
  }

  async findNearestNodeHandler(req, res) {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

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
  async findShortestPathHandlerWithPruning(req, res) {
    const startId = parseInt(req.query.start);
    const endId = parseInt(req.query.end);

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

  async deleteBusRoute(req, res) {
    const routeId = parseInt(req.query.routeId, 10);
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

  async insertBusRoute(req, res) {
    console.log('req', req.body);
    const { vertices, weights, geometry, description } = req.body;

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

  async getAllBusRoutes(req, res) {
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