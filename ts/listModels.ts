// Import necessary libraries
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as readline from "readline";

// Load environment variables from .env file
dotenv.config();

/**
 * Creates an interactive chat session with the Gemini model.
 * This is a basic form of a Gemini "agent".
 */
async function runChat() {
  console.log("INFO: Starting interactive chat with Gemini...");
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the .env file.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Hello! You are a helpful assistant for the NesSnake game project.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Great to meet you! I'm ready to help with NesSnake. What's on your mind?",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const chatLoop = () => {
      rl.question("You: ", async (msg) => {
        if (msg.toLowerCase() === "exit") {
          console.log("INFO: Exiting chat.");
          rl.close();
          return;
        }

        const result = await chat.sendMessageStream(msg);

        process.stdout.write("Gemini: ");
        for await (const chunk of result.stream) {
          process.stdout.write(chunk.text());
        }
        process.stdout.write("\n");

        chatLoop(); // Continue the loop
      });
    };

    chatLoop();
  } catch (error) {
    console.error("❌ ERROR: Could not start chat.", error);
  }
}

// Run the chat function
runChat();
