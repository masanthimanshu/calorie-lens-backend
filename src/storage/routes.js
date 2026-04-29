import { Router } from "express";
import { storageController } from "./controller.js";

const routes = Router();

routes.get("/health", (req, res) => {
  res.send({ status: "Storage API route is working!" });
});

routes.post("/upload-url", storageController.uploadUrl);

export default routes;
