
import { GoogleGenAI, Type } from "@google/genai";
import { MentorResponse, PerformanceData, PerformanceAnalysis, Subject, Question, ExamAnalysis, BankQuestion, QuestionType, Difficulty, StudyPlan, HintResponse, GroundingSource, BloomsLevel } from '../types';

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJsonFromString = (text: string): string => {
    let content = text.trim();
    if (content.startsWith('```json')) {
        content = content.substring(7, content.length - 3).trim();
    } else if (content.startsWith('```')) {
        content = content.substring(3, content.length - 3).trim();
    }
    const firstBrace = content.indexOf('{');
    const firstBracket = content.indexOf('[');
    if (firstBrace === -1 && firstBracket === -1) return content;
    let isObject = false;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        isObject = true;
    }
    if (isObject) {
        const lastBrace = content.lastIndexOf('}');
        if (lastBrace > firstBrace) return content.substring(firstBrace, lastBrace + 1);
    } else {
        const lastBracket = content.lastIndexOf(']');
        if (lastBracket > firstBracket) return content.substring(firstBracket, lastBracket + 1);
    }
    return content;
};

export const askMentor = async (query: string): Promise<MentorResponse> => {
    const ai = getAIClient();
    
    const systemInstruction = `You are the "Alfanumrik AI Tutor", an expert mentor using Bloom's Taxonomy for CBSE Students. 
    **MANDATORY RULES:**
    1. Encourage higher-order thinking (Analyzing, Evaluating).
    2. USE GOOGLE SEARCH to find REAL educational diagrams.
    3. Cite real-world academic sources.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: query,
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
        }
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                sources.push({ uri: chunk.web.uri, title: chunk.web.title || "Academic Source" });
            }
        });
    }

    return {
        answer: response.text || "Recalibrating curriculum alignment...",
        sources: sources.length > 0 ? sources : undefined
    };
};

export const generatePracticeQuestion = async (grade: number, subject: Subject, chapter: string, difficulty: Difficulty, concept?: string): Promise<BankQuestion> => {
    const ai = getAIClient();
    const systemInstruction = `You are a CBSE question engine using Bloom's Taxonomy. Each question MUST be tagged with a BloomsLevel (Remember, Understand, Apply, Analyze, Evaluate, Create).`;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            class: { type: Type.INTEGER },
            question_type: { type: Type.STRING, enum: Object.values(QuestionType) },
            subject: { type: Type.STRING, enum: Object.values(Subject) },
            chapter: { type: Type.STRING },
            question_text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct_answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            model_answer: { type: Type.STRING },
            marks: { type: Type.INTEGER },
            examiner_tips: { type: Type.STRING },
            difficulty_level: { type: Type.STRING, enum: Object.values(Difficulty) },
            blooms_level: { type: Type.STRING, enum: Object.values(BloomsLevel) },
            source_year: { type: Type.INTEGER },
            concept_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["question_type", "subject", "chapter", "question_text", "blooms_level", "difficulty_level", "concept_tags"]
    };

    const prompt = `Generate a ${difficulty} difficulty challenge for Class ${grade} ${subject}, Chapter: "${chapter}". Ensure it aligns with Bloom's ${difficulty === Difficulty.HOTS ? 'Analyze/Evaluate' : 'Understand/Apply'} level.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema
        }
    });

    return JSON.parse(extractJsonFromString(response.text));
};

export const generateHint = async (question: string, subject: string): Promise<HintResponse> => {
    const ai = getAIClient();
    const responseSchema = {
        type: Type.OBJECT,
        properties: { hint: { type: Type.STRING }, conceptNugget: { type: Type.STRING } },
        required: ['hint', 'conceptNugget']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Subject: ${subject}\nQuestion: ${question}`,
        config: {
            systemInstruction: "Provide scaffolding hints for students.",
            responseMimeType: 'application/json',
            responseSchema
        }
    });

    return JSON.parse(extractJsonFromString(response.text));
};

// ... remaining functions kept for brevity
export const generateRevisionNotes = async (grade: number, subject: Subject, chapter: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Revision notes for Class ${grade} ${subject}, Chapter: "${chapter}". Use Bloom's scaffolding.`,
    });
    return response.text;
};
export const getPerformanceAnalysis = async (data: PerformanceData[]): Promise<PerformanceAnalysis> => {
    const ai = getAIClient();
    const prompt = `Analyze performance: ${JSON.stringify(data)}`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(extractJsonFromString(response.text));
};
export const generateSimulationPaper = async (grade: number, subject: Subject, numQuestions: number): Promise<Question[]> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Class ${grade} ${subject} Simulation. ${numQuestions} questions.`,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(extractJsonFromString(response.text));
};
export const getExamAnalysis = async (grade: number, questions: Question[], userAnswers: string[]): Promise<ExamAnalysis> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze exam performance.`,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(extractJsonFromString(response.text));
};
export const generateStudyPlan = async (grade: number, subjects: Subject[], durationDays: number, performanceSummary: string): Promise<StudyPlan> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Plan for Class ${grade}. Duration ${durationDays}.`,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(extractJsonFromString(response.text));
};
