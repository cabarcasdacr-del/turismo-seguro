import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import incidentesRouter from "./incidentes";
import usuariosRouter from "./usuarios";
import zonasRouter from "./zonas";
import tiposRouter from "./tipos";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(incidentesRouter);
router.use(usuariosRouter);
router.use(zonasRouter);
router.use(tiposRouter);
router.use(statsRouter);

export default router;
