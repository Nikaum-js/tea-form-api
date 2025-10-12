import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { createCARSFormSchema } from "../schemas/cars-form.schema";
import { calculateTotalScore, mapCARSFormToPrisma } from "../utils/cars-form.utils";
import { CARSAnalysisService } from "../services/cars-analysis.service";
import { PDFGeneratorService } from "../services/pdf-generator.service";

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

    let psychologicalReport: string | undefined;
    let pdfBuffer: Buffer | undefined;

    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        request.log.warn("DEEPSEEK_API_KEY not found - skipping report generation");
      } else {
        const analysisService = new CARSAnalysisService(apiKey);
        psychologicalReport = await analysisService.generatePsychologicalReport(
          validatedData,
          totalScore
        );
        request.log.info("Psychological report generated successfully");

        // Generate PDF from report
        try {
          const pdfService = new PDFGeneratorService();
          const pdfStream = pdfService.generateReportPDF(psychologicalReport, totalScore);

          // Convert stream to buffer
          const chunks: Buffer[] = [];
          for await (const chunk of pdfStream) {
            chunks.push(chunk as Buffer);
          }
          pdfBuffer = Buffer.concat(chunks);

          request.log.info(`PDF generated successfully. Size: ${pdfBuffer.length} bytes`);
        } catch (pdfError) {
          request.log.error({ err: pdfError }, "Failed to generate PDF");
          if (pdfError instanceof Error) {
            request.log.error(`PDF Error: ${pdfError.message}`);
            request.log.error(`PDF Stack: ${pdfError.stack}`);
          }
        }
      }
    } catch (analysisError) {
      request.log.error({ err: analysisError }, "Failed to generate psychological report");
    }

    return reply.status(201).send({
      id: submission.id,
      totalScore: submission.totalScore,
      createdAt: submission.createdAt,
      psychologicalReport,
      pdfReport: pdfBuffer ? pdfBuffer.toString('base64') : undefined,
      formData: validatedData,
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
