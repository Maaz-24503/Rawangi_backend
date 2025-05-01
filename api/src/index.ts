import express, { Request, Response } from "express";
import dotenv from "dotenv";
import routeService from "./routeService.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);


app.get("/", async (req: Request, res: Response) => {
  res.status(200).send("Hello World!");
});


app.get("/nearest", async (req: Request, res: Response) => {
  await routeService.findNearestNodeHandler(req, res);
});

// app.get("/shortest-path", async (req: Request, res: Response) => {
//   await routeService.findShortestPathHandler(req, res);
// });

app.get("/shortest-path-pruning", async (req: Request, res: Response) => {
  await routeService.findShortestPathHandlerWithPruning(req, res);
});

app.post("/create-bus-route", async (req: Request, res: Response) => {
  await routeService.insertBusRoute(req, res);
});

app.delete("/delete-bus-route", async (req: Request, res: Response) => {
  await routeService.deleteBusRoute(req, res);
});

app.get("/get-all-bus-routes", async (req: Request, res: Response) => {
  await routeService.getAllBusRoutes(req, res);
});

// async findShortestPathHandlerWithPruning(req: Request, res: Response): Promise < void> {

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
