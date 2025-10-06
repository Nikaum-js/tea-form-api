import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { createCARSFormSchema } from "../schemas/cars-form.schema";
import { calculateTotalScore, mapCARSFormToPrisma } from "../utils/cars-form.utils";

export async function createCARSForm(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validatedData = createCARSFormSchema.parse(request.body);
    const totalScore = calculateTotalScore(validatedData);
    const prismaData = mapCARSFormToPrisma(validatedData, totalScore);

    const submission = await prisma.cARSFormSubmission.create({
      data: prismaData,
    });

    return reply.status(201).send({
      id: submission.id,
      totalScore: submission.totalScore,
      createdAt: submission.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        issues: error.issues,
      });
    }

    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}

export async function getAllCARSForms(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const submissions = await prisma.cARSFormSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    return reply.send(submissions);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}

export async function getCARSFormById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const submission = await prisma.cARSFormSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return reply.status(404).send({ error: "CARS form not found" });
    }

    return reply.send(submission);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
