import { app } from "@azure/functions";
import { azureHonoHandler } from "@marplex/hono-azurefunc-adapter";
import honoApp from "../app";

app.http("RecipesApi", {
  methods: [
    "GET",
    "POST",
    "DELETE",
    "PUT",
  ],
  authLevel: "anonymous",
  route: "{*proxy}",
  handler: azureHonoHandler(honoApp.fetch),
});