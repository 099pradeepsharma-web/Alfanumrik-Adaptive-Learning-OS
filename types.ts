
export enum Subject {
    Physics = "Physics",
    Chemistry = "Chemistry",
    Biology = "Biology",
    Mathematics = "Mathematics",
    Science = "Science",
    SocialScience = "Social Science",
    English = "English",
}

export enum Difficulty {
    Easy = "Easy",
    Medium = "Medium",
    Hard = "Hard",
    HOTS = "HOTS",
}

export enum BloomsLevel {
    Remember = "Remember",
    Understand = "Understand",
    Apply = "Apply",
    Analyze = "Analyze",
    Evaluate = "Evaluate",
    Create = "Create"
}

export enum FocusMode {
    General = "General Practice",
    Numerical = "Numerical Mastery",
    CaseBased = "Case-Based Logic",
    HOTS = "Centum Path (HOTS)",
}

export interface Topic {
    id: string;
    name: string;
}

export type Chapter = Topic;

export interface SolutionStep {
    step: number;
    explanation: string;
    marks: number;
}

export interface UserProfile {
    grade: number;
    selectedSubjects: Subject[];
    name: string;
    isSetup: boolean;
}

export interface MasterySummary {
    weakChapters: { subject: Subject, chapter: string, score: number, suggestions: string[] }[];
    strongChapters: { subject: Subject, chapter: string, score: number }[];
    overallAccuracy: number;
    totalPoints: number;
    nextMilestone: string;
    boardReadiness: number;
    learningVelocity: number;
    predictedScore: number;
    // DKT / FSRS Additions
    bloomsMastery: Record<BloomsLevel, number>; 
    conceptStability: Record<string, number>; // Probability of recall per concept
}

export enum QuestionType {
    MCQ = "Multiple Choice Question",
    ShortAnswer = "Short Answer",
    LongAnswer = "Long Answer",
}

export interface BankQuestion {
    class: number;
    question_type: QuestionType;
    subject: Subject;
    chapter: string;
    question_text: string;
    options?: string[]; 
    correct_answer?: string; 
    solution_steps?: string[];
    explanation?: string;
    model_answer?: string;
    marks?: number;
    word_limit?: number;
    examiner_tips: string;
    difficulty_level: Difficulty;
    blooms_level: BloomsLevel; // New Pedagogical Tag
    source_year: number;
    concept_tags: string[];
}

export interface RevisionItem {
    question: BankQuestion;
    nextReviewDate: string; 
    lastReviewDate: string;
    stability: number; // FSRS stability (how many days until 90% retrievability)
    difficulty: number; // FSRS difficulty (1-10)
    reps: number;
    lapses: number;
    // Added level property to fix type errors in RevisionPractice.tsx
    level: number;
}

export interface ExamAnalysis {
    snapshot: string;
    strengths: string;
    weaknesses: string;
    tips: string[];
    verdict: string;
}

export interface ActivityLogEntry {
    id: number;
    subject: Subject;
    chapter: string;
    difficulty: Difficulty;
    bloomsLevel?: BloomsLevel;
    accuracy: number;
    marksAchieved: number;
    totalMarks: number;
    timeSpentSeconds: number;
    date: string;
}

export interface StudyPlan {
    title: string;
    overview: string;
    schedule: any[];
    motivation: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface MentorResponse {
    answer: string;
    sources?: GroundingSource[];
}

export interface MentorMessage {
    author: 'user' | 'tutor';
    text: string;
    sources?: GroundingSource[];
}

export interface HintResponse {
    hint: string;
    conceptNugget: string;
}

export interface PerformanceData {
    subject: Subject;
    topic: string;
    questionsAttempted: number;
    correctAnswers: number;
}

export interface PerformanceAnalysis {
    strengths: string[];
    weaknesses: string[];
    recommendations: {
        title: string;
        description: string;
    }[];
}

export interface Question {
    id: string;
    question: string;
    topic: string;
    marks: number;
    diagram?: string;
    solution: SolutionStep[];
}
