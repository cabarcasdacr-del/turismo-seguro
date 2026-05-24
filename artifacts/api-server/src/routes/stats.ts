import { Router, type IRouter } from "express";
import { connectMongoDB, mongoose } from "../lib/mongodb";
import { Incidente } from "../models/Incidente";
import { Usuario } from "../models/Usuario";
import { ZonaTuristica } from "../models/ZonaTuristica";

const router: IRouter = Router();

router.get("/stats/dashboard", async (_req, res): Promise<void> => {
  await connectMongoDB();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalIncidentes, totalUsuarios, totalZonas, incidentesHoy, incidentesEsteMes] =
    await Promise.all([
      Incidente.countDocuments(),
      Usuario.countDocuments(),
      ZonaTuristica.countDocuments(),
      Incidente.countDocuments({ fecha: { $gte: startOfToday } }),
      Incidente.countDocuments({ fecha: { $gte: startOfMonth } }),
    ]);

  res.json({ totalIncidentes, totalUsuarios, totalZonas, incidentesHoy, incidentesEsteMes });
});

router.get("/stats/zonas-riesgo", async (_req, res): Promise<void> => {
  await connectMongoDB();

  const result = await Incidente.aggregate([
    { $match: { zonaId: { $exists: true, $ne: null } } },
    { $group: { _id: "$zonaId", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "zonas_turisticas",
        localField: "_id",
        foreignField: "_id",
        as: "zona",
      },
    },
    {
      $project: {
        zonaId: { $toString: "$_id" },
        zonaNombre: { $arrayElemAt: ["$zona.nombre", 0] },
        nivelRiesgo: { $arrayElemAt: ["$zona.nivelRiesgo", 0] },
        total: 1,
      },
    },
  ]);

  res.json(
    result.map((r) => ({
      zonaId: r.zonaId,
      zonaNombre: r.zonaNombre ?? "Desconocida",
      total: r.total,
      nivelRiesgo: r.nivelRiesgo ?? null,
    }))
  );
});

router.get("/stats/tipos-frecuentes", async (_req, res): Promise<void> => {
  await connectMongoDB();

  const result = await Incidente.aggregate([
    { $match: { tipoId: { $exists: true, $ne: null } } },
    { $group: { _id: "$tipoId", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "tipos_incidente",
        localField: "_id",
        foreignField: "_id",
        as: "tipo",
      },
    },
    {
      $project: {
        tipoId: { $toString: "$_id" },
        tipoNombre: { $arrayElemAt: ["$tipo.nombre", 0] },
        total: 1,
      },
    },
  ]);

  res.json(
    result.map((r) => ({
      tipoId: r.tipoId,
      tipoNombre: r.tipoNombre ?? "Desconocido",
      total: r.total,
    }))
  );
});

router.get("/stats/incidentes-por-mes", async (_req, res): Promise<void> => {
  await connectMongoDB();

  const result = await Incidente.aggregate([
    {
      $group: {
        _id: {
          anio: { $year: "$fecha" },
          mes: { $month: "$fecha" },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.anio": 1, "_id.mes": 1 } },
    { $limit: 24 },
    {
      $project: {
        anio: "$_id.anio",
        mes: {
          $concat: [
            { $toString: "$_id.anio" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.mes", 10] },
                { $concat: ["0", { $toString: "$_id.mes" }] },
                { $toString: "$_id.mes" },
              ],
            },
          ],
        },
        total: 1,
      },
    },
  ]);

  res.json(
    result.map((r) => ({
      mes: r.mes,
      total: r.total,
      anio: r.anio,
    }))
  );
});

router.get("/stats/top-reporteros", async (_req, res): Promise<void> => {
  await connectMongoDB();

  const result = await Incidente.aggregate([
    { $match: { usuarioId: { $exists: true, $ne: null } } },
    { $group: { _id: "$usuarioId", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "usuarios",
        localField: "_id",
        foreignField: "_id",
        as: "usuario",
      },
    },
    {
      $project: {
        usuarioId: { $toString: "$_id" },
        usuarioNombre: { $arrayElemAt: ["$usuario.nombre", 0] },
        correo: { $arrayElemAt: ["$usuario.correo", 0] },
        total: 1,
      },
    },
  ]);

  res.json(
    result.map((r) => ({
      usuarioId: r.usuarioId,
      usuarioNombre: r.usuarioNombre ?? "Desconocido",
      total: r.total,
      correo: r.correo ?? null,
    }))
  );
});

router.get("/stats/mapa", async (req, res): Promise<void> => {
  await connectMongoDB();

  const match: Record<string, any> = {
    "ubicacion.latitud": { $exists: true },
  };

  if (req.query.zona) {
    try {
      match.zonaId = new mongoose.Types.ObjectId(String(req.query.zona));
    } catch {}
  }

  const result = await Incidente.aggregate([
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
      $project: {
        _id: 1,
        descripcion: 1,
        fecha: 1,
        latitud: "$ubicacion.latitud",
        longitud: "$ubicacion.longitud",
        tipoNombre: { $arrayElemAt: ["$tipo.nombre", 0] },
        zonaNombre: { $arrayElemAt: ["$zona.nombre", 0] },
        nivelRiesgo: { $arrayElemAt: ["$zona.nivelRiesgo", 0] },
      },
    },
    { $limit: 500 },
  ]);

  res.json(
    result.map((r) => ({
      id: r._id.toString(),
      descripcion: r.descripcion ?? "",
      fecha: r.fecha instanceof Date ? r.fecha.toISOString() : (r.fecha ?? ""),
      latitud: r.latitud,
      longitud: r.longitud,
      tipoNombre: r.tipoNombre ?? null,
      zonaNombre: r.zonaNombre ?? null,
      nivelRiesgo: r.nivelRiesgo ?? null,
    }))
  );
});

export default router;
