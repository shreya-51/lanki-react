import { Difficulty } from "../utils/shared_interfaces";

interface ProblemProps {
    title: string;
    difficulty: Difficulty;
}

export const CurrentProblem: React.FC<ProblemProps> = ({ title, difficulty }) => {
    const difficultyColor = {
        Easy: 'bg-green-100 text-green-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        Hard: 'bg-red-100 text-red-700'
    };

    return (
        <div className="mb-6">
            <h2 className="text-sm font-medium !text-gray-700 mb-3">Current Problem</h2>
            <div className="current-problem-box bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{title}</h3>
                    <span
                        className={`difficulty-badge ${difficulty.toLowerCase()} px-2 py-1 rounded-full text-xs font-medium`}
                    >
                        {difficulty}
                    </span>

                </div>
            </div>
        </div>
    );
}