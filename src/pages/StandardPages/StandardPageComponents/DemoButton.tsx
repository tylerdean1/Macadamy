import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { useNavigate } from 'react-router-dom';

export function DemoButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={() => navigate('/demo')}
    >
      Try the Demo
    </Button>
  );
}