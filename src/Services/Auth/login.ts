import { createClient } from '@supabase/supabase-js';
import { open } from '@tauri-apps/plugin-shell';

const supabase = createClient(
  'https://fewdjowxiqfzsfixqbzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZld2Rqb3d4aXFmenNmaXhxYnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMDM5MDIsImV4cCI6MjA0NjY3OTkwMn0.SvzrrIcLU8lCrv-xcNFoHoOdqLh8n7wvE5TZ5QFl32s'
);

export async function githubLogin() {
  try {
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'blitz-controller://oauth/callback',
        skipBrowserRedirect: true, // Prevent auto redirect
      },
    });

    if (data.url) {
      await open(data.url); // Open auth URL in default browser
    }

    return { data, error: null };
  } catch (error) {
    console.error('GitHub login error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to login',
    };
  }
}
