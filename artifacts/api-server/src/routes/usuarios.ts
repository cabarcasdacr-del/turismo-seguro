import { Router, type IRouter } from "express";
import { connectMongoDB } from "../lib/mongodb";
import { Usuario } from "../models/Usuario";

const router: IRouter = Router();

function formatUser(user: any) {
  return {
    _id: user._id?.toString() ?? user._id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    fechaRegistro: user.fechaRegistro instanceof Date
      ? user.fechaRegistro.toISOString()
      : (user.fechaRegistro ?? null),
  };
}

router.get("/usuarios", async (_req, res): Promise<void> => {
  await connectMongoDB();
  const usuarios = await Usuario.find({}, { contrasena: 0 }).sort({ fechaRegistro: -1 });
  res.json(usuarios.map(formatUser));
});

router.put("/usuarios/:id", async (req, res): Promise<void> => {
  await connectMongoDB();
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  const update: Record<string, any> = {};
  if (nombre) update.nombre = nombre;
  if (correo) update.correo = correo;
  if (rol) update.rol = rol;

  const user = await Usuario.findByIdAndUpdate(id, { $set: update }, { new: true, projection: { contrasena: 0 } });
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  res.json(formatUser(user));
});

router.delete("/usuarios/:id", async (req, res): Promise<void> => {
  await connectMongoDB();
  const { id } = req.params;
  const deleted = await Usuario.findByIdAndDelete(id);
  if (!deleted) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.sendStatus(204);
});

export default router;
