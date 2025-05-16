import { Button } from '@/pages/StandardPages/StandardPageComponents/button'; 
import { useAuth } from '@/hooks/useAuth';

export function DemoButton() {
  const { loginAsDemoUser, loading } = useAuth();
  
  return (
    <Button 
      variant="primary" 
      size="lg" 
      onClick={loginAsDemoUser}
      disabled={loading}
    >
      {loading ? 'Loading Demo...' : 'Try the Demo'}
    </Button>
  );
}