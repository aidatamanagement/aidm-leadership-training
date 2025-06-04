import React from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '@/contexts/ServiceContext';
import { GlassCard } from '@/components/ui/glass-card';
import AppLayout from '@/components/AppLayout';
import { BookOpen, Lightbulb, Cpu, LineChart, Users, ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <section className="w-full bg-gradient-to-br from-green-5 via-blue-50 pt-4 pb-12 min-h-screen">
          <Button variant="ghost" size="sm" asChild className="mb-4 ml-4">
            <a href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to services
            </a>
          </Button>
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

  // Custom content for Digital Transformation Package
  if (service.title === 'Digital Transformation') {
    return (
      <AppLayout>
        <section className="w-full bg-gradient-to-br from-green-5 via-blue-50 pt-4 pb-12 min-h-screen">
          <Button variant="ghost" size="sm" asChild className="mb-4 ml-4">
            <a href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to services
            </a>
          </Button>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm">
                Digital Transformation Package
              </h1>
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
                Redefine Your Digital Presence — Accelerate Your AI Journey
              </p>

            </div>

            {/* Key Components - Card Grid */}
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Key Components</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-green-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-600 cursor-pointer">
                  <BookOpen className="h-10 w-10 text-green-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Website & Brand Optimization</h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>Comprehensive audit of existing website structure and content.</li>
                    <li>UX-driven redesign for enhanced user experience.</li>
                    <li>Refined brand messaging to clearly articulate your unique value proposition.</li>
                    <li>Conversion-optimized landing pages aligned with your strategic goals.</li>
                  </ul>
                </div>
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-blue-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-600 cursor-pointer">
                  <Search className="h-10 w-10 text-blue-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">AI-Driven Content & SEO Strategy</h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>Tailored AI content generation for blogs, white papers, and marketing collateral.</li>
                    <li>Advanced SEO optimization to improve organic visibility and audience reach.</li>
                    <li>Automated keyword planning and content scheduling for consistent engagement.</li>
                  </ul>
                </div>
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-purple-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-600 cursor-pointer">
                  <Cpu className="h-10 w-10 text-purple-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Social Media Automation & Strategy</h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>AI-driven social media content calendar.</li>
                    <li>Automated scheduling, publishing, and analytics.</li>
                    <li>Enhanced brand consistency and audience interaction.</li>
                  </ul>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-yellow-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-yellow-600 cursor-pointer">
                  <Users className="h-10 w-10 text-yellow-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Executive LinkedIn Profile Enhancement</h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>Comprehensive review and optimization of executive LinkedIn profiles.</li>
                    <li>Strategic recommendations for visibility and thought leadership.</li>
                    <li>Customized, AI-supported content plans for executives.</li>
                  </ul>
                </div>
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-pink-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-pink-600 cursor-pointer">
                  <MessageCircle className="h-10 w-10 text-pink-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Optional AI Chatbot & Content Assistant</h3>
                  <ul className="list-disc pl-4 text-gray-700 text-sm text-left space-y-1">
                    <li>AI-powered chatbot for website visitor engagement and FAQs.</li>
                    <li>AI-driven content assistant for marketing and social media.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Outcomes Section */}
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Outcomes You Can Expect</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 flex items-center gap-4 border-l-4 border-green-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-600 cursor-pointer">
                  <span className="text-3xl">🌐</span>
                  <div>
                    <div className="font-semibold text-gray-900">Online Visibility & Brand Credibility</div>
                    <div className="text-gray-700 text-sm">Dramatically increase your online visibility and brand credibility.</div>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4 border-l-4 border-blue-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-600 cursor-pointer">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <div className="font-semibold text-gray-900">Thought Leadership</div>
                    <div className="text-gray-700 text-sm">Establish your leadership team as trusted thought leaders within your industry.</div>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4 border-l-4 border-purple-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-600 cursor-pointer">
                  <span className="text-3xl">📈</span>
                  <div>
                    <div className="font-semibold text-gray-900">Lead Generation & Engagement</div>
                    <div className="text-gray-700 text-sm">Improve lead generation and audience engagement through targeted AI-enhanced content.</div>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4 border-l-4 border-yellow-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-yellow-600 cursor-pointer">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <div className="font-semibold text-gray-900">Marketing Automation</div>
                    <div className="text-gray-700 text-sm">Automate repetitive marketing tasks, freeing your team for strategic initiatives.</div>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4 border-l-4 border-pink-500 bg-white/60 backdrop-blur-sm rounded-xl shadow transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-pink-600 cursor-pointer">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <div className="font-semibold text-gray-900">AI Adoption Foundation</div>
                    <div className="text-gray-700 text-sm">Lay a solid digital foundation that accelerates successful AI adoption.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ideal for Section */}
            <div className="p-0 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Ideal for</h2>
              <ul className="grid md:grid-cols-2 gap-6 list-none">
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-green-600">🏢</span>
                  <div>
                    <div className="font-semibold text-gray-900">Organizations</div>
                    <div className="text-gray-700 text-sm">Beginning or accelerating their digital and AI transformation journey.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-blue-600">💼</span>
                  <div>
                    <div className="font-semibold text-gray-900">Companies</div>
                    <div className="text-gray-700 text-sm">Needing to modernize their digital presence and align it with strategic business objectives.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-purple-600">🧑‍💼</span>
                  <div>
                    <div className="font-semibold text-gray-900">Executives</div>
                    <div className="text-gray-700 text-sm">Aiming to enhance their industry influence and visibility online.</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Why Choose Section */}
            <div className="p-0 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Why Choose AIDM?</h2>
              <ul className="grid md:grid-cols-2 gap-6 list-none">
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-green-600">✔️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Strategically Aligned Solutions</div>
                    <div className="text-gray-700 text-sm">Digital transformation tailored explicitly to your strategic AI adoption goals.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-blue-600">🤖</span>
                  <div>
                    <div className="font-semibold text-gray-900">AI-Powered Automation</div>
                    <div className="text-gray-700 text-sm">Cutting-edge generative AI tools integrated into every aspect of your digital strategy.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-purple-600">🌟</span>
                  <div>
                    <div className="font-semibold text-gray-900">Executive Visibility & Thought Leadership</div>
                    <div className="text-gray-700 text-sm">Proven methods for positioning leaders prominently within their industries.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-yellow-600">📊</span>
                  <div>
                    <div className="font-semibold text-gray-900">Measurable ROI</div>
                    <div className="text-gray-700 text-sm">Transparent metrics tracking, ensuring your investment delivers clear, sustainable results.</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </AppLayout>
    );
  }

  // Custom content for AI Architecture & Custom Agents
  if (service.title === 'AI Architecture & Custom Agents') {
    return (
      <AppLayout>
        <section className="w-full from-orange-50 via-blue-50 pt-4 pb-12 min-h-screen">
          <Button variant="ghost" size="sm" asChild className="mb-4 ml-4">
            <a href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to services
            </a>
          </Button>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm">AI Architecture & Custom Agents</h1>
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">Unlock Your Business Potential with Custom AI Agents</p>
              <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">Tailored, AI-powered assistants designed specifically to streamline your operations, automate workflows, and drive strategic decision-making.</p>
            </div>

            {/* First 3 Questions as Card Grid */}
            <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: What is AI Architecture? */}
              <div className="flex flex-col items-start rounded-2xl shadow p-6 border-l-4 border-orange-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-orange-500 cursor-pointer">
                <Cpu className="h-8 w-8 text-orange-500 mb-3" />
                <h2 className="text-xl font-bold mb-2 tracking-tight">What is AI Architecture?</h2>
                <p className="text-gray-700 text-base mb-0">AI Architecture is the foundational structure behind any AI system—like a building's blueprint. It defines how data flows, how the AI learns and processes information, and how users interact with the AI solution. A well-designed architecture ensures your AI systems perform reliably, adapt to your needs, and scale as you grow.</p>
              </div>
              {/* Card 2: What Are Custom AI Agents? */}
              <div className="flex flex-col items-start rounded-2xl shadow p-6 border-l-4 border-blue-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-500 cursor-pointer">
                <Users className="h-8 w-8 text-blue-500 mb-3" />
                <h2 className="text-xl font-bold mb-2 tracking-tight">What Are Custom AI Agents?</h2>
                <p className="text-gray-700 text-base mb-2">Custom AI Agents are digital assistants tailored to your workflows. They deeply understand your operations, integrate with your systems, and automate routine tasks.</p>
                <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                  <li><span className="font-medium">HR Assistant:</span> Automates recruitment and onboarding.</li>
                  <li><span className="font-medium">Onboarding Guide:</span> Delivers training and compliance tracking.</li>
                  <li><span className="font-medium">Finance Assistant:</span> Streamlines invoicing and reporting.</li>
                  <li><span className="font-medium">Customer Support Agent:</span> Handles queries and troubleshooting.</li>
                </ul>
              </div>
              {/* Card 3: Our Approach */}
              <div className="flex flex-col items-start rounded-2xl shadow p-6 border-l-4 border-purple-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-500 cursor-pointer">
                <Lightbulb className="h-8 w-8 text-purple-500 mb-3" />
                <h2 className="text-xl font-bold mb-2 tracking-tight">Our Approach</h2>
                <ol className="list-decimal pl-5 text-gray-700 text-sm space-y-1">
                  <li><span className="font-semibold">Needs Assessment:</span> We analyze your workflows and challenges.</li>
                  <li><span className="font-semibold">Design & Integration:</span> We build and integrate your custom agent.</li>
                  <li><span className="font-semibold">Pilot & Optimize:</span> We test, gather feedback, and refine for lasting results.</li>
                </ol>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Benefits of Implementing Custom AI Agents</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-green-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-600 cursor-pointer">
                  <span className="text-3xl">⚡️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Increased Operational Efficiency</div>
                    <div className="text-gray-700 text-sm">Automate routine tasks, reducing operational bottlenecks and significantly increasing productivity.</div>
                  </div>
                </div>
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-blue-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-600 cursor-pointer">
                  <span className="text-3xl">📝</span>
                  <div>
                    <div className="font-semibold text-gray-900">Reduction of Manual Tasks & Errors</div>
                    <div className="text-gray-700 text-sm">Minimize human error and free your workforce to focus on strategic, high-value tasks.</div>
                  </div>
                </div>
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-purple-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-600 cursor-pointer">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <div className="font-semibold text-gray-900">Enhanced Employee Productivity</div>
                    <div className="text-gray-700 text-sm">Empower employees with AI-powered support, helping them achieve more in less time.</div>
                  </div>
                </div>
                <div className="relative flex flex-col items-center rounded-2xl shadow-md p-6 border-t-4 border-yellow-500 bg-white/60 backdrop-blur-sm transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-yellow-600 cursor-pointer">
                  <span className="text-3xl">🔒</span>
                  <div>
                    <div className="font-semibold text-gray-900">Consistent Compliance & Data Security</div>
                    <div className="text-gray-700 text-sm">AI agents proactively manage compliance, ensuring adherence to standards like GDPR and HIPAA, and safeguarding sensitive data.</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Ready to Explore Section */}
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold mb-4">Ready to Explore AI's Full Potential?</h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">Discover how prepared your organization is for AI implementation and identify the right custom AI agent solution for your business.</p>
            </div>

            {/* About AIDM Section */}
            <div className="p-0 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Why Choose AIDM?</h2>
              <ul className="grid md:grid-cols-2 gap-6 list-none">
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-green-600">✔️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Tailored AI Solutions</div>
                    <div className="text-gray-700 text-sm">We design and deploy AI agents that are custom-fit to your business, not generic one-size-fits-all tools.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-blue-600">🤝</span>
                  <div>
                    <div className="font-semibold text-gray-900">Collaborative Partnership</div>
                    <div className="text-gray-700 text-sm">We work closely with your team at every stage, ensuring seamless integration and maximum impact.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-purple-600">🔒</span>
                  <div>
                    <div className="font-semibold text-gray-900">Security & Compliance</div>
                    <div className="text-gray-700 text-sm">Our solutions are built with security and compliance at the core, protecting your data and reputation.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-yellow-600">🚀</span>
                  <div>
                    <div className="font-semibold text-gray-900">Proven Results</div>
                    <div className="text-gray-700 text-sm">AIDM has a track record of delivering measurable improvements in efficiency, productivity, and ROI.</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </AppLayout>
    )
  }

  // Custom content for AI Advisory & Consultancy
  if (service.title === 'AI Advisory & Consultancy') {
    return (
      <AppLayout>
        <section className="w-full from-blue-50 via-gray-50 to-purple-50 pt-4 pb-12 min-h-screen">
          <Button variant="ghost" size="sm" asChild className="mb-4 ml-4">
            <a href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to services
            </a>
          </Button>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm">AI Advisory & Consultancy Services</h1>
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">Personalized, flexible AI consulting and advisory designed to meet your unique business objectives — no matter where you are on your AI journey.</p>
            </div>

            {/* Flexible AI Advisory Solutions */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-4 tracking-tight text-center">Flexible AI Advisory Solutions</h2>
              <p className="text-gray-700 text-lg mb-8 text-center max-w-3xl mx-auto">AIDM's À la Carte Advisory & Consultancy Services offer targeted, customized expertise precisely when and how you need it. Rather than a one-size-fits-all approach, we provide flexible, bespoke engagements designed to address your organization's specific AI challenges and goals.</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-blue-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Short-term Strategic Advisory</h3>
                  <p className="text-gray-700 text-base mb-0">Targeted expert advice for immediate business needs and opportunities.</p>
                </div>
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-green-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project-based AI Implementation Guidance</h3>
                  <p className="text-gray-700 text-base mb-0">Dedicated consulting for specific AI projects, ensuring successful integration and measurable ROI.</p>
                </div>
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-purple-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom AI Training Workshops</h3>
                  <p className="text-gray-700 text-base mb-0">Tailored sessions to upskill your team in AI fundamentals, advanced applications, and strategic implementation.</p>
                </div>
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-yellow-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-yellow-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Executive Coaching for AI Adoption</h3>
                  <p className="text-gray-700 text-base mb-0">Personalized coaching designed to prepare executives to confidently lead AI transformation.</p>
                </div>
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-pink-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-pink-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialized AI Compliance Consulting</h3>
                  <p className="text-gray-700 text-base mb-0">Expert guidance to maintain compliance with critical standards such as GDPR, HIPAA, and SOC 2.</p>
                </div>
              </div>
            </div>

            {/* Ideal for Section */}
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Ideal for Clients Who:</h2>
              <ul className="grid md:grid-cols-2 gap-6 list-none max-w-3xl mx-auto">
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-blue-600">🎯</span>
                  <div>
                    <div className="font-semibold text-gray-900">Need specialized expertise for targeted projects or pressing challenges.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-green-600">🔄</span>
                  <div>
                    <div className="font-semibold text-gray-900">Prefer flexible, customized engagements over fixed, structured frameworks.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-purple-600">🔍</span>
                  <div>
                    <div className="font-semibold text-gray-900">Are exploring AI opportunities but not yet ready to commit to a comprehensive adoption program.</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* How We Create Customized Offers */}
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">How We Create Customized Offers</h2>
              <ol className="list-decimal pl-6 text-gray-700 text-base max-w-3xl mx-auto space-y-4">
                <li>
                  <span className="font-semibold">Initial Free Consultation:</span> We start with a complimentary consultation to clearly understand your organization's unique challenges, current landscape, and strategic goals.
                </li>
                <li>
                  <span className="font-semibold">Tailored Proposal with Transparent Pricing:</span> Next, we develop a customized proposal outlining recommended services, clear objectives, deliverables, timelines, and transparent pricing—giving you complete clarity before you commit.
                </li>
                <li>
                  <span className="font-semibold">Flexible, Scalable Engagement:</span> Once engaged, our expert consultants deliver flexible, scalable support that can adjust as your needs evolve, ensuring you receive precisely the expertise and resources required for success.
                </li>
              </ol>
            </div>

         

            {/* Popular À la Carte Services */}
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Popular À la Carte Services</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-blue-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Executive AI Literacy Workshops</h3>
                  <p className="text-gray-700 text-base mb-0">Equip leadership teams with the critical knowledge and skills to confidently drive AI initiatives.</p>
                </div>
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-green-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Driven Workflow Analysis</h3>
                  <p className="text-gray-700 text-base mb-0">Identify and prioritize opportunities for workflow automation, efficiency gains, and productivity improvements.</p>
                </div>
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-purple-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Agent Pilot Programs</h3>
                  <p className="text-gray-700 text-base mb-0">Launch and test custom AI agents within targeted business units to validate effectiveness and measure potential ROI.</p>
                </div>
                <div className="relative flex flex-col items-start rounded-2xl shadow-md p-6 border-t-4 border-yellow-400 bg-white/80 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:border-yellow-500 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Data Optimization Sessions</h3>
                  <p className="text-gray-700 text-base mb-0">Strengthen your data foundation, enhance compliance, and prepare your organization for effective AI implementation.</p>
                </div>
              </div>
            </div>
               {/* Why Choose AIDM Section */}
               <div className="p-0 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Why Choose AIDM?</h2>
              <ul className="grid md:grid-cols-2 gap-6 list-none">
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-blue-600">🎯</span>
                  <div>
                    <div className="font-semibold text-gray-900">Expertise On Demand</div>
                    <div className="text-gray-700 text-sm">Access top-tier AI consultants and trainers exactly when you need them.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-green-600">🔄</span>
                  <div>
                    <div className="font-semibold text-gray-900">Flexible Engagements</div>
                    <div className="text-gray-700 text-sm">Bespoke, scalable support—no rigid contracts or one-size-fits-all programs.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-purple-600">🤝</span>
                  <div>
                    <div className="font-semibold text-gray-900">Collaborative Partnership</div>
                    <div className="text-gray-700 text-sm">We work closely with your team to ensure seamless integration and real results.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl text-yellow-600">🚀</span>
                  <div>
                    <div className="font-semibold text-gray-900">Proven Outcomes</div>
                    <div className="text-gray-700 text-sm">AIDM delivers measurable improvements in efficiency, compliance, and ROI.</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </AppLayout>
    )
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