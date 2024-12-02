export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
    name: string;
    url: string;
    difficulty: Difficulty;
}