
import React, { useState } from 'react';
import { Subject, UserProfile } from '../types';
import { GRADES, CHAPTERS } from '../constants';
import { AcademicCapIcon, CheckCircleIcon, SparklesIcon, ArrowRightIcon } from './icons/Icons';

interface OnboardingProps {
    onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [grade, setGrade] = useState<number>(10);
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

    const availableSubjects = grade ? (Object.keys(CHAPTERS[grade] || {}) as Subject[]) : [];

    const handleNext = () => {
        if (step === 1 && name.trim().length > 0) setStep(2);
        else if (step === 2) setStep(3);
    };

    const toggleSubject = (subj: Subject) => {
        setSelectedSubjects(prev =>
            prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
        );
    };

    const handleFinish = () => {
        if (selectedSubjects.length === 0) {
            alert("Please select at least one subject to focus on.");
            return;
        }
        onComplete({
            name,
            grade,
            selectedSubjects,
            isSetup: true
        });
    };

    return (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="bg-indigo-700 p-8 text-white relative">
                    <div className="absolute top-4 right-4 text-indigo-300 font-mono text-sm">Step {step} of 3</div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <AcademicCapIcon className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Welcome to Alfanumrik</h1>
                    </div>
                    <p className="text-indigo-100">Let's personalize your CBSE adaptive learning journey.</p>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-slide-up">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">What should we call you?</h2>
                                <p className="text-gray-500 text-sm mb-4">Your name helps us personalize your dashboard and AI mentor interactions.</p>
                                <input
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all text-lg text-gray-900"
                                />
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={!name.trim()}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-slide-up">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Which Class are you in?</h2>
                                <p className="text-gray-500 text-sm mb-6">Select your current grade to get relevant content and past year questions.</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {GRADES.map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGrade(g)}
                                            className={`py-4 rounded-xl border-2 font-bold text-lg transition-all ${
                                                grade === g
                                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-inner'
                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200'
                                            }`}
                                        >
                                            Class {g === 11 || g === 12 ? (g === 11 ? 'XI' : 'XII') : g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleNext}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                            >
                                Confirm Class <ArrowRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-slide-up">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Select your Focus Subjects</h2>
                                <p className="text-gray-500 text-sm mb-6">Which subjects would you like to master? You can add more later.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {availableSubjects.map(subj => (
                                        <button
                                            key={subj}
                                            onClick={() => toggleSubject(subj)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                                selectedSubjects.includes(subj)
                                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200'
                                            }`}
                                        >
                                            <span className="font-bold">{subj}</span>
                                            {selectedSubjects.includes(subj) && <CheckCircleIcon className="h-5 w-5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleFinish}
                                disabled={selectedSubjects.length === 0}
                                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="h-5 w-5" /> Enter Alfanumrik
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
