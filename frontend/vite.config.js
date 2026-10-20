import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api проксируется на FastAPI (uvicorn backend.app.main:app --port 8000)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:8000" } },
});
