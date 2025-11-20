import fs from "fs";
import pdf from "pdf-parse-fixed";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const checkDocument = async (req, res) => {
  try {
    const pdfFile = req.file;
    const rules = req.body.rules ? JSON.parse(req.body.rules) : [];

    if (!pdfFile) return res.status(400).json({ error: "No PDF uploaded" });

    // Read PDF buffer
    const pdfBuffer = fs.readFileSync(pdfFile.path);

    // Extract text using pdf-parse-fixed
    const pdfData = await pdf(pdfBuffer);
    const pdfText = pdfData.text || "";

    const results = [];

    for (let rule of rules) {
      const prompt = `
You are an AI document auditor.
Analyze the document given below and evaluate it against the following rule:

Rule: "${rule}"

Return STRICT VALID JSON in this format for my frontend to accept:
{
  "rule": "...",
  "status": "pass" or "fail",
  "evidence": "...",
  "reasoning": "...",
  "confidence": number (0-100)
}

Document Text:
${pdfText}
`;

      const response = await model.generateContent(prompt);

      // Gemini response
      let aiText = response.response.text().trim();

      // 🔥 Remove ```json and ``` from Gemini output
      aiText = aiText.replace(/```json|```/g, "").trim();

      let jsonResult;
      try {
        jsonResult = JSON.parse(aiText);
      } catch (err) {
        console.log("FAILED PARSE AFTER CLEANING:", aiText);
        jsonResult = {
          rule,
          status: "fail",
          evidence: "N/A",
          reasoning: "Invalid JSON returned by Gemini",
          confidence: 10,
        };
      }

      results.push(jsonResult);
    }

    // Cleanup
    fs.unlinkSync(pdfFile.path);

    res.json({ results });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Processing failed",
      details: error.message,
    });
  }
};
