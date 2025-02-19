import { Router } from "express";
import estimateRoutes from "./estimateRoutes";
import ratesRoutes from "./ratesRoutes";
const router = Router();

router.use("/estimate", estimateRoutes);
router.use("/rates", ratesRoutes);

export default router;
