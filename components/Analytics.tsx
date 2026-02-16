
import React, { useState, useMemo, useCallback } from 'react';
import { Subject, PerformanceAnalysis, ActivityLogEntry, PerformanceData } from '../types';
import { getPerformanceAnalysis } from '../services/geminiService';
import { ChartBarIcon, LightBulbIcon, TrendingUpIcon, TrendingDownIcon, CheckCircleIcon, SparklesIcon, BookOpenIcon, TargetIcon, TrophyIcon } from './icons/Icons';

interface AnalyticsProps {
    activityLog: ActivityLogEntry[];
}

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center">
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const Analytics: React.FC<AnalyticsProps> = ({ activityLog }) => {
    const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const summaryStats = useMemo(() => {
        const totalQuestions = activityLog.length;
        const totalCorrect = activityLog.filter(e => e.accuracy === 100).length;
        const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
        
        const subjectProgress: Record<string, number> = {};
        const subjectTotals: Record<string, number> = {};

        activityLog.forEach(log => {
            subjectProgress[log.subject] = (subjectProgress[log.subject] || 0) + log.accuracy;
            subjectTotals[log.subject] = (subjectTotals[log.subject] || 0) + 1;
        });

        let totalMastery = 0;
        let subjectCount = 0;
        for (const subject in subjectTotals) {
            totalMastery += subjectProgress[subject] / subjectTotals[subject];
            subjectCount++;
        }
        const overallMastery = subjectCount > 0 ? totalMastery / subjectCount : 0;

        return {
            mastery: `${overallMastery.toFixed(0)}%`,
            questions: totalQuestions,
            accuracy: `${accuracy.toFixed(1)}%`,
        };
    }, [activityLog]);
    
    const subjectMasteryData = useMemo(() => {
        // Fix: Added missing subjects to satisfy Record<Subject, ...> type requirements
        const data: Record<Subject, { correct: number, total: number }> = {
            [Subject.Physics]: { correct: 0, total: 0 },
            [Subject.Chemistry]: { correct: 0, total: 0 },
            [Subject.Biology]: { correct: 0, total: 0 },
            [Subject.Mathematics]: { correct: 0, total: 0 },
            [Subject.Science]: { correct: 0, total: 0 },
            [Subject.SocialScience]: { correct: 0, total: 0 },
            [Subject.English]: { correct: 0, total: 0 },
        };
        
        activityLog.forEach(entry => {
            if (data[entry.subject]) {
                data[entry.subject].total++;
                if (entry.accuracy === 100) data[entry.subject].correct++;
            }
        });

        return Object.entries(data).map(([name, values]) => ({
            name,
            progress: values.total > 0 ? Math.round((values.correct / values.total) * 100) : 0,
        }));
    }, [activityLog]);

    const handleAnalyze = useCallback(async () => {
        if (activityLog.length === 0) {
            setError("Not enough data to analyze. Please complete some practice questions first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        // Aggregate data for the API
        const performanceDataMap: { [key: string]: { questionsAttempted: number, correctAnswers: number } } = {};
        activityLog.forEach(log => {
            const key = `${log.subject}-${log.chapter}`;
            if (!performanceDataMap[key]) {
                performanceDataMap[key] = { questionsAttempted: 0, correctAnswers: 0 };
            }
            performanceDataMap[key].questionsAttempted++;
            if (log.accuracy === 100) {
                performanceDataMap[key].correctAnswers++;
            }
        });

        const performanceData: PerformanceData[] = Object.entries(performanceDataMap).map(([key, data]) => {
            const [subject, topic] = key.split('-');
            return { subject: subject as Subject, topic, ...data };
        });

        try {
            const result = await getPerformanceAnalysis(performanceData);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to get AI analysis. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [activityLog]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Performance Analytics</h1>
                <p className="text-gray-500 mt-1">Track your progress and get insights to improve.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<ChartBarIcon className="h-6 w-6 text-white"/>} title="Overall Mastery" value={summaryStats.mastery} color="bg-blue-500"/>
                <StatCard icon={<TargetIcon className="h-6 w-6 text-white"/>} title="Average Accuracy" value={summaryStats.accuracy} color="bg-green-500"/>
                <StatCard icon={<BookOpenIcon className="h-6 w-6 text-white"/>} title="Questions Practiced" value={String(summaryStats.questions)} color="bg-indigo-500"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">AI Insights & Recommendations</h2>
                    {!analysis && !isLoading && !error && (
                        <div className="text-center py-8 flex flex-col items-center">
                            <LightBulbIcon className="h-12 w-12 text-yellow-400 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-700">Unlock Personalized Feedback</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-1 mb-4">Practice some questions, then click the button to let our AI analyze your performance.</p>
                            <button onClick={handleAnalyze} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center">
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                Analyze My Performance
                            </button>
                        </div>
                    )}
                    {isLoading && (
                         <div className="flex justify-center items-center py-10">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                             <p className="ml-3 text-gray-600 font-medium">Analyzing your data...</p>
                        </div>
                    )}
                    {error && <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}
                    {analysis && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center"><TrendingUpIcon className="h-6 w-6 text-green-500 mr-2" />Strengths</h3>
                                <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
                                    {analysis.strengths.map((s, i) => <li key={i}>{s.replace(/\*\*(.*?)\*\*/g, '$1')}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center"><TrendingDownIcon className="h-6 w-6 text-yellow-500 mr-2" />Areas for Improvement</h3>
                                <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
                                    {analysis.weaknesses.map((w, i) => <li key={i}>{w.replace(/\*\*(.*?)\*\*/g, '$1')}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center"><CheckCircleIcon className="h-6 w-6 text-blue-500 mr-2" />Actionable Recommendations</h3>
                                <div className="mt-2 space-y-3">
                                    {analysis.recommendations.map((r, i) => (
                                        <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="font-semibold text-gray-700">{r.title.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                                            <p className="text-sm text-gray-600">{r.description.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <h2 className="text-xl font-bold text-gray-800 mb-4">Subject Mastery</h2>
                     <div className="space-y-4">
                        {subjectMasteryData.map(subject => (
                            <div key={subject.name}>
                                <div className="flex justify-between mb-1">
                                    <p className="font-medium text-gray-700">{subject.name}</p>
                                    <p className="text-sm font-medium text-blue-600">{subject.progress}%</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${subject.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Subject</th>
                                <th scope="col" className="px-6 py-3">Chapter</th>
                                <th scope="col" className="px-6 py-3">Difficulty</th>
                                <th scope="col" className="px-6 py-3">Result</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activityLog.slice(0, 5).map(activity => (
                                <tr key={activity.id} className="bg-white border-b">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{activity.subject}</td>
                                    <td className="px-6 py-4">{activity.chapter}</td>
                                    <td className="px-6 py-4">{activity.difficulty}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activity.accuracy === 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {activity.accuracy === 100 ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{activity.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
