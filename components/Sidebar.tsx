
import React from 'react';
import { View } from '../App';
import { DashboardIcon, BookOpenIcon, ChartBarIcon, UserCircleIcon, AcademicCapIcon, ClipboardListIcon, DatabaseIcon, TimerIcon, ChatBubbleIcon, ClipboardCheckIcon, CalendarIcon, StarIcon } from './icons/Icons';
import { UserProfile } from '../types';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    profile: UserProfile;
    revisionCount: number;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    badge?: string | number;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group ${
            isActive
                ? 'bg-indigo-700 text-white shadow-lg transform scale-[1.02]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'
        }`}
    >
        <span className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'}`}>{icon}</span>
        <span className="ml-3 flex-1 text-left">{label}</span>
        {badge !== undefined && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'}`}>
                {badge}
            </span>
        )}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, profile, revisionCount }) => {
    return (
        <aside className="w-64 bg-white p-4 flex flex-col flex-shrink-0 border-r border-gray-100 h-screen sticky top-0 overflow-y-auto z-30">
            <div>
                <div className="flex items-center mb-8 px-2">
                    <div className="p-2 bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200">
                        <AcademicCapIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 ml-3 tracking-tighter">Alfanumrik</h1>
                        <p className="text-[10px] font-black text-indigo-600 ml-3 uppercase tracking-widest">Class {profile.grade} Boards</p>
                    </div>
                </div>
                <nav className="space-y-1">
                    <NavItem
                        icon={<DashboardIcon className="h-5 w-5" />}
                        label="Dashboard"
                        isActive={currentView === 'dashboard'}
                        onClick={() => setView('dashboard')}
                    />
                    <NavItem
                        icon={<CalendarIcon className="h-5 w-5" />}
                        label="Study Planner"
                        isActive={currentView === 'study-planner'}
                        onClick={() => setView('study-planner')}
                    />
                    <NavItem
                        icon={<BookOpenIcon className="h-5 w-5" />}
                        label="Practice Zone"
                        isActive={currentView === 'practice-zone'}
                        onClick={() => setView('practice-zone')}
                    />
                    <NavItem
                        icon={<StarIcon className="h-5 w-5" />}
                        label="Memory Sync"
                        isActive={currentView === 'revision-practice'}
                        onClick={() => setView('revision-practice')}
                        badge={revisionCount > 0 ? revisionCount : undefined}
                    />
                    <NavItem
                        icon={<ChatBubbleIcon className="h-5 w-5" />}
                        label="AI Tutor"
                        isActive={currentView === 'ai-tutor'}
                        onClick={() => setView('ai-tutor')}
                    />
                    <NavItem
                        icon={<TimerIcon className="h-5 w-5" />}
                        label="Exam Simulation"
                        isActive={currentView === 'exam-simulation'}
                        onClick={() => setView('exam-simulation')}
                    />
                    <NavItem
                        icon={<ClipboardListIcon className="h-5 w-5" />}
                        label="Revision Notes"
                        isActive={currentView === 'revision'}
                        onClick={() => setView('revision')}
                    />
                    <NavItem
                        icon={<DatabaseIcon className="h-5 w-5" />}
                        label="Exam Archive"
                        isActive={currentView === 'question-bank'}
                        onClick={() => setView('question-bank')}
                    />
                    <NavItem
                        icon={<ChartBarIcon className="h-5 w-5" />}
                        label="Analytics"
                        isActive={currentView === 'analytics'}
                        onClick={() => setView('analytics')}
                    />
                </nav>
            </div>
            
            <div className="mt-auto pt-8 border-t border-gray-100">
                 <NavItem
                    icon={<UserCircleIcon className="h-5 w-5" />}
                    label="Profile"
                    isActive={currentView === 'profile'}
                    onClick={() => setView('profile')}
                />
            </div>
        </aside>
    );
};

export default Sidebar;
