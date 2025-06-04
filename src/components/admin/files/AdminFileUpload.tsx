import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Student } from '@/contexts/types/DataTypes'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

// Placeholder for Admin File Upload UI
export function AdminFileUpload() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('role', 'student')
        .order('name', { ascending: true })
      if (!error && data) setStudents(data as Student[])
      setIsLoading(false)
    }
    fetchStudents()
  }, [])

  return (
    <div className="p-4 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload File for Student</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Student</label>
        <select
          className="w-full border rounded p-2"
          value={selectedStudent}
          onChange={e => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Select --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select File</label>
        <input
          type="file"
          className="w-full"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <Button disabled={!selectedStudent || !file || isLoading}>
        Upload
      </Button>
    </div>
  )
}

export default AdminFileUpload 