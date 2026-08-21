import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "DUMMY_KEY" });

export default ai;