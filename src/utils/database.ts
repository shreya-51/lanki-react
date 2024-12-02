import { supabase } from './supabase';

import { capitalizeWords, fetchProblemDifficulty, getProblemName } from './helpers';
import { Difficulty, Problem } from './shared_interfaces';

interface AttemptEntry {
    difficulty: string;
    time_attempted: string;
}

export function normalizeProblemUrl(url: string) {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    const problemsIndex = pathSegments.findIndex(segment => segment.toLowerCase() === 'problems');
    if (problemsIndex >= 0 && problemsIndex < pathSegments.length - 1) {
        return `${urlObj.origin}/problems/${pathSegments[problemsIndex + 1]}`;
    }
    return url; // If the format is unexpected, return the original URL
}

export async function getNextProblemsForReview(email: string, currentProblemUrl: string): Promise<(Problem & { score: number })[]> {
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('user_id')
            .eq('email', email)
            .single();

        if (userError || !userData) {
            throw new Error('User not found');
        }

        const userId = userData.user_id;

        const { data: attempts, error } = await supabase
            .from('attempts')
            .select('problem_url, last_10_accesses')
            .eq('user_id', userId);

        if (error || !attempts) {
            throw new Error('Error fetching attempts');
        }

        const now = new Date();

        // Use Promise.all to handle async operations in map
        let problemScores = await Promise.all(
            attempts.map(async (attempt): Promise<Problem & { score: number }> => {
                const lastAccess = attempt.last_10_accesses.at(-1);
                if (!lastAccess || !lastAccess.time_attempted) {
                    console.warn('Invalid last access data:', lastAccess);
                    // Return a default problem with minimal score to exclude from top results
                    return {
                        name: 'Unknown Problem',
                        url: attempt.problem_url,
                        difficulty: 'Medium',
                        score: 0,
                    };
                }

                const lastAttemptDate = new Date(lastAccess.time_attempted);
                if (isNaN(lastAttemptDate.getTime())) {
                    console.warn('Invalid date in last access:', lastAccess.time_attempted);
                    // Return a default problem with minimal score to exclude from top results
                    return {
                        name: 'Unknown Problem',
                        url: attempt.problem_url,
                        difficulty: 'Medium',
                        score: 0,
                    };
                }

                const timeSinceLastAttempt =
                    (now.getTime() - lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24); // Days
                const difficultyMultiplier = parseInt(lastAccess.difficulty) + 1;

                const score = Math.pow(timeSinceLastAttempt, 2) * difficultyMultiplier;

                // Get problem name from URL
                const problemName = getProblemName(attempt.problem_url);
                const problemDifficulty = await fetchProblemDifficulty(attempt.problem_url);

                return {
                    name: problemName,
                    url: attempt.problem_url,
                    difficulty: problemDifficulty,
                    score,
                };
            })
        );

        // Filter out the current problem
        problemScores = problemScores.filter(problem => problem.url !== currentProblemUrl);

        // Normalize the scores
        if (problemScores.length > 0) {
            const maxScore = Math.max(...problemScores.map(p => p.score));
            if (maxScore > 0) {
                problemScores = problemScores.map(p => ({
                    ...p,
                    score: p.score / maxScore, // Normalizing scores
                }));
            }
        }

        // Sort by score in descending order to prioritize higher scores
        problemScores.sort((a, b) => b.score - a.score);

        // Select the top 5 problems
        return problemScores.slice(0, 5);
    } catch (error) {
        console.error('Error fetching next problems for review: ', error);
        return [];
    }
}



export async function getUserId(email: string) {
    let { data: user, error } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single(); // Assuming email is unique and can only return one user

    if (error) {
        console.error('Error fetching user id:', error);
        return null; // Handle this null in your calling function
    }

    if (user) {
        return user.user_id;
    } else {
        throw new Error("There is no user.");
    }
}

export const handleButtonClick = async (difficulty: string, userEmail: string) => {
    const url = normalizeProblemUrl(window.location.href);

    try {
        const userId = await getUserId(userEmail);
        if (!userId) {
            console.error("User ID not found for the given email.");
            return;
        }

        const { data: existingAttempts, error: attemptsError } = await supabase
            .from('attempts')
            .select('*')
            .eq('problem_url', url)
            .eq('user_id', userId)
            .single();

        if (attemptsError) {
            if (attemptsError.code === "PGRST116") {
                // If no previous attempts, add a new entry
                const currentTime = new Date().toISOString();
                const attemptEntry: AttemptEntry = { difficulty, time_attempted: currentTime };

                const { error: insertError } = await supabase
                    .from("attempts")
                    .insert([
                        { user_id: userId, problem_url: url, last_10_accesses: [attemptEntry] }
                    ]);
 
                if (insertError) {
                    console.error("Error adding new attempt: ", insertError);
                    return;
                }
                // showToastMessage("Stored.");
                console.log("Stored.")
            } else {
                console.error("Error fetching attempts: ", attemptsError);
                return;
            }
        }

        if (existingAttempts) {
            console.log("User has attempted this problem before.");
            let last10Accesses: AttemptEntry[] = existingAttempts.last_10_accesses || [];
            const currentTime = new Date().toISOString();
            const attemptEntry: AttemptEntry = { difficulty, time_attempted: currentTime };

            last10Accesses.push(attemptEntry);
            if (last10Accesses.length > 10) {
                last10Accesses = last10Accesses.slice(-10);
            }

            const { error: updateError } = await supabase
                .from('attempts')
                .update({ last_10_accesses: last10Accesses })
                .match({ user_id: userId, problem_url: url });

            if (updateError) {
                console.error('Error updating attempt:', updateError);
                return;
            }
            // showToastMessage("Stored.");
            console.log("Stored.")
        }
    } catch (error) {
        console.error("An error occurred while handling the button click: ", error);
    }
};