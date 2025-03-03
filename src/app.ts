import express from "express";
import mongoose from "mongoose";
import { CexService } from "./services/CexService";
import { config } from "./config/config";
import { UniswapService } from "./services/UniswapService";
import { RaydiumService } from "./services/RaydiumService";
import routes from "./routes";

const app = express();
app.use(express.json());
app.use("/api", routes);

const cexService = new CexService();
const uniswapService = new UniswapService();
const raydiumService = new RaydiumService();

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    cexService.startPolling();
    uniswapService.setupWebSocket();
    raydiumService.startPolling();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
