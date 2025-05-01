import express, { Request, Response } from "express";
import dotenv from "dotenv";
import routeService from "./routeService.js";
import cors from "cors"

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
}));


app.get("/nearest", async (req: Request, res: Response) => {
  await routeService.findNearestNodeHandler(req, res);
});

app.get("/shortest-path", async (req: Request, res: Response) => {
  await routeService.findShortestPathHandler(req, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
