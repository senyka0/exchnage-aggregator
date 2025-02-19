import { Router } from "express";
import { RatesController } from "../controllers/RatesController";

const router = Router();
const ratesController = new RatesController();

router.get("/", ratesController.getRates);

export default router;
