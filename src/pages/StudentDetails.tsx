import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudents } from '@/contexts/StudentContext'
import { useCourses } from '@/contexts/CourseContext'
import { useServices } from '@/contexts/ServiceContext'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { CheckCircle, ArrowLeft, Edit, Plus, X, Lock, Unlock, Loader2 } from 'lucide-react'
import AdminFileList from '@/components/admin/files/AdminFileList'
import { supabase } from '@/integrations/supabase/client'
import { getLessonLocks, toggleLessonLock, updateStudent } from '@/contexts/services/studentService'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/contexts/DataContext'

function StudentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { students, refreshStudents } = useStudents()
  const { courses } = useCourses()
  const { services } = useServices()
  const { assignCourse } = useData()
  const student = students.find(s => s.id === id)

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedEmail, setEditedEmail] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Service assignments state
  const [assignedServiceIds, setAssignedServiceIds] = useState<string[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  // Course progress state
  const [progress, setProgress] = useState<any[]>([])
  const [loadingProgress, setLoadingProgress] = useState(false)

  // Lesson lock state per course
  const [lessonLocks, setLessonLocks] = useState<Record<string, Record<string, boolean>>>({})
  const [loadingLessonLock, setLoadingLessonLock] = useState<string | null>(null)

  // assignedCourses is declared here
  const assignedCourses = courses.filter(course => student.assignedCourses.includes(course.id))

  // Inside your component, after currentStudent and assignedCourses are defined:
  const [selectedCourseId, setSelectedCourseId] = useState('')

  // List of courses not yet assigned to the student
  const unassignedCourses = courses.filter(course => !student.assignedCourses.includes(course.id))

  // Initialize edit form when dialog opens
  useEffect(() => {
    if (isEditDialogOpen && student) {
      setEditedName(student.name)
      setEditedEmail(student.email)
    }
  }, [isEditDialogOpen, student])

  useEffect(() => {
    if (!student) return
    setLoadingServices(true)
    supabase
      .from('user_services')
      .select('service_id, status')
      .eq('user_id', student.id)
      .then(({ data, error }) => {
        if (!error && data) {
          setAssignedServiceIds(data.filter(s => s.status === 'active').map(s => String(s.service_id)))
        }
        setLoadingServices(false)
      })
  }, [student])

  useEffect(() => {
    if (!student) return
    setLoadingProgress(true)
    supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', student.id)
      .then(({ data, error }) => {
        if (!error && data) setProgress(data)
        setLoadingProgress(false)
      })
  }, [student])

  // Fetch lesson locks for each assigned course
  useEffect(() => {
    async function fetchAllLessonLocks() {
      if (!student) return
      const locks: Record<string, Record<string, boolean>> = {}
      for (const course of assignedCourses) {
        const courseLocks = await getLessonLocks(student.id, course.id)
        locks[course.id] = courseLocks
      }
      setLessonLocks(locks)
    }
    fetchAllLessonLocks()
  }, [student, assignedCourses])

  if (!student) return <div className="p-8">Student not found.</div>

  // Service assignment handlers
  async function handleAssignService(serviceId: string) {
    setLoadingServices(true)
    await supabase
      .from('user_services')
      .upsert([{ user_id: student.id, service_id: serviceId, status: 'active' }], { onConflict: 'user_id,service_id' })
    // Refresh
    const { data } = await supabase
      .from('user_services')
      .select('service_id, status')
      .eq('user_id', student.id)
    setAssignedServiceIds(data.filter(s => s.status === 'active').map(s => String(s.service_id)))
    setLoadingServices(false)
  }
  async function handleUnassignService(serviceId: string) {
    setLoadingServices(true)
    await supabase
      .from('user_services')
      .update({ status: 'inactive' })
      .eq('user_id', student.id)
      .eq('service_id', serviceId)
    // Refresh
    const { data } = await supabase
      .from('user_services')
      .select('service_id, status')
      .eq('user_id', student.id)
    setAssignedServiceIds(data.filter(s => s.status === 'active').map(s => String(s.service_id)))
    setLoadingServices(false)
  }

  // Assigned and available services
  const assignedServices = services.filter(s => assignedServiceIds.includes(s.id))
  const availableServices = services.filter(s => !assignedServiceIds.includes(s.id))

  function getCourseProgress(courseId: string) {
    const lessons = courses.find(c => c.id === courseId)?.lessons || []
    const completed = progress.filter(p => p.course_id === courseId && p.completed).length
    return { completed, total: lessons.length }
  }

  async function handleToggleLessonLock(courseId: string, lessonId: string) {
    if (!student) return
    setLoadingLessonLock(lessonId)
    try {
      const newLockStatus = await toggleLessonLock(student.id, courseId, lessonId)
      // Update local state immediately for better UX
      setLessonLocks(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          [lessonId]: newLockStatus
        }
      }))
    } catch (error) {
      console.error('Error toggling lesson lock:', error)
    } finally {
      setLoadingLessonLock(null)
    }
  }

  async function handleUpdateStudent() {
    if (!student) return
    setIsUpdating(true)
    try {
      await updateStudent(student.id, {
        name: editedName,
        email: editedEmail
      })
      await refreshStudents() // Refresh the students list to get updated data
      setIsEditDialogOpen(false)
      toast({
        title: 'Success',
        description: 'Student details updated successfully.'
      })
    } catch (error) {
      console.error('Error updating student:', error)
      toast({
        title: 'Error',
        description: 'Failed to update student details.',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/student-services')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">{student.name}</h1>
      </div>
      <div className="text-gray-500 mb-6 ml-12">Student Details & Management</div>
      <GlassCard className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 mb-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-20 h-20 rounded-xl bg-green-500 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
            {student.profile_image
              ? <img src={student.profile_image} alt={student.name} className="w-full h-full object-cover rounded-xl" />
              : student.name.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <div className="font-extrabold text-xl mb-1">{student.name}</div>
            <div className="flex items-center text-gray-600 text-sm gap-2 mb-1">
              <span>{student.email}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Active</span>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="w-4 h-4" /> Edit Student
          </Button>
        </div>
      </GlassCard>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter student name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                placeholder="Enter student email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStudent} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Service Assignments */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-lg">Service Assignments</div>
          </div>
          <div className="mb-2 text-sm text-gray-500">{assignedServices.length} of {services.length} services assigned</div>
          <div className="mb-4">
            <div className="font-semibold mb-2">Assigned Services</div>
            {assignedServices.length === 0 && <div className="text-gray-400 text-sm">No services assigned.</div>}
            {assignedServices.map(service => (
              <div key={service.id} className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2 mb-2">
                <span className="font-medium">{service.title}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-green-700 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" /> Active
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleUnassignService(service.id)} disabled={loadingServices}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="font-semibold mb-2">Available Services</div>
          {availableServices.length === 0 && <div className="text-gray-400 text-sm">No available services.</div>}
          {availableServices.map(service => (
            <div key={service.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 mb-2">
              <span>{service.title}</span>
              <Button size="sm" variant="outline" onClick={() => handleAssignService(service.id)} disabled={loadingServices}>Assign</Button>
            </div>
          ))}
        </GlassCard>
        {/* Course Assignment */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-lg">Course Assignment</div>
          </div>
          <div className="mb-4">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {unassignedCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="mt-4"
              onClick={async () => {
                if (selectedCourseId) {
                  await assignCourse(student.id, selectedCourseId)
                  setSelectedCourseId('')
                }
              }}
              disabled={!selectedCourseId}
            >
              Assign Course
            </Button>
          </div>
          {assignedCourses.map(course => {
            const { completed, total } = getCourseProgress(course.id)
            return (
              <div key={course.id} className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="font-semibold mb-1">{course.title}</div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">{total} lessons • {completed} completed</span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{completed === total ? 'Completed' : 'In Progress'}</span>
                </div>
                <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
                </div>
                {/* Lesson Access Control */}
                <div className="font-semibold mt-4 mb-2">Lesson Access Control</div>
                <div className="space-y-2">
                  {course.lessons.map(lesson => {
                    const lessonProgress = progress.find(p => p.course_id === course.id && p.lesson_id === lesson.id)
                    const isLocked = !!lessonLocks[course.id]?.[lesson.id]
                    const isLoading = loadingLessonLock === lesson.id
                    return (
                      <div key={lesson.id} className={`flex items-center justify-between rounded-lg px-4 py-2 border ${lessonProgress?.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!lessonProgress?.completed}
                            readOnly
                            className="form-checkbox h-5 w-5 text-green-600"
                          />
                          <span className={lessonProgress?.completed ? 'font-semibold text-green-700' : ''}>
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lessonProgress?.completed && (
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                          <button
                            className={`ml-2 p-1.5 rounded-full transition-colors ${
                              isLoading 
                                ? 'bg-gray-100 cursor-wait' 
                                : isLocked 
                                  ? 'bg-red-50 hover:bg-red-100' 
                                  : 'bg-green-50 hover:bg-green-100'
                            }`}
                            onClick={() => handleToggleLessonLock(course.id, lesson.id)}
                            disabled={isLoading}
                            title={isLocked ? 'Unlock Lesson' : 'Lock Lesson'}
                          >
                            {isLoading ? (
                              <svg className="w-4 h-4 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : isLocked ? (
                              <svg className="w-4 h-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </GlassCard>
      </div>
      {/* Files Shared */}
      <GlassCard className="p-6 mb-8">
        <div className="font-bold text-lg mb-4">Files Shared with {student.name}</div>
        <AdminFileList studentId={student.id} />
      </GlassCard>
    </div>
  )
}

export default StudentDetails 