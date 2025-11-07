import pdfParse from "pdf-parse";

export async function extractTextFromPDF(fileBuffer) {
  const data = await pdfParse(fileBuffer);
  return data.text;
}