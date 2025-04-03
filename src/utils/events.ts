import { supabase } from "./supabase";

export async function logDifficultyButtonPress(userId: number, difficulty: 'easy' | 'medium' | 'hard', problem: string) {
  const { error } = await supabase
    .from('events')
    .insert([
      { user_id: userId, event_type: 'difficulty_button_press', difficulty, problem }
    ]);

  if (error) {
    console.error('Error logging difficulty_button_press:', error);
  }
}

export async function logTryAgainButtonPress(userId: number, problem: string) {
  const { error } = await supabase
    .from('events')
    .insert([
      { user_id: userId, event_type: 'try_again_button_press', problem }
    ]);

  if (error) {
    console.error('Error logging try_again_button_press:', error);
  }
}

export async function logUpcomingProblemButtonPress(userId: number, rank: number) {
  const { error } = await supabase
    .from('events')
    .insert([
      { user_id: userId, event_type: 'upcoming_problem_button_press', rank }
    ]);

  if (error) {
    console.error('Error logging upcoming_problem_button_press:', error);
  }
}
