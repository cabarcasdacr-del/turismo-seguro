import { Router, type IRouter } from "express";
import { connectMongoDB } from "../lib/mongodb";
import { ZonaTuristica } from "../models/ZonaTuristica";

const router: IRouter = Router();

router.get("/zonas", async (_req, res): Promise<void> => {
  await connectMongoDB();
  const zonas = await ZonaTuristica.find({}).sort({ nombre: 1 });
  res.json(
    zonas.map((z) => ({
      _id: z._id.toString(),
      nombre: z.nombre,
      ciudad: z.ciudad ?? null,
      nivelRiesgo: z.nivelRiesgo ?? null,
    }))
  );
});

export default router;
