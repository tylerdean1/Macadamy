import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { supabase } from '@/lib/supabase';

interface GoogleSignInButtonProps {
  className?: string;
}

const SITE_URL = import.meta.env.PROD
  ? 'https://macadamy.io'
  : 'http://localhost:5173';

export function GoogleSignInButton({ className = '' }: GoogleSignInButtonProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${SITE_URL}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start Google sign-in.';
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      onClick={() => {
        void handleGoogleSignIn();
      }}
      disabled={isLoading}
      isLoading={isLoading}
    >
      Continue with Google
    </Button>
  );
}
