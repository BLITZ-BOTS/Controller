import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { createClient } from '@supabase/supabase-js';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  provider_token: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  email: string;
}

const supabase = createClient(
  'https://fewdjowxiqfzsfixqbzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZld2Rqb3d4aXFmenNmaXhxYnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMDM5MDIsImV4cCI6MjA0NjY3OTkwMn0.SvzrrIcLU8lCrv-xcNFoHoOdqLh8n7wvE5TZ5QFl32s'
);

export async function handleDeepLink() {
  await onOpenUrl((urls) => {
    const payload = urls[0];

    if (payload.startsWith('blitz-controller://oauth/callback')) {
      try {
        // Get hash fragment from URL
        const hashFragment = payload.split('#')[1];
        if (!hashFragment) throw new Error('No hash fragment in URL');

        // Parse hash parameters
        const params = new URLSearchParams(hashFragment);
        const authData: AuthResponse = {
          access_token: params.get('access_token') || '',
          refresh_token: params.get('refresh_token') || '',
          expires_in: parseInt(params.get('expires_in') || '3600'),
          provider_token: params.get('provider_token') || '',
        };

        if (!authData.access_token) {
          throw new Error('No access token found');
        }

        // Pass auth data to handler
        handleAuthSession(authData);
      } catch (error) {
        console.error('Deep link error:', error);
      }
    }
  });
}

async function handleAuthSession(data: AuthResponse) {
  try {
    // Correct - using public anon key configured in supabase client

    const { error: sessionError, data: authData } =
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    console.log(authData);

    if (sessionError) throw sessionError;

    // Get user profile
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;

    // Store user data
    const userProfile: UserProfile = {
      id: userData.user.id,
      username: userData.user.user_metadata.user_name,
      avatar_url: userData.user.user_metadata.avatar_url,
      email: userData.user.email || '',
    };

    // Store in local storage
    localStorage.setItem('user_profile', JSON.stringify(userProfile));

    console.log('User profile:', userProfile);
    return { profile: userProfile, error: null };
  } catch (error) {
    console.error('Session handling error:', error);
    return { profile: null, error };
  }
}
