function getEnvVariable(key: string): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing`);
  }
  return value;
}

export const env = {
  isBackendEnabled: getEnvVariable("VITE_IS_BACKEND_ENABLED") === "true",
  apiUrl: "/api",
  // import.meta.env.MODE === "development"
  //   ? getEnvVariable("VITE_LOCAL_SERVER_URL") + "/api"
  //   : "/api",
  isTouchDevice: "ontouchstart" in window,
};
