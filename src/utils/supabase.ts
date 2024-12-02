// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://grujocgzctulcyxpodut.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydWpvY2d6Y3R1bGN5eHBvZHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI0NDM4MDcsImV4cCI6MjAyODAxOTgwN30.PXzR5rGNJTH5k0JjvhUYt9GnWlartsGtg9xOpdyIQHY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);