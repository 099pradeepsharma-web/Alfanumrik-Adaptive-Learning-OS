
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Subject, BankQuestion, Difficulty, RevisionItem } from '../types';
import { DatabaseIcon, CheckCircleIcon, StarIcon, TagIcon, SparklesIcon, LightBulbIcon, PlusCircleIcon, XCircleIcon, ExclamationTriangleIcon } from './icons/Icons';
import { VALIDATED_QUESTIONS } from '../data/validatedQuestions';

const REPORT_REASONS = [
    "Incorrect Answer",
    "Typo/Formatting Error",
    "Out of Syllabus",
    "Broken Diagram",
    "Other"
];

// Memoized QuestionCard to prevent unnecessary re-renders when parent state updates
const QuestionCard = React.memo(({ question, isAdded, onToggle }: { question: BankQuestion, isAdded: boolean, onToggle: (q: BankQuestion) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        onToggle(question);
        setToastMessage({
            text: !isAdded ? "Added to Revision Set!" : "Removed from Revision",
            type: !isAdded ? 'success' : 'info'
        });
    };

    const handleReport = (reason: string) => {
        setIsReporting(false);
        setToastMessage({
            text: "Report submitted for review!",
            type: 'success'
        });
        console.log(`Question Reported: "${question.question_text.substring(0, 50)}..." Reason: ${reason}`);
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 relative overflow-hidden ${isAdded ? 'border-indigo-300 ring-1 ring-indigo-100 shadow-indigo-50 shadow-md' : 'border-gray-200'}`}>
            {/* Toast Notification Overlay */}
            {toastMessage && (
                <div className="absolute top-0 left-0 w-full h-full z-40 bg-white/95 backdrop-blur-[2px] flex items-center justify-center animate-fade-in pointer-events-none">
                    <div className={`px-6 py-2 rounded-full shadow-lg flex items-center gap-2 transform transition-all duration-300 ${
                        toastMessage.type === 'success' ? 'bg-indigo-700 text-white' : 
                        toastMessage.type === 'error' ? 'bg-red-600 text-white' : 
                        'bg-gray-700 text-white'
                    }`}>
                        {toastMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5 text-green-300" /> : <XCircleIcon className="h-5 w-5 text-red-200" />}
                        <span className="font-black text-sm uppercase tracking-wider">{toastMessage.text}</span>
                    </div>
                </div>
            )}

            {/* Reporting Interface Overlay */}
            {isReporting && (
                <div className="absolute inset-0 z-30 bg-white p-6 animate-fade-in flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-4 w-4" /> Report Problem
                        </h3>
                        <button onClick={() => setIsReporting(false)} className="text-gray-400 hover:text-gray-600">
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 font-medium">Why are you reporting this question? This helps our SME team verify accuracy.</p>
                    <div className="space-y-2">
                        {REPORT_REASONS.map(reason => (
                            <button 
                                key={reason}
                                onClick={() => handleReport(reason)}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-700 rounded-lg border border-gray-100 transition-colors"
                            >
                                {reason}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="w-full text-left p-4 md:p-6 focus:outline-none focus:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        <div className="flex items-center gap-2 mb-1">
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                question.subject === Subject.Physics ? 'bg-blue-100 text-blue-700' :
                                question.subject === Subject.Chemistry ? 'bg-green-100 text-green-700' :
                                question.subject === Subject.Biology ? 'bg-red-100 text-red-700' :
                                'bg-purple-100 text-purple-700'
                             }`}>
                                {question.subject}
                             </span>
                             {isAdded && (
                                 <span className="flex items-center text-[10px] font-bold text-indigo-600 uppercase animate-pulse">
                                     <StarIcon className="h-3 w-3 mr-1 fill-current" /> Spaced Repetition Active
                                 </span>
                             )}
                        </div>
                        <p className="font-semibold text-gray-800 leading-relaxed">{question.question_text}</p>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{question.marks} Marks</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{question.chapter}</span>
                             <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Year: {question.source_year}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={handleToggle}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all border group w-32 justify-center
                                ${isAdded 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                        >
                            {isAdded ? (
                                <><StarIcon className="h-4 w-4 fill-current" /> Scheduled</>
                            ) : (
                                <><PlusCircleIcon className="h-4 w-4 group-hover:rotate-90 transition-transform" /> Save</>
                            )}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); setIsReporting(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all border w-32 justify-center bg-white text-gray-400 border-gray-100 hover:border-red-200 hover:text-red-500"
                        >
                            <ExclamationTriangleIcon className="h-4 w-4" /> Report
                        </button>
                        
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50/50 animate-fade-in">
                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                       <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" /> Model Answer
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                        {question.model_answer}
                    </div>
                     <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <h4 className="font-semibold text-indigo-800 flex items-center"><LightBulbIcon className="h-4 w-4 mr-1.5" />Examiner's Tips</h4>
                        <p className="text-sm text-indigo-700 mt-1">{question.examiner_tips}</p>
                    </div>
                </div>
            )}
        </div>
    );
});

