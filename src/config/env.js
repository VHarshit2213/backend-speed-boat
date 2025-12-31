import dotenv from "dotenv";

// Force dotenv to load immediately
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
};

// HARD FAIL if missing
if (!env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing. Check .env loading.");
  process.exit(1);
}

