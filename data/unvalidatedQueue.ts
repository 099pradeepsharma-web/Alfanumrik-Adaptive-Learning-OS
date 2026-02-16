
import { BankQuestion, Subject, Difficulty, QuestionType, BloomsLevel } from '../types';

export const UNVALIDATED_QUESTIONS: BankQuestion[] = [
    {
        class: 10,
        question_type: QuestionType.ShortAnswer,
        subject: Subject.Biology,
        chapter: 'Life Processes',
        question_text: 'Explain the function of xylem and phloem in plants.',
        model_answer: 'Xylem transports water and minerals from roots to leaves. Phloem transports food (glucose) from leaves to all parts of the plant.',
        marks: 3,
        examiner_tips: 'Focus on bidirectional vs unidirectional flow.',
        difficulty_level: Difficulty.Medium,
        // Added blooms_level
        blooms_level: BloomsLevel.Understand,
        source_year: 2022,
        concept_tags: ['Transportation', 'Plant Physiology']
    },
    {
        class: 12,
        question_type: QuestionType.MCQ,
        subject: Subject.Chemistry,
        chapter: 'Solutions',
        question_text: 'Which of the following is a colligative property?',
        options: ['Vapour pressure', 'Boiling point', 'Osmotic pressure', 'Freezing point'],
        correct_answer: 'Osmotic pressure',
        explanation: 'Colligative properties depend only on the number of solute particles, not their nature.',
        marks: 1,
        examiner_tips: 'Common confusion: Boiling point is NOT a colligative property, but Elevation of Boiling Point IS.',
        difficulty_level: Difficulty.Medium,
        // Added blooms_level
        blooms_level: BloomsLevel.Apply,
        source_year: 2023,
        concept_tags: ['Colligative Properties', 'Raoults Law']
    }
];
