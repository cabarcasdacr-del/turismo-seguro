import { mongoose } from "../lib/mongodb";

const zonaTuristicaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ciudad: { type: String },
  nivelRiesgo: { type: String },
});

export const ZonaTuristica = mongoose.model(
  "ZonaTuristica",
  zonaTuristicaSchema,
  "zonas_turisticas"
);
