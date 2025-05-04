import express from "express";
import dotenv from "dotenv";
import routeService from "./routeService.js";
import cors from "cors";
import morgan from "morgan";

dotenv.config();
const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
// app.use(
//   cors({
//     origin: "https://desired-albacore-commonly.ngrok-free.app",
//     credentials: true, // only needed if you are sending cookies or HTTP auth
//   })
// );

// app.use(
//   cors({
//     origin: "https://desired-albacore-commonly.ngrok-free.app",
//     methods: ["GET", "POST", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true,
//   })
// );

app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send("Hello World!");
});

app.get("/nearest", async (req, res) => {
  await routeService.findNearestNodeHandler(req, res);
});

// app.get("/shortest-path", async (req, res) => {
//   await routeService.findShortestPathHandler(req, res);
// });

app.get("/shortest-path-pruning", async (req, res) => {
  await routeService.findShortestPathHandlerWithPruning(req, res);
});

app.post("/create-bus-route", async (req, res) => {
  await routeService.insertBusRoute(req, res);
  console.log("Route added successfully");
});

app.delete("/delete-bus-route", async (req, res) => {
  await routeService.deleteBusRoute(req, res);
});

app.get("/get-all-bus-routes", async (req, res) => {
  await routeService.getAllBusRoutes(req, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
