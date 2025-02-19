import { Router } from "express";
import { EstimateController } from "../controllers/EstimateController";

const router = Router();
const estimateController = new EstimateController();

router.get("/", estimateController.getEstimate);

export default router;
