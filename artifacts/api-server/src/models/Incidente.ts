import { mongoose } from "../lib/mongodb";

const incidenteSchema = new mongoose.Schema({
  tipoId: { type: mongoose.Schema.Types.ObjectId, ref: "TipoIncidente" },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  zonaId: { type: mongoose.Schema.Types.ObjectId, ref: "ZonaTuristica" },
  descripcion: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  ubicacion: { type: String },
  etiquetas: [{ type: String }],
});

export const Incidente = mongoose.model("Incidente", incidenteSchema, "incidentes");
