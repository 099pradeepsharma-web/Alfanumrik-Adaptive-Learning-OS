
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Subject, Difficulty, QuestionType, BankQuestion, ActivityLogEntry, Chapter, MasterySummary, FocusMode, UserProfile, HintResponse, RevisionItem, BloomsLevel } from '../types';
import { CHAPTERS } from '../constants';
import { SparklesIcon, CheckCircleIcon, LightBulbIcon, TimerIcon, XCircleIcon, ArrowRightIcon, TrophyIcon, StarIcon, PlusCircleIcon, TargetIcon, TrendingUpIcon, TrendingDownIcon, PenIcon } from './icons/Icons';
import { generatePracticeQuestion, generateHint } from '../services/geminiService';

interface PracticeZoneProps {
    logActivity: (entry: Omit<ActivityLogEntry, 'id' | 'date'>) => void;
    masterySummary: MasterySummary;
    profile: UserProfile;
    onToggleRevision: (q: BankQuestion) => void;
    revisionSet: RevisionItem[];
}

const BLOOMS_LEVELS = Object.values(BloomsLevel);

const PracticeZone: React.FC<PracticeZoneProps> = ({ logActivity, masterySummary, profile, onToggleRevision, revisionSet }) => {
    const { grade, selectedSubjects } = profile;
    
    const [isAdaptiveMode, setIsAdaptiveMode] = useState(true);
    const [focusMode, setFocusMode] = useState<FocusMode>(FocusMode.General);
    
    const availableSubjects = useMemo(() => {
        const gradeSubjects = Object.keys(CHAPTERS[grade] || {}) as Subject[];
        return selectedSubjects.length > 0 
            ? selectedSubjects.filter(s => gradeSubjects.includes(s))
            : gradeSubjects;
    }, [grade, selectedSubjects]);

    const [subject, setSubject] = useState<Subject>(availableSubjects[0] || Subject.Physics);
    const [chapterFilter, setChapterFilter] = useState<string>('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
    const [targetBlooms, setTargetBlooms] = useState<BloomsLevel>(BloomsLevel.Understand);
    
    const [question, setQuestion] = useState<BankQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    
    const [streak, setStreak] = useState(0);
    const [sessionXP, setSessionXP] = useState(0);
    const [questionsSolved, setQuestionsSolved] = useState(0);
    const [questionTimer, setQuestionTimer] = useState(0);
    const [hint, setHint] = useState<HintResponse | null>(null);
    const [isHintLoading, setIsHintLoading] = useState(false);
    
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const chapters = useMemo(() => CHAPTERS[grade]?.[subject] || [], [grade, subject]);
    const chapterName = useMemo(() => chapters.find(c => c.id === chapterFilter)?.name || '', [chapters, chapterFilter]);

    useEffect(() => {
        if (question && !isAnswered) {
            setQuestionTimer(0);
            timerIntervalRef.current = setInterval(() => setQuestionTimer(prev => prev + 1), 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
    }, [question, isAnswered]);

    const getQuestion = useCallback(async () => {
        setQuestion(null);
        setSelectedOption(null);
        setSubjectiveAnswer('');
        setIsAnswered(false);
        setError(null);
        setHint(null);
        setIsLoading(true);

        try {
            const newQuestion = await generatePracticeQuestion(grade, subject, chapterName, difficulty);
            newQuestion.class = grade;
            setQuestion(newQuestion);
        } catch (err) {
            setError("Pedagogical engine recalibrating...");
        } finally {
            setIsLoading(false);
        }
    }, [grade, subject, chapterName, difficulty]);

    const handleCheckAnswer = () => {
        if (!question || isAnswered) return;
        setIsAnswered(true);
        const isCorrect = question.question_type === QuestionType.MCQ ? selectedOption === question.correct_answer : subjectiveAnswer.length > 10;
        
        if (isCorrect) {
            setStreak(prev => prev + 1);
            setSessionXP(prev => prev + (question.marks || 1) * 10);
            setQuestionsSolved(prev => prev + 1);
        } else {
            setStreak(0);
        }

        logActivity({
            subject: question.subject,
            chapter: question.chapter,
            difficulty: question.difficulty_level,
            bloomsLevel: question.blooms_level,
            accuracy: isCorrect ? 100 : 0,
            marksAchieved: isCorrect ? (question.marks || 1) : 0,
            totalMarks: question.marks || 1,
            timeSpentSeconds: questionTimer
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 relative animate-fade-in">
            {/* Session Stats Bar */}
            <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="text-xs font-black uppercase text-gray-500">Streak: <span className="text-indigo-600">{streak}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrophyIcon className="h-5 w-5 text-indigo-500" />
                        <span className="text-xs font-black uppercase text-gray-500">XP: <span className="text-indigo-600">+{sessionXP}</span></span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <TimerIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-mono font-bold text-gray-600">{Math.floor(questionTimer/60)}:{(questionTimer%60).toString().padStart(2,'0')}</span>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">Cognitive Practice</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bloom's Scaffolding Active</p>
                    </div>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        <button onClick={() => setIsAdaptiveMode(true)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAdaptiveMode ? 'bg-white shadow-md text-indigo-700' : 'text-gray-400'}`}>Adaptive (FSRS)</button>
                        <button onClick={() => setIsAdaptiveMode(false)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isAdaptiveMode ? 'bg-white shadow-md text-indigo-700' : 'text-gray-400'}`}>Manual</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cognitive Level</label>
                        <select disabled={isAdaptiveMode} value={targetBlooms} onChange={(e) => setTargetBlooms(e.target.value as BloomsLevel)} className="w-full bg-gray-50 border-none rounded-2xl p-3.5 text-xs font-black text-indigo-800 appearance-none">
                            {BLOOMS_LEVELS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complexity</label>
                        <select disabled={isAdaptiveMode} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full bg-gray-50 border-none rounded-2xl p-3.5 text-xs font-black appearance-none">
                            {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Curriculum Unit</label>
                        <select disabled={isAdaptiveMode} value={chapterFilter} onChange={(e) => setChapterFilter(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl p-3.5 text-xs font-black appearance-none">
                            {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={getQuestion} disabled={isLoading || chapters.length === 0} className="w-full bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] hover:bg-indigo-800 shadow-xl disabled:opacity-50 uppercase tracking-[0.15em] text-sm">
                    {isLoading ? "Analyzing Knowledge Traces..." : "Deploy Cognitive Sprint"}
                </button>
            </div>

            {question && (
                <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-sm border border-gray-200 animate-slide-up">
                    <div className="flex justify-between items-center mb-10">
                         <div className="flex gap-2">
                            <span className="text-[10px] font-black tracking-widest text-indigo-700 uppercase bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">{question.blooms_level}</span>
                            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">{question.marks} MARKS</span>
                        </div>
                        <button onClick={() => onToggleRevision(question)} className="p-3 rounded-full hover:bg-indigo-50 transition-colors">
                            <StarIcon className="h-6 w-6 text-gray-300 hover:text-indigo-600" />
                        </button>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-10">{question.question_text}</h2>

                    {question.question_type === QuestionType.MCQ ? (
                        <div className="grid grid-cols-1 gap-4">
                            {question.options?.map((opt, i) => (
                                <button key={i} disabled={isAnswered} onClick={() => setSelectedOption(opt)} className={`text-left p-6 rounded-3xl border-2 transition-all font-bold ${selectedOption === opt ? 'border-indigo-600 bg-indigo-50' : 'border-gray-50 hover:border-indigo-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border-2 text-sm font-black ${selectedOption === opt ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-400'}`}>{String.fromCharCode(65 + i)}</div>
                                        <span className="flex-1 text-sm">{opt}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <textarea value={subjectiveAnswer} onChange={(e) => setSubjectiveAnswer(e.target.value)} disabled={isAnswered} placeholder="Articulate your thought process here..." className="w-full h-48 p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl font-medium text-gray-800 placeholder-gray-300" />
                    )}

                    {!isAnswered ? (
                        <div className="mt-12 flex gap-4">
                            <button onClick={handleCheckAnswer} disabled={isLoading || (question.question_type === QuestionType.MCQ && !selectedOption)} className="flex-1 bg-green-600 text-white font-black py-5 rounded-[1.5rem] shadow-lg uppercase tracking-widest text-sm">Verify Stability</button>
                            <button onClick={getQuestion} className="px-10 py-5 bg-gray-50 text-gray-400 font-black rounded-[1.5rem] uppercase tracking-widest text-xs">Skip</button>
                        </div>
                    ) : (
                        <div className="mt-12 p-8 bg-indigo-900 text-white rounded-[2.5rem] shadow-2xl space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300">Pedagogical Resolution</h3>
                            <p className="text-lg leading-relaxed font-medium text-indigo-50">{question.explanation || question.model_answer}</p>
                            <button onClick={getQuestion} className="w-full py-5 bg-white text-indigo-900 font-black rounded-2xl uppercase tracking-widest text-sm">Deploy Next Challenge</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PracticeZone;
