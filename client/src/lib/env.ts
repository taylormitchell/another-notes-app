function getEnvVariable(key: string): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing`);
  }
  return value;
}

export const env = {
  isPersistenceDisabled: getEnvVariable("VITE_IS_PERSISTENCE_DISABLED") === "true",
  apiUrl: "/api",
  // import.meta.env.MODE === "development"
  //   ? getEnvVariable("VITE_LOCAL_SERVER_URL") + "/api"
  //   : "/api",
  isTouchDevice: "ontouchstart" in window,
};