QuestionCard.displayName = 'QuestionCard';

const availableYears = [2023, 2022, 2021, 2020, 2019];
const PAGE_SIZE = 10;

const ExamArchive: React.FC<{ profile: any, revisionSet: RevisionItem[], onToggleRevision: (q: BankQuestion) => void }> = ({ profile, revisionSet, onToggleRevision }) => {
    const userGrade = profile?.grade || 10;
    const [grade, setGrade] = useState<number>(userGrade);
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(profile?.selectedSubjects || [Subject.Physics]);
    const [selectedYears, setSelectedYears] = useState<number[]>([2023]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paper, setPaper] = useState<BankQuestion[] | null>(null);
    const [allConcepts, setAllConcepts] = useState<string[]>([]);
    const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'year' | 'marks' | 'difficulty'>('year');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const observerTarget = useRef<HTMLDivElement>(null);

    const handleSubjectToggle = (subj: Subject) => {
        setSelectedSubjects(prev =>
            prev.includes(subj)
            ? prev.filter(s => s !== subj)
            : [...prev, subj]
        );
    };

    const handleYearToggle = (year: number) => {
        setSelectedYears(prev =>
            prev.includes(year)
            ? prev.filter(y => y !== year)
            : [...prev, year]
        );
    };
    
    const handleGeneratePaper = useCallback(async () => {
        if (selectedSubjects.length === 0) {
            setError("Please select at least one subject.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setPaper(null);
        setAllConcepts([]);
        setSelectedConcepts([]);
        setVisibleCount(PAGE_SIZE); // Reset pagination on new search

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const combinedPaper = VALIDATED_QUESTIONS.filter(q =>
                q.class === grade &&
                selectedSubjects.includes(q.subject) &&
                (selectedYears.length === 0 || selectedYears.includes(q.source_year))
            );

            if (combinedPaper.length === 0) {
                 setError(`No questions found matching these filters for Class ${grade}. Try expanding your search.`);
                 setPaper([]);
            } else {
                setPaper(combinedPaper);
                const concepts = new Set<string>();
                combinedPaper.forEach(q => {
                    q.concept_tags?.forEach(tag => concepts.add(tag));
                });
                setAllConcepts(Array.from(concepts).sort());
            }

        } catch (err) {
            setError('An error occurred while fetching exam questions.');
        } finally {
            setIsLoading(false);
        }
    }, [grade, selectedSubjects, selectedYears]);
    
    const handleConceptToggle = (concept: string) => {
        setSelectedConcepts(prev => 
            prev.includes(concept) 
            ? prev.filter(c => c !== concept) 
            : [...prev, concept]
        );
        setVisibleCount(PAGE_SIZE); // Reset pagination on filter change
    };

    const filteredAndSortedPaper = useMemo(() => {
        if (!paper) return [];
        let filtered = paper;
        if (selectedConcepts.length > 0) {
            filtered = paper.filter(question => 
                question.concept_tags?.some(tag => selectedConcepts.includes(tag))
            );
        }
        const sorted = [...filtered];
        const difficultyOrder = {
            [Difficulty.HOTS]: 4, [Difficulty.Hard]: 3, [Difficulty.Medium]: 2, [Difficulty.Easy]: 1,
        };
        switch (sortOrder) {
            case 'marks': sorted.sort((a, b) => (b.marks || 0) - (a.marks || 0)); break;
            case 'year': sorted.sort((a, b) => b.source_year - a.source_year); break;
            case 'difficulty': sorted.sort((a, b) => (difficultyOrder[b.difficulty_level] || 0) - (difficultyOrder[a.difficulty_level] || 0)); break;
        }
        return sorted;
    }, [paper, selectedConcepts, sortOrder]);

    const displayedQuestions = useMemo(() => {
        return filteredAndSortedPaper.slice(0, visibleCount);
    }, [filteredAndSortedPaper, visibleCount]);

    // Intersection Observer for Infinite Loading (Fast Loading Pattern)
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && visibleCount < filteredAndSortedPaper.length) {
                    setVisibleCount(prev => prev + PAGE_SIZE);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [visibleCount, filteredAndSortedPaper.length]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                 <div className="flex items-center mb-6">
                    <DatabaseIcon className="h-8 w-8 text-indigo-700 mr-3" />
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">CBSE Exam Archive</h1>
                        <p className="text-sm text-gray-500 font-medium">Class {grade} Question Discovery Engine</p>
                    </div>
                </div>
                
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Subject Selection</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(Subject).map(subj => {
                                    const isSelected = selectedSubjects.includes(subj);
                                    return (
                                        <button key={subj} onClick={() => handleSubjectToggle(subj)} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${isSelected ? 'bg-indigo-700 text-white border-indigo-700 shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'}`}>
                                            {subj}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Year Range</label>
                            <div className="flex flex-wrap gap-2">
                                {availableYears.map(year => {
                                    const isSelected = selectedYears.includes(year);
                                    return (
                                        <button key={year} onClick={() => handleYearToggle(year)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${isSelected ? 'bg-indigo-700 text-white border-indigo-700 shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'}`}>
                                            {year}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="mt-10">
                    <button onClick={handleGeneratePaper} disabled={isLoading} className="w-full bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-lg tracking-widest uppercase">
                        {isLoading ? <><div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" /> Searching Archive...</> : <><SparklesIcon className="h-6 w-6"/> Assemble Practice Set</>}
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 text-center p-4 rounded-xl border border-red-100 font-bold animate-fade-in">{error}</div>}
             
            {paper && (
                <div className="space-y-6 animate-fade-in pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allConcepts.length > 0 && (
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Focus by Concept</h3>
                                <div className="flex flex-wrap gap-2">
                                    {allConcepts.map(concept => (
                                        <button key={concept} onClick={() => handleConceptToggle(concept)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${selectedConcepts.includes(concept) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200'}`}>{concept}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Sort Optimization</h3>
                            <div className="flex flex-wrap gap-2">
                                 {['year', 'marks', 'difficulty'].map(opt => (
                                     <button key={opt} onClick={() => setSortOrder(opt as any)} className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all border uppercase tracking-widest ${ sortOrder === opt ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200' }`}>{opt}</button>
                                 ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {displayedQuestions.map((q, index) => (
                            <QuestionCard 
                                key={`${q.source_year}-${q.chapter}-${index}`} 
                                question={q} 
                                isAdded={!!revisionSet.find(item => item.question.question_text === q.question_text)} 
                                onToggle={onToggleRevision} 
                            />
                        ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    {visibleCount < filteredAndSortedPaper.length && (
                        <div ref={observerTarget} className="h-20 flex items-center justify-center">
                            <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                        </div>
                    )}
                    
                    {paper.length > 0 && visibleCount >= filteredAndSortedPaper.length && (
                        <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-8">
                            Reached the end of the archive
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExamArchive;
