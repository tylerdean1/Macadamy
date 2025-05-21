// pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-8">
      <h1 className="text-5xl font-bold text-white mb-6">404</h1>
      <p className="text-gray-400 mb-8">Page not found, bro. Let’s get you back on track.</p>
      <Link
        to="/dashboard"
        className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded transition-all"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
