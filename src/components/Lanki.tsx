// src/components/Lanki.tsx
import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';

// Imported components
import Toolbar from './Toolbar';
import Login from './Login';
import { UpcomingProblems } from './UpcomingProblems';
import { CurrentProblem } from './CurrentProblem';
import { DifficultyRating } from './DifficultyRatings';

// Imported functions
import { fetchProblemDifficulty, get_current_problem } from '../utils/helpers';
import { getNextProblemsForReview, handleButtonClick, normalizeProblemUrl, getUserId } from '../utils/database';
import { logTryAgainButtonPress, logDifficultyButtonPress } from '../utils/events';

// Imported definitions
import { Problem, Difficulty } from '../utils/shared_interfaces';
import Logo from './Logo';

const Lanki: React.FC = () => {
    const logoUrl = chrome.runtime.getURL('/logo.svg');
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [problemTitle, setProblemTitle] = useState('');
    const [nextProblems, setNextProblems] = useState<Problem[]>([]);
    const [userDifficulty, setUserDifficulty] = useState<Difficulty | null>(null);
    const [isLoadingProblems, setIsLoadingProblems] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [problemDifficulty, setProblemDifficulty] = useState<Difficulty | null>(null);

    useEffect(() => {
        let lastUrl = window.location.href;

        const observer = new MutationObserver(async () => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                console.log('URL changed to', currentUrl);
                const url = window.location.href;
                const problemName = get_current_problem(url);
                const difficulty = await fetchProblemDifficulty(url);
                setProblemDifficulty(difficulty);
                console.log("problem difficulty: ", difficulty)
                if (problemName) {
                    if (problemName != "nothing") {
                        setProblemTitle(problemName);
                    }
                    else {
                        console.log("No current problem title on this page.")
                    }
                }
                else {
                    console.log("Problem getting current problem title or no problem title.")
                }

                if (userEmail) {
                    // Fetch the next problems once the user is logged in
                    const fetchNextProblems = async () => {
                        try {
                            setIsLoadingProblems(true);
                            const currentProblemUrl = normalizeProblemUrl(window.location.href);
                            const problems = await getNextProblemsForReview(userEmail, currentProblemUrl);
                            setNextProblems(problems);
                        } catch (error) {
                            console.error("Error fetching next problems: ", error);
                        } finally {
                            setIsLoadingProblems(false);
                        }
                    };
                    fetchNextProblems();
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        };
    }, [userEmail]);

    useEffect(() => {
        const url = window.location.href;
        const problemName = get_current_problem(url);
        const getProblemDifficulty = async () => {
            const difficulty = await fetchProblemDifficulty(url);
            setProblemDifficulty(difficulty);
            console.log("problem difficulty: ", difficulty);
        };
        getProblemDifficulty();

        if (problemName) {
            if (problemName != "nothing") {
                setProblemTitle(problemName);
            }
            else {
                console.log("No current problem title on this page.")
            }
        }
        else {
            console.log("Problem getting current problem title or no problem title.")
        }
    }, []);

    useEffect(() => {
        if (userEmail) {
            // Fetch the next problems once the user is logged in
            const fetchNextProblems = async () => {
                try {
                    setIsLoadingProblems(true);
                    const currentProblemUrl = normalizeProblemUrl(window.location.href);
                    const problems = await getNextProblemsForReview(userEmail, currentProblemUrl);
                    setNextProblems(problems);
                } catch (error) {
                    console.error("Error fetching next problems: ", error);
                } finally {
                    setIsLoadingProblems(false);
                }
            };
            fetchNextProblems();
        }
    }, [userEmail]);

    const handleLoginSuccess = async (email: string) => {
        setUserEmail(email);
        const id = await getUserId(email);
        if (id) {
            setUserId(id);
        } else {
            console.error('Failed to get user ID');
        }
    };

    const handleDifficultyChange = async (difficulty: Difficulty) => {
        console.log("Selected difficulty:", difficulty);
        setUserDifficulty(difficulty);
        if (userEmail && userId) {
            handleButtonClick(difficulty, userEmail);
            const currentUrl = window.location.href;
            await logDifficultyButtonPress(userId, difficulty.toLowerCase() as 'easy' | 'medium' | 'hard', currentUrl);
        }
        else {
            throw new Error("problem.") // TODO: handle (should never hit this though)
        }
    };

    const handleTryAgain = async () => {
        setUserDifficulty(null);
        if (userId) {
            const currentUrl = window.location.href;
            await logTryAgainButtonPress(userId, currentUrl);
        }
    };

    const handleToggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <div id="lanki-root">
            <Draggable handle=".widget-toolbar" bounds="body">
                <div
                    id="lanki-main"
                    className={`
                        fixed top-[100px] left-[100px] z-[9999] 
                        bg-white border border-gray-300 rounded-2xl 
                        shadow-2xl overflow-hidden text-black [color-scheme:light]
                        will-change-transform
                        ${isMinimized ? 'lanki-minimized' : 'lanki-maximized'}
                    `}
                    style={{
                        width: isMinimized ? '120px' : '320px',
                        transition: 'width 300ms ease-in-out'
                    }}
                >
                    <Toolbar
                        isMinimized={isMinimized}
                        onToggleMinimize={handleToggleMinimize}
                    />

                    <div
                        className={`
                            will-change-transform
                            ${isMinimized ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'}
                        `}
                        style={{
                            transition: 'opacity 300ms ease-in-out, height 300ms ease-in-out'
                        }}
                    >
                        {userEmail ? (
                            <div className="p-[10px] border">
                                <Logo logoUrl={logoUrl} />
                                <CurrentProblem
                                    title={problemTitle}
                                    difficulty={problemDifficulty ?? "Unknown" as Difficulty}
                                />
                                <DifficultyRating
                                    selectedDifficulty={userDifficulty}
                                    onSelectDifficulty={handleDifficultyChange}
                                    onTryAgain={handleTryAgain}
                                    userId={userId!}
                                />
                                <UpcomingProblems problems={nextProblems} isLoading={isLoadingProblems} userId={userId} />
                            </div>
                        ) : (
                            <div className="p-[10px]">
                                <Login onLoginSuccess={handleLoginSuccess} />
                            </div>
                        )}
                    </div>
                </div>
            </Draggable>
        </div>
    );
};

export default Lanki;
