import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/pages/StandardPages/StandardPageComponents/Logo';
import { FeatureSection } from '@/pages/StandardPages/StandardPageComponents/FeatureSection';
import { FEATURE_SECTIONS } from '@/pages/StandardPages/StandardPageComponents/LandingPage.features';
import { AuthForm } from '@/pages/StandardPages/StandardPageComponents/AuthForm';
import { Page, SectionContainer } from '@/components/Layout';
import { Building2, ShieldCheck, Clock, Users } from 'lucide-react';

export default function LandingPage() {
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
    <Page>
      {/* Hero + Auth */}
      <div className="bg-background-light border-b border-background-lighter">
        <SectionContainer className="py-16 flex flex-col xl:flex-row items-start gap-16 xl:gap-24 min-w-0">
          {/* Left column */}
          <div className="flex-grow shrink min-w-0 space-y-8">
            <div className="scale-90 sm:scale-100 md:scale-100 lg:scale-100 xl:scale-110 origin-left transition-transform">
              <Logo />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              End-to-End
              <br />
              <span className="text-primary">Construction Intelligence</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl">
              Streamline your construction projects with our comprehensive platform.
            </p>
          </div>

          {/* Right column: Auth form */}
          <div className="w-full max-w-md shrink-0 lg:ml-auto">
            <AuthForm
              onNavigateToSignup={() => navigate('/onboarding')}
              onNavigateToResetPassword={() => navigate('/reset-password')}
            />
          </div>
        </SectionContainer>
      </div>

      {/* Main Feature Grid */}
      <section>
        <SectionContainer className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Comprehensive Project Management
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURE_SECTIONS.map((section) => (
              <FeatureSection key={section.title} {...section} />
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* Why Choose Our Platform */}
      <section className="bg-background-light py-16">
        <SectionContainer>
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
        </SectionContainer>
      </section>

      {/* Name Origin */}
      <section className="py-12">
        <SectionContainer>
          <p className="text-center text-gray-400 text-sm max-w-2xl mx-auto">
            The name <strong>Macadamy</strong> derives from the verb <em>macadamize</em>,
            meaning "to pave a road with compacted layers of stone bound with asphalt."<br />
            Our platform aspires to provide that same solid foundation for your projects.
          </p>
        </SectionContainer>
      </section>
    </Page>
  );
}
