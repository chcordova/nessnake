// Import necessary libraries
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Main function to list available generative models.
 */
async function listModels() {
  console.log("INFO: Connecting to Google AI Studio to list models...");
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the .env file.");
    }

    // Initialize the Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const generationConfig = {
      stopSequences: ["red"],
      maxOutputTokens: 200,
      temperature: 0.9,
      topP: 0.1,
      topK: 16,
    };
    const generativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig,
    });

    // List all models that support 'generateContent'
    const models = await generativeModel.listModels();
    console.log(
      "✅ Connection successful. Available models for 'generateContent':"
    );

    for await (const m of models) {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`-> ${m.name}`);
      }
    }
  } catch (error) {
    console.error("❌ ERROR: Could not connect to the API.", error);
  }
}

// Run the main function
listModels();
