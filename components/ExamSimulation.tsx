
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Subject, Question, ExamAnalysis, BankQuestion, ActivityLogEntry } from '../types';
import { getExamAnalysis, generateSimulationPaper } from '../services/geminiService';
import { VALIDATED_QUESTIONS } from '../data/validatedQuestions';
import { TimerIcon, SparklesIcon, CheckCircleIcon, TrophyIcon, ArrowLeftIcon, ArrowRightIcon, TrendingUpIcon, TrendingDownIcon, LightBulbIcon, XCircleIcon } from './icons/Icons';
import SolutionDisplay from './SolutionDisplay';

type ExamStatus = 'setup' | 'loading' | 'in-progress' | 'submitting' | 'completed';

interface ExamSimulationProps {
    grade: number;
    logActivity: (entry: Omit<ActivityLogEntry, 'id' | 'date'>) => void;
}

const ExamSimulation: React.FC<ExamSimulationProps> = ({ grade, logActivity }) => {
    const [status, setStatus] = useState<ExamStatus>('setup');
    const [subject, setSubject] = useState<Subject>(Subject.Physics);
    const [duration, setDuration] = useState<number>(60);
    const [numQuestions, setNumQuestions] = useState<number>(20);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<ExamAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleStartExam = useCallback(async () => {
        setStatus('loading');
        setError(null);
        setExpandedQuestion(null);
        
        try {
            const paper = await generateSimulationPaper(grade, subject, numQuestions);
            
            if (!paper || paper.length === 0) {
                throw new Error("Could not generate a valid exam paper.");
            }

            setQuestions(paper);
            setUserAnswers(new Array(paper.length).fill(''));
            setTimeLeft(duration * 60);
            setCurrentQuestionIndex(0);
            setStatus('in-progress');
        } catch (err: any) {
            console.warn("AI Generation failed, falling back to local bank:", err.message);
            
            try {
                const questionPool = VALIDATED_QUESTIONS.filter(q => q.class === grade && q.subject === subject);
                
                if (questionPool.length === 0) {
                     throw new Error(`No local questions found for Class ${grade} ${subject}.`);
                }

                const limit = Math.min(numQuestions, questionPool.length);
                const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
                const selectedQuestions: BankQuestion[] = shuffled.slice(0, limit);

                const paper: Question[] = selectedQuestions.map((q, index) => ({
                    id: `local-${q.source_year}-${q.subject}-${index}`,
                    question: q.question_text,
                    topic: q.chapter,
                    marks: q.marks || 0,
                    solution: q.solution_steps?.map((step_text, i) => ({
                        step: i + 1,
                        explanation: step_text,
                        marks: Math.ceil((q.marks || 0) / (q.solution_steps?.length || 1)),
                    })) || [],
                }));

                setQuestions(paper);
                setUserAnswers(new Array(paper.length).fill(''));
                setTimeLeft(duration * 60);
                setCurrentQuestionIndex(0);
                setStatus('in-progress');
            } catch (fallbackErr: any) {
                setError("Unable to start simulation for this subject. AI service is overwhelmed.");
                setStatus('setup');
            }
        }
    }, [grade, subject, numQuestions, duration]);

    const handleSubmitExam = useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('submitting');
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await getExamAnalysis(grade, questions, userAnswers);
            setAnalysisResult(result);
            setStatus('completed');
        } catch (err) {
            setError('Simulation complete! Review the solutions below.');
            setStatus('completed');
        }
    }, [grade, questions, userAnswers]);

    useEffect(() => {
        if (status === 'in-progress') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        handleSubmitExam();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, handleSubmitExam]);

    const handleAnswerChange = (answer: string) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentQuestionIndex] = answer;
            return newAnswers;
        });
    };
    
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const renderSetup = () => (
        <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-50 rounded-full">
                        <TimerIcon className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Class {grade} Board Simulation</h1>
                <p className="text-gray-500 mt-2 mb-8">Timed practice for your upcoming Class {grade} board exams. Experience full-length papers.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900">
                             {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                        <select id="duration" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900">
                            <option value={30}>30 Minutes</option>
                            <option value={60}>60 Minutes</option>
                            <option value={120}>120 Minutes</option>
                            <option value={180}>Full Exam (180)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="questions" className="block text-sm font-medium text-gray-700">No. of Questions</label>
                        <select id="questions" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900">
                            <option value={10}>10 Questions</option>
                            <option value={20}>20 Questions</option>
                            <option value={35}>Full Paper Pattern</option>
                        </select>
                    </div>
                </div>
                <div className="mt-8">
                    <button onClick={handleStartExam} className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center justify-center text-lg">
                        <SparklesIcon className="h-6 w-6 mr-2" />
                        Generate Class {grade} Paper
                    </button>
                </div>
            </div>
            {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
        </div>
    );
    
    const renderInProgress = () => {
        const question = questions[currentQuestionIndex];
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Question {currentQuestionIndex + 1} of {questions.length}</p>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">{question.marks} Marks</span>
                     </div>
                     <h2 className="text-xl font-semibold text-gray-800 mt-1 mb-6 leading-relaxed">{question.question}</h2>
                    <div className="relative">
                        <textarea
                            className="w-full h-80 p-4 border border-gray-300 rounded-md shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-serif text-lg leading-relaxed text-gray-900"
                            placeholder="Write your answer..."
                            value={userAnswers[currentQuestionIndex]}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-4">
                     <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 text-center">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Time Remaining</p>
                        <p className={`text-4xl font-mono font-bold mt-1 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>{formatTime(timeLeft)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 text-center text-sm uppercase">Navigator</h3>
                        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`h-10 w-full rounded-md font-bold text-sm transition-all transform hover:scale-105 ${
                                        index === currentQuestionIndex 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : userAnswers[index] 
                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleSubmitExam} className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-700 transition-all text-lg flex items-center justify-center gap-2">
                        <CheckCircleIcon className="h-5 w-5" /> Submit Sheet
                    </button>
                </div>
            </div>
        );
    };
    
    const renderResults = () => (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                <div className="flex justify-center mb-4">
                    <TrophyIcon className="h-16 w-16 text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Exam Results</h1>
                <p className="text-gray-500 mt-2 mb-6">Class {grade} {subject} simulation complete.</p>
                {analysisResult && (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                                <SparklesIcon className="h-6 w-6 mr-2 text-blue-500" /> 
                                AI Performance Snapshot
                            </h2>
                            <p className="text-gray-700 font-medium bg-blue-50 p-4 rounded-md border border-blue-100">
                                {analysisResult.snapshot}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-green-50 rounded-lg border border-green-200">
                                <h3 className="font-bold text-green-800 flex items-center mb-3">
                                    <TrendingUpIcon className="h-5 w-5 mr-2" /> Identified Strengths
                                </h3>
                                <p className="text-green-700 text-sm leading-relaxed">{analysisResult.strengths}</p>
                            </div>
                            <div className="p-5 bg-yellow-50 rounded-lg border border-yellow-200">
                                <h3 className="font-bold text-yellow-800 flex items-center mb-3">
                                    <TrendingDownIcon className="h-5 w-5 mr-2" /> Areas to Improve
                                </h3>
                                <p className="text-yellow-700 text-sm leading-relaxed">{analysisResult.weaknesses}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" /> 
                                Examiner's Tips for You
                            </h3>
                            <ul className="space-y-2">
                                {analysisResult.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 px-2 flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" /> 
                    Detailed Question Review
                </h2>
                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                            <button 
                                onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                                className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50"
                            >
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">Q{index + 1}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase">{q.topic}</span>
                                        <span className="text-xs font-black text-gray-600">{q.marks} Marks</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 line-clamp-1">{q.question}</h3>
                                </div>
                                <div className={`p-1.5 rounded-full bg-gray-100 transition-transform ${expandedQuestion === index ? 'rotate-180' : ''}`}>
                                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>
                            
                            {expandedQuestion === index && (
                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-6 animate-fade-in">
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Response</h4>
                                        <div className="prose prose-sm text-gray-700 italic leading-relaxed whitespace-pre-wrap">
                                            {userAnswers[index] || <span className="text-gray-400 italic font-medium">No answer provided.</span>}
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <SparklesIcon className="h-4 w-4" /> Ideal CBSE Solution
                                        </h4>
                                        <SolutionDisplay solution={q.solution} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

             <div className="text-center pt-8 pb-12">
                <button onClick={() => setStatus('setup')} className="bg-indigo-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:bg-indigo-800 transition-all text-lg uppercase tracking-widest">
                    New Simulation
                </button>
            </div>
        </div>
    );

    const renderLoading = (text: string) => (
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="relative inline-block">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <TimerIcon className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-8 text-gray-800 font-bold text-2xl">{text}</p>
        </div>
    );

    switch (status) {
        case 'setup':
            return renderSetup();
        case 'loading':
            return renderLoading('Assembling Class ' + grade + ' Paper');
        case 'in-progress':
            return renderInProgress();
        case 'submitting':
            return renderLoading('Analyzing Answer Sheet');
        case 'completed':
            return renderResults();
        default:
            return renderSetup();
    }
};

export default ExamSimulation;
