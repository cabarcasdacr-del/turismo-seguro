import { mongoose } from "../lib/mongodb";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: { type: String, enum: ["administrador", "turista"], default: "turista" },
  fechaRegistro: { type: Date, default: Date.now },
});

export const Usuario = mongoose.model("Usuario", usuarioSchema, "usuarios");
