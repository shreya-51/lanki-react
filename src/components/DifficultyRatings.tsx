// DifficultyRating.tsx
import { Brain, RefreshCcw } from 'lucide-react'; // Import the refresh icon
import { Difficulty } from '../utils/shared_interfaces';

interface DifficultyRatingProps {
  selectedDifficulty: Difficulty | null;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onTryAgain: () => void;
  userId: number;
}

export function DifficultyRating({
  selectedDifficulty,
  onSelectDifficulty,
  onTryAgain,
  userId,
}: DifficultyRatingProps) {
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

  // Disable all buttons when a difficulty is selected
  const isButtonDisabled = () => {
    return selectedDifficulty !== null;
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    onSelectDifficulty(difficulty);
  };

  const getButtonStyles = (difficulty: Difficulty) => {
    const baseStyles =
      'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2';
    const isSelected = selectedDifficulty === difficulty;
    const isDisabled = isButtonDisabled();

    const colorStyles = {
      Easy: isSelected
        ? 'selected-easy'
        : 'not-selected-easy',
      Medium: isSelected
        ? 'selected-medium'
        : 'not-selected-medium',
      Hard: isSelected
        ? 'selected-hard'
        : 'not-selected-hard',
    };

    return `${baseStyles} ${colorStyles[difficulty]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-gray-600" />
        <h2 className="text-sm font-medium text-gray-700">
          How difficult was this for you?
        </h2>
      </div>
      <div className="flex gap-2">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => handleDifficultySelect(difficulty)}
            className={getButtonStyles(difficulty)}
            disabled={isButtonDisabled()}
          >
            {difficulty}
          </button>
        ))}
      </div>
      {selectedDifficulty && (
        <button
          onClick={onTryAgain}
          className="try-again-button flex items-center justify-center gap-2 mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
        >
          <RefreshCcw className="w-4 h-4" />
          Try this problem again
        </button>
      )}
    </div>
  );
}
