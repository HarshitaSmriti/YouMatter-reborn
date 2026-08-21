import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "DUMMY_KEY");

export default genAI;