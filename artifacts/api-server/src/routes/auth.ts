import { Router, type IRouter } from "express";
import crypto from "crypto";
import { connectMongoDB } from "../lib/mongodb";
import { Usuario } from "../models/Usuario";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function formatUser(user: InstanceType<typeof Usuario>) {
  return {
    _id: user._id.toString(),
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    fechaRegistro: user.fechaRegistro?.toISOString() ?? null,
  };
}

router.post("/auth/login", async (req, res): Promise<void> => {
  await connectMongoDB();
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    res.status(400).json({ error: "Correo y contraseña son requeridos" });
    return;
  }

  const user = await Usuario.findOne({ correo });
  if (!user) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const hashed = hashPassword(contrasena);
  if (user.contrasena !== hashed && user.contrasena !== contrasena) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const token = Buffer.from(`${user._id}:${Date.now()}`).toString("base64");

  req.log.info({ userId: user._id }, "User logged in");
  res.json({ usuario: formatUser(user), token });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  await connectMongoDB();
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    res.status(400).json({ error: "Todos los campos son requeridos" });
    return;
  }

  const existing = await Usuario.findOne({ correo });
  if (existing) {
    res.status(400).json({ error: "El correo ya está registrado" });
    return;
  }

  const user = await Usuario.create({
    nombre,
    correo,
    contrasena: hashPassword(contrasena),
    rol: "turista",
  });

  const token = Buffer.from(`${user._id}:${Date.now()}`).toString("base64");

  req.log.info({ userId: user._id }, "User registered");
  res.status(201).json({ usuario: formatUser(user), token });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  await connectMongoDB();
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = Buffer.from(token, "base64").toString();
    const userId = decoded.split(":")[0];

    const user = await Usuario.findById(userId);
    if (!user) {
      res.status(401).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json(formatUser(user));
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "Sesión cerrada" });
});

export default router;
