import mongoose from "mongoose";
import { logger } from "./logger";

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (isConnected) return;

  let uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI must be set.");
  }

  // Strip accidental "MONGODB_URI=" prefix if the secret was stored with the key name
  if (uri.includes("=") && !uri.startsWith("mongodb")) {
    uri = uri.split("=").slice(1).join("=");
  }

  await mongoose.connect(uri);
  isConnected = true;
  logger.info("Connected to MongoDB Atlas");
}

export { mongoose };
