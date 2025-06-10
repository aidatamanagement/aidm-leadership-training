import React, { useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface TourStep extends Step {
  target: string
  content: React.ReactNode
  disableBeacon?: boolean
}

const commonSteps: TourStep[] = [
  {
    target: 'body',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Welcome to AIDM Leadership Training!</h3>
        <p>Let's take a quick tour of the platform to help you get started.</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true
  },
  {
    target: '.nav-dashboard',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Dashboard</h3>
        <p>Your central hub for tracking progress and accessing courses.</p>
      </div>
    ),
    placement: 'bottom'
  },
  {
    target: '.nav-profile',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Profile</h3>
        <p>Update your personal information and preferences here.</p>
      </div>
    ),
    placement: 'bottom'
  }
]

const dashboardSteps: TourStep[] = [
  {
    target: '.enrolled-services-card',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Enrolled Services</h3>
        <p>View all the services you're enrolled in and track your progress.</p>
      </div>
    ),
    placement: 'bottom'
  },
  {
    target: '.in-progress-card',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">In Progress</h3>
        <p>See which courses you're currently working on.</p>
      </div>
    ),
    placement: 'bottom'
  },
  {
    target: '.files-shared-card',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Files Shared</h3>
        <p>Access documents and resources shared by your instructors.</p>
      </div>
    ),
    placement: 'bottom'
  }
]

const courseSteps: TourStep[] = [
  {
    target: '.course-header',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Course Overview</h3>
        <p>View course details, progress, and available lessons.</p>
      </div>
    ),
    placement: 'bottom'
  },
  {
    target: '.lesson-list',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Lessons</h3>
        <p>Access all course lessons. Complete them in order to progress.</p>
      </div>
    ),
    placement: 'right'
  }
]

const lessonSteps: TourStep[] = [
  {
    target: '.lesson-content',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Lesson Content</h3>
        <p>Read through the lesson materials and complete any required tasks.</p>
      </div>
    ),
    placement: 'bottom'
  },
  {
    target: '.lesson-navigation',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Navigation</h3>
        <p>Use these buttons to move between lessons.</p>
      </div>
    ),
    placement: 'top'
  }
]

const filesSteps: TourStep[] = [
  {
    target: '.files-grid',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Shared Files</h3>
        <p>Browse through files shared with you by your instructors.</p>
      </div>
    ),
    placement: 'bottom'
  },
  {
    target: '.file-actions',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">File Actions</h3>
        <p>View, download, or preview files using these buttons.</p>
      </div>
    ),
    placement: 'left'
  }
]

export function GuidedTour() {
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState<TourStep[]>([])
  const location = useLocation()

  useEffect(() => {
    // Combine common steps with page-specific steps
    let pageSteps: TourStep[] = []
    
    if (location.pathname === '/dashboard') {
      pageSteps = dashboardSteps
    } else if (location.pathname.startsWith('/courses/') && !location.pathname.includes('/lessons/')) {
      pageSteps = courseSteps
    } else if (location.pathname.includes('/lessons/')) {
      pageSteps = lessonSteps
    } else if (location.pathname === '/student/files') {
      pageSteps = filesSteps
    }

    setSteps([...commonSteps, ...pageSteps])
  }, [location.pathname])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setRun(true)}
        className="fixed bottom-20 left-4 z-50 rounded-full shadow-lg"
        size="icon"
        variant="secondary"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#22c55e',
          },
          tooltip: {
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          buttonNext: {
            backgroundColor: '#22c55e',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
          },
          buttonBack: {
            marginRight: '0.5rem',
            color: '#4b5563',
          },
          buttonSkip: {
            color: '#6b7280',
          },
        }}
      />
    </>
  )
} 