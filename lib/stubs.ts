import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");

async function ensureUploads() {
  await fs.mkdir(uploadDir, { recursive: true });
}

export async function analyzeSketch() {
  return {
    garmentType: "Jacket",
    silhouette: "Regular",
    details: ["Two-button", "Notch lapel", "Side vents"],
    confidence: { silhouette: 0.83, measurements: 0.78, details: 0.86 },
  };
}

export async function generateRender(projectId: string, version: number) {
  await ensureUploads();
  const fileName = `render-${projectId}-v${version}.txt`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, `Y&I TailorLab render placeholder for ${projectId} v${version}`);
  return { filePath, mimeType: "text/plain", originalName: fileName };
}

export async function generatePatternPDF(projectId: string, version: number) {
  await ensureUploads();
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  page.drawText(`Y&I TailorLab Pattern Placeholder`, { x: 40, y: 800, size: 16, font });
  page.drawText(`Project: ${projectId} | Pattern v${version}`, { x: 40, y: 775, size: 12, font });
  page.drawText("10x10 cm test square below", { x: 40, y: 745, size: 11, font });

  const cm = 28.3465;
  page.drawRectangle({ x: 40, y: 460, width: 10 * cm, height: 10 * cm, borderColor: rgb(0, 0, 0), borderWidth: 2 });

  const bytes = await doc.save();
  const fileName = `pattern-${projectId}-v${version}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, bytes);

  return { filePath, mimeType: "application/pdf", originalName: fileName, total_cut_area_cm2: 8600 };
}
