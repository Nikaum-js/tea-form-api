import PDFDocument from "pdfkit";
import type { Readable } from "stream";

export class PDFGeneratorService {
  generateReportPDF(
    reportContent: string,
    totalScore: number
  ): Readable {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });

    // Header
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .text("RELATÓRIO PSICOLÓGICO", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#333333")
      .text("Avaliação CARS - Childhood Autism Rating Scale", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#555555")
      .text(`Pontuação Total: ${totalScore} pontos`, { align: "center" })
      .moveDown(0.1);

    const date = new Date();
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#777777")
      .text(`Data de emissão: ${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR")}`, { align: "center" })
      .moveDown(1.2);

    // Clean and process markdown content
    const lines = reportContent.split("\n");
    const pageWidth = 495; // Full width minus margins (595.28 - 50*2)
    const leftMargin = 50;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Force reset X position to prevent column layout
      doc.x = leftMargin;

      // Skip empty lines and markdown separators
      if (trimmedLine === "" || trimmedLine === "---" || trimmedLine.startsWith("|---")) {
        continue;
      }

      // Skip main title (already in header)
      if (trimmedLine.startsWith("# RELATÓRIO")) {
        continue;
      }

      // Handle H2 headers (## Title)
      if (trimmedLine.startsWith("## ")) {
        const title = trimmedLine.replace(/^##\s+/, "").replace(/\*/g, "");
        doc
          .moveDown(1.2)
          .fontSize(13)
          .font("Helvetica-Bold")
          .fillColor("#1a1a1a")
          .text(title.toUpperCase(), { align: "left", width: 495 })
          .moveDown(0.6);
        continue;
      }

      // Handle H3 headers (### Title)
      if (trimmedLine.startsWith("### ")) {
        const title = trimmedLine.replace(/^###\s+/, "").replace(/\*/g, "");
        doc
          .moveDown(0.8)
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#333333")
          .text(title, { align: "left", width: 495 })
          .moveDown(0.4);
        continue;
      }

      // Handle table header/rows (markdown tables)
      if (trimmedLine.startsWith("|")) {
        const cells = trimmedLine.split("|").filter(c => c.trim() !== "");

        // Skip separator rows
        if (cells.every(c => c.trim().match(/^-+$/))) {
          continue;
        }

        const isHeader = i > 0 && !lines[i - 1].includes("|");
        const fontSize = isHeader ? 9 : 8.5;
        const font = isHeader ? "Helvetica-Bold" : "Helvetica";
        const startX = 60;
        const colWidths = [180, 80, 160]; // Custom widths for each column
        const rowHeight = 20;
        const currentY = doc.y;

        doc.fontSize(fontSize).font(font);

        // Draw cells with borders
        cells.forEach((cell, idx) => {
          const cellX = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
          const cellWidth = colWidths[idx] || 100;

          // Draw cell border
          doc.rect(cellX, currentY, cellWidth, rowHeight).stroke("#cccccc");

          // Fill header background
          if (isHeader) {
            doc.fillColor("#f5f5f5").rect(cellX, currentY, cellWidth, rowHeight).fill();
          }

          // Draw cell text
          doc.fillColor("#000000").text(
            cell.trim(),
            cellX + 5,
            currentY + 5,
            {
              width: cellWidth - 10,
              height: rowHeight - 10,
              align: idx === 1 ? "center" : "left"
            }
          );
        });

        doc.y = currentY + rowHeight;
        continue;
      }

      // Handle bullet points (- text)
      if (trimmedLine.startsWith("- ")) {
        let content = trimmedLine.substring(2);

        // Clean quotes and special characters
        content = content.replace(/^['"]|['"]$/g, ""); // Remove leading/trailing quotes
        content = content.replace(/≥/g, "≥").replace(/≤/g, "≤"); // Fix symbols

        // Extract bold parts and clean
        const boldMatch = content.match(/^\*\*([^*]+)\*\*:?\s*(.*)/);

        if (boldMatch) {
          const [, boldPart, restPart] = boldMatch;
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#000000")
            .text(`  • ${boldPart}:`, { continued: true });
          doc
            .font("Helvetica")
            .text(` ${restPart}`);
        } else {
          // Clean any remaining markdown
          content = content.replace(/\*\*/g, "").replace(/\*/g, "");
          doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#000000")
            .text(`  • ${content}`);
        }
        doc.moveDown(0.2);
        continue;
      }

      // Handle inline bold/formatting
      if (trimmedLine.includes("**")) {
        // Process inline bold
        const segments = [];
        let temp = trimmedLine;
        let inBold = false;

        while (temp.includes("**")) {
          const idx = temp.indexOf("**");
          if (idx > 0) {
            segments.push({ text: temp.substring(0, idx), bold: inBold });
          }
          temp = temp.substring(idx + 2);
          inBold = !inBold;
        }

        if (temp) {
          segments.push({ text: temp, bold: inBold });
        }

        doc.fontSize(10).fillColor("#000000");

        segments.forEach((seg, idx) => {
          doc.font(seg.bold ? "Helvetica-Bold" : "Helvetica");
          doc.text(seg.text, { continued: idx < segments.length - 1 });
        });

        doc.moveDown(0.3);
        continue;
      }

      // Handle field placeholders [Text to fill]
      if (trimmedLine.includes("[") && trimmedLine.includes("]")) {
        const match = trimmedLine.match(/^([^[]+)\[([^\]]+)\]/);
        if (match) {
          const [, prefix, placeholder] = match;

          // Draw prefix
          doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000").text(prefix, {
            continued: true,
            width: 495
          });

          // Draw placeholder with background
          const currentY = doc.y - 12; // Adjust for line height
          const currentX = doc.x;
          const placeholderWidth = doc.widthOfString(`[${placeholder}]`);

          doc.fillColor("#fffacd").rect(currentX, currentY, placeholderWidth + 10, 12).fill();
          doc.fontSize(9).font("Helvetica-Oblique").fillColor("#666666").text(`[${placeholder}]`);
          doc.moveDown(0.3);
          continue;
        }
      }

      // Normal paragraph
      if (trimmedLine) {
        const cleanText = trimmedLine.replace(/\*/g, "").replace(/≥/g, "≥").replace(/≤/g, "≤");
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#000000")
          .text(cleanText, {
            align: "left",
            width: 495, // Full page width minus margins
            continued: false
          })
          .moveDown(0.3);
      }
    }

    doc.end();

    return doc;
  }
}
