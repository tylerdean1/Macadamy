import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/pages/StandardPages/StandardPageComponents/Logo';
import { DemoButton } from '@/pages/StandardPages/StandardPageComponents/DemoButton';
import { FeatureSection } from '@/pages/StandardPages/StandardPageComponents/FeatureSection';
import { FEATURE_SECTIONS } from '@/pages/StandardPages/StandardPageComponents/LandingPage.features';
import { AuthForm } from '@/pages/StandardPages/StandardPageComponents/AuthForm';
import { Building2, ShieldCheck, Clock, Users } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const WHY_CHOOSE = useMemo(
    () => [
      {
        icon: <Building2 className="w-12 h-12" />,
        title: 'All-in-One Solution',
        text: 'Everything you need to manage construction projects in one place',
      },
      {
        icon: <ShieldCheck className="w-12 h-12" />,
        title: 'Secure & Reliable',
        text: 'Enterprise-grade security and data protection',
      },
      {
        icon: <Clock className="w-12 h-12" />,
        title: 'Real-time Updates',
        text: 'Instant access to project data and updates',
      },
      {
        icon: <Users className="w-12 h-12" />,
        title: 'Team Collaboration',
        text: 'Seamless communication between all project stakeholders',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero + Auth */}
      <div className="bg-background-light border-b border-background-lighter">
        <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center gap-12">
          {/* Left column */}
          <div className="lg:w-1/2 space-y-10">
            <Logo />
            <h1 className="text-4xl font-bold text-white leading-tight">
              End-to-End
              <br />
              <span className="text-primary">Construction Intelligence</span>
            </h1>
            <p className="text-xl text-gray-400">
              Streamline your construction projects with our comprehensive platform.
            </p>
            <DemoButton />
          </div>
          {/* Right column: Auth form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <AuthForm
              onNavigateToSignup={() => navigate('/onboarding')}
              onNavigateToResetPassword={() => navigate('/reset-password')}
            />
          </div>
        </div>
      </div>
      {/* Main Feature Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Comprehensive Project Management
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURE_SECTIONS.map((section) => (
            <FeatureSection key={section.title} {...section} />
          ))}
        </div>
      </section>
      {/* Why Choose Our Platform */}
      <section className="bg-background-light py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_CHOOSE.map(({ icon, title, text }) => (
              <div key={title} className="text-center">
                <div className="text-primary mb-4 flex justify-center">{icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
                <p className="text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
