import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock("config/env", () => ({
  getEnvVar: (key) => process.env[key] || "",
}));

process.env.VITE_APP_CLOUDINARY_CLOUD_NAME = "mockCloudName";
process.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET = "mockUploadPreset";
process.env.VITE_APP_CLOUDINARY_IMAGE_UPLOAD_URL =
  "https://mock.cloudinary.com/image";
process.env.VITE_APP_CLOUDINARY_RAW_UPLOAD_URL =
  "https://mock.cloudinary.com/raw";
