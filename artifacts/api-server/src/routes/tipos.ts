import { Router, type IRouter } from "express";
import { connectMongoDB } from "../lib/mongodb";
import { TipoIncidente } from "../models/TipoIncidente";

const router: IRouter = Router();

router.get("/tipos-incidente", async (_req, res): Promise<void> => {
  await connectMongoDB();
  const tipos = await TipoIncidente.find({}).sort({ nombre: 1 });
  res.json(
    tipos.map((t) => ({
      _id: t._id.toString(),
      nombre: t.nombre,
      descripcion: t.descripcion ?? null,
    }))
  );
});

export default router;
