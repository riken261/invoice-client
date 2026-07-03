import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const reactVendorPattern =
  /node_modules[\\/](react|react-dom|react-router-dom|react-redux|@reduxjs)[\\/]/;
const uiVendorPattern =
  /node_modules[\\/](radix-ui|@radix-ui|@phosphor-icons|class-variance-authority|clsx|tailwind-merge)[\\/]/;
const formVendorPattern =
  /node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/;
const i18nVendorPattern =
  /node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/;

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: reactVendorPattern,
            },
            {
              name: "ui-vendor",
              test: uiVendorPattern,
            },
            {
              name: "form-vendor",
              test: formVendorPattern,
            },
            {
              name: "i18n-vendor",
              test: i18nVendorPattern,
            },
            {
              name: "http-vendor",
              test: /node_modules[\\/]axios[\\/]/,
            },
          ],
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        changeOrigin: true,
        secure: false,
        target: "http://192.168.3.25:8080",
      },
      "/invoice-authorization-service": {
        changeOrigin: true,
        secure: false,
        target: "http://192.168.3.25:8080",
      },
      "/invoice-common-service": {
        changeOrigin: true,
        secure: false,
        target: "http://192.168.3.25:8080",
      },
      "/invoice-core-service": {
        changeOrigin: true,
        secure: false,
        target: "http://192.168.3.25:8080",
      },
      "/invoice-claim-service": {
        changeOrigin: true,
        secure: false,
        target: "http://192.168.3.25:8080",
      },
      "/invoice-review-service": {
        changeOrigin: true,
        secure: false,
        target: "http://192.168.3.25:8080",
      },
    },
  },
});
