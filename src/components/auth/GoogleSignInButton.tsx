import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { supabase } from '@/lib/supabase';

interface GoogleSignInButtonProps {
  className?: string;
}

export function GoogleSignInButton({ className = '' }: GoogleSignInButtonProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
