
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always resolves to project root/.env regardless of where `node` is launched from
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

if (!process.env.DB_URL) {
  console.error("❌ DB_URL not found in .env — check path:", path.resolve(__dirname, "../../.env"));
}
const adapter = new PrismaPg({
  connectionString:process.env.DB_URL
});

export const prisma = new PrismaClient({ adapter });
