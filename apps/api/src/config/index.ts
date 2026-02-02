import dotenv from 'dotenv';
import type { Secret, SignOptions } from 'jsonwebtoken';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET ?? 'default-secret-change-me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: jwtSecret as Secret,
    expiresIn: jwtExpiresIn as SignOptions['expiresIn'],
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

export default config;
