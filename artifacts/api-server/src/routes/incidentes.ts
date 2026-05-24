import { Router, type IRouter } from "express";
import { connectMongoDB, mongoose } from "../lib/mongodb";
import { Incidente } from "../models/Incidente";

const router: IRouter = Router();

function serializeUbicacion(ubicacion: any): string | null {
  if (!ubicacion) return null;
  if (typeof ubicacion === "string") return ubicacion || null;
  if (typeof ubicacion === "object" && ubicacion.latitud != null) {
    return `${Number(ubicacion.latitud).toFixed(6)}, ${Number(ubicacion.longitud).toFixed(6)}`;
  }
  return null;
}

function formatIncidente(inc: any) {
  return {
    _id: inc._id?.toString() ?? inc._id,
    tipoId: inc.tipoId?.toString() ?? null,
    usuarioId: inc.usuarioId?.toString() ?? null,
    zonaId: inc.zonaId?.toString() ?? null,
    descripcion: inc.descripcion ?? "",
    fecha: inc.fecha instanceof Date ? inc.fecha.toISOString() : (inc.fecha ?? new Date().toISOString()),
    ubicacion: serializeUbicacion(inc.ubicacion),
    etiquetas: inc.etiquetas ?? [],
    tipoNombre: inc.tipoNombre ?? null,
    zonaNombre: inc.zonaNombre ?? null,
    usuarioNombre: inc.usuarioNombre ?? null,
  };
}

async function getUserIdFromToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.slice(7);
    const decoded = Buffer.from(token, "base64").toString();
    return decoded.split(":")[0];
  } catch {
    return null;
  }
}

router.get("/incidentes/mis-reportes", async (req, res): Promise<void> => {
  await connectMongoDB();
  const userId = await getUserIdFromToken(req.headers.authorization);

  if (!userId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const incidentes = await Incidente.aggregate([
    { $match: { usuarioId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "tipos_incidente",
        localField: "tipoId",
        foreignField: "_id",
        as: "tipo",
      },
    },
    {
      $lookup: {
        from: "zonas_turisticas",
        localField: "zonaId",
        foreignField: "_id",
        as: "zona",
      },
    },
    {
      $project: {
        _id: 1,
        tipoId: 1,
        usuarioId: 1,
        zonaId: 1,
        descripcion: 1,
        fecha: 1,
        ubicacion: 1,
        etiquetas: 1,
        tipoNombre: { $arrayElemAt: ["$tipo.nombre", 0] },
        zonaNombre: { $arrayElemAt: ["$zona.nombre", 0] },
      },
    },
    { $sort: { fecha: -1 } },
  ]);

  res.json(incidentes.map(formatIncidente));
});

router.get("/incidentes", async (req, res): Promise<void> => {
  await connectMongoDB();
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "20"), 10);
  const skip = (page - 1) * limit;

  const match: Record<string, any> = {};

  if (req.query.zona) {
    try {
      match.zonaId = new mongoose.Types.ObjectId(String(req.query.zona));
    } catch {}
  }
  if (req.query.tipo) {
    try {
      match.tipoId = new mongoose.Types.ObjectId(String(req.query.tipo));
    } catch {}
  }
  if (req.query.fechaDesde || req.query.fechaHasta) {
    match.fecha = {};
    if (req.query.fechaDesde) match.fecha.$gte = new Date(String(req.query.fechaDesde));
    if (req.query.fechaHasta) match.fecha.$lte = new Date(String(req.query.fechaHasta));
  }

  const [incidentes, total] = await Promise.all([
    Incidente.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "tipos_incidente",
          localField: "tipoId",
          foreignField: "_id",
          as: "tipo",
        },
      },
      {
        $lookup: {
          from: "zonas_turisticas",
          localField: "zonaId",
          foreignField: "_id",
          as: "zona",
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "usuarioId",
          foreignField: "_id",
          as: "usuario",
        },
      },
      {
        $project: {
          _id: 1,
          tipoId: 1,
          usuarioId: 1,
          zonaId: 1,
          descripcion: 1,
          fecha: 1,
          ubicacion: 1,
          etiquetas: 1,
          tipoNombre: { $arrayElemAt: ["$tipo.nombre", 0] },
          zonaNombre: { $arrayElemAt: ["$zona.nombre", 0] },
          usuarioNombre: { $arrayElemAt: ["$usuario.nombre", 0] },
        },
      },
      { $sort: { fecha: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
    Incidente.countDocuments(match),
  ]);

  res.json({ data: incidentes.map(formatIncidente), total, page, limit });
});

