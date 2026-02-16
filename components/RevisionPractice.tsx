
import React, { useState, useMemo, useEffect } from 'react';
import { RevisionItem, ActivityLogEntry, QuestionType } from '../types';
import { View } from '../App';
import { StarIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, TimerIcon, TrophyIcon, LightBulbIcon } from './icons/Icons';

interface RevisionPracticeProps {
    revisionSet: RevisionItem[];
    updateRevisionProgress: (questionText: string, accuracy: number) => void;
    logActivity: (entry: Omit<ActivityLogEntry, 'id' | 'date'>) => void;
    setView: (view: View) => void;
}

const RevisionPractice: React.FC<RevisionPracticeProps> = ({ revisionSet, updateRevisionProgress, logActivity, setView }) => {
    const today = new Date();
    
    const dueItems = useMemo(() => {
        return revisionSet.filter(item => new Date(item.nextReviewDate) <= today);
    }, [revisionSet]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

    const currentItem = dueItems[currentIndex];

    const handleCheckAnswer = () => {
        if (!currentItem || isAnswered) return;
        setIsAnswered(true);
        const isCorrect = currentItem.question.question_type === QuestionType.MCQ 
            ? selectedOption === currentItem.question.correct_answer 
            : true; // For short answers in practice we assume completion
            
        const accuracy = isCorrect ? 100 : 0;
        updateRevisionProgress(currentItem.question.question_text, accuracy);
        logActivity({
            subject: currentItem.question.subject,
            chapter: currentItem.question.chapter,
            difficulty: currentItem.question.difficulty_level,
            accuracy,
            marksAchieved: isCorrect ? (currentItem.question.marks || 1) : 0,
            totalMarks: currentItem.question.marks || 1,
            timeSpentSeconds: 0 // Could add a timer here
        });

        if (isCorrect) setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        setSessionStats(prev => ({ ...prev, total: prev.total + 1 }));
    };

    const nextQuestion = () => {
        setIsAnswered(false);
        setSelectedOption(null);
        setCurrentIndex(prev => prev + 1);
    };

    if (dueItems.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
                <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-200">
                    <TrophyIcon className="h-20 w-20 text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Memory Fully Sync'd</h2>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed mt-2">
                        You've cleared all scheduled revision items for today. Spaced repetition works best with consistency!
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => setView('dashboard')} className="px-8 py-4 bg-indigo-700 text-white font-black rounded-xl hover:bg-indigo-800 shadow-lg uppercase tracking-widest transition-all">Go to Dashboard</button>
                        <button onClick={() => setView('question-bank')} className="px-8 py-4 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 uppercase tracking-widest transition-all">Browse More Questions</button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentIndex >= dueItems.length) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
                 <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-200">
                    <StarIcon className="h-16 w-16 text-indigo-600 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Session Complete!</h2>
                    <div className="flex justify-center gap-12 my-8">
                        <div>
                            <p className="text-sm font-black text-gray-400 uppercase">Correct</p>
                            <p className="text-4xl font-black text-green-600">{sessionStats.correct}</p>
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-400 uppercase">Mastered</p>
                            <p className="text-4xl font-black text-indigo-600">{sessionStats.total}</p>
                        </div>
                    </div>
                    <button onClick={() => setView('dashboard')} className="w-full py-5 bg-indigo-700 text-white font-black rounded-xl uppercase tracking-widest">Finish Session</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase">Daily Memory Sync</h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <TimerIcon className="h-4 w-4" /> Item {currentIndex + 1} of {dueItems.length}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-black text-sm bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
                    <StarIcon className="h-4 w-4" /> Level {currentItem.level} Knowledge
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 space-y-8 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-500" 
                        style={{ width: `${((currentIndex) / dueItems.length) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                         <span className="text-[10px] font-black tracking-widest text-indigo-700 uppercase bg-indigo-50 px-3 py-1 rounded-full">{currentItem.question.subject}</span>
                         <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase bg-gray-100 px-3 py-1 rounded-full">{currentItem.question.chapter}</span>
                    </div>
                </div>

                <h2 className="text-2xl font-black text-gray-800 leading-snug">{currentItem.question.question_text}</h2>

                {currentItem.question.options && (
                    <div className="grid grid-cols-1 gap-4">
                        {currentItem.question.options.map((opt, i) => (
                            <button 
                                key={i} 
                                disabled={isAnswered} 
                                onClick={() => setSelectedOption(opt)} 
                                className={`text-left p-6 rounded-2xl border-2 transition-all font-bold group ${
                                    selectedOption === opt 
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-inner' 
                                        : 'border-gray-100 bg-white hover:border-indigo-200'
                                } ${isAnswered && opt === currentItem.question.correct_answer ? 'border-green-500 bg-green-50 text-green-900' : ''} ${isAnswered && selectedOption === opt && opt !== currentItem.question.correct_answer ? 'border-red-400 bg-red-50 text-red-900' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 text-xs font-black transition-all ${selectedOption === opt ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-400 group-hover:border-indigo-300'}`}>{String.fromCharCode(65 + i)}</div>
                                    {opt}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {!isAnswered ? (
                    <button 
                        onClick={handleCheckAnswer} 
                        disabled={currentItem.question.question_type === QuestionType.MCQ && !selectedOption}
                        className="w-full py-5 bg-indigo-700 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-800 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        Validate Memory
                    </button>
                ) : (
                    <div className="space-y-6 pt-6 border-t animate-slide-up">
                        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-2xl">
                             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-4 flex items-center gap-2">
                                <LightBulbIcon className="h-4 w-4" /> Solution Recap
                            </h3>
                            <p className="leading-relaxed font-medium mb-4">{currentItem.question.model_answer}</p>
                            <div className="p-4 bg-white/10 rounded-xl border border-white/10 text-xs">
                                <span className="font-black text-indigo-300 mr-2 uppercase">Spaced Learning:</span>
                                <span className="italic opacity-90">Next review scheduled in {currentItem.level + 2} sessions.</span>
                            </div>
                        </div>
                        <button onClick={nextQuestion} className="w-full py-5 bg-indigo-700 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                            Continue <ArrowRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevisionPractice;
