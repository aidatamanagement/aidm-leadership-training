import React, { useState } from 'react'

interface CoachVoxChatProps {
  className?: string
}

export function CoachVoxChat({ className }: CoachVoxChatProps) {
  const [isFullPage, setIsFullPage] = useState(false)

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data === 'openChat') {
          document.getElementById('smallChatCoachvox')?.setAttribute('style', 'height:550px;width:300px;')
        }
        if (data === 'closeChat') {
          document.getElementById('smallChatCoachvox')?.setAttribute('style', 'height:130px;width:130px;')
        }
      } catch (e) {
        console.log(JSON.stringify(e))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (isFullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="h-full w-full">
          <iframe 
            src="https://app.coachvox.ai/avatar/qwxnsubYKJUqDp9cK7hS/embed" 
            allow="microphone;" 
            style={{ height: '100%', width: '100%' }}
            className="border-0"
          />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`fixed z-[234567890] bottom-4 right-4 min-w-[130px] min-h-[130px] overflow-hidden ${className}`}
      style={{ position: 'fixed', zIndex: 234567890, bottom: '10px', right: '10px', minWidth: '130px', minHeight: '130px', overflow: 'hidden' }}
    >
      <iframe 
        src="https://app.coachvox.ai/avatar/qwxnsubYKJUqDp9cK7hS/embed/small" 
        allowFullScreen 
        allow="microphone;"
        frameBorder="0" 
        id="smallChatCoachvox" 
        style={{ position: 'absolute', height: '130px', bottom: '0px', width: '130px' }}
      />
    </div>
  )
} 