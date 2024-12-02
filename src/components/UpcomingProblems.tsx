import { ChevronRight } from 'lucide-react';
import { Difficulty } from '../utils/shared_interfaces';

interface Problem {
    name: string;
    url: string;
    difficulty: Difficulty;
}

interface UpcomingProblemsProps {
    problems: Problem[];
    isLoading: boolean;
}

export function UpcomingProblems({ problems, isLoading }: UpcomingProblemsProps) {
    return (
        <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Upcoming Problems</h2>
            <div className="space-y-2">
                {isLoading ? (
                    // Loading skeleton - now showing 5 items
                    Array(5).fill(0).map((_, index) => (
                        <div
                            key={index}
                            className="problem-box flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="h-4 w-32 bg-gray-100 rounded animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                <div className="h-4 w-16 bg-gray-100 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                            </div>
                            <div className="w-4 h-4 bg-gray-100 rounded animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                        </div>
                    ))
                ) : (
                    problems.map((problem) => (
                        <div
                            key={problem.url}
                            onClick={() => window.location.href = problem.url}
                            className="problem-box flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-700">{problem.name}</span>
                                <span
                                    className={`difficulty-badge ${problem.difficulty.toLowerCase()} px-2 py-0.5 rounded-full text-xs font-medium`}
                                >
                                    {problem.difficulty}
                                </span>
                            </div>
                            <ChevronRight className="chevron w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
