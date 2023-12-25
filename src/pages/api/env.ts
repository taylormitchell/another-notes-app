function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing`);
  }
  return value;
}

export const env = {
  ACCESS_KEY_ID: getEnvVariable("ACCESS_KEY_ID"),
  SECRET_ACCESS_KEY: getEnvVariable("SECRET_ACCESS_KEY"),
  BUCKET_NAME: getEnvVariable("BUCKET_NAME"),
  REGION: getEnvVariable("REGION"),
  FILE_NAME: getEnvVariable("FILE_NAME"),
};
