
import { BankQuestion, Subject, Difficulty, QuestionType, BloomsLevel } from '../types';

export const VALIDATED_QUESTIONS: BankQuestion[] = [
    // Class 10 Physics
    {
        class: 10,
        question_type: QuestionType.ShortAnswer,
        subject: Subject.Physics,
        chapter: 'Light – Reflection and Refraction',
        question_text: 'An object is placed at a distance of 10 cm from a convex mirror of focal length 15 cm. Find the position and nature of the image.',
        model_answer: 'Given: Object distance (u) = -10 cm, Focal length (f) = +15 cm (convex mirror).\nUsing the mirror formula: 1/v + 1/u = 1/f\n1/v = 1/f - 1/u\n1/v = 1/15 - 1/(-10) = 1/15 + 1/10 = (2+3)/30 = 5/30 = 1/6\nSo, v = +6 cm.\nThe image is formed 6 cm behind the mirror. Since v is positive, the image is virtual and erect. Magnification m = -v/u = -6/(-10) = 0.6. Since m < 1, the image is diminished.',
        solution_steps: [
          'Identify the given values: u = -10 cm (by convention), f = +15 cm (for convex mirror).',
          'State the mirror formula: 1/v + 1/u = 1/f.',
          'Substitute the values into the formula: 1/v = 1/15 - 1/(-10).',
          'Solve for v: 1/v = (2+3)/30 = 1/6, which gives v = +6 cm.',
          'Interpret the result: The positive sign of v indicates the image is virtual and erect, formed behind the mirror.',
          'Calculate magnification to determine size: m = -v/u = 0.6. The image is diminished.'
        ],
        marks: 3,
        examiner_tips: 'Always use the sign convention correctly for object distance, image distance, and focal length. Remember that convex mirrors always form virtual, erect, and diminished images.',
        difficulty_level: Difficulty.Medium,
        // Added blooms_level
        blooms_level: BloomsLevel.Apply,
        source_year: 2022,
        concept_tags: ['Mirror Formula', 'Convex Mirror', 'Image Formation'],
    },
    {
        class: 10,
        question_type: QuestionType.MCQ,
        subject: Subject.Physics,
        chapter: 'Electricity',
        question_text: 'What is the commercial unit of electrical energy?',
        options: ['Joule', 'Watt-hour', 'Kilowatt-hour', 'Volt-ampere'],
        correct_answer: 'Kilowatt-hour',
        explanation: 'The commercial unit of electrical energy is the kilowatt-hour (kWh), which is also known as one "unit" of electricity. 1 kWh = 3.6 x 10^6 Joules.',
        marks: 1,
        examiner_tips: 'Do not confuse the commercial unit of energy (kWh) with the SI unit of power (Watt) or the SI unit of energy (Joule).',
        difficulty_level: Difficulty.Easy,
        // Added blooms_level
        blooms_level: BloomsLevel.Remember,
        source_year: 2023,
        concept_tags: ['Electrical Energy', 'Power', 'Units'],
    },
    
    // Class 10 Chemistry
    {
        class: 10,
        question_type: QuestionType.LongAnswer,
        subject: Subject.Chemistry,
        chapter: 'Acids, Bases and Salts',
        question_text: 'What is Plaster of Paris? How is it prepared? Give one of its important uses.',
        model_answer: "Plaster of Paris is calcium sulphate hemihydrate (CaSO₄·½H₂O).\n\nPreparation: It is prepared by heating gypsum (calcium sulphate dihydrate, CaSO₄·2H₂O) at a carefully controlled temperature of 373 K (100°C) in a kiln.\nCaSO₄·2H₂O (Gypsum) --(Heat at 373K)--> CaSO₄·½H₂O (Plaster of Paris) + 1½H₂O\nIf heated above this temperature, all its water of crystallisation is lost and anhydrous calcium sulphate (CaSO₄), or 'dead burnt plaster', is formed, which does not set like Plaster of Paris.\n\nUse: It is used in hospitals for setting fractured bones in the right position to ensure correct healing. It is also used for making toys, decorative materials, and for making surfaces smooth before painting.",
        solution_steps: [
            'Define Plaster of Paris by stating its chemical name and formula (Calcium sulphate hemihydrate, CaSO₄·½H₂O).',
            'Describe the preparation process, mentioning the reactant (Gypsum), the chemical equation, and the critical temperature (373 K).',
            'Explain the importance of the specific temperature to avoid forming dead burnt plaster.',
            'State at least one valid use, such as setting fractured bones or in construction/decoration.'
        ],
        marks: 5,
        examiner_tips: 'The chemical equation with the correct state symbols and temperature condition is crucial for full marks. Make sure to specify the chemical names for both gypsum and Plaster of Paris.',
        difficulty_level: Difficulty.Medium,
        // Added blooms_level
        blooms_level: BloomsLevel.Understand,
        source_year: 2020,
        concept_tags: ['Plaster of Paris', 'Gypsum', 'Hydrated Salts'],
    },
    
    // Class 10 Biology
    {
        class: 10,
        question_type: QuestionType.ShortAnswer,
        subject: Subject.Biology,
        chapter: 'Life Processes',
        question_text: 'What are the differences between aerobic and anaerobic respiration?',
        model_answer: "1. Aerobic respiration takes place in the presence of oxygen, while anaerobic respiration takes place in the absence of oxygen.\n2. In aerobic respiration, complete oxidation of glucose occurs, producing CO₂, water, and a large amount of energy (approx. 38 ATP).\n3. In anaerobic respiration, incomplete oxidation of glucose occurs, producing ethanol and CO₂ (in yeast) or lactic acid (in muscle cells) and a small amount of energy (approx. 2 ATP).\n4. Aerobic respiration occurs in the cytoplasm and mitochondria, whereas anaerobic respiration occurs only in the cytoplasm.",
        marks: 3,
        examiner_tips: 'Use a tabular format to clearly list the differences. Key points of comparison are: presence/absence of oxygen, end products, amount of energy released, and location within the cell.',
        difficulty_level: Difficulty.Easy,
        // Added blooms_level
        blooms_level: BloomsLevel.Analyze,
        source_year: 2021,
        concept_tags: ['Aerobic Respiration', 'Anaerobic Respiration', 'Cellular Respiration'],
    },

    // Class 12 Physics
    {
        class: 12,
        question_type: QuestionType.ShortAnswer,
        subject: Subject.Physics,
        chapter: 'Electric Charges and Fields',
        question_text: 'State Gauss\'s law in electrostatics. A charge Q is enclosed by a Gaussian spherical surface of radius R. If the radius is doubled, how would the outward electric flux change?',
        model_answer: "Gauss's Law states that the total electric flux through any closed surface is equal to 1/ε₀ times the total electric charge enclosed by that surface. Mathematically, Φ = ∮ E · dA = Q_enclosed / ε₀.\n\nThe electric flux depends only on the charge enclosed by the surface (Q_enclosed) and not on the size or shape of the Gaussian surface. Therefore, if the radius of the spherical surface is doubled, the enclosed charge Q remains the same. As a result, the outward electric flux through the surface will not change.",
        solution_steps: [
            'State the definition of Gauss\'s Law clearly.',
            'Write the mathematical expression for Gauss\'s Law.',
            'Explain that flux depends only on the enclosed charge.',
            'Conclude that since the enclosed charge does not change when the radius is doubled, the flux remains unchanged.'
        ],
        marks: 2,
        examiner_tips: 'Be precise with the definition of Gauss\'s Law. When answering the second part, explicitly state that flux is independent of the geometry of the Gaussian surface.',
        difficulty_level: Difficulty.Easy,
        // Added blooms_level
        blooms_level: BloomsLevel.Remember,
        source_year: 2023,
        concept_tags: ["Gauss's Law", 'Electric Flux', 'Electrostatics'],
    },
    {
        class: 12,
        question_type: QuestionType.LongAnswer,
        subject: Subject.Physics,
        chapter: 'Electrostatic Potential and Capacitance',
        question_text: 'Derive the expression for the capacitance of a parallel plate capacitor. If a dielectric slab of dielectric constant K is inserted between the plates, how does the capacitance change?',
        model_answer: 'Consider a parallel plate capacitor with plate area A and separation d. Let +Q and -Q be the charges on the two plates. The surface charge density is σ = Q/A.\nThe electric field between the plates is uniform and is given by E = σ/ε₀ = Q/(Aε₀).\nThe potential difference between the plates is V = E * d = (Qd)/(Aε₀).\nCapacitance C is defined as C = Q/V. Substituting V, we get C = Q / [(Qd)/(Aε₀)] = (Aε₀)/d. This is the capacitance in a vacuum or air.\n\nWhen a dielectric slab of dielectric constant K is inserted, the electric field between the plates is reduced to E\' = E/K. The new potential difference is V\' = E\' * d = (Ed)/K = V/K.\nThe new capacitance C\' = Q/V\' = Q/(V/K) = K * (Q/V) = K * C.\nThus, the capacitance increases by a factor of K.',
        solution_steps: [
            'Start with the basic setup of a parallel plate capacitor (Area A, distance d, charge Q).',
            'Write the formula for the electric field E between the plates in terms of surface charge density σ and permittivity ε₀.',
            'Calculate the potential difference V using V = E * d.',
            'Use the definition of capacitance C = Q/V to derive the expression C = (Aε₀)/d.',
            'Explain the effect of a dielectric slab on the electric field (E\' = E/K).',
            'Calculate the new potential difference V\' and the new capacitance C\'.',
            'Conclude that the capacitance increases K times.'
        ],
        marks: 5,
        examiner_tips: 'The derivation must be step-by-step. Clearly define all variables used. When explaining the effect of the dielectric, show how it affects the potential difference to arrive at the final expression for the new capacitance.',
        difficulty_level: Difficulty.HOTS,
        // Added blooms_level
        blooms_level: BloomsLevel.Analyze,
        source_year: 2022,
        concept_tags: ['Capacitance', 'Parallel Plate Capacitor', 'Dielectrics', 'Derivation'],
    },
    
    // Class 12 Chemistry
    {
        class: 12,
        question_type: QuestionType.ShortAnswer,
        subject: Subject.Chemistry,
        chapter: 'Solutions',
        question_text: "State Henry's Law and mention two of its applications.",
        model_answer: "Henry's Law states that at a constant temperature, the solubility of a gas in a liquid is directly proportional to the partial pressure of the gas present above the surface of the liquid or solution. Mathematically, p = K_H * x, where p is the partial pressure of the gas, x is the mole fraction of the gas in the solution, and K_H is Henry's law constant.\n\nApplications:\n1. To increase the solubility of CO₂ in soft drinks and soda water, the bottles are sealed under high pressure.\n2. Scuba divers use air diluted with helium to avoid 'the bends', a painful condition caused by nitrogen bubbles forming in the blood when a diver ascends too quickly. Helium has lower solubility in blood than nitrogen.",
        marks: 3,
        examiner_tips: "The definition must include the condition 'at a constant temperature' and the direct proportionality between solubility and partial pressure. Applications should be practical and clearly explained.",
        difficulty_level: Difficulty.Medium,
        // Added blooms_level
        blooms_level: BloomsLevel.Understand,
        source_year: 2023,
        concept_tags: ["Henry's Law", 'Gas Solubility', 'Solutions'],
    },
    
    // Class 12 Maths
    {
        class: 12,
        question_type: QuestionType.LongAnswer,
        subject: Subject.Mathematics,
        chapter: 'Inverse Trigonometric Functions',
        question_text: "Prove that tan⁻¹( (√(1+x) - √(1-x)) / (√(1+x) + √(1-x)) ) = π/4 - (1/2)cos⁻¹(x), for -1/√2 ≤ x ≤ 1.",
        model_answer: "Let x = cos(2θ). Then 2θ = cos⁻¹(x), so θ = (1/2)cos⁻¹(x).\nNow substitute x = cos(2θ) into the expression.\nWe know that 1 + cos(2θ) = 2cos²(θ) and 1 - cos(2θ) = 2sin²(θ).\nSo, √(1+x) = √(2cos²(θ)) = √2 |cos(θ)| and √(1-x) = √(2sin²(θ)) = √2 |sin(θ)|.\nSince -1/√2 ≤ x ≤ 1, we have -1/√2 ≤ cos(2θ) ≤ 1. This implies 0 ≤ 2θ ≤ 3π/4, so 0 ≤ θ ≤ 3π/8. In this interval, both cos(θ) and sin(θ) are positive.\n\nThe expression becomes:\ntan⁻¹( (√2 cos(θ) - √2 sin(θ)) / (√2 cos(θ) + √2 sin(θ)) )\n= tan⁻¹( (cos(θ) - sin(θ)) / (cos(θ) + sin(θ)) )\nDivide numerator and denominator by cos(θ):\n= tan⁻¹( (1 - tan(θ)) / (1 + tan(θ)) )\nThis is in the form of tan(A-B). We can write 1 = tan(π/4).\n= tan⁻¹( (tan(π/4) - tan(θ)) / (1 + tan(π/4)tan(θ)) )\n= tan⁻¹( tan(π/4 - θ) )\n= π/4 - θ\nNow substitute back θ = (1/2)cos⁻¹(x).\n= π/4 - (1/2)cos⁻¹(x). Hence Proved.",
        solution_steps: [
            'Use the substitution x = cos(2θ) to simplify the terms under the square roots.',
            'Apply the trigonometric identities 1+cos(2A) = 2cos²(A) and 1-cos(2A) = 2sin²(A).',
            'Simplify the expression inside tan⁻¹ by canceling common factors.',
            'Divide the numerator and denominator by cos(θ) to get the expression in terms of tan(θ).',
            "Recognize the formula for tan(A-B) by substituting 1 = tan(π/4).",
            'Simplify tan⁻¹(tan(...)) to get π/4 - θ.',
            'Substitute the value of θ back in terms of x to get the final result.'
        ],
        marks: 5,
        examiner_tips: 'The key to solving this problem is the initial substitution x = cos(2θ). Always remember to state the valid range for θ based on the given domain of x.',
        difficulty_level: Difficulty.HOTS,
        // Added blooms_level
        blooms_level: BloomsLevel.Create,
        source_year: 2019,
        concept_tags: ['Inverse Trigonometry', 'Trigonometric Identities', 'Proof'],
    }
];
