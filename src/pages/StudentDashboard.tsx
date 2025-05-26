import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Course } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PROMPTS = [
  {
    title: 'New Hire Email Welcome',
    context: 'We want to standardize the welcome email sent to new employees.',
    role: 'You are an internal HR assistant specializing in employee communication.',
    interview: 'Ask me for any missing details about company values or tone.',
    task: 'Draft a warm, professional welcome email for new hires that includes team introduction, first-day expectations, and contact information.',
    boundaries: 'Keep it under 200 words and avoid listing technical setup instructions.'
  },
  {
    title: 'Customer FAQ Drafting',
    context: 'We need to update our FAQ page to address top customer concerns about shipping and returns.',
    role: 'You are a customer support content writer for a mid-size eCommerce company.',
    interview: 'Ask which products or regions need clarification.',
    task: 'Write 5 concise FAQ entries with friendly, informative answers.',
    reasoning: 'After each answer, include a note on why this information is important to include.'
  },
  {
    title: 'Internal Training Summary',
    context: 'Managers often need a quick reference after our internal training sessions.',
    role: 'You are an internal training assistant summarizing session materials.',
    interview: 'Ask what the training covered and who the audience is.',
    task: 'Generate a 1-page executive summary from the uploaded training slides.',
    boundaries: 'Avoid jargon or detailed definitions; keep it high-level.'
  }
];

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' }
];

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    courses, 
    students, 
    getCompletedLessonsCount,
    getStudentProgress,
    isCourseLockedForUser,
    isLoading
  } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [favoritePrompts, setFavoritePrompts] = useState<any[]>([]);
  const [randomPrompt, setRandomPrompt] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return;
      const { data: favorites } = await supabase
        .from('favorites')
        .select('prompt_id, prompts(*)')
        .eq('user_id', user.id);

      const prompts = favorites.map((fav: any) => fav.prompts);
      setFavoritePrompts(prompts);

      if (prompts.length > 0) {
        const randomIndex = Math.floor(Math.random() * prompts.length);
        setRandomPrompt(prompts[randomIndex]);
      }
    }

    fetchFavorites();
  }, [user]);

  const copyPrompt = async (prompt: any) => {
    const promptText = `${prompt.title}\n\nContext: ${prompt.context}\n\nRole: ${prompt.role}\n\nTask: ${prompt.task}${prompt.boundaries ? `\n\nBoundaries: ${prompt.boundaries}` : ''}${prompt.reasoning ? `\n\nReasoning: ${prompt.reasoning}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  if (isLoading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen py-12">
          <GlassCard variant="subtle" className="p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  const currentStudent = students.find(s => s.id === user.id);
  if (!currentStudent) {
    return null;
  }

  const assignedCourses = courses.filter(course => currentStudent.assignedCourses.includes(course.id));
  const completedCourses = assignedCourses.filter(course => {
    const progress = getStudentProgress(user.id, course.id);
    return progress.every(p => p.completed);
  });
  const inProgressCourses = assignedCourses.filter(course => {
    const progress = getStudentProgress(user.id, course.id);
    return progress.some(p => p.completed) && !progress.every(p => p.completed);
  });
  const enrolledCount = assignedCourses.length;
  const inProgressCount = inProgressCourses.length;
  const completedCount = completedCourses.length;

  // Calculate course progress based on lessons
  const totalLessons = assignedCourses.reduce((acc, course) => acc + course.lessons.length, 0);
  const totalCompletedLessons = assignedCourses.reduce((acc, course) => {
    const progress = getStudentProgress(user.id, course.id);
    return acc + progress.filter(p => p.completed).length;
  }, 0);
  const courseProgress = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

  // Tab filtering
  let tabCourses: Course[] = assignedCourses;
  if (activeTab === 'inprogress') tabCourses = inProgressCourses;
  if (activeTab === 'completed') tabCourses = completedCourses;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-600">Track your progress and continue learning</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="text-center">
            <div className="text-lg font-semibold text-gray-700 mb-1">Enrolled Services</div>
            <div className="text-3xl font-bold text-gray-900">{enrolledCount}</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-lg font-semibold text-gray-700 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-gray-900">{inProgressCount}</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-lg font-semibold text-gray-700 mb-1">Completed</div>
            <div className="text-3xl font-bold text-gray-900">{completedCount}</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-lg font-semibold text-gray-700 mb-1">Course Progress</div>
            <div className="text-3xl font-bold text-gray-900">{courseProgress}%</div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.key ? 'bg-gray-200 text-gray-900' : 'bg-white/30 text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Continue Learning / Courses List */}
          <div className="md:col-span-2">
            <GlassCard className="h-full flex flex-col">
              {activeTab === 'overview' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Continue Learning</h2>
                  <p className="text-gray-600 mb-6">Pick up where you left off</p>
                  {inProgressCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                      <div className="text-gray-500 mb-2">No courses in progress</div>
                      <Button asChild variant="outline">
                        <Link to="/courses">
                          <Plus className="mr-2 h-4 w-4" /> Start a New Course
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {inProgressCourses.map(course => (
                        <GlassCard key={course.id} className="flex flex-col md:flex-row items-center justify-between p-4 shadow-lg">
                          <div>
                            <div className="font-semibold text-lg text-gray-900">{course.title}</div>
                            <div className="text-gray-600 text-sm">{course.description}</div>
                          </div>
                          <Button asChild className="mt-4 md:mt-0" variant="success">
                            <Link to={`/courses/${course.id}`}>Continue</Link>
                          </Button>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </>
              )}
              {activeTab === 'inprogress' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">In Progress Courses</h2>
                  <p className="text-gray-600 mb-6">Courses you are currently working on</p>
                  {inProgressCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                      <div className="text-gray-500 mb-2">No courses in progress</div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {inProgressCourses.map(course => (
                        <GlassCard key={course.id} className="flex flex-col md:flex-row items-center justify-between p-4 shadow-lg">
                          <div>
                            <div className="font-semibold text-lg text-gray-900">{course.title}</div>
                            <div className="text-gray-600 text-sm">{course.description}</div>
                          </div>
                          <Button asChild className="mt-4 md:mt-0" variant="success">
                            <Link to={`/courses/${course.id}`}>Continue</Link>
                          </Button>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Completed Courses</h2>
                  <p className="text-gray-600 mb-6">Courses you have finished</p>
                  {completedCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                      <div className="text-gray-500 mb-2">No completed courses</div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {completedCourses.map(course => (
                        <GlassCard key={course.id} className="flex flex-col md:flex-row items-center justify-between p-4 shadow-lg">
                          <div>
                            <div className="font-semibold text-lg text-gray-900">{course.title}</div>
                            <div className="text-gray-600 text-sm">{course.description}</div>
                          </div>
                          <Button asChild className="mt-4 md:mt-0" variant="outline">
                            <Link to={`/courses/${course.id}`}>View</Link>
                          </Button>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </>
              )}
            </GlassCard>
          </div>

          {/* Random Favorite Prompt */}
          {randomPrompt && (
            <div>
              <GlassCard className="h-full">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Your Favorite Prompt</h2>
                <p className="text-gray-600 mb-4">A prompt you've favorited</p>
                <GlassCard variant="subtle" className="p-4">
                  <div className="font-semibold text-gray-900 mb-1">{randomPrompt.title}</div>
                  <div className="text-gray-600 text-sm mb-2">{randomPrompt.context}</div>
                  <Button 
                    variant="success" 
                    className="w-full"
                    onClick={() => copyPrompt(randomPrompt)}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      'Use Prompt'
                    )}
                  </Button>
                </GlassCard>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
