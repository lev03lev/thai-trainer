import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  workers: 2,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3100", locale: "he-IL" },
  reporter: [["list"]],
});
