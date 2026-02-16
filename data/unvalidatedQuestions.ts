
import { BankQuestion, Subject, Difficulty, QuestionType, BloomsLevel } from '../types';

export const UNVALIDATED_QUESTIONS: BankQuestion[] = [
    {
        class: 10,
        question_type: QuestionType.ShortAnswer,
        subject: Subject.Chemistry,
        chapter: 'Chemical Reactions and Equations',
        question_text: 'Why is respiration considered an exothermic reaction? Explain.',
        // AI-generated answer, looks good but could be refined.
        model_answer: 'Respiration is the process where glucose combines with oxygen in the cells of our body to form carbon dioxide and water, along with the release of energy. Since energy is released during this process, it is considered an exothermic reaction. The energy released is stored in the form of ATP molecules. The equation is: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy.',
        solution_steps: [
            "Define respiration as the breakdown of glucose.",
            "State that this process releases energy.",
            "Define an exothermic reaction as one that releases energy.",
            "Conclude that because respiration releases energy, it is exothermic.",
            "Provide the balanced chemical equation for respiration."
        ],
        marks: 3,
        examiner_tips: 'Make sure to write the balanced chemical equation. It is very important.', // A bit generic, SME can improve this.
        difficulty_level: Difficulty.Medium,
        // Added blooms_level
        blooms_level: BloomsLevel.Understand,
        source_year: 2021,
        concept_tags: ['Respiration', 'Exothermic Reaction', 'Biochemistry'],
    },
    {
        class: 12,
        question_type: QuestionType.MCQ,
        subject: Subject.Physics,
        chapter: 'Electric Charges and Fields',
        question_text: 'The force between two small charged spheres having charges of 2 x 10⁻⁷ C and 3 x 10⁻⁷ C placed 30 cm apart in air is:',
        // Plausible AI-generated options and answer.
        options: ['6 x 10⁻³ N', '6 x 10⁻² N', '5 x 10⁻³ N', '5 x 10⁻² N'],
        correct_answer: '6 x 10⁻³ N',
        explanation: "Using Coulomb's Law, F = k * |q1*q2| / r². Given q1 = 2e-7 C, q2 = 3e-7 C, r = 0.3 m, and k = 9e9 Nm²/C². F = (9e9 * 2e-7 * 3e-7) / (0.3)². F = (54e-5) / 0.09 = 600e-5 = 6e-3 N.",
        marks: 1,
        examiner_tips: "Remember to convert the distance from centimeters to meters before using it in the Coulomb's Law formula. This is a common mistake.",
        difficulty_level: Difficulty.Easy,
        // Added blooms_level
        blooms_level: BloomsLevel.Apply,
        source_year: 2020,
        concept_tags: ["Coulomb's Law", 'Electrostatic Force', 'Point Charges'], // AI might miss a tag like 'Calculation'.
    },
    {
        class: 10,
        question_type: QuestionType.LongAnswer,
        subject: Subject.Biology,
        chapter: 'Control and Coordination',
        question_text: 'What is a neuron? Describe its structure with a neat labeled diagram.',
        // The model_answer is missing the diagram description, a perfect task for an SME.
        model_answer: 'A neuron or nerve cell is the structural and functional unit of the nervous system. It is a microscopic structure composed of three major parts, namely, cell body, dendrites, and axon.\nThe cell body contains cytoplasm with typical cell organelles and certain granular bodies called Nissl’s granules. Dendrites are short fibres which branch repeatedly and project out of the cell body. They transmit electrical impulses towards the cell body. The axon is a long fibre that transmits impulses away from the cell body to another neuron or a muscle.',
        solution_steps: [
          "Define a neuron as the basic unit of the nervous system.",
          "List the three main parts: cell body, dendrites, and axon.",
          "Describe the cell body (soma) and its contents like Nissl's granules.",
          "Describe dendrites and their function.",
          "Describe the axon and its function.",
          "A neat, labeled diagram is required showing these parts."
        ],
        marks: 5,
        examiner_tips: 'A diagram is essential for this question. Ensure all parts like the nucleus, cell body, dendrites, axon, and axon terminal are clearly labeled for full marks.',
        difficulty_level: Difficulty.Medium,
        // Added blooms_level
        blooms_level: BloomsLevel.Understand,
        source_year: 2019,
        concept_tags: ['Neuron', 'Nervous System', 'Cell Structure'], // Could add 'Diagrammatic Question'.
    }
];
