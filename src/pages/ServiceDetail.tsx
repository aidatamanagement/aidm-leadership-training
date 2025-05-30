import React from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '@/contexts/ServiceContext';
import { GlassCard } from '@/components/ui/glass-card';
import AppLayout from '@/components/AppLayout';
import { BookOpen, Lightbulb, Cpu, LineChart, Users } from 'lucide-react';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { services } = useServices();
  const service = services.find(s => s.id === id);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-12 w-12 text-green-600" />;
      case 'framework':
        return <Lightbulb className="h-12 w-12 text-blue-600" />;
      case 'transformation':
        return <LineChart className="h-12 w-12 text-purple-600" />;
      case 'architecture':
        return <Cpu className="h-12 w-12 text-orange-600" />;
      case 'advisory':
        return <Users className="h-12 w-12 text-red-600" />;
      default:
        return <BookOpen className="h-12 w-12 text-gray-600" />;
    }
  };

  if (!service) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Service not found</div>
        </div>
      </AppLayout>
    );
  }

  // Custom content for AI Adoption Framework
  if (service.title === 'AI Adoption Framework') {
    return (
      <AppLayout>
        <section className="w-full bg-gradient-to-br from-green-5 via-blue-50 py-12 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
            {/* Hero Section - no image */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm">Your Roadmap to Strategic AI Adoption</h1>
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">Transform your operations, streamline workflows, and build competitive advantage with our structured, phased AI adoption framework.</p>
            </div>

            {/* Framework Overview - no GlassCard */}
            <div className="p-0 mb-12">
              <h2 className="text-2xl font-bold  mb-2 tracking-tight">AI Adoption Framework</h2>
              <p className="text-gray-700 text-lg mb-2">AIDM's 12-month framework guides organizations through digital transformation and AI integration. Our phased approach ensures efficiency, measurable ROI, and long-term success—without overwhelming your resources.</p>
            </div>

            {/* Phases Timeline */}
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">The 4 Phases of AI Adoption</h2>
              <div className="grid md:grid-cols-4 gap-8">
                {/* Phase 1 */}
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-green-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-600 cursor-pointer">
                  <Lightbulb className="h-10 w-10 text-green-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Phase 1<br /><span className='text-green-700 font-normal'>(Months 1–3)</span></h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>AI Readiness Assessment</li>
                    <li>AI Strategy Roadmap</li>
                    <li>Digital Transformation</li>
                    <li>Executive AI Training Kick-Off</li>
                  </ul>
                </div>
                {/* Phase 2 */}
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-blue-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-600 cursor-pointer">
                  <Cpu className="h-10 w-10 text-blue-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Phase 2<br /><span className='text-blue-700 font-normal'>(Months 4–6)</span></h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>Workflow Analysis & Automation</li>
                    <li>Advanced AI Tool Integration</li>
                    <li>Hands-on AI Training</li>
                  </ul>
                </div>
                {/* Phase 3 */}
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-purple-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-600 cursor-pointer">
                  <Users className="h-10 w-10 text-purple-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Phase 3<br /><span className='text-purple-700 font-normal'>(Months 7–9)</span></h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>Custom AI Agent Creation</li>
                    <li>Seamless Integration</li>
                    <li>Pilot Testing & Optimization</li>
                  </ul>
                </div>
                {/* Phase 4 */}
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-yellow-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-yellow-600 cursor-pointer">
                  <LineChart className="h-10 w-10 text-yellow-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Phase 4<br /><span className='text-yellow-700 font-normal'>(Months 10–12)</span></h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>Full-Scale Deployment</li>
                    <li>Continuous Optimization</li>
                    <li>Ongoing Support & Training</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Outcomes Section */}
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Outcomes You Can Expect</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 flex items-center gap-4 border-l-4 border-green-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-600 cursor-pointer">
                  <span className="text-3xl">⚡️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Operational Efficiency</div>
                    <div className="text-gray-700 text-sm">Significantly reduce manual processes, freeing your team for strategic tasks.</div>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4 border-l-4 border-blue-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-600 cursor-pointer">
                  <span className="text-3xl">📊</span>
                  <div>
                    <div className="font-semibold text-gray-900">Improved Decision-Making</div>
                    <div className="text-gray-700 text-sm">Leverage real-time analytics and predictive insights for smarter, faster decisions.</div>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4 border-l-4 border-purple-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-600 cursor-pointer">
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Enhanced Compliance</div>
                    <div className="text-gray-700 text-sm">Maintain rigorous compliance with GDPR, HIPAA, and industry-specific regulations through automated monitoring.</div>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4 border-l-4 border-yellow-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-yellow-600 cursor-pointer">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <div className="font-semibold text-gray-900">Competitive Advantage</div>
                    <div className="text-gray-700 text-sm">Stay ahead by strategically adopting AI solutions tailored for your business.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Section */}
            <div className="p-0 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Why Choose AIDM?</h2>
              <ul className="grid md:grid-cols-2 gap-6 list-none">
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-green-600">✔️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Proven Methodology</div>
                    <div className="text-gray-700 text-sm">Structured, phased framework proven to deliver measurable ROI.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-blue-600">🎯</span>
                  <div>
                    <div className="font-semibold text-gray-900">Tailored Solutions</div>
                    <div className="text-gray-700 text-sm">Customized AI strategy aligning with your unique operational needs and business goals.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-purple-600">🤝</span>
                  <div>
                    <div className="font-semibold text-gray-900">Expert Guidance</div>
                    <div className="text-gray-700 text-sm">Experienced consultants providing hands-on support throughout every stage.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-yellow-600">🔒</span>
                  <div>
                    <div className="font-semibold text-gray-900">Ethical & Secure</div>
                    <div className="text-gray-700 text-sm">Compliance-first approach prioritizing data security and regulatory adherence.</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlassCard className="p-8">
          <div className="flex items-center space-x-6 mb-8">
            {getServiceIcon(service.type)}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mt-2">
                {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 text-lg mb-6">{service.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Overview</h2>
              <p className="text-gray-600">
                This is a demo page for the {service.title} service. The actual content and functionality
                will be implemented based on the specific requirements of each service type.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default ServiceDetail; 