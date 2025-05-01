import supabase from "./supabaseClient.js";
import { Request, Response } from "express";
import { Vertex, Edge } from "./database.js";

class RouteService {
  private async getAllVertices(): Promise<Vertex[]> {
    const { data, error } = await supabase.from("vertices").select("*");

    if (error) {
      console.error("Error fetching vertices:", error);
      throw error;
    }

    return data as Vertex[];
  }

  private async getAllEdges(): Promise<Edge[]> {
    const { data, error } = await supabase.from("edges").select("*");

    if (error) {
      console.error("Error fetching edges:", error);
      throw error;
    }

    return data as Edge[];
  }

  private manhattanDistance(a: Vertex, b: Vertex): number {
    return (
      Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude)
    );
  }

  private buildAdjacencyList(
    vertices: Vertex[],
    edges: Edge[]
  ): Map<number, { node: Vertex; weight: number }[]> {
    const vertexMap = new Map(vertices.map((v) => [v.id, v]));
    const adjList = new Map<number, { node: Vertex; weight: number }[]>();

    for (const vertex of vertices) {
      adjList.set(vertex.id, []);
    }

    for (const edge of edges) {
      const sourceNode = vertexMap.get(edge.source);
      const targetNode = vertexMap.get(edge.target);
      if (sourceNode && targetNode) {
        adjList
          .get(edge.source)
          ?.push({ node: targetNode, weight: edge.weight });
      }
    }

    return adjList;
  }

  async findNearestNode(lat: number, lon: number): Promise<Vertex> {
    const data = await this.getAllVertices();

    if (!data || data.length === 0) {
      throw new Error("No vertices found in database");
    }

    let nearest = data[0];
    let minDiff =
      Math.abs(lat - nearest.latitude) + Math.abs(lon - nearest.longitude);

    for (let i = 1; i < data.length; i++) {
      const diff =
        Math.abs(lat - data[i].latitude) + Math.abs(lon - data[i].longitude);
      if (diff < minDiff) {
        nearest = data[i];
        minDiff = diff;
      }
    }

    return nearest;
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

  private findShortestPath(
    start: Vertex,
    end: Vertex,
    adjList: Map<number, { node: Vertex; weight: number }[]>
  ): Vertex[] {
    const openSet = new Set<number>([start.id]);
    const cameFrom = new Map<number, number>();
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();

    gScore.set(start.id, 0);
    fScore.set(start.id, this.manhattanDistance(start, end));

    while (openSet.size > 0) {
      let currentId = [...openSet].reduce((a, b) =>
        (fScore.get(a) ?? Infinity) < (fScore.get(b) ?? Infinity) ? a : b
      );

      if (currentId === end.id) {
        const path: Vertex[] = [];
        let currId: number | undefined = currentId;
        while (currId !== undefined) {
          const currNode = [...adjList.keys()].find((id) => id === currId);
          if (currNode !== undefined)
            path.unshift(adjList.get(currNode)![0].node);
          currId = cameFrom.get(currId);
        }
        path.unshift(start);
        return path;
      }

      openSet.delete(currentId);

      for (const neighbor of adjList.get(currentId) ?? []) {
        const tentativeG =
          (gScore.get(currentId) ?? Infinity) + neighbor.weight;

        if (tentativeG < (gScore.get(neighbor.node.id) ?? Infinity)) {
          cameFrom.set(neighbor.node.id, currentId);
          gScore.set(neighbor.node.id, tentativeG);
          fScore.set(
            neighbor.node.id,
            tentativeG + this.manhattanDistance(neighbor.node, end)
          );
          openSet.add(neighbor.node.id);
        }
      }
    }

    return [];
  }

  async findShortestPathHandler(req: Request, res: Response): Promise<void> {
    const startId: number = parseInt(req.query.start as string);
    const endId: number = parseInt(req.query.end as string);
  
    if (isNaN(startId) || isNaN(endId)) {
      res.status(400).json({ error: "Invalid start/end node IDs" });
      return;
    }
  
    try {
      const vertices: Vertex[] = await this.getAllVertices();
      const startNode: Vertex | undefined = vertices.find((v: Vertex) => v.id === startId);
      const endNode: Vertex | undefined = vertices.find((v: Vertex) => v.id === endId);
  
      if (!startNode || !endNode) {
        res.status(404).json({ error: "Start or end node not found" });
        return;
      }
  
      const edges: Edge[] = await this.getAllEdges();
      const adjList: Map<number, { node: Vertex; weight: number }[]> =
        this.buildAdjacencyList(vertices, edges);
  
      const path: Vertex[] = this.findShortestPath(startNode, endNode, adjList);
      res.json(path);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new RouteService();
