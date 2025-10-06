import type { FastifyInstance } from "fastify";

import { createCARSForm, getAllCARSForms, getCARSFormById } from "../controllers/cars-form.controller";

export async function carsFormRoutes(app: FastifyInstance) {
  app.post("/cars-forms", createCARSForm);
  app.get("/cars-forms", getAllCARSForms);
  app.get("/cars-forms/:id", getCARSFormById);
}
