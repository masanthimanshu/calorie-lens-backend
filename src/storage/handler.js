import routes from "./routes.js";
import app from "#core/create_app.js";
import serverless from "serverless-http";

const appInstance = app("/storage", routes);
export const handler = serverless(appInstance);
