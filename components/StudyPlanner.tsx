
import React, { useState, useCallback } from 'react';
import { Subject, StudyPlan, ActivityLogEntry, UserProfile } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import { CalendarIcon, SparklesIcon, CheckCircleIcon, TimerIcon, BookOpenIcon, ClipboardListIcon, LightBulbIcon } from './icons/Icons';
import { View } from '../App';

interface StudyPlannerProps {
    activityLog: ActivityLogEntry[];
    profile: UserProfile;
    setView: (view: View) => void;
}

const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'practice': return <TargetIcon className="h-5 w-5 text-indigo-500" />;
        case 'revision': return <ClipboardListIcon className="h-5 w-5 text-blue-500" />;
        case 'simulation': return <TimerIcon className="h-5 w-5 text-red-500" />;
        case 'theory': return <BookOpenIcon className="h-5 w-5 text-green-500" />;
        default: return <SparklesIcon className="h-5 w-5 text-gray-500" />;
    }
};

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a12.013 12.013 0 00-4.04-4.04m4.04 4.04L19.5 19.5M4.5 4.5l2.25 2.25M9.37 15.59a6 6 0 01-5.84-7.38v4.82m5.84 2.56a12.013 12.013 0 004.04 4.04m-4.04-4.04L4.5 4.5m11.18 11.18a6 6 0 01-7.38-5.84h4.82m2.56 5.84a12.013 12.013 0 004.04-4.04m-4.04 4.04L19.5 19.5M4.5 4.5l2.25 2.25" />
    </svg>
);

const StudyPlanner: React.FC<StudyPlannerProps> = ({ activityLog, profile, setView }) => {
    // Fix: Initialize state from the provided user profile
    const [grade, setGrade] = useState<number>(profile.grade);
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(profile.selectedSubjects.length > 0 ? profile.selectedSubjects : Object.values(Subject));
    const [duration, setDuration] = useState<number>(7);
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<StudyPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleSubject = (subj: Subject) => {
        setSelectedSubjects(prev =>
            prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
        );
    };

    const handleGeneratePlan = useCallback(async () => {
        if (selectedSubjects.length === 0) {
            setError("Please select at least one subject.");
            return;
        }

        setIsLoading(true);
        setError(null);

        // Summarize performance data for context
        const subjectStats: Record<string, { correct: number, total: number }> = {};
        activityLog.forEach(log => {
            if (!subjectStats[log.subject]) subjectStats[log.subject] = { correct: 0, total: 0 };
            subjectStats[log.subject].total++;
            if (log.accuracy === 100) subjectStats[log.subject].correct++;
        });

        const performanceSummary = Object.entries(subjectStats)
            .map(([subj, stats]) => `${subj}: ${Math.round((stats.correct / stats.total) * 100)}% accuracy across ${stats.total} questions.`)
            .join(' ') || "No previous performance data available. This is a fresh start.";

        try {
            const newPlan = await generateStudyPlan(grade, selectedSubjects, duration, performanceSummary);
            setPlan(newPlan);
        } catch (err) {
            setError("Failed to generate plan. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [grade, selectedSubjects, duration, activityLog]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                    <CalendarIcon className="h-7 w-7 text-indigo-700 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">AI Study Architect</h1>
                        <p className="text-gray-500">Your personalized roadmap to academic success.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Class Level</label>
                        <select value={grade} onChange={(e) => setGrade(parseInt(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                            <option value={10}>Class 10</option>
                            <option value={12}>Class 12</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plan Intensity</label>
                        <select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                            <option value={1}>Daily Sprint (1 Day)</option>
                            <option value={3}>Focused Push (3 Days)</option>
                            <option value={7}>Weekly Roadmap (7 Days)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Focus</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(Subject).map(subj => (
                                <button
                                    key={subj}
                                    onClick={() => toggleSubject(subj)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                                        selectedSubjects.includes(subj)
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                                    }`}
                                >
                                    {subj}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button 
                        onClick={handleGeneratePlan}
                        disabled={isLoading}
                        className="w-full bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md hover:bg-indigo-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Architecting Plan...</>
                        ) : (
                            <><SparklesIcon className="h-5 w-5" /> Generate Personalized Plan</>
                        )}
                    </button>
                    {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
                </div>
            </div>

            {plan && (
                <div className="animate-fade-in space-y-8">
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-indigo-900">{plan.title}</h2>
                        <p className="text-indigo-800 mt-2 leading-relaxed">{plan.overview}</p>
                        <div className="mt-4 flex items-center gap-2 text-indigo-700 font-semibold italic">
                            <LightBulbIcon className="h-5 w-5" />
                            {plan.motivation}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {plan.schedule.map((dayPlan, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800">{dayPlan.day}</h3>
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Focus: {dayPlan.focus}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {dayPlan.activities.map((activity, actIdx) => (
                                            <div key={actIdx} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group">
                                                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50">
                                                    <ActivityIcon type={activity.type} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-gray-800 capitalize">{activity.type} &bull; {activity.topic}</h4>
                                                        <span className="text-xs font-bold text-gray-400 flex items-center">
                                                            <TimerIcon className="h-3 w-3 mr-1" /> {activity.estimatedTime}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center pb-12">
                        {/* Fix: Added usage for setView to navigate back to profile */}
                        <button onClick={() => setView('profile')} className="text-indigo-600 font-bold hover:underline">
                            Go to Profile Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyPlanner;
