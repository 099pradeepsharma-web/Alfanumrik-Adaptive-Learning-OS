
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Subject, Chapter, UserProfile } from '../types';
import { CHAPTERS } from '../constants';
import { generateRevisionNotes } from '../services/geminiService';
import { ClipboardListIcon, SparklesIcon, LightBulbIcon, StarIcon, ArrowRightIcon } from './icons/Icons';
import { View } from '../App';

interface RevisionNotesProps {
    profile: UserProfile;
    setView: (view: View) => void;
}

const RevisionNotes: React.FC<RevisionNotesProps> = ({ profile, setView }) => {
    const { grade, selectedSubjects } = profile;
    
    const availableSubjects = useMemo(() => {
        const gradeSubjects = Object.keys(CHAPTERS[grade] || {}) as Subject[];
        return selectedSubjects.length > 0 
            ? selectedSubjects.filter(s => gradeSubjects.includes(s))
            : gradeSubjects;
    }, [grade, selectedSubjects]);

    const [subject, setSubject] = useState<Subject>(availableSubjects[0] || Subject.Physics);
    const [chapter, setChapter] = useState<string>('');
    const [isCheatSheet, setIsCheatSheet] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notes, setNotes] = useState<string | null>(null);

    const chapters = useMemo(() => CHAPTERS[grade]?.[subject] || [], [grade, subject]);

    useEffect(() => {
        if (availableSubjects.length > 0) {
            if (!availableSubjects.includes(subject)) setSubject(availableSubjects[0]);
            if (chapters.length > 0 && !chapters.find(c => c.id === chapter)) setChapter(chapters[0].id);
        }
    }, [availableSubjects, chapters, subject, chapter]);

    const handleGenerateNotes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setNotes(null);
        try {
            const selectedChapterName = chapters.find(c => c.id === chapter)?.name || '';
            const result = await generateRevisionNotes(grade, subject, selectedChapterName + (isCheatSheet ? " (Cheat Sheet Mode)" : ""));
            setNotes(result);
        } catch (err) {
            setError('Failed to generate optimized notes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [grade, subject, chapter, chapters, isCheatSheet]);

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-6">
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Memory Management</h2>
                    <p className="text-indigo-200 text-sm font-medium">Use AI to generate notes or practice your saved questions with SRS.</p>
                </div>
                <button 
                    onClick={() => setView('revision-practice')}
                    className="px-8 py-4 bg-white text-indigo-700 font-black rounded-xl hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest whitespace-nowrap"
                >
                    <StarIcon className="h-5 w-5" /> Start Memory Sync
                </button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center">
                        <ClipboardListIcon className="h-8 w-8 text-indigo-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Revision Architect</h1>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Generating Class {grade} memory-maps.</p>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button onClick={() => setIsCheatSheet(false)} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!isCheatSheet ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500'}`}>Full Notes</button>
                        <button onClick={() => setIsCheatSheet(true)} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${isCheatSheet ? 'bg-indigo-600 shadow-sm text-white' : 'text-gray-500'}`}>Cheat Sheet</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Subject</label>
                        <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold shadow-inner">
                            {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Chapter</label>
                        <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold shadow-inner">
                            {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={handleGenerateNotes} disabled={isLoading || chapters.length === 0} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl flex justify-center items-center gap-2 disabled:opacity-50 uppercase tracking-widest">
                    {isLoading ? <><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Drafting Notes...</> : <><SparklesIcon className="h-5 w-5" /> Generate Optimized Notes</>}
                </button>
            </div>

            {notes && (
                <div className={`bg-white p-8 rounded-3xl shadow-sm border border-gray-200 animate-fade-in ${isCheatSheet ? 'border-l-[12px] border-l-indigo-600' : ''}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{chapters.find(c => c.id === chapter)?.name}</h2>
                        {isCheatSheet && <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest">Flash Mode</span>}
                    </div>
                    <div className={`prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed ${isCheatSheet ? 'text-sm font-medium' : ''}`}>
                        {notes.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </div>
                    {isCheatSheet && (
                        <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-3 shadow-inner">
                            <LightBulbIcon className="h-5 w-5 text-yellow-500 mt-1" />
                            <p className="text-xs text-yellow-800 font-bold uppercase tracking-wider leading-relaxed">Hack: Scan these bullet points 3 times today for subconscious retention.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RevisionNotes;
