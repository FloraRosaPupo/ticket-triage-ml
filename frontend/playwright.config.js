const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:1234",
    channel: "msedge",
    viewport: { width: 1440, height: 1100 },
  },
});
