
import React, { useState, useEffect, useCallback } from 'react';
import { BankQuestion, Difficulty, QuestionType, Subject, BloomsLevel } from '../types';
import { UNVALIDATED_QUESTIONS } from '../data/unvalidatedQueue';
import { ClipboardCheckIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, DocumentTextIcon, ChartBarIcon, HistoryIcon, SparklesIcon } from './icons/Icons';

// Simulation-only: Local queue of unvalidated items
const INITIAL_QUEUE: BankQuestion[] = [
    {
        class: 10,
        question_type: QuestionType.ShortAnswer,
        subject: Subject.Physics,
        chapter: 'Light',
        question_text: 'Define lateral inversion in plane mirrors.',
        model_answer: 'Lateral inversion is the phenomenon where the left side of an object appears as the right side in its image formed by a plane mirror.',
        marks: 2,
        examiner_tips: 'Mention "side-wise reversal" for clarity.',
        difficulty_level: Difficulty.Easy,
        // Added blooms_level
        blooms_level: BloomsLevel.Remember,
        source_year: 2021,
        concept_tags: ['Reflection', 'Plane Mirror']
    },
    ...UNVALIDATED_QUESTIONS
];

const SourceDocumentViewer: React.FC<{ question: BankQuestion | null }> = ({ question }) => {
    if (!question) return null;
    return (
        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 h-full overflow-y-auto">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">OCR Source Data</h3>
            <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">RAW_ID: {question.source_year}_S{question.subject.charAt(0)}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase italic">Parsed from PDF Section 4.2</span>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Raw Text Extract</p>
                        <p className="text-sm text-gray-700 leading-relaxed font-serif">{question.question_text}</p>
                    </div>
                    {question.model_answer && (
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Extracted Marking Scheme</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">"{question.model_answer}"</p>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-6 text-center italic leading-relaxed">Cross-reference with official CBSE 2024 blue-print for accuracy.</p>
        </div>
    );
};

const ManualEntryForm: React.FC<{ onSave: (q: BankQuestion) => void }> = ({ onSave }) => {
    const [form, setForm] = useState<BankQuestion>({
        class: 10,
        subject: Subject.Physics,
        chapter: '',
        question_type: QuestionType.ShortAnswer,
        question_text: '',
        model_answer: '',
        marks: 3,
        examiner_tips: '',
        difficulty_level: Difficulty.Medium,
        // Added blooms_level to satisfy type requirement
        blooms_level: BloomsLevel.Understand,
        source_year: 2024,
        concept_tags: []
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Subject</label>
                        <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value as Subject})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-900">
                            {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cognitive Level (Bloom's)</label>
                        <select value={form.blooms_level} onChange={e => setForm({...form, blooms_level: e.target.value as BloomsLevel})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-900">
                            {Object.values(BloomsLevel).map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Chapter</label>
                        <input type="text" value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-900" placeholder="Unit Name" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Marks</label>
                        <input type="number" value={form.marks || 0} onChange={e => setForm({...form, marks: parseInt(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-900" />
                    </div>
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Question Content</label>
                <textarea value={form.question_text} onChange={e => setForm({...form, question_text: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-medium text-gray-900 min-h-[120px]" placeholder="Paste question here..." />
            </div>
            <button onClick={() => onSave(form)} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg">Save to Production Bank</button>
        </div>
    );
};

const CurationPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'manual'>('queue');
    const [queue, setQueue] = useState<BankQuestion[]>(INITIAL_QUEUE);
    const [validated, setValidated] = useState<BankQuestion[]>([]);
    const [rejected, setRejected] = useState<{question: BankQuestion, reason: string}[]>([]);
    
    const [currentQuestion, setCurrentQuestion] = useState<BankQuestion | null>(null);
    const [editedQuestion, setEditedQuestion] = useState<BankQuestion | null>(null);

    const loadNext = useCallback(() => {
        if (queue.length > 0) {
            const [next, ...rest] = queue;
            setQueue(rest);
            setCurrentQuestion(next);
            setEditedQuestion(JSON.parse(JSON.stringify(next)));
        } else {
            setCurrentQuestion(null);
            setEditedQuestion(null);
        }
    }, [queue]);

    useEffect(() => {
        if (!currentQuestion && queue.length > 0 && activeTab === 'queue') {
            loadNext();
        }
    }, [currentQuestion, queue, loadNext, activeTab]);

    const handleApprove = () => {
        if (!editedQuestion) return;
        setValidated(prev => [...prev, editedQuestion]);
        loadNext();
    };

    const handleReject = () => {
        if (!currentQuestion) return;
        const reason = prompt("Why is this question being rejected? (e.g. Broken OCR, Factually Wrong, Out of Syllabus)");
        if (reason) {
            setRejected(prev => [...prev, { question: currentQuestion, reason }]);
            loadNext();
        }
    };

    const renderSummary = () => (
        <div className="max-w-2xl mx-auto py-12 text-center">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
                <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Queue Depleted</h2>
                <p className="text-gray-500 mt-2 font-medium">Your session curation data has been synced to the database.</p>
                <div className="grid grid-cols-2 gap-4 my-8">
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Approved</p>
                        <p className="text-4xl font-black text-green-700">{validated.length}</p>
                    </div>
                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Rejected</p>
                        <p className="text-4xl font-black text-red-700">{rejected.length}</p>
                    </div>
                </div>
                <button onClick={() => { setQueue(INITIAL_QUEUE); loadNext(); }} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg">Start New Batch</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-100">
                        <ClipboardCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter">SME Curation Portal</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Human-in-the-loop Validation</p>
                    </div>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button onClick={() => setActiveTab('queue')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'queue' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>Review Queue ({queue.length})</button>
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>Session Stats</button>
                    <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>Manual Add</button>
                </div>
            </div>

            {activeTab === 'queue' && (
                !currentQuestion ? renderSummary() : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        <SourceDocumentViewer question={currentQuestion} />
                        
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <SparklesIcon className="h-4 w-4" /> Curation Worksheet
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cognitive Level (Bloom's)</label>
                                            <select value={editedQuestion?.blooms_level} onChange={e => setEditedQuestion({...editedQuestion!, blooms_level: e.target.value as BloomsLevel})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500">
                                                {Object.values(BloomsLevel).map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Difficulty Level</label>
                                            <select value={editedQuestion?.difficulty_level} onChange={e => setEditedQuestion({...editedQuestion!, difficulty_level: e.target.value as Difficulty})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500">
                                                {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Allocated Marks</label>
                                        <input type="number" value={editedQuestion?.marks || 0} onChange={e => setEditedQuestion({...editedQuestion!, marks: parseInt(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Refined Question Text</label>
                                        <textarea value={editedQuestion?.question_text} onChange={e => setEditedQuestion({...editedQuestion!, question_text: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-medium text-gray-900 min-h-[100px]" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Official Model Answer</label>
                                        <textarea value={editedQuestion?.model_answer} onChange={e => setEditedQuestion({...editedQuestion!, model_answer: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-medium text-gray-900 min-h-[100px]" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Strategic Examiner Tips</label>
                                        <textarea value={editedQuestion?.examiner_tips} onChange={e => setEditedQuestion({...editedQuestion!, examiner_tips: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-medium text-gray-900" placeholder="Avoid this pitfall..." />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-10">
                                <button onClick={handleReject} className="py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                    <XCircleIcon className="h-5 w-5" /> Flag / Reject
                                </button>
                                <button onClick={handleApprove} className="py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5" /> Approve & Next
                                </button>
                            </div>
                        </div>
                    </div>
                )
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50">
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5 text-indigo-600" /> Session History
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Question</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {validated.map((q, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{q.question_text}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{q.subject} • {q.chapter}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">Validated</span>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-gray-500 italic">Ready for Production</td>
                                    </tr>
                                ))}
                                {rejected.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6 opacity-60">
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{r.question.question_text}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{r.question.subject}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full">Rejected</span>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-red-600 font-bold">{r.reason}</td>
                                    </tr>
                                ))}
                                {validated.length === 0 && rejected.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-medium italic">No activity logged in this session yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'manual' && (
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <ManualEntryForm onSave={(q) => { setValidated(prev => [...prev, q]); alert("Saved successfully!"); setActiveTab('history'); }} />
                </div>
            )}
        </div>
    );
};

export default CurationPortal;
