import { mongoose } from "../lib/mongodb";

const tipoIncidenteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
});

export const TipoIncidente = mongoose.model(
  "TipoIncidente",
  tipoIncidenteSchema,
  "tipos_incidente"
);