router.post("/incidentes", async (req, res): Promise<void> => {
  await connectMongoDB();
  const userId = await getUserIdFromToken(req.headers.authorization);
  const { tipoId, zonaId, descripcion, ubicacion, etiquetas } = req.body;

  if (!descripcion) {
    res.status(400).json({ error: "La descripción es requerida" });
    return;
  }

  const data: Record<string, any> = { descripcion, usuarioId: userId, fecha: new Date() };
  if (tipoId) {
    try { data.tipoId = new mongoose.Types.ObjectId(tipoId); } catch {}
  }
  if (zonaId) {
    try { data.zonaId = new mongoose.Types.ObjectId(zonaId); } catch {}
  }
  if (ubicacion) data.ubicacion = ubicacion;
  if (etiquetas) data.etiquetas = etiquetas;

  const inc = await Incidente.create(data);
  res.status(201).json(formatIncidente(inc.toObject()));
});

router.get("/incidentes/:id", async (req, res): Promise<void> => {
  await connectMongoDB();
  const { id } = req.params;

  const results = await Incidente.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(String(id)) } },
    {
      $lookup: {
        from: "tipos_incidente",
        localField: "tipoId",
        foreignField: "_id",
        as: "tipo",
      },
    },
    {
      $lookup: {
        from: "zonas_turisticas",
        localField: "zonaId",
        foreignField: "_id",
        as: "zona",
      },
    },
    {
      $lookup: {
        from: "usuarios",
        localField: "usuarioId",
        foreignField: "_id",
        as: "usuario",
      },
    },
    {
      $project: {
        _id: 1,
        tipoId: 1,
        usuarioId: 1,
        zonaId: 1,
        descripcion: 1,
        fecha: 1,
        ubicacion: 1,
        etiquetas: 1,
        tipoNombre: { $arrayElemAt: ["$tipo.nombre", 0] },
        zonaNombre: { $arrayElemAt: ["$zona.nombre", 0] },
        usuarioNombre: { $arrayElemAt: ["$usuario.nombre", 0] },
      },
    },
  ]);

  if (!results.length) {
    res.status(404).json({ error: "Incidente no encontrado" });
    return;
  }

  res.json(formatIncidente(results[0]));
});

router.put("/incidentes/:id", async (req, res): Promise<void> => {
  await connectMongoDB();
  const { id } = req.params;
  const { tipoId, zonaId, descripcion, ubicacion, etiquetas } = req.body;

  const update: Record<string, any> = {};
  if (descripcion != null) update.descripcion = descripcion;
  if (ubicacion != null) update.ubicacion = ubicacion;
  if (etiquetas != null) update.etiquetas = etiquetas;
  if (tipoId) {
    try { update.tipoId = new mongoose.Types.ObjectId(tipoId); } catch {}
  }
  if (zonaId) {
    try { update.zonaId = new mongoose.Types.ObjectId(zonaId); } catch {}
  }

  const inc = await Incidente.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!inc) {
    res.status(404).json({ error: "Incidente no encontrado" });
    return;
  }

  res.json(formatIncidente(inc.toObject()));
});

router.delete("/incidentes/:id", async (req, res): Promise<void> => {
  await connectMongoDB();
  const { id } = req.params;
  const deleted = await Incidente.findByIdAndDelete(id);
  if (!deleted) {
    res.status(404).json({ error: "Incidente no encontrado" });
    return;
  }
  res.sendStatus(204);
});

export default router;
