import 'dotenv/config';

const required = (name, value) => {
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  DB_URL: required('DB_URL', process.env.DB_URL),
  JWT_SECRET: required('JWT_SECRET', process.env.JWT_SECRET),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || '10',
};
