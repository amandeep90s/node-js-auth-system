import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

export default {
  // General
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SERVER_URL: process.env.SERVER_URL,
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL,
  // Email Service
  EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY,
  // Access Token
  ACCESS_TOKEN: {
    SECRET: process.env.ACCESS_TOKEN_SECRET,
    EXPIRY: Number(process.env.ACCESS_TOKEN_EXPIRY)
  },
  // Refresh Token
  REFRESH_TOKEN: {
    SECRET: process.env.REFRESH_TOKEN_SECRET,
    EXPIRY: Number(process.env.REFRESH_TOKEN_EXPIRY)
  }
};
