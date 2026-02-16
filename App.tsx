
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import RevisionNotes from './components/RevisionNotes';
import QuestionBank from './components/QuestionBank';
import ExamSimulation from './components/ExamSimulation';
import AITutor from './components/MigaDoubtSolver';
import PracticeZone from './components/PracticeZone';
import CurationPortal from './components/CurationPortal';
import StudyPlanner from './components/StudyPlanner';
import RevisionPractice from './components/RevisionPractice';
import Onboarding from './components/Onboarding';
import { ActivityLogEntry, MasterySummary, Subject, UserProfile, Difficulty, RevisionItem, BankQuestion, BloomsLevel } from './types';
import { CHAPTERS } from './constants';

export type View = 'dashboard' | 'practice-zone' | 'exam-simulation' | 'revision' | 'revision-practice' | 'question-bank' | 'analytics' | 'ai-tutor' | 'profile' | 'curation-portal' | 'study-planner';

// FSRS Constants
const DEFAULT_STABILITY = 1;
const DEFAULT_DIFFICULTY = 5;
const REQUEST_RETENTION = 0.9;

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => {
        const saved = localStorage.getItem('alfanumrik_activity');
        return saved ? JSON.parse(saved) : [];
    });

    const [revisionSet, setRevisionSet] = useState<RevisionItem[]>(() => {
        const saved = localStorage.getItem('alfanumrik_revision_set');
        return saved ? JSON.parse(saved) : [];
    });

    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('alfanumrik_profile');
        return saved ? JSON.parse(saved) : {
            grade: 10,
            selectedSubjects: [],
            name: '',
            isSetup: false
        };
    });

    useEffect(() => {
        localStorage.setItem('alfanumrik_profile', JSON.stringify(userProfile));
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('alfanumrik_activity', JSON.stringify(activityLog));
    }, [activityLog]);

    useEffect(() => {
        localStorage.setItem('alfanumrik_revision_set', JSON.stringify(revisionSet));
    }, [revisionSet]);

    const handleToggleRevision = (question: BankQuestion) => {
        setRevisionSet(prev => {
            const exists = prev.find(item => item.question.question_text === question.question_text);
            if (exists) {
                return prev.filter(item => item.question.question_text !== question.question_text);
            } else {
                return [...prev, {
                    question,
                    lastReviewDate: new Date().toISOString(),
                    nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
                    stability: DEFAULT_STABILITY,
                    difficulty: DEFAULT_DIFFICULTY,
                    reps: 0,
                    lapses: 0,
                    // Initialized level property
                    level: 1
                }];
            }
        });
    };

    const updateRevisionProgress = (questionText: string, accuracy: number) => {
        setRevisionSet(prev => prev.map(item => {
            if (item.question.question_text === questionText) {
                const isCorrect = accuracy === 100;
                
                // Simplified FSRS Scheduler
                let newStability = item.stability;
                let newDifficulty = item.difficulty;
                let newLapses = item.lapses;

                if (isCorrect) {
                    // Stability growth factor based on retrievability
                    const elapsed = (Date.now() - new Date(item.lastReviewDate).getTime()) / (1000 * 60 * 60 * 24);
                    const retrievability = Math.pow(0.9, elapsed / item.stability);
                    newStability = item.stability * (1 + Math.exp(1) * (1 - retrievability));
                    newDifficulty = Math.max(1, Math.min(10, item.difficulty - 0.5));
                } else {
                    newStability = Math.max(0.5, item.stability * 0.5);
                    newDifficulty = Math.min(10, item.difficulty + 1);
                    newLapses += 1;
                }

                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + Math.ceil(newStability));
                
                return {
                    ...item,
                    stability: newStability,
                    difficulty: newDifficulty,
                    lapses: newLapses,
                    reps: item.reps + 1,
                    lastReviewDate: new Date().toISOString(),
                    nextReviewDate: nextDate.toISOString()
                };
            }
            return item;
        }));
    };

    const logActivity = (entry: Omit<ActivityLogEntry, 'id' | 'date'>) => {
        setActivityLog(prevLog => [
            { 
                ...entry, 
                id: Date.now(),
                date: new Date().toISOString().split('T')[0]
            },
            ...prevLog
        ]);
    };

    const masterySummary: MasterySummary = useMemo(() => {
        const stats: Record<string, { weightedScore: number, weightTotal: number, count: number, subject: Subject, chapter: string }> = {};
        const bloomsCount: Record<BloomsLevel, { total: number, correct: number }> = {
            [BloomsLevel.Remember]: { total: 0, correct: 0 },
            [BloomsLevel.Understand]: { total: 0, correct: 0 },
            [BloomsLevel.Apply]: { total: 0, correct: 0 },
            [BloomsLevel.Analyze]: { total: 0, correct: 0 },
            [BloomsLevel.Evaluate]: { total: 0, correct: 0 },
            [BloomsLevel.Create]: { total: 0, correct: 0 },
        };

        const difficultyWeights = {
            [Difficulty.Easy]: 1,
            [Difficulty.Medium]: 2,
            [Difficulty.Hard]: 3,
            [Difficulty.HOTS]: 5
        };

        const conceptTrace: Record<string, number> = {};

        activityLog.forEach(log => {
            const key = `${log.subject}|${log.chapter}`;
            if (!stats[key]) stats[key] = { weightedScore: 0, weightTotal: 0, count: 0, subject: log.subject, chapter: log.chapter };
            
            const weight = difficultyWeights[log.difficulty] || 1;
            stats[key].weightedScore += (log.accuracy / 100) * weight;
            stats[key].weightTotal += weight;
            stats[key].count++;

            if (log.bloomsLevel) {
                bloomsCount[log.bloomsLevel].total++;
                if (log.accuracy === 100) bloomsCount[log.bloomsLevel].correct++;
            }

            // Simulated DKT: Concept decay
            const conceptKey = `${log.subject} - ${log.chapter}`;
            const timeSince = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
            const decay = Math.exp(-0.1 * timeSince); // Simple Ebbinghaus curve
            conceptTrace[conceptKey] = (log.accuracy / 100) * decay;
        });

        const bloomsMastery: Record<BloomsLevel, number> = {} as any;
        Object.keys(bloomsCount).forEach((level) => {
            const l = level as BloomsLevel;
            bloomsMastery[l] = bloomsCount[l].total > 0 
                ? Math.round((bloomsCount[l].correct / bloomsCount[l].total) * 100) 
                : 0;
        });

        const chapterAnalysis = Object.values(stats).map(s => {
            const score = s.weightTotal > 0 ? (s.weightedScore / s.weightTotal) * 100 : 0;
            const suggestions = [];
            if (score < 50) suggestions.push("Prioritize Remember/Understand tasks");
            if (score >= 50 && score < 80) suggestions.push("Advance to Apply/Analyze scenarios");
            if (score >= 80) suggestions.push("Ready for Evaluate/Create complexity");

            return { subject: s.subject, chapter: s.chapter, score, suggestions };
        });

        const totalPoints = activityLog.reduce((acc, curr) => acc + (curr.marksAchieved || 0), 0);
        const avgScore = chapterAnalysis.length > 0 ? chapterAnalysis.reduce((a, b) => a + b.score, 0) / chapterAnalysis.length : 0;
        
        const last10 = activityLog.slice(0, 10);
        const prev10 = activityLog.slice(10, 20);
        const currentAcc = last10.length > 0 ? last10.reduce((a, b) => a + b.accuracy, 0) / last10.length : 0;
        const previousAcc = prev10.length > 0 ? prev10.reduce((a, b) => a + b.accuracy, 0) / prev10.length : 0;
        const learningVelocity = currentAcc - previousAcc;

        const boardReadiness = Math.min(Math.round(avgScore * 0.7 + Math.min(chapterAnalysis.length * 5, 30)), 100);

        return {
            weakChapters: chapterAnalysis.filter(c => c.score < 70).sort((a, b) => a.score - b.score),
            strongChapters: chapterAnalysis.filter(c => c.score >= 70).sort((a, b) => b.score - a.score),
            overallAccuracy: activityLog.length > 0 
                ? (activityLog.reduce((a, b) => a + b.accuracy, 0) / activityLog.length)
                : 0,
            totalPoints,
            nextMilestone: totalPoints < 500 ? "Rememberer" : totalPoints < 2000 ? "Conceptualist" : "Critical Thinker",
            boardReadiness,
            learningVelocity,
            predictedScore: Math.min(Math.round(boardReadiness + (learningVelocity > 0 ? 5 : -2)), 100),
            bloomsMastery,
            conceptStability: conceptTrace
        };
    }, [activityLog]);

    const renderContent = () => {
        if (!userProfile.isSetup) return null;
        switch (currentView) {
            case 'dashboard':
                return <Dashboard setView={setCurrentView} activityLog={activityLog} masterySummary={masterySummary} profile={userProfile} revisionSet={revisionSet} />;
            case 'practice-zone':
                return <PracticeZone logActivity={logActivity} masterySummary={masterySummary} profile={userProfile} onToggleRevision={handleToggleRevision} revisionSet={revisionSet} />;
            case 'ai-tutor':
                return <AITutor masterySummary={masterySummary} profile={userProfile} />;
            case 'exam-simulation':
                return <ExamSimulation grade={userProfile.grade} logActivity={logActivity} />;
            case 'study-planner':
                return <StudyPlanner activityLog={activityLog} profile={userProfile} setView={setCurrentView} />;
            case 'revision':
                return <RevisionNotes profile={userProfile} setView={setCurrentView} />;
            case 'revision-practice':
                return <RevisionPractice revisionSet={revisionSet} updateRevisionProgress={updateRevisionProgress} logActivity={logActivity} setView={setCurrentView} />;
             case 'question-bank':
                return <QuestionBank profile={userProfile} onToggleRevision={handleToggleRevision} revisionSet={revisionSet} />;
             case 'analytics':
                 return <Analytics activityLog={activityLog} />;
            case 'profile':
                 return (
                    <div className="p-8 max-w-2xl mx-auto bg-white rounded-2xl border shadow-sm mt-10">
                        <h1 className="text-3xl font-bold text-gray-800">Pedagogical Profile</h1>
                        <div className="mt-8 space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {userProfile.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-800">{userProfile.name}</p>
                                    <p className="text-sm text-indigo-600 font-bold uppercase">{masterySummary.nextMilestone} Level</p>
                                </div>
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button onClick={() => setUserProfile({ ...userProfile, isSetup: false })} className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">Change Settings</button>
                                <button onClick={() => { if(confirm("Clear history?")) { setActivityLog([]); localStorage.removeItem('alfanumrik_activity'); }}} className="flex-1 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all">Reset Sync History</button>
                            </div>
                        </div>
                    </div>
                 );
            default:
                return <Dashboard setView={setCurrentView} activityLog={activityLog} masterySummary={masterySummary} profile={userProfile} revisionSet={revisionSet} />;
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            {!userProfile.isSetup && <Onboarding onComplete={(p) => setUserProfile(p)} />}
            {userProfile.isSetup && (
                <>
                    <Sidebar currentView={currentView} setView={setCurrentView} profile={userProfile} revisionCount={revisionSet.filter(i => new Date(i.nextReviewDate) <= new Date()).length} />
                    <main className="flex-1 transition-all duration-300">
                        <div className="p-4 sm:p-6 lg:p-8">{renderContent()}</div>
                    </main>
                </>
            )}
        </div>
    );
};
export default App;
