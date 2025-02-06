export const getEnvVar = (key) => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || "";
  }

  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || "";
  }

  return "";
};
