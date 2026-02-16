import React from 'react';
import { SolutionStep } from '../types';
import { CheckCircleIcon } from './icons/Icons';

interface SolutionDisplayProps {
    solution: SolutionStep[];
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution }) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" /> Detailed Solution
            </h3>
            <div className="space-y-4">
                {solution.map(step => (
                    <div key={step.step} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-gray-700">Step {step.step}</p>
                            <p className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{step.marks}</p>
                        </div>
                        <p className="mt-2 text-gray-600">{step.explanation}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SolutionDisplay;
