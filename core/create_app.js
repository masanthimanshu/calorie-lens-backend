import "dotenv/config";
import express from "express";

export default function createApp(baseUrl, routes) {
  const app = express();

  app.use(express.json());
  app.use(baseUrl, routes);

  return app;
}
