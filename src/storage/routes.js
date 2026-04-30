import { Router } from "express";
import { generateUploadUrl } from "#core/s3_client.js";

const routes = Router();

routes.get("/health", (req, res) => {
  res.send({ status: "Storage API route is working!" });
});

routes.get("/upload-url", async (req, res) => {
  res.send(await generateUploadUrl());
});

export default routes;
