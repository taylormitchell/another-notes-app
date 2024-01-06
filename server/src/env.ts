import dotenv from "dotenv";
dotenv.config({
  // path: process.env.NODE_ENV === "production" ? "../.env" : "../.env.development",
  // path: "../.env",
  path: process.env.NODE_ENV !== "production" ? "../.env" : undefined,
});

function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing`);
  }
  return value;
}

export const env = {
  IS_PROD: process.env.NODE_ENV === "production",
  ACCESS_KEY_ID: getEnvVariable("ACCESS_KEY_ID"),
  SECRET_ACCESS_KEY: getEnvVariable("SECRET_ACCESS_KEY"),
  BUCKET_NAME: getEnvVariable("BUCKET_NAME"),
  REGION: getEnvVariable("REGION"),
  FILE_NAME: getEnvVariable("FILE_NAME"),
  CLIENT_DIR: getEnvVariable("CLIENT_DIR"),
  PORT: getEnvVariable("PORT"),
};
