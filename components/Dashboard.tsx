
import React, { useMemo } from 'react';
import ProgressChart from './ProgressChart';
import { TargetIcon, TrophyIcon, ChartBarIcon, SparklesIcon, ArrowRightIcon, MapIcon, CheckCircleIcon, TimerIcon, StarIcon, TrendingUpIcon, TrendingDownIcon, LightBulbIcon } from './icons/Icons';
import { View } from '../App';
import { ActivityLogEntry, Subject, MasterySummary, UserProfile, RevisionItem, BloomsLevel } from '../types';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, AreaChart, Area, XAxis } from 'recharts';

interface DashboardProps {
  setView: (view: View) => void;
  activityLog: ActivityLogEntry[];
  masterySummary: MasterySummary;
  profile: UserProfile;
  revisionSet: RevisionItem[];
}

const BLOOMS_COLORS: Record<BloomsLevel, string> = {
    [BloomsLevel.Remember]: '#94A3B8',
    [BloomsLevel.Understand]: '#60A5FA',
    [BloomsLevel.Apply]: '#4ADE80',
    [BloomsLevel.Analyze]: '#FBBF24',
    [BloomsLevel.Evaluate]: '#F87171',
    [BloomsLevel.Create]: '#C084FC',
};

const Dashboard: React.FC<DashboardProps> = ({ setView, activityLog, masterySummary, profile, revisionSet }) => {
    const bloomsData = useMemo(() => {
        return Object.entries(masterySummary.bloomsMastery).map(([level, score]) => ({
            level,
            score,
            color: BLOOMS_COLORS[level as BloomsLevel]
        }));
    }, [masterySummary]);

    const pulseData = useMemo(() => {
        return activityLog.slice(0, 15).reverse().map((log, i) => ({
            id: i,
            accuracy: log.accuracy
        }));
    }, [activityLog]);

    const dueCount = useMemo(() => {
        return revisionSet.filter(item => new Date(item.nextReviewDate) <= new Date()).length;
    }, [revisionSet]);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Pedagogical Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl">
                        {profile.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Knowledge Command</h1>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" /> FSRS v4 Tracker Active
                             </span>
                             <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">• Bloom's Mapping</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <StarIcon className="h-6 w-6 text-indigo-500" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 leading-none tracking-widest">Cognitive Level</p>
                            <p className="text-lg font-black text-indigo-700">{masterySummary.nextMilestone}</p>
                        </div>
                    </div>
                    <div className="bg-indigo-600 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                        <TrophyIcon className="h-6 w-6 text-yellow-300" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-indigo-200 leading-none tracking-widest">Mastery Index</p>
                            <p className="text-lg font-black text-white">{masterySummary.predictedScore}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cognitive Bloom's Heatmap */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                         <SparklesIcon className="h-4 w-4 text-indigo-600 inline mr-2" /> Cognitive Heatmap (Bloom's)
                    </h3>
                    <div className="space-y-3">
                        {bloomsData.map((d) => (
                            <div key={d.level} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-black uppercase">
                                    <span style={{ color: d.color }}>{d.level}</span>
                                    <span className="text-gray-400">{d.score}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-1000"
                                        style={{ width: `${d.score}%`, backgroundColor: d.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simulated DKT Stability Stream */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                            <TimerIcon className="h-5 w-5 text-indigo-600 inline mr-2" /> Knowledge Stability Stream
                        </h2>
                        <span className="text-[10px] text-indigo-600 font-black uppercase bg-indigo-50 px-3 py-1 rounded-full">DKT Simulation</span>
                    </div>
                    <div style={{ width: '100%', height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={pulseData}>
                                <defs>
                                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area type="monotone" dataKey="accuracy" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-[9px] font-bold text-gray-400 uppercase text-center">Stability calculated using human memory decay probability model.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-gradient-to-br from-gray-900 to-indigo-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-10">
                         <TargetIcon className="h-48 w-48 text-white" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="h-1 w-12 bg-indigo-400 rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Intelligent Scaffolding</span>
                            </div>
                            {masterySummary.weakChapters.length > 0 ? (
                                <div className="space-y-6">
                                    <h3 className="text-4xl font-black leading-none tracking-tighter uppercase">{masterySummary.weakChapters[0].chapter}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {masterySummary.weakChapters[0].suggestions.map((s, i) => (
                                            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md flex items-center gap-3">
                                                <LightBulbIcon className="h-5 w-5 text-indigo-400" />
                                                <p className="text-xs font-bold leading-relaxed text-indigo-100">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-yellow-400 animate-pulse" />
                                    <h3 className="text-3xl font-black uppercase">Syllabus Stabilized</h3>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setView('practice-zone')} className="mt-12 py-6 bg-white text-indigo-900 font-black rounded-3xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-2xl uppercase tracking-[0.2em] text-sm">
                            Next Learning Sprint <ArrowRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-tighter">Memory Sync</h3>
                        <div className="text-center space-y-2 py-4">
                            <p className="text-5xl font-black text-indigo-600">{dueCount}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stability Threshold Exceeded</p>
                        </div>
                    </div>
                    <button onClick={() => setView('revision-practice')} className="w-full py-5 bg-indigo-100 text-indigo-700 font-black rounded-3xl hover:bg-indigo-200 transition-all shadow-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        <StarIcon className="h-4 w-4" /> Start Memory Sync
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
