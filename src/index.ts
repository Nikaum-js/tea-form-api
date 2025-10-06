import fastify from "fastify";
import cors from "@fastify/cors";
import { carsFormRoutes } from "./routes/cars-form.routes";

const app = fastify({
  logger: true,
});

// Register CORS
await app.register(cors, {
  origin: true,
});

// Register routes
await app.register(carsFormRoutes);

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
