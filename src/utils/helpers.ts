import { Difficulty } from './shared_interfaces';

export const get_current_problem = (url: string): string | null => {
    if (url === 'https://leetcode.com/problems/' || url === 'https://leetcode.com/problemset/') {
        return 'nothing';
    }
    const regex = /\/problems\/([\w-]+)\//;
    const match = url.match(regex)
    if (match && match[1]) {
        return capitalizeWords(match[1].replace(/-/g, ' ')); // Convert to readable title
    }
    return null
};

export function capitalizeWords(str: string) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function getProblemName(url: string): string {
    const parts = url.split('/');
    const problemNameIndex = parts.findIndex(part => part === 'problems') + 1;
    const problemNameSlug = parts[problemNameIndex];

    if (!problemNameSlug) {
        console.warn('Problem name slug not found in URL:', url);
        return 'Unknown Problem';
    }

    const problemName = problemNameSlug.replace(/-/g, ' '); // Replace hyphens with spaces
    return capitalizeWords(problemName);
}

function getProblemSlug(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      const index = parts.indexOf('problems');
      if (index !== -1 && index + 1 < parts.length) {
        return parts[index + 1];
      }
    } catch (e) {
      console.error('Invalid URL:', e);
    }
    return null;
  }

  export async function fetchProblemDifficulty(url: string): Promise<Difficulty> {
    const slug = getProblemSlug(url);
    if (!slug) {
        throw new Error('Invalid LeetCode problem URL');
    }
  
    const query = `
      query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          difficulty
        }
      }
    `;
    const variables = { titleSlug: slug };
    const payload = {
        operationName: "getQuestionDetail",
        query: query,
        variables: variables,
    };
    
    try {
        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': `https://leetcode.com/problems/${slug}/`,
                'User-Agent': 'Mozilla/5.0 (compatible; AcmeInc/3.0)',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const difficulty = data.data.question.difficulty;

        if (difficulty === 'Easy' || difficulty === 'Medium' || difficulty === 'Hard') {
            return difficulty as Difficulty;
        } else {
            throw new Error(`Unknown difficulty level received: ${difficulty}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}